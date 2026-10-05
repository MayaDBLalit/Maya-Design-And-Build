"use client";

import React, { useState } from "react";
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
}

export function GallerySection({ initialGallery }: GallerySectionProps) {
  const [filter, setFilter] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<GalleryData | null>(null);

  const activeItems = initialGallery
    .filter((g) => g.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const filteredItems = activeItems.filter((item) => {
    if (filter === "all") return true;
    return item.mediaType === filter;
  });

  return (
    <section id="gallery" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>07</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Visual Documentation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Media &amp; Walkthrough Gallery
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#14171C] border border-[#2B313D] w-fit">
            {[
              { label: "All Works", key: "all" },
              { label: "Photographs", key: "image" },
              { label: "Walkthrough Videos", key: "video" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition duration-200 cursor-pointer ${
                  filter === tab.key
                    ? "bg-[#C5A869] text-neutral-950 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#14171C] border border-[#2B313D] text-center">
            <p className="text-neutral-400 text-sm">
              No gallery items currently listed in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative rounded-2xl overflow-hidden bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869]/50 transition-all duration-300 aspect-video cursor-pointer"
              >
                {item.mediaType === "video" ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnailUrl || "/images/video-placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black/70 border border-[#C5A869] text-[#C5A869] flex items-center justify-center pl-1 text-sm shadow-xl group-hover:scale-110 transition">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                )}


                {/* Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition duration-300 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest bg-black/80 text-[#C5A869] border border-[#C5A869]/40">
                      {item.mediaType}
                    </span>
                    {item.durationSeconds && (
                      <span className="text-[11px] font-mono text-neutral-300 bg-black/70 px-2 py-0.5 rounded">
                        {item.durationSeconds}s
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug group-hover:text-[#C5A869] transition">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-1 block">
                      Click to expand &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
        >
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#2B313D] flex items-center justify-center">
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

            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-2 border-t border-[#2B313D]">
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
