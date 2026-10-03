import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceRates, units } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { z } from "zod";
import { formatINR } from "@/lib/formatters";

const calculateRequestSchema = z.object({
  items: z
    .array(
      z.object({
        rateId: z.number().int().positive("Invalid rate ID"),
        quantity: z.number().min(0, "Quantity must be greater than or equal to 0"),
      })
    )
    .min(1, "At least one item must be submitted for calculation"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = calculateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { items } = validation.data;
    const rateIds = items.map((i) => i.rateId);

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
    const calculatedLineItems = [];

    for (const item of items) {
      const activeRate = rateMap.get(item.rateId);
      if (!activeRate) {
        // Skip inactive or non-existent items
        continue;
      }

      const numericRate = parseFloat(activeRate.baseRate);
      let lineTotal = 0;

      switch (activeRate.rateType) {
        case "fixed":
          // Fixed charge fee (quantity acts as multiplier if > 0, defaults to 1x flat rate)
          lineTotal = item.quantity > 0 ? numericRate * item.quantity : numericRate;
          break;
        case "per_sqft":
        case "per_view":
        case "per_visit":
        default:
          lineTotal = item.quantity * numericRate;
          break;
      }

      calculatedTotal += lineTotal;

      calculatedLineItems.push({
        rateId: activeRate.id,
        serviceName: activeRate.serviceName,
        rateType: activeRate.rateType,
        unitName: activeRate.unitName || "",
        unitSymbol: activeRate.unitSymbol || "",
        baseRate: numericRate,
        quantity: item.quantity,
        lineTotal,
        formattedLineTotal: formatINR(lineTotal),
      });
    }

    return NextResponse.json({
      success: true,
      lineItems: calculatedLineItems,
      total: calculatedTotal,
      formattedTotal: formatINR(calculatedTotal),
      disclaimer:
        "Estimated Quotation — Final scope and commercial terms are subject to physical site inspection and executed engineering agreement by MAYA Design & Build.",
    });
  } catch (error) {
    console.error("Quotation calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to process quotation calculation",
      },
      { status: 500 }
    );
  }
}
