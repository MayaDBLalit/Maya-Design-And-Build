import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { projects, projectMedia } from "@/db/schema";
import { projectSchema } from "@/lib/validations";
import { eq, and, ne, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const media = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectId))
      .orderBy(asc(projectMedia.displayOrder), asc(projectMedia.id));

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        media,
      },
    });
  } catch (error) {
    console.error("Admin project detail error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch project" },
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
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check slug uniqueness across other projects
    const [slugClash] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.slug, data.slug), ne(projects.id, projectId)))
      .limit(1);

    if (slugClash) {
      return NextResponse.json(
        { error: "Slug already used by another project. Please use a unique slug." },
        { status: 409 }
      );
    }

    const costStr =
      data.costEstimate !== undefined && data.costEstimate !== null && data.costEstimate !== ""
        ? String(data.costEstimate)
        : null;

    await db
      .update(projects)
      .set({
        title: data.title,
        slug: data.slug,
        category: data.category,
        location: data.location || null,
        clientName: data.clientName || null,
        clientNumber: data.clientNumber || null,
        costEstimate: costStr,
        description: data.description || null,
        mainImageUrl: data.mainImageUrl || null,
        oldElevationUrl: data.oldElevationUrl || null,
        newElevationUrl: data.newElevationUrl || null,
        displayOrder: data.displayOrder,
        isFeatured: data.isFeatured,
      })
      .where(eq(projects.id, projectId));

    const [updated] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      project: updated,
    });
  } catch (error) {
    console.error("Admin project update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update project" },
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
  const projectId = parseInt(id, 10);
  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Drizzle/MySQL foreign key onDelete: 'cascade' deletes project_media automatically
    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({
      success: true,
      message: `Project "${existing.title}" and its associated media deleted successfully`,
    });
  } catch (error) {
    console.error("Admin project delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete project" },
      { status: 500 }
    );
  }
}
