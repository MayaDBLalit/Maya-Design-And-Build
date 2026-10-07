import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { ProjectsSection } from "@/components/public/ProjectsSection";
import { TeamSection } from "@/components/public/TeamSection";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";
import { getActiveProjects, getActiveTeamMembers, getPublicSettings } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects Portfolio & Engineering Team | MAYA Design & Build",
  description:
    "Explore our complete portfolio of residential, commercial, and turnkey projects in Bardoli, along with our leadership engineering team.",
};

export default async function ProjectsPage() {
  const [projects, team, settings] = await Promise.all([
    getActiveProjects(),
    getActiveTeamMembers(),
    getPublicSettings(),
  ]);

  return (
    <div className="min-h-screen bg-[#F9F6F5] text-[#032D47] font-sans selection:bg-[#E1A857] selection:text-[#032D47]">
      {/* 1. Header & Navigation */}
      <Navbar />

      <main className="pt-24">
        {/* 2. Page Hero Banner */}
        <section className="py-20 bg-[#FFFFFF] border-b border-[#BCC1C4]/40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>Portfolio &amp; Leadership</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Works &amp; Team</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#032D47]">
              Projects &amp; Engineering Team
            </h1>
            <p className="text-sm sm:text-base text-[#455668] max-w-2xl font-normal leading-relaxed">
              Explore our executed architectural milestones and discover the engineering leadership
              spearheading structural integrity and project delivery in Bardoli.
            </p>
          </div>
        </section>

        {/* 3. Projects Portfolio Listing with Interactive Category Filters */}
        <ProjectsSection initialProjects={projects} isOverview={false} />

        {/* 4. Leadership & Engineering Team */}
        <TeamSection initialTeam={team} />

        {/* 5. Consultation & Inquiries CTA Banner */}
        <section className="py-24 bg-[#FFFFFF] border-t border-[#BCC1C4]/40 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
              Envisioning Your Next Property Transformation?
            </h2>
            <p className="text-sm sm:text-base text-[#455668] max-w-xl mx-auto leading-relaxed">
              Our engineering team is ready to analyze your site plans, draft photorealistic 3D concepts,
              and manage construction down to the smallest detail.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/quotation"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm"
              >
                Instant Quotation Calculator &rarr;
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#BCC1C4]/80 hover:border-[#032D47] text-[#032D47] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-xs"
              >
                Consult With Our Engineers &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <Footer settings={settings} />

      {/* 7. Dynamic Floating Call Action Button */}
      <FloatingCallButton phone={settings.contact_phone} />
    </div>
  );
}
