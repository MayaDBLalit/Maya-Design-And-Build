import { cache } from "react";
import { db } from "@/db";
import {
  services,
  projects,
  projectMedia,
  teamMembers,
  gallery,
  serviceRates,
  units,
  settings,
} from "@/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { ALLOWED_SETTING_KEYS } from "./validations";

/**
 * Direct database query helpers for Server Components wrapped in React cache()
 * to guarantee request-level deduplication across metadata and page execution.
 */

export const getActiveServices = cache(async () => {
  try {
    return await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.displayOrder), asc(services.id));
  } catch (error) {
    console.error("Failed to query active services:", error);
    return [];
  }
});

export const getActiveProjects = cache(async (category?: string) => {
  try {
    const conditions = [];
    if (category && category !== "all") {
      conditions.push(eq(projects.category, category));
    }

    return await db
      .select()
      .from(projects)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(projects.displayOrder), desc(projects.createdAt));
  } catch (error) {
    console.error("Failed to query active projects:", error);
    return [];
  }
});

export const getProjectBySlug = cache(async (slug: string) => {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (!project) return null;

    const media = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, project.id))
      .orderBy(asc(projectMedia.displayOrder), asc(projectMedia.id));

    // Exclude internal client number from public view
    const { clientNumber, ...publicProject } = project;

    return {
      ...publicProject,
      media,
    };
  } catch (error) {
    console.error("Failed to query project by slug:", error);
    return null;
  }
});

export const getActiveTeamMembers = cache(async () => {
  try {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.id));
  } catch (error) {
    console.error("Failed to query active team members:", error);
    return [];
  }
});

export const getActiveGalleryItems = cache(async (mediaType?: string) => {
  try {
    const conditions = [eq(gallery.isActive, true)];
    if (mediaType && mediaType !== "all") {
      conditions.push(eq(gallery.mediaType, mediaType));
    }

    return await db
      .select()
      .from(gallery)
      .where(and(...conditions))
      .orderBy(asc(gallery.displayOrder), desc(gallery.createdAt));
  } catch (error) {
    console.error("Failed to query active gallery items:", error);
    return [];
  }
});

export const getActiveQuotationRates = cache(async () => {
  try {
    return await db
      .select({
        id: serviceRates.id,
        serviceName: serviceRates.serviceName,
        baseRate: serviceRates.baseRate,
        rateType: serviceRates.rateType,
        defaultQty: serviceRates.defaultQty,
        displayOrder: serviceRates.displayOrder,
        unitName: units.unitName,
        unitSymbol: units.unitSymbol,
      })
      .from(serviceRates)
      .leftJoin(units, eq(serviceRates.unitId, units.id))
      .where(eq(serviceRates.isActive, true))
      .orderBy(asc(serviceRates.displayOrder), asc(serviceRates.id));
  } catch (error) {
    console.error("Failed to query active quotation rates:", error);
    return [];
  }
});

export const getPublicSettings = cache(async () => {
  try {
    const allSettings = await db.select().from(settings);
    const map: Record<string, string> = {};

    for (const item of allSettings) {
      if ((ALLOWED_SETTING_KEYS as readonly string[]).includes(item.keyName)) {
        map[item.keyName] = item.valueContent || "";
      }
    }

    return map;
  } catch (error) {
    console.error("Failed to query public settings:", error);
    return {};
  }
});
