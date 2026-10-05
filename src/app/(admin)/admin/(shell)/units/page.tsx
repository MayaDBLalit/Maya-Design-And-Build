"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  IconUnits,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconAlert,
} from "@/components/admin/Icons";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

interface UnitItem {
  id: number;
  unitName: string;
  unitSymbol: string;
  description: string | null;
  createdAt: string;
  usageCount: number;
}

const emptyUnitForm = {
  unitName: "",
  unitSymbol: "",
  description: "",
};

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyUnitForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<UnitItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/units");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch units");
      setUnits(data.units || []);
    } catch (err: any) {
      setError(err.message || "Failed to load measurement units");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyUnitForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: UnitItem) => {
    setEditingId(unit.id);
    setFormData({
      unitName: unit.unitName,
      unitSymbol: unit.unitSymbol,
      description: unit.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/units/${editingId}` : "/api/admin/units";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitName: formData.unitName.trim().toLowerCase(),
          unitSymbol: formData.unitSymbol.trim(),
          description: formData.description.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save unit");

      setToastMessage(
        editingId ? "Unit updated successfully." : "New measurement unit created."
      );
      setTimeout(() => setToastMessage(null), 4000);
      setIsModalOpen(false);
      fetchUnits();
    } catch (err: any) {
      alert(err.message || "Error saving unit");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/units/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to delete unit");

      setToastMessage(`Unit "${deleteTarget.unitName}" deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
      setDeleteTarget(null);
      fetchUnits();
    } catch (err: any) {
      alert(err.message || "Error deleting unit");
      setDeleteTarget(null);
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
            <IconUnits className="w-7 h-7 text-[#C5A869]" />
            Measurement Units
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Dynamic units of measure (sqft, lumpsum, view, visit) for quotation calculations.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Unit</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <IconCheck className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Safety info notice */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-[#14171C] text-xs text-neutral-400 flex items-start gap-3">
        <IconAlert className="w-4 h-4 text-[#C5A869] flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-white">Relational Integrity:</span> Measurement
          units currently linked to one or more quotation pricing disciplines cannot be deleted
          until those rates are reassigned or removed.
        </p>
      </div>

      {/* Units Table */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={6} />
      ) : units.length === 0 ? (
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-12 text-center">
          <IconUnits className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Units Defined</h3>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C5A869] text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37] transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Unit</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2B313D] bg-[#0F1115] uppercase tracking-wider text-neutral-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Unit Name</th>
                  <th className="px-5 py-3.5">Symbol</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Linked Rates</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313D] text-neutral-300">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-neutral-800/40 transition">
                    <td className="px-5 py-4 font-mono text-neutral-500">#{unit.id}</td>
                    <td className="px-5 py-4 font-semibold text-white font-mono">
                      {unit.unitName}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-[#C5A869]">
                      {unit.unitSymbol}
                    </td>
                    <td className="px-5 py-4 text-neutral-400">
                      {unit.description || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {unit.usageCount > 0 ? (
                        <span className="px-2.5 py-1 rounded bg-[#C5A869]/15 border border-[#C5A869]/30 text-[#C5A869] font-mono font-semibold text-[11px]">
                          {unit.usageCount} rate{unit.usageCount > 1 ? "s" : ""} using
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">Unused</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(unit)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition cursor-pointer"
                          title="Edit unit"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(unit)}
                          disabled={unit.usageCount > 0}
                          className={`p-1.5 rounded transition ${
                            unit.usageCount > 0
                              ? "text-neutral-600 cursor-not-allowed"
                              : "text-neutral-400 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                          }`}
                          title={
                            unit.usageCount > 0
                              ? "Cannot delete: currently assigned to quotation rates"
                              : "Delete unit"
                          }
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
          title={editingId ? "Edit Measurement Unit" : "Add Measurement Unit"}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Unit Name (Identifier) *
              </label>
              <input
                type="text"
                required
                value={formData.unitName}
                onChange={(e) =>
                  setFormData({ ...formData, unitName: e.target.value })
                }
                placeholder="e.g. sqft, lumpsum, view, visit"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white font-mono focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Unit Symbol *
              </label>
              <input
                type="text"
                required
                value={formData.unitSymbol}
                onChange={(e) =>
                  setFormData({ ...formData, unitSymbol: e.target.value })
                }
                placeholder="e.g. sq.ft, LS, view, visit"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief explanation of the measurement unit..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#2B313D]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                aria-busy={isSaving}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-[#C5A869] hover:bg-[#d4af37] rounded-lg transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && <Spinner size="xs" />}
                <span>{isSaving ? "Saving..." : editingId ? "Update Unit" : "Add Unit"}</span>
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
        title="Delete Measurement Unit?"
        message={`Are you sure you want to delete unit "${deleteTarget?.unitName}" (${deleteTarget?.unitSymbol})? This action cannot be undone.`}
        confirmLabel="Delete Unit"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
