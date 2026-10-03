"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { FileUpload } from "@/components/admin/FileUpload";
import { IconServices, IconEdit, IconCheck } from "@/components/admin/Icons";

interface ServiceItem {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  detailedContent: string | null;
  thumbnailUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch services");
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message || "Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditClick = (service: ServiceItem) => {
    setEditingService({ ...service });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingService.title,
          shortDescription: editingService.shortDescription,
          detailedContent: editingService.detailedContent,
          thumbnailUrl: editingService.thumbnailUrl,
          displayOrder: Number(editingService.displayOrder),
          isActive: editingService.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to update service");

      setToastMessage(`Service "${editingService.title}" updated successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      setEditingService(null);
      fetchServices();
    } catch (err: any) {
      alert(err.message || "Error updating service");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <IconServices className="w-7 h-7 text-[#C5A869]" />
            Core Architectural Services
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage the 4 foundational disciplines of MAYA Design & Build.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-lg bg-[#C5A869]/10 border border-[#C5A869]/30 text-[#C5A869] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <IconCheck className="w-4 h-4" />
          <span>4 Core Services Protected</span>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <IconCheck className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Services List Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-neutral-400">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C5A869]/40 transition"
            >
              <div>
                {/* Thumbnail / Header */}
                <div className="relative h-44 w-full bg-neutral-900 border-b border-[#2B313D] overflow-hidden">
                  {service.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.thumbnailUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600">
                      <IconServices className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs">No thumbnail attached</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-black/80 text-[#C5A869] border border-[#C5A869]/30">
                      Core #{index + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                        service.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-xs font-mono text-[#C5A869] mt-0.5">
                        /{service.slug}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded">
                      Order: {service.displayOrder}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {service.shortDescription || "No short description provided."}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#0F1115] border-t border-[#2B313D] flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  ID: #{service.id}
                </span>
                <button
                  onClick={() => handleEditClick(service)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-[#C5A869] hover:text-neutral-950 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                >
                  <IconEdit className="w-3.5 h-3.5" />
                  <span>Edit Content</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <Modal
          isOpen={true}
          onClose={() => setEditingService(null)}
          title={`Edit Service: ${editingService.title}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Service Title
              </label>
              <input
                type="text"
                required
                value={editingService.title}
                onChange={(e) =>
                  setEditingService({ ...editingService, title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Slug (Read-Only)
              </label>
              <input
                type="text"
                disabled
                value={editingService.slug}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900/50 border border-[#2B313D] text-sm text-neutral-500 font-mono cursor-not-allowed"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Foundational slugs are permanent to ensure REST API stability.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Short Description
              </label>
              <textarea
                rows={2}
                value={editingService.shortDescription || ""}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    shortDescription: e.target.value,
                  })
                }
                placeholder="Brief summary for homepage cards..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Detailed Content
              </label>
              <textarea
                rows={4}
                value={editingService.detailedContent || ""}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    detailedContent: e.target.value,
                  })
                }
                placeholder="Full service overview and process..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <FileUpload
              label="Thumbnail Image"
              value={editingService.thumbnailUrl}
              onChange={(url) =>
                setEditingService({ ...editingService, thumbnailUrl: url })
              }
              acceptType="image"
              helperText="Recommended dimension: 1200x800px (JPG, WebP, PNG)"
            />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingService.displayOrder}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      displayOrder: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Status
                </label>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.isActive}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#C5A869] focus:ring-[#C5A869] bg-neutral-900 border-[#2B313D]"
                  />
                  <span className="text-sm text-white">Active on Website</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#2B313D]">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-[#C5A869] hover:bg-[#d4af37] rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
