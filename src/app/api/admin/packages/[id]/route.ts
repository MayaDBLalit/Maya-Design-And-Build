import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { packages, packageSubservices, services, serviceRates, units, workflows, workflowSteps } from "@/db/schema";
import { packageSchema } from "@/lib/validations";
import { and, eq, inArray, ne, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const pkgId = parseInt(id, 10);
  if (isNaN(pkgId)) {
    return NextResponse.json({ error: "Invalid Package ID" }, { status: 400 });
  }

  try {
    const [pkg] = await db
      .select({
        id: packages.id,
        packageName: packages.packageName,
        mainServiceId: packages.mainServiceId,
        mainServiceTitle: services.title,
        packageRatePerSqFt: packages.packageRatePerSqFt,
        displayOrder: packages.displayOrder,
        isActive: packages.isActive,
        showRatePublicly: packages.showRatePublicly,
        isRecommended: packages.isRecommended,
        createdAt: packages.createdAt,
        updatedAt: packages.updatedAt,
      })
      .from(packages)
      .leftJoin(services, eq(packages.mainServiceId, services.id))
      .where(eq(packages.id, pkgId))
      .limit(1);

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const junctionRows = await db
      .select({
        subServiceId: packageSubservices.subServiceId,
        subServiceName: serviceRates.serviceName,
        baseRate: serviceRates.baseRate,
        rateType: serviceRates.rateType,
        defaultQty: serviceRates.defaultQty,
        unitName: units.unitName,
        unitSymbol: units.unitSymbol,
      })
      .from(packageSubservices)
      .leftJoin(serviceRates, eq(packageSubservices.subServiceId, serviceRates.id))
      .leftJoin(units, eq(serviceRates.unitId, units.id))
      .where(eq(packageSubservices.packageId, pkgId));

    const subIds = junctionRows.map((j) => j.subServiceId).filter(Boolean);
    const workflowsMap: Record<number, any> = {};

    if (subIds.length > 0) {
      const wfs = await db
        .select()
        .from(workflows)
        .where(inArray(workflows.subServiceId, subIds));

      const wfIds = wfs.map((w) => w.id);
      let steps: Array<any> = [];

      if (wfIds.length > 0) {
        steps = await db
          .select()
          .from(workflowSteps)
          .where(inArray(workflowSteps.workflowId, wfIds))
          .orderBy(asc(workflowSteps.displayOrder), asc(workflowSteps.stepNumber));
      }

      wfs.forEach((w) => {
        workflowsMap[w.subServiceId] = {
          ...w,
          steps: steps.filter((s) => s.workflowId === w.id),
        };
      });
    }

    return NextResponse.json({
      success: true,
      package: {
        ...pkg,
        subServiceIds: junctionRows.map((j) => j.subServiceId),
        subServices: junctionRows.map((j) => ({
          id: j.subServiceId,
          name: j.subServiceName,
          baseRate: j.baseRate,
          rateType: j.rateType,
          defaultQty: j.defaultQty,
          unitName: j.unitName,
          unitSymbol: j.unitSymbol,
          workflow: workflowsMap[j.subServiceId] || null,
        })),
      },
    });
  } catch (error) {
    console.error("Admin package GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch package" },
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
  const pkgId = parseInt(id, 10);
  if (isNaN(pkgId)) {
    return NextResponse.json({ error: "Invalid Package ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = packageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [existing] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, pkgId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Verify Main Service exists
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

    const rateStr = String(data.packageRatePerSqFt);

    await db.transaction(async (tx) => {
      // If isRecommended is true, unset any other recommended package for this Main Service
      if (data.isRecommended) {
        await tx
          .update(packages)
          .set({ isRecommended: false })
          .where(
            and(
              eq(packages.mainServiceId, data.mainServiceId),
              ne(packages.id, pkgId)
            )
          );
      }

      await tx
        .update(packages)
        .set({
          packageName: data.packageName,
          mainServiceId: data.mainServiceId,
          packageRatePerSqFt: rateStr,
          displayOrder: data.displayOrder,
          isActive: data.isActive,
          showRatePublicly: data.showRatePublicly,
          isRecommended: data.isRecommended ?? false,
        })
        .where(eq(packages.id, pkgId));

      // Synchronize package_subservices junction
      await tx
        .delete(packageSubservices)
        .where(eq(packageSubservices.packageId, pkgId));

      if (data.subServiceIds && data.subServiceIds.length > 0) {
        await tx.insert(packageSubservices).values(
          data.subServiceIds.map((subId) => ({
            packageId: pkgId,
            subServiceId: subId,
          }))
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: "Package updated successfully",
    });
  } catch (error) {
    console.error("Admin package update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update package" },
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
  const pkgId = parseInt(id, 10);
  if (isNaN(pkgId)) {
    return NextResponse.json({ error: "Invalid Package ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(packages)
      .where(eq(packages.id, pkgId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    await db.delete(packages).where(eq(packages.id, pkgId));

    return NextResponse.json({
      success: true,
      message: `Package "${existing.packageName}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin package delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete package" },
      { status: 500 }
    );
  }
}
