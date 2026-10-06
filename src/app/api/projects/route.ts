import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const validCategories = ["completed", "ongoing", "upcoming"];
    const whereClause =
      category && validCategories.includes(category)
        ? eq(projects.category, category)
        : undefined;

    const list = await db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        category: projects.category,
        location: projects.location,
        clientName: projects.clientName,
        costEstimate: projects.costEstimate,
        description: projects.description,
        mainImageUrl: projects.mainImageUrl,
        oldElevationUrl: projects.oldElevationUrl,
        newElevationUrl: projects.newElevationUrl,
        displayOrder: projects.displayOrder,
        isFeatured: projects.isFeatured,
      })
      .from(projects)
      .where(whereClause)
      .orderBy(asc(projects.displayOrder));

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Public Projects API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects portfolio" },
      { status: 500 }
    );
  }
}
