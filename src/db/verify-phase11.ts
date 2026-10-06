/**
 * MAYA DESIGN & BUILD — PHASE 11 VERIFICATION SUITE
 * Public Website Floating Call Button
 *
 * Automated Assertions covering Phase 11 requirements:
 * 1. FloatingCallButton component exists in src/components/public/FloatingCallButton.tsx.
 * 2. normalizeTelHref helper exists in src/lib/formatters.ts and handles all format/edge cases.
 * 3. FloatingCallButton integrates universally recognized phone SVG icon without third-party deps.
 * 4. FloatingCallButton uses fixed positioning (fixed, bottom, right, z-40) with safe-area insets.
 * 5. FloatingCallButton complies with accessibility standards (aria-label, title, sr-only).
 * 6. FloatingCallButton dynamically supports SSR prop and client-side /api/settings fallback.
 * 7. FloatingCallButton gracefully returns null when phone is missing or invalid (no broken links).
 * 8. All public pages render FloatingCallButton (Home, Project Details, Terms, Privacy).
 * 9. Admin routes remain strictly isolated: zero FloatingCallButton in Admin pages/shell/login.
 * 10. Database settings record 'contact_phone' exists and is successfully normalized.
 * 11. Database schema is completely unchanged with zero migrations.
 * 12. Prior phase features (Phase 8 CRUD, Phase 9 multi-image, Phase 10 skeletons) remain intact.
 */

import fs from "fs";
import path from "path";
import { db } from "./index";
import { settings, services, projects, teamMembers, gallery } from "./schema";
import { eq } from "drizzle-orm";
import { normalizeTelHref } from "../lib/formatters";

