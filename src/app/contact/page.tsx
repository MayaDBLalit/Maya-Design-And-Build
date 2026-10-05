import React from "react";
import { Navbar } from "@/components/public/Navbar";
import { ContactSection } from "@/components/public/ContactSection";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";
import { getPublicSettings } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact & Consultation | MAYA Design & Build",
  description:
    "Direct engineering consultation, site visits, and project inquiries with MAYA Design & Build in Bardoli, Surat.",
};

export default async function ContactPage() {
  const settings = await getPublicSettings();

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] selection:bg-[#C5A869] selection:text-neutral-950 font-sans">
      {/* 1. Header & Navigation */}
      <Navbar />

      <main className="pt-24">
        {/* 2. Page Hero Banner */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#14171C]/80 to-[#0D0F12] border-b border-[#2B313D]/60 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#C5A869]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>Direct Engagement</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Studio &amp; Consultations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              Contact &amp; Site Consultation
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl font-light leading-relaxed">
              Schedule an in-person architectural review at our Bardoli studio or request an engineering director
              site inspection for your plot or existing structure.
            </p>
          </div>
        </section>

        {/* 3. Full Contact Section (Dynamic CMS settings, Form, WhatsApp flow, Google Maps) */}
        <ContactSection settings={settings} />
      </main>

      {/* 4. Footer */}
      <Footer settings={settings} />

      {/* 5. Dynamic Floating Call Action Button */}
      <FloatingCallButton phone={settings.contact_phone} />
    </div>
  );
}
