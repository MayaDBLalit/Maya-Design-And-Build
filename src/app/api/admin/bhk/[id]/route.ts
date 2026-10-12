import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { bhkConfigurations } from "@/db/schema";
import { bhkConfigurationSchema } from "@/lib/validations";
import { eq, and, ne } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const bhkId = parseInt(id, 10);
  if (isNaN(bhkId)) {
    return NextResponse.json({ error: "Invalid BHK ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = bhkConfigurationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [existing] = await db
      .select()
      .from(bhkConfigurations)
      .where(eq(bhkConfigurations.id, bhkId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "BHK configuration not found" }, { status: 404 });
    }

    // Check duplicate
    const [duplicate] = await db
      .select({ id: bhkConfigurations.id })
      .from(bhkConfigurations)
      .where(and(eq(bhkConfigurations.bhkNumber, data.bhkNumber), ne(bhkConfigurations.id, bhkId)))
      .limit(1);

    if (duplicate) {
      return NextResponse.json(
        { error: `A configuration for ${data.bhkNumber} BHK already exists` },
        { status: 400 }
      );
    }

    await db
      .update(bhkConfigurations)
      .set({
        bhkNumber: data.bhkNumber,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      })
      .where(eq(bhkConfigurations.id, bhkId));

    return NextResponse.json({
      success: true,
      message: "BHK configuration updated successfully",
    });
  } catch (error) {
    console.error("Admin BHK update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update BHK configuration" },
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
  const bhkId = parseInt(id, 10);
  if (isNaN(bhkId)) {
    return NextResponse.json({ error: "Invalid BHK ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(bhkConfigurations)
      .where(eq(bhkConfigurations.id, bhkId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "BHK configuration not found" }, { status: 404 });
    }

    await db.delete(bhkConfigurations).where(eq(bhkConfigurations.id, bhkId));

    return NextResponse.json({
      success: true,
      message: `${existing.bhkNumber} BHK configuration deleted successfully`,
    });
  } catch (error) {
    console.error("Admin BHK delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete BHK configuration" },
      { status: 500 }
    );
  }
}
