"use client";

import React, { useState } from "react";

interface Factor {
  id: string;
  name: string;
  title: string;
  sanskrit: string;
  icon: string;
  accentColor: string;
  tagline: string;
  description: string;
  spatialPrinciple: string;
  engineeringExecution: string[];
}

const factors: Factor[] = [
  {
    id: "space",
    name: "Space",
    title: "Spatial Proportions & Volume",
    sanskrit: "Akash",
    icon: "📐",
    accentColor: "#966015",
    tagline: "Volumetric harmony, daylight sightlines, and circulation without dead corridors.",
    description:
      "Architecture begins with sculpting the void. At MAYA, we calculate human circulation vectors, ceiling proportion ratios, and open column-free expanses so interiors feel expansive, dignified, and intuitively connected to nature.",
    spatialPrinciple: "Clear span engineering & volumetric continuity",
    engineeringExecution: [
      "Optimized column-to-beam clearances maximizing usable interior volume",
      "Calculated spatial circulation preventing corridor dead zones and dark corners",
      "Harmonious vertical ceiling heights balanced with natural light penetration",
    ],
  },
  {
    id: "air",
    name: "Air",
    title: "Ventilation & Thermal Dynamics",
    sanskrit: "Vayu",
    icon: "🌬️",
    accentColor: "#032D47",
    tagline: "Microclimate modeling, passive cross-ventilation, and thermal air buoyancy.",
    description:
      "A healthy building breathes with its geography. We study seasonal wind patterns across South Gujarat to position fenestrations, double-glazed louvers, and vertical ventilation shafts for constant natural breeze, drastically minimizing artificial cooling dependency.",
    spatialPrinciple: "Passive aerodynamic cooling & indoor air purity",
    engineeringExecution: [
      "Aerodynamic window and louver placements aligned with local prevailing wind vectors",
      "Stack-effect vertical thermal shafts discharging warm air through ceiling exhausts",
      "Passive cooling breezeways maintaining fresh airflow while excluding rain and dust",
    ],
  },
  {
    id: "fire",
    name: "Fire",
    title: "Solar Orientation & Illumination",
    sanskrit: "Agni",
    icon: "☀️",
    accentColor: "#E1A857",
    tagline: "Sun-path trajectory mapping, glare-free daylighting, and energy balance.",
    description:
      "Natural light defines emotional warmth and architectural depth. We map sun angles for each facade throughout the calendar year, engineering cantilevered overhangs and thermal glass that harvest soft ambient daylight while deflecting harsh afternoon thermal radiation.",
    spatialPrinciple: "Solar angle optimization & uniform ambient illumination",
    engineeringExecution: [
      "Year-round sun-path trajectory calculations for customized facade orientations",
      "Architectural cantilevered sunshades eliminating direct summer glare",
      "High-performance low-emissivity glass keeping interiors cool and bright",
    ],
  },
  {
    id: "water",
    name: "Water",
    title: "Hydraulic Integrity & Moisture Shields",
    sanskrit: "Jal",
    icon: "💧",
    accentColor: "#455668",
    tagline: "Multi-barrier waterproofing, laser slope gradients, and rainwater harvesting.",
    description:
      "Water sustains life, yet stands as the primary adversary of structural longevity. We engineer 3-stage chemical elastomeric membranes, laser-calibrated terrace runoff slopes, and integrated rainwater recharge aquifers that protect foundations for decades.",
    spatialPrinciple: "Zero-ponding terrace geometry & deep foundation drainage",
    engineeringExecution: [
      "3-stage elastomeric and crystalline membrane waterproofing on all wet surfaces",
      "Laser-guided slope gradients preventing water ponding on terraces and balconies",
      "Sub-surface rainwater percolation and recharge pits replenishing ground aquifers",
    ],
  },
  {
    id: "earth",
    name: "Earth",
    title: "Geotechnical Foundations & Material Honesty",
    sanskrit: "Prithvi",
    icon: "🏛️",
    accentColor: "#966015",
    tagline: "Soil-bearing analysis, seismic ductile detailing, and natural material palette.",
    description:
      "Every lasting structure is rooted deep in the earth. We conduct comprehensive core-drilling soil tests to specify custom reinforced concrete footings. Our materiality celebrates authentic textures: Indian granite, kota stone, kiln-fired bricks, seasoned teak, architectural glass, and structural steel.",
    spatialPrinciple: "Seismic resilience & timeless organic materiality",
    engineeringExecution: [
      "Core-drilling geotechnical soil bearing capacity audits before foundation layout",
      "IS-compliant reinforced concrete footings with ductile seismic rebar detailing",
      "Curated natural materials: Kota stone, granite, seasoned wood, structural steel, and glass",
    ],
  },
];

