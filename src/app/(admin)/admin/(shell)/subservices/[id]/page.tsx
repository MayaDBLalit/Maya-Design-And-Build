"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconSubServices,
  IconServices,
  IconPackages,
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

interface PackageItem {
  id: number;
  packageName: string;
  packageRatePerSqFt: string;
  isRecommended: boolean;
  isActive: boolean;
  showRatePublicly: boolean;
}

interface CalculatorItem {
  id: number;
  title: string;
  slug: string;
  isActive: boolean;
}

interface SubServiceDetail {
  id: number;
  mainServiceId: number;
  mainServiceTitle: string | null;
  serviceName: string;
  unitId: number;
  unitName: string | null;
  unitSymbol: string | null;
  baseRate: string;
  rateType: string;
  defaultQty: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AdminSubServiceDetailPage() {
  const params = useParams();
  const subServiceId = params?.id as string;

  const [rate, setRate] = useState<SubServiceDetail | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [packagesList, setPackagesList] = useState<PackageItem[]>([]);
  const [calculatorsList, setCalculatorsList] = useState<CalculatorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subServiceId) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/subservices/${subServiceId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "Failed to load subservice details");
        }
        setRate(data.rate);
        setWorkflow(data.workflow || null);
        setPackagesList(data.packages || []);
        setCalculatorsList(data.calculators || []);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [subServiceId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner size="lg" />
        <p className="text-xs font-mono text-neutral-400">Loading subservice details...</p>
      </div>
    );
  }

  if (error || !rate) {
    return (
      <div className="p-8 rounded-xl bg-[#14171C] border border-red-500/30 text-center space-y-4">
        <p className="text-red-400 text-sm font-mono">{error || "SubService not found."}</p>
        <Link
          href="/admin/subservices"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-700 transition"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Back to SubServices List</span>
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
            href="/admin/subservices"
            className="p-2 rounded-lg bg-neutral-900 border border-[#2B313D] text-neutral-400 hover:text-white hover:border-[#C5A869]/50 transition"
            title="Back to SubServices List"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Link href="/admin/subservices" className="hover:text-[#C5A869]">
                SubServices
              </Link>
              <span>/</span>
              <span className="text-white">#{rate.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3 mt-1">
              <IconSubServices className="w-7 h-7 text-[#C5A869]" />
              {rate.serviceName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-1.5 ${
              rate.isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${rate.isActive ? "bg-emerald-400" : "bg-neutral-500"}`} />
            {rate.isActive ? "Active" : "Inactive"}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#14171C] border border-[#2B313D] text-neutral-300 text-xs font-mono">
            Display Order: {rate.displayOrder}
          </span>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Service */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
            <IconServices className="w-3.5 h-3.5 text-[#C5A869]" />
            Associated Main Service
          </span>
          <div className="text-sm font-bold text-white">
            {rate.mainServiceTitle || `Service ID #${rate.mainServiceId}`}
          </div>
          <Link
            href={`/admin/services/${rate.mainServiceId}`}
            className="text-xs font-mono text-[#C5A869] hover:underline block pt-1"
          >
            View Service Architecture &rarr;
          </Link>
        </div>

        {/* Base Rate */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
            Authoritative Base Rate
          </span>
          <div className="text-2xl font-black text-white font-mono">
            ₹{rate.baseRate}
            <span className="text-xs text-neutral-400 font-normal"> / {rate.unitSymbol || rate.unitName || "unit"}</span>
          </div>
          <span className="text-[11px] font-mono text-[#C5A869] block pt-1">
            Admin Internal Pricing Matrix
          </span>
        </div>

        {/* Rate Type & Unit */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
            Rate Type &amp; Unit
          </span>
          <div className="text-sm font-bold text-white capitalize font-mono">
            {rate.rateType.replace("_", " ")}
          </div>
          <span className="text-xs font-mono text-neutral-400 block pt-1">
            Unit: {rate.unitName} ({rate.unitSymbol})
          </span>
        </div>

        {/* Default Quantity */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-5 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
            Default Calculation Qty
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {rate.defaultQty}
          </div>
          <span className="text-[11px] font-mono text-neutral-400 block pt-1">
            Default preset for calculator lines
          </span>
        </div>
      </div>

      {/* Assigned Workflow & Step Sequence */}
      <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
          <div className="flex items-center gap-2">
            <IconWorkflows className="w-5 h-5 text-[#C5A869]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Assigned Engineering Workflow &amp; Steps
            </h2>
          </div>
          {workflow && (
            <Link
              href={`/admin/workflows/${workflow.id}`}
              className="text-xs font-mono text-[#C5A869] hover:underline"
            >
              Open Workflow &rarr;
            </Link>
          )}
        </div>

        {workflow ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#0D0F12] border border-[#2B313D]">
              <div>
                <h3 className="font-bold text-white text-sm">{workflow.title}</h3>
                <span className="text-xs font-mono text-neutral-400">
                  {workflow.steps.length} sequential execution workstages
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono ${
                  workflow.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-500"
                }`}
              >
                {workflow.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflow.steps.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-lg bg-[#0D0F12] border border-[#2B313D] space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-mono font-bold text-xs flex items-center justify-center">
                      {st.stepNumber}
                    </span>
                    <h4 className="font-bold text-white text-xs truncate">{st.title}</h4>
                  </div>
                  {st.details && (
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      {st.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-[#0D0F12] border border-[#2B313D] text-center space-y-3">
            <p className="text-xs font-mono text-neutral-400">
              No workflow currently configured for this SubService.
            </p>
            <Link
              href="/admin/workflows"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#d8be82] transition"
            >
              <span>Create Workflow</span>
            </Link>
          </div>
        )}
      </div>

      {/* Packages and Calculators Containing This SubService */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Packages Containing */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
            <div className="flex items-center gap-2">
              <IconPackages className="w-5 h-5 text-[#C5A869]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Included in Packages ({packagesList.length})
              </h3>
            </div>
            <Link href="/admin/packages" className="text-xs font-mono text-[#C5A869] hover:underline">
              All Packages
            </Link>
          </div>

          {packagesList.length === 0 ? (
            <p className="text-xs font-mono text-neutral-500 py-3">
              Not currently included in any turnkey packages.
            </p>
          ) : (
            <div className="space-y-2.5">
              {packagesList.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-3 rounded-lg bg-[#0D0F12] border border-[#2B313D] flex items-center justify-between"
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

        {/* Calculators Containing */}
        <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
            <div className="flex items-center gap-2">
              <IconSubServices className="w-5 h-5 text-[#C5A869]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Included in Calculators ({calculatorsList.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-500">Public Estimators</span>
          </div>

          {calculatorsList.length === 0 ? (
            <p className="text-xs font-mono text-neutral-500 py-3">
              Not currently assigned to any public calculators.
            </p>
          ) : (
            <div className="space-y-2.5">
              {calculatorsList.map((calc) => (
                <div
                  key={calc.id}
                  className="p-3 rounded-lg bg-[#0D0F12] border border-[#2B313D] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white">{calc.title}</div>
                    <span className="text-xs font-mono text-[#C5A869]">
                      /calculator/{calc.slug}
                    </span>
                  </div>
                  <a
                    href={`/calculator/${calc.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Preview Calculator"
                  >
                    <IconEye className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
