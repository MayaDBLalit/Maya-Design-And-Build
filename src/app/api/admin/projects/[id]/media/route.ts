import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { projects, projectMedia } from "@/db/schema";
import { projectMediaSchema } from "@/lib/validations";
import { eq, asc } from "drizzle-orm";

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
    const media = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectId))
      .orderBy(asc(projectMedia.displayOrder), asc(projectMedia.id));

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error("Admin project media list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch project media" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    // Confirm project exists
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = projectMediaSchema.safeParse({ ...body, projectId });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { mediaUrl, mediaType, displayOrder } = validation.data;

    const [insertResult] = await db.insert(projectMedia).values({
      projectId,
      mediaUrl,
      mediaType,
      displayOrder,
    });

    const [createdMedia] = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.id, insertResult.insertId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        message: "Media attached to project successfully",
        media: createdMedia,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin project media create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to add project media" },
      { status: 500 }
    );
  }
}
