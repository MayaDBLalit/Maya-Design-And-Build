"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconWorkflows,
  IconSubServices,
  IconServices,
  IconPackages,
  IconArrowLeft,
  IconEye,
} from "@/components/admin/Icons";
import { Spinner } from "@/components/ui/Spinner";

interface WorkflowStep {
  id: number;
  workflowId: number;
  stepNumber: number;
  title: string;
  details: string | null;
  displayOrder: number;
}

interface PackageItem {
  id: number;
  packageName: string;
  packageRatePerSqFt: string;
  isRecommended: boolean;
  isActive: boolean;
}

interface WorkflowDetail {
  id: number;
  subServiceId: number;
  subServiceName: string | null;
  mainServiceId: number | null;
  mainServiceTitle: string | null;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  steps: WorkflowStep[];
  packages: PackageItem[];
}

export default function AdminWorkflowDetailPage() {
  const params = useParams();
  const wfId = params?.id as string;

  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wfId) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/workflows/${wfId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "Failed to load workflow details");
        }
        setWorkflow(data.workflow);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [wfId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner size="lg" />
        <p className="text-xs font-mono text-neutral-400">Loading workflow architecture details...</p>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="p-8 rounded-xl bg-[#14171C] border border-red-500/30 text-center space-y-4">
        <p className="text-red-400 text-sm font-mono">{error || "Workflow not found."}</p>
        <Link
          href="/admin/workflows"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-700 transition"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Back to Workflows List</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/workflows"
            className="p-2 rounded-lg bg-neutral-900 border border-[#2B313D] text-neutral-400 hover:text-white hover:border-[#C5A869]/50 transition"
            title="Back to Workflows List"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Link href="/admin/workflows" className="hover:text-[#C5A869]">
                Workflows
              </Link>
              <span>/</span>
              <span className="text-white">#{workflow.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3 mt-1">
              <IconWorkflows className="w-7 h-7 text-[#C5A869]" />
              {workflow.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-1.5 ${
              workflow.isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${workflow.isActive ? "bg-emerald-400" : "bg-neutral-500"}`} />
            {workflow.isActive ? "Active" : "Inactive"}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#14171C] border border-[#2B313D] text-neutral-300 text-xs font-mono">
            {workflow.steps.length} Steps Defined
          </span>
        </div>
      </div>

      {/* Connected Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SubService */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
            <IconSubServices className="w-3.5 h-3.5 text-[#C5A869]" />
            Associated SubService
          </span>
          <div className="text-sm font-bold text-white truncate">
            {workflow.subServiceName || `SubService #${workflow.subServiceId}`}
          </div>
          <Link
            href={`/admin/subservices/${workflow.subServiceId}`}
            className="text-xs font-mono text-[#C5A869] hover:underline block pt-1"
          >
            View SubService Details &rarr;
          </Link>
        </div>

        {/* Main Service */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
            <IconServices className="w-3.5 h-3.5 text-[#C5A869]" />
            Derived Main Service
          </span>
          <div className="text-sm font-bold text-white truncate">
            {workflow.mainServiceTitle || "None"}
          </div>
          {workflow.mainServiceId ? (
            <Link
              href={`/admin/services/${workflow.mainServiceId}`}
              className="text-xs font-mono text-[#C5A869] hover:underline block pt-1"
            >
              View Service Architecture &rarr;
            </Link>
          ) : (
            <span className="text-xs font-mono text-neutral-500 block pt-1">—</span>
          )}
        </div>

        {/* Total Steps */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
            Total Execution Steps
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {workflow.steps.length}
          </div>
          <span className="text-[11px] font-mono text-neutral-400 block pt-1">
            Standard operating procedure
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
              <span className="text-white">{new Date(workflow.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated:</span>
              <span className="text-white">{new Date(workflow.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Sequence of Steps */}
      <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
          <div className="flex items-center gap-2">
            <IconWorkflows className="w-5 h-5 text-[#C5A869]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Ordered Workflow Methodology Steps ({workflow.steps.length})
            </h2>
          </div>
          <Link
            href="/admin/workflows"
            className="text-xs font-mono text-[#C5A869] hover:underline"
          >
            Edit in Workflows Manager &rarr;
          </Link>
        </div>

        {workflow.steps.length === 0 ? (
          <p className="text-xs font-mono text-neutral-500 py-4">
            No execution steps defined for this workflow yet.
          </p>
        ) : (
          <div className="space-y-4">
            {workflow.steps.map((st) => (
              <div
                key={st.id}
                className="p-5 rounded-lg bg-[#0D0F12] border border-[#2B313D] flex flex-col md:flex-row md:items-start gap-4 transition hover:border-[#C5A869]/40"
              >
                <div className="w-10 h-10 rounded-lg bg-[#C5A869]/10 border border-[#C5A869]/30 text-[#C5A869] font-mono font-black text-base flex items-center justify-center shrink-0">
                  {st.stepNumber}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {st.title}
                    </h3>
                    <span className="text-[11px] font-mono text-neutral-500">
                      Step #{st.stepNumber} • Order: {st.displayOrder}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
                    {st.details || "No technical description provided for this workstage."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Packages that indirectly include this workflow via SubService */}
      <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
          <div className="flex items-center gap-2">
            <IconPackages className="w-5 h-5 text-[#C5A869]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Turnkey Packages Including This Workflow&apos;s Discipline ({workflow.packages?.length || 0})
            </h3>
          </div>
          <Link href="/admin/packages" className="text-xs font-mono text-[#C5A869] hover:underline">
            Manage Packages &rarr;
          </Link>
        </div>

        {(!workflow.packages || workflow.packages.length === 0) ? (
          <p className="text-xs font-mono text-neutral-500 py-3">
            None of the current turnkey packages include this workflow&apos;s subservice.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workflow.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-3.5 rounded-lg bg-[#0D0F12] border border-[#2B313D] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{pkg.packageName}</span>
                    {pkg.isRecommended && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#C5A869]/20 text-[#C5A869]">
                        Recommended
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    ₹{pkg.packageRatePerSqFt} / sq.ft
                  </span>
                </div>
                <Link
                  href={`/admin/packages/${pkg.id}`}
                  className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  title="View Package Details"
                >
                  <IconEye className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
