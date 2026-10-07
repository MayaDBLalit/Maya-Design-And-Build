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
    <div className="min-h-screen bg-[#F9F6F5] text-[#032D47] font-sans selection:bg-[#E1A857] selection:text-[#032D47]">
      {/* 1. Header & Navigation */}
      <Navbar />

      <main className="pt-24">
        {/* 2. Page Hero Banner */}
        <section className="py-20 bg-[#FFFFFF] border-b border-[#BCC1C4]/40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>Direct Engagement</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Studio &amp; Consultations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#032D47]">
              Contact &amp; Site Consultation
            </h1>
            <p className="text-sm sm:text-base text-[#455668] max-w-2xl font-normal leading-relaxed">
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
