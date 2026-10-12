"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  IconBHK,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@/components/admin/Icons";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

interface BHKItem {
  id: number;
  bhkNumber: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface BHKFormData {
  bhkNumber: number | string;
  displayOrder: number;
  isActive: boolean;
}

const emptyBHKForm: BHKFormData = {
  bhkNumber: "",
  displayOrder: 0,
  isActive: true,
};

export default function AdminBHKPage() {
  const [bhkList, setBhkList] = useState<BHKItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BHKFormData>(emptyBHKForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<BHKItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBHK = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bhk");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch BHK configurations");
      setBhkList(data.bhkConfigurations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load BHK configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBHK();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyBHKForm,
      displayOrder: bhkList.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: BHKItem) => {
    setEditingId(item.id);
    setFormData({
      bhkNumber: item.bhkNumber,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = editingId ? `/api/admin/bhk/${editingId}` : "/api/admin/bhk";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bhkNumber: Number(formData.bhkNumber),
          displayOrder: Number(formData.displayOrder) || 0,
          isActive: formData.isActive,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Save operation failed");
      }

      showToast(editingId ? "BHK configuration updated" : "BHK configuration created");
      setIsModalOpen(false);
      fetchBHK();
    } catch (err: any) {
      setError(err.message || "Failed to save BHK configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/bhk/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to delete BHK configuration");
      }

      showToast("BHK configuration deleted successfully");
      setDeleteTarget(null);
      fetchBHK();
    } catch (err: any) {
      setError(err.message || "Failed to delete BHK configuration");
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
              <IconBHK className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-wide">
              BHK Configuration
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-mono">
            Manage residential BHK configurations (informational only; does not alter calculation rates).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d8be82] text-neutral-950 font-mono font-bold text-sm transition shadow-lg shadow-[#C5A869]/10 active:scale-98"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add BHK Option</span>
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
      ) : bhkList.length === 0 ? (
        <div className="text-center py-16 bg-[#14171C] rounded-xl border border-[#2B313D] p-8">
          <IconBHK className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No BHK Options</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            Configure bedroom-hall-kitchen options for client quotation inquiries.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] text-neutral-950 font-mono font-bold text-xs"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add BHK Option</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2B313D] overflow-hidden bg-[#14171C] max-w-3xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2B313D] bg-[#101216] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">BHK Number</th>
                <th className="py-3 px-4">Public Label</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B313D]/60 text-sm">
              {bhkList.map((item) => (
                <tr key={item.id} className="hover:bg-[#1D2128] transition group">
                  <td className="py-3.5 px-4 font-mono text-neutral-400 text-xs">
                    #{item.displayOrder}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white font-mono">
                    {item.bhkNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#C5A869] font-semibold">
                    {item.bhkNumber} BHK
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
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                        title="Edit BHK"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition"
                        title="Delete BHK"
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
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit BHK Option" : "Add BHK Option"}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
              BHK Number * (e.g. 1, 2, 3, 4)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={formData.bhkNumber}
              onChange={(e) => setFormData({ ...formData, bhkNumber: e.target.value })}
              className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
              placeholder="e.g. 3"
            />
            {formData.bhkNumber && (
              <p className="text-[11px] font-mono text-[#C5A869] mt-1">
                Will be displayed as "{formData.bhkNumber} BHK" to public clients.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <span>{editingId ? "Update BHK" : "Add BHK"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete BHK Configuration"
        message={`Are you sure you want to delete ${deleteTarget?.bhkNumber} BHK?`}
        confirmLabel="Delete BHK"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
