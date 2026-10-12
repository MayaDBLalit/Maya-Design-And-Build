import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { packages, packageSubservices, services, serviceRates, units, workflows, workflowSteps } from "@/db/schema";
import { serviceUpdateSchema } from "@/lib/validations";
import { eq, and, ne, asc, inArray } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const serviceId = parseInt(id, 10);
  if (isNaN(serviceId)) {
    return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
  }

  try {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // 1. Fetch connected packages
    const servicePackages = await db
      .select({
        id: packages.id,
        packageName: packages.packageName,
        packageRatePerSqFt: packages.packageRatePerSqFt,
        displayOrder: packages.displayOrder,
        isActive: packages.isActive,
        showRatePublicly: packages.showRatePublicly,
        isRecommended: packages.isRecommended,
      })
      .from(packages)
      .where(eq(packages.mainServiceId, serviceId))
      .orderBy(asc(packages.displayOrder));

    const pkgIds = servicePackages.map((p) => p.id);
    const pkgSubservicesMap: Record<number, { id: number; name: string }[]> = {};

    if (pkgIds.length > 0) {
      const junctionRows = await db
        .select({
          packageId: packageSubservices.packageId,
          subServiceId: packageSubservices.subServiceId,
          subServiceName: serviceRates.serviceName,
        })
        .from(packageSubservices)
        .leftJoin(serviceRates, eq(packageSubservices.subServiceId, serviceRates.id))
        .where(inArray(packageSubservices.packageId, pkgIds));

      junctionRows.forEach((j) => {
        if (!pkgSubservicesMap[j.packageId]) pkgSubservicesMap[j.packageId] = [];
        if (j.subServiceId && j.subServiceName) {
          pkgSubservicesMap[j.packageId].push({
            id: j.subServiceId,
            name: j.subServiceName,
          });
        }
      });
    }

    const packagesWithItems = servicePackages.map((p) => ({
      ...p,
      subServices: pkgSubservicesMap[p.id] || [],
    }));

    // 2. Fetch connected sub-services
    const subServicesList = await db
      .select({
        id: serviceRates.id,
        serviceName: serviceRates.serviceName,
        baseRate: serviceRates.baseRate,
        rateType: serviceRates.rateType,
        defaultQty: serviceRates.defaultQty,
        unitName: units.unitName,
        unitSymbol: units.unitSymbol,
        isActive: serviceRates.isActive,
        displayOrder: serviceRates.displayOrder,
      })
      .from(serviceRates)
      .leftJoin(units, eq(serviceRates.unitId, units.id))
      .where(eq(serviceRates.mainServiceId, serviceId))
      .orderBy(asc(serviceRates.displayOrder));

    // 3. Fetch workflows and steps for these sub-services
    const subIds = subServicesList.map((s) => s.id);
    let workflowsList: Array<{
      id: number;
      subServiceId: number;
      subServiceName: string | null;
      title: string;
      isActive: boolean;
      steps: Array<any>;
    }> = [];

    if (subIds.length > 0) {
      const wfs = await db
        .select({
          id: workflows.id,
          subServiceId: workflows.subServiceId,
          subServiceName: serviceRates.serviceName,
          title: workflows.title,
          isActive: workflows.isActive,
        })
        .from(workflows)
        .leftJoin(serviceRates, eq(workflows.subServiceId, serviceRates.id))
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

      workflowsList = wfs.map((w) => ({
        ...w,
        steps: steps.filter((s) => s.workflowId === w.id),
      }));
    }

    return NextResponse.json({
      success: true,
      service,
      packages: packagesWithItems,
      subServices: subServicesList,
      workflows: workflowsList,
    });
  } catch (error) {
    console.error("Admin service GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch service" },
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
  const serviceId = parseInt(id, 10);
  if (isNaN(serviceId)) {
    return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = serviceUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const data = validation.data;

    // Resolve slug (preserve existing if omitted, otherwise format provided slug)
    const targetSlug =
      data.slug && data.slug.trim().length > 0
        ? generateSlug(data.slug)
        : existing.slug;

    // Check slug collision against any other service
    if (targetSlug !== existing.slug) {
      const [slugClash] = await db
        .select({ id: services.id })
        .from(services)
        .where(and(eq(services.slug, targetSlug), ne(services.id, serviceId)))
        .limit(1);

      if (slugClash) {
        return NextResponse.json(
          { error: "Slug already used by another service. Please choose a unique slug." },
          { status: 409 }
        );
      }
    }

    await db
      .update(services)
      .set({
        title: data.title.trim(),
        slug: targetSlug,
        shortDescription: data.shortDescription?.trim() || null,
        detailedContent: data.detailedContent?.trim() || null,
        thumbnailUrl: data.thumbnailUrl?.trim() || null,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive,
      })
      .where(eq(services.id, serviceId));

    const [updated] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      service: updated,
    });
  } catch (error) {
    console.error("Admin service update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update service" },
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
  const serviceId = parseInt(id, 10);
  if (isNaN(serviceId)) {
    return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.delete(services).where(eq(services.id, serviceId));

    return NextResponse.json({
      success: true,
      message: `Service "${existing.title}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin service delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
