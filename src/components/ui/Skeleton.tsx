import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Shimmer / Skeleton primitive.
 * Matches MAYA Design & Build dark architectural palette.
 * Automatically respects `prefers-reduced-motion` with `motion-reduce:animate-none`.
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-neutral-800/70 rounded-md animate-pulse motion-reduce:animate-none ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Reusable Card Skeleton Grid for Admin and Public collections
 * (Services, Projects, Team, Gallery).
 */
export function CardSkeleton({
  count = 3,
  hasImage = true,
}: {
  count?: number;
  hasImage?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-busy="true"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden flex flex-col justify-between shadow-sm"
        >
          {hasImage && <Skeleton className="h-44 w-full rounded-none" />}
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="p-3.5 bg-[#0F1115] border-t border-[#2B313D] flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Reusable Table / List Skeleton
 * (Quotation Rates, Units, Inquiries).
 */
export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div
      className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden p-5 space-y-4 shadow-sm"
      role="status"
      aria-busy="true"
      aria-label="Loading data table"
    >
      <div className="flex justify-between items-center pb-3 border-b border-[#2B313D]">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center justify-between gap-4 py-3 border-b border-neutral-800/60 last:border-0"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={`h-4 ${
                c === 0 ? "w-1/3" : c === cols - 1 ? "w-20" : "w-1/5"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Metrics & Statistics Skeleton
 */
export function DashboardSkeleton() {
  return (
    <div
      className="space-y-8"
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard metrics"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#2B313D] bg-[#14171C] p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
            <div className="pt-3 border-t border-neutral-800">
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl border border-[#2B313D] bg-[#14171C]" />
        <Skeleton className="h-64 lg:col-span-2 rounded-xl border border-[#2B313D] bg-[#14171C]" />
      </div>
    </div>
  );
}

/**
 * Reusable Media Grid Skeleton
 * (Gallery, Project Sub-Images).
 */
export function MediaGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      role="status"
      aria-busy="true"
      aria-label="Loading media gallery"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="aspect-video w-full rounded-xl border border-[#2B313D]"
        />
      ))}
    </div>
  );
}

/**
 * Public Project Details Page Route Skeleton
 * (Rendered during `/projects/[slug]` route transitions).
 */
export function ProjectDetailSkeleton() {
  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      role="status"
      aria-busy="true"
      aria-label="Loading project details"
    >
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-12" />
        <span className="text-neutral-700">/</span>
        <Skeleton className="h-3 w-16" />
        <span className="text-neutral-700">/</span>
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Header Banner skeleton */}
      <div className="space-y-4 pb-6 border-b border-[#2B313D]">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-end">
          <Skeleton className="h-10 w-2/3 max-w-lg" />
          <Skeleton className="h-14 w-36 rounded-lg" />
        </div>
      </div>

      {/* Hero Showcase Image skeleton */}
      <Skeleton className="h-96 sm:h-[480px] w-full rounded-2xl border border-[#2B313D]" />

      {/* Content & Sidebar Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="p-6 sm:p-8 rounded-2xl bg-[#14171C] border border-[#2B313D] space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="p-6 rounded-2xl bg-[#14171C] border border-[#2B313D] space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Gallery Section skeleton */}
      <div className="space-y-4 pt-6 border-t border-[#2B313D]">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-56" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="aspect-video rounded-xl border border-[#2B313D]" />
          <Skeleton className="aspect-video rounded-xl border border-[#2B313D]" />
          <Skeleton className="aspect-video rounded-xl border border-[#2B313D]" />
        </div>
      </div>
    </div>
  );
}
