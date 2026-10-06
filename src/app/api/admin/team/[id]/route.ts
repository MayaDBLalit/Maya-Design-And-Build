import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { teamMemberSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const memberId = parseInt(id, 10);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid team member ID" }, { status: 400 });
  }

  try {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, memberId))
      .limit(1);

    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, teamMember: member });
  } catch (error) {
    console.error("Admin team member GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch team member" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const memberId = parseInt(id, 10);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid team member ID" }, { status: 400 });
  }

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

    const [existing] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, memberId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await db
      .update(teamMembers)
      .set({
        fullName: data.fullName,
        roleTitle: data.roleTitle,
        education: data.education || null,
        experienceYears: data.experienceYears || null,
        bio: data.bio || null,
        imageUrl: data.imageUrl || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      })
      .where(eq(teamMembers.id, memberId));

    const [updated] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, memberId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Team member updated successfully",
      teamMember: updated,
    });
  } catch (error) {
    console.error("Admin team member update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update team member" },
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
  const memberId = parseInt(id, 10);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid team member ID" }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, memberId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));

    return NextResponse.json({
      success: true,
      message: `Team member "${existing.fullName}" deleted successfully`,
    });
  } catch (error) {
    console.error("Admin team member delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
