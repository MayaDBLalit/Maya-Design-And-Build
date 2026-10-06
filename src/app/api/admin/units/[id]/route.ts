import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { units, serviceRates } from "@/db/schema";
import { unitSchema } from "@/lib/validations";
import { eq, and, ne, count } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const unitId = parseInt(id, 10);
  if (isNaN(unitId)) {
    return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
  }

  try {
    const [unit] = await db
      .select({
        id: units.id,
        unitName: units.unitName,
        unitSymbol: units.unitSymbol,
        description: units.description,
        createdAt: units.createdAt,
        usageCount: count(serviceRates.id),
      })
      .from(units)
      .leftJoin(serviceRates, eq(units.id, serviceRates.unitId))
      .where(eq(units.id, unitId))
      .groupBy(units.id)
      .limit(1);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    console.error("Admin unit GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch unit" },
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
  const unitId = parseInt(id, 10);
  if (isNaN(unitId)) {
    return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = unitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [existing] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Name uniqueness check
    const [nameClash] = await db
      .select({ id: units.id })
      .from(units)
      .where(and(eq(units.unitName, data.unitName), ne(units.id, unitId)))
      .limit(1);

    if (nameClash) {
      return NextResponse.json(
        { error: `Unit with name '${data.unitName}' already exists` },
        { status: 409 }
      );
    }

    await db
      .update(units)
      .set({
        unitName: data.unitName,
        unitSymbol: data.unitSymbol,
        description: data.description || null,
      })
      .where(eq(units.id, unitId));

    const [updated] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Unit updated successfully",
      unit: updated,
    });
  } catch (error) {
    console.error("Admin unit update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update unit" },
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
  const unitId = parseInt(id, 10);
  if (isNaN(unitId)) {
    return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Critical constraint check: check if any service_rates refer to this unit
    const [usageResult] = await db
      .select({ count: count() })
      .from(serviceRates)
      .where(eq(serviceRates.unitId, unitId));

    const usageCount = Number(usageResult?.count || 0);

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: "Unit In Use",
          message: `Cannot delete unit "${existing.unitName}" (${existing.unitSymbol}) because it is currently assigned to ${usageCount} quotation rate item(s). Reassign or delete those rate items first.`,
        },
        { status: 400 }
      );
    }

    await db.delete(units).where(eq(units.id, unitId));

    return NextResponse.json({
      success: true,
      message: `Measurement unit "${existing.unitName}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin unit delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