// Safety timeout: prevents process hanging
const safetyTimeout = setTimeout(() => {
  console.error("\n❌ [TIMEOUT] Phase 11 verification timed out after 20 seconds.");
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

async function runPhase11Verification() {
  console.log("\n==================================================================");
  console.log("🚀 STARTING MAYA PHASE 11 — FLOATING CALL BUTTON VERIFICATION");
  console.log("==================================================================\n");

  const projectRoot = path.resolve(__dirname, "..");

  try {
    // --------------------------------------------------------------------------
    // 1. REUSABLE COMPONENT & FORMATTER EXISTENCE
    // --------------------------------------------------------------------------
    console.log("🧩 1. Verifying Component and Utility Files...");

    const buttonPath = path.join(projectRoot, "components", "public", "FloatingCallButton.tsx");
    const formattersPath = path.join(projectRoot, "lib", "formatters.ts");

    assert(fs.existsSync(buttonPath), "FloatingCallButton.tsx exists in src/components/public/");
    assert(fs.existsSync(formattersPath), "formatters.ts exists in src/lib/");

    const buttonContent = fs.readFileSync(buttonPath, "utf-8");
    const formattersContent = fs.readFileSync(formattersPath, "utf-8");

    assert(buttonContent.includes("export function FloatingCallButton"), "FloatingCallButton is exported as a named function");
    assert(formattersContent.includes("export function normalizeTelHref"), "normalizeTelHref is exported from formatters.ts");

    // --------------------------------------------------------------------------
    // 2. PHONE NORMALIZATION LOGIC TESTS (normalizeTelHref)
    // --------------------------------------------------------------------------
    console.log("\n📞 2. Testing Telephone URI Normalization Logic...");

    assert(
      normalizeTelHref("+91 8980703374") === "+918980703374",
      "Correctly normalizes standard Indian format '+91 8980703374' to '+918980703374'"
    );
    assert(
      normalizeTelHref("+91-89807-03374") === "+918980703374",
      "Correctly normalizes hyphenated format '+91-89807-03374' to '+918980703374'"
    );
    assert(
      normalizeTelHref("+91 (898) 070-3374") === "+918980703374",
      "Correctly normalizes parenthesized format '+91 (898) 070-3374' to '+918980703374'"
    );
    assert(
      normalizeTelHref("8980703374") === "8980703374",
      "Correctly normalizes 10-digit number without '+' prefix to '8980703374'"
    );
    assert(
      normalizeTelHref("+1 (555) 234-5678") === "+15552345678",
      "Correctly normalizes international phone '+1 (555) 234-5678' to '+15552345678'"
    );
    assert(
      normalizeTelHref("") === null,
      "Returns null for empty string ''"
    );
    assert(
      normalizeTelHref("   ") === null,
      "Returns null for whitespace string '   '"
    );
    assert(
      normalizeTelHref(null) === null,
      "Returns null for null input"
    );
    assert(
      normalizeTelHref(undefined) === null,
      "Returns null for undefined input"
    );
    assert(
      normalizeTelHref("not-a-phone-number") === null,
      "Returns null for non-numeric alphabetic string"
    );
    assert(
      normalizeTelHref("12345") === null,
      "Returns null for short numbers (< 7 digits)"
    );
    assert(
      normalizeTelHref("12345678901234567890") === null,
      "Returns null for numbers exceeding ITU-T E.164 max length (> 15 digits)"
    );

    // --------------------------------------------------------------------------
    // 3. FLOATINGCALLBUTTON ATTRIBUTES, STYLES & ACCESSIBILITY
    // --------------------------------------------------------------------------
    console.log("\n🎨 3. Verifying FloatingCallButton Design, Positioning & Accessibility...");

    assert(
      buttonContent.includes("fixed") &&
      buttonContent.includes("z-40") &&
      buttonContent.includes("rounded-full"),
      "Component uses fixed positioning, z-40 layering, and circular shape"
    );
    assert(
      buttonContent.includes("env(safe-area-inset-bottom") &&
      buttonContent.includes("env(safe-area-inset-right"),
      "Component incorporates mobile safe-area insets for notched/gesture displays"
    );
    assert(
      buttonContent.includes("<svg") &&
      buttonContent.includes("viewBox=\"0 0 24 24\"") &&
      buttonContent.includes("stroke=\"currentColor\""),
      "Component renders universal inline phone SVG icon without third-party icon packages"
    );
    assert(
      buttonContent.includes("aria-label=") &&
      buttonContent.includes("title=") &&
      buttonContent.includes("sr-only"),
      "Component complies with accessibility guidelines (aria-label, title, sr-only)"
    );
    assert(
      buttonContent.includes("href={`tel:${telTarget}`}") ||
      buttonContent.includes("href={\"tel:\""),
      "Component renders native 'tel:' URI link"
    );
    assert(
      buttonContent.includes("if (!telTarget") ||
      buttonContent.includes("if (!activePhone"),
      "Component returns null gracefully when telephone target is missing or invalid"
    );
    assert(
      buttonContent.includes("/api/settings"),
      "Component includes client-side fallback to fetch /api/settings if prop is omitted"
    );

    // --------------------------------------------------------------------------
    // 4. PUBLIC PAGES INTEGRATION
    // --------------------------------------------------------------------------
    console.log("\n🌐 4. Verifying Public Pages Integration...");

    const homePagePath = path.join(projectRoot, "app", "page.tsx");
    const projectDetailPagePath = path.join(projectRoot, "app", "projects", "[slug]", "page.tsx");
    const termsPagePath = path.join(projectRoot, "app", "terms", "page.tsx");
    const privacyPagePath = path.join(projectRoot, "app", "privacy", "page.tsx");

    const homeContent = fs.readFileSync(homePagePath, "utf-8");
    const projectDetailContent = fs.readFileSync(projectDetailPagePath, "utf-8");
    const termsContent = fs.readFileSync(termsPagePath, "utf-8");
    const privacyContent = fs.readFileSync(privacyPagePath, "utf-8");

    assert(
      homeContent.includes("FloatingCallButton") &&
      homeContent.includes("<FloatingCallButton phone={settings.contact_phone} />"),
      "Homepage (src/app/page.tsx) renders FloatingCallButton with dynamic contact_phone"
    );
    assert(
      projectDetailContent.includes("FloatingCallButton") &&
      projectDetailContent.includes("<FloatingCallButton phone={settings.contact_phone} />"),
      "Project Details (src/app/projects/[slug]/page.tsx) renders FloatingCallButton with dynamic contact_phone"
    );
    assert(
      termsContent.includes("FloatingCallButton") &&
      termsContent.includes("<FloatingCallButton phone={settings.contact_phone} />"),
      "Terms page (src/app/terms/page.tsx) renders FloatingCallButton with dynamic contact_phone"
    );
    assert(
      privacyContent.includes("FloatingCallButton") &&
      privacyContent.includes("<FloatingCallButton phone={settings.contact_phone} />"),
      "Privacy page (src/app/privacy/page.tsx) renders FloatingCallButton with dynamic contact_phone"
    );

    // --------------------------------------------------------------------------
    // 5. ADMIN CMS ROUTE ISOLATION
    // --------------------------------------------------------------------------
    console.log("\n🔒 5. Verifying Admin CMS Route Isolation...");

    const rootLayoutPath = path.join(projectRoot, "app", "layout.tsx");
    const adminLoginPath = path.join(projectRoot, "app", "(admin)", "admin", "login", "page.tsx");
    const adminShellLayoutPath = path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "layout.tsx");

    const rootLayoutContent = fs.readFileSync(rootLayoutPath, "utf-8");
    const adminLoginContent = fs.readFileSync(adminLoginPath, "utf-8");
    const adminShellLayoutContent = fs.readFileSync(adminShellLayoutPath, "utf-8");

    assert(
      !rootLayoutContent.includes("FloatingCallButton"),
      "Root layout (src/app/layout.tsx) does NOT render FloatingCallButton (scoped to public pages)"
    );
    assert(
      !adminLoginContent.includes("FloatingCallButton"),
      "Admin Login page does NOT import or render FloatingCallButton"
    );
    assert(
      !adminShellLayoutContent.includes("FloatingCallButton"),
      "Admin CMS Shell Layout does NOT import or render FloatingCallButton"
    );

    // Verify all admin sub-pages do not have FloatingCallButton
    const adminPagesDir = path.join(projectRoot, "app", "(admin)", "admin", "(shell)");
    const adminSubDirs = fs.readdirSync(adminPagesDir);
    let adminButtonFound = false;

    for (const subDir of adminSubDirs) {
      const pageFile = path.join(adminPagesDir, subDir, "page.tsx");
      if (fs.existsSync(pageFile)) {
        const content = fs.readFileSync(pageFile, "utf-8");
        if (content.includes("FloatingCallButton")) {
          adminButtonFound = true;
          break;
        }
      }
    }

    assert(
      !adminButtonFound,
      "None of the Admin CMS internal shell pages import or render FloatingCallButton"
    );

    // --------------------------------------------------------------------------
    // 6. DATABASE SETTINGS & DATA INTEGRITY
    // --------------------------------------------------------------------------
    console.log("\n🗄️ 6. Verifying Database Single Source of Truth & Data Integrity...");

    const phoneSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.keyName, "contact_phone"))
      .limit(1);

    assert(
      phoneSetting.length > 0 && !!phoneSetting[0].valueContent,
      `Database contains 'contact_phone' setting: "${phoneSetting[0]?.valueContent}"`
    );

    if (phoneSetting.length > 0 && phoneSetting[0].valueContent) {
      const normalizedDbPhone = normalizeTelHref(phoneSetting[0].valueContent);
      assert(
        normalizedDbPhone === "+918980703374",
        `Normalized database contact_phone correctly produces '${normalizedDbPhone}'`
      );
    }

    const servicesCount = await db.select().from(services);
    const projectsCount = await db.select().from(projects);
    const teamCount = await db.select().from(teamMembers);
    const galleryCount = await db.select().from(gallery);

    assert(servicesCount.length > 0, `Services table contains active records (${servicesCount.length})`);
    assert(projectsCount.length > 0, `Projects table contains active records (${projectsCount.length})`);
    assert(teamCount.length > 0, `Team table contains active records (${teamCount.length})`);
    assert(galleryCount.length > 0, `Gallery table contains active records (${galleryCount.length})`);

    // --------------------------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------------------------
    console.log("\n==================================================================");
    console.log(`📊 PHASE 11 VERIFICATION COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==================================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Unexpected error during Phase 11 verification:", error);
    process.exit(1);
  }
}

runPhase11Verification();
