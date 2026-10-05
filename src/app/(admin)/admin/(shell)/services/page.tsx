"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FileUpload } from "@/components/admin/FileUpload";
import {
  IconServices,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@/components/admin/Icons";
import { generateSlug } from "@/lib/slug";

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

const emptyServiceForm = {
  title: "",
  slug: "",
  shortDescription: "",
  detailedContent: "",
  thumbnailUrl: "",
  displayOrder: 0,
  isActive: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyServiceForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch services");
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

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...emptyServiceForm,
      displayOrder: services.length + 1,
    });
    setSlugManuallyEdited(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      slug: service.slug,
      shortDescription: service.shortDescription || "",
      detailedContent: service.detailedContent || "",
      thumbnailUrl: service.thumbnailUrl || "",
      displayOrder: service.displayOrder,
      isActive: service.isActive,
    });
    setSlugManuallyEdited(true);
    setIsModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (!editingId && !slugManuallyEdited) {
      setFormData((prev) => ({
        ...prev,
        title: newTitle,
        slug: generateSlug(newTitle),
      }));
    } else {
      setFormData((prev) => ({ ...prev, title: newTitle }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Service title is required");
      return;
    }

    const resolvedSlug = formData.slug.trim()
      ? generateSlug(formData.slug)
      : generateSlug(formData.title);

    if (!resolvedSlug) {
      alert("A valid URL slug is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      title: formData.title.trim(),
      slug: resolvedSlug,
      shortDescription: formData.shortDescription.trim() || null,
      detailedContent: formData.detailedContent.trim() || null,
      thumbnailUrl: formData.thumbnailUrl.trim() || null,
      displayOrder: Number(formData.displayOrder) || 0,
      isActive: formData.isActive,
    };

    try {
      const url = editingId
        ? `/api/admin/services/${editingId}`
        : `/api/admin/services`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save service");

      setToastMessage(
        editingId
          ? `Service "${formData.title}" updated successfully.`
          : `Service "${formData.title}" created successfully.`
      );
      setTimeout(() => setToastMessage(null), 4000);
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      alert(err.message || "Error saving service");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: service.title,
          slug: service.slug,
          shortDescription: service.shortDescription,
          detailedContent: service.detailedContent,
          thumbnailUrl: service.thumbnailUrl,
          displayOrder: service.displayOrder,
          isActive: !service.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to toggle status");

      setToastMessage(
        `Service "${service.title}" is now ${!service.isActive ? "Active" : "Inactive"}.`
      );
      setTimeout(() => setToastMessage(null), 4000);
      fetchServices();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to delete service");

      setToastMessage(`Service "${deleteTarget.title}" deleted successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      setDeleteTarget(null);
      fetchServices();
    } catch (err: any) {
      alert(err.message || "Error deleting service");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = services.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <IconServices className="w-7 h-7 text-[#C5A869]" />
            Architectural &amp; Engineering Services
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage service disciplines, methodology content, display ordering, and public visibility.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#C5A869]/10 border border-[#C5A869]/30 text-[#C5A869] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <IconCheck className="w-4 h-4" />
            <span>
              {activeCount} Active / {services.length} Total
            </span>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
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
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-[#14171C] border border-[#2B313D] rounded-xl">
          <IconServices className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No services found</h3>
          <p className="text-xs text-neutral-400 mt-1 mb-4">
            Get started by adding your first architectural service discipline.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] text-neutral-950 text-xs font-bold uppercase tracking-wider"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => handleToggleActive(service)}
                      title="Click to toggle active state"
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider transition cursor-pointer ${
                        service.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </button>
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
                    <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2 py-1 rounded border border-[#2B313D]">
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
                <span className="text-[11px] font-mono text-neutral-500">
                  ID: #{service.id}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-[#C5A869] hover:text-neutral-950 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                  >
                    <IconEdit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(service)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 text-xs font-semibold transition cursor-pointer"
                    title="Delete service"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Architectural Service" : "Add Architectural Service"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Service Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Landscape Architecture"
                className="w-full px-3 py-2 bg-neutral-900 border border-[#2B313D] rounded-lg text-white text-sm focus:border-[#C5A869] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="landscape-architecture"
                className="w-full px-3 py-2 bg-neutral-900 border border-[#2B313D] rounded-lg text-white text-sm font-mono focus:border-[#C5A869] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Short Description (Card Summary, Max 500 characters)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
              }
              placeholder="High-level overview visible on service cards..."
              className="w-full px-3 py-2 bg-neutral-900 border border-[#2B313D] rounded-lg text-white text-sm focus:border-[#C5A869] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Detailed Scope &amp; Methodology (Modal / Detailed View)
            </label>
            <textarea
              rows={5}
              value={formData.detailedContent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, detailedContent: e.target.value }))
              }
              placeholder="Full procedural scope, architectural deliverables, and engineering methodology..."
              className="w-full px-3 py-2 bg-neutral-900 border border-[#2B313D] rounded-lg text-white text-sm focus:border-[#C5A869] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Service Cover Image / Thumbnail
            </label>
            <FileUpload
              acceptType="image"
              purpose="service"
              value={formData.thumbnailUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, thumbnailUrl: url }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayOrder: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-neutral-900 border border-[#2B313D] rounded-lg text-white text-sm focus:border-[#C5A869] focus:outline-hidden"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded border-[#2B313D] text-[#C5A869] focus:ring-[#C5A869] bg-neutral-900"
                />
                <span>Active &amp; Visible on Public Website</span>
              </label>
            </div>
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
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-[#C5A869] hover:bg-[#d4af37] disabled:opacity-50 rounded-lg transition cursor-pointer"
            >
              {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Architectural Service"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This service discipline will be permanently removed from the CMS and public catalog.`}
        confirmLabel="Delete Service"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
