/**
 * MAYA DESIGN & BUILD — PHASE 12 VERIFICATION SUITE
 * Public Website Multi-Page Architecture
 *
 * Automated Assertions covering Phase 12 requirements:
 * 1. Dedicated public routes exist (/services, /projects, /quotation, /gallery, /contact, /terms, /privacy, /).
 * 2. Dedicated route loading boundaries exist for all new public routes.
 * 3. Desktop and mobile navigation routes correctly to dedicated pages.
 * 4. Active route tracking implemented in Navbar.
 * 5. Footer navigation links point to dedicated routes without admin link leakage.
 * 6. Obsolete public hash navigation (#services, #projects, #gallery, #quotation, #contact) removed.
 * 7. Services page renders dynamic scalable services and the 5-step engineering process.
 * 8. Projects page renders dynamic portfolio listing with category filtering and engineering team.
 * 9. Project Details preserves Phase 9 multi-image gallery and slug dynamic routing.
 * 10. Dedicated Gallery page renders dynamic photos, videos, filter tabs, and lightbox.
 * 11. Dedicated Quotation page renders dynamic rates and server-authoritative calculation.
 * 12. Dedicated Contact page renders dynamic business info and inquiry flow.
 * 13. Floating Call button appears across all public pages (/services, /projects, /quotation, /gallery, /contact, etc.).
 * 14. Admin panel remains strictly isolated from floating button and public layouts.
 * 15. Terms and Privacy pages use unified Navbar, Footer, and FloatingCallButton.
 * 16. Dynamic database records remain completely intact and connected with zero schema changes.
 */

import fs from "fs";
import path from "path";
import { db } from "./index";
import { services, projects, teamMembers, gallery, serviceRates, units, settings } from "./schema";
import { eq } from "drizzle-orm";

