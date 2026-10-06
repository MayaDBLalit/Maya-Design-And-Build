import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { projects, projectMedia } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStorageDriver } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id, mediaId } = await params;
  const parsedProjectId = parseInt(id, 10);
  const parsedMediaId = parseInt(mediaId, 10);

  if (isNaN(parsedProjectId) || isNaN(parsedMediaId)) {
    return NextResponse.json(
      { error: "Invalid project ID or media ID" },
      { status: 400 }
    );
  }

  try {
    // 1. Verify project exists
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, parsedProjectId))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // 2. Fetch the media item by mediaId
    const [existing] = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.id, parsedMediaId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Project media not found" },
        { status: 404 }
      );
    }

    // 3. Strict cross-project ownership validation
    if (existing.projectId !== parsedProjectId) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Media does not belong to the specified project",
        },
        { status: 403 }
      );
    }

    // 4. Safe physical storage cleanup (only uploaded local files in /uploads/)
    if (existing.mediaUrl.startsWith("/uploads/")) {
      try {
        const fileName = path.basename(existing.mediaUrl);
        const storageDriver = getStorageDriver();
        await storageDriver.delete(fileName);
      } catch (fileErr) {
        console.warn(`Could not delete physical media file ${existing.mediaUrl}:`, fileErr);
      }
    }

    // 5. Delete database record
    await db
      .delete(projectMedia)
      .where(eq(projectMedia.id, parsedMediaId));

    return NextResponse.json({
      success: true,
      message: "Media removed from project successfully",
    });
  } catch (error) {
    console.error("Admin project media delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to remove project media" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id, mediaId } = await params;
  const parsedProjectId = parseInt(id, 10);
  const parsedMediaId = parseInt(mediaId, 10);

  if (isNaN(parsedProjectId) || isNaN(parsedMediaId)) {
    return NextResponse.json(
      { error: "Invalid project ID or media ID" },
      { status: 400 }
    );
  }

  try {
    // 1. Verify project exists
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, parsedProjectId))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // 2. Fetch the media item by mediaId
    const [existing] = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.id, parsedMediaId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Project media not found" },
        { status: 404 }
      );
    }

    // 3. Strict cross-project ownership validation
    if (existing.projectId !== parsedProjectId) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Media does not belong to the specified project",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: { displayOrder?: number; mediaType?: "image" | "video" } = {};

    if (typeof body.displayOrder === "number") {
      updateData.displayOrder = body.displayOrder;
    }
    if (body.mediaType === "image" || body.mediaType === "video") {
      updateData.mediaType = body.mediaType;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(projectMedia)
        .set(updateData)
        .where(eq(projectMedia.id, parsedMediaId));
    }

    const [updated] = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.id, parsedMediaId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Media updated successfully",
      media: updated,
    });
  } catch (error) {
    console.error("Admin project media patch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update project media" },
      { status: 500 }
    );
  }
}
