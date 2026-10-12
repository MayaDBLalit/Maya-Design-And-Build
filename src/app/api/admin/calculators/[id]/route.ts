import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { calculators, calculatorSubservices, serviceRates, services } from "@/db/schema";
import { calculatorSchema } from "@/lib/validations";
import { eq, and, ne } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const calcId = parseInt(id, 10);
  if (isNaN(calcId)) {
    return NextResponse.json({ error: "Invalid Calculator ID" }, { status: 400 });
  }

  try {
    const [calc] = await db
      .select()
      .from(calculators)
      .where(eq(calculators.id, calcId))
      .limit(1);

    if (!calc) {
      return NextResponse.json({ error: "Calculator not found" }, { status: 404 });
    }

    const junctionRows = await db
      .select({
        subServiceId: calculatorSubservices.subServiceId,
        subServiceName: serviceRates.serviceName,
        mainServiceTitle: services.title,
      })
      .from(calculatorSubservices)
      .leftJoin(serviceRates, eq(calculatorSubservices.subServiceId, serviceRates.id))
      .leftJoin(services, eq(serviceRates.mainServiceId, services.id))
      .where(eq(calculatorSubservices.calculatorId, calcId));

    return NextResponse.json({
      success: true,
      calculator: {
        ...calc,
        subServiceIds: junctionRows.map((j) => j.subServiceId),
        subServices: junctionRows.map((j) => ({
          id: j.subServiceId,
          name: j.subServiceName,
          mainService: j.mainServiceTitle,
        })),
      },
    });
  } catch (error) {
    console.error("Admin calculator GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch calculator" },
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
  const calcId = parseInt(id, 10);
  if (isNaN(calcId)) {
    return NextResponse.json({ error: "Invalid Calculator ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = calculatorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [existing] = await db
      .select()
      .from(calculators)
      .where(eq(calculators.id, calcId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Calculator not found" }, { status: 404 });
    }

    // Check slug uniqueness across other calculators
    const [slugDuplicate] = await db
      .select({ id: calculators.id })
      .from(calculators)
      .where(and(eq(calculators.slug, data.slug), ne(calculators.id, calcId)))
      .limit(1);

    if (slugDuplicate) {
      return NextResponse.json(
        { error: "A calculator with this slug already exists" },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .update(calculators)
        .set({
          title: data.title,
          slug: data.slug,
          displayOrder: data.displayOrder,
          isActive: data.isActive,
        })
        .where(eq(calculators.id, calcId));

      // Synchronize junction
      await tx
        .delete(calculatorSubservices)
        .where(eq(calculatorSubservices.calculatorId, calcId));

      if (data.subServiceIds && data.subServiceIds.length > 0) {
        await tx.insert(calculatorSubservices).values(
          data.subServiceIds.map((subId) => ({
            calculatorId: calcId,
            subServiceId: subId,
          }))
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: "Calculator updated successfully",
    });
  } catch (error) {
    console.error("Admin calculator update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update calculator" },
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
  const calcId = parseInt(id, 10);
  if (isNaN(calcId)) {
    return NextResponse.json({ error: "Invalid Calculator ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(calculators)
      .where(eq(calculators.id, calcId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Calculator not found" }, { status: 404 });
    }

    await db.delete(calculators).where(eq(calculators.id, calcId));

    return NextResponse.json({
      success: true,
      message: `Calculator "${existing.title}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin calculator delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete calculator" },
      { status: 500 }
    );
  }
}
