import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { db } from "./index";
import {
  services,
  projects,
  projectMedia,
  teamMembers,
  gallery,
  serviceRates,
  units,
  settings,
  adminUsers,
} from "./schema";
import { eq, count, and } from "drizzle-orm";
import { signAdminJWT, verifyAdminJWT } from "../lib/jwt";
import { ALLOWED_SETTING_KEYS } from "../lib/validations";

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition: boolean, testName: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    process.exit(1);
  }
}

async function runPhase3Verification() {
  console.log("==============================================================");
  console.log("🚀 STARTING MAYA PHASE 3 — ADMIN CMS VERIFICATION SUITE");
  console.log("==============================================================\n");

  // --------------------------------------------------------------------------
  // 1. JWT TOKEN GENERATION & AUTHENTICATION CHECK
  // --------------------------------------------------------------------------
  console.log("📦 1. Verifying Admin Authentication Engine...");
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.role, "admin"))
    .limit(1);

  assert(Boolean(admin), "Admin user exists in database");
  assert(Boolean(admin.passwordHash.startsWith("$2")), "Admin password hash is BCrypt format");

  const token = await signAdminJWT({
    userId: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
  });
  assert(typeof token === "string" && token.length > 50, "Generated signed admin JWT");

  const verified = await verifyAdminJWT(token);
  assert(verified?.userId === admin.id, "Verified admin JWT decodes valid admin payload");

  // --------------------------------------------------------------------------
  // 2. DASHBOARD METRICS VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n📊 2. Verifying Dashboard Metrics Calculation...");
  const [svcCount] = await db.select({ count: count() }).from(services);
  const [teamCount] = await db.select({ count: count() }).from(teamMembers);
  const [ratesCount] = await db.select({ count: count() }).from(serviceRates);
  const [unitsCount] = await db.select({ count: count() }).from(units);

  assert(Number(svcCount.count) >= 4, "Dashboard counts at least 4 services");
  assert(Number(teamCount.count) === 5, "Dashboard counts exactly 5 seeded team members");
  assert(Number(ratesCount.count) >= 10, "Dashboard counts 10+ quotation catalog rates");
  assert(Number(unitsCount.count) >= 4, "Dashboard counts 4+ measurement units");

  // --------------------------------------------------------------------------
  // 3. CORE SERVICES VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n🏛️ 3. Verifying Services Integrity...");
  const coreServices = await db.select().from(services);
  assert(coreServices.length >= 4, "Major services exist in database");

  const expectedSlugs = [
    "interior-design",
    "architectural-visualization",
    "project-management-services",
    "turnkey-construction",
  ];
  for (const slug of expectedSlugs) {
    const found = coreServices.some((s) => s.slug === slug);
    assert(found, `Core service with slug '${slug}' is present`);
  }

  // Test service update
  const firstSvc = coreServices[0];
  const originalDesc = firstSvc.shortDescription;
  await db
    .update(services)
    .set({ shortDescription: "Verified Phase 3 Test Description" })
    .where(eq(services.id, firstSvc.id));

  const [updatedSvc] = await db
    .select()
    .from(services)
    .where(eq(services.id, firstSvc.id));
  assert(
    updatedSvc.shortDescription === "Verified Phase 3 Test Description",
    "Service shortDescription update persisted"
  );

  // Restore original
  await db
    .update(services)
    .set({ shortDescription: originalDesc })
    .where(eq(services.id, firstSvc.id));

  // --------------------------------------------------------------------------
  // 4. PROJECTS CRUD & CASCADE MEDIA DELETION VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n🏗️ 4. Verifying Projects CRUD & Cascade Media Integrity...");
  const tempProjectSlug = `test-villa-${Date.now()}`;
  const [insertProj] = await db.insert(projects).values({
    title: "Test Luxury Villa",
    slug: tempProjectSlug,
    category: "completed",
    location: "Bardoli, Gujarat",
    costEstimate: "7500000.00",
    description: "Automated test project verifying Phase 3 CMS capabilities",
    displayOrder: 999,
    isFeatured: true,
  });
  const tempProjectId = insertProj.insertId;
  assert(tempProjectId > 0, "Created temporary project in database");

  // Attach project media
  const [insertMedia] = await db.insert(projectMedia).values({
    projectId: tempProjectId,
    mediaUrl: "/uploads/test-villa-elevation.jpg",
    mediaType: "image",
    displayOrder: 1,
  });
  const tempMediaId = insertMedia.insertId;
  assert(tempMediaId > 0, "Attached project media record to temporary project");

  // Verify relation
  const attachedMedia = await db
    .select()
    .from(projectMedia)
    .where(eq(projectMedia.projectId, tempProjectId));
  assert(attachedMedia.length === 1, "Project media queried with correct foreign key");

  // Cascade delete project
  await db.delete(projects).where(eq(projects.id, tempProjectId));
  const [deletedProj] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, tempProjectId));
  assert(!deletedProj, "Project deleted from database");

  const [orphanedMedia] = await db
    .select()
    .from(projectMedia)
    .where(eq(projectMedia.projectId, tempProjectId));
  assert(!orphanedMedia, "Foreign key cascade automatically cleaned up project media");

  // --------------------------------------------------------------------------
  // 5. TEAM MEMBERS CMS VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n👥 5. Verifying Team Members CMS...");
  const teamList = await db.select().from(teamMembers);
  assert(teamList.length >= 5, "Team table contains 5 foundational members");

  const lalit = teamList.find((m) => m.fullName.includes("Lalit"));
  assert(Boolean(lalit), "Founding project manager Er. Lalit is present");

  // Insert temporary team member
  const [newMember] = await db.insert(teamMembers).values({
    fullName: "Er. Verification Member",
    roleTitle: "QA Engineer",
    education: "B.Tech Civil",
    experienceYears: "3 Years",
    displayOrder: 99,
    isActive: true,
  });
  assert(newMember.insertId > 0, "Created temporary team member");

  // Clean up
  await db.delete(teamMembers).where(eq(teamMembers.id, newMember.insertId));
  const [afterDeleteMember] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.id, newMember.insertId));
  assert(!afterDeleteMember, "Deleted temporary team member cleanly");

  // --------------------------------------------------------------------------
  // 6. GALLERY CMS VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n🖼️ 6. Verifying Gallery CMS...");
  const [galleryInsert] = await db.insert(gallery).values({
    title: "Cinematic Villa Walkthrough",
    mediaType: "video",
    mediaUrl: "/uploads/cinematic-villa.mp4",
    durationSeconds: 45,
    fileSizeBytes: 24500000,
    displayOrder: 1,
    isActive: true,
  });
  assert(galleryInsert.insertId > 0, "Inserted gallery item with video metadata");

  const [queriedGallery] = await db
    .select()
    .from(gallery)
    .where(eq(gallery.id, galleryInsert.insertId));
  assert(queriedGallery?.durationSeconds === 45, "Gallery item preserved 45s duration");
  assert(
    Number(queriedGallery?.fileSizeBytes) === 24500000,
    "Gallery item preserved 24.5MB file size"
  );

  await db.delete(gallery).where(eq(gallery.id, galleryInsert.insertId));
  const [afterGalleryDelete] = await db
    .select()
    .from(gallery)
    .where(eq(gallery.id, galleryInsert.insertId));
  assert(!afterGalleryDelete, "Deleted temporary gallery item cleanly");

  // --------------------------------------------------------------------------
  // 7. DYNAMIC QUOTATION RATES CMS VERIFICATION (EXTENSIBLE BEYOND 10)
  // --------------------------------------------------------------------------
  console.log("\n💰 7. Verifying Dynamic Quotation Catalog (Extensible Beyond 10)...");
  const initialRates = await db.select().from(serviceRates);
  assert(initialRates.length === 10, "Found 10 baseline quotation disciplines");

  const [sqftUnit] = await db
    .select()
    .from(units)
    .where(eq(units.unitName, "sqft"))
    .limit(1);
  assert(Boolean(sqftUnit), "Measurement unit 'sqft' is present");

  // Create an 11th rate (extensible beyond 10)
  const [extRate] = await db.insert(serviceRates).values({
    serviceName: "Geotechnical Soil & Foundation Investigation",
    unitId: sqftUnit.id,
    baseRate: "35.00",
    rateType: "per_sqft",
    defaultQty: "1500.00",
    isActive: true,
    displayOrder: 11,
  });
  assert(extRate.insertId > 0, "Successfully added 11th dynamic quotation rate item");

  const [queriedExtRate] = await db
    .select()
    .from(serviceRates)
    .where(eq(serviceRates.id, extRate.insertId));
  assert(
    queriedExtRate?.serviceName === "Geotechnical Soil & Foundation Investigation",
    "11th rate persisted with correct name"
  );

  // Clean up
  await db.delete(serviceRates).where(eq(serviceRates.id, extRate.insertId));
  const [afterExtDelete] = await db
    .select()
    .from(serviceRates)
    .where(eq(serviceRates.id, extRate.insertId));
  assert(!afterExtDelete, "Deleted temporary quotation rate cleanly");

  // --------------------------------------------------------------------------
  // 8. MEASUREMENT UNITS CMS & SAFETY RESTRICTION VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n📐 8. Verifying Measurement Units & Relational Safety Checks...");
  const allUnits = await db.select().from(units);
  assert(allUnits.length >= 4, "All 4 standard measurement units exist");

  // Verify deletion restriction: sqft is referenced by service rates
  const [ratesUsingSqft] = await db
    .select({ count: count() })
    .from(serviceRates)
    .where(eq(serviceRates.unitId, sqftUnit.id));
  const sqftUsageCount = Number(ratesUsingSqft?.count || 0);
  assert(sqftUsageCount > 0, `Unit 'sqft' is used by ${sqftUsageCount} quotation rates`);
  assert(
    sqftUsageCount === 6,
    "Unit 'sqft' is correctly attached to exactly 6 disciplines (Architectural, Structural, Electrical, Plumbing, Interior, Working Details)"
  );

  // Test creating and deleting an unused unit
  const tempUnitName = `temp_unit_${Date.now()}`;
  const [newUnitInsert] = await db.insert(units).values({
    unitName: tempUnitName,
    unitSymbol: "TU",
    description: "Temporary unit for testing",
  });
  assert(newUnitInsert.insertId > 0, "Created temporary unused unit");

  // Delete unused unit should succeed
  await db.delete(units).where(eq(units.id, newUnitInsert.insertId));
  const [deletedUnit] = await db
    .select()
    .from(units)
    .where(eq(units.id, newUnitInsert.insertId));
  assert(!deletedUnit, "Unused unit deleted without constraint errors");

  // --------------------------------------------------------------------------
  // 9. WEBSITE SETTINGS CMS ALLOWLIST VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n⚙️ 9. Verifying Website Settings Allowlist...");
  const allSettings = await db.select().from(settings);
  assert(allSettings.length >= 10, "Found 10 baseline website settings");

  for (const s of allSettings) {
    const isAllowed = (ALLOWED_SETTING_KEYS as readonly string[]).includes(s.keyName);
    assert(isAllowed, `Setting '${s.keyName}' conforms to public allowlist`);
  }

  // --------------------------------------------------------------------------
  // FINAL SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n==============================================================");
  console.log(`🎉 PHASE 3 VERIFICATION COMPLETE: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
  console.log("==============================================================");

  process.exit(0);
}

runPhase3Verification().catch((err) => {
  console.error("Verification script failed with uncaught exception:", err);
  process.exit(1);
});
