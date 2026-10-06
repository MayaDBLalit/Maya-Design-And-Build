import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { settingsUpdateSchema, ALLOWED_SETTING_KEYS } from "@/lib/validations";
import { asc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const allSettings = await db
      .select({
        id: settings.id,
        keyName: settings.keyName,
        valueContent: settings.valueContent,
        groupName: settings.groupName,
        updatedAt: settings.updatedAt,
      })
      .from(settings)
      .orderBy(asc(settings.groupName), asc(settings.keyName));

    // Filter to only allowed public keys so internal/secret keys can never leak
    const safeSettings = allSettings.filter((s) =>
      ALLOWED_SETTING_KEYS.includes(s.keyName as any)
    );

    return NextResponse.json({
      success: true,
      settings: safeSettings,
      allowedKeys: ALLOWED_SETTING_KEYS,
    });
  } catch (error) {
    console.error("Admin settings list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const validation = settingsUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updates = validation.data;

    // Apply updates within database
    for (const item of updates) {
      const [existing] = await db
        .select({ id: settings.id })
        .from(settings)
        .where(eq(settings.keyName, item.keyName))
        .limit(1);

      if (existing) {
        await db
          .update(settings)
          .set({ valueContent: item.valueContent })
          .where(eq(settings.keyName, item.keyName));
      } else {
        await db.insert(settings).values({
          keyName: item.keyName,
          valueContent: item.valueContent,
          groupName: "general",
        });
      }
    }

    const updatedSettings = await db
      .select({
        id: settings.id,
        keyName: settings.keyName,
        valueContent: settings.valueContent,
        groupName: settings.groupName,
        updatedAt: settings.updatedAt,
      })
      .from(settings)
      .orderBy(asc(settings.groupName), asc(settings.keyName));

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: updatedSettings.filter((s) =>
        ALLOWED_SETTING_KEYS.includes(s.keyName as any)
      ),
    });
  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update settings" },
      { status: 500 }
    );
  }
}
