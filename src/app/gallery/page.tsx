import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { GallerySection } from "@/components/public/GallerySection";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";
import { getActiveGalleryItems, getPublicSettings } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Media & Walkthrough Gallery | MAYA Design & Build",
  description:
    "High-resolution photographs, site documentation, and 3D architectural walkthrough videos.",
};

export default async function GalleryPage() {
  const [gallery, settings] = await Promise.all([
    getActiveGalleryItems(),
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
              <span>Visual Documentation</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Media &amp; Walkthroughs</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#032D47]">
              Media &amp; Walkthrough Gallery
            </h1>
            <p className="text-sm sm:text-base text-[#455668] max-w-2xl font-normal leading-relaxed">
              Explore photorealistic renderings, construction site documentation, and motion walkthroughs
              showcasing MAYA design craftsmanship.
            </p>
          </div>
        </section>

        {/* 3. Scalable Dynamic Media Gallery Grid with Filter Tabs & Lightbox */}
        <GallerySection initialGallery={gallery} isOverview={false} />

        {/* 4. Consultation CTA Banner */}
        <section className="py-24 bg-[#FFFFFF] border-t border-[#BCC1C4]/40 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
              Impressed by Our Spatial Standards?
            </h2>
            <p className="text-sm sm:text-base text-[#455668] max-w-xl mx-auto leading-relaxed">
              Let&apos;s collaborate to design and engineer a property that mirrors your aesthetic and operational vision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/quotation"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm"
              >
                Estimate Project Cost &rarr;
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#BCC1C4]/80 hover:border-[#032D47] text-[#032D47] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-xs"
              >
                Initiate Consultation &rarr;
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