export function FiveFactorsSection() {
  const [activeFactor, setActiveFactor] = useState<Factor>(factors[0]);

  return (
    <section id="factors" className="py-28 bg-[#FFFFFF] relative border-t border-[#BCC1C4]/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="space-y-4 max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
            <span>04</span>
            <span className="w-8 h-px bg-[#966015]/60" />
            <span>Signature Spatial Philosophy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47]">
            The Five Elemental Factors
          </h2>
          <p className="text-sm sm:text-base text-[#455668] leading-relaxed">
            Rooted in timeless elemental balance. Every building engineered by MAYA harmonizes Space,
            Air, Fire, Water, and Earth into enduring structural comfort and elegance.
          </p>
        </div>

        {/* Factors Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-8">
          {factors.map((factor, index) => {
            const isSelected = activeFactor.id === factor.id;
            return (
              <button
                key={factor.id}
                onClick={() => setActiveFactor(factor)}
                className={`p-4 sm:p-5 rounded-xs border text-left transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#966015] ${
                  isSelected
                    ? "bg-[#F9F6F5] border-[#966015] shadow-xs"
                    : "bg-[#FFFFFF] border-[#BCC1C4]/60 hover:border-[#455668] hover:bg-[#F9F6F5]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{factor.icon}</span>
                  <span className="text-[10px] font-mono font-bold text-[#455668]">
                    0{index + 1}
                  </span>
                </div>
                <p
                  className={`text-base font-black tracking-tight ${
                    isSelected ? "text-[#032D47]" : "text-[#455668]"
                  }`}
                >
                  {factor.name}
                </p>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#966015] font-semibold mt-0.5">
                  {factor.sanskrit}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Factor Showcase Card */}
        <div className="rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 p-8 sm:p-12 relative shadow-xs transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Factor Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl sm:text-4xl">{activeFactor.icon}</span>
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#966015] font-bold">
                    NATURAL ELEMENT • {activeFactor.sanskrit.toUpperCase()}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
                    {activeFactor.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/40">
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#966015] font-bold block mb-1">
                  Spatial Principle
                </span>
                <p className="text-sm font-semibold text-[#032D47]">
                  {activeFactor.spatialPrinciple}
                </p>
              </div>

              <p className="text-base text-[#032D47] font-medium leading-relaxed">
                {activeFactor.tagline}
              </p>

              <p className="text-sm sm:text-base text-[#455668] leading-relaxed">
                {activeFactor.description}
              </p>
            </div>

            {/* Right Column: Engineering Execution Checklist */}
            <div className="lg:col-span-5 p-7 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#BCC1C4]/40">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#032D47]">
                  MAYA Engineering Execution
                </h4>
                <span className="text-[10px] font-mono text-[#966015] font-semibold">
                  IS STANDARDS
                </span>
              </div>

              <ul className="space-y-3.5">
                {activeFactor.engineeringExecution.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#455668]">
                    <span className="text-[#966015] font-bold text-base leading-none mt-0.5">✓</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#BCC1C4]/40 text-xs text-[#455668] font-mono flex items-center justify-between">
                <span>Integrated Execution</span>
                <span className="font-bold text-[#032D47]">Turnkey Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
