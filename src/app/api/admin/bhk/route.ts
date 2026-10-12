import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { bhkConfigurations } from "@/db/schema";
import { bhkConfigurationSchema } from "@/lib/validations";
import { asc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const list = await db
      .select()
      .from(bhkConfigurations)
      .orderBy(asc(bhkConfigurations.displayOrder), asc(bhkConfigurations.bhkNumber));

    return NextResponse.json({ success: true, bhkConfigurations: list });
  } catch (error) {
    console.error("Admin BHK list GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch BHK configurations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

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

    // Check duplicate
    const [existing] = await db
      .select({ id: bhkConfigurations.id })
      .from(bhkConfigurations)
      .where(eq(bhkConfigurations.bhkNumber, data.bhkNumber))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: `A configuration for ${data.bhkNumber} BHK already exists` },
        { status: 400 }
      );
    }

    const [inserted] = await db.insert(bhkConfigurations).values({
      bhkNumber: data.bhkNumber,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "BHK configuration created successfully",
        bhkId: inserted.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin BHK create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create BHK configuration" },
      { status: 500 }
    );
  }
}
