import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Route loading fallback for public website routes.
 * Light architectural skeleton preview.
 */
export default function PublicRootLoading() {
  return (
    <div
      className="min-h-screen bg-[#F9F6F5] text-[#032D47] flex flex-col justify-between"
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      <header className="h-20 border-b border-[#BCC1C4]/40 px-6 flex items-center justify-between bg-[#F9F6F5]">
        <Skeleton className="h-8 w-32 bg-[#BCC1C4]/30" />
        <div className="hidden md:flex gap-6">
          <Skeleton className="h-4 w-16 bg-[#BCC1C4]/20" />
          <Skeleton className="h-4 w-16 bg-[#BCC1C4]/20" />
          <Skeleton className="h-4 w-16 bg-[#BCC1C4]/20" />
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full space-y-12">
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-4 w-28 bg-[#966015]/30" />
          <Skeleton className="h-12 w-full bg-[#BCC1C4]/30" />
          <Skeleton className="h-6 w-3/4 bg-[#BCC1C4]/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xs border border-[#BCC1C4]/40 bg-[#FFFFFF]" />
          <Skeleton className="h-64 rounded-xs border border-[#BCC1C4]/40 bg-[#FFFFFF]" />
          <Skeleton className="h-64 rounded-xs border border-[#BCC1C4]/40 bg-[#FFFFFF]" />
        </div>
      </main>
    </div>
  );
}
