import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { fiveFactors } from "@/db/schema";
import { CANONICAL_FACTOR_ORDER } from "@/lib/public-api";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const list = await db.select().from(fiveFactors);
    const sorted = list.sort((a, b) => {
      const idxA = CANONICAL_FACTOR_ORDER.indexOf(a.factorType as any);
      const idxB = CANONICAL_FACTOR_ORDER.indexOf(b.factorType as any);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    return NextResponse.json({
      success: true,
      factors: sorted,
    });
  } catch (error) {
    console.error("Admin factors list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch factors" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Method Not Allowed", message: "Five factors are fixed elements and cannot be created." },
    { status: 405 }
  );
}
