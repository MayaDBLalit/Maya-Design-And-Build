import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { galleryItemSchema } from "@/lib/validations";
import { asc, desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const items = await db
      .select()
      .from(gallery)
      .orderBy(asc(gallery.displayOrder), desc(gallery.createdAt));

    return NextResponse.json({ success: true, gallery: items });
  } catch (error) {
    console.error("Admin gallery list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const validation = galleryItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Enforce video constraints
    if (data.mediaType === "video") {
      if (data.durationSeconds && data.durationSeconds > 60) {
        return NextResponse.json(
          { error: "Video duration must not exceed 60 seconds (1 minute)" },
          { status: 400 }
        );
      }
      if (data.fileSizeBytes && data.fileSizeBytes > 52428800) {
        return NextResponse.json(
          { error: "Video file size must not exceed 50 MB" },
          { status: 400 }
        );
      }
    }

    const [insertResult] = await db.insert(gallery).values({
      title: data.title,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      thumbnailUrl: data.thumbnailUrl || null,
      durationSeconds: data.durationSeconds || null,
      fileSizeBytes: data.fileSizeBytes || null,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    });

    const [created] = await db
      .select()
      .from(gallery)
      .where(eq(gallery.id, insertResult.insertId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        message: "Gallery item created successfully",
        galleryItem: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin gallery create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create gallery item" },
      { status: 500 }
    );
  }
}
