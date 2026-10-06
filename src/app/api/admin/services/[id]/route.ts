import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { services } from "@/db/schema";
import { serviceUpdateSchema } from "@/lib/validations";
import { eq, and, ne } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const serviceId = parseInt(id, 10);
  if (isNaN(serviceId)) {
    return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
  }

  try {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Admin service GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch service" },
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
  const serviceId = parseInt(id, 10);
  if (isNaN(serviceId)) {
    return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = serviceUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const data = validation.data;

    // Resolve slug (preserve existing if omitted, otherwise format provided slug)
    const targetSlug =
      data.slug && data.slug.trim().length > 0
        ? generateSlug(data.slug)
        : existing.slug;

    // Check slug collision against any other service
    if (targetSlug !== existing.slug) {
      const [slugClash] = await db
        .select({ id: services.id })
        .from(services)
        .where(and(eq(services.slug, targetSlug), ne(services.id, serviceId)))
        .limit(1);

      if (slugClash) {
        return NextResponse.json(
          { error: "Slug already used by another service. Please choose a unique slug." },
          { status: 409 }
        );
      }
    }

    await db
      .update(services)
      .set({
        title: data.title.trim(),
        slug: targetSlug,
        shortDescription: data.shortDescription?.trim() || null,
        detailedContent: data.detailedContent?.trim() || null,
        thumbnailUrl: data.thumbnailUrl?.trim() || null,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive,
      })
      .where(eq(services.id, serviceId));

    const [updated] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      service: updated,
    });
  } catch (error) {
    console.error("Admin service update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update service" },
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
  const serviceId = parseInt(id, 10);
  if (isNaN(serviceId)) {
    return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.delete(services).where(eq(services.id, serviceId));

    return NextResponse.json({
      success: true,
      message: `Service "${existing.title}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin service delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
