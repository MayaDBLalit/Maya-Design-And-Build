import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { inquiries, inquiryItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { adminInquiryUpdateSchema } from "@/lib/validations";
import { formatINR } from "@/lib/formatters";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const inquiryId = parseInt(id, 10);

    if (isNaN(inquiryId) || inquiryId <= 0) {
      return NextResponse.json({ error: "Bad Request", message: "Invalid inquiry ID" }, { status: 400 });
    }

    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .limit(1);

    if (!inquiry) {
      return NextResponse.json({ error: "Not Found", message: "Inquiry not found" }, { status: 404 });
    }

    const items = await db
      .select({
        id: inquiryItems.id,
        serviceRateId: inquiryItems.serviceRateId,
        serviceNameSnapshot: inquiryItems.serviceNameSnapshot,
        unitNameSnapshot: inquiryItems.unitNameSnapshot,
        unitRateSnapshot: inquiryItems.unitRateSnapshot,
        userQuantity: inquiryItems.userQuantity,
        calculatedAmount: inquiryItems.calculatedAmount,
        createdAt: inquiryItems.createdAt,
      })
      .from(inquiryItems)
      .where(eq(inquiryItems.inquiryId, inquiryId))
      .orderBy(desc(inquiryItems.id));

    const formattedItems = items.map((item) => ({
      ...item,
      formattedRate: formatINR(parseFloat(item.unitRateSnapshot)),
      formattedAmount: formatINR(parseFloat(item.calculatedAmount)),
    }));

    return NextResponse.json({
      success: true,
      inquiry: {
        ...inquiry,
        reference: `INQ-${inquiry.id}`,
        formattedBudget: inquiry.tentativeBudget ? formatINR(parseFloat(inquiry.tentativeBudget)) : null,
        items: formattedItems,
      },
    });
  } catch (error: any) {
    console.error("Admin get inquiry detail error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch inquiry details" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const inquiryId = parseInt(id, 10);

    if (isNaN(inquiryId) || inquiryId <= 0) {
      return NextResponse.json({ error: "Bad Request", message: "Invalid inquiry ID" }, { status: 400 });
    }

    const body = await request.json();
    const validation = adminInquiryUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { status, adminNotes } = validation.data;

    const [existing] = await db
      .select({ id: inquiries.id })
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Not Found", message: "Inquiry not found" }, { status: 404 });
    }

    const updateFields: Record<string, any> = {};
    if (status !== undefined) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    if (Object.keys(updateFields).length > 0) {
      await db.update(inquiries).set(updateFields).where(eq(inquiries.id, inquiryId));
    }

    const [updated] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Inquiry updated successfully",
      inquiry: {
        ...updated,
        reference: `INQ-${updated.id}`,
      },
    });
  } catch (error: any) {
    console.error("Admin update inquiry error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const inquiryId = parseInt(id, 10);

    if (isNaN(inquiryId) || inquiryId <= 0) {
      return NextResponse.json({ error: "Bad Request", message: "Invalid inquiry ID" }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: inquiries.id })
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Not Found", message: "Inquiry not found" }, { status: 404 });
    }

    await db.delete(inquiries).where(eq(inquiries.id, inquiryId));

    return NextResponse.json({
      success: true,
      message: `Inquiry INQ-${inquiryId} and associated records successfully deleted`,
    });
  } catch (error: any) {
    console.error("Admin delete inquiry error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
