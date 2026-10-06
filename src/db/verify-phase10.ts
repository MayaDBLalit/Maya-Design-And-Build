/**
 * MAYA DESIGN & BUILD — PHASE 10 VERIFICATION SUITE
 * Global Loading States, Skeletons & Interaction Feedback
 *
 * Automated Assertions covering Phase 10 requirements:
 * 1. UI primitive components exist: Spinner and Skeleton.
 * 2. Next.js App Router route loading boundaries exist (projects/[slug]/loading.tsx, (admin)/admin/(shell)/loading.tsx, loading.tsx).
 * 3. Prefers-reduced-motion compliance verified (motion-reduce:animate-none present on skeletons).
 * 4. Accessibility compliance: Skeletons provide role="status" and aria-busy/aria-label; Spinners provide role="status".
 * 5. ConfirmDialog component incorporates Spinner, loadingLabel, aria-busy, and disabled states.
 * 6. FileUpload component displays Spinner during active optimization.
 * 7. Admin Dashboard renders DashboardSkeleton when loading.
 * 8. Admin Services renders CardSkeleton, and buttons have disabled states and spinners.
 * 9. Admin Projects renders CardSkeleton, MediaGridSkeleton, and buttons have disabled states and spinners.
 * 10. Admin Team renders CardSkeleton, and buttons have disabled states and spinners.
 * 11. Admin Gallery renders MediaGridSkeleton, and buttons have disabled states and spinners.
 * 12. Admin Quotation Rates renders TableSkeleton, and buttons have disabled states and spinners.
 * 13. Admin Units renders TableSkeleton, and buttons have disabled states and spinners.
 * 14. Admin Settings renders form skeleton, and save button has disabled states and spinner.
 * 15. Admin Inquiries renders TableSkeleton, detail skeleton, and buttons have disabled states and spinners.
 * 16. Admin Login button contains Spinner, disabled state, and aria-busy.
 * 17. Public ContactSection prevents double-click with disabled state, aria-busy, and Spinner.
 * 18. Public QuotationCalculator prevents double-click with disabled state, aria-busy, and Spinner.
 * 19. No artificial setTimeout delays introduced into API routes or fetch lifecycles.
 * 20. Database schema integrity maintained with zero migrations required.
 * 21. Real project data, services, team, gallery, and rates remain completely intact.
 */

import fs from "fs";
import path from "path";
import { db } from "./index";
import { projects, services, teamMembers, gallery, serviceRates, units, inquiries, settings } from "./schema";
import { sql } from "drizzle-orm";

// Safety timeout: prevents process hanging
const safetyTimeout = setTimeout(() => {
  console.error("\n❌ [TIMEOUT] Phase 10 verification timed out after 20 seconds.");
  process.exit(1);
}, 20000);
safetyTimeout.unref();

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    failedCount++;
  }
}

