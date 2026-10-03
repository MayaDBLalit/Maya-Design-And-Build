import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: services.id,
        title: services.title,
        slug: services.slug,
        shortDescription: services.shortDescription,
        detailedContent: services.detailedContent,
        thumbnailUrl: services.thumbnailUrl,
        displayOrder: services.displayOrder,
      })
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.displayOrder));

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Public Services API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services catalog" },
      { status: 500 }
    );
  }
}
