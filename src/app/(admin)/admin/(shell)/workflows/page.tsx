"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/admin/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import Link from "next/link";
import {
  IconWorkflows,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconEye,
} from "@/components/admin/Icons";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

interface WorkflowStep {
  id?: number;
  stepNumber: number;
  title: string;
  details?: string | null;
  displayOrder: number;
}

interface WorkflowItem {
  id: number;
  subServiceId: number;
  subServiceName?: string;
  mainServiceId?: number;
  mainServiceTitle?: string;
  title: string;
  isActive: boolean;
  steps: WorkflowStep[];
  stepsCount: number;
}

interface SubServiceOption {
  id: number;
  serviceName: string;
  mainServiceId: number;
  mainServiceTitle?: string;
}

interface WorkflowFormData {
  subServiceId: number;
  title: string;
  isActive: boolean;
  steps: {
    id?: number;
    stepNumber: number;
    title: string;
    details: string;
    displayOrder: number;
  }[];
}

const emptyWorkflowForm: WorkflowFormData = {
  subServiceId: 0,
  title: "",
  isActive: true,
  steps: [
    { stepNumber: 1, title: "", details: "", displayOrder: 1 },
    { stepNumber: 2, title: "", details: "", displayOrder: 2 },
    { stepNumber: 3, title: "", details: "", displayOrder: 3 },
  ],
};

