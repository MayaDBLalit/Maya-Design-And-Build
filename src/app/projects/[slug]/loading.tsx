import React from "react";

export default function ProjectDetailLoading() {
  return (
    <div
      className="min-h-screen bg-[#F9F6F5] text-[#032D47] flex flex-col justify-between"
      role="status"
      aria-busy="true"
      aria-label="Loading project details"
    >
      {/* Header Placeholder */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-[#F9F6F5]/90 border-b border-[#BCC1C4]/30 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xs bg-[#BCC1C4]/20 animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-20 bg-[#BCC1C4]/30 rounded-xs animate-pulse" />
            <div className="h-2 w-14 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
          </div>
        </div>
        <div className="hidden lg:flex gap-6">
          <div className="h-3 w-16 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
          <div className="h-3 w-16 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
          <div className="h-3 w-16 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
        </div>
      </div>

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 bg-[#BCC1C4]/30 rounded-xs animate-pulse" />
            <span className="text-[#BCC1C4]">/</span>
            <div className="h-3 w-16 bg-[#BCC1C4]/30 rounded-xs animate-pulse" />
            <span className="text-[#BCC1C4]">/</span>
            <div className="h-3 w-28 bg-[#BCC1C4]/40 rounded-xs animate-pulse" />
          </div>

          {/* Project Header Banner Skeleton */}
          <div className="space-y-4 pb-6 border-b border-[#BCC1C4]/40">
            <div className="flex items-center gap-3">
              <div className="h-6 w-24 bg-[#BCC1C4]/30 rounded-xs animate-pulse" />
              <div className="h-4 w-32 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="h-10 sm:h-14 w-3/4 max-w-lg bg-[#BCC1C4]/30 rounded-xs animate-pulse" />
              <div className="h-14 w-40 bg-[#FFFFFF] border border-[#BCC1C4]/40 rounded-xs p-3 space-y-2">
                <div className="h-2 w-16 bg-[#BCC1C4]/30 rounded-xs animate-pulse" />
                <div className="h-5 w-28 bg-[#966015]/20 rounded-xs animate-pulse" />
              </div>
            </div>
          </div>

          {/* Main Hero Image Skeleton */}
          <div className="relative h-96 sm:h-[480px] w-full rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/40 overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F2EFEB]/60 to-transparent animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.25em] font-mono text-[#455668]/50">
                Loading Architectural Showcase...
              </span>
            </div>
          </div>

          {/* Content & Specs Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 p-8 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/40 space-y-4">
              <div className="h-4 w-36 bg-[#BCC1C4]/40 rounded-xs animate-pulse" />
              <div className="h-3 w-full bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
              <div className="h-3 w-11/12 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
              <div className="h-3 w-4/5 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
              <div className="h-3 w-9/12 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
            </div>

            <div className="p-6 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/40 space-y-4">
              <div className="h-3 w-24 bg-[#BCC1C4]/40 rounded-xs animate-pulse" />
              <div className="space-y-3 pt-2">
                <div className="h-3 w-full bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
                <div className="h-3 w-full bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
                <div className="h-3 w-3/4 bg-[#BCC1C4]/20 rounded-xs animate-pulse" />
              </div>
              <div className="h-10 w-full bg-[#966015]/20 rounded-xs animate-pulse mt-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
