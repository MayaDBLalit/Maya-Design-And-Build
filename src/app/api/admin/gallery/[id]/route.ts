import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { galleryItemSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid gallery item ID" }, { status: 400 });
  }

  try {
    const [item] = await db
      .select()
      .from(gallery)
      .where(eq(gallery.id, itemId))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, galleryItem: item });
  } catch (error) {
    console.error("Admin gallery item GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch gallery item" },
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
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid gallery item ID" }, { status: 400 });
  }

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

    const [existing] = await db
      .select()
      .from(gallery)
      .where(eq(gallery.id, itemId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    await db
      .update(gallery)
      .set({
        title: data.title,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        thumbnailUrl: data.thumbnailUrl || null,
        durationSeconds: data.durationSeconds || null,
        fileSizeBytes: data.fileSizeBytes || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      })
      .where(eq(gallery.id, itemId));

    const [updated] = await db
      .select()
      .from(gallery)
      .where(eq(gallery.id, itemId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Gallery item updated successfully",
      galleryItem: updated,
    });
  } catch (error) {
    console.error("Admin gallery item update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update gallery item" },
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
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid gallery item ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(gallery)
      .where(eq(gallery.id, itemId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    await db.delete(gallery).where(eq(gallery.id, itemId));

    return NextResponse.json({
      success: true,
      message: `Gallery item "${existing.title}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin gallery item delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
