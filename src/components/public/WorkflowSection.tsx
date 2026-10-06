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
    title: "Estimate Preparation",
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
    <section id="process" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>05</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Execution Roadmap</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              The 5-Step Engineering Workflow
            </h2>
          </div>
          <p className="text-sm text-neutral-400 max-w-md font-light leading-relaxed">
            Eliminating guesswork through rigorous milestone controls. From initial sketch to key
            handover, every MAYA project advances through five disciplined phases.
          </p>
        </div>

        {/* 5-Step Process Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="p-6 rounded-2xl bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869]/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-[#C5A869] group-hover:scale-110 transition">
                    {step.number}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Step {index + 1} of 5
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[11px] font-mono text-[#C5A869]/80 mt-0.5">
                    {step.duration}
                  </p>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed font-light pt-1">
                  {step.summary}
                </p>
              </div>

              {/* Key Deliverables */}
              <div className="pt-4 border-t border-[#2B313D]/60 mt-4 space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400 block">
                  Core Deliverables:
                </span>
                {step.deliverables.map((d, i) => (
                  <p key={i} className="text-[11px] text-neutral-300 flex items-start gap-1.5">
                    <span className="text-[#C5A869] text-xs leading-none">•</span>
                    <span>{d}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Overview CTA */}
        {isOverview && (
          <div className="mt-12 text-center">
            <Link
              href="/services#process"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded bg-[#14171C] hover:bg-[#1D2128] border border-[#2B313D] hover:border-[#C5A869]/50 text-white font-bold text-xs uppercase tracking-[0.15em] transition duration-300"
            >
              <span>Explore Complete 5-Step Methodology</span>
              <span className="text-[#C5A869]">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
