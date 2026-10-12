import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { db } from "@/db";
import { packages, packageSubservices, services, serviceRates } from "@/db/schema";
import { packageSchema } from "@/lib/validations";
import { asc, eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const pkgs = await db
      .select({
        id: packages.id,
        packageName: packages.packageName,
        mainServiceId: packages.mainServiceId,
        mainServiceTitle: services.title,
        packageRatePerSqFt: packages.packageRatePerSqFt,
        displayOrder: packages.displayOrder,
        isActive: packages.isActive,
        showRatePublicly: packages.showRatePublicly,
        isRecommended: packages.isRecommended,
        createdAt: packages.createdAt,
        updatedAt: packages.updatedAt,
      })
      .from(packages)
      .leftJoin(services, eq(packages.mainServiceId, services.id))
      .orderBy(asc(packages.displayOrder), asc(packages.id));

    // Get subservices for each package
    const pkgIds = pkgs.map((p) => p.id);
    let junctionRows: { packageId: number; subServiceId: number; subServiceName: string | null }[] = [];

    if (pkgIds.length > 0) {
      junctionRows = await db
        .select({
          packageId: packageSubservices.packageId,
          subServiceId: packageSubservices.subServiceId,
          subServiceName: serviceRates.serviceName,
        })
        .from(packageSubservices)
        .leftJoin(serviceRates, eq(packageSubservices.subServiceId, serviceRates.id))
        .where(inArray(packageSubservices.packageId, pkgIds));
    }

    const packageMap = pkgs.map((pkg) => {
      const related = junctionRows.filter((j) => j.packageId === pkg.id);
      return {
        ...pkg,
        subServices: related.map((r) => ({
          id: r.subServiceId,
          name: r.subServiceName || "",
        })),
        subServicesCount: related.length,
      };
    });

    return NextResponse.json({ success: true, packages: packageMap });
  } catch (error) {
    console.error("Admin packages GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const validation = packageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify Main Service exists
    const [mainService] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.id, data.mainServiceId))
      .limit(1);

    if (!mainService) {
      return NextResponse.json(
        { error: "Selected Main Service does not exist" },
        { status: 400 }
      );
    }

    // Verify subservices belong to this Main Service
    if (data.subServiceIds && data.subServiceIds.length > 0) {
      const validSubservices = await db
        .select({ id: serviceRates.id })
        .from(serviceRates)
        .where(
          inArray(serviceRates.id, data.subServiceIds)
        );

      if (validSubservices.length !== data.subServiceIds.length) {
        return NextResponse.json(
          { error: "One or more selected SubServices do not exist" },
          { status: 400 }
        );
      }
    }

    const rateStr = String(data.packageRatePerSqFt);

    const insertResult = await db.transaction(async (tx) => {
      // Business rule: If isRecommended is true, unset any existing recommended package for this Main Service
      if (data.isRecommended) {
        await tx
          .update(packages)
          .set({ isRecommended: false })
          .where(eq(packages.mainServiceId, data.mainServiceId));
      }

      const [newPkg] = await tx.insert(packages).values({
        packageName: data.packageName,
        mainServiceId: data.mainServiceId,
        packageRatePerSqFt: rateStr,
        packagePriority: "standard", // backward compatibility default
        displayOrder: data.displayOrder,
        isActive: data.isActive,
        showRatePublicly: data.showRatePublicly,
        isRecommended: data.isRecommended ?? false,
      });

      const pkgId = newPkg.insertId;

      if (data.subServiceIds && data.subServiceIds.length > 0) {
        await tx.insert(packageSubservices).values(
          data.subServiceIds.map((subId) => ({
            packageId: pkgId,
            subServiceId: subId,
          }))
        );
      }

      return pkgId;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Package created successfully",
        packageId: insertResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin package create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create package" },
      { status: 500 }
    );
  }
}
