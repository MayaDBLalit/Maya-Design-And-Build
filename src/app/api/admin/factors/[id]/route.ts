import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { fiveFactors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fiveFactorUpdateSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const factorId = parseInt(id, 10);
  if (isNaN(factorId)) {
    return NextResponse.json({ error: "Invalid factor ID" }, { status: 400 });
  }

  try {
    const [factor] = await db
      .select()
      .from(fiveFactors)
      .where(eq(fiveFactors.id, factorId))
      .limit(1);

    if (!factor) {
      return NextResponse.json({ error: "Factor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, factor });
  } catch (error) {
    console.error("Admin factor GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch factor" },
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
  const factorId = parseInt(id, 10);
  if (isNaN(factorId)) {
    return NextResponse.json({ error: "Invalid factor ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = fiveFactorUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(fiveFactors)
      .where(eq(fiveFactors.id, factorId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Factor not found" }, { status: 404 });
    }

    const data = validation.data;

    // Filter clean string impact points
    const cleanImpactPoints = (data.impactPoints || [])
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    await db
      .update(fiveFactors)
      .set({
        titleEnglish: data.titleEnglish.trim(),
        titleHindi: data.titleHindi.trim(),
        iconImage: data.iconImage || null,
        tagline: data.tagline ? data.tagline.trim() : null,
        detailsText: data.detailsText ? data.detailsText.trim() : null,
        impactPoints: cleanImpactPoints,
      })
      .where(eq(fiveFactors.id, factorId));

    const [updated] = await db
      .select()
      .from(fiveFactors)
      .where(eq(fiveFactors.id, factorId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Factor updated successfully",
      factor: updated,
    });
  } catch (error) {
    console.error("Admin factor update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update factor" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method Not Allowed", message: "Five factors are permanent elements and cannot be deleted." },
    { status: 405 }
  );
}
