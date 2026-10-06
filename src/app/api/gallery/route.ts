import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get("mediaType");

    const validTypes = ["image", "video"];
    const whereClause =
      mediaType && validTypes.includes(mediaType)
        ? eq(gallery.mediaType, mediaType)
        : undefined;

    const list = await db
      .select({
        id: gallery.id,
        title: gallery.title,
        mediaType: gallery.mediaType,
        mediaUrl: gallery.mediaUrl,
        thumbnailUrl: gallery.thumbnailUrl,
        durationSeconds: gallery.durationSeconds,
        fileSizeBytes: gallery.fileSizeBytes,
        displayOrder: gallery.displayOrder,
      })
      .from(gallery)
      .where(whereClause)
      .orderBy(asc(gallery.displayOrder));

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Public Gallery API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery media" },
      { status: 500 }
    );
  }
}
