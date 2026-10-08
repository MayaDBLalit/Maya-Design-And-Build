"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "@/components/admin/Modal";
import { FileUpload } from "@/components/admin/FileUpload";
import {
  IconFactors,
  IconEdit,
  IconCheck,
  IconPlus,
  IconTrash,
  IconAlert,
} from "@/components/admin/Icons";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

interface FiveFactorItem {
  id: number;
  factorType: "space" | "air" | "fire" | "water" | "earth";
  titleEnglish: string;
  titleHindi: string;
  iconImage: string | null;
  tagline: string | null;
  detailsText: string | null;
  impactPoints: string[] | null;
  updatedAt: string;
}

const FACTOR_DESCRIPTIONS: Record<string, string> = {
  space: "Celestial / Sky harmony, volumetric void, and daylight sightlines.",
  air: "Microclimate modeling, passive cross-ventilation, and curtain/breeze flow.",
  fire: "Sun-path trajectory mapping, solar energy balance, and diurnal light warmth.",
  water: "Hydraulic balance, central reflection pool, and microclimate tranquility.",
  earth: "Geotechnical bedrock, authentic materials, stone tiles, and structural grounding.",
};

export default function AdminFiveFactorsPage() {
  const [factors, setFactors] = useState<FiveFactorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<FiveFactorItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [titleEnglish, setTitleEnglish] = useState("");
  const [titleHindi, setTitleHindi] = useState("");
  const [iconImage, setIconImage] = useState("");
  const [tagline, setTagline] = useState("");
  const [detailsText, setDetailsText] = useState("");
  const [impactPoints, setImpactPoints] = useState<string[]>([]);

  const fetchFactors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/factors");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch factors");
      setFactors(data.factors || []);
    } catch (err: any) {
      setError(err.message || "Failed to load factors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const handleOpenEdit = (factor: FiveFactorItem) => {
    setEditingFactor(factor);
    setTitleEnglish(factor.titleEnglish);
    setTitleHindi(factor.titleHindi);
    setIconImage(factor.iconImage || "");
    setTagline(factor.tagline || "");
    setDetailsText(factor.detailsText || "");
    setImpactPoints(Array.isArray(factor.impactPoints) ? [...factor.impactPoints] : []);
    setIsModalOpen(true);
  };

  const handleAddImpactPoint = () => {
    if (impactPoints.length >= 10) return;
    setImpactPoints([...impactPoints, ""]);
  };

  const handleUpdateImpactPoint = (index: number, val: string) => {
    const updated = [...impactPoints];
    updated[index] = val;
    setImpactPoints(updated);
  };

  const handleRemoveImpactPoint = (index: number) => {
    setImpactPoints(impactPoints.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFactor) return;

    if (!titleEnglish.trim()) {
      alert("English Title is required.");
      return;
    }
    if (!titleHindi.trim()) {
      alert("Hindi Title is required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        titleEnglish: titleEnglish.trim(),
        titleHindi: titleHindi.trim(),
        iconImage: iconImage.trim() || null,
        tagline: tagline.trim() || null,
        detailsText: detailsText.trim() || null,
        impactPoints: impactPoints.map((p) => p.trim()).filter((p) => p.length > 0),
      };

      const res = await fetch(`/api/admin/factors/${editingFactor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to update factor");

      setToastMessage(`Factor "${payload.titleEnglish} (${payload.titleHindi})" updated successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      setIsModalOpen(false);
      setEditingFactor(null);
      fetchFactors();
    } catch (err: any) {
      alert(err.message || "Failed to save factor");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <IconFactors className="w-7 h-7 text-[#C5A869]" />
            The Five Elemental Factors
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage bilingual titles, icons, architectural philosophy, and dynamic impact points for the 5 fixed spatial elements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#C5A869]/10 border border-[#C5A869]/30 text-[#C5A869] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <IconCheck className="w-4 h-4" />
            5 Permanent Factors
          </span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <IconCheck className="w-5 h-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white text-xs font-semibold uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <IconAlert className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchFactors}
            className="px-3 py-1 rounded-md bg-rose-900/50 hover:bg-rose-800 text-xs text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Factors List */}
      {isLoading ? (
        <CardSkeleton count={5} hasImage={false} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {factors.map((factor) => {
            const pointsCount = Array.isArray(factor.impactPoints) ? factor.impactPoints.length : 0;
            return (
              <div
                key={factor.id}
                className="bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869]/50 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-md group"
              >
                <div>
                  {/* Top Bar: Icon & Factor Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#0D0F12] border border-[#2B313D] flex items-center justify-center p-2.5">
                      {factor.iconImage ? (
                        <Image
                          src={factor.iconImage}
                          alt={factor.titleEnglish}
                          width={36}
                          height={36}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <IconFactors className="w-7 h-7 text-[#C5A869]" />
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-[#C5A869]/10 text-[#C5A869] border border-[#C5A869]/30">
                      {factor.factorType}
                    </span>
                  </div>

                  {/* Title & Hindi Subtitle */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-bold text-white tracking-wide">
                        {factor.titleEnglish}
                      </h3>
                      <span className="text-sm font-serif text-[#C5A869] font-medium">
                        ({factor.titleHindi})
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 italic">
                      &ldquo;{factor.tagline || FACTOR_DESCRIPTIONS[factor.factorType]}&rdquo;
                    </p>
                  </div>

                  {/* Details text preview */}
                  {factor.detailsText && (
                    <p className="text-xs text-neutral-300 line-clamp-3 mb-4 leading-relaxed bg-[#0D0F12]/60 p-2.5 rounded-lg border border-[#2B313D]/50">
                      {factor.detailsText}
                    </p>
                  )}

                  {/* Impact points preview */}
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
                      <span>Impact Points</span>
                      <span className="text-[#C5A869]">{pointsCount} points</span>
                    </div>
                    {pointsCount > 0 ? (
                      <ul className="space-y-1">
                        {factor.impactPoints?.slice(0, 3).map((pt, idx) => (
                          <li key={idx} className="text-xs text-neutral-300 flex items-center gap-2 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A869] shrink-0" />
                            <span className="truncate">{pt}</span>
                          </li>
                        ))}
                        {pointsCount > 3 && (
                          <li className="text-[11px] text-neutral-500 italic pl-3.5">
                            +{pointsCount - 3} more point{pointsCount - 3 > 1 ? "s" : ""}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-500 italic">No points configured yet.</p>
                    )}
                  </div>
                </div>

                {/* Footer Edit button */}
                <div className="pt-4 border-t border-[#2B313D] flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500">
                    Updated {new Date(factor.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(factor)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5A869]/10 hover:bg-[#C5A869] text-[#C5A869] hover:text-[#0D0F12] text-xs font-semibold tracking-wider transition-colors duration-150"
                  >
                    <IconEdit className="w-3.5 h-3.5" />
                    Edit Factor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingFactor && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            if (!isSaving) {
              setIsModalOpen(false);
              setEditingFactor(null);
            }
          }}
          title={`Edit Factor — ${editingFactor.titleEnglish} (${editingFactor.titleHindi})`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-5">
            {/* Factor Type (Read Only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Factor Element Type (Permanent System Key)
              </label>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0D0F12] border border-[#2B313D]">
                <span className="px-2.5 py-1 rounded bg-[#C5A869]/20 text-[#C5A869] text-xs font-bold uppercase tracking-wider">
                  {editingFactor.factorType}
                </span>
                <span className="text-xs text-neutral-400">
                  {FACTOR_DESCRIPTIONS[editingFactor.factorType]} (Immutable element identifier)
                </span>
              </div>
            </div>

            {/* Bilingual Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                  Title (English) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={titleEnglish}
                  onChange={(e) => setTitleEnglish(e.target.value)}
                  required
                  placeholder="e.g. Water"
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#2B313D] text-white focus:outline-hidden focus:border-[#C5A869] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                  Title (Hindi) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={titleHindi}
                  onChange={(e) => setTitleHindi(e.target.value)}
                  required
                  placeholder="e.g. जल"
                  className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#2B313D] text-white focus:outline-hidden focus:border-[#C5A869] text-sm font-serif"
                />
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                Tagline / Essence
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Calmness. Flow. Reflection."
                className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#2B313D] text-white focus:outline-hidden focus:border-[#C5A869] text-sm"
              />
            </div>

            {/* Icon Upload & Preview */}
            <div>
              <FileUpload
                label="Factor Icon (SVG / Transparent PNG)"
                value={iconImage}
                onChange={(url) => setIconImage(url)}
                acceptType="image"
                purpose="general"
                helperText="Upload transparent SVG or PNG icon, or provide absolute URL."
              />
            </div>

            {/* Architectural Details Text */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Architectural Philosophy &amp; Details
                </label>
                <span className="text-[11px] text-neutral-500">{detailsText.length} characters</span>
              </div>
              <textarea
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                rows={4}
                placeholder="Explain how MAYA integrates this element into architecture and spatial design..."
                className="w-full px-3 py-2 rounded-lg bg-[#0D0F12] border border-[#2B313D] text-white focus:outline-hidden focus:border-[#C5A869] text-sm leading-relaxed"
              />
            </div>

            {/* Repeatable Impact Points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Dynamic Impact Points (Key Highlights)
                </label>
                <button
                  type="button"
                  onClick={handleAddImpactPoint}
                  disabled={impactPoints.length >= 10}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#C5A869]/20 hover:bg-[#C5A869] text-[#C5A869] hover:text-[#0D0F12] text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  Add Point
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {impactPoints.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic p-3 bg-[#0D0F12] rounded-lg border border-[#2B313D]">
                    No impact points configured. Click &ldquo;Add Point&rdquo; to add bullet highlights.
                  </p>
                ) : (
                  impactPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-mono text-neutral-500">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleUpdateImpactPoint(index, e.target.value)}
                        placeholder="e.g. Hydraulic Balance"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#0D0F12] border border-[#2B313D] text-white focus:outline-hidden focus:border-[#C5A869] text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImpactPoint(index)}
                        className="p-2 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Remove point"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-[#2B313D] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingFactor(null);
                }}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C5A869] hover:bg-[#d8bc7d] text-[#0D0F12] text-sm font-bold tracking-wide transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconCheck className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
