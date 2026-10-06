import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { projectSchema } from "@/lib/validations";
import { asc, desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.displayOrder), desc(projects.createdAt));

    return NextResponse.json({
      success: true,
      projects: allProjects,
    });
  } catch (error) {
    console.error("Admin projects list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

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

    // Check slug uniqueness
    const [existingSlug] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, data.slug))
      .limit(1);

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists. Please provide a unique slug." },
        { status: 409 }
      );
    }

    const costStr =
      data.costEstimate !== undefined && data.costEstimate !== null && data.costEstimate !== ""
        ? String(data.costEstimate)
        : null;

    const [insertResult] = await db.insert(projects).values({
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
    });

    const [newProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, insertResult.insertId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        project: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin project create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create project" },
      { status: 500 }
    );
  }
}
