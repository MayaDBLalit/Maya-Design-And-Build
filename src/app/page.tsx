import React from "react";
import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/Hero";
import { AboutSection } from "@/components/public/AboutSection";
import { ServicesSection } from "@/components/public/ServicesSection";
import { ProjectsSection } from "@/components/public/ProjectsSection";
import { FiveFactorsSection } from "@/components/public/FiveFactorsSection";
import { WorkflowSection } from "@/components/public/WorkflowSection";
import { TeamSection } from "@/components/public/TeamSection";
import { GallerySection } from "@/components/public/GallerySection";
import { QuotationCalculator } from "@/components/public/QuotationCalculator";
import { ContactSection } from "@/components/public/ContactSection";
import { Footer } from "@/components/public/Footer";
import {
  getActiveServices,
  getActiveProjects,
  getActiveTeamMembers,
  getActiveGalleryItems,
  getActiveQuotationRates,
  getPublicSettings,
} from "@/lib/public-api";

export const metadata = {
  title: "MAYA Design & Build | Engineering, Interior Design & Turnkey Construction",
  description:
    "Premier architectural design, 3D visualization, engineering PMS controls, and turnkey construction services in Bardoli, Gujarat. Established in 2021.",
};

export default async function HomePage() {
  // Query all active dynamic business content in parallel
  const [services, projects, team, gallery, rates, settings] =
    await Promise.all([
      getActiveServices(),
      getActiveProjects(),
      getActiveTeamMembers(),
      getActiveGalleryItems(),
      getActiveQuotationRates(),
      getPublicSettings(),
    ]);

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] selection:bg-[#C5A869] selection:text-neutral-950 font-sans">
      {/* 1. Header & Navigation */}
      <Navbar />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. About / Brand Story */}
        <AboutSection />

        {/* 4. Core Services (4 Pillars) */}
        <ServicesSection initialServices={services} />

        {/* 5. Projects Portfolio */}
        <ProjectsSection initialProjects={projects} />

        {/* 6. Five Factors (Space, Air, Fire, Water, Earth) */}
        <FiveFactorsSection />

        {/* 7. MAYA 5-Step Process */}
        <WorkflowSection />

        {/* 8. Engineering Leadership Team */}
        <TeamSection initialTeam={team} />

        {/* 9. Media & Walkthrough Gallery */}
        <GallerySection initialGallery={gallery} />

        {/* 10. Dynamic Quotation Calculator */}
        <QuotationCalculator initialRates={rates} />

        {/* 11. Consultation Contact */}
        <ContactSection settings={settings} />
      </main>

      {/* 12. Footer */}
      <Footer settings={settings} />
    </div>
  );
}
