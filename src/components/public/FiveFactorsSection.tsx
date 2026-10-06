"use client";

import React, { useState } from "react";

interface Factor {
  id: string;
  name: string;
  title: string;
  sanskrit: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
  engineeringExecution: string[];
}

const factors: Factor[] = [
  {
    id: "space",
    name: "Space",
    title: "Spatial Proportions & Volume",
    sanskrit: "Akash",
    icon: "📐",
    color: "#C5A869",
    tagline: "Volumetric harmony and functional circulation",
    description:
      "Architecture is the art of sculpting void. We design floor plans with deliberate sightlines, double-height volumes, and seamless circulation paths that make spaces feel expansive and naturally dignified.",
    engineeringExecution: [
      "Optimized column-to-beam clearances for open interior spans",
      "Calculated spatial circulation preventing corridor dead zones",
      "Harmonious ceiling volume and vertical proportioning",
    ],
  },
  {
    id: "air",
    name: "Air",
    title: "Ventilation & Thermal Dynamics",
    sanskrit: "Vayu",
    icon: "🌬️",
    color: "#7DD3FC",
    tagline: "Natural cross-ventilation and microclimate control",
    description:
      "A healthy building breathes. We map seasonal wind vectors in Gujarat to position windows, louvers, and inner courtyards for natural cross-breezes that reduce reliance on artificial HVAC.",
    engineeringExecution: [
      "Aerodynamic fenestration aligned with prevailing wind vectors",
      "Stack-effect vertical thermal air discharge shafts",
      "Passive cooling breezeways minimizing HVAC energy loads",
    ],
  },
  {
    id: "fire",
    name: "Fire",
    title: "Solar Orientation & Illumination",
    sanskrit: "Agni",
    icon: "☀️",
    color: "#FBBF24",
    tagline: "Sun-path charting, daylighting, and energy balance",
    description:
      "Light defines emotion and energy. We calculate solar angles for each facade, integrating sun shades and overhangs that invite gentle morning light while blocking harsh afternoon heat.",
    engineeringExecution: [
      "Exact sun-path trajectory calculations for facade orientations",
      "Architectural overhangs preventing direct harsh glare",
      "Strategic glazing for uniform natural ambient daylighting",
    ],
  },
  {
    id: "water",
    name: "Water",
    title: "Moisture Shields & Flow Precision",
    sanskrit: "Jal",
    icon: "💧",
    color: "#60A5FA",
    tagline: "Multi-barrier waterproofing and slope gradient engineering",
    description:
      "Water is essential to life, yet the chief adversary of structural longevity. We implement 3-layer chemical waterproofing, slope audits, and rainwater conservation systems.",
    engineeringExecution: [
      "3-stage elastomer and chemical crystalline membrane waterproofing",
      "Laser-guided slope gradients preventing terrace water ponding",
      "Integrated rainwater harvesting and sub-surface filtration",
    ],
  },
  {
    id: "earth",
    name: "Earth",
    title: "Geotechnical & Foundation Strength",
    sanskrit: "Prithvi",
    icon: "🏛️",
    color: "#E2C78A",
    tagline: "Soil-bearing analysis, footing depth, and seismic resilience",
    description:
      "Every lasting structure begins deep underground. We perform comprehensive soil test analyses to design custom reinforced footings engineered to withstand tectonic and lateral loads.",
    engineeringExecution: [
      "Rigorous core-drilling geotechnical soil bearing capacity audits",
      "IS-compliant reinforced concrete footings and plinth tie-beams",
      "Seismic-resistant ductile detailing across structural frames",
    ],
  },
];

export function FiveFactorsSection() {
  const [activeFactor, setActiveFactor] = useState<Factor>(factors[0]);

  return (
    <section id="factors" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50 overflow-hidden">
      {/* Ambient Elemental Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[150px] opacity-15 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activeFactor.color }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="space-y-4 max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
            <span>04</span>
            <span className="w-8 h-px bg-[#C5A869]/60" />
            <span>Design Philosophy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            The Five Natural Factors
          </h2>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Rooted in timeless elemental balance. Every building designed by MAYA harmonizes Space,
            Air, Fire, Water, and Earth into enduring structural comfort.
          </p>
        </div>

        {/* Factors Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          {factors.map((factor, index) => {
            const isSelected = activeFactor.id === factor.id;
            return (
              <button
                key={factor.id}
                onClick={() => setActiveFactor(factor)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#14171C] border-[#C5A869] shadow-lg shadow-[#C5A869]/10"
                    : "bg-[#14171C]/50 border-[#2B313D] hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{factor.icon}</span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    0{index + 1}
                  </span>
                </div>
                <p
                  className={`text-sm font-bold tracking-tight ${
                    isSelected ? "text-white" : "text-neutral-400"
                  }`}
                >
                  {factor.name}
                </p>
                <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                  {factor.sanskrit}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Factor Showcase Card */}
        <div className="rounded-2xl bg-[#14171C] border border-[#2B313D] p-8 sm:p-12 relative overflow-hidden transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Factor Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeFactor.icon}</span>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#C5A869]">
                    Element {activeFactor.sanskrit}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {activeFactor.title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-neutral-200 font-normal leading-relaxed pt-2">
                {activeFactor.tagline}
              </p>

              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                {activeFactor.description}
              </p>
            </div>

            {/* Right Column: Engineering Execution Checklist */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-[#0F1115] border border-[#2B313D] space-y-4">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#C5A869]">
                MAYA Engineering Execution
              </h4>

              <ul className="space-y-3">
                {activeFactor.engineeringExecution.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-neutral-300">
                    <span className="text-[#C5A869] font-bold text-sm leading-none mt-0.5">✓</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 font-mono">
                Integrated across all 4 core MAYA disciplines.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
