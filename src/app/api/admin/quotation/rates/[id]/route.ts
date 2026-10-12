import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { serviceRates, units, services, workflows, workflowSteps, packages, packageSubservices, calculators, calculatorSubservices } from "@/db/schema";
import { serviceRateSchema } from "@/lib/validations";
import { eq, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const rateId = parseInt(id, 10);
  if (isNaN(rateId)) {
    return NextResponse.json({ error: "Invalid SubService ID" }, { status: 400 });
  }

  try {
    const [rate] = await db
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
      .where(eq(serviceRates.id, rateId))
      .limit(1);

    if (!rate) {
      return NextResponse.json({ error: "SubService not found" }, { status: 404 });
    }

    // 1. Fetch associated workflow and steps
    const [wf] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.subServiceId, rateId))
      .limit(1);

    let workflow = null;
    if (wf) {
      const steps = await db
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.workflowId, wf.id))
        .orderBy(asc(workflowSteps.displayOrder), asc(workflowSteps.stepNumber));

      workflow = {
        ...wf,
        steps,
      };
    }

    // 2. Fetch packages containing this sub-service
    const pkgs = await db
      .select({
        id: packages.id,
        packageName: packages.packageName,
        packageRatePerSqFt: packages.packageRatePerSqFt,
        isRecommended: packages.isRecommended,
        isActive: packages.isActive,
        showRatePublicly: packages.showRatePublicly,
      })
      .from(packageSubservices)
      .innerJoin(packages, eq(packageSubservices.packageId, packages.id))
      .where(eq(packageSubservices.subServiceId, rateId));

    // 3. Fetch calculators containing this sub-service
    const calcs = await db
      .select({
        id: calculators.id,
        title: calculators.title,
        slug: calculators.slug,
        isActive: calculators.isActive,
      })
      .from(calculatorSubservices)
      .innerJoin(calculators, eq(calculatorSubservices.calculatorId, calculators.id))
      .where(eq(calculatorSubservices.subServiceId, rateId));

    return NextResponse.json({
      success: true,
      rate,
      workflow,
      packages: pkgs,
      calculators: calcs,
    });
  } catch (error) {
    console.error("Admin subservice GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch subservice" },
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
    return NextResponse.json({ error: "Invalid SubService ID" }, { status: 400 });
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
      return NextResponse.json({ error: "SubService not found" }, { status: 404 });
    }

    // Verify main service exists
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
        mainServiceId: data.mainServiceId,
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
      .where(eq(serviceRates.id, rateId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "SubService updated successfully",
      rate: updated,
    });
  } catch (error) {
    console.error("Admin subservice update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update subservice" },
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
    return NextResponse.json({ error: "Invalid SubService ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(serviceRates)
      .where(eq(serviceRates.id, rateId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "SubService not found" }, { status: 404 });
    }

    await db.delete(serviceRates).where(eq(serviceRates.id, rateId));

    return NextResponse.json({
      success: true,
      message: `SubService "${existing.serviceName}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin subservice delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete subservice" },
      { status: 500 }
    );
  }
}
