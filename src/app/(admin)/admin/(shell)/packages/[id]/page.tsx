"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconPackages,
  IconServices,
  IconSubServices,
  IconWorkflows,
  IconArrowLeft,
  IconEye,
} from "@/components/admin/Icons";
import { Spinner } from "@/components/ui/Spinner";

interface WorkflowStep {
  id: number;
  stepNumber: number;
  title: string;
  details: string | null;
  displayOrder: number;
}

interface WorkflowData {
  id: number;
  title: string;
  isActive: boolean;
  steps: WorkflowStep[];
}

interface IncludedSubService {
  id: number;
  name: string;
  baseRate?: string;
  rateType?: string;
  defaultQty?: string;
  unitName?: string | null;
  unitSymbol?: string | null;
  workflow?: WorkflowData | null;
}

interface PackageDetail {
  id: number;
  packageName: string;
  mainServiceId: number;
  mainServiceTitle: string | null;
  packageRatePerSqFt: string;
  displayOrder: number;
  isActive: boolean;
  showRatePublicly: boolean;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
  subServices: IncludedSubService[];
}

export default function AdminPackageDetailPage() {
  const params = useParams();
  const pkgId = params?.id as string;

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubServiceId, setExpandedSubServiceId] = useState<number | null>(null);

  useEffect(() => {
    if (!pkgId) return;

    const fetchPackage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/packages/${pkgId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "Failed to load package details");
        }
        setPkg(data.package);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [pkgId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner size="lg" />
        <p className="text-xs font-mono text-neutral-400">Loading package details...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="p-8 rounded-xl bg-[#14171C] border border-red-500/30 text-center space-y-4">
        <p className="text-red-400 text-sm font-mono">{error || "Package not found."}</p>
        <Link
          href="/admin/packages"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-700 transition"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Back to Packages List</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="p-2 rounded-lg bg-neutral-900 border border-[#2B313D] text-neutral-400 hover:text-white hover:border-[#C5A869]/50 transition"
            title="Back to Packages List"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Link href="/admin/packages" className="hover:text-[#C5A869]">
                Packages
              </Link>
              <span>/</span>
              <span className="text-white">#{pkg.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3 mt-1">
              <IconPackages className="w-7 h-7 text-[#C5A869]" />
              {pkg.packageName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {pkg.isRecommended && (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#C5A869]/20 text-[#C5A869] border border-[#C5A869]/40 flex items-center gap-1.5">
              <span>★</span> Recommended Package
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-1.5 ${
              pkg.isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${pkg.isActive ? "bg-emerald-400" : "bg-neutral-500"}`} />
            {pkg.isActive ? "Active" : "Inactive"}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#14171C] border border-[#2B313D] text-neutral-300 text-xs font-mono">
            Display Order: {pkg.displayOrder}
          </span>
        </div>
      </div>

      {/* Package Specification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Service */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
            <IconServices className="w-3.5 h-3.5 text-[#C5A869]" />
            Main Service
          </span>
          <div className="text-sm font-bold text-white">
            {pkg.mainServiceTitle || `Service ID #${pkg.mainServiceId}`}
          </div>
          <Link
            href={`/admin/services/${pkg.mainServiceId}`}
            className="text-xs font-mono text-[#C5A869] hover:underline block pt-1"
          >
            View Service Architecture &rarr;
          </Link>
        </div>

        {/* Square Foot Rate */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
            Package Rate (Admin View)
          </span>
          <div className="text-2xl font-black text-white font-mono">
            ₹{pkg.packageRatePerSqFt}
            <span className="text-xs text-neutral-400 font-normal"> / sq.ft</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 block pt-1">
            Authoritative turnkey calculation base
          </span>
        </div>

        {/* Public Rate Visibility */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
            Public Rate Display
          </span>
          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                pkg.showRatePublicly
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-neutral-800 text-neutral-400 border border-neutral-700"
              }`}
            >
              {pkg.showRatePublicly ? "Publicly Visible" : "Rate Kept Confidential"}
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 block pt-1">
            {pkg.showRatePublicly ? "Rate shown on public service card" : "No rate shown to visitors"}
          </span>
        </div>

        {/* Timestamps */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2 text-xs font-mono text-neutral-400">
          <span className="text-[11px] uppercase text-neutral-500 tracking-wider block">
            System Timestamps
          </span>
          <div className="pt-1 space-y-1">
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="text-white">{new Date(pkg.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated:</span>
              <span className="text-white">{new Date(pkg.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Included SubServices and Associated Workflows */}
      <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
          <div className="flex items-center gap-2">
            <IconSubServices className="w-5 h-5 text-[#C5A869]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Included SubServices &amp; Execution Workflows ({pkg.subServices.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Click on a discipline to view its full execution workflow breakdown
          </span>
        </div>

        {pkg.subServices.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-neutral-500">
            No SubServices currently bundled in this package.
          </div>
        ) : (
          <div className="space-y-4">
            {pkg.subServices.map((sub) => {
              const hasWorkflow = Boolean(sub.workflow && sub.workflow.steps?.length);
              const isExpanded = expandedSubServiceId === sub.id;

              return (
                <div
                  key={sub.id}
                  className="rounded-lg bg-[#0D0F12] border border-[#2B313D] overflow-hidden transition"
                >
                  {/* SubService Header Row */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {hasWorkflow && (
                        <button
                          type="button"
                          onClick={() => setExpandedSubServiceId(isExpanded ? null : sub.id)}
                          className="p-1 rounded text-neutral-400 hover:text-[#C5A869] cursor-pointer"
                          title="Toggle workflow breakdown"
                        >
                          <span className="font-mono text-xs">{isExpanded ? "▼" : "▶"}</span>
                        </button>
                      )}
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{sub.name}</span>
                          <span className="text-[11px] font-mono text-neutral-500">
                            (ID #{sub.id})
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 mt-0.5">
                          {sub.baseRate && (
                            <span>
                              Internal Base: <strong className="text-[#C5A869]">₹{sub.baseRate}</strong>
                            </span>
                          )}
                          {sub.rateType && (
                            <span>
                              Type: <strong className="text-white capitalize">{sub.rateType.replace("_", " ")}</strong>
                            </span>
                          )}
                          {sub.unitName && (
                            <span>
                              Unit: <strong className="text-white">{sub.unitSymbol || sub.unitName}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {hasWorkflow ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 text-[#C5A869] border border-[#C5A869]/30">
                          {sub.workflow?.steps.length} Steps Configured
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-500">
                          No Workflow Attached
                        </span>
                      )}
                      <Link
                        href={`/admin/subservices/${sub.id}`}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                        title="View SubService Details"
                      >
                        <IconEye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Expanded Workflow Steps */}
                  {isExpanded && sub.workflow && (
                    <div className="p-4 bg-[#14171C] border-t border-[#2B313D] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                          <IconWorkflows className="w-4 h-4 text-[#C5A869]" />
                          <span>Workflow: {sub.workflow.title}</span>
                        </div>
                        <Link
                          href={`/admin/workflows/${sub.workflow.id}`}
                          className="text-xs font-mono text-[#C5A869] hover:underline"
                        >
                          View Workflow Details &rarr;
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sub.workflow.steps.map((st) => (
                          <div
                            key={st.id}
                            className="p-3 rounded-lg bg-[#0D0F12] border border-[#2B313D]/70 text-xs space-y-1.5"
                          >
                            <div className="flex items-center gap-2 font-bold text-white">
                              <span className="text-[#C5A869] font-mono">Step {st.stepNumber}:</span>
                              <span className="truncate">{st.title}</span>
                            </div>
                            {st.details && (
                              <p className="text-neutral-400 text-[11px] line-clamp-3 leading-relaxed">
                                {st.details}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
