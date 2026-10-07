import React from "react";
import { Navbar } from "@/components/public/Navbar";
import { QuotationCalculator } from "@/components/public/QuotationCalculator";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";
import { getActiveQuotationRates, getPublicSettings } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dynamic Quotation & BOQ Cost Estimator | MAYA Design & Build",
  description:
    "Calculate instant transparent architectural, interior, structural, and turnkey construction estimates online.",
};

export default async function QuotationPage() {
  const [rates, settings] = await Promise.all([
    getActiveQuotationRates(),
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
              <span>Transparent Estimation</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Authoritative BOQ Calculator</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#032D47]">
              Dynamic Quotation Calculator
            </h1>
            <p className="text-sm sm:text-base text-[#455668] max-w-2xl font-normal leading-relaxed">
              Scientific rate calculation itemized by discipline. Customize your square footage,
              select specific structural deliverables, and calculate estimated investments verified by our server engine.
            </p>
          </div>
        </section>

        {/* 3. Server-Authoritative Quotation Calculator Engine */}
        <QuotationCalculator initialRates={rates} />
      </main>

      {/* 4. Footer */}
      <Footer settings={settings} />

      {/* 5. Dynamic Floating Call Action Button */}
      <FloatingCallButton phone={settings.contact_phone} />
    </div>
  );
}
