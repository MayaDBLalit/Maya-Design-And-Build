import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { inquiries, inquiryItems } from "@/db/schema";
import { desc, eq, and, or, like, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search")?.trim();

    const conditions = [];

    if (statusFilter && ["new", "contacted", "in_progress", "closed"].includes(statusFilter)) {
      conditions.push(eq(inquiries.status, statusFilter));
    }

    if (searchQuery) {
      // Check if search query looks like an ID / reference (e.g. INQ-12 or 12)
      const numericIdMatch = searchQuery.replace(/^INQ-/i, "");
      const isNumeric = /^\d+$/.test(numericIdMatch);

      if (isNumeric) {
        conditions.push(
          or(
            eq(inquiries.id, parseInt(numericIdMatch, 10)),
            like(inquiries.fullName, `%${searchQuery}%`),
            like(inquiries.phone, `%${searchQuery}%`),
            like(inquiries.email, `%${searchQuery}%`)
          )
        );
      } else {
        conditions.push(
          or(
            like(inquiries.fullName, `%${searchQuery}%`),
            like(inquiries.phone, `%${searchQuery}%`),
            like(inquiries.email, `%${searchQuery}%`),
            like(inquiries.interestedService, `%${searchQuery}%`)
          )
        );
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db
      .select({
        id: inquiries.id,
        fullName: inquiries.fullName,
        email: inquiries.email,
        phone: inquiries.phone,
        interestedService: inquiries.interestedService,
        message: inquiries.message,
        tentativeBudget: inquiries.tentativeBudget,
        status: inquiries.status,
        adminNotes: inquiries.adminNotes,
        createdAt: inquiries.createdAt,
        updatedAt: inquiries.updatedAt,
      })
      .from(inquiries)
      .where(whereClause)
      .orderBy(desc(inquiries.createdAt));

    // Get item counts for all inquiries to identify which have quotation breakdowns
    const itemCounts = await db
      .select({
        inquiryId: inquiryItems.inquiryId,
        count: count(),
      })
      .from(inquiryItems)
      .groupBy(inquiryItems.inquiryId);

    const countsMap = new Map(itemCounts.map((i) => [i.inquiryId, Number(i.count)]));

    const inquiriesWithMeta = list.map((inq) => ({
      ...inq,
      reference: `INQ-${inq.id}`,
      itemsCount: countsMap.get(inq.id) || 0,
      hasQuotation: (countsMap.get(inq.id) || 0) > 0,
    }));

    // Also return aggregate counts for tabs
    const [allCountRes] = await db.select({ count: count() }).from(inquiries);
    const [newCountRes] = await db
      .select({ count: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "new"));
    const [contactedCountRes] = await db
      .select({ count: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "contacted"));
    const [inProgressCountRes] = await db
      .select({ count: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "in_progress"));
    const [closedCountRes] = await db
      .select({ count: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "closed"));

    return NextResponse.json({
      success: true,
      inquiries: inquiriesWithMeta,
      counts: {
        all: Number(allCountRes.count),
        new: Number(newCountRes.count),
        contacted: Number(contactedCountRes.count),
        in_progress: Number(inProgressCountRes.count),
        closed: Number(closedCountRes.count),
      },
    });
  } catch (error: any) {
    console.error("Admin list inquiries error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
