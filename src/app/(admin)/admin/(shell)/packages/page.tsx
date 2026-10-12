"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  IconPackages,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconEye,
} from "@/components/admin/Icons";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

interface PackageItem {
  id: number;
  packageName: string;
  mainServiceId: number;
  mainServiceTitle?: string;
  packageRatePerSqFt: string;
  displayOrder: number;
  isActive: boolean;
  showRatePublicly: boolean;
  isRecommended: boolean;
  subServices: { id: number; name: string }[];
  subServicesCount: number;
}

interface MainServiceOption {
  id: number;
  title: string;
}

interface SubServiceOption {
  id: number;
  mainServiceId: number;
  serviceName: string;
}

interface PackageFormData {
  packageName: string;
  mainServiceId: number;
  packageRatePerSqFt: string;
  displayOrder: number;
  isActive: boolean;
  showRatePublicly: boolean;
  isRecommended: boolean;
  subServiceIds: number[];
}

const emptyPackageForm: PackageFormData = {
  packageName: "",
  mainServiceId: 0,
  packageRatePerSqFt: "",
  displayOrder: 0,
  isActive: true,
  showRatePublicly: false,
  isRecommended: false,
  subServiceIds: [],
};

export default function AdminPackagesPage() {
  const [packagesList, setPackagesList] = useState<PackageItem[]>([]);
  const [mainServices, setMainServices] = useState<MainServiceOption[]>([]);
  const [subServices, setSubServices] = useState<SubServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter
  const [filterMainService, setFilterMainService] = useState<string>("all");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(emptyPackageForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<PackageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [packagesRes, mainServicesRes, subServicesRes] = await Promise.all([
        fetch("/api/admin/packages"),
        fetch("/api/admin/services"),
        fetch("/api/admin/subservices"),
      ]);

      const [packagesData, mainServicesData, subServicesData] = await Promise.all([
        packagesRes.json(),
        mainServicesRes.json(),
        subServicesRes.json(),
      ]);

      if (!packagesRes.ok) throw new Error(packagesData.message || "Failed to fetch packages");
      if (!mainServicesRes.ok) throw new Error(mainServicesData.message || "Failed to fetch services");

      setPackagesList(packagesData.packages || []);
      setMainServices(mainServicesData.services || []);
      setSubServices(subServicesData.rates || []);

      if (mainServicesData.services?.length > 0 && formData.mainServiceId === 0) {
        setFormData((prev) => ({ ...prev, mainServiceId: mainServicesData.services[0].id }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load packages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyPackageForm,
      mainServiceId: mainServices[0]?.id || 0,
      subServiceIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PackageItem) => {
    setEditingId(item.id);
    setFormData({
      packageName: item.packageName,
      mainServiceId: item.mainServiceId,
      packageRatePerSqFt: item.packageRatePerSqFt,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      showRatePublicly: item.showRatePublicly,
      isRecommended: item.isRecommended ?? false,
      subServiceIds: item.subServices.map((s) => s.id),
    });
    setIsModalOpen(true);
  };

  const toggleSubService = (subId: number) => {
    setFormData((prev) => {
      const exists = prev.subServiceIds.includes(subId);
      return {
        ...prev,
        subServiceIds: exists
          ? prev.subServiceIds.filter((id) => id !== subId)
          : [...prev.subServiceIds, subId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = editingId ? `/api/admin/packages/${editingId}` : "/api/admin/packages";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mainServiceId: Number(formData.mainServiceId),
          packageRatePerSqFt: parseFloat(formData.packageRatePerSqFt) || 0,
          displayOrder: Number(formData.displayOrder) || 0,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Save operation failed");
      }

      showToast(editingId ? "Package updated successfully" : "Package created successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save package");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/packages/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to delete package");
      }

      showToast("Package deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete package");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter available subservices for the modal according to the selected Main Service
  const availableSubServicesForModal = subServices.filter(
    (s) => s.mainServiceId === formData.mainServiceId
  );

  const filteredPackages = packagesList.filter((pkg) => {
    if (filterMainService === "all") return true;
    return String(pkg.mainServiceId) === filterMainService;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#C5A869] text-neutral-950 font-bold px-4 py-3 rounded-lg shadow-xl animate-fade-in text-sm font-mono">
          <IconCheck className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-[#C5A869]/10 text-[#C5A869]">
              <IconPackages className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Packages Management
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-mono">
            Define service tiers, rates per sq.ft, public rate visibility, and bundle included SubServices.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d8be82] text-neutral-950 font-mono font-bold text-sm transition shadow-lg shadow-[#C5A869]/10 active:scale-98"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-neutral-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-[#14171C] p-3 rounded-xl border border-[#2B313D]">
        <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
          Filter by Main Service:
        </label>
        <select
          value={filterMainService}
          onChange={(e) => setFilterMainService(e.target.value)}
          className="bg-[#0D0F12] border border-[#2B313D] text-white text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[#C5A869]"
        >
          <option value="all">All Main Services ({packagesList.length})</option>
          {mainServices.map((ms) => (
            <option key={ms.id} value={String(ms.id)}>
              {ms.title}
            </option>
          ))}
        </select>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-16 bg-[#14171C] rounded-xl border border-[#2B313D] p-8">
          <IconPackages className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Packages Configured</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            Create packages to offer turnkey bundles with customized square-foot rates and subservice inclusions.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] text-neutral-950 font-mono font-bold text-xs"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create Package</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2B313D] overflow-hidden bg-[#14171C]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2B313D] bg-[#101216] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Package Name</th>
                  <th className="py-3 px-4">Main Service</th>
                  <th className="py-3 px-4">Rate / Sq.Ft</th>
                  <th className="py-3 px-4">Public Rate</th>
                  <th className="py-3 px-4">Recommended</th>
                  <th className="py-3 px-4">Included SubServices</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313D]/60 text-sm">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-[#1D2128] transition group">
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-xs">
                      #{pkg.displayOrder}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {pkg.packageName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#C5A869]">
                      {pkg.mainServiceTitle || `Service ID: ${pkg.mainServiceId}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      ₹{parseFloat(pkg.packageRatePerSqFt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}/sq.ft
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      {pkg.showRatePublicly ? (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Public
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      {pkg.isRecommended ? (
                        <span className="px-2 py-0.5 rounded bg-[#C5A869]/20 text-[#C5A869] font-bold border border-[#C5A869]/30">
                          Recommended
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-xs font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {pkg.subServices && pkg.subServices.length > 0 ? (
                          pkg.subServices.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 truncate"
                              title={s.name}
                            >
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-500 text-xs font-mono">None linked</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {pkg.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 text-neutral-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/packages/${pkg.id}`}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                          title="View Package Details"
                        >
                          <IconEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                          title="Edit Package"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(pkg)}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition"
                          title="Delete Package"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Package" : "Add New Package"}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Package Name *
              </label>
              <input
                type="text"
                required
                value={formData.packageName}
                onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
                placeholder="e.g. Standard Turnkey Package"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Belongs to Main Service *
              </label>
              <select
                required
                value={formData.mainServiceId}
                onChange={(e) => {
                  const newServiceId = Number(e.target.value);
                  setFormData({
                    ...formData,
                    mainServiceId: newServiceId,
                    // Clear selected subservices if they don't belong to the newly selected main service
                    subServiceIds: formData.subServiceIds.filter((id) =>
                      subServices.some((s) => s.id === id && s.mainServiceId === newServiceId)
                    ),
                  });
                }}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
              >
                {mainServices.map((ms) => (
                  <option key={ms.id} value={ms.id}>
                    {ms.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Rate Per Sq.Ft (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.packageRatePerSqFt}
                onChange={(e) => setFormData({ ...formData, packageRatePerSqFt: e.target.value })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
                placeholder="e.g. 1850.00"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecommended}
                  onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0D0F12] border-[#2B313D] text-[#C5A869] focus:ring-0"
                />
                <div>
                  <span className="text-xs font-mono text-[#C5A869] font-bold block">
                    Recommended Package
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Max 1 per Main Service (auto-unsets existing)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* SubServices Multi-Select */}
          <div className="space-y-2 pt-2 border-t border-[#2B313D]">
            <label className="block text-xs font-mono uppercase text-[#C5A869] font-bold">
              Included SubServices ({formData.subServiceIds.length} selected)
            </label>
            <p className="text-[11px] text-neutral-400 font-mono">
              Only SubServices belonging to the chosen Main Service are available for bundling.
            </p>

            <div className="max-h-48 overflow-y-auto p-3 rounded-lg bg-[#0D0F12] border border-[#2B313D] space-y-2">
              {availableSubServicesForModal.length === 0 ? (
                <div className="text-xs font-mono text-neutral-500 py-2 text-center">
                  No SubServices configured under this Main Service.
                </div>
              ) : (
                availableSubServicesForModal.map((sub) => {
                  const isChecked = formData.subServiceIds.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className="flex items-center gap-2.5 p-2 rounded hover:bg-[#1D2128] cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSubService(sub.id)}
                        className="w-4 h-4 rounded bg-[#14171C] border-[#2B313D] text-[#C5A869] focus:ring-0"
                      />
                      <span className="text-xs font-mono text-neutral-200">
                        {sub.serviceName}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#2B313D]">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
                placeholder="0"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showRatePublicly}
                  onChange={(e) => setFormData({ ...formData, showRatePublicly: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0D0F12] border-[#2B313D] text-[#C5A869] focus:ring-0"
                />
                <span className="text-xs font-mono text-neutral-300">
                  Show Rate Publicly
                </span>
              </label>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0D0F12] border-[#2B313D] text-[#C5A869] focus:ring-0"
                />
                <span className="text-xs font-mono text-neutral-300">
                  Active
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B313D]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C5A869] hover:bg-[#d8be82] text-neutral-950 font-bold text-xs font-mono shadow-md disabled:opacity-50"
            >
              {isSaving && <Spinner size="xs" />}
              <span>{editingId ? "Update Package" : "Create Package"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Package"
        message={`Are you sure you want to delete "${deleteTarget?.packageName}"? This action cannot be undone.`}
        confirmLabel="Delete Package"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
