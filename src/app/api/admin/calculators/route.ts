import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { calculators, calculatorSubservices, serviceRates, services } from "@/db/schema";
import { calculatorSchema } from "@/lib/validations";
import { asc, eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const list = await db
      .select()
      .from(calculators)
      .orderBy(asc(calculators.displayOrder), asc(calculators.id));

    const calcIds = list.map((c) => c.id);
    let junctionRows: any[] = [];

    if (calcIds.length > 0) {
      junctionRows = await db
        .select({
          calculatorId: calculatorSubservices.calculatorId,
          subServiceId: calculatorSubservices.subServiceId,
          subServiceName: serviceRates.serviceName,
          mainServiceTitle: services.title,
        })
        .from(calculatorSubservices)
        .leftJoin(serviceRates, eq(calculatorSubservices.subServiceId, serviceRates.id))
        .leftJoin(services, eq(serviceRates.mainServiceId, services.id))
        .where(inArray(calculatorSubservices.calculatorId, calcIds));
    }

    const result = list.map((c) => {
      const related = junctionRows.filter((j) => j.calculatorId === c.id);
      return {
        ...c,
        subServices: related.map((r) => ({
          id: r.subServiceId,
          name: r.subServiceName,
          mainService: r.mainServiceTitle,
        })),
        subServicesCount: related.length,
      };
    });

    return NextResponse.json({ success: true, calculators: result });
  } catch (error) {
    console.error("Admin calculators GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch calculators" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

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

    // Check slug uniqueness
    const [existingSlug] = await db
      .select({ id: calculators.id })
      .from(calculators)
      .where(eq(calculators.slug, data.slug))
      .limit(1);

    if (existingSlug) {
      return NextResponse.json(
        { error: "A calculator with this slug already exists" },
        { status: 400 }
      );
    }

    const insertResult = await db.transaction(async (tx) => {
      const [newCalc] = await tx.insert(calculators).values({
        title: data.title,
        slug: data.slug,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      });

      const calcId = newCalc.insertId;

      if (data.subServiceIds && data.subServiceIds.length > 0) {
        await tx.insert(calculatorSubservices).values(
          data.subServiceIds.map((subId) => ({
            calculatorId: calcId,
            subServiceId: subId,
          }))
        );
      }

      return calcId;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Calculator created successfully",
        calculatorId: insertResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin calculator create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create calculator" },
      { status: 500 }
    );
  }
}
