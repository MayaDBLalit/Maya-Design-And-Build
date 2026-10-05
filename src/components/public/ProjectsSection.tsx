"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/formatters";

export interface ProjectData {
  id: number;
  title: string;
  slug: string;
  category: "completed" | "ongoing" | "upcoming" | string;
  location: string | null;
  costEstimate: string | null;
  description: string | null;
  mainImageUrl: string | null;
  oldElevationUrl: string | null;
  newElevationUrl: string | null;
  displayOrder: number;
  isFeatured: boolean;
}

interface ProjectsSectionProps {
  initialProjects: ProjectData[];
  isOverview?: boolean;
  previewLimit?: number;
}

export function ProjectsSection({
  initialProjects,
  isOverview = false,
  previewLimit = 2,
}: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const baseProjects = initialProjects.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  const displayedProjects =
    isOverview && previewLimit ? baseProjects.slice(0, previewLimit) : baseProjects;

  return (
    <section id="projects" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>03</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Architectural Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Selected Works &amp; Transformations
            </h2>
          </div>

          {/* Category Filter Tabs (Always active on dedicated page; simplified on overview) */}
          {!isOverview && (
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#14171C] border border-[#2B313D] w-fit">
              {[
                { label: "All Projects", key: "all" },
                { label: "Completed", key: "completed" },
                { label: "Ongoing", key: "ongoing" },
                { label: "Upcoming", key: "upcoming" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition duration-200 cursor-pointer ${
                    activeCategory === tab.key
                      ? "bg-[#C5A869] text-neutral-950 font-bold shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {displayedProjects.length === 0 ? (
          <div className="p-16 rounded-2xl bg-[#14171C] border border-[#2B313D] text-center">
            <p className="text-neutral-400 text-sm">
              No projects currently listed in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayedProjects.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Project Image Frame */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-neutral-900 border-b border-[#2B313D]">
                  {project.mainImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.mainImageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#14171C] to-neutral-900 text-neutral-600 font-mono text-xs uppercase tracking-widest">
                      Maya Architectural Project
                    </div>
                  )}

                  {/* Category Status Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs ${
                        project.category === "completed"
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
                          : project.category === "ongoing"
                          ? "bg-blue-950/80 text-blue-300 border border-blue-700/50"
                          : "bg-amber-950/80 text-amber-300 border border-amber-700/50"
                      }`}
                    >
                      {project.category}
                    </span>

                    {project.isFeatured && (
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C5A869] text-neutral-950 shadow-xs">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Elevation Transformation Badge */}
                  {project.oldElevationUrl && project.newElevationUrl && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-black/85 backdrop-blur-xs border border-[#C5A869]/50 text-[#C5A869] text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-md">
                      <span>⚡ Before / After Elevation</span>
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-[#C5A869] transition duration-200">
                        {project.title}
                      </h3>
                      {project.location && (
                        <span className="text-xs text-neutral-400 font-medium whitespace-nowrap flex items-center gap-1">
                          <span>📍</span>
                          <span>{project.location}</span>
                        </span>
                      )}
                    </div>

                    {project.costEstimate && (
                      <p className="text-xs font-mono font-semibold text-[#C5A869]">
                        Cost Estimate: {formatINR(parseFloat(project.costEstimate))}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                      {project.description ||
                        "Structural engineering, space planning, and architectural execution executed under MAYA design controls."}
                    </p>
                  </div>

                  {/* Link to Detail Page */}
                  <div className="pt-4 border-t border-[#2B313D]/60 flex items-center justify-between">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#C5A869] hover:text-[#d4af37] transition cursor-pointer"
                    >
                      <span>View Project Details</span>
                      <span className="text-sm">→</span>
                    </Link>

                    {project.oldElevationUrl && project.newElevationUrl && (
                      <span className="text-[11px] font-mono text-neutral-400">
                        Transformation Slider &rarr;
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overview CTA */}
        {isOverview && (
          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded bg-[#14171C] hover:bg-[#1D2128] border border-[#2B313D] hover:border-[#C5A869]/50 text-white font-bold text-xs uppercase tracking-[0.15em] transition duration-300"
            >
              <span>View All Portfolio Projects</span>
              <span className="text-[#C5A869]">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
