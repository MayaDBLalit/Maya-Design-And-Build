import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Route loading boundary for the authenticated Admin Panel shell.
 * Provides immediate localized skeleton feedback when switching admin tabs.
 */
export default function AdminShellLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Loading administrative section"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-64 rounded-xl border border-[#2B313D] bg-[#14171C]"
          />
        ))}
      </div>
    </div>
  );
}
