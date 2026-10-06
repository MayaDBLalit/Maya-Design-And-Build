import React from "react";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] pt-24 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Banner Skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-48 h-4 bg-neutral-800" />
        <Skeleton className="w-96 max-w-full h-10 bg-neutral-800" />
        <Skeleton className="w-full max-w-xl h-5 bg-neutral-800" />
      </div>

      {/* Projects Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
