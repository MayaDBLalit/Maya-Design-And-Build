import { NextResponse } from "next/server";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: teamMembers.id,
        fullName: teamMembers.fullName,
        roleTitle: teamMembers.roleTitle,
        education: teamMembers.education,
        experienceYears: teamMembers.experienceYears,
        bio: teamMembers.bio,
        imageUrl: teamMembers.imageUrl,
        displayOrder: teamMembers.displayOrder,
      })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(asc(teamMembers.displayOrder));

    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Public Team API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
