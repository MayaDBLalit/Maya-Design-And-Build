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
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null);

  const baseProjects = initialProjects.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  const displayedProjects =
    isOverview && previewLimit ? baseProjects.slice(0, previewLimit) : baseProjects;

  return (
    <section id="projects" className="py-28 bg-[#F9F6F5] relative border-t border-[#BCC1C4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>03</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Architectural Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47]">
              Selected Works &amp; Transformations
            </h2>
          </div>

          {/* Category Filter Tabs */}
          {!isOverview && (
            <div className="flex items-center gap-1.5 p-1 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 w-fit shadow-xs">
              {[
                { label: "All Projects", key: "all" },
                { label: "Completed", key: "completed" },
                { label: "Ongoing", key: "ongoing" },
                { label: "Upcoming", key: "upcoming" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-4 py-2 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#966015] ${
                    activeCategory === tab.key
                      ? "bg-[#032D47] text-[#F9F6F5] font-bold shadow-xs"
                      : "text-[#455668] hover:text-[#032D47] hover:bg-[#F9F6F5]"
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
          <div className="p-16 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 text-center shadow-xs">
            <p className="text-[#455668] text-sm font-normal">
              No projects currently listed in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {displayedProjects.map((project) => {
              const isPending = navigatingSlug === project.slug;

              return (
                <div
                  key={project.id}
                  className="group rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 hover:border-[#032D47] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_rgba(3,45,71,0.03)] hover:shadow-[0_12px_36px_rgba(3,45,71,0.09)]"
                >
                  {/* Project Image Frame */}
                  <Link
                    href={`/projects/${project.slug}`}
                    prefetch={true}
                    onClick={() => setNavigatingSlug(project.slug)}
                    className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#F2EFEB] border-b border-[#BCC1C4]/40 block cursor-pointer"
                  >
                    {project.mainImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.mainImageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#F2EFEB] text-[#455668] font-mono text-xs uppercase tracking-widest">
                        Maya Architectural Project
                      </div>
                    )}

                    {/* Instant Feedback Overlay on Navigation */}
                    {isPending && (
                      <div className="absolute inset-0 bg-[#032D47]/30 backdrop-blur-xs flex items-center justify-center z-20">
                        <span className="px-4 py-2 rounded-xs bg-[#FFFFFF] text-[#032D47] font-mono text-xs font-bold uppercase tracking-widest shadow-md animate-pulse">
                          Loading Project...
                        </span>
                      </div>
                    )}

                    {/* Category Status Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                      <span
                        className={`px-3 py-1 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs ${
                          project.category === "completed"
                            ? "bg-[#FFFFFF]/90 text-emerald-800 border border-emerald-300"
                            : project.category === "ongoing"
                            ? "bg-[#FFFFFF]/90 text-blue-800 border border-blue-300"
                            : "bg-[#FFFFFF]/90 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {project.category}
                      </span>

                      {project.isFeatured && (
                        <span className="px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-[#966015] text-[#FFFFFF] shadow-xs">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Elevation Transformation Badge */}
                    {project.oldElevationUrl && project.newElevationUrl && (
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xs bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#BCC1C4]/60 text-[#966015] text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs z-10">
                        <span>⚡ Before / After Elevation</span>
                      </div>
                    )}
                  </Link>

                  {/* Project Details */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          href={`/projects/${project.slug}`}
                          prefetch={true}
                          onClick={() => setNavigatingSlug(project.slug)}
                          className="group-hover:text-[#966015] transition-colors duration-200"
                        >
                          <h3 className="text-xl sm:text-2xl font-black text-[#032D47] tracking-tight leading-snug">
                            {project.title}
                          </h3>
                        </Link>
                        {project.location && (
                          <span className="text-xs text-[#455668] font-mono font-semibold whitespace-nowrap flex items-center gap-1 shrink-0">
                            <span>📍</span>
                            <span>{project.location}</span>
                          </span>
                        )}
                      </div>

                      {project.costEstimate && (
                        <p className="text-xs font-mono font-bold text-[#966015]">
                          Execution Budget: {formatINR(parseFloat(project.costEstimate))}
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-[#455668] line-clamp-3 leading-relaxed">
                        {project.description ||
                          "Structural engineering, space planning, and architectural execution executed under MAYA design controls."}
                      </p>
                    </div>

                    {/* Link to Detail Page */}
                    <div className="pt-5 border-t border-[#BCC1C4]/40 flex items-center justify-between">
                      <Link
                        href={`/projects/${project.slug}`}
                        prefetch={true}
                        onClick={() => setNavigatingSlug(project.slug)}
                        className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                          isPending
                            ? "text-[#455668] animate-pulse"
                            : "text-[#032D47] group-hover:text-[#966015]"
                        }`}
                      >
                        <span>{isPending ? "Opening Case Study..." : "View Project Details"}</span>
                        <span className="text-sm font-serif">→</span>
                      </Link>

                      {project.oldElevationUrl && project.newElevationUrl && (
                        <span className="text-[11px] font-mono text-[#455668]">
                          Interactive Slider &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Overview CTA */}
        {isOverview && (
          <div className="mt-14 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-xs"
            >
              <span>View All Portfolio Projects</span>
              <span className="font-serif">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
