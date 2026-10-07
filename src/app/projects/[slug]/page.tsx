import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getPublicSettings } from "@/lib/public-api";
import { ElevationSlider } from "@/components/public/ElevationSlider";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FloatingCallButton } from "@/components/public/FloatingCallButton";
import { formatINR } from "@/lib/formatters";

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
    <div className="min-h-screen bg-[#F9F6F5] text-[#032D47] font-sans flex flex-col justify-between selection:bg-[#E1A857] selection:text-[#032D47]">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#455668]">
            <Link href="/" className="hover:text-[#032D47] transition-colors">
              Home
            </Link>
            <span className="text-[#BCC1C4]">/</span>
            <Link href="/projects" className="hover:text-[#032D47] transition-colors">
              Projects
            </Link>
            <span className="text-[#BCC1C4]">/</span>
            <span className="text-[#966015] font-bold truncate">{project.title}</span>
          </nav>

          {/* Project Header Banner */}
          <div className="space-y-4 pb-6 border-b border-[#BCC1C4]/40">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider ${
                  project.category === "completed"
                    ? "bg-[#FFFFFF] text-emerald-800 border border-emerald-300"
                    : project.category === "ongoing"
                    ? "bg-[#FFFFFF] text-blue-800 border border-blue-300"
                    : "bg-[#FFFFFF] text-amber-800 border border-amber-300"
                }`}
              >
                {project.category}
              </span>

              {project.isFeatured && (
                <span className="px-3 py-1 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-[#966015] text-[#FFFFFF] shadow-xs">
                  Featured Project
                </span>
              )}

              {project.location && (
                <span className="text-xs text-[#455668] flex items-center gap-1 font-mono font-semibold">
                  <span>📍</span>
                  <span>{project.location}</span>
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#032D47]">
                {project.title}
              </h1>

              {project.costEstimate && (
                <div className="p-4 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 text-left md:text-right shadow-xs">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#455668] font-bold block">
                    Execution Budget
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#966015] font-mono mt-0.5 block">
                    {formatINR(parseFloat(project.costEstimate))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main Project Hero Showcase Image */}
          {project.mainImageUrl && (
            <div className="relative h-96 sm:h-[480px] w-full rounded-xs overflow-hidden border border-[#BCC1C4]/60 bg-[#F2EFEB] shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.mainImageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Elevation Transformation Slider */}
          {hasElevationComparison && (
            <div className="space-y-4 p-6 sm:p-8 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#966015] font-bold">
                  Architectural Metamorphosis
                </span>
                <h2 className="text-2xl font-black text-[#032D47] tracking-tight">
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
              <h2 className="text-lg font-bold text-[#032D47] tracking-tight font-mono uppercase">
                Project Overview &amp; Execution
              </h2>

              <div className="p-6 sm:p-8 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 space-y-4 shadow-xs">
                <p className="text-sm sm:text-base text-[#455668] leading-relaxed whitespace-pre-line font-normal">
                  {project.description ||
                    "This project was delivered with complete civil engineering oversight by MAYA Design & Build, implementing rigorous structural calculations, space planning, and premium interior execution."}
                </p>
              </div>
            </div>

            {/* Project Specifications Sidebar */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#032D47] tracking-tight font-mono uppercase">
                Project Specifications
              </h2>

              <div className="p-6 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 space-y-4 text-xs font-mono shadow-xs">
                <div>
                  <span className="text-[#455668] uppercase tracking-widest block text-[10px] font-bold">
                    Status
                  </span>
                  <span className="text-[#032D47] font-bold capitalize mt-0.5 block text-sm">
                    {project.category}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#BCC1C4]/40">
                  <span className="text-[#455668] uppercase tracking-widest block text-[10px] font-bold">
                    Location
                  </span>
                  <span className="text-[#032D47] font-bold mt-0.5 block text-sm">
                    {project.location || "Bardoli, Gujarat"}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#BCC1C4]/40">
                  <span className="text-[#455668] uppercase tracking-widest block text-[10px] font-bold">
                    Design &amp; Build Team
                  </span>
                  <span className="text-[#966015] font-bold mt-0.5 block text-sm">
                    MAYA Design &amp; Build
                  </span>
                </div>

                <div className="pt-6 border-t border-[#BCC1C4]/40">
                  <Link
                    href="/quotation"
                    className="w-full block text-center py-3.5 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Estimate Similar Project
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Project Gallery Media */}
          {project.media && project.media.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-[#BCC1C4]/40">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#966015] font-bold">
                  Project Gallery
                </span>
                <h2 className="text-2xl font-black text-[#032D47] tracking-tight">
                  Additional Visual Documentation ({project.media.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {project.media.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-xs overflow-hidden border border-[#BCC1C4]/60 bg-[#FFFFFF] aspect-video relative group shadow-xs hover:shadow-md transition-shadow"
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
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Navigation CTA */}
          <div className="pt-12 border-t border-[#BCC1C4]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/projects"
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#455668] hover:text-[#032D47] transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to All Projects</span>
            </Link>

            <Link
              href="/contact"
              className="px-6 py-3 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 hover:border-[#032D47] text-xs font-bold uppercase tracking-wider text-[#032D47] transition-all shadow-xs"
            >
              Consult On Your Site &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} />

      {/* Floating Call Action Button */}
      <FloatingCallButton phone={settings.contact_phone} />
    </div>
  );
}
