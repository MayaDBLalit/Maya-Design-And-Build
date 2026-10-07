import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/Hero";
import { AboutSection } from "@/components/public/AboutSection";
import { ServicesSection } from "@/components/public/ServicesSection";
import { FiveFactorsSection } from "@/components/public/FiveFactorsSection";
import { ProjectsSection } from "@/components/public/ProjectsSection";
import { WorkflowSection } from "@/components/public/WorkflowSection";
import { GallerySection } from "@/components/public/GallerySection";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";
import {
  getActiveServices,
  getActiveProjects,
  getActiveGalleryItems,
  getPublicSettings,
} from "@/lib/public-api";

// Ensure real-time dynamic rendering so Admin CMS mutations reflect immediately on the website
export const dynamic = "force-dynamic";

export const metadata = {
  title: "MAYA Design & Build | Engineering, Interior Design & Turnkey Construction",
  description:
    "Premier architectural design, 3D visualization, engineering PMS controls, and turnkey construction services in Bardoli, Gujarat. Established in 2021 by Er. Lalit Choudhary.",
};

export default async function HomePage() {
  // Query dynamic overview content in parallel with React cache() deduplication
  const [services, projects, gallery, settings] = await Promise.all([
    getActiveServices(),
    getActiveProjects(),
    getActiveGalleryItems(),
    getPublicSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#F9F6F5] text-[#032D47] font-sans selection:bg-[#E1A857] selection:text-[#032D47]">
      {/* 1. Header & Navigation */}
      <Navbar />

      <main>
        {/* 2. Hero Section (Dynamic CMS settings passed) */}
        <Hero settings={settings} />

        {/* 3. About / Brand Story (Dynamic CMS settings passed) */}
        <AboutSection settings={settings} />

        {/* 4. Core Services Overview Preview (Top 4 services with link to /services) */}
        <ServicesSection
          initialServices={services}
          isOverview={true}
          previewLimit={4}
        />

        {/* 5. Five Factors (Space, Air, Fire, Water, Earth) */}
        <FiveFactorsSection />

        {/* 6. Projects Portfolio Overview Preview (Top 2 featured/recent projects with link to /projects) */}
        <ProjectsSection
          initialProjects={projects}
          isOverview={true}
          previewLimit={2}
        />

        {/* 7. MAYA 5-Step Process Overview Preview (Roadmap summary with link to /services#process) */}
        <WorkflowSection isOverview={true} />

        {/* 8. Media & Walkthrough Gallery Overview Preview (Top 3 media items with link to /gallery) */}
        <GallerySection
          initialGallery={gallery}
          isOverview={true}
          previewLimit={3}
        />

        {/* 9. High-Conversion Overview CTA Banner */}
        <section className="py-24 bg-[#FFFFFF] border-t border-[#BCC1C4]/40 relative overflow-hidden text-center">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>Next Steps</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Initiate Your Project</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47] leading-tight">
              Ready to Build Your Architectural Legacy?
            </h2>

            <p className="text-sm sm:text-base text-[#455668] max-w-2xl mx-auto leading-relaxed">
              Calculate an authoritative estimate using our live itemized BOQ calculator,
              or connect directly with our engineering team for a private consultation and site assessment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/quotation"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm active:scale-98"
              >
                Get Free Itemized Quotation &rarr;
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#BCC1C4]/80 hover:border-[#032D47] text-[#032D47] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-xs active:scale-98"
              >
                Contact Studio &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <Footer settings={settings} />

      {/* 11. Dynamic Floating Call Action Button */}
      <FloatingCallButton phone={settings.contact_phone} />
    </div>
  );
}
