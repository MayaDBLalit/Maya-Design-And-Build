import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";
import { getMainServiceBySlug, getPublicSettings, getActiveCalculators } from "@/lib/public-api";
import { ServiceDetailClient } from "./ServiceDetailClient";

export const dynamic = "force-dynamic";

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getMainServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | MAYA Design & Build",
    };
  }

  return {
    title: `${service.title} | MAYA Design & Build`,
    description:
      service.shortDescription ||
      `Comprehensive architectural, engineering, and execution packages for ${service.title}.`,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;

  const [service, settings, calculators] = await Promise.all([
    getMainServiceBySlug(slug),
    getPublicSettings(),
    getActiveCalculators(),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F9F6F5] text-[#032D47] font-sans selection:bg-[#E1A857] selection:text-[#032D47]">
      {/* 1. Header Navigation */}
      <Navbar initialCalculators={calculators} />

      <main className="pt-24">
        {/* 2. Hero Banner & Architectural Breadcrumb */}
        <section className="py-16 sm:py-20 bg-[#FFFFFF] border-b border-[#BCC1C4]/40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#455668]">
              <Link href="/home" className="hover:text-[#966015] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/services" className="hover:text-[#966015] transition-colors">
                Services
              </Link>
              <span>/</span>
              <span className="text-[#966015] font-bold">{service.title}</span>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
                <span>MAYA Discipline #{service.displayOrder}</span>
                <span className="w-8 h-px bg-[#966015]/60" />
                <span>Architectural &amp; Engineering Scope</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#032D47]">
                {service.title}
              </h1>
            </div>

            {service.shortDescription && (
              <p className="text-sm sm:text-base text-[#455668] max-w-3xl leading-relaxed">
                {service.shortDescription}
              </p>
            )}
          </div>
        </section>

        {/* 3. Detailed Scope & Methodology (if provided) */}
        {(service.detailedContent || service.thumbnailUrl) && (
          <section className="py-16 bg-[#F9F6F5] border-b border-[#BCC1C4]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {service.thumbnailUrl && (
                  <div className="lg:col-span-5 rounded-xs overflow-hidden border border-[#BCC1C4]/70 bg-[#F2EFEB] shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.thumbnailUrl}
                      alt={service.title}
                      className="w-full h-auto object-cover max-h-[420px]"
                    />
                  </div>
                )}

                <div className={service.thumbnailUrl ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
                    <span>Standard of Excellence</span>
                    <span className="w-8 h-px bg-[#966015]/60" />
                    <span>Scope Methodology</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
                    Discipline Overview &amp; Execution Standards
                  </h2>
                  <div className="text-sm text-[#455668] leading-relaxed whitespace-pre-line space-y-4 font-normal">
                    {service.detailedContent || service.shortDescription}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Interactive Packages & Workflows Section */}
        <section className="py-20 bg-[#F9F6F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ServiceDetailClient
              serviceTitle={service.title}
              packages={service.packages}
            />
          </div>
        </section>

        {/* 5. Consultation & Next Steps Banner */}
        <section className="py-20 bg-[#FFFFFF] border-t border-[#BCC1C4]/40 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
              Require a Custom Architectural Scope?
            </h2>
            <p className="text-sm text-[#455668] max-w-xl mx-auto leading-relaxed">
              If your structural requirements or residential project spans beyond standardized packages,
              our senior engineers will conduct an on-site physical evaluation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm"
              >
                Schedule Site Evaluation &rarr;
              </Link>
              <Link
                href="/services"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#BCC1C4]/80 text-[#032D47] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-xs"
              >
                Explore Other Disciplines &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <Footer settings={settings} />

      {/* 7. Floating Call Button */}
      <FloatingCallButton phone={settings.contact_phone} />
    </div>
  );
}
