import React from "react";
import Link from "next/link";

interface WorkflowStep {
  number: string;
  title: string;
  duration: string;
  summary: string;
  deliverables: string[];
}

const steps: WorkflowStep[] = [
  {
    number: "01",
    title: "Estimate Prep",
    duration: "Phase 1: Initiation",
    summary:
      "Deep consultation and comprehensive physical site assessment to define functional needs, architectural style, and preliminary commercial boundaries.",
    deliverables: [
      "Physical plot & contour topography survey",
      "Client lifestyle & functional spatial brief",
      "Preliminary itemized budget projection",
    ],
  },
  {
    number: "02",
    title: "BOQ Calculation",
    duration: "Phase 2: Quantification",
    summary:
      "Scientific itemization of every structural and finishing element into a formal Bill of Quantities. Transparent quantities eliminate budget surprises.",
    deliverables: [
      "Exhaustive line-item BOQ spreadsheet",
      "Steel, cement, and finishing grade specifications",
      "Locked itemized rate schedule",
    ],
  },
  {
    number: "03",
    title: "Project Timeline",
    duration: "Phase 3: Scheduling",
    summary:
      "Critical-path project scheduling mapping every major casting, procurement window, curing cycle, and finishing stage.",
    deliverables: [
      "Gantt milestone project execution schedule",
      "Material procurement & vendor delivery pipeline",
      "Defined structural inspection dates",
    ],
  },
  {
    number: "04",
    title: "Site Execution",
    duration: "Phase 4: Construction",
    summary:
      "High-precision structural construction supervised directly by licensed civil engineers with rigorous 3-stage pre-casting checklist audits.",
    deliverables: [
      "Full-time on-site engineering supervision",
      "3-stage pre-concreting reinforcement audits",
      "Daily progress reporting & photographic logs",
    ],
  },
  {
    number: "05",
    title: "Hand Over",
    duration: "Phase 5: Delivery",
    summary:
      "Comprehensive joint walkthrough, punch-list remediation, as-built technical documentation, and ceremonial key handover.",
    deliverables: [
      "Complete as-built electrical & plumbing maps",
      "Defect-free joint handover sign-off",
      "Ceremonial possession & executed warranty docs",
    ],
  },
];

interface WorkflowSectionProps {
  isOverview?: boolean;
}

export function WorkflowSection({ isOverview = false }: WorkflowSectionProps) {
  return (
    <section id="process" className="py-28 bg-[#FFFFFF] relative border-t border-[#BCC1C4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>05</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Execution Roadmap</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47]">
              The 5-Step Engineering Workflow
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#455668] max-w-md font-normal leading-relaxed">
            Eliminating guesswork through rigorous milestone controls. From initial sketch to key
            handover, every MAYA project advances through five disciplined phases.
          </p>
        </div>

        {/* 5-Step Process Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="p-6 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 hover:border-[#032D47] transition-all duration-300 flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-[#966015] group-hover:scale-105 transition-transform">
                    {step.number}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#455668] font-bold">
                    Step {index + 1} of 5
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#032D47] tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[11px] font-mono text-[#966015] font-semibold mt-0.5">
                    {step.duration}
                  </p>
                </div>

                <p className="text-xs text-[#455668] leading-relaxed pt-1">
                  {step.summary}
                </p>
              </div>

              {/* Key Deliverables */}
              <div className="pt-4 border-t border-[#BCC1C4]/40 mt-5 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#032D47] block">
                  Core Deliverables:
                </span>
                {step.deliverables.map((d, i) => (
                  <p key={i} className="text-xs text-[#455668] flex items-start gap-1.5 leading-snug">
                    <span className="text-[#966015] font-bold text-xs leading-none shrink-0 mt-0.5">•</span>
                    <span>{d}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Overview CTA */}
        {isOverview && (
          <div className="mt-14 text-center">
            <Link
              href="/services#process"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-xs"
            >
              <span>Explore Complete 5-Step Methodology</span>
              <span className="font-serif">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
