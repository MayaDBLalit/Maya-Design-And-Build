import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";

// Strict allowlist: Only explicitly safe public settings may ever be returned to clients
const PUBLIC_SETTINGS_ALLOWLIST = [
  "site_name",
  "tagline",
  "contact_phone",
  "contact_email",
  "contact_address",
  "google_maps_url",
  "instagram_url",
  "facebook_url",
  "primary_domain",
  "terms_and_conditions",
  "privacy_policy",
];

export async function GET() {
  try {
    const rows = await db
      .select({
        keyName: settings.keyName,
        valueContent: settings.valueContent,
        groupName: settings.groupName,
      })
      .from(settings)
      .where(inArray(settings.keyName, PUBLIC_SETTINGS_ALLOWLIST));

    // Convert to dictionary for easy frontend access while preserving group metadata
    const settingsMap: Record<string, string | null> = {};
    for (const r of rows) {
      settingsMap[r.keyName] = r.valueContent;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
    });
  } catch (error) {
    console.error("Public Settings API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch website settings" },
      { status: 500 }
    );
  }
}
