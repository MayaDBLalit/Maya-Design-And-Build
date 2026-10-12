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
  fiveFactors,
  packages,
  packageSubservices,
  workflows,
  workflowSteps,
  calculators,
  calculatorSubservices,
  bhkConfigurations,
} from "@/db/schema";
import { eq, asc, desc, and, inArray } from "drizzle-orm";
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

export const getMainServiceBySlug = cache(async (slug: string) => {
  try {
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.slug, slug), eq(services.isActive, true)))
      .limit(1);

    if (!service) return null;

    // 1. Fetch active packages for this main service
    const pkgs = await db
      .select()
      .from(packages)
      .where(and(eq(packages.mainServiceId, service.id), eq(packages.isActive, true)))
      .orderBy(asc(packages.displayOrder), desc(packages.id));

    // 2. For each package, get assigned active SubServices and workflows
    const packageIds = pkgs.map((p) => p.id);
    let packageSubserviceMap: Record<number, number[]> = {};

    if (packageIds.length > 0) {
      const junctionRows = await db
        .select()
        .from(packageSubservices)
        .where(inArray(packageSubservices.packageId, packageIds));

      for (const row of junctionRows) {
        if (!packageSubserviceMap[row.packageId]) {
          packageSubserviceMap[row.packageId] = [];
        }
        packageSubserviceMap[row.packageId].push(row.subServiceId);
      }
    }

    // 3. Collect unique subService IDs to fetch their details & workflows
    const allSubServiceIds = Array.from(
      new Set(Object.values(packageSubserviceMap).flat())
    );

    let subServiceDetailsMap: Record<
      number,
      {
        id: number;
        serviceName: string;
        rateType: string;
        unitName: string | null;
        unitSymbol: string | null;
        workflow?: {
          id: number;
          title: string;
          steps: {
            id: number;
            stepNumber: number;
            title: string;
            details: string | null;
          }[];
        } | null;
      }
    > = {};

    if (allSubServiceIds.length > 0) {
      const subRows = await db
        .select({
          id: serviceRates.id,
          serviceName: serviceRates.serviceName,
          rateType: serviceRates.rateType,
          unitName: units.unitName,
          unitSymbol: units.unitSymbol,
        })
        .from(serviceRates)
        .leftJoin(units, eq(serviceRates.unitId, units.id))
        .where(
          and(
            inArray(serviceRates.id, allSubServiceIds),
            eq(serviceRates.isActive, true)
          )
        )
        .orderBy(asc(serviceRates.displayOrder), asc(serviceRates.id));

      for (const row of subRows) {
        subServiceDetailsMap[row.id] = {
          ...row,
          workflow: null,
        };
      }

      // Fetch active workflows for these subservices
      const wfRows = await db
        .select()
        .from(workflows)
        .where(
          and(
            inArray(workflows.subServiceId, allSubServiceIds),
            eq(workflows.isActive, true)
          )
        );

      if (wfRows.length > 0) {
        const wfIds = wfRows.map((w) => w.id);
        const stepRows = await db
          .select()
          .from(workflowSteps)
          .where(inArray(workflowSteps.workflowId, wfIds))
          .orderBy(asc(workflowSteps.stepNumber), asc(workflowSteps.displayOrder));

        for (const wf of wfRows) {
          if (subServiceDetailsMap[wf.subServiceId]) {
            subServiceDetailsMap[wf.subServiceId].workflow = {
              id: wf.id,
              title: wf.title,
              steps: stepRows
                .filter((s) => s.workflowId === wf.id)
                .map((s) => ({
                  id: s.id,
                  stepNumber: s.stepNumber,
                  title: s.title,
                  details: s.details,
                })),
            };
          }
        }
      }
    }

    // Assemble sanitized packages with strict rate privacy
    const sanitizedPackages = pkgs.map((pkg) => {
      const assignedIds = packageSubserviceMap[pkg.id] || [];
      const subServices = assignedIds
        .map((subId) => subServiceDetailsMap[subId])
        .filter(Boolean);

      return {
        id: pkg.id,
        packageName: pkg.packageName,
        showRatePublicly: pkg.showRatePublicly,
        isRecommended: pkg.isRecommended,
        // STRICT RATE PRIVACY: Only return rate if showRatePublicly is explicitly true
        packageRatePerSqFt: pkg.showRatePublicly
          ? Number(pkg.packageRatePerSqFt)
          : null,
        subServices,
      };
    });

    return {
      ...service,
      packages: sanitizedPackages,
    };
  } catch (error) {
    console.error("Failed to query main service by slug:", error);
    return null;
  }
});

