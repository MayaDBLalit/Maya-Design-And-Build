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
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] selection:bg-[#C5A869] selection:text-neutral-950 font-sans">
      {/* 1. Header & Navigation */}
      <Navbar />

      <main className="pt-24">
        {/* 2. Page Hero Banner */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#14171C]/80 to-[#0D0F12] border-b border-[#2B313D]/60 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#C5A869]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>Visual Documentation</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Media &amp; Walkthroughs</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              Media &amp; Walkthrough Gallery
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl font-light leading-relaxed">
              Explore photorealistic renderings, construction site documentation, and motion walkthroughs
              showcasing MAYA design craftsmanship.
            </p>
          </div>
        </section>

        {/* 3. Scalable Dynamic Media Gallery Grid with Filter Tabs & Lightbox */}
        <GallerySection initialGallery={gallery} isOverview={false} />

        {/* 4. Consultation CTA Banner */}
        <section className="py-20 bg-[#14171C] border-t border-[#2B313D] text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Impressed by Our Spatial Standards?
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
              Let&apos;s collaborate to design and engineer a property that mirrors your aesthetic and operational vision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/quotation"
                className="w-full sm:w-auto px-8 py-3.5 rounded bg-gradient-to-r from-[#C5A869] to-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 shadow-lg transition duration-300"
              >
                Estimate Project Cost &rarr;
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#0D0F12] hover:bg-[#1D2128] border border-[#2B313D] hover:border-[#C5A869]/50 text-white font-semibold text-xs uppercase tracking-[0.15em] transition duration-300"
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
