import { NextResponse } from "next/server";
import { db } from "@/db";
import { calculators } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: calculators.id,
        title: calculators.title,
        slug: calculators.slug,
        displayOrder: calculators.displayOrder,
      })
      .from(calculators)
      .where(eq(calculators.isActive, true))
      .orderBy(asc(calculators.displayOrder), asc(calculators.id));

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Public Calculators API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch calculators" },
      { status: 500 }
    );
  }
}
