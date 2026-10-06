import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { units, serviceRates } from "@/db/schema";
import { unitSchema } from "@/lib/validations";
import { asc, eq, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const allUnits = await db
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
      .groupBy(units.id)
      .orderBy(asc(units.id));

    return NextResponse.json({ success: true, units: allUnits });
  } catch (error) {
    console.error("Admin units list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

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
      .select({ id: units.id })
      .from(units)
      .where(eq(units.unitName, data.unitName))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: `Unit with name '${data.unitName}' already exists` },
        { status: 409 }
      );
    }

    const [insertResult] = await db.insert(units).values({
      unitName: data.unitName,
      unitSymbol: data.unitSymbol,
      description: data.description || null,
    });

    const [created] = await db
      .select()
      .from(units)
      .where(eq(units.id, insertResult.insertId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        message: "Measurement unit created successfully",
        unit: { ...created, usageCount: 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin unit create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create measurement unit" },
      { status: 500 }
    );
  }
}
