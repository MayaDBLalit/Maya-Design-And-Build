import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { projectMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    const [existing] = await db
      .select()
      .from(projectMedia)
      .where(
        and(
          eq(projectMedia.id, parsedMediaId),
          eq(projectMedia.projectId, parsedProjectId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Project media not found" },
        { status: 404 }
      );
    }

    await db
      .delete(projectMedia)
      .where(
        and(
          eq(projectMedia.id, parsedMediaId),
          eq(projectMedia.projectId, parsedProjectId)
        )
      );

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
