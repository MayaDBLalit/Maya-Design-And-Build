import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { services } from "@/db/schema";
import { asc } from "drizzle-orm";

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
