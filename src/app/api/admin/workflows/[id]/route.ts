import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { workflows, workflowSteps, serviceRates, services, packages, packageSubservices } from "@/db/schema";
import { workflowSchema } from "@/lib/validations";
import { asc, eq, and, ne } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const wfId = parseInt(id, 10);
  if (isNaN(wfId)) {
    return NextResponse.json({ error: "Invalid Workflow ID" }, { status: 400 });
  }

  try {
    const [wf] = await db
      .select({
        id: workflows.id,
        subServiceId: workflows.subServiceId,
        subServiceName: serviceRates.serviceName,
        mainServiceId: serviceRates.mainServiceId,
        mainServiceTitle: services.title,
        title: workflows.title,
        isActive: workflows.isActive,
        createdAt: workflows.createdAt,
        updatedAt: workflows.updatedAt,
      })
      .from(workflows)
      .leftJoin(serviceRates, eq(workflows.subServiceId, serviceRates.id))
      .leftJoin(services, eq(serviceRates.mainServiceId, services.id))
      .where(eq(workflows.id, wfId))
      .limit(1);

    if (!wf) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const steps = await db
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.workflowId, wfId))
      .orderBy(asc(workflowSteps.displayOrder), asc(workflowSteps.stepNumber));

    // Fetch packages that indirectly include this workflow via its SubService
    let relatedPackages: Array<{
      id: number;
      packageName: string;
      packageRatePerSqFt: string;
      isRecommended: boolean;
      isActive: boolean;
    }> = [];

    if (wf.subServiceId) {
      relatedPackages = await db
        .select({
          id: packages.id,
          packageName: packages.packageName,
          packageRatePerSqFt: packages.packageRatePerSqFt,
          isRecommended: packages.isRecommended,
          isActive: packages.isActive,
        })
        .from(packageSubservices)
        .innerJoin(packages, eq(packageSubservices.packageId, packages.id))
        .where(eq(packageSubservices.subServiceId, wf.subServiceId));
    }

    return NextResponse.json({
      success: true,
      workflow: {
        ...wf,
        steps,
        packages: relatedPackages,
      },
    });
  } catch (error) {
    console.error("Admin workflow GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch workflow" },
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
  const wfId = parseInt(id, 10);
  if (isNaN(wfId)) {
    return NextResponse.json({ error: "Invalid Workflow ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = workflowSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [existing] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, wfId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Verify subservice is unique to this workflow
    const [subServiceDuplicate] = await db
      .select({ id: workflows.id })
      .from(workflows)
      .where(and(eq(workflows.subServiceId, data.subServiceId), ne(workflows.id, wfId)))
      .limit(1);

    if (subServiceDuplicate) {
      return NextResponse.json(
        { error: "Another workflow is already associated with this SubService" },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .update(workflows)
        .set({
          subServiceId: data.subServiceId,
          title: data.title,
          isActive: data.isActive,
        })
        .where(eq(workflows.id, wfId));

      // Synchronize dynamic steps
      await tx.delete(workflowSteps).where(eq(workflowSteps.workflowId, wfId));

      if (data.steps && data.steps.length > 0) {
        await tx.insert(workflowSteps).values(
          data.steps.map((s, idx) => ({
            workflowId: wfId,
            stepNumber: s.stepNumber || idx + 1,
            title: s.title,
            details: s.details || null,
            displayOrder: s.displayOrder ?? idx + 1,
          }))
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: "Workflow updated successfully",
    });
  } catch (error) {
    console.error("Admin workflow update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update workflow" },
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
  const wfId = parseInt(id, 10);
  if (isNaN(wfId)) {
    return NextResponse.json({ error: "Invalid Workflow ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, wfId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    await db.delete(workflows).where(eq(workflows.id, wfId));

    return NextResponse.json({
      success: true,
      message: `Workflow "${existing.title}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin workflow delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
