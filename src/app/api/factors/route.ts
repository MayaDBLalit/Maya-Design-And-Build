import { NextResponse } from "next/server";
import { getFiveFactors } from "@/lib/public-api";

export async function GET() {
  try {
    const factors = await getFiveFactors();
    return NextResponse.json({
      success: true,
      factors,
    });
  } catch (error) {
    console.error("Public factors API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch factors" },
      { status: 500 }
    );
  }
}
