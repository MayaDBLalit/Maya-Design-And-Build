import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import {
  services,
  projects,
  teamMembers,
  gallery,
  serviceRates,
  units,
  inquiries,
} from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const [servicesRes] = await db.select({ count: count() }).from(services);
    const [projectsRes] = await db.select({ count: count() }).from(projects);
    const [completedProjectsRes] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.category, "completed"));
    const [ongoingProjectsRes] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.category, "ongoing"));
    const [upcomingProjectsRes] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.category, "upcoming"));

    const [teamRes] = await db.select({ count: count() }).from(teamMembers);
    const [galleryRes] = await db.select({ count: count() }).from(gallery);
    const [ratesRes] = await db.select({ count: count() }).from(serviceRates);
    const [activeRatesRes] = await db
      .select({ count: count() })
      .from(serviceRates)
      .where(eq(serviceRates.isActive, true));
    const [unitsRes] = await db.select({ count: count() }).from(units);
    const [inquiriesRes] = await db.select({ count: count() }).from(inquiries);
    const [newInquiriesRes] = await db
      .select({ count: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "new"));

    return NextResponse.json({
      success: true,
      stats: {
        servicesCount: Number(servicesRes.count),
        projectsCount: Number(projectsRes.count),
        projectsBreakdown: {
          completed: Number(completedProjectsRes.count),
          ongoing: Number(ongoingProjectsRes.count),
          upcoming: Number(upcomingProjectsRes.count),
        },
        teamCount: Number(teamRes.count),
        galleryCount: Number(galleryRes.count),
        ratesCount: Number(ratesRes.count),
        activeRatesCount: Number(activeRatesRes.count),
        unitsCount: Number(unitsRes.count),
        inquiriesCount: Number(inquiriesRes.count),
        newInquiriesCount: Number(newInquiriesRes.count),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
