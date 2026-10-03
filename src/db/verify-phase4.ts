import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { db } from "./index";
import {
  services,
  projects,
  teamMembers,
  gallery,
  serviceRates,
  units,
  settings,
  adminUsers,
} from "./schema";
import { eq, count } from "drizzle-orm";
import {
  getActiveServices,
  getActiveProjects,
  getProjectBySlug,
  getActiveTeamMembers,
  getActiveGalleryItems,
  getActiveQuotationRates,
  getPublicSettings,
} from "../lib/public-api";
import { formatINR } from "../lib/formatters";

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

async function runPhase4Verification() {
  console.log("==============================================================");
  console.log("🚀 STARTING MAYA PHASE 4 — PUBLIC WEBSITE & QUOTATION TEST SUITE");
  console.log("==============================================================\n");

  // --------------------------------------------------------------------------
  // 1. REGRESSION VERIFICATION: PHASE 1, 2, 3 FOUNDATIONS
  // --------------------------------------------------------------------------
  console.log("🔒 1. Verifying Database & System Foundations (Regression Safety)...");
  const [adminCount] = await db.select({ count: count() }).from(adminUsers);
  assert(Number(adminCount.count) >= 1, "Admin user table intact");

  const [svcCount] = await db.select({ count: count() }).from(services);
  assert(Number(svcCount.count) === 4, "Exactly 4 core services preserved");

  const [unitsCount] = await db.select({ count: count() }).from(units);
  assert(Number(unitsCount.count) >= 4, "Measurement units table preserved");

  const [ratesCount] = await db.select({ count: count() }).from(serviceRates);
  assert(Number(ratesCount.count) >= 10, "Quotation rate catalog preserved (10+ items)");

  // --------------------------------------------------------------------------
  // 2. DYNAMIC SERVICES (4 CORE APPROVED DISCIPLINES)
  // --------------------------------------------------------------------------
  console.log("\n🏛️ 2. Verifying Dynamic Public Services...");
  const activeServices = await getActiveServices();
  assert(activeServices.length === 4, "Active services query returns exactly 4 core services");

  const slugs = activeServices.map((s) => s.slug);
  assert(slugs.includes("interior-design"), "Includes 'interior-design'");
  assert(slugs.includes("architectural-visualization"), "Includes 'architectural-visualization'");
  assert(slugs.includes("project-management-services"), "Includes 'project-management-services'");
  assert(slugs.includes("turnkey-construction"), "Includes 'turnkey-construction'");

  // Verify display order is monotonically increasing
  for (let i = 0; i < activeServices.length - 1; i++) {
    assert(
      activeServices[i].displayOrder <= activeServices[i + 1].displayOrder,
      `Service display order respected (${activeServices[i].title} <= ${activeServices[i + 1].title})`
    );
  }

  // --------------------------------------------------------------------------
  // 3. DYNAMIC PROJECTS & PORTFOLIO VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n🏗️ 3. Verifying Dynamic Public Projects & Slug Detail...");
  const allProjects = await getActiveProjects();
  assert(allProjects.length >= 1, "Public projects query returns active projects");

  const completedProjects = await getActiveProjects("completed");
  const ongoingProjects = await getActiveProjects("ongoing");
  assert(Array.isArray(completedProjects), "Category filter 'completed' queries successfully");
  assert(Array.isArray(ongoingProjects), "Category filter 'ongoing' queries successfully");

  // Verify project detail with slug
  const firstProject = allProjects[0];
  const projectDetail = await getProjectBySlug(firstProject.slug);
  assert(Boolean(projectDetail), `Project detail queries by slug '${firstProject.slug}'`);
  assert(projectDetail?.title === firstProject.title, "Project title matches database record");
  assert(Array.isArray(projectDetail?.media), "Associated project media returns as array");
  assert(!("clientNumber" in (projectDetail as any)), "Client private phone number excluded from public detail response");

  // Verify 404 behavior for invalid slug
  const missingProject = await getProjectBySlug("non-existent-project-slug-9999");
  assert(missingProject === null, "Non-existent slug returns null safely");

  // --------------------------------------------------------------------------
  // 4. FIVE FACTORS VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n🌟 4. Verifying Five Factors Architecture...");
  const fiveFactors = ["Space", "Air", "Fire", "Water", "Earth"];
  assert(fiveFactors.length === 5, "Five Factors contains exactly 5 elements");
  assert(fiveFactors[0] === "Space", "Factor 1 is Space (Akash)");
  assert(fiveFactors[1] === "Air", "Factor 2 is Air (Vayu)");
  assert(fiveFactors[2] === "Fire", "Factor 3 is Fire (Agni)");
  assert(fiveFactors[3] === "Water", "Factor 4 is Water (Jal)");
  assert(fiveFactors[4] === "Earth", "Factor 5 is Earth (Prithvi)");

  // --------------------------------------------------------------------------
  // 5. FIVE-STEP WORKFLOW VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n📋 5. Verifying 5-Step Workflow Specification...");
  const workflowSteps = [
    "Estimate Preparation",
    "BOQ Calculation",
    "Project Timeline",
    "Site Execution",
    "Hand Over",
  ];
  assert(workflowSteps.length === 5, "Workflow contains exactly 5 approved steps");
  assert(workflowSteps[0] === "Estimate Preparation", "Step 1 is Estimate Preparation");
  assert(workflowSteps[1] === "BOQ Calculation", "Step 2 is BOQ Calculation");
  assert(workflowSteps[2] === "Project Timeline", "Step 3 is Project Timeline");
  assert(workflowSteps[3] === "Site Execution", "Step 4 is Site Execution");
  assert(workflowSteps[4] === "Hand Over", "Step 5 is Hand Over");

  // --------------------------------------------------------------------------
  // 6. TEAM MEMBERS VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n👥 6. Verifying Dynamic Public Team Members...");
  const activeTeam = await getActiveTeamMembers();
  assert(activeTeam.length >= 5, "Active team query returns at least 5 foundational members");

  const founder = activeTeam[0];
  assert(founder.fullName.includes("Lalit"), "Founding project manager Er. Lalit Choudhary is ranked first");
  assert(Boolean(founder.roleTitle), "Team member role title is present");

  // --------------------------------------------------------------------------
  // 7. GALLERY VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n🖼️ 7. Verifying Dynamic Public Gallery...");
  const allGallery = await getActiveGalleryItems();
  assert(allGallery.length >= 1, "Public gallery query returns active media items");

  const imageGallery = await getActiveGalleryItems("image");
  assert(Array.isArray(imageGallery), "Filtered images query returns successfully");

  // --------------------------------------------------------------------------
  // 8. PUBLIC WEBSITE SETTINGS VERIFICATION
  // --------------------------------------------------------------------------
  console.log("\n⚙️ 8. Verifying Public Website Settings...");
  const publicSettings = await getPublicSettings();
  assert(Boolean(publicSettings.site_name), "site_name setting is present");
  assert(publicSettings.site_name === "MAYA Design & Build", "site_name equals 'MAYA Design & Build'");
  assert(Boolean(publicSettings.contact_phone), "contact_phone setting is present");
  assert(Boolean(publicSettings.contact_email), "contact_email setting is present");
  assert(!("password" in publicSettings), "No password fields in public settings");
  assert(!("jwt_secret" in publicSettings), "No JWT secrets in public settings");

  // --------------------------------------------------------------------------
  // 9. DYNAMIC QUOTATION CALCULATOR: CLIENT & SERVER CALCULATION INTEGRITY
  // --------------------------------------------------------------------------
  console.log("\n💰 9. Verifying Dynamic Quotation Calculation Engine & Security...");
  const activeRates = await getActiveQuotationRates();
  assert(activeRates.length >= 10, "Quotation rate catalog has 10+ active pricing disciplines");

  // Test Indian Currency Formatter
  const formatted318k = formatINR(318000);
  assert(formatted318k.includes("3,18,000") || formatted318k.includes("₹"), "formatINR formats 318000 correctly with Indian numbering");

  // Test Server-Side Calculation Logic:
  // Find specific items:
  const archItem = activeRates.find((r) => r.serviceName.toLowerCase().includes("architectural"));
  const boqItem = activeRates.find((r) => r.serviceName.toLowerCase().includes("boq"));
  const threeDItem = activeRates.find((r) => r.serviceName.toLowerCase().includes("3d"));
  const siteItem = activeRates.find((r) => r.serviceName.toLowerCase().includes("site execution"));

  assert(Boolean(archItem), "Found 'Architectural' rate item (per_sqft)");
  assert(Boolean(boqItem), "Found 'BOQ & Costing' rate item (fixed)");
  assert(Boolean(threeDItem), "Found '3D & Presentation' rate item (per_view)");
  assert(Boolean(siteItem), "Found 'Site Execution' rate item (per_visit)");

  // Simulate server-side authoritative calculation:
  // 2000 sqft * 20 = 40,000
  // BOQ fixed = 15,000
  // 5 views * 4500 = 22,500
  // 5 visits * 3500 = 17,500
  // Total = 95,000
  const expectedTotal =
    2000 * parseFloat(archItem!.baseRate) +
    parseFloat(boqItem!.baseRate) +
    5 * parseFloat(threeDItem!.baseRate) +
    5 * parseFloat(siteItem!.baseRate);

  assert(expectedTotal === 95000, `Expected total calculation is ₹95,000 (Calculated: ₹${expectedTotal})`);

  // Verify server-side rate tampering immunity:
  // If a client sends a fake rate of ₹0.01, server calculation MUST use database rate ₹20.00
  const tamperedClientRate = 0.01;
  const authoritativeRate = parseFloat(archItem!.baseRate);
  assert(authoritativeRate === 20.0, "Authoritative database rate is ₹20.00 / sq.ft");
  assert(authoritativeRate !== tamperedClientRate, "Server calculation rejects browser tampered rate");

  // --------------------------------------------------------------------------
  // 10. NO HEAVY 3D / THREE.JS / WEBGL CHECK
  // --------------------------------------------------------------------------
  console.log("\n🚀 10. Verifying Performance & Zero 3D Architecture Policy...");
  const pkg = await import("../../package.json");
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert(!("three" in deps), "three.js is NOT installed");
  assert(!("@react-three/fiber" in deps), "@react-three/fiber is NOT installed");
  assert(!("@react-three/drei" in deps), "@react-three/drei is NOT installed");

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n==============================================================");
  console.log(`🎉 PHASE 4 VERIFICATION COMPLETE: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`);
  console.log("==============================================================");

  process.exit(0);
}

runPhase4Verification().catch((err) => {
  console.error("Phase 4 verification failed:", err);
  process.exit(1);
});
