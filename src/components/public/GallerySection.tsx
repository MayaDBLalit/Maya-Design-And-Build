"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/admin/Modal";

export interface GalleryData {
  id: number;
  title: string;
  mediaType: "image" | "video" | string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  displayOrder: number;
  isActive: boolean;
}

interface GallerySectionProps {
  initialGallery: GalleryData[];
  isOverview?: boolean;
  previewLimit?: number;
}

export function GallerySection({
  initialGallery,
  isOverview = false,
  previewLimit = 3,
}: GallerySectionProps) {
  const [filter, setFilter] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<GalleryData | null>(null);

  const activeItems = (initialGallery || [])
    .filter((g) => g.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const filteredItems = activeItems.filter((item) => {
    if (filter === "all") return true;
    return item.mediaType === filter;
  });

  const displayedItems =
    isOverview && previewLimit ? filteredItems.slice(0, previewLimit) : filteredItems;

  return (
    <section id="gallery" className="py-28 bg-[#FFFFFF] relative border-t border-[#BCC1C4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>07</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Visual Documentation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47]">
              Media &amp; Walkthrough Gallery
            </h2>
          </div>

          {/* Filter Tabs (on dedicated page) */}
          {!isOverview && (
            <div className="flex items-center gap-1.5 p-1 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 w-fit shadow-xs">
              {[
                { label: "All Works", key: "all" },
                { label: "Photographs", key: "image" },
                { label: "Walkthrough Videos", key: "video" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#966015] ${
                    filter === tab.key
                      ? "bg-[#032D47] text-[#F9F6F5] font-bold shadow-xs"
                      : "text-[#455668] hover:text-[#032D47] hover:bg-[#FFFFFF]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        {displayedItems.length === 0 ? (
          <div className="p-16 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 text-center shadow-xs">
            <p className="text-[#455668] text-sm font-normal">
              No gallery items currently listed in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative rounded-xs overflow-hidden bg-[#F2EFEB] border border-[#BCC1C4]/60 hover:border-[#032D47] transition-all duration-300 aspect-video cursor-pointer shadow-xs hover:shadow-lg"
              >
                {item.mediaType === "video" ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl || "/images/video-placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#032D47]/85 border border-[#FFFFFF]/40 text-[#F9F6F5] flex items-center justify-center pl-1 text-sm shadow-xl group-hover:scale-110 transition-transform">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                )}

                {/* Overlay Vignette with Clean Typography */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#032D47]/85 via-[#032D47]/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-widest bg-[#FFFFFF]/90 text-[#032D47] shadow-xs">
                      {item.mediaType}
                    </span>
                    {item.durationSeconds && (
                      <span className="text-[11px] font-mono text-[#F9F6F5] bg-[#032D47]/70 px-2 py-0.5 rounded-xs">
                        {item.durationSeconds}s
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#FFFFFF] tracking-tight leading-snug group-hover:text-[#E1A857] transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-mono text-[#BCC1C4] uppercase tracking-widest mt-1 block">
                      Click to expand &rarr;
                    </span>
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
              href="/gallery"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-xs"
            >
              <span>Explore Full Media Gallery</span>
              <span className="font-serif">→</span>
            </Link>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <Modal
          isOpen={true}
          onClose={() => setActiveItem(null)}
          title={activeItem.title}
          maxWidth="3xl"
          variant="light"
        >
          <div className="space-y-4 text-[#032D47]">
            <div className="relative aspect-video w-full rounded-xs overflow-hidden bg-[#032D47] border border-[#BCC1C4]/60 flex items-center justify-center">
              {activeItem.mediaType === "video" ? (
                <video
                  src={activeItem.mediaUrl}
                  poster={activeItem.thumbnailUrl || "/images/video-placeholder.svg"}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeItem.mediaUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-contain max-h-[70vh]"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#455668] pt-2 border-t border-[#BCC1C4]/40">
              <span>Media Type: {activeItem.mediaType.toUpperCase()}</span>
              {activeItem.durationSeconds && (
                <span>Duration: {activeItem.durationSeconds} Seconds</span>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
