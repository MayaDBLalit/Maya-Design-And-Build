import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { serviceCreateSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const allServices = await db
      .select()
      .from(services)
      .orderBy(asc(services.displayOrder), asc(services.id));

    return NextResponse.json({
      success: true,
      services: allServices,
    });
  } catch (error) {
    console.error("Admin services list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const validation = serviceCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Resolve unique slug
    const targetSlug =
      data.slug && data.slug.trim().length > 0
        ? generateSlug(data.slug)
        : generateSlug(data.title);

    if (!targetSlug || targetSlug.length < 2) {
      return NextResponse.json(
        { error: "Could not generate a valid slug from the provided title/slug." },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const [existingSlug] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, targetSlug))
      .limit(1);

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists. Please provide a unique slug or title." },
        { status: 409 }
      );
    }

    const [insertResult] = await db.insert(services).values({
      title: data.title.trim(),
      slug: targetSlug,
      shortDescription: data.shortDescription?.trim() || null,
      detailedContent: data.detailedContent?.trim() || null,
      thumbnailUrl: data.thumbnailUrl?.trim() || null,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    const newServiceId = insertResult.insertId;
    const [created] = await db
      .select()
      .from(services)
      .where(eq(services.id, newServiceId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        service: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin service creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create service" },
      { status: 500 }
    );
  }
}
