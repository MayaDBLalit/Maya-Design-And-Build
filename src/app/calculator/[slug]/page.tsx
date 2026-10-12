import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";
import {
  getCalculatorBySlug,
  getActiveBHKConfigurations,
  getActiveCalculators,
  getPublicSettings,
} from "@/lib/public-api";
import { CalculatorClient } from "./CalculatorClient";

export const dynamic = "force-dynamic";

interface CalculatorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CalculatorPageProps) {
  const { slug } = await params;
  const calculator = await getCalculatorBySlug(slug);

  if (!calculator) {
    return {
      title: "Calculator Not Found | MAYA Design & Build",
    };
  }

  return {
    title: `${calculator.title} | MAYA Design & Build`,
    description: `Calculate transparent architectural and engineering estimates online with ${calculator.title}.`,
  };
}

export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { slug } = await params;

  const [calculator, bhkList, calculators, settings] = await Promise.all([
    getCalculatorBySlug(slug),
    getActiveBHKConfigurations(),
    getActiveCalculators(),
    getPublicSettings(),
  ]);

  if (!calculator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F9F6F5] text-[#032D47] font-sans selection:bg-[#E1A857] selection:text-[#032D47]">
      {/* 1. Header Navigation */}
      <Navbar initialCalculators={calculators} />

      <main className="pt-24">
        {/* 2. Hero Section */}
        <section className="py-16 sm:py-20 bg-[#FFFFFF] border-b border-[#BCC1C4]/40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-[#455668]">
              <Link href="/home" className="hover:text-[#966015] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#455668]">Calculators</span>
              <span>/</span>
              <span className="text-[#966015] font-bold">{calculator.title}</span>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
                <span>Server-Authoritative Estimation</span>
                <span className="w-8 h-px bg-[#966015]/60" />
                <span>BOQ Cost Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#032D47]">
                {calculator.title}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-[#455668] max-w-2xl font-normal leading-relaxed">
              Define your architectural built-up area and select specific disciplines. Our authoritative
              estimation engine processes verified rate schedules to return your project cost upon inquiry submission.
            </p>
          </div>
        </section>

        {/* 3. Interactive Calculator Engine */}
        <section className="py-16 sm:py-20 bg-[#F9F6F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CalculatorClient
              calculatorId={calculator.id}
              calculatorTitle={calculator.title}
              subServices={calculator.subServices}
              bhkList={bhkList}
            />
          </div>
        </section>

        {/* 4. Engineering Standards & Site Inspection Section */}
        <section className="py-20 bg-[#FFFFFF] border-t border-[#BCC1C4]/40 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
              Looking for a Full Architectural Package?
            </h2>
            <p className="text-sm text-[#455668] max-w-xl mx-auto leading-relaxed">
              Explore our bundled service packages which combine architectural drafting, 3D visualization,
              and turnkey civil supervision into structured execution phases.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/services"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm"
              >
                Explore Services &amp; Packages &rarr;
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#BCC1C4]/80 text-[#032D47] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-xs"
              >
                Schedule Site Visit &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <Footer settings={settings} />

      {/* 6. Dynamic Floating Call Action Button */}
      <FloatingCallButton phone={settings.contact_phone} />
    </div>
  );
}
