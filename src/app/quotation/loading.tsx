import React from "react";
import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function QuotationLoading() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] pt-24 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Banner Skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-48 h-4 bg-neutral-800" />
        <Skeleton className="w-96 max-w-full h-10 bg-neutral-800" />
        <Skeleton className="w-full max-w-xl h-5 bg-neutral-800" />
      </div>

      {/* Calculator Grid / Table Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TableSkeleton rows={6} />
        </div>
        <div className="space-y-4">
          <Skeleton className="w-full h-64 rounded-2xl bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
