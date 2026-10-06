import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceRates, units } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: serviceRates.id,
        serviceName: serviceRates.serviceName,
        unitId: serviceRates.unitId,
        unitName: units.unitName,
        unitSymbol: units.unitSymbol,
        baseRate: serviceRates.baseRate,
        rateType: serviceRates.rateType,
        defaultQty: serviceRates.defaultQty,
        displayOrder: serviceRates.displayOrder,
      })
      .from(serviceRates)
      .innerJoin(units, eq(serviceRates.unitId, units.id))
      .where(eq(serviceRates.isActive, true))
      .orderBy(asc(serviceRates.displayOrder));

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    console.error("Public Quotation Rates API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotation rate catalog" },
      { status: 500 }
    );
  }
}
