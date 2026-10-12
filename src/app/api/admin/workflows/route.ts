import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { workflows, workflowSteps, serviceRates, services } from "@/db/schema";
import { workflowSchema } from "@/lib/validations";
import { asc, eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const list = await db
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
      .orderBy(asc(workflows.id));

    const workflowIds = list.map((w) => w.id);
    let allSteps: any[] = [];

    if (workflowIds.length > 0) {
      allSteps = await db
        .select()
        .from(workflowSteps)
        .where(inArray(workflowSteps.workflowId, workflowIds))
        .orderBy(asc(workflowSteps.displayOrder), asc(workflowSteps.stepNumber));
    }

    const result = list.map((w) => ({
      ...w,
      steps: allSteps.filter((s) => s.workflowId === w.id),
      stepsCount: allSteps.filter((s) => s.workflowId === w.id).length,
    }));

    return NextResponse.json({ success: true, workflows: result });
  } catch (error) {
    console.error("Admin workflows GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

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

    // Verify subservice exists
    const [subService] = await db
      .select({ id: serviceRates.id })
      .from(serviceRates)
      .where(eq(serviceRates.id, data.subServiceId))
      .limit(1);

    if (!subService) {
      return NextResponse.json(
        { error: "Selected SubService does not exist" },
        { status: 400 }
      );
    }

    // Verify SubService doesn't already have a workflow (enforce max 1 workflow per SubService)
    const [existing] = await db
      .select({ id: workflows.id })
      .from(workflows)
      .where(eq(workflows.subServiceId, data.subServiceId))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "A workflow already exists for this SubService. Each SubService can have at most one workflow." },
        { status: 400 }
      );
    }

    const insertResult = await db.transaction(async (tx) => {
      const [newWf] = await tx.insert(workflows).values({
        subServiceId: data.subServiceId,
        title: data.title,
        isActive: data.isActive,
      });

      const wfId = newWf.insertId;

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

      return wfId;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Workflow created successfully",
        workflowId: insertResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin workflow create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
