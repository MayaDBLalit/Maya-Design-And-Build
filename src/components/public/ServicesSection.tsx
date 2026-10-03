"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/Modal";

export interface ServiceData {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  detailedContent: string | null;
  thumbnailUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

interface ServicesSectionProps {
  initialServices: ServiceData[];
}

export function ServicesSection({ initialServices }: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);

  // Filter active and sort by displayOrder
  const activeServices = initialServices
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section id="services" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>02</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Core Disciplines</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              The Four Architectural Pillars
            </h2>
          </div>
          <p className="text-sm text-neutral-400 max-w-md font-light leading-relaxed">
            Every MAYA project is anchored by these four specialized disciplines, ensuring seamless
            transition from conceptual visualization to turnkey structural handover.
          </p>
        </div>

        {/* Services Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeServices.map((service, index) => (
            <div
              key={service.id}
              className="group rounded-2xl bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Image Frame */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-900 border-b border-[#2B313D]">
                {service.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.thumbnailUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#14171C] to-neutral-900 text-neutral-600">
                    <span className="text-xs uppercase tracking-widest font-mono">
                      Maya Architectural Pillar
                    </span>
                  </div>
                )}

                {/* Pillar Counter Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/80 backdrop-blur-xs border border-[#C5A869]/30 text-[#C5A869] font-mono text-xs font-bold tracking-widest">
                  PILLAR 0{index + 1}
                </div>
              </div>

              {/* Text & Scope */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-[#C5A869] transition duration-200">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {service.shortDescription ||
                      "Bespoke engineering and architectural execution delivered with absolute precision."}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2B313D]/60 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#C5A869] hover:text-[#d4af37] transition cursor-pointer"
                  >
                    <span>Explore Methodology</span>
                    <span className="text-sm">→</span>
                  </button>

                  <a
                    href="#quotation"
                    className="text-[11px] font-mono text-neutral-400 hover:text-white uppercase tracking-wider"
                  >
                    Estimate Cost
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Service Modal */}
      {selectedService && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedService(null)}
          title={selectedService.title}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {selectedService.thumbnailUrl && (
              <div className="h-56 w-full rounded-lg overflow-hidden border border-[#2B313D] bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedService.thumbnailUrl}
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A869] mb-2 font-mono">
                Architectural Scope &amp; Methodology
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                {selectedService.detailedContent || selectedService.shortDescription}
              </p>
            </div>

            <div className="pt-4 border-t border-[#2B313D] flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-mono">
                MAYA Discipline #{selectedService.displayOrder}
              </span>
              <a
                href="#quotation"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 rounded bg-[#C5A869] text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-[#d4af37] transition"
              >
                Calculate Discipline Rate &rarr;
              </a>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
