import React from "react";
import Link from "next/link";

interface HeroProps {
  settings?: Record<string, string>;
}

export function Hero({ settings }: HeroProps) {
  const headline = settings?.hero_headline || "Designing Elegance, Building Legacy.";
  const subheadline =
    settings?.hero_subheadline ||
    "Where architectural vision meets structural precision. End-to-end Interior Design, Photorealistic 3D Visualization, Project Management Services, and Turnkey Construction.";

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 bg-[#F9F6F5] overflow-hidden">
      {/* Ambient Lighting Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft Sunlit Clay Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#E1A857]/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: High-Impact Editorial Text & Positioning */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Architectural Identity Chip */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 text-[#966015] text-[11px] font-mono font-bold uppercase tracking-[0.22em] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#966015]" />
              <span>Est. 2021 • Civil &amp; Architectural Practice • Bardoli</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-5">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#032D47] leading-[1.06]">
                {headline}
              </h1>

              <p className="text-base sm:text-lg text-[#455668] max-w-xl font-normal leading-relaxed">
                {subheadline}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 shadow-sm active:scale-98"
              >
                <span>Explore Portfolio</span>
                <span className="font-serif text-sm">→</span>
              </Link>

              <Link
                href="/quotation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xs bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#BCC1C4]/80 hover:border-[#966015] text-[#032D47] text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 shadow-xs active:scale-98"
              >
                <span>Instant BOQ Estimate</span>
              </Link>
            </div>

            {/* Architectural Credentials Ribbon */}
            <div className="pt-8 border-t border-[#BCC1C4]/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#032D47] font-serif">2021</p>
                <p className="text-[10px] uppercase tracking-wider text-[#455668] font-mono font-semibold mt-0.5">
                  Founded in Bardoli
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#966015] font-serif">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-[#455668] font-mono font-semibold mt-0.5">
                  Engineered Oversight
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#032D47] font-serif">Turnkey</p>
                <p className="text-[10px] uppercase tracking-wider text-[#455668] font-mono font-semibold mt-0.5">
                  Civil to Handover
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#966015] font-serif">Itemized</p>
                <p className="text-[10px] uppercase tracking-wider text-[#455668] font-mono font-semibold mt-0.5">
                  Zero-Deviation BOQ
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Spatial Imagery Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xs border border-[#BCC1C4]/60 bg-[#FFFFFF] p-2.5 shadow-[0_8px_30px_rgba(3,45,71,0.06)] overflow-hidden">
              {/* Primary Architectural Showcase Photo */}
              <div className="relative h-80 sm:h-[440px] w-full rounded-xs overflow-hidden bg-[#F2EFEB]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/uploads/1791019215061-b82c0a99-fe56-436c-8657-796356a3851b.jpg"
                  alt="MAYA Design & Build Architectural Milestone"
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-700 ease-out"
                  loading="eager"
                />

                {/* Technical Coordinates Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xs bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#BCC1C4]/60 text-[#032D47] text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                  <span>PROJECT / THE GRAND TAPI</span>
                </div>

                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xs bg-[#032D47]/90 backdrop-blur-xs text-[#F9F6F5] text-[10px] font-mono uppercase tracking-widest shadow-xs">
                  <span>SURAT REGION • GUJARAT</span>
                </div>
              </div>

              {/* Editorial Caption Bar */}
              <div className="p-3.5 flex items-center justify-between text-xs font-mono text-[#455668] border-t border-[#BCC1C4]/30 mt-2">
                <span className="font-bold text-[#032D47]">MAYA ARCHITECTURAL PRACTICE</span>
                <span>INTEGRATED DESIGN &amp; BUILD</span>
              </div>
            </div>

            {/* Layered Secondary Architectural Accent Card */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 bg-[#FFFFFF] border border-[#BCC1C4]/80 p-4 rounded-xs shadow-lg max-w-[220px]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#966015] font-bold block mb-1">
                CIVIL PRECISION
              </span>
              <p className="text-xs text-[#032D47] font-semibold leading-snug">
                Architectural blueprints paired with 3-stage pre-casting structural audits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
