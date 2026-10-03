"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconServices,
  IconProjects,
  IconTeam,
  IconGallery,
  IconQuotation,
  IconUnits,
  IconSettings,
  IconPlus,
} from "@/components/admin/Icons";

interface DashboardStats {
  servicesCount: number;
  projectsCount: number;
  projectsBreakdown: {
    completed: number;
    ongoing: number;
    upcoming: number;
  };
  teamCount: number;
  galleryCount: number;
  ratesCount: number;
  activeRatesCount: number;
  unitsCount: number;
  inquiriesCount: number;
  newInquiriesCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/dashboard/stats");
        if (!res.ok) {
          throw new Error("Failed to load dashboard metrics");
        }
        const data = await res.json();
        setStats(data.stats);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Welcome to the MAYA Design & Build CMS. Monitor content, projects, and quotation rates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
          <Link
            href="/admin/gallery"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs uppercase tracking-wider transition border border-[#2B313D]"
          >
            <IconPlus className="w-4 h-4" />
            <span>Upload Media</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Core Services Card */}
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-5 shadow-sm hover:border-[#C5A869]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Core Services
            </span>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-[#C5A869] group-hover:scale-110 transition">
              <IconServices className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">
              {isLoading ? "—" : stats?.servicesCount}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              4 major architectural disciplines
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800">
            <Link
              href="/admin/services"
              className="text-xs text-[#C5A869] hover:underline font-medium inline-flex items-center gap-1"
            >
              Manage Services &rarr;
            </Link>
          </div>
        </div>

        {/* Projects Card */}
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-5 shadow-sm hover:border-[#C5A869]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Projects Portfolio
            </span>
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
              <IconProjects className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">
              {isLoading ? "—" : stats?.projectsCount}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {isLoading
                ? "Loading breakdown..."
                : `${stats?.projectsBreakdown.completed || 0} completed • ${
                    stats?.projectsBreakdown.ongoing || 0
                  } ongoing • ${stats?.projectsBreakdown.upcoming || 0} upcoming`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800">
            <Link
              href="/admin/projects"
              className="text-xs text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              View Projects &rarr;
            </Link>
          </div>
        </div>

        {/* Dynamic Quotation Rates Card */}
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-5 shadow-sm hover:border-[#C5A869]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Quotation Rates
            </span>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <IconQuotation className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">
              {isLoading ? "—" : stats?.ratesCount}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {isLoading
                ? "Loading..."
                : `${stats?.activeRatesCount || 0} active pricing disciplines`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800">
            <Link
              href="/admin/quotation"
              className="text-xs text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              Configure Rates &rarr;
            </Link>
          </div>
        </div>

        {/* Media Gallery Card */}
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-5 shadow-sm hover:border-[#C5A869]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Media Gallery
            </span>
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <IconGallery className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">
              {isLoading ? "—" : stats?.galleryCount}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Images & videos (≤ 50MB, ≤ 1 min)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800">
            <Link
              href="/admin/gallery"
              className="text-xs text-purple-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              Manage Media &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Team Members */}
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400">
              <IconTeam className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Team Engineers
              </p>
              <p className="text-xl font-bold text-white mt-0.5">
                {isLoading ? "—" : `${stats?.teamCount} Members`}
              </p>
            </div>
          </div>
          <Link
            href="/admin/team"
            className="text-xs font-semibold text-[#C5A869] hover:underline"
          >
            Manage &rarr;
          </Link>
        </div>

        {/* Measurement Units */}
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
              <IconUnits className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Rate Units
              </p>
              <p className="text-xl font-bold text-white mt-0.5">
                {isLoading ? "—" : `${stats?.unitsCount} Defined`}
              </p>
            </div>
          </div>
          <Link
            href="/admin/units"
            className="text-xs font-semibold text-[#C5A869] hover:underline"
          >
            Configure &rarr;
          </Link>
        </div>

        {/* Website Settings */}
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-neutral-800 text-neutral-300">
              <IconSettings className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Site Settings
              </p>
              <p className="text-xl font-bold text-white mt-0.5">Public Config</p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="text-xs font-semibold text-[#C5A869] hover:underline"
          >
            Edit &rarr;
          </Link>
        </div>
      </div>

      {/* Maya Architectural Philosophy Summary Card */}
      <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-6">
        <h3 className="text-base font-bold text-white mb-2">
          MAYA Design & Build Digital Engine
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-3xl">
          Content modified in this CMS instantly powers the public REST endpoints and dynamic
          quotation calculator. All uploads are stored in local high-performance storage with safe
          UUID keys. 4 core services are permanently anchored to ensure brand integrity.
        </p>
      </div>
    </div>
  );
}
