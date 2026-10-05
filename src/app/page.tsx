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
    "Premier architectural design, 3D visualization, engineering PMS controls, and turnkey construction services in Bardoli, Gujarat. Established in 2021.",
};

export default async function HomePage() {
  // Query dynamic overview content in parallel
  const [services, projects, gallery, settings] = await Promise.all([
    getActiveServices(),
    getActiveProjects(),
    getActiveGalleryItems(),
    getPublicSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] selection:bg-[#C5A869] selection:text-neutral-950 font-sans">
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
        <section className="py-20 bg-gradient-to-b from-[#0D0F12] to-[#14171C] border-t border-[#2B313D]/60 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C5A869]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>Next Steps</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Initiate Your Project</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Ready to Build Your Architectural Legacy?
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
              Calculate an authoritative estimate using our live itemized BOQ calculator,
              or connect with our engineering team for a private consultation and site assessment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/quotation"
                className="w-full sm:w-auto px-8 py-3.5 rounded bg-gradient-to-r from-[#C5A869] to-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 shadow-lg hover:shadow-[#C5A869]/20 transition duration-300"
              >
                Get Free Quotation &rarr;
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#14171C] hover:bg-[#1D2128] border border-[#2B313D] hover:border-[#C5A869]/50 text-white font-semibold text-xs uppercase tracking-[0.15em] transition duration-300"
              >
                Contact Us &rarr;
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
