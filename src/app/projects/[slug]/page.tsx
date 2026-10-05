import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/public-api";
import { ElevationSlider } from "@/components/public/ElevationSlider";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { formatINR } from "@/lib/formatters";
import { getPublicSettings } from "@/lib/public-api";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | MAYA Design & Build",
    };
  }

  return {
    title: `${project.title} | MAYA Design & Build Portfolio`,
    description:
      project.description?.slice(0, 160) ||
      `Architectural and engineering transformation of ${project.title} by MAYA Design & Build in Bardoli.`,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getPublicSettings(),
  ]);

  if (!project) {
    notFound();
  }

  const hasElevationComparison =
    Boolean(project.oldElevationUrl) && Boolean(project.newElevationUrl);

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/#projects" className="hover:text-white transition">
              Projects
            </Link>
            <span>/</span>
            <span className="text-[#C5A869] truncate">{project.title}</span>
          </div>

          {/* Project Header Banner */}
          <div className="space-y-4 pb-6 border-b border-[#2B313D]">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
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
                <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#C5A869] text-neutral-950">
                  Featured Project
                </span>
              )}

              {project.location && (
                <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                  <span>📍</span>
                  <span>{project.location}</span>
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {project.title}
              </h1>

              {project.costEstimate && (
                <div className="p-3 rounded-lg bg-[#14171C] border border-[#2B313D] text-left md:text-right">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block">
                    Execution Budget
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#C5A869] font-mono">
                    {formatINR(parseFloat(project.costEstimate))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main Project Hero Showcase Image */}
          {project.mainImageUrl && (
            <div className="relative h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden border border-[#2B313D] bg-neutral-900 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.mainImageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Elevation Transformation Slider (if before/after exist) */}
          {hasElevationComparison && (
            <div className="space-y-4 p-6 sm:p-8 rounded-2xl bg-[#14171C] border border-[#2B313D]">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
                  Architectural Metamorphosis
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Before &amp; After Elevation Transformation
                </h2>
              </div>

              <ElevationSlider
                oldElevationUrl={project.oldElevationUrl!}
                newElevationUrl={project.newElevationUrl!}
                projectTitle={project.title}
              />
            </div>
          )}

          {/* Detailed Project Scope & Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-white tracking-tight font-mono uppercase">
                Project Overview &amp; Execution
              </h2>

              <div className="p-6 sm:p-8 rounded-2xl bg-[#14171C] border border-[#2B313D] space-y-4">
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-line font-light">
                  {project.description ||
                    "This project was delivered with complete engineering oversight by MAYA Design & Build, implementing rigorous structural calculations, space planning, and premium interior execution."}
                </p>
              </div>
            </div>

            {/* Project Specifications Sidebar */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white tracking-tight font-mono uppercase">
                Project Details
              </h2>

              <div className="p-6 rounded-2xl bg-[#14171C] border border-[#2B313D] space-y-4 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                    Status
                  </span>
                  <span className="text-white font-bold capitalize mt-0.5 block">
                    {project.category}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-800">
                  <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                    Location
                  </span>
                  <span className="text-white font-bold mt-0.5 block">
                    {project.location || "Bardoli, Gujarat"}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-800">
                  <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                    Design &amp; Build Team
                  </span>
                  <span className="text-[#C5A869] font-bold mt-0.5 block">
                    MAYA Design &amp; Build
                  </span>
                </div>

                <div className="pt-6 border-t border-neutral-800">
                  <Link
                    href="/#quotation"
                    className="w-full block text-center py-3 rounded bg-[#C5A869] text-neutral-950 font-bold uppercase tracking-wider hover:bg-[#d4af37] transition shadow-md"
                  >
                    Estimate Similar Project
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Project Gallery Media */}
          {project.media && project.media.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-[#2B313D]">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
                  Project Gallery
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Additional Visual Documentation ({project.media.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.media.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-xl overflow-hidden border border-[#2B313D] bg-neutral-900 aspect-video relative group"
                  >
                    {item.mediaType === "video" ? (
                      <video
                        src={item.mediaUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.mediaUrl}
                        alt={`${project.title} - Visual documentation ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Navigation CTA */}
          <div className="pt-12 border-t border-[#2B313D] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/#projects"
              className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 hover:text-white transition flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to All Projects</span>
            </Link>

            <Link
              href="/#contact"
              className="px-6 py-2.5 rounded bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869] text-xs font-semibold uppercase tracking-wider text-white transition"
            >
              Consult On Your Site
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
