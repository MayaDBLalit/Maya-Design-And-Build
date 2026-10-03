import { db } from "@/db";
import { serviceRates, units } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { formatINR } from "@/lib/formatters";

export interface QuotationCalculationInputItem {
  rateId: number;
  quantity: number;
}

export interface AuthoritativeLineItem {
  rateId: number;
  serviceName: string;
  rateType: string;
  unitName: string;
  unitSymbol: string;
  baseRate: number;
  quantity: number;
  lineTotal: number;
  formattedLineTotal: string;
}

export interface AuthoritativeCalculationResult {
  lineItems: AuthoritativeLineItem[];
  total: number;
  formattedTotal: string;
}

/**
 * Calculates authoritative quotation figures from active database records.
 * Ignores any client-supplied rates or totals to guarantee data integrity.
 */
export async function calculateAuthoritativeQuotation(
  inputItems: QuotationCalculationInputItem[]
): Promise<AuthoritativeCalculationResult> {
  if (!inputItems || inputItems.length === 0) {
    return {
      lineItems: [],
      total: 0,
      formattedTotal: formatINR(0),
    };
  }

  const rateIds = inputItems.map((i) => i.rateId);

  // Retrieve authoritative active rates directly from MySQL
  const dbRates = await db
    .select({
      id: serviceRates.id,
      serviceName: serviceRates.serviceName,
      baseRate: serviceRates.baseRate,
      rateType: serviceRates.rateType,
      defaultQty: serviceRates.defaultQty,
      isActive: serviceRates.isActive,
      displayOrder: serviceRates.displayOrder,
      unitName: units.unitName,
      unitSymbol: units.unitSymbol,
    })
    .from(serviceRates)
    .leftJoin(units, eq(serviceRates.unitId, units.id))
    .where(and(inArray(serviceRates.id, rateIds), eq(serviceRates.isActive, true)));

  const rateMap = new Map(dbRates.map((r) => [r.id, r]));

  let calculatedTotal = 0;
  const calculatedLineItems: AuthoritativeLineItem[] = [];

  for (const item of inputItems) {
    const activeRate = rateMap.get(item.rateId);
    if (!activeRate) {
      // Inactive or invalid rates are safely omitted
      continue;
    }

    const numericRate = parseFloat(activeRate.baseRate);
    const validQty = Math.max(0, item.quantity);
    let lineTotal = 0;

    switch (activeRate.rateType) {
      case "fixed":
        lineTotal = validQty > 0 ? numericRate * validQty : numericRate;
        break;
      case "per_sqft":
      case "per_view":
      case "per_visit":
      default:
        lineTotal = validQty * numericRate;
        break;
    }

    calculatedTotal += lineTotal;

    calculatedLineItems.push({
      rateId: activeRate.id,
      serviceName: activeRate.serviceName,
      rateType: activeRate.rateType,
      unitName: activeRate.unitName || "unit",
      unitSymbol: activeRate.unitSymbol || "unit",
      baseRate: numericRate,
      quantity: validQty,
      lineTotal,
      formattedLineTotal: formatINR(lineTotal),
    });
  }

  return {
    lineItems: calculatedLineItems,
    total: calculatedTotal,
    formattedTotal: formatINR(calculatedTotal),
  };
}
