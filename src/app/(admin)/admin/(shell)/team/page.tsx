"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FileUpload } from "@/components/admin/FileUpload";
import {
  IconTeam,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@/components/admin/Icons";

interface TeamMemberItem {
  id: number;
  fullName: string;
  roleTitle: string;
  education: string | null;
  experienceYears: string | null;
  bio: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

const emptyTeamForm: Omit<TeamMemberItem, "id"> = {
  fullName: "",
  roleTitle: "",
  education: "",
  experienceYears: "",
  bio: "",
  imageUrl: "",
  displayOrder: 0,
  isActive: true,
};

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyTeamForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch team members");
      setTeam(data.teamMembers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load team");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyTeamForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMemberItem) => {
    setEditingId(member.id);
    setFormData({
      fullName: member.fullName,
      roleTitle: member.roleTitle,
      education: member.education || "",
      experienceYears: member.experienceYears || "",
      bio: member.bio || "",
      imageUrl: member.imageUrl || "",
      displayOrder: member.displayOrder,
      isActive: member.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/team/${editingId}` : "/api/admin/team";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          displayOrder: Number(formData.displayOrder),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save team member");

      setToastMessage(
        editingId ? "Team member updated successfully." : "Team member added successfully."
      );
      setTimeout(() => setToastMessage(null), 4000);
      setIsModalOpen(false);
      fetchTeam();
    } catch (err: any) {
      alert(err.message || "Error saving team member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/team/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete team member");

      setToastMessage(`Team member "${deleteTarget.fullName}" deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
      setDeleteTarget(null);
      fetchTeam();
    } catch (err: any) {
      alert(err.message || "Error deleting team member");
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
            <IconTeam className="w-7 h-7 text-[#C5A869]" />
            Engineering & Leadership Team
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Engineers, architects, and project managers powering MAYA Design & Build.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <IconCheck className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Team Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-neutral-400">Loading team...</div>
      ) : team.length === 0 ? (
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-12 text-center">
          <IconTeam className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Team Members Found</h3>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C5A869] text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37] transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C5A869]/40 transition"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-900 border-2 border-[#C5A869]/40 flex-shrink-0 flex items-center justify-center">
                    {member.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.imageUrl}
                        alt={member.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <IconTeam className="w-8 h-8 text-neutral-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate">
                      {member.fullName}
                    </h3>
                    <p className="text-xs font-medium text-[#C5A869] truncate">
                      {member.roleTitle}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        member.isActive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
                  {member.education && (
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500">🎓</span>
                      <span className="truncate">{member.education}</span>
                    </p>
                  )}
                  {member.experienceYears && (
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-500">⏱️</span>
                      <span>{member.experienceYears}</span>
                    </p>
                  )}
                  {member.bio && (
                    <p className="line-clamp-2 text-neutral-400 text-[11px] leading-relaxed pt-1">
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3.5 bg-[#0F1115] border-t border-[#2B313D] flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-500">
                  Order: #{member.displayOrder}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition cursor-pointer"
                    title="Edit Member"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(member)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition cursor-pointer"
                    title="Delete Member"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Team Member Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Team Member" : "Add Team Member"}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Er. Lalit Choudhary"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  placeholder="e.g. Founder & Project Manager"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Education & Qualifications
                </label>
                <input
                  type="text"
                  value={formData.education || ""}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="e.g. B.E. Civil, M.Tech (Structures)"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Experience
                </label>
                <input
                  type="text"
                  value={formData.experienceYears || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceYears: e.target.value })
                  }
                  placeholder="e.g. 5+ Years Exp."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Biography / Scope
              </label>
              <textarea
                rows={3}
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Professional background, key disciplines handled..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white focus:outline-hidden focus:border-[#C5A869]"
              />
            </div>

            <FileUpload
              label="Profile Photo"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              acceptType="image"
              helperText="Square headshot recommended (e.g. 600x600px)"
            />

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
                  <span className="text-sm text-white">Active on Website</span>
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
                {isSaving ? "Saving..." : editingId ? "Update Member" : "Add Member"}
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
        title="Delete Team Member?"
        message={`Are you sure you want to remove "${deleteTarget?.fullName}" from the team list?`}
        confirmLabel="Delete Member"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
