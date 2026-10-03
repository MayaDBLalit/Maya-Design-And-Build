import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { serviceRates, units } from "@/db/schema";
import { serviceRateSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const rateId = parseInt(id, 10);
  if (isNaN(rateId)) {
    return NextResponse.json({ error: "Invalid quotation rate ID" }, { status: 400 });
  }

  try {
    const [rate] = await db
      .select({
        id: serviceRates.id,
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
      .where(eq(serviceRates.id, rateId))
      .limit(1);

    if (!rate) {
      return NextResponse.json({ error: "Quotation rate not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rate });
  } catch (error) {
    console.error("Admin quotation rate GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch quotation rate" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const rateId = parseInt(id, 10);
  if (isNaN(rateId)) {
    return NextResponse.json({ error: "Invalid quotation rate ID" }, { status: 400 });
  }

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

    const [existing] = await db
      .select()
      .from(serviceRates)
      .where(eq(serviceRates.id, rateId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Quotation rate not found" }, { status: 404 });
    }

    // Verify unit exists
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

    await db
      .update(serviceRates)
      .set({
        serviceName: data.serviceName,
        unitId: data.unitId,
        baseRate: baseRateStr,
        rateType: data.rateType,
        defaultQty: defaultQtyStr,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      })
      .where(eq(serviceRates.id, rateId));

    const [updated] = await db
      .select({
        id: serviceRates.id,
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
      .where(eq(serviceRates.id, rateId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Quotation rate updated successfully",
      rate: updated,
    });
  } catch (error) {
    console.error("Admin quotation rate update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update quotation rate" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const rateId = parseInt(id, 10);
  if (isNaN(rateId)) {
    return NextResponse.json({ error: "Invalid quotation rate ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(serviceRates)
      .where(eq(serviceRates.id, rateId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Quotation rate not found" }, { status: 404 });
    }

    await db.delete(serviceRates).where(eq(serviceRates.id, rateId));

    return NextResponse.json({
      success: true,
      message: `Quotation rate "${existing.serviceName}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin quotation rate delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete quotation rate" },
      { status: 500 }
    );
  }
}