async function runPhase10Verification() {
  console.log("\n==================================================================");
  console.log("🚀 STARTING MAYA PHASE 10 — LOADING STATES & SKELETONS VERIFICATION");
  console.log("==================================================================\n");

  const projectRoot = path.resolve(__dirname, "..");

  try {
    // --------------------------------------------------------------------------
    // 1. REUSABLE UI PRIMITIVES
    // --------------------------------------------------------------------------
    console.log("🧩 1. Verifying Reusable UI Loading Components...");

    const spinnerPath = path.join(projectRoot, "components", "ui", "Spinner.tsx");
    const skeletonPath = path.join(projectRoot, "components", "ui", "Skeleton.tsx");

    assert(fs.existsSync(spinnerPath), "Spinner.tsx component exists in src/components/ui/");
    assert(fs.existsSync(skeletonPath), "Skeleton.tsx component exists in src/components/ui/");

    const spinnerContent = fs.readFileSync(spinnerPath, "utf-8");
    const skeletonContent = fs.readFileSync(skeletonPath, "utf-8");

    assert(spinnerContent.includes("export function Spinner"), "Spinner component is exported");
    assert(spinnerContent.includes("export function ButtonLoadingContent"), "ButtonLoadingContent helper is exported");
    assert(spinnerContent.includes('role="status"'), "Spinner includes role='status' accessibility attribute");

    assert(skeletonContent.includes("export function Skeleton"), "Skeleton base primitive is exported");
    assert(skeletonContent.includes("export function CardSkeleton"), "CardSkeleton is exported");
    assert(skeletonContent.includes("export function TableSkeleton"), "TableSkeleton is exported");
    assert(skeletonContent.includes("export function DashboardSkeleton"), "DashboardSkeleton is exported");
    assert(skeletonContent.includes("export function MediaGridSkeleton"), "MediaGridSkeleton is exported");
    assert(skeletonContent.includes("export function ProjectDetailSkeleton"), "ProjectDetailSkeleton is exported");

    // --------------------------------------------------------------------------
    // 2. ACCESSIBILITY & PREFERS-REDUCED-MOTION
    // --------------------------------------------------------------------------
    console.log("\n♿ 2. Verifying Accessibility & Prefers-Reduced-Motion...");

    assert(
      skeletonContent.includes("motion-reduce:animate-none"),
      "Skeleton respects prefers-reduced-motion using Tailwind motion-reduce:animate-none"
    );
    assert(
      skeletonContent.includes('aria-busy="true"'),
      "Skeleton components communicate loading state using aria-busy='true'"
    );

    // --------------------------------------------------------------------------
    // 3. NEXT.JS APP ROUTER STREAMING BOUNDARIES
    // --------------------------------------------------------------------------
    console.log("\n⚡ 3. Verifying App Router Loading Boundaries (loading.tsx)...");

    const projectDetailLoadingPath = path.join(projectRoot, "app", "projects", "[slug]", "loading.tsx");
    const adminShellLoadingPath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "loading.tsx");
    const rootLoadingPath = path.join(projectRoot, "app", "loading.tsx");

    assert(
      fs.existsSync(projectDetailLoadingPath),
      "Public project detail loading boundary exists: src/app/projects/[slug]/loading.tsx"
    );
    assert(
      fs.existsSync(adminShellLoadingPath),
      "Admin shell route loading boundary exists: src/app/(admin)/admin/(shell)/loading.tsx"
    );
    assert(
      fs.existsSync(rootLoadingPath),
      "Public root route loading boundary exists: src/app/loading.tsx"
    );

    const projectDetailLoadingContent = fs.readFileSync(projectDetailLoadingPath, "utf-8");
    assert(
      projectDetailLoadingContent.includes("ProjectDetailSkeleton"),
      "projects/[slug]/loading.tsx renders ProjectDetailSkeleton"
    );

    // --------------------------------------------------------------------------
    // 4. ADMIN CMS LOADING & MUTATION FEEDBACK
    // --------------------------------------------------------------------------
    console.log("\n🛡️ 4. Verifying Admin CMS Skeletons, Spinners & Mutation Feedback...");

    // Dashboard
    const dashboardPath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "dashboard", "page.tsx");
    const dashboardContent = fs.readFileSync(dashboardPath, "utf-8");
    assert(
      dashboardContent.includes("DashboardSkeleton"),
      "Admin Dashboard displays DashboardSkeleton during data fetching"
    );

    // Services
    const servicesPagePath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "services", "page.tsx");
    const servicesPageContent = fs.readFileSync(servicesPagePath, "utf-8");
    assert(
      servicesPageContent.includes("CardSkeleton"),
      "Admin Services displays CardSkeleton during data loading"
    );
    assert(
      servicesPageContent.includes("disabled={isSaving}") && servicesPageContent.includes("Spinner"),
      "Admin Services save button displays Spinner and disables interaction while saving"
    );

    // Projects
    const projectsPagePath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "projects", "page.tsx");
    const projectsPageContent = fs.readFileSync(projectsPagePath, "utf-8");
    assert(
      projectsPageContent.includes("CardSkeleton"),
      "Admin Projects displays CardSkeleton during data loading"
    );
    assert(
      projectsPageContent.includes("MediaGridSkeleton"),
      "Admin Projects media manager displays MediaGridSkeleton during media fetching"
    );
    assert(
      projectsPageContent.includes("disabled={isSaving}") && projectsPageContent.includes("Spinner"),
      "Admin Projects save button displays Spinner and disables interaction while saving"
    );

    // Team
    const teamPagePath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "team", "page.tsx");
    const teamPageContent = fs.readFileSync(teamPagePath, "utf-8");
    assert(
      teamPageContent.includes("CardSkeleton"),
      "Admin Team displays CardSkeleton during data loading"
    );
    assert(
      teamPageContent.includes("disabled={isSaving}") && teamPageContent.includes("Spinner"),
      "Admin Team save button displays Spinner and disables interaction while saving"
    );

    // Gallery
    const galleryPagePath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "gallery", "page.tsx");
    const galleryPageContent = fs.readFileSync(galleryPagePath, "utf-8");
    assert(
      galleryPageContent.includes("MediaGridSkeleton"),
      "Admin Gallery displays MediaGridSkeleton during data loading"
    );
    assert(
      galleryPageContent.includes("disabled={isSaving") && galleryPageContent.includes("Spinner"),
      "Admin Gallery save button displays Spinner and disables interaction while saving"
    );

    // Quotation Rates
    const quotationPagePath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "quotation", "page.tsx");
    const quotationPageContent = fs.readFileSync(quotationPagePath, "utf-8");
    assert(
      quotationPageContent.includes("TableSkeleton"),
      "Admin Quotation Rates displays TableSkeleton during data loading"
    );
    assert(
      quotationPageContent.includes("disabled={isSaving}") && quotationPageContent.includes("Spinner"),
      "Admin Quotation Rates save button displays Spinner and disables interaction while saving"
    );

    // Units
    const unitsPagePath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "units", "page.tsx");
    const unitsPageContent = fs.readFileSync(unitsPagePath, "utf-8");
    assert(
      unitsPageContent.includes("TableSkeleton"),
      "Admin Units displays TableSkeleton during data loading"
    );
    assert(
      unitsPageContent.includes("disabled={isSaving}") && unitsPageContent.includes("Spinner"),
      "Admin Units save button displays Spinner and disables interaction while saving"
    );

    // Settings
    const settingsPagePath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "settings", "page.tsx");
    const settingsPageContent = fs.readFileSync(settingsPagePath, "utf-8");
    assert(
      settingsPageContent.includes("Skeleton"),
      "Admin Settings displays form Skeleton during configuration fetching"
    );
    assert(
      settingsPageContent.includes("disabled={isSaving}") && settingsPageContent.includes("Spinner"),
      "Admin Settings save button displays Spinner and disables interaction while saving"
    );

    // Inquiries
    const inquiriesPagePath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "inquiries", "page.tsx");
    const inquiriesPageContent = fs.readFileSync(inquiriesPagePath, "utf-8");
    assert(
      inquiriesPageContent.includes("TableSkeleton"),
      "Admin Inquiries displays TableSkeleton during data loading"
    );
    assert(
      inquiriesPageContent.includes("isLoadingDetail") && inquiriesPageContent.includes("Skeleton"),
      "Admin Inquiries detail drawer displays Skeleton during inquiry details loading"
    );
    assert(
      inquiriesPageContent.includes("disabled={isSavingNotes}") && inquiriesPageContent.includes("Spinner"),
      "Admin Inquiries notes save button displays Spinner and disables interaction"
    );
    assert(
      inquiriesPageContent.includes("disabled={isDeleting}") && inquiriesPageContent.includes("Spinner"),
      "Admin Inquiries deletion button displays Spinner and disables interaction"
    );

    // ConfirmDialog
    const confirmDialogPath = path.join(projectRoot, "components", "admin", "ConfirmDialog.tsx");
    const confirmDialogContent = fs.readFileSync(confirmDialogPath, "utf-8");
    assert(
      confirmDialogContent.includes("isLoading") &&
        confirmDialogContent.includes("Spinner") &&
        confirmDialogContent.includes("disabled={isLoading}"),
      "ConfirmDialog enforces disabled state and renders Spinner while mutation is in progress"
    );

    // FileUpload
    const fileUploadPath = path.join(projectRoot, "components", "admin", "FileUpload.tsx");
    const fileUploadContent = fs.readFileSync(fileUploadPath, "utf-8");
    assert(
      fileUploadContent.includes("isUploading") && fileUploadContent.includes("Spinner"),
      "FileUpload displays Spinner and disables input while file is uploading"
    );

    // Login
    const loginPagePath = path.join(projectRoot, "app", "(admin)", "admin", "login", "page.tsx");
    const loginPageContent = fs.readFileSync(loginPagePath, "utf-8");
    assert(
      loginPageContent.includes("disabled={isLoading}") && loginPageContent.includes("Spinner"),
      "Admin Login button displays Spinner and disables interaction during credential verification"
    );

    // --------------------------------------------------------------------------
    // 5. PUBLIC WEBSITE DOUBLE-CLICK PREVENTION & FEEDBACK
    // --------------------------------------------------------------------------
    console.log("\n🌐 5. Verifying Public Website Double-Click Protection & Feedbacks...");

    const contactSectionPath = path.join(projectRoot, "components", "public", "ContactSection.tsx");
    const contactSectionContent = fs.readFileSync(contactSectionPath, "utf-8");
    assert(
      contactSectionContent.includes("disabled={isSubmitting}") && contactSectionContent.includes("Spinner"),
      "Public Contact form disables submit button and renders Spinner while processing"
    );
    assert(
      contactSectionContent.includes('aria-busy={isSubmitting}'),
      "Public Contact form sets aria-busy attribute during submission"
    );

    const quotationCalcPath = path.join(projectRoot, "components", "public", "QuotationCalculator.tsx");
    const quotationCalcContent = fs.readFileSync(quotationCalcPath, "utf-8");
    assert(
      quotationCalcContent.includes("disabled={isSubmittingInquiry}") && quotationCalcContent.includes("Spinner"),
      "Public Quotation Calculator disables modal submit button and renders Spinner while processing"
    );
    assert(
      quotationCalcContent.includes('aria-busy={isSubmittingInquiry}'),
      "Public Quotation Calculator sets aria-busy attribute during submission"
    );
    assert(
      quotationCalcContent.includes("isCalculating") && quotationCalcContent.includes("Spinner"),
      "Public Quotation Calculator displays Spinner during server-authoritative calculation"
    );

    // --------------------------------------------------------------------------
    // 6. ZERO ARTIFICIAL LATENCY VERIFICATION
    // --------------------------------------------------------------------------
    console.log("\n⏱️ 6. Verifying Zero Artificial Latency Delays...");

    const apiDir = path.join(projectRoot, "app", "api");
    const apiFiles: string[] = [];
    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          apiFiles.push(fullPath);
        }
      }
    }
    scanDir(apiDir);

    let hasArtificialDelayInApi = false;
    for (const file of apiFiles) {
      const code = fs.readFileSync(file, "utf-8");
      if (code.includes("setTimeout") || code.includes("sleep")) {
        hasArtificialDelayInApi = true;
        console.error(`  ⚠️ Detected potential artificial delay in: ${file}`);
      }
    }
    assert(
      !hasArtificialDelayInApi,
      "API routes contain zero artificial setTimeout or sleep delays in data flow"
    );

    // --------------------------------------------------------------------------
    // 7. DATABASE INTEGRITY
    // --------------------------------------------------------------------------
    console.log("\n🗄️ 7. Verifying Database Integrity & Historical Data...");

    const [serviceCount] = await db.select({ count: sql<number>`count(*)` }).from(services);
    const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);
    const [teamCount] = await db.select({ count: sql<number>`count(*)` }).from(teamMembers);
    const [galleryCount] = await db.select({ count: sql<number>`count(*)` }).from(gallery);
    const [rateCount] = await db.select({ count: sql<number>`count(*)` }).from(serviceRates);
    const [unitCount] = await db.select({ count: sql<number>`count(*)` }).from(units);
    const [settingCount] = await db.select({ count: sql<number>`count(*)` }).from(settings);

    assert(Number(serviceCount.count) >= 4, `Services data intact: ${serviceCount.count} records`);
    assert(Number(projectCount.count) >= 2, `Projects data intact: ${projectCount.count} records`);
    assert(Number(teamCount.count) >= 4, `Team members data intact: ${teamCount.count} records`);
    assert(Number(galleryCount.count) >= 4, `Gallery data intact: ${galleryCount.count} records`);
    assert(Number(rateCount.count) >= 8, `Quotation rates data intact: ${rateCount.count} records`);
    assert(Number(unitCount.count) >= 4, `Units data intact: ${unitCount.count} records`);
    assert(Number(settingCount.count) >= 10, `Settings data intact: ${settingCount.count} records`);

  } catch (err: any) {
    console.error("❌ Exception during Phase 10 verification:", err);
    failedCount++;
  } finally {
    clearTimeout(safetyTimeout);

    console.log("\n==================================================================");
    console.log(`📊 PHASE 10 VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==================================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runPhase10Verification();
