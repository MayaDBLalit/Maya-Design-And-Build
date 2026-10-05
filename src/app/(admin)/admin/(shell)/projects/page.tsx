"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FileUpload } from "@/components/admin/FileUpload";
import {
  IconProjects,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconImages,
  IconCheck,
  IconUpload,
  IconAlert,
} from "@/components/admin/Icons";

interface ProjectItem {
  id: number;
  title: string;
  slug: string;
  category: "completed" | "ongoing" | "upcoming";
  location: string | null;
  clientName: string | null;
  clientNumber: string | null;
  costEstimate: string | null;
  description: string | null;
  mainImageUrl: string | null;
  oldElevationUrl: string | null;
  newElevationUrl: string | null;
  displayOrder: number;
  isFeatured: boolean;
  createdAt: string;
}

interface ProjectMediaItem {
  id: number;
  projectId: number;
  mediaUrl: string;
  mediaType: "image" | "video";
  displayOrder: number;
}

const emptyProjectForm: Omit<ProjectItem, "id" | "createdAt"> = {
  title: "",
  slug: "",
  category: "completed",
  location: "",
  clientName: "",
  clientNumber: "",
  costEstimate: "",
  description: "",
  mainImageUrl: "",
  oldElevationUrl: "",
  newElevationUrl: "",
  displayOrder: 0,
  isFeatured: false,
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyProjectForm);
  const [isSaving, setIsSaving] = useState(false);

  // Media Manager Modal State
  const [activeMediaProject, setActiveMediaProject] = useState<ProjectItem | null>(null);
  const [projectMediaList, setProjectMediaList] = useState<ProjectMediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaType, setNewMediaType] = useState<"image" | "video">("image");
  const [isAttachingMedia, setIsAttachingMedia] = useState(false);

  // Multi-image upload states
  const [isMultiUploading, setIsMultiUploading] = useState(false);
  const [multiUploadProgress, setMultiUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [multiUploadError, setMultiUploadError] = useState<string | null>(null);
  const [multiUploadSuccess, setMultiUploadSuccess] = useState<string | null>(null);
  const [multiDragActive, setMultiDragActive] = useState(false);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch projects");
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyProjectForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category,
      location: project.location || "",
      clientName: project.clientName || "",
      clientNumber: project.clientNumber || "",
      costEstimate: project.costEstimate || "",
      description: project.description || "",
      mainImageUrl: project.mainImageUrl || "",
      oldElevationUrl: project.oldElevationUrl || "",
      newElevationUrl: project.newElevationUrl || "",
      displayOrder: project.displayOrder,
      isFeatured: project.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    if (!editingId) {
      // Auto-generate slug from title for new projects
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, title, slug: generatedSlug }));
    } else {
      setFormData((prev) => ({ ...prev, title }));
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          displayOrder: Number(formData.displayOrder),
          costEstimate: formData.costEstimate ? Number(formData.costEstimate) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save project");

      setToastMessage(
        editingId ? "Project updated successfully." : "Project created successfully."
      );
      setTimeout(() => setToastMessage(null), 4000);
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || "Error saving project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/projects/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete project");

      setToastMessage(`Project "${deleteTarget.title}" deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || "Error deleting project");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Media Manager for Project
  const handleOpenMedia = async (project: ProjectItem) => {
    setActiveMediaProject(project);
    setIsLoadingMedia(true);
    setNewMediaUrl("");
    setMultiUploadError(null);
    setMultiUploadSuccess(null);
    setMultiUploadProgress(null);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/media`);
      const data = await res.json();
      if (res.ok) {
        setProjectMediaList(data.media || []);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  // Multi-image upload handler
  const handleMultiUpload = async (files: FileList | File[]) => {
    if (!activeMediaProject) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setMultiUploadError("Please select valid image files (PNG, JPG, WebP, AVIF)");
      return;
    }

    setIsMultiUploading(true);
    setMultiUploadError(null);
    setMultiUploadSuccess(null);
    setMultiUploadProgress({ current: 0, total: fileArray.length });

    const newItems: ProjectMediaItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setMultiUploadProgress({ current: i + 1, total: fileArray.length });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", "project");

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || uploadData.error || `Upload failed for ${file.name}`);
        }

        const attachRes = await fetch(`/api/admin/projects/${activeMediaProject.id}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaUrl: uploadData.url,
            mediaType: "image",
            displayOrder: projectMediaList.length + newItems.length,
          }),
        });

        const attachData = await attachRes.json();
        if (!attachRes.ok) {
          throw new Error(attachData.message || attachData.error || "Failed to attach to project");
        }

        newItems.push(attachData.media);
      } catch (err: any) {
        console.error(`Error uploading ${file.name}:`, err);
        setMultiUploadError(`Error on file "${file.name}": ${err.message}`);
      }
    }

    if (newItems.length > 0) {
      setProjectMediaList((prev) => [...prev, ...newItems]);
      setMultiUploadSuccess(`Successfully added ${newItems.length} image(s) to ${activeMediaProject.title}.`);
    }

    setIsMultiUploading(false);
    setMultiUploadProgress(null);
    if (multiFileInputRef.current) {
      multiFileInputRef.current.value = "";
    }
  };

  const handleUpdateDisplayOrder = async (mediaId: number, newOrder: number) => {
    if (!activeMediaProject) return;
    try {
      const res = await fetch(
        `/api/admin/projects/${activeMediaProject.id}/media/${mediaId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: newOrder }),
        }
      );
      if (res.ok) {
        setProjectMediaList((prev) =>
          prev
            .map((item) => (item.id === mediaId ? { ...item, displayOrder: newOrder } : item))
            .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
        );
      }
    } catch (err) {
      console.error("Failed to update display order:", err);
    }
  };

  const handleAttachMedia = async () => {
    if (!activeMediaProject || !newMediaUrl) return;
    setIsAttachingMedia(true);

    try {
      const res = await fetch(`/api/admin/projects/${activeMediaProject.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: newMediaUrl,
          mediaType: newMediaType,
          displayOrder: projectMediaList.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add media");

      setProjectMediaList((prev) => [...prev, data.media]);
      setNewMediaUrl("");
    } catch (err: any) {
      alert(err.message || "Failed to attach media");
    } finally {
      setIsAttachingMedia(false);
    }
  };

  const handleRemoveMedia = async (mediaId: number) => {
    if (!activeMediaProject) return;

    try {
      const res = await fetch(
        `/api/admin/projects/${activeMediaProject.id}/media/${mediaId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setProjectMediaList((prev) => prev.filter((m) => m.id !== mediaId));
      }
    } catch (err) {
      console.error("Failed to delete media item:", err);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    const matchesQuery =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <IconProjects className="w-7 h-7 text-[#C5A869]" />
            Projects Portfolio
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Completed, Ongoing, and Upcoming architectural & construction projects.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <IconCheck className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#14171C] border border-[#2B313D]">
          {["all", "completed", "ongoing", "upcoming"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider capitalize transition cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[#C5A869] text-neutral-950 font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#14171C] border border-[#2B313D] text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#C5A869]"
          />
        </div>
      </div>

      {/* Projects Table / Card Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-neutral-400">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-12 text-center">
          <IconProjects className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Projects Found</h3>
          <p className="text-xs text-neutral-400 mt-1">
            {searchQuery
              ? "No projects match your search query."
              : "Get started by adding your first project."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C5A869] text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37] transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C5A869]/40 transition group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-44 w-full bg-neutral-900 border-b border-[#2B313D] overflow-hidden">
                  {project.mainImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.mainImageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600">
                      <IconProjects className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs">No image attached</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        project.category === "completed"
                          ? "bg-emerald-900/80 text-emerald-300 border border-emerald-700/50"
                          : project.category === "ongoing"
                          ? "bg-blue-900/80 text-blue-300 border border-blue-700/50"
                          : "bg-amber-900/80 text-amber-300 border border-amber-700/50"
                      }`}
                    >
                      {project.category}
                    </span>
                    {project.isFeatured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C5A869] text-neutral-950">
                        Featured
                      </span>
                    )}
                  </div>
                  {/* Before / After indicator */}
                  {(project.oldElevationUrl || project.newElevationUrl) && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#C5A869] border border-[#C5A869]/30">
                      Before/After Elev.
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                      {project.title}
                    </h3>
                    <span className="text-[11px] font-mono text-neutral-500">
                      #{project.displayOrder}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 flex items-center gap-1">
                    <span>📍</span>
                    <span>{project.location || "Location not specified"}</span>
                  </p>

                  {project.costEstimate && (
                    <p className="text-xs font-semibold text-[#C5A869]">
                      Estimate: ₹{Number(project.costEstimate).toLocaleString("en-IN")}
                    </p>
                  )}

                  {project.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-3.5 bg-[#0F1115] border-t border-[#2B313D] flex items-center justify-between">
                <button
                  onClick={() => handleOpenMedia(project)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-neutral-300 hover:text-[#C5A869] hover:bg-neutral-800 transition cursor-pointer"
                  title="Manage Project Gallery Media"
                >
                  <IconImages className="w-4 h-4 text-[#C5A869]" />
                  <span>Media</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition cursor-pointer"
                    title="Edit Project"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition cursor-pointer"
                    title="Delete Project"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Project" : "Create New Project"}
          maxWidth="3xl"
        >
          <form onSubmit={handleSaveProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Modern Villa at Bardoli"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Slug (URL identifier) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. modern-villa-bardoli"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white font-mono focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                >
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bardoli, Surat"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Cost Estimate (₹)
                </label>
                <input
                  type="number"
                  value={formData.costEstimate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, costEstimate: e.target.value })
                  }
                  placeholder="e.g. 4500000"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Client Name (Internal)
                </label>
                <input
                  type="text"
                  value={formData.clientName || ""}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Client full name"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Client Phone (Private internal)
                </label>
                <input
                  type="text"
                  value={formData.clientNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, clientNumber: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Architectural scope, design highlights, structural features..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            {/* Main Image Upload */}
            <FileUpload
              label="Primary Showcase Image"
              value={formData.mainImageUrl}
              onChange={(url) => setFormData({ ...formData, mainImageUrl: url })}
              acceptType="image"
              helperText="Main hero card image (JPG, PNG, WebP)"
            />

            {/* Before / After Elevation Uploads */}
            <div className="pt-2 border-t border-[#2B313D]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A869] mb-3">
                Elevation Transformation (Before / After Comparison)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUpload
                  label="Old / Original Elevation"
                  value={formData.oldElevationUrl}
                  onChange={(url) => setFormData({ ...formData, oldElevationUrl: url })}
                  acceptType="image"
                  helperText="Existing structure / before elevation"
                />
                <FileUpload
                  label="New / Modern Elevation"
                  value={formData.newElevationUrl}
                  onChange={(url) => setFormData({ ...formData, newElevationUrl: url })}
                  acceptType="image"
                  helperText="Proposed or renovated modern elevation"
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
                  Featured Status
                </label>
                <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#C5A869] focus:ring-[#C5A869] bg-neutral-900 border-[#2B313D]"
                  />
                  <span className="text-sm text-white">Feature on Homepage</span>
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
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-[#C5A869] hover:bg-[#d4af37] rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : editingId ? "Update Project" : "Create Project"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Project Media Gallery Drawer Modal */}
      {activeMediaProject && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveMediaProject(null);
            setMultiUploadProgress(null);
            setMultiUploadError(null);
            setMultiUploadSuccess(null);
          }}
          title={`Project Visual Documentation — ${activeMediaProject.title}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Project Context Scope Banner */}
            <div className="p-3.5 rounded-lg bg-[#0F1115] border border-[#2B313D] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-neutral-400">Target Project: </span>
                <span className="font-bold text-white text-sm">{activeMediaProject.title}</span>
                <span className="text-neutral-500 ml-2 font-mono text-[11px]">
                  (ID: #{activeMediaProject.id})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 text-[10px] font-mono uppercase tracking-wider">
                  Isolated Project Scope
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  /projects/{activeMediaProject.slug}
                </span>
              </div>
            </div>

            {/* Multi-Image Fast Upload Dropzone */}
            <div className="p-4 rounded-xl bg-[#0F1115] border border-[#2B313D] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <IconUpload className="w-4 h-4 text-[#C5A869]" />
                    Upload Multiple Project Images
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Select or drag multiple photos simultaneously. All images are securely compressed to WebP and bound exclusively to this project.
                  </p>
                </div>
              </div>

              {/* Drag & Drop Multi-file Area */}
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMultiDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMultiDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMultiDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMultiDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleMultiUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => !isMultiUploading && multiFileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                  multiDragActive
                    ? "border-[#C5A869] bg-[#C5A869]/10"
                    : "border-[#2B313D] hover:border-neutral-500 bg-[#14171C]/60"
                }`}
              >
                <input
                  ref={multiFileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleMultiUpload(e.target.files);
                    }
                  }}
                  className="hidden"
                  disabled={isMultiUploading}
                />

                {isMultiUploading && multiUploadProgress ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-2">
                    <div className="flex items-center gap-2 text-sm text-[#C5A869]">
                      <svg className="animate-spin h-5 w-5 text-[#C5A869]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span className="font-semibold">
                        Optimizing &amp; uploading image {multiUploadProgress.current} of {multiUploadProgress.total}...
                      </span>
                    </div>
                    <div className="w-48 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#C5A869] h-full transition-all duration-300"
                        style={{
                          width: `${(multiUploadProgress.current / multiUploadProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="p-2.5 rounded-full bg-neutral-800 text-[#C5A869] mb-1">
                      <IconUpload className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-neutral-300">
                      <span className="font-semibold text-[#C5A869]">Click to select multiple photos</span> or drag &amp; drop here
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      PNG, JPG, WebP up to 10MB each (automatically converted to WebP with Sharp)
                    </p>
                  </div>
                )}
              </div>

              {multiUploadError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <IconAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{multiUploadError}</span>
                </div>
              )}

              {multiUploadSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <IconCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{multiUploadSuccess}</span>
                </div>
              )}
            </div>

            {/* Single File / Video Attachment (Collapsible) */}
            <details className="rounded-lg bg-[#0F1115] border border-[#2B313D] p-3 text-xs">
              <summary className="font-semibold text-neutral-300 cursor-pointer hover:text-white uppercase tracking-wider">
                + Add Single File / Walkthrough Video / Direct URL
              </summary>
              <div className="mt-4 space-y-3 pt-3 border-t border-neutral-800">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaType"
                      checked={newMediaType === "image"}
                      onChange={() => setNewMediaType("image")}
                      className="text-[#C5A869] focus:ring-[#C5A869]"
                    />
                    <span>Image</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaType"
                      checked={newMediaType === "video"}
                      onChange={() => setNewMediaType("video")}
                      className="text-[#C5A869] focus:ring-[#C5A869]"
                    />
                    <span>Video (≤ 50MB)</span>
                  </label>
                </div>

                <FileUpload
                  value={newMediaUrl}
                  onChange={(url) => setNewMediaUrl(url)}
                  acceptType={newMediaType}
                  purpose="project"
                  helperText={
                    newMediaType === "image"
                      ? "Upload high resolution project photo"
                      : "Upload project walkthrough video (MP4/WebM)"
                  }
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAttachMedia}
                    disabled={!newMediaUrl || isAttachingMedia}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#C5A869] text-neutral-950 rounded-lg hover:bg-[#d4af37] disabled:opacity-50 transition cursor-pointer"
                  >
                    {isAttachingMedia ? "Attaching..." : "Attach to Project"}
                  </button>
                </div>
              </div>
            </details>

            {/* Attached Media List for this project */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Attached Project Images ({projectMediaList.length})
                </h4>
                <span className="text-[11px] font-mono text-neutral-500">
                  Ordered by display priority
                </span>
              </div>

              {isLoadingMedia ? (
                <div className="text-center py-6 text-xs text-neutral-400">Loading media...</div>
              ) : projectMediaList.length === 0 ? (
                <div className="text-xs text-neutral-500 py-8 text-center border border-dashed border-[#2B313D] rounded-xl space-y-1">
                  <p className="font-semibold text-neutral-400">No additional images attached yet</p>
                  <p className="text-[11px]">Upload images above to create a project-specific gallery on its details page.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {projectMediaList.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-lg overflow-hidden border border-[#2B313D] bg-neutral-900 aspect-video flex flex-col justify-between group"
                    >
                      {item.mediaType === "video" ? (
                        <video
                          src={item.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.mediaUrl}
                          alt="Project media"
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Hover Overlay with Delete & Order Controls */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#C5A869]">
                            {item.mediaType}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(item.id)}
                            className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                            title="Delete this image"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 bg-black/90 p-1.5 rounded border border-neutral-700">
                          <span className="text-[10px] text-neutral-400 font-mono">Order:</span>
                          <input
                            type="number"
                            min="0"
                            value={item.displayOrder}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                handleUpdateDisplayOrder(item.id, val);
                              }
                            }}
                            className="w-14 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-white text-xs font-mono text-center focus:outline-hidden focus:border-[#C5A869]"
                          />
                        </div>
                      </div>

                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-neutral-400 pointer-events-none group-hover:opacity-0 transition">
                        #{item.displayOrder}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? All associated gallery media (${deleteTarget?.title}) will also be safely removed.`}
        confirmLabel="Delete Project"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
