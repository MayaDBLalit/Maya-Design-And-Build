import React from "react";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-24 pb-16 bg-[#0D0F12]">
      {/* Background Architectural Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle Architectural Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #C5A869 1px, transparent 1px), linear-gradient(to bottom, #C5A869 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Ambient Gold Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#C5A869]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-[#C5A869]/5 rounded-full blur-[120px]" />

        {/* Gradient Edge Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F12] via-transparent to-[#0D0F12]/60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Verified Brand Identity Chip */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#14171C] border border-[#C5A869]/30 text-[#C5A869] text-xs font-semibold uppercase tracking-[0.2em] shadow-sm animate-in fade-in duration-700">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A869] animate-ping" />
          <span>Established 2021 • Bardoli, Gujarat</span>
        </div>

        {/* Main Architectural Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Designing Elegance,{" "}
            <span className="bg-gradient-to-r from-[#C5A869] via-[#E2C78A] to-[#D4AF37] bg-clip-text text-transparent">
              Building Legacy.
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
            Where architectural vision meets structural precision. End-to-end Interior Design,
            Photorealistic 3D Visualization, Project Management Services, and Turnkey Construction.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href="#projects"
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-gradient-to-r from-[#C5A869] to-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 shadow-lg hover:shadow-[#C5A869]/20 transition duration-300"
          >
            Explore Projects
          </a>

          <a
            href="#quotation"
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#14171C] hover:bg-[#1D2128] border border-[#2B313D] hover:border-[#C5A869]/50 text-white font-semibold text-xs uppercase tracking-[0.15em] transition duration-300"
          >
            Calculate Quotation
          </a>

          <a
            href="#contact"
            className="w-full sm:w-auto px-6 py-3.5 rounded text-neutral-400 hover:text-[#C5A869] text-xs font-semibold uppercase tracking-[0.15em] transition duration-200"
          >
            Consult Engineers &rarr;
          </a>
        </div>

        {/* Core Pillars Ribbon */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left border-t border-[#2B313D]/60">
          <div className="p-3.5 rounded-lg bg-[#14171C]/50 border border-[#2B313D]/40">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A869]">01 / Design</span>
            <p className="text-xs font-bold text-white mt-1">Interior Architecture</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Bespoke spatial harmony</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#14171C]/50 border border-[#2B313D]/40">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A869]">02 / Vision</span>
            <p className="text-xs font-bold text-white mt-1">3D Visualization</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Photorealistic renders</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#14171C]/50 border border-[#2B313D]/40">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A869]">03 / Control</span>
            <p className="text-xs font-bold text-white mt-1">Project Management</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Scientific site supervision</p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#14171C]/50 border border-[#2B313D]/40">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A869]">04 / Build</span>
            <p className="text-xs font-bold text-white mt-1">Turnkey Construction</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Excavation to handover</p>
          </div>
        </div>
      </div>
    </section>
  );
}
