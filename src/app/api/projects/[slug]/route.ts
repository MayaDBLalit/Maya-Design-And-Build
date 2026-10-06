import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectMedia } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Fetch associated project media
    const media = await db
      .select({
        id: projectMedia.id,
        mediaUrl: projectMedia.mediaUrl,
        mediaType: projectMedia.mediaType,
        displayOrder: projectMedia.displayOrder,
      })
      .from(projectMedia)
      .where(eq(projectMedia.projectId, project.id))
      .orderBy(asc(projectMedia.displayOrder), asc(projectMedia.id));

    // Exclude internal client private numbers from public response
    const { clientNumber, ...publicProject } = project;

    return NextResponse.json({
      success: true,
      data: {
        ...publicProject,
        media,
      },
    });
  } catch (error) {
    console.error("Public Project Detail API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project details" },
      { status: 500 }
    );
  }
}
