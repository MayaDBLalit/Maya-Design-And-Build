import React from "react";
import { MediaGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] pt-24 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Banner Skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-48 h-4 bg-neutral-800" />
        <Skeleton className="w-96 max-w-full h-10 bg-neutral-800" />
        <Skeleton className="w-full max-w-xl h-5 bg-neutral-800" />
      </div>

      {/* Media Grid Skeleton */}
      <MediaGridSkeleton count={6} />
    </div>
  );
}