export const getActiveCalculators = cache(async () => {
  try {
    return await db
      .select({
        id: calculators.id,
        title: calculators.title,
        slug: calculators.slug,
        displayOrder: calculators.displayOrder,
      })
      .from(calculators)
      .where(eq(calculators.isActive, true))
      .orderBy(asc(calculators.displayOrder), asc(calculators.id));
  } catch (error) {
    console.error("Failed to query active calculators:", error);
    return [];
  }
});

export const getCalculatorBySlug = cache(async (slug: string) => {
  try {
    const [calc] = await db
      .select()
      .from(calculators)
      .where(and(eq(calculators.slug, slug), eq(calculators.isActive, true)))
      .limit(1);

    if (!calc) return null;

    // Fetch assigned active SubServices
    const junctionRows = await db
      .select({
        subServiceId: calculatorSubservices.subServiceId,
      })
      .from(calculatorSubservices)
      .where(eq(calculatorSubservices.calculatorId, calc.id));

    const subServiceIds = junctionRows.map((r) => r.subServiceId);

    let subServices: {
      id: number;
      serviceName: string;
      rateType: string;
      defaultQty: string;
      unitName: string | null;
      unitSymbol: string | null;
    }[] = [];

    if (subServiceIds.length > 0) {
      // STRICT RATE PRIVACY: Base rate & minimum charge are omitted!
      subServices = await db
        .select({
          id: serviceRates.id,
          serviceName: serviceRates.serviceName,
          rateType: serviceRates.rateType,
          defaultQty: serviceRates.defaultQty,
          unitName: units.unitName,
          unitSymbol: units.unitSymbol,
        })
        .from(serviceRates)
        .leftJoin(units, eq(serviceRates.unitId, units.id))
        .where(
          and(
            inArray(serviceRates.id, subServiceIds),
            eq(serviceRates.isActive, true)
          )
        )
        .orderBy(asc(serviceRates.displayOrder), asc(serviceRates.id));
    }

    return {
      id: calc.id,
      title: calc.title,
      slug: calc.slug,
      subServices,
    };
  } catch (error) {
    console.error("Failed to query calculator by slug:", error);
    return null;
  }
});

export const getActiveBHKConfigurations = cache(async () => {
  try {
    return await db
      .select({
        id: bhkConfigurations.id,
        bhkNumber: bhkConfigurations.bhkNumber,
        displayOrder: bhkConfigurations.displayOrder,
      })
      .from(bhkConfigurations)
      .where(eq(bhkConfigurations.isActive, true))
      .orderBy(asc(bhkConfigurations.displayOrder), asc(bhkConfigurations.bhkNumber));
  } catch (error) {
    console.error("Failed to query active BHK configurations:", error);
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

export const CANONICAL_FACTOR_ORDER = ["space", "air", "fire", "water", "earth"] as const;

export const getFiveFactors = cache(async () => {
  try {
    const list = await db.select().from(fiveFactors);
    return list.sort((a, b) => {
      const idxA = CANONICAL_FACTOR_ORDER.indexOf(a.factorType as any);
      const idxB = CANONICAL_FACTOR_ORDER.indexOf(b.factorType as any);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  } catch (error) {
    console.error("Failed to query five factors:", error);
    return [];
  }
});
