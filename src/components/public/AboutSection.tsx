import React from "react";

interface AboutSectionProps {
  settings?: Record<string, string>;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const customSummary = settings?.about_summary;

  return (
    <section id="about" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Brand Headline */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>01</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>About Maya</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Engineering Rigor.<br />
              <span className="text-[#C5A869]">Architectural Soul.</span>
            </h2>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Established in <strong className="text-white font-semibold">2021</strong> in Bardoli,
              MAYA Design &amp; Build was founded with a singular conviction: that exceptional
              architecture must be matched by unyielding structural and project management
              discipline.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#14171C] border border-[#2B313D]">
                <p className="text-2xl font-black text-[#C5A869]">2021</p>
                <p className="text-xs uppercase tracking-wider text-neutral-400 mt-1">
                  Founded In Bardoli
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#14171C] border border-[#2B313D]">
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs uppercase tracking-wider text-neutral-400 mt-1">
                  Accountable Execution
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Architectural Story & Principles */}
          <div className="lg:col-span-7 space-y-8">
            <div className="p-8 rounded-2xl bg-[#14171C] border border-[#2B313D] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A869]/5 rounded-bl-full pointer-events-none" />

              <h3 className="text-lg font-bold text-white mb-3">
                The Integrated Design &amp; Build Philosophy
              </h3>

              {customSummary ? (
                <div className="text-sm text-neutral-300 leading-relaxed mb-6 whitespace-pre-wrap">
                  {customSummary}
                </div>
              ) : (
                <>
                  <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                    Traditional construction projects are frequently plagued by communication silos
                    between architects, structural engineers, and independent contractors. This friction
                    often results in budget creep, timeline delays, and compromised aesthetic execution.
                  </p>

                  <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                    MAYA eliminates this division by uniting architectural vision, interior styling,
                    structural calculation, and site execution under one unified, engineering-driven
                    roof. Every detail drafted in 3D is engineered to be accurately executed on site.
                  </p>
                </>
              )}

              <div className="space-y-4 pt-4 border-t border-[#2B313D]/80">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-[#C5A869]/10 text-[#C5A869] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5 border border-[#C5A869]/30">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Scientific Project Controls
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Daily progress reporting, formal BOQ auditing, and 3-stage pre-casting checklists
                      guarantee construction integrity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-[#C5A869]/10 text-[#C5A869] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5 border border-[#C5A869]/30">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Transparent Itemized Quotations
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Clear rate-based costing without hidden contingency markups or arbitrary package
                      tiers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-[#C5A869]/10 text-[#C5A869] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5 border border-[#C5A869]/30">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Single-Point Turnkey Responsibility
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      From soil survey to handover, your project has one dedicated engineering team
                      accountable for quality, safety, and delivery.
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
