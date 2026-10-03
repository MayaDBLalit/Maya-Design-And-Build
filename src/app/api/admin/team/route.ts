import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { teamMemberSchema } from "@/lib/validations";
import { asc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const members = await db
      .select()
      .from(teamMembers)
      .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.id));

    return NextResponse.json({ success: true, teamMembers: members });
  } catch (error) {
    console.error("Admin team list error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const validation = teamMemberSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [insertResult] = await db.insert(teamMembers).values({
      fullName: data.fullName,
      roleTitle: data.roleTitle,
      education: data.education || null,
      experienceYears: data.experienceYears || null,
      bio: data.bio || null,
      imageUrl: data.imageUrl || null,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    });

    const [created] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, insertResult.insertId))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        message: "Team member created successfully",
        teamMember: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin team create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create team member" },
      { status: 500 }
    );
  }
}
