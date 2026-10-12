"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  IconCalculator,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@/components/admin/Icons";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

interface CalculatorItem {
  id: number;
  title: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  subServices: { id: number; name: string; mainService?: string }[];
  subServicesCount: number;
}

interface SubServiceOption {
  id: number;
  serviceName: string;
  mainServiceId: number;
  mainServiceTitle?: string;
}

interface CalculatorFormData {
  title: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  subServiceIds: number[];
}

const emptyCalculatorForm: CalculatorFormData = {
  title: "",
  slug: "",
  displayOrder: 0,
  isActive: true,
  subServiceIds: [],
};

export default function AdminCalculatorsPage() {
  const [calculatorsList, setCalculatorsList] = useState<CalculatorItem[]>([]);
  const [subServices, setSubServices] = useState<SubServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CalculatorFormData>(emptyCalculatorForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<CalculatorItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [calculatorsRes, subServicesRes] = await Promise.all([
        fetch("/api/admin/calculators"),
        fetch("/api/admin/subservices"),
      ]);

      const [calculatorsData, subServicesData] = await Promise.all([
        calculatorsRes.json(),
        subServicesRes.json(),
      ]);

      if (!calculatorsRes.ok) throw new Error(calculatorsData.message || "Failed to fetch calculators");
      if (!subServicesRes.ok) throw new Error(subServicesData.message || "Failed to fetch subservices");

      setCalculatorsList(calculatorsData.calculators || []);
      setSubServices(subServicesData.rates || []);
    } catch (err: any) {
      setError(err.message || "Failed to load calculators");
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (newTitle: string) => {
    if (!editingId) {
      setFormData((prev) => ({
        ...prev,
        title: newTitle,
        slug: generateSlug(newTitle),
      }));
    } else {
      setFormData((prev) => ({ ...prev, title: newTitle }));
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyCalculatorForm,
      displayOrder: calculatorsList.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (calc: CalculatorItem) => {
    setEditingId(calc.id);
    setFormData({
      title: calc.title,
      slug: calc.slug,
      displayOrder: calc.displayOrder,
      isActive: calc.isActive,
      subServiceIds: calc.subServices ? calc.subServices.map((s) => s.id) : [],
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

  const selectAllSubServices = () => {
    setFormData((prev) => ({
      ...prev,
      subServiceIds: subServices.map((s) => s.id),
    }));
  };

  const clearAllSubServices = () => {
    setFormData((prev) => ({
      ...prev,
      subServiceIds: [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = editingId ? `/api/admin/calculators/${editingId}` : "/api/admin/calculators";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          displayOrder: Number(formData.displayOrder) || 0,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Save operation failed");
      }

      showToast(editingId ? "Calculator updated successfully" : "Calculator created successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save calculator");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/calculators/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to delete calculator");
      }

      showToast("Calculator deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete calculator");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

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
              <IconCalculator className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Calculators Management
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-mono">
            Manage public cost calculators, dynamic URL routes, and configure selectable SubServices.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d8be82] text-neutral-950 font-mono font-bold text-sm transition shadow-lg shadow-[#C5A869]/10 active:scale-98"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Calculator</span>
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

      {/* Content Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : calculatorsList.length === 0 ? (
        <div className="text-center py-16 bg-[#14171C] rounded-xl border border-[#2B313D] p-8">
          <IconCalculator className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Calculators Configured</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            Create dynamic calculators to allow clients to calculate instant estimates on the website.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] text-neutral-950 font-mono font-bold text-xs"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create Calculator</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2B313D] overflow-hidden bg-[#14171C]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2B313D] bg-[#101216] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Calculator Title</th>
                  <th className="py-3 px-4">Public URL</th>
                  <th className="py-3 px-4">Configured SubServices</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313D]/60 text-sm">
                {calculatorsList.map((calc) => (
                  <tr key={calc.id} className="hover:bg-[#1D2128] transition group">
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-xs">
                      #{calc.displayOrder}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {calc.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#C5A869]">
                      <a
                        href={`/calculator/${calc.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>/calculator/{calc.slug}</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {calc.subServices && calc.subServices.length > 0 ? (
                          calc.subServices.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 truncate"
                              title={`${s.name} (${s.mainService || ""})`}
                            >
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-500 text-xs font-mono">
                            0 SubServices (Universal Area Mode)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {calc.isActive ? (
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
                        <button
                          onClick={() => openEditModal(calc)}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                          title="Edit Calculator"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(calc)}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition"
                          title="Delete Calculator"
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
        title={editingId ? "Edit Calculator" : "Add New Calculator"}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Calculator Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
                placeholder="e.g. Turnkey Construction Calculator"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim() })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
                placeholder="turnkey-calculator"
              />
            </div>
          </div>

          {/* SubServices Selection */}
          <div className="space-y-2 pt-2 border-t border-[#2B313D]">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-mono uppercase text-[#C5A869] font-bold">
                  Configured SubServices ({formData.subServiceIds.length} selected)
                </label>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Select which SubServices/disciplines will be available in this calculator. (Zero SubServices is also valid).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllSubServices}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearAllSubServices}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto p-3 rounded-lg bg-[#0D0F12] border border-[#2B313D] space-y-1.5">
              {subServices.length === 0 ? (
                <div className="text-xs font-mono text-neutral-500 py-2 text-center">
                  No SubServices configured in database.
                </div>
              ) : (
                subServices.map((sub) => {
                  const isChecked = formData.subServiceIds.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-[#1D2128] cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubService(sub.id)}
                          className="w-4 h-4 rounded bg-[#14171C] border-[#2B313D] text-[#C5A869] focus:ring-0"
                        />
                        <span className="text-xs font-mono text-neutral-200">
                          {sub.serviceName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#C5A869] bg-neutral-900 px-2 py-0.5 rounded">
                        {sub.mainServiceTitle || `Service ${sub.mainServiceId}`}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2B313D]">
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

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0D0F12] border-[#2B313D] text-[#C5A869] focus:ring-0"
                />
                <span className="text-sm font-mono text-neutral-300">
                  Active (Visible in Navigation)
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
              <span>{editingId ? "Update Calculator" : "Create Calculator"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Calculator"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Calculator"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
