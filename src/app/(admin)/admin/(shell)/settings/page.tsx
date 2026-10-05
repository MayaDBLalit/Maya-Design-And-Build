"use client";

import React, { useState, useEffect } from "react";
import { IconSettings, IconCheck, IconAlert } from "@/components/admin/Icons";

interface SettingItem {
  id: number;
  keyName: string;
  valueContent: string | null;
  groupName: string;
  updatedAt: string;
}

const SETTING_LABELS: Record<string, { label: string; group: string; type?: "text" | "textarea" | "url" | "email" }> = {
  hero_headline: { label: "Homepage Hero Headline", group: "General" },
  hero_subheadline: { label: "Homepage Hero Subheadline", group: "General", type: "textarea" },
  about_summary: { label: "About Maya Summary", group: "General", type: "textarea" },
  contact_phone: { label: "Primary Contact Phone", group: "Contact" },
  contact_email: { label: "Primary Contact Email", group: "Contact", type: "email" },
  contact_address: { label: "Office Address", group: "Contact", type: "textarea" },
  google_maps_url: { label: "Google Maps Location Link", group: "Contact", type: "url" },
  office_hours: { label: "Working / Office Hours", group: "Contact" },
  instagram_url: { label: "Instagram Profile URL", group: "Social", type: "url" },
  facebook_url: { label: "Facebook Page URL", group: "Social", type: "url" },
  linkedin_url: { label: "LinkedIn Company URL", group: "Social", type: "url" },
  youtube_url: { label: "YouTube Channel URL", group: "Social", type: "url" },
  terms_and_conditions: { label: "Terms & Conditions Text", group: "Legal", type: "textarea" },
  privacy_policy: { label: "Privacy Policy Text", group: "Legal", type: "textarea" },
};

export default function AdminSettingsPage() {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("General");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch settings");

      const map: Record<string, string> = {};
      (data.settings || []).forEach((item: SettingItem) => {
        if (SETTING_LABELS[item.keyName]) {
          map[item.keyName] = item.valueContent || "";
        }
      });

      // Ensure all defined keys exist in state
      Object.keys(SETTING_LABELS).forEach((key) => {
        if (map[key] === undefined) {
          map[key] = "";
        }
      });

      setSettingsMap(map);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = Object.keys(SETTING_LABELS).map((keyName) => ({
      keyName,
      valueContent: (settingsMap[keyName] || "").trim() || null,
    }));

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save settings");

      setToastMessage("All website settings have been saved and applied.");
      setTimeout(() => setToastMessage(null), 4000);
      fetchSettings();
    } catch (err: any) {
      alert(err.message || "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const groups = ["General", "Contact", "Social", "Legal"];

  // Filter settings keys for the active tab
  const currentTabKeys = Object.keys(SETTING_LABELS).filter(
    (key) => SETTING_LABELS[key].group === activeTab
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <IconSettings className="w-7 h-7 text-[#C5A869]" />
            Website Settings & Brand Identity
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage public company information, contact details, social links, and legal text.
          </p>
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

      {/* Security Notice */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-[#14171C] text-xs text-neutral-400 flex items-start gap-3">
        <IconAlert className="w-4 h-4 text-[#C5A869] flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-white">Public Configuration Allowlist:</span> Only
          whitelisted public parameters are editable here. Database credentials, JWT signing keys,
          and internal secrets are strictly isolated and never exposed through the CMS.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2B313D] pb-1">
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setActiveTab(group)}
            className={`px-4 py-2 rounded-t-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
              activeTab === group
                ? "bg-[#14171C] text-[#C5A869] border-t-2 border-[#C5A869] font-bold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-neutral-400">Loading settings...</div>
      ) : (
        <form onSubmit={handleSaveAll} className="space-y-6">
          <div className="rounded-xl border border-[#2B313D] bg-[#14171C] p-6 space-y-5">
            {currentTabKeys.map((key) => {
              const meta = SETTING_LABELS[key];
              const value = settingsMap[key] || "";

              return (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    {meta.label}
                  </label>
                  {meta.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder={`Enter ${meta.label.toLowerCase()}...`}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white placeholder-neutral-600 focus:outline-hidden focus:border-[#C5A869]"
                    />
                  ) : (
                    <input
                      type={meta.type || "text"}
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder={`Enter ${meta.label.toLowerCase()}...`}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0F1115] border border-[#2B313D] text-sm text-white placeholder-neutral-600 focus:outline-hidden focus:border-[#C5A869]"
                    />
                  )}
                  <p className="text-[11px] font-mono text-neutral-500 mt-1">
                    Key: {key}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-950 bg-[#C5A869] hover:bg-[#d4af37] rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
            >
              {isSaving ? "Saving Settings..." : "Save Website Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