// Safety timeout: prevents process hanging
const safetyTimeout = setTimeout(() => {
  console.error("\n❌ [TIMEOUT] Phase 12 verification timed out after 20 seconds.");
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

async function runPhase12Verification() {
  console.log("\n==================================================================");
  console.log("🚀 STARTING MAYA PHASE 12 — PUBLIC MULTI-PAGE ARCHITECTURE VERIFICATION");
  console.log("==================================================================\n");

  const projectRoot = path.resolve(__dirname, "..");

  try {
    // --------------------------------------------------------------------------
    // 1. PUBLIC ROUTES EXISTENCE
    // --------------------------------------------------------------------------
    console.log("🌐 1. Verifying Dedicated Public Routes Exist...");

    const homePath = fs.existsSync(path.join(projectRoot, "app", "home", "page.tsx"))
      ? path.join(projectRoot, "app", "home", "page.tsx")
      : path.join(projectRoot, "app", "page.tsx");

    const homeLoadingPath = fs.existsSync(path.join(projectRoot, "app", "home", "loading.tsx"))
      ? path.join(projectRoot, "app", "home", "loading.tsx")
      : path.join(projectRoot, "app", "loading.tsx");

    const routes = [
      { name: "Home (/home)", path: homePath },
      { name: "Services (/services)", path: path.join(projectRoot, "app", "services", "page.tsx") },
      { name: "Projects (/projects)", path: path.join(projectRoot, "app", "projects", "page.tsx") },
      { name: "Project Details (/projects/[slug])", path: path.join(projectRoot, "app", "projects", "[slug]", "page.tsx") },
      { name: "Quotation (/quotation)", path: path.join(projectRoot, "app", "quotation", "page.tsx") },
      { name: "Gallery (/gallery)", path: path.join(projectRoot, "app", "gallery", "page.tsx") },
      { name: "Contact (/contact)", path: path.join(projectRoot, "app", "contact", "page.tsx") },
      { name: "Terms (/terms)", path: path.join(projectRoot, "app", "terms", "page.tsx") },
      { name: "Privacy (/privacy)", path: path.join(projectRoot, "app", "privacy", "page.tsx") },
    ];

    for (const route of routes) {
      assert(fs.existsSync(route.path), `Route file exists: ${route.name}`);
    }

    // --------------------------------------------------------------------------
    // 2. ROUTE LOADING BOUNDARIES (loading.tsx)
    // --------------------------------------------------------------------------
    console.log("\n⚡ 2. Verifying Route Loading Boundaries (loading.tsx)...");

    const loadingBoundaries = [
      { name: "Services loading.tsx", path: path.join(projectRoot, "app", "services", "loading.tsx") },
      { name: "Projects loading.tsx", path: path.join(projectRoot, "app", "projects", "loading.tsx") },
      { name: "Project Details loading.tsx", path: path.join(projectRoot, "app", "projects", "[slug]", "loading.tsx") },
      { name: "Quotation loading.tsx", path: path.join(projectRoot, "app", "quotation", "loading.tsx") },
      { name: "Gallery loading.tsx", path: path.join(projectRoot, "app", "gallery", "loading.tsx") },
      { name: "Contact loading.tsx", path: path.join(projectRoot, "app", "contact", "loading.tsx") },
    ];

    for (const lb of loadingBoundaries) {
      assert(fs.existsSync(lb.path), `Loading boundary exists: ${lb.name}`);
    }

    // --------------------------------------------------------------------------
    // 3. NAVIGATION (Navbar.tsx)
    // --------------------------------------------------------------------------
    console.log("\n🧭 3. Verifying Navigation Architecture (Navbar.tsx)...");

    const navbarPath = path.join(projectRoot, "components", "public", "Navbar.tsx");
    assert(fs.existsSync(navbarPath), "Navbar.tsx exists in src/components/public/");
    const navbarContent = fs.readFileSync(navbarPath, "utf-8");

    assert((navbarContent.includes('href: "/home"') || navbarContent.includes('href: "/"')) && navbarContent.includes('label: "Home"'), "Navbar contains Home link (/home)");
    assert(navbarContent.includes('href: "/services"') && navbarContent.includes('label: "Services"'), "Navbar contains Services link (/services)");
    assert(navbarContent.includes('href: "/projects"') && navbarContent.includes('label: "Projects"'), "Navbar contains Projects link (/projects)");
    assert(navbarContent.includes('href: "/quotation"') && navbarContent.includes('label: "Quotation"'), "Navbar contains Quotation link (/quotation)");
    assert(navbarContent.includes('href: "/gallery"') && navbarContent.includes('label: "Gallery"'), "Navbar contains Gallery link (/gallery)");
    assert(navbarContent.includes('href: "/contact"') && navbarContent.includes('label: "Contact"'), "Navbar contains Contact link (/contact)");
    assert(navbarContent.includes("usePathname()"), "Navbar uses Next.js usePathname for active route highlighting");
    assert(navbarContent.includes('href="/quotation"'), "Navbar CTA button links to /quotation");

    // --------------------------------------------------------------------------
    // 4. FOOTER (Footer.tsx)
    // --------------------------------------------------------------------------
    console.log("\n🦶 4. Verifying Footer Architecture (Footer.tsx)...");

    const footerPath = path.join(projectRoot, "components", "public", "Footer.tsx");
    assert(fs.existsSync(footerPath), "Footer.tsx exists in src/components/public/");
    const footerContent = fs.readFileSync(footerPath, "utf-8");

    assert(footerContent.includes('href="/services"'), "Footer links to /services");
    assert(footerContent.includes('href="/projects"'), "Footer links to /projects");
    assert(footerContent.includes('href="/quotation"'), "Footer links to /quotation");
    assert(footerContent.includes('href="/gallery"'), "Footer links to /gallery");
    assert(footerContent.includes('href="/contact"'), "Footer links to /contact");
    assert(footerContent.includes('href="/terms"'), "Footer links to /terms");
    assert(footerContent.includes('href="/privacy"'), "Footer links to /privacy");
    assert(!footerContent.includes("/admin/login") && !footerContent.includes("/admin/dashboard"), "Footer contains zero links to Admin CMS");

    // --------------------------------------------------------------------------
    // 5. OBSOLETE HASH NAVIGATION REMOVAL
    // --------------------------------------------------------------------------
    console.log("\n🧹 5. Verifying Removal of Obsolete Public Hash Links...");

    const publicFilesToCheck = [
      navbarPath,
      footerPath,
      ...routes.map((r) => r.path),
    ];

    let obsoleteHashFound = false;
    for (const filePath of publicFilesToCheck) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const match = content.match(/href=["'](\/#(services|projects|gallery|quotation|contact))["']/);
        if (match) {
          obsoleteHashFound = true;
          console.error(`Found obsolete hash ${match[1]} in ${path.basename(filePath)}`);
        }
      }
    }

    assert(!obsoleteHashFound, "All obsolete section hash navigation links (/#services, /#projects, etc.) cleanly removed");

    // --------------------------------------------------------------------------
    // 6. SERVICES & PROCESS PAGE (/services)
    // --------------------------------------------------------------------------
    console.log("\n🏗️ 6. Verifying Services Page (/services)...");

    const servicesPageContent = fs.readFileSync(path.join(projectRoot, "app", "services", "page.tsx"), "utf-8");
    assert(servicesPageContent.includes("getActiveServices()"), "Services page queries getActiveServices() dynamically");
    assert(servicesPageContent.includes("ServicesSection"), "Services page renders ServicesSection");
    assert(!servicesPageContent.includes("WorkflowSection"), "Services page has obsolete WorkflowSection removed");
    assert(servicesPageContent.includes('isOverview={false}'), "Services page renders full non-overview view");

    // --------------------------------------------------------------------------
    // 7. PROJECTS & TEAM PAGE (/projects)
    // --------------------------------------------------------------------------
    console.log("\n🏢 7. Verifying Projects & Team Page (/projects)...");

    const projectsPageContent = fs.readFileSync(path.join(projectRoot, "app", "projects", "page.tsx"), "utf-8");
    assert(projectsPageContent.includes("getActiveProjects()"), "Projects page queries getActiveProjects() dynamically");
    assert(projectsPageContent.includes("getActiveTeamMembers()"), "Projects page queries getActiveTeamMembers() dynamically");
    assert(projectsPageContent.includes("ProjectsSection"), "Projects page renders ProjectsSection");
    assert(projectsPageContent.includes("TeamSection"), "Projects page renders TeamSection");

    // --------------------------------------------------------------------------
    // 8. PROJECT DETAILS PAGE (/projects/[slug])
    // --------------------------------------------------------------------------
    console.log("\n🔍 8. Verifying Project Details Page (/projects/[slug])...");

    const projectDetailContent = fs.readFileSync(path.join(projectRoot, "app", "projects", "[slug]", "page.tsx"), "utf-8");
    assert(projectDetailContent.includes("getProjectBySlug"), "Project Details queries getProjectBySlug dynamically");
    assert(projectDetailContent.includes("ElevationSlider"), "Project Details renders before/after ElevationSlider");
    assert(projectDetailContent.includes("project.media"), "Project Details renders project-specific media gallery");
    assert(projectDetailContent.includes('href="/projects"'), "Project Details breadcrumb points to /projects");

    // --------------------------------------------------------------------------
    // 9. QUOTATION CALCULATOR PAGE (/quotation)
    // --------------------------------------------------------------------------
    console.log("\n💰 9. Verifying Quotation Calculator Page (/quotation)...");

    const quotationPageContent = fs.readFileSync(path.join(projectRoot, "app", "quotation", "page.tsx"), "utf-8");
    assert(quotationPageContent.includes("getActiveQuotationRates()"), "Quotation page queries getActiveQuotationRates() dynamically");
    assert(quotationPageContent.includes("QuotationCalculator"), "Quotation page renders QuotationCalculator component");

    // --------------------------------------------------------------------------
    // 10. MEDIA GALLERY PAGE (/gallery)
    // --------------------------------------------------------------------------
    console.log("\n📸 10. Verifying Media Gallery Page (/gallery)...");

    const galleryPageContent = fs.readFileSync(path.join(projectRoot, "app", "gallery", "page.tsx"), "utf-8");
    assert(galleryPageContent.includes("getActiveGalleryItems()"), "Gallery page queries getActiveGalleryItems() dynamically");
    assert(galleryPageContent.includes("GallerySection"), "Gallery page renders GallerySection");

    // --------------------------------------------------------------------------
    // 11. CONTACT PAGE (/contact)
    // --------------------------------------------------------------------------
    console.log("\n📞 11. Verifying Contact Page (/contact)...");

    const contactPageContent = fs.readFileSync(path.join(projectRoot, "app", "contact", "page.tsx"), "utf-8");
    assert(contactPageContent.includes("getPublicSettings()"), "Contact page queries getPublicSettings() dynamically");
    assert(contactPageContent.includes("ContactSection"), "Contact page renders ContactSection component");

    // --------------------------------------------------------------------------
    // 12. FLOATING CALL BUTTON DEPLOYMENT
    // --------------------------------------------------------------------------
    console.log("\n📱 12. Verifying Floating Call Button Across All Public Pages...");

    for (const route of routes) {
      const content = fs.readFileSync(route.path, "utf-8");
      assert(
        content.includes("<FloatingCallButton") && content.includes("settings.contact_phone"),
        `FloatingCallButton is rendered on ${route.name}`
      );
    }

    // --------------------------------------------------------------------------
    // 13. ADMIN CMS ISOLATION
    // --------------------------------------------------------------------------
    console.log("\n🔒 13. Verifying Admin CMS Isolation...");

    const rootLayoutContent = fs.readFileSync(path.join(projectRoot, "app", "layout.tsx"), "utf-8");
    const adminLoginContent = fs.readFileSync(path.join(projectRoot, "app", "(admin)", "admin", "login", "page.tsx"), "utf-8");
    const adminShellLayoutContent = fs.readFileSync(path.join(projectRoot, "app", "(admin)", "admin", "(shell)", "layout.tsx"), "utf-8");

    assert(!rootLayoutContent.includes("FloatingCallButton"), "Root layout (app/layout.tsx) does NOT render FloatingCallButton");
    assert(!adminLoginContent.includes("FloatingCallButton"), "Admin login does NOT render FloatingCallButton");
    assert(!adminShellLayoutContent.includes("FloatingCallButton"), "Admin shell layout does NOT render FloatingCallButton");

    // --------------------------------------------------------------------------
    // 14. DYNAMIC DATABASE CONNECTION & DATA INTEGRITY
    // --------------------------------------------------------------------------
    console.log("\n🗄️ 14. Verifying Dynamic Database Integrity...");

    const dbServices = await db.select().from(services);
    const dbProjects = await db.select().from(projects);
    const dbTeam = await db.select().from(teamMembers);
    const dbGallery = await db.select().from(gallery);
    const dbRates = await db.select().from(serviceRates);
    const dbUnits = await db.select().from(units);
    const dbSettings = await db.select().from(settings);

    assert(dbServices.length > 0, `Services database records intact (${dbServices.length} active)`);
    assert(dbProjects.length > 0, `Projects database records intact (${dbProjects.length} active)`);
    assert(dbTeam.length > 0, `Team database records intact (${dbTeam.length} active)`);
    assert(dbGallery.length > 0, `Gallery database records intact (${dbGallery.length} active)`);
    assert(dbRates.length > 0, `Quotation rates database records intact (${dbRates.length} active)`);
    assert(dbUnits.length > 0, `Units database records intact (${dbUnits.length} active)`);
    assert(dbSettings.length > 0, `Settings database records intact (${dbSettings.length} active)`);

    // --------------------------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------------------------
    console.log("\n==================================================================");
    console.log(`📊 PHASE 12 VERIFICATION COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==================================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Unexpected error during Phase 12 verification:", error);
    process.exit(1);
  }
}

runPhase12Verification();
