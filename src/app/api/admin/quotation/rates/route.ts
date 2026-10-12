import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { serviceRates, units, services } from "@/db/schema";
import { serviceRateSchema } from "@/lib/validations";
import { asc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const rates = await db
      .select({
        id: serviceRates.id,
        mainServiceId: serviceRates.mainServiceId,
        mainServiceTitle: services.title,
        serviceName: serviceRates.serviceName,
        unitId: serviceRates.unitId,
        unitName: units.unitName,
        unitSymbol: units.unitSymbol,
        baseRate: serviceRates.baseRate,
        rateType: serviceRates.rateType,
        defaultQty: serviceRates.defaultQty,
        isActive: serviceRates.isActive,
        displayOrder: serviceRates.displayOrder,
        createdAt: serviceRates.createdAt,
        updatedAt: serviceRates.updatedAt,
      })
      .from(serviceRates)
      .leftJoin(units, eq(serviceRates.unitId, units.id))
      .leftJoin(services, eq(serviceRates.mainServiceId, services.id))
      .orderBy(asc(serviceRates.displayOrder), asc(serviceRates.id));

    return NextResponse.json({ success: true, rates });
  } catch (error) {
    console.error("Admin subservices list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch subservices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const validation = serviceRateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify selected main service exists
    const [mainService] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.id, data.mainServiceId))
      .limit(1);

    if (!mainService) {
      return NextResponse.json(
        { error: "Selected Main Service does not exist" },
        { status: 400 }
      );
    }

    // Verify selected unit exists
    const [unit] = await db
      .select({ id: units.id })
      .from(units)
      .where(eq(units.id, data.unitId))
      .limit(1);

    if (!unit) {
      return NextResponse.json(
        { error: "Selected measurement unit does not exist" },
        { status: 400 }
      );
    }

    const baseRateStr = String(data.baseRate);
    const defaultQtyStr = String(data.defaultQty);

    const [insertResult] = await db.insert(serviceRates).values({
      mainServiceId: data.mainServiceId,
      serviceName: data.serviceName,
      unitId: data.unitId,
      baseRate: baseRateStr,
      rateType: data.rateType,
      defaultQty: defaultQtyStr,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    });

    const [created] = await db
      .select({
        id: serviceRates.id,
        mainServiceId: serviceRates.mainServiceId,
        mainServiceTitle: services.title,
        serviceName: serviceRates.serviceName,
        unitId: serviceRates.unitId,
        unitName: units.unitName,
        unitSymbol: units.unitSymbol,
        baseRate: serviceRates.baseRate,
        rateType: serviceRates.rateType,
        defaultQty: serviceRates.defaultQty,
        isActive: serviceRates.isActive,
        displayOrder: serviceRates.displayOrder,
      })
      .from(serviceRates)
      .leftJoin(units, eq(serviceRates.unitId, units.id))
      .leftJoin(services, eq(serviceRates.mainServiceId, services.id))
      .where(eq(serviceRates.id, insertResult.insertId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        message: "SubService created successfully",
        rate: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin subservice create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create subservice" },
      { status: 500 }
    );
  }
}
