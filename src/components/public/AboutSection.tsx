import React from "react";

interface AboutSectionProps {
  settings?: Record<string, string>;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const customSummary = settings?.about_summary;

  return (
    <section id="about" className="py-28 bg-[#FFFFFF] relative border-t border-[#BCC1C4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Brand Headline */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>01</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>About Maya</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47] leading-tight">
              Engineering Rigor.<br />
              <span className="text-[#966015] font-serif font-normal italic">Architectural Soul.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#455668] leading-relaxed">
              Established in <strong className="text-[#032D47] font-semibold">2021</strong> in Bardoli,
              MAYA Design &amp; Build was founded with a singular conviction: that exceptional
              architectural spaces require unyielding civil engineering and project management discipline.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60">
                <p className="text-3xl font-black text-[#966015] font-serif">2021</p>
                <p className="text-[11px] uppercase tracking-wider text-[#455668] font-mono font-bold mt-1">
                  Founded In Bardoli
                </p>
              </div>

              <div className="p-5 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60">
                <p className="text-3xl font-black text-[#032D47] font-serif">100%</p>
                <p className="text-[11px] uppercase tracking-wider text-[#455668] font-mono font-bold mt-1">
                  Single-Point Oversight
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Architectural Story & Principles */}
          <div className="lg:col-span-7 space-y-8">
            <div className="p-8 sm:p-10 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 relative shadow-xs">
              <h3 className="text-xl font-black text-[#032D47] mb-4 tracking-tight">
                The Integrated Design &amp; Build Philosophy
              </h3>

              {customSummary ? (
                <div className="text-sm text-[#455668] leading-relaxed mb-6 whitespace-pre-wrap">
                  {customSummary}
                </div>
              ) : (
                <>
                  <p className="text-sm sm:text-base text-[#455668] leading-relaxed mb-4">
                    Traditional construction is frequently plagued by communication silos between architects,
                    structural engineers, and independent labor contractors. This division often results in
                    budget creep, timeline inflation, and compromised aesthetic execution.
                  </p>

                  <p className="text-sm sm:text-base text-[#455668] leading-relaxed mb-6">
                    MAYA eliminates this division by unifying architectural design, 3D visualization,
                    structural calculation, and on-site civil execution under one engineering-driven roof.
                    Every blueprint drafted is mathematically verified for constructability, structural safety,
                    and commercial transparency.
                  </p>
                </>
              )}

              {/* 3 Structural Pillars */}
              <div className="space-y-5 pt-6 border-t border-[#BCC1C4]/50">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xs bg-[#032D47] text-[#F9F6F5] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#032D47]">
                      Scientific Project Controls
                    </h4>
                    <p className="text-xs sm:text-sm text-[#455668] mt-1 leading-relaxed">
                      Daily photographic progress reporting, formal BOQ audits, and 3-stage pre-casting checklists
                      guarantee concrete, steel, and structural execution integrity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xs bg-[#966015] text-[#F9F6F5] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#032D47]">
                      Transparent Itemized Quotations
                    </h4>
                    <p className="text-xs sm:text-sm text-[#455668] mt-1 leading-relaxed">
                      Scientific line-item rate schedules based on real square footage and deliverables,
                      eliminating arbitrary lump-sum package inflation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xs bg-[#032D47] text-[#F9F6F5] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#032D47]">
                      Single-Point Turnkey Accountability
                    </h4>
                    <p className="text-xs sm:text-sm text-[#455668] mt-1 leading-relaxed">
                      From contour topography and soil testing to final ceremonial handover, one licensed
                      engineering team remains completely accountable for your property.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
