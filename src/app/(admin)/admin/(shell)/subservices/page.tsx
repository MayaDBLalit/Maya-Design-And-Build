"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import Link from "next/link";
import {
  IconSubServices,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconEye,
} from "@/components/admin/Icons";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

interface SubServiceItem {
  id: number;
  mainServiceId: number;
  mainServiceTitle?: string;
  serviceName: string;
  unitId: number;
  unitName: string;
  unitSymbol: string;
  baseRate: string;
  rateType: "fixed" | "per_sqft" | "per_view" | "per_visit" | "percentage";
  defaultQty: string;
  isActive: boolean;
  displayOrder: number;
}

interface UnitOption {
  id: number;
  unitName: string;
  unitSymbol: string;
}

interface MainServiceOption {
  id: number;
  title: string;
}

interface SubServiceFormData {
  mainServiceId: number;
  serviceName: string;
  unitId: number;
  baseRate: string;
  rateType: "fixed" | "per_sqft" | "per_view" | "per_visit" | "percentage";
  defaultQty: string;
  isActive: boolean;
  displayOrder: number;
}

const emptySubServiceForm: SubServiceFormData = {
  mainServiceId: 0,
  serviceName: "",
  unitId: 0,
  baseRate: "",
  rateType: "per_sqft",
  defaultQty: "1.00",
  isActive: true,
  displayOrder: 0,
};

export default function AdminSubServicesPage() {
  const [subServices, setSubServices] = useState<SubServiceItem[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [mainServices, setMainServices] = useState<MainServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter
  const [selectedMainServiceFilter, setSelectedMainServiceFilter] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SubServiceFormData>(emptySubServiceForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<SubServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subServicesRes, unitsRes, mainServicesRes] = await Promise.all([
        fetch("/api/admin/subservices"),
        fetch("/api/admin/units"),
        fetch("/api/admin/services"),
      ]);

      const [subServicesData, unitsData, mainServicesData] = await Promise.all([
        subServicesRes.json(),
        unitsRes.json(),
        mainServicesRes.json(),
      ]);

      if (!subServicesRes.ok) throw new Error(subServicesData.message || "Failed to fetch sub-services");
      if (!unitsRes.ok) throw new Error(unitsData.message || "Failed to fetch units");

      setSubServices(subServicesData.rates || []);
      setUnits(unitsData.units || []);
      setMainServices(mainServicesData.services || []);

      if (unitsData.units?.length > 0 && formData.unitId === 0) {
        setFormData((prev) => ({ ...prev, unitId: unitsData.units[0].id }));
      }
      if (mainServicesData.services?.length > 0 && formData.mainServiceId === 0) {
        setFormData((prev) => ({ ...prev, mainServiceId: mainServicesData.services[0].id }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load subservices");
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
      ...emptySubServiceForm,
      unitId: units[0]?.id || 0,
      mainServiceId: mainServices[0]?.id || 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: SubServiceItem) => {
    setEditingId(item.id);
    setFormData({
      mainServiceId: item.mainServiceId,
      serviceName: item.serviceName,
      unitId: item.unitId,
      baseRate: item.baseRate,
      rateType: item.rateType,
      defaultQty: item.defaultQty,
      isActive: item.isActive,
      displayOrder: item.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = editingId ? `/api/admin/subservices/${editingId}` : "/api/admin/subservices";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mainServiceId: Number(formData.mainServiceId),
          unitId: Number(formData.unitId),
          baseRate: parseFloat(formData.baseRate) || 0,
          defaultQty: parseFloat(formData.defaultQty) || 1,
          displayOrder: Number(formData.displayOrder) || 0,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Save operation failed");
      }

      showToast(editingId ? "SubService updated successfully" : "SubService created successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save subservice");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/subservices/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to delete subservice");
      }

      showToast("SubService deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete subservice");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSubServices = subServices.filter((s) => {
    if (selectedMainServiceFilter === "all") return true;
    return String(s.mainServiceId) === selectedMainServiceFilter;
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
              <IconSubServices className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-wide">
              SubServices Catalog
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-mono">
            Manage disciplines and sub-services, internal calculation rates, and assign each to a Main Service.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d8be82] text-neutral-950 font-mono font-bold text-sm transition shadow-lg shadow-[#C5A869]/10 active:scale-98"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add SubService</span>
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
          value={selectedMainServiceFilter}
          onChange={(e) => setSelectedMainServiceFilter(e.target.value)}
          className="bg-[#0D0F12] border border-[#2B313D] text-white text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[#C5A869]"
        >
          <option value="all">All Main Services ({subServices.length})</option>
          {mainServices.map((ms) => (
            <option key={ms.id} value={String(ms.id)}>
              {ms.title}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content Table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : filteredSubServices.length === 0 ? (
        <div className="text-center py-16 bg-[#14171C] rounded-xl border border-[#2B313D] p-8">
          <IconSubServices className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No SubServices Found</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            Get started by adding your first SubService assigned to a Main Service.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] text-neutral-950 font-mono font-bold text-xs"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create SubService</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2B313D] overflow-hidden bg-[#14171C]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2B313D] bg-[#101216] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">SubService Name</th>
                  <th className="py-3 px-4">Main Service</th>
                  <th className="py-3 px-4">Internal Rate</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Rate Type</th>
                  <th className="py-3 px-4">Default Qty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313D]/60 text-sm">
                {filteredSubServices.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1D2128] transition group">
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-xs">
                      #{item.displayOrder}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {item.serviceName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#C5A869]">
                      {item.mainServiceTitle || `Service ID: ${item.mainServiceId}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      ₹{parseFloat(item.baseRate).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 font-mono text-xs">
                      {item.unitSymbol || item.unitName}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-neutral-400">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {item.rateType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300 text-xs">
                      {parseFloat(item.defaultQty)}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isActive ? (
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
                          href={`/admin/subservices/${item.id}`}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                          title="View SubService Details"
                        >
                          <IconEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                          title="Edit SubService"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition"
                          title="Delete SubService"
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
        title={editingId ? "Edit SubService" : "Add New SubService"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              SubService / Discipline Name *
            </label>
            <input
              type="text"
              required
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
              placeholder="e.g. Architectural Design & Floorplans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              Belongs to Main Service *
            </label>
            <select
              required
              value={formData.mainServiceId}
              onChange={(e) => setFormData({ ...formData, mainServiceId: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
            >
              {mainServices.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Internal Base Rate (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Measurement Unit *
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitName} ({u.unitSymbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Rate Multiplier Type
              </label>
              <select
                value={formData.rateType}
                onChange={(e) => setFormData({ ...formData, rateType: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
              >
                <option value="per_sqft">Per Sq.Ft Area Multiplier</option>
                <option value="fixed">Fixed / Lumpsum</option>
                <option value="per_view">Per 3D View Rendered</option>
                <option value="per_visit">Per Site Inspection Visit</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Default Calculation Qty
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.defaultQty}
                onChange={(e) => setFormData({ ...formData, defaultQty: e.target.value })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
                placeholder="1.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0D0F12] border-[#2B313D] text-[#C5A869] focus:ring-0"
                />
                <span className="text-sm font-mono text-neutral-300">Active / Available</span>
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
              <span>{editingId ? "Update SubService" : "Create SubService"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete SubService"
        message={`Are you sure you want to delete "${deleteTarget?.serviceName}"? This action cannot be undone.`}
        confirmLabel="Delete SubService"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
