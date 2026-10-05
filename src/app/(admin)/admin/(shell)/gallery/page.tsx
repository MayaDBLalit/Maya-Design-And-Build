"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FileUpload } from "@/components/admin/FileUpload";
import {
  IconGallery,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@/components/admin/Icons";

interface GalleryItem {
  id: number;
  title: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

const emptyGalleryForm: Omit<GalleryItem, "id" | "createdAt"> = {
  title: "",
  mediaType: "image",
  mediaUrl: "",
  thumbnailUrl: "",
  durationSeconds: null,
  fileSizeBytes: null,
  displayOrder: 0,
  isActive: true,
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Type filter
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyGalleryForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch gallery items");
      setItems(data.gallery || []);
    } catch (err: any) {
      setError(err.message || "Failed to load gallery");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyGalleryForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl || "",
      durationSeconds: item.durationSeconds,
      fileSizeBytes: item.fileSizeBytes,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/gallery/${editingId}` : "/api/admin/gallery";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          thumbnailUrl: formData.thumbnailUrl?.trim() || null,
          displayOrder: Number(formData.displayOrder),
          durationSeconds: formData.durationSeconds ? Number(formData.durationSeconds) : null,
          fileSizeBytes: formData.fileSizeBytes ? Number(formData.fileSizeBytes) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save gallery item");

      setToastMessage(
        editingId ? "Gallery item updated." : "Gallery item uploaded successfully."
      );
      setTimeout(() => setToastMessage(null), 4000);
      setIsModalOpen(false);
      fetchGallery();
    } catch (err: any) {
      alert(err.message || "Error saving gallery item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/gallery/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete item");

      setToastMessage(`Gallery item "${deleteTarget.title}" deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
      setDeleteTarget(null);
      fetchGallery();
    } catch (err: any) {
      alert(err.message || "Error deleting gallery item");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (typeFilter === "all") return true;
    return item.mediaType === typeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <IconGallery className="w-7 h-7 text-[#C5A869]" />
            Media Gallery
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Showcase images and short cinematic videos (≤ 50MB, ≤ 1 min).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <IconCheck className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#14171C] border border-[#2B313D] w-fit">
        {["all", "image", "video"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider capitalize transition cursor-pointer ${
              typeFilter === type
                ? "bg-[#C5A869] text-neutral-950 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {type === "all" ? "All Media" : `${type}s`}
          </button>
        ))}
      </div>

      {/* Gallery Items Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-neutral-400">Loading gallery...</div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-12 text-center">
          <IconGallery className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Media Found</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Upload images or short videos to populate the gallery.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C5A869] text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37] transition cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C5A869]/40 transition group"
            >
              <div>
                <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                  {item.mediaType === "video" ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnailUrl || "/images/video-placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/75 border border-[#C5A869]/80 text-[#C5A869] flex items-center justify-center pl-0.5 text-xs shadow-lg">
                          ▶
                        </div>
                      </div>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/80 text-[#C5A869] border border-[#C5A869]/30">
                    {item.mediaType}
                  </span>
                  {item.durationSeconds && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white">
                      {item.durationSeconds}s
                    </span>
                  )}
                </div>

                <div className="p-3.5">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                    <span>Order: #{item.displayOrder}</span>
                    <span
                      className={item.isActive ? "text-emerald-400" : "text-neutral-500"}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-[#0F1115] border-t border-[#2B313D] flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition cursor-pointer"
                  title="Edit item"
                >
                  <IconEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition cursor-pointer"
                  title="Delete item"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Gallery Item" : "Upload Gallery Media"}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Media Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Modern Residential Elevation Walkthrough"
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Media Type *
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input
                    type="radio"
                    name="typeChoice"
                    checked={formData.mediaType === "image"}
                    onChange={() => setFormData({ ...formData, mediaType: "image" })}
                    className="text-[#C5A869] focus:ring-[#C5A869]"
                  />
                  <span>Image (≤ 10MB)</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input
                    type="radio"
                    name="typeChoice"
                    checked={formData.mediaType === "video"}
                    onChange={() => setFormData({ ...formData, mediaType: "video" })}
                    className="text-[#C5A869] focus:ring-[#C5A869]"
                  />
                  <span>Cinematic Video (≤ 50MB, max 60 sec)</span>
                </label>
              </div>
            </div>

            <FileUpload
              label="Primary Media File *"
              value={formData.mediaUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, mediaUrl: url }))}
              onUploadDetails={(details) => {
                setFormData((prev) => ({
                  ...prev,
                  thumbnailUrl:
                    prev.mediaType === "video"
                      ? prev.thumbnailUrl
                      : (details.thumbnailUrl || prev.thumbnailUrl),
                  durationSeconds:
                    details.durationSeconds !== undefined && details.durationSeconds !== null
                      ? Math.round(details.durationSeconds)
                      : prev.durationSeconds,
                  fileSizeBytes: details.fileSizeBytes || prev.fileSizeBytes,
                }));
              }}
              purpose="gallery"
              acceptType={formData.mediaType}
              helperText={
                formData.mediaType === "image"
                  ? "Upload JPG, PNG, WebP up to 10MB (auto-converted to WebP)"
                  : "Upload MP4, WebM up to 50MB (max 1 minute duration)"
              }
            />

            {/* Conditional Video Thumbnail Field (Optional) */}
            {formData.mediaType === "video" && (
              <FileUpload
                label="Video Thumbnail"
                value={formData.thumbnailUrl || ""}
                onChange={(url) => setFormData((prev) => ({ ...prev, thumbnailUrl: url }))}
                purpose="gallery"
                acceptType="image"
                helperText="Upload an optional custom cover image for this video (JPG, PNG, WebP up to 10MB). If omitted, the default video placeholder will be displayed."
              />
            )}


            {formData.mediaType === "video" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Video Duration (Seconds, max 60)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.durationSeconds || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationSeconds: parseInt(e.target.value, 10) || null,
                    })
                  }
                  placeholder="e.g. 45"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>
            )}

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
                  <span className="text-sm text-white">Active in Gallery</span>
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
                disabled={isSaving || !formData.mediaUrl}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-[#C5A869] hover:bg-[#d4af37] rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : editingId ? "Update Item" : "Upload to Gallery"}
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
        title="Delete Gallery Media?"
        message={`Are you sure you want to remove "${deleteTarget?.title}" from the gallery?`}
        confirmLabel="Delete Media"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