export default function AdminWorkflowsPage() {
  const [workflowsList, setWorkflowsList] = useState<WorkflowItem[]>([]);
  const [subServices, setSubServices] = useState<SubServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<WorkflowFormData>(emptyWorkflowForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<WorkflowItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expanded card view for steps
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [workflowsRes, subServicesRes] = await Promise.all([
        fetch("/api/admin/workflows"),
        fetch("/api/admin/subservices"),
      ]);

      const [workflowsData, subServicesData] = await Promise.all([
        workflowsRes.json(),
        subServicesRes.json(),
      ]);

      if (!workflowsRes.ok) throw new Error(workflowsData.message || "Failed to fetch workflows");
      if (!subServicesRes.ok) throw new Error(subServicesData.message || "Failed to fetch subservices");

      setWorkflowsList(workflowsData.workflows || []);
      setSubServices(subServicesData.rates || []);

      if (subServicesData.rates?.length > 0 && formData.subServiceId === 0) {
        setFormData((prev) => ({ ...prev, subServiceId: subServicesData.rates[0].id }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load workflows");
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
    // Find first subservice that doesn't already have a workflow
    const existingSubServiceIds = new Set(workflowsList.map((w) => w.subServiceId));
    const availableSub = subServices.find((s) => !existingSubServiceIds.has(s.id));

    setFormData({
      ...emptyWorkflowForm,
      subServiceId: availableSub ? availableSub.id : subServices[0]?.id || 0,
      steps: [
        { stepNumber: 1, title: "", details: "", displayOrder: 1 },
        { stepNumber: 2, title: "", details: "", displayOrder: 2 },
        { stepNumber: 3, title: "", details: "", displayOrder: 3 },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (wf: WorkflowItem) => {
    setEditingId(wf.id);
    setFormData({
      subServiceId: wf.subServiceId,
      title: wf.title,
      isActive: wf.isActive,
      steps:
        wf.steps && wf.steps.length > 0
          ? wf.steps.map((s, idx) => ({
              id: s.id,
              stepNumber: s.stepNumber || idx + 1,
              title: s.title,
              details: s.details || "",
              displayOrder: s.displayOrder || idx + 1,
            }))
          : [
              { stepNumber: 1, title: "", details: "", displayOrder: 1 },
              { stepNumber: 2, title: "", details: "", displayOrder: 2 },
            ],
    });
    setIsModalOpen(true);
  };

  const addStep = () => {
    setFormData((prev) => {
      const nextNum = prev.steps.length + 1;
      return {
        ...prev,
        steps: [
          ...prev.steps,
          {
            stepNumber: nextNum,
            title: "",
            details: "",
            displayOrder: nextNum,
          },
        ],
      };
    });
  };

  const removeStep = (index: number) => {
    setFormData((prev) => {
      const updated = prev.steps.filter((_, i) => i !== index);
      // Re-number steps
      const renumbered = updated.map((s, i) => ({
        ...s,
        stepNumber: i + 1,
        displayOrder: i + 1,
      }));
      return {
        ...prev,
        steps: renumbered,
      };
    });
  };

  const updateStepField = (index: number, field: "title" | "details", value: string) => {
    setFormData((prev) => {
      const updated = [...prev.steps];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return {
        ...prev,
        steps: updated,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validate steps
    const validSteps = formData.steps.filter((s) => s.title.trim().length > 0);
    if (validSteps.length === 0) {
      setError("Please add at least one workflow step with a title.");
      setIsSaving(false);
      return;
    }

    try {
      const url = editingId ? `/api/admin/workflows/${editingId}` : "/api/admin/workflows";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subServiceId: Number(formData.subServiceId),
          title: formData.title,
          isActive: formData.isActive,
          steps: validSteps.map((s, idx) => ({
            id: s.id,
            stepNumber: idx + 1,
            title: s.title.trim(),
            details: s.details ? s.details.trim() : null,
            displayOrder: idx + 1,
          })),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || resData.message || "Save operation failed");
      }

      showToast(editingId ? "Workflow updated successfully" : "Workflow created successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/workflows/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to delete workflow");
      }

      showToast("Workflow deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete workflow");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Find subservices available for assignment: exclude ones already assigned unless it's current editing workflow
  const assignedSubServiceIds = new Set(
    workflowsList.filter((w) => w.id !== editingId).map((w) => w.subServiceId)
  );

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
              <IconWorkflows className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Workflows &amp; Workstages
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-mono">
            Define execution steps and deliverables for SubServices (1:1 relationship with dynamic multi-step breakdown).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C5A869] hover:bg-[#d8be82] text-neutral-950 font-mono font-bold text-sm transition shadow-lg shadow-[#C5A869]/10 active:scale-98"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Workflow</span>
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
      ) : workflowsList.length === 0 ? (
        <div className="text-center py-16 bg-[#14171C] rounded-xl border border-[#2B313D] p-8">
          <IconWorkflows className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Workflows Defined</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
            Assign detailed step-by-step methodologies to your SubServices to showcase engineering transparency.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C5A869] text-neutral-950 font-mono font-bold text-xs"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#2B313D] overflow-hidden bg-[#14171C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2B313D] bg-[#101216] text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    <th className="py-3 px-4">Workflow Title</th>
                    <th className="py-3 px-4">Associated SubService</th>
                    <th className="py-3 px-4">Main Service</th>
                    <th className="py-3 px-4">Step Count</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B313D]/60 text-sm">
                  {workflowsList.map((wf) => {
                    const isExpanded = expandedWorkflowId === wf.id;
                    return (
                      <React.Fragment key={wf.id}>
                        <tr className="hover:bg-[#1D2128] transition group">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedWorkflowId(isExpanded ? null : wf.id)
                                }
                                className="p-1 rounded text-neutral-400 hover:text-[#C5A869]"
                                title="Toggle step breakdown"
                              >
                                <span className="font-mono text-xs">
                                  {isExpanded ? "▼" : "▶"}
                                </span>
                              </button>
                              <span>{wf.title}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-white">
                            {wf.subServiceName || `SubService ID: ${wf.subServiceId}`}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#C5A869]">
                            {wf.mainServiceTitle || "—"}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-neutral-300">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 text-[#C5A869] font-bold">
                              {wf.stepsCount} {wf.stepsCount === 1 ? "Step" : "Steps"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {wf.isActive ? (
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
                                href={`/admin/workflows/${wf.id}`}
                                className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                                title="View Workflow Details"
                              >
                                <IconEye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => openEditModal(wf)}
                                className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                                title="Edit Workflow"
                              >
                                <IconEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(wf)}
                                className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition"
                                title="Delete Workflow"
                              >
                                <IconTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible Step Viewer */}
                        {isExpanded && (
                          <tr className="bg-[#0D0F12]">
                            <td colSpan={6} className="p-4 border-b border-[#2B313D]/40">
                              <div className="space-y-2 pl-6">
                                <div className="text-xs font-mono uppercase text-[#C5A869] font-bold mb-2">
                                  Complete Step-by-Step Breakdown:
                                </div>
                                {wf.steps && wf.steps.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {wf.steps.map((st, i) => (
                                      <div
                                        key={st.id || i}
                                        className="p-3 rounded-lg bg-[#14171C] border border-[#2B313D] space-y-1"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="w-5 h-5 rounded-full bg-[#C5A869] text-neutral-950 font-bold font-mono text-xs flex items-center justify-center">
                                            {st.stepNumber}
                                          </span>
                                          <span className="text-xs font-bold text-white font-mono">
                                            {st.title}
                                          </span>
                                        </div>
                                        {st.details && (
                                          <p className="text-[11px] text-neutral-400 font-sans leading-relaxed pl-7">
                                            {st.details}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs font-mono text-neutral-500">
                                    No steps configured for this workflow yet.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Workflow" : "Add Workflow & Steps"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Workflow Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
                placeholder="e.g. Architectural Design Deliverables"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1.5">
                Select One SubService * (Max 1 per SubService)
              </label>
              <select
                required
                value={formData.subServiceId}
                onChange={(e) => setFormData({ ...formData, subServiceId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0D0F12] border border-[#2B313D] rounded-lg text-white font-mono text-sm focus:border-[#C5A869] focus:outline-none"
              >
                {subServices
                  .filter((s) => !assignedSubServiceIds.has(s.id))
                  .map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.serviceName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#2B313D]">
            <div>
              <span className="text-xs font-mono uppercase text-[#C5A869] font-bold">
                Workflow Steps ({formData.steps.length})
              </span>
              <p className="text-[11px] text-neutral-400 font-mono">
                Dynamically add, edit, or remove workflow phases in order.
              </p>
            </div>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-[#C5A869] text-neutral-300 hover:text-neutral-950 font-mono font-bold text-xs transition"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Add Another Step</span>
            </button>
          </div>

          {/* Dynamic Steps List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {formData.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-[#0D0F12] border border-[#2B313D] space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono text-neutral-300 uppercase font-semibold">
                      Step #{idx + 1}
                    </span>
                  </div>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="p-1 rounded text-neutral-500 hover:text-red-400 transition"
                      title="Remove step"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Step Title (e.g. Concept Plan & Site Layout)"
                    value={step.title}
                    onChange={(e) => updateStepField(idx, "title", e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#14171C] border border-[#2B313D] rounded text-white font-mono text-xs focus:border-[#C5A869] focus:outline-none"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Step details or deliverables (optional)"
                    value={step.details || ""}
                    onChange={(e) => updateStepField(idx, "details", e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#14171C] border border-[#2B313D] rounded text-white font-sans text-xs focus:border-[#C5A869] focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#2B313D]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded bg-[#0D0F12] border-[#2B313D] text-[#C5A869] focus:ring-0"
              />
              <span className="text-xs font-mono text-neutral-300">
                Active / Visible in Workflows
              </span>
            </label>

            <div className="flex items-center gap-3">
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
                <span>{editingId ? "Update Workflow" : "Save Workflow"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Workflow"
        message={`Are you sure you want to delete the workflow "${deleteTarget?.title}"? All steps under it will also be removed.`}
        confirmLabel="Delete Workflow"
        isDestructive={true}
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
