import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Route loading fallback for public website routes.
 * Provides a subtle top-level skeleton preview.
 */
export default function PublicRootLoading() {
  return (
    <div
      className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] flex flex-col justify-between"
      role="status"
      aria-busy="true"
      aria-label="Loading page"
    >
      <header className="h-20 border-b border-[#2B313D] px-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="hidden md:flex gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full space-y-12">
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl border border-[#2B313D] bg-[#14171C]" />
          <Skeleton className="h-64 rounded-xl border border-[#2B313D] bg-[#14171C]" />
          <Skeleton className="h-64 rounded-xl border border-[#2B313D] bg-[#14171C]" />
        </div>
      </main>
    </div>
  );
}
