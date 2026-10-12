"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconServices,
  IconPackages,
  IconSubServices,
  IconWorkflows,
  IconArrowLeft,
  IconCheck,
  IconEye,
} from "@/components/admin/Icons";
import { Spinner } from "@/components/ui/Spinner";

interface ServiceData {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  detailedContent: string | null;
  thumbnailUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PackageItem {
  id: number;
  packageName: string;
  packageRatePerSqFt: string;
  displayOrder: number;
  isActive: boolean;
  showRatePublicly: boolean;
  isRecommended: boolean;
  subServices: { id: number; name: string }[];
}

interface SubServiceItem {
  id: number;
  serviceName: string;
  baseRate: string;
  rateType: string;
  defaultQty: string;
  unitName: string | null;
  unitSymbol: string | null;
  isActive: boolean;
  displayOrder: number;
}

interface WorkflowItem {
  id: number;
  subServiceId: number;
  subServiceName: string | null;
  title: string;
  isActive: boolean;
  steps: {
    id: number;
    stepNumber: number;
    title: string;
    details: string | null;
    displayOrder: number;
  }[];
}

export default function AdminServiceDetailPage() {
  const params = useParams();
  const serviceId = params?.id as string;

  const [service, setService] = useState<ServiceData | null>(null);
  const [packagesList, setPackagesList] = useState<PackageItem[]>([]);
  const [subServicesList, setSubServicesList] = useState<SubServiceItem[]>([]);
  const [workflowsList, setWorkflowsList] = useState<WorkflowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/services/${serviceId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "Failed to load service details");
        }
        setService(data.service);
        setPackagesList(data.packages || []);
        setSubServicesList(data.subServices || []);
        setWorkflowsList(data.workflows || []);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [serviceId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Spinner size="lg" />
        <p className="text-xs font-mono text-neutral-400">Loading service architecture details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-8 rounded-xl bg-[#14171C] border border-red-500/30 text-center space-y-4">
        <p className="text-red-400 text-sm font-mono">{error || "Service discipline not found."}</p>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-700 transition"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Back to Services List</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="p-2 rounded-lg bg-neutral-900 border border-[#2B313D] text-neutral-400 hover:text-white hover:border-[#C5A869]/50 transition"
            title="Back to Services List"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Link href="/admin/services" className="hover:text-[#C5A869]">
                Services
              </Link>
              <span>/</span>
              <span className="text-white">#{service.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3 mt-1">
              <IconServices className="w-7 h-7 text-[#C5A869]" />
              {service.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-1.5 ${
              service.isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${service.isActive ? "bg-emerald-400" : "bg-neutral-500"}`} />
            {service.isActive ? "Active (Public)" : "Inactive"}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#14171C] border border-[#2B313D] text-neutral-300 text-xs font-mono">
            Display Order: {service.displayOrder}
          </span>
        </div>
      </div>

      {/* Main Service Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Methodology */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#2B313D] pb-3">
              <span className="w-2 h-2 rounded-full bg-[#C5A869]" />
              Discipline Metadata &amp; Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#0D0F12] rounded-lg border border-[#2B313D]/50 space-y-1">
                <span className="text-neutral-500">Public Route URL:</span>
                <div className="text-[#C5A869] font-bold">/services/{service.slug}</div>
              </div>
              <div className="p-3 bg-[#0D0F12] rounded-lg border border-[#2B313D]/50 space-y-1">
                <span className="text-neutral-500">System Record ID:</span>
                <div className="text-white font-bold">#{service.id}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                Short Description (Catalog Summary)
              </label>
              <p className="text-sm text-neutral-300 bg-[#0D0F12] p-4 rounded-lg border border-[#2B313D]/50 leading-relaxed">
                {service.shortDescription || "No short description provided."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                Detailed Scope &amp; Methodology
              </label>
              <div className="text-sm text-neutral-300 bg-[#0D0F12] p-4 rounded-lg border border-[#2B313D]/50 leading-relaxed whitespace-pre-line font-sans">
                {service.detailedContent || "No comprehensive methodology content documented."}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Media & Meta */}
        <div className="space-y-6">
          <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#2B313D] pb-3">
              Cover Image / Thumbnail
            </h2>
            <div className="h-48 w-full bg-neutral-900 rounded-lg overflow-hidden border border-[#2B313D] flex items-center justify-center">
              {service.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={service.thumbnailUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-neutral-600 text-xs font-mono">
                  No image attached
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#2B313D]/60 space-y-2 text-xs font-mono text-neutral-400">
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-white">{new Date(service.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="text-white">{new Date(service.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Packages Section */}
      <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
          <div className="flex items-center gap-2">
            <IconPackages className="w-5 h-5 text-[#C5A869]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Connected Turnkey Packages ({packagesList.length})
            </h2>
          </div>
          <Link
            href="/admin/packages"
            className="text-xs font-mono text-[#C5A869] hover:underline"
          >
            Manage Packages &rarr;
          </Link>
        </div>

        {packagesList.length === 0 ? (
          <p className="text-xs font-mono text-neutral-500 py-4">
            No packages currently associated with this Main Service.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packagesList.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-4 rounded-lg bg-[#0D0F12] border transition-all flex flex-col justify-between ${
                  pkg.isRecommended ? "border-[#C5A869]/80 shadow-xs" : "border-[#2B313D]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-white text-sm truncate">{pkg.packageName}</h3>
                    {pkg.isRecommended && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C5A869]/20 text-[#C5A869] border border-[#C5A869]/40 uppercase">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-white font-bold">₹{pkg.packageRatePerSqFt} / sq.ft</span>
                    <span className="text-neutral-500">•</span>
                    <span className={pkg.showRatePublicly ? "text-emerald-400" : "text-neutral-500"}>
                      {pkg.showRatePublicly ? "Public Rate" : "Rate Private"}
                    </span>
                  </div>

                  {/* Included Subservices */}
                  <div className="pt-2 border-t border-[#2B313D]/40">
                    <span className="text-[11px] font-mono text-neutral-500 block mb-1">
                      Included SubServices ({pkg.subServices.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {pkg.subServices.map((sub) => (
                        <span
                          key={sub.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#2B313D]/40 flex items-center justify-between">
                  <span className={`text-[11px] font-mono ${pkg.isActive ? "text-emerald-400" : "text-neutral-500"}`}>
                    {pkg.isActive ? "Active" : "Inactive"}
                  </span>
                  <Link
                    href={`/admin/packages/${pkg.id}`}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[#C5A869] hover:text-white"
                  >
                    <IconEye className="w-3.5 h-3.5" />
                    <span>View Package &rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected SubServices Section */}
      <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
          <div className="flex items-center gap-2">
            <IconSubServices className="w-5 h-5 text-[#C5A869]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Associated SubServices &amp; Disciplines ({subServicesList.length})
            </h2>
          </div>
          <Link
            href="/admin/subservices"
            className="text-xs font-mono text-[#C5A869] hover:underline"
          >
            Manage SubServices &rarr;
          </Link>
        </div>

        {subServicesList.length === 0 ? (
          <p className="text-xs font-mono text-neutral-500 py-4">
            No SubServices currently linked to this Main Service.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#2B313D] text-[11px] font-mono uppercase tracking-wider text-neutral-400 bg-[#101216]">
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">SubService Name</th>
                  <th className="py-2.5 px-3">Internal Base Rate</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Rate Type</th>
                  <th className="py-2.5 px-3">Default Qty</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313D]/40 font-mono text-xs">
                {subServicesList.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#1D2128] transition">
                    <td className="py-3 px-3 text-neutral-400">{sub.displayOrder}</td>
                    <td className="py-3 px-3 font-semibold text-white font-sans">{sub.serviceName}</td>
                    <td className="py-3 px-3 text-[#C5A869] font-bold">₹{sub.baseRate}</td>
                    <td className="py-3 px-3 text-neutral-300">{sub.unitSymbol || sub.unitName || "—"}</td>
                    <td className="py-3 px-3 text-neutral-300 capitalize">{sub.rateType.replace("_", " ")}</td>
                    <td className="py-3 px-3 text-neutral-400">{sub.defaultQty}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${sub.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-500"}`}>
                        {sub.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/subservices/${sub.id}`}
                        className="inline-flex items-center gap-1 text-neutral-400 hover:text-white"
                        title="View Details"
                      >
                        <IconEye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Associated Workflows & Steps Breakdown */}
      <div className="bg-[#14171C] border border-[#2B313D] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B313D]">
          <div className="flex items-center gap-2">
            <IconWorkflows className="w-5 h-5 text-[#C5A869]" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Engineering Workflows ({workflowsList.length})
            </h2>
          </div>
          <Link
            href="/admin/workflows"
            className="text-xs font-mono text-[#C5A869] hover:underline"
          >
            Manage Workflows &rarr;
          </Link>
        </div>

        {workflowsList.length === 0 ? (
          <p className="text-xs font-mono text-neutral-500 py-4">
            No workflows configured for the subservices of this Main Service.
          </p>
        ) : (
          <div className="space-y-4">
            {workflowsList.map((wf) => (
              <div key={wf.id} className="p-4 rounded-lg bg-[#0D0F12] border border-[#2B313D] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#2B313D]/40">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{wf.title}</span>
                    <span className="text-xs font-mono text-[#C5A869]">
                      ({wf.subServiceName || `SubService #${wf.subServiceId}`})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-mono ${wf.isActive ? "text-emerald-400" : "text-neutral-500"}`}>
                      {wf.isActive ? "Active" : "Inactive"}
                    </span>
                    <Link
                      href={`/admin/workflows/${wf.id}`}
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#C5A869] hover:text-white"
                    >
                      <IconEye className="w-3.5 h-3.5" />
                      <span>View Workflow &rarr;</span>
                    </Link>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-mono text-neutral-500 block">
                    Execution Steps ({wf.steps.length}):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {wf.steps.map((st) => (
                      <div key={st.id} className="p-2.5 rounded bg-neutral-900 border border-[#2B313D]/60 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span className="text-[#C5A869] font-mono">Step {st.stepNumber}:</span>
                          <span className="truncate">{st.title}</span>
                        </div>
                        {st.details && (
                          <p className="text-neutral-400 text-[11px] line-clamp-2 leading-relaxed font-sans">
                            {st.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
