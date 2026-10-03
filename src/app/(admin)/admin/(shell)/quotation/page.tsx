"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  IconQuotation,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@/components/admin/Icons";

interface ServiceRateItem {
  id: number;
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

interface RateFormData {
  serviceName: string;
  unitId: number;
  baseRate: string;
  rateType: "fixed" | "per_sqft" | "per_view" | "per_visit" | "percentage";
  defaultQty: string;
  isActive: boolean;
  displayOrder: number;
}

const emptyRateForm: RateFormData = {
  serviceName: "",
  unitId: 0,
  baseRate: "",
  rateType: "per_sqft",
  defaultQty: "1.00",
  isActive: true,
  displayOrder: 0,
};

export default function AdminQuotationRatesPage() {
  const [rates, setRates] = useState<ServiceRateItem[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyRateForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ServiceRateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRatesAndUnits = async () => {
    setIsLoading(true);
    try {
      const [ratesRes, unitsRes] = await Promise.all([
        fetch("/api/admin/quotation/rates"),
        fetch("/api/admin/units"),
      ]);

      const [ratesData, unitsData] = await Promise.all([
        ratesRes.json(),
        unitsRes.json(),
      ]);

      if (!ratesRes.ok) throw new Error(ratesData.message || "Failed to fetch rates");
      if (!unitsRes.ok) throw new Error(unitsData.message || "Failed to fetch units");

      setRates(ratesData.rates || []);
      setUnits(unitsData.units || []);

      if (unitsData.units?.length > 0 && formData.unitId === 0) {
        setFormData((prev) => ({ ...prev, unitId: unitsData.units[0].id }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load quotation rates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatesAndUnits();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...emptyRateForm,
      unitId: units[0]?.id || 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rate: ServiceRateItem) => {
    setEditingId(rate.id);
    setFormData({
      serviceName: rate.serviceName,
      unitId: rate.unitId,
      baseRate: rate.baseRate,
      rateType: rate.rateType,
      defaultQty: rate.defaultQty,
      isActive: rate.isActive,
      displayOrder: rate.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const url = editingId
      ? `/api/admin/quotation/rates/${editingId}`
      : "/api/admin/quotation/rates";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: formData.serviceName,
          unitId: Number(formData.unitId),
          baseRate: Number(formData.baseRate),
          rateType: formData.rateType,
          defaultQty: Number(formData.defaultQty),
          isActive: formData.isActive,
          displayOrder: Number(formData.displayOrder),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save rate");

      setToastMessage(
        editingId ? "Quotation rate updated." : "New quotation rate created."
      );
      setTimeout(() => setToastMessage(null), 4000);
      setIsModalOpen(false);
      fetchRatesAndUnits();
    } catch (err: any) {
      alert(err.message || "Error saving quotation rate");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/quotation/rates/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete rate");

      setToastMessage(`Rate "${deleteTarget.serviceName}" deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
      setDeleteTarget(null);
      fetchRatesAndUnits();
    } catch (err: any) {
      alert(err.message || "Error deleting rate");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <IconQuotation className="w-7 h-7 text-[#C5A869]" />
            Dynamic Quotation Catalog
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Configure line-item engineering rates, calculation models, and default quantities.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Pricing Discipline</span>
        </button>
      </div>

      {/* Dynamic Engine Architectural Notice */}
      <div className="p-4 rounded-xl border border-[#C5A869]/30 bg-[#C5A869]/10 text-[#F4F4F6] text-xs flex items-start gap-3">
        <span className="text-lg">⚡</span>
        <div>
          <span className="font-bold text-[#C5A869]">
            Dynamic Multi-Factor Estimation:
          </span>{" "}
          Maya Design & Build strictly calculates real-time quotations using live line-item rates
          configured below. No hardcoded or pre-bundled packages (Basic / Standard / Premium) are
          used.
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <IconCheck className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Rates Table */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-neutral-400">Loading rates...</div>
      ) : rates.length === 0 ? (
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-12 text-center">
          <IconQuotation className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Quotation Rates Configured</h3>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C5A869] text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37] transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Pricing Discipline</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2B313D] bg-[#0F1115] uppercase tracking-wider text-neutral-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Discipline / Item Name</th>
                  <th className="px-5 py-3.5">Rate Type</th>
                  <th className="px-5 py-3.5">Base Rate (₹)</th>
                  <th className="px-5 py-3.5">Unit</th>
                  <th className="px-5 py-3.5">Default Qty</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313D] text-neutral-300">
                {rates.map((rate, index) => (
                  <tr key={rate.id} className="hover:bg-neutral-800/40 transition">
                    <td className="px-5 py-4 font-mono text-neutral-500">
                      {rate.displayOrder || index + 1}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {rate.serviceName}
                    </td>
                    <td className="px-5 py-4 font-mono text-[#C5A869]">
                      <span className="px-2 py-0.5 rounded bg-[#C5A869]/10 border border-[#C5A869]/20 text-[11px]">
                        {rate.rateType}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-white text-sm">
                      ₹{parseFloat(rate.baseRate).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-4 text-neutral-300 font-mono">
                      {rate.unitSymbol} <span className="text-neutral-500 text-[10px]">({rate.unitName})</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-neutral-400">
                      {rate.defaultQty}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rate.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {rate.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(rate)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition cursor-pointer"
                          title="Edit rate"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(rate)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition cursor-pointer"
                          title="Delete rate"
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
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Quotation Rate" : "Add Pricing Discipline"}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Discipline / Service Name *
              </label>
              <input
                type="text"
                required
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData({ ...formData, serviceName: e.target.value })
                }
                placeholder="e.g. Electrical Layout & Conduit Drawings"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Calculation Model (Rate Type) *
                </label>
                <select
                  value={formData.rateType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rateType: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                >
                  <option value="per_sqft">per_sqft (Rate × Area in Sq.Ft)</option>
                  <option value="fixed">fixed (Flat / Lump-sum charge)</option>
                  <option value="per_view">per_view (Rate × 3D Views)</option>
                  <option value="per_visit">per_visit (Rate × Site Visits)</option>
                  <option value="percentage">percentage (% of Total Project)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Measurement Unit *
                </label>
                <select
                  value={formData.unitId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitId: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitName} ({u.unitSymbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Base Rate (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.baseRate}
                  onChange={(e) =>
                    setFormData({ ...formData, baseRate: e.target.value })
                  }
                  placeholder="e.g. 20.00"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Default Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.defaultQty}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultQty: e.target.value })
                  }
                  placeholder="e.g. 1.00 or 2000.00"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#2B313D]">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Status
                </label>
                <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#C5A869] focus:ring-[#C5A869] bg-neutral-900 border-[#2B313D]"
                  />
                  <span className="text-sm text-white">Active in Calculator</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#2B313D]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-[#C5A869] hover:bg-[#d4af37] rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : editingId ? "Update Rate" : "Add Rate"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quotation Rate?"
        message={`Are you sure you want to permanently remove "${deleteTarget?.serviceName}" from quotation calculation?`}
        confirmLabel="Delete Rate"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
