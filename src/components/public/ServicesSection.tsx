"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  isOverview?: boolean;
  previewLimit?: number;
}

export function ServicesSection({
  initialServices,
  isOverview = false,
  previewLimit = 4,
}: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);

  // Filter active and sort by displayOrder
  const activeServices = (initialServices || [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const displayedServices =
    isOverview && previewLimit ? activeServices.slice(0, previewLimit) : activeServices;

  return (
    <section id="services" className="py-28 bg-[#F9F6F5] relative border-t border-[#BCC1C4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>02</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Disciplines &amp; Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47]">
              Architectural &amp; Engineering Disciplines
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#455668] max-w-md font-normal leading-relaxed">
            Every MAYA project is executed with disciplined engineering and precision, ensuring a seamless
            transition from conceptual visualization to turnkey structural handover.
          </p>
        </div>

        {/* Services Grid or Empty State */}
        {displayedServices.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFFFF] border border-[#BCC1C4]/60 rounded-xs">
            <p className="text-sm text-[#455668] font-normal">
              No active services are currently listed. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {displayedServices.map((service, index) => (
              <div
                key={service.id}
                className="group rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 hover:border-[#966015] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgba(3,45,71,0.03)] hover:shadow-[0_8px_30px_rgba(3,45,71,0.08)]"
              >
                {/* Image Frame */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#F2EFEB] border-b border-[#BCC1C4]/40">
                  {service.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.thumbnailUrl}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F2EFEB] text-[#455668]">
                      <span className="text-xs uppercase tracking-widest font-mono">
                        Maya Architectural Discipline
                      </span>
                    </div>
                  )}

                  {/* Discipline Counter Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-xs bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#BCC1C4]/60 text-[#032D47] font-mono text-xs font-bold tracking-widest shadow-xs">
                    DISCIPLINE {String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* Text & Scope */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2.5">
                    <h3 className="text-xl sm:text-2xl font-black text-[#032D47] tracking-tight group-hover:text-[#966015] transition-colors duration-200">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#455668] leading-relaxed">
                      {service.shortDescription ||
                        "Bespoke engineering and architectural execution delivered with absolute precision."}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-[#BCC1C4]/40 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#966015] hover:text-[#032D47] transition-colors cursor-pointer"
                    >
                      <span>Explore Methodology</span>
                      <span className="text-sm font-serif">→</span>
                    </button>

                    <Link
                      href="/quotation"
                      className="text-[11px] font-mono font-semibold text-[#455668] hover:text-[#032D47] uppercase tracking-wider transition-colors"
                    >
                      Estimate Rate &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overview CTA */}
        {isOverview && (
          <div className="mt-14 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-xs"
            >
              <span>View All Services &amp; Methodology</span>
              <span className="font-serif">→</span>
            </Link>
          </div>
        )}
      </div>

      {/* Detailed Service Modal */}
      {selectedService && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedService(null)}
          title={selectedService.title}
          maxWidth="2xl"
          variant="light"
        >
          <div className="space-y-6 text-[#032D47]">
            {selectedService.thumbnailUrl && (
              <div className="h-60 w-full rounded-xs overflow-hidden border border-[#BCC1C4]/60 bg-[#F2EFEB]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedService.thumbnailUrl}
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#966015] mb-2 font-mono">
                Architectural Scope &amp; Methodology
              </h4>
              <p className="text-sm text-[#455668] leading-relaxed whitespace-pre-line font-normal">
                {selectedService.detailedContent || selectedService.shortDescription}
              </p>
            </div>

            <div className="pt-4 border-t border-[#BCC1C4]/40 flex items-center justify-between">
              <span className="text-xs text-[#455668] font-mono">
                MAYA Discipline #{selectedService.displayOrder}
              </span>
              <Link
                href="/quotation"
                onClick={() => setSelectedService(null)}
                className="px-5 py-2.5 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Calculate Discipline Rate &rarr;
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
