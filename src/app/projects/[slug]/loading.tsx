import React from "react";
import { Navbar } from "@/components/public/Navbar";
import { ProjectDetailSkeleton } from "@/components/ui/Skeleton";

/**
 * Route Loading UI for /projects/[slug]
 * Provides immediate visual feedback during dynamic server rendering.
 */
export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F4F4F6] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <ProjectDetailSkeleton />
      </main>
    </div>
  );
}
