import {
  getActiveServices,
  getActiveProjects,
  getProjectBySlug,
  getActiveTeamMembers,
  getActiveGalleryItems,
  getActiveQuotationRates,
  getPublicSettings,
} from "../src/lib/public-api";
import { formatINR } from "../src/lib/formatters";

async function verifyPublicSystem() {
  console.log("==================================================");
  console.log("MAYA DESIGN & BUILD — PUBLIC SYSTEM VERIFICATION");
  console.log("==================================================");

  // 1. Settings
  const settings = await getPublicSettings();
  console.log("✓ Public Settings retrieved:", {
    site_name: settings.site_name,
    contact_phone: settings.contact_phone,
    contact_email: settings.contact_email,
  });
  if (!settings.contact_phone) throw new Error("Missing contact_phone in settings");

  // 2. Services
  const services = await getActiveServices();
  console.log(`✓ Active Services retrieved (${services.length} items):`, services.map((s) => s.title));
  if (services.length === 0) throw new Error("No active services returned");

  // 3. Projects
  const projects = await getActiveProjects();
  console.log(`✓ Active Projects retrieved (${projects.length} items):`, projects.map((p) => p.title));
  if (projects.length === 0) throw new Error("No active projects returned");

  // 4. Project Details & Media Isolation
  const sampleSlug = projects[0].slug;
  const projectDetail = await getProjectBySlug(sampleSlug);
  if (!projectDetail) throw new Error(`Could not query project details for slug: ${sampleSlug}`);
  console.log(`✓ Project Detail (${projectDetail.title}):`, {
    slug: projectDetail.slug,
    category: projectDetail.category,
    hasOldElevation: Boolean(projectDetail.oldElevationUrl),
    hasNewElevation: Boolean(projectDetail.newElevationUrl),
    mediaCount: projectDetail.media?.length || 0,
  });

  // 5. Team & Founder Er. Lalit Choudhary
  const team = await getActiveTeamMembers();
  console.log(`✓ Active Team Members retrieved (${team.length} members):`);
  const founder = team.find((t) => t.fullName.toLowerCase().includes("lalit"));
  if (!founder) throw new Error("Founder Er. Lalit Choudhary not found in active team");
  if (founder.roleTitle !== "Founder & Project Manager") {
    throw new Error(`Expected Founder & Project Manager, found: ${founder.roleTitle}`);
  }
  console.log("  ★ FOUNDER VERIFIED:", {
    name: founder.fullName,
    role: founder.roleTitle,
    image: founder.imageUrl,
    experience: founder.experienceYears,
  });

  // 6. Gallery Items
  const gallery = await getActiveGalleryItems();
  console.log(`✓ Gallery Items retrieved (${gallery.length} items):`, {
    images: gallery.filter((g) => g.mediaType === "image").length,
    videos: gallery.filter((g) => g.mediaType === "video").length,
  });

  // 7. Quotation Rates
  const rates = await getActiveQuotationRates();
  console.log(`✓ Quotation Rates retrieved (${rates.length} active rates)`);
  if (rates.length === 0) throw new Error("No quotation rates found");

  console.log("==================================================");
  console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

verifyPublicSystem()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });
