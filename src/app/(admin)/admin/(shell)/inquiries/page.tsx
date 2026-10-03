"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  IconSearch,
  IconAlert,
  IconX,
  IconInquiries,
} from "@/components/admin/Icons";

interface InquiryItem {
  id: number;
  serviceRateId: number | null;
  serviceNameSnapshot: string;
  unitNameSnapshot: string;
  unitRateSnapshot: string;
  userQuantity: string;
  calculatedAmount: string;
  formattedRate: string;
  formattedAmount: string;
}

interface Inquiry {
  id: number;
  reference: string;
  fullName: string;
  email: string | null;
  phone: string;
  interestedService: string | null;
  message: string | null;
  tentativeBudget: string | null;
  status: "new" | "contacted" | "in_progress" | "closed";
  adminNotes: string | null;
  itemsCount: number;
  hasQuotation: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InquiryDetail extends Inquiry {
  formattedBudget: string | null;
  items: InquiryItem[];
}

export default function AdminInquiriesPage() {
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    new: 0,
    contacted: 0,
    in_progress: 0,
    closed: 0,
  });
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [inquiryDetail, setInquiryDetail] = useState<InquiryDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccessMessage, setNotesSuccessMessage] = useState(false);

  // Delete State
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch inquiries from API
  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load customer inquiries");
      }
      const data = await res.json();
      setInquiriesList(data.inquiries || []);
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch inquiries");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Fetch single inquiry detail
  const openDetail = async (id: number) => {
    setSelectedInquiryId(id);
    setIsLoadingDetail(true);
    setNotesSuccessMessage(false);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`);
      if (!res.ok) throw new Error("Failed to fetch inquiry details");
      const data = await res.json();
      setInquiryDetail(data.inquiry);
      setEditingNotes(data.inquiry.adminNotes || "");
    } catch (err: any) {
      alert(err.message || "Could not load inquiry details");
      setSelectedInquiryId(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Update status
  const handleStatusChange = async (newStatus: "new" | "contacted" | "in_progress" | "closed") => {
    if (!selectedInquiryId || !inquiryDetail) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update inquiry status");
      const data = await res.json();
      setInquiryDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
      setInquiriesList((prev) =>
        prev.map((item) => (item.id === selectedInquiryId ? { ...item, status: newStatus } : item))
      );
      // Refresh counts
      fetchInquiries();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save admin notes
  const handleSaveNotes = async () => {
    if (!selectedInquiryId) return;
    setIsSavingNotes(true);
    setNotesSuccessMessage(false);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: editingNotes }),
      });
      if (!res.ok) throw new Error("Failed to save admin notes");
      setInquiryDetail((prev) => (prev ? { ...prev, adminNotes: editingNotes } : null));
      setNotesSuccessMessage(true);
      setTimeout(() => setNotesSuccessMessage(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete inquiry
  const confirmDelete = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete inquiry");

      setInquiriesList((prev) => prev.filter((i) => i.id !== inquiryToDelete.id));
      if (selectedInquiryId === inquiryToDelete.id) {
        setSelectedInquiryId(null);
        setInquiryDetail(null);
      }
      setInquiryToDelete(null);
      fetchInquiries();
    } catch (err: any) {
      alert(err.message || "Failed to delete inquiry");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            ● New Lead
          </span>
        );
      case "contacted":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Contacted
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
            In Progress
          </span>
        );
      case "closed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono text-neutral-400 bg-neutral-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#2B313D]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Customer Inquiries
            </h1>
            {counts.new > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500 text-neutral-950">
                {counts.new} New
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time consultation requests, leads, and customer quotation breakdowns.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <IconSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, phone, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#14171C] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#2B313D]">
        {[
          { key: "all", label: "All Inquiries", count: counts.all },
          { key: "new", label: "New", count: counts.new, alert: counts.new > 0 },
          { key: "contacted", label: "Contacted", count: counts.contacted },
          { key: "in_progress", label: "In Progress", count: counts.in_progress },
          { key: "closed", label: "Closed", count: counts.closed },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-[#C5A869] text-neutral-950 font-bold"
                  : "bg-[#14171C] text-neutral-400 hover:text-white hover:bg-[#1D2128]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  isActive
                    ? "bg-neutral-950 text-[#C5A869]"
                    : tab.alert
                    ? "bg-amber-500/30 text-amber-300 font-bold"
                    : "bg-[#2B313D] text-neutral-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <IconAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inquiries Table / Empty state */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-neutral-400">
          Loading inquiries...
        </div>
      ) : inquiriesList.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-[#14171C] border border-[#2B313D] space-y-3">
          <IconInquiries className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No inquiries found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? `No inquiries matched "${searchQuery}". Try a different search.`
              : activeTab !== "all"
              ? `No inquiries currently marked as "${activeTab}".`
              : "No customer inquiries have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2B313D] bg-[#14171C] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0D0F12] text-xs font-mono uppercase text-neutral-400 border-b border-[#2B313D]">
                <tr>
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Service / Requirement</th>
                  <th className="py-3 px-4">Quotation Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B313D]/60">
                {inquiriesList.map((inq) => {
                  const createdDate = new Date(inq.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={inq.id}
                      className="hover:bg-[#1D2128] transition group cursor-pointer"
                      onClick={() => openDetail(inq.id)}
                    >
                      {/* Ref ID */}
                      <td className="py-4 px-4 font-mono font-bold text-white text-xs whitespace-nowrap">
                        <span className="text-[#C5A869]">{inq.reference}</span>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white tracking-tight">
                          {inq.fullName}
                        </div>
                        <div className="text-xs font-mono text-neutral-400 flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${inq.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-[#C5A869]"
                          >
                            📞 {inq.phone}
                          </a>
                          {inq.email && (
                            <span className="text-neutral-500">| ✉️ {inq.email}</span>
                          )}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-neutral-300 font-medium truncate">
                          {inq.interestedService || "General Consultation"}
                        </div>
                        {inq.message && (
                          <div className="text-xs text-neutral-500 truncate mt-0.5">
                            "{inq.message}"
                          </div>
                        )}
                      </td>

                      {/* Quotation Total */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {inq.tentativeBudget ? (
                          <div>
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              ₹{parseFloat(inq.tentativeBudget).toLocaleString("en-IN")}
                            </span>
                            {inq.hasQuotation && (
                              <span className="block text-[10px] font-mono text-[#C5A869]">
                                {inq.itemsCount} disciplines
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-xs font-mono">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(inq.status)}
                      </td>

                      {/* Submitted */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs font-mono text-neutral-400">
                        {createdDate}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-4 text-right whitespace-nowrap space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openDetail(inq.id)}
                          className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-[#C5A869] text-white hover:text-neutral-950 font-mono text-xs font-semibold transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setInquiryToDelete(inq)}
                          className="px-2.5 py-1.5 rounded bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 font-mono text-xs transition"
                          title="Delete Inquiry"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer Modal */}
      {selectedInquiryId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#14171C] border border-[#2B313D] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {isLoadingDetail ? (
              <div className="py-16 text-center text-sm font-mono text-neutral-400">
                Loading details for inquiry #{selectedInquiryId}...
              </div>
            ) : inquiryDetail ? (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2B313D]">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded bg-[#C5A869]/20 text-[#C5A869] font-mono font-bold text-xs uppercase tracking-wider">
                        {inquiryDetail.reference}
                      </span>
                      {getStatusBadge(inquiryDetail.status)}
                    </div>
                    <h2 className="text-2xl font-black text-white mt-2">
                      {inquiryDetail.fullName}
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Submitted on{" "}
                      {new Date(inquiryDetail.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}{" "}
                      IST
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInquiryId(null);
                      setInquiryDetail(null);
                    }}
                    className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>

                {/* Contact & Service Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0D0F12] border border-[#2B313D]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${inquiryDetail.phone}`}
                      className="text-sm font-mono font-bold text-white hover:text-[#C5A869] block mt-0.5"
                    >
                      📞 {inquiryDetail.phone}
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      Email Address
                    </span>
                    <span className="text-sm text-neutral-200 block mt-0.5">
                      {inquiryDetail.email ? (
                        <a
                          href={`mailto:${inquiryDetail.email}`}
                          className="hover:text-[#C5A869]"
                        >
                          ✉️ {inquiryDetail.email}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      Interested Service
                    </span>
                    <span className="text-sm font-semibold text-[#C5A869] block mt-0.5">
                      {inquiryDetail.interestedService || "General Consultation"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      Direct WhatsApp Follow-up
                    </span>
                    <a
                      href={`https://wa.me/${inquiryDetail.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(inquiryDetail.fullName)},%20thank%20you%20for%20reaching%20out%20to%20MAYA%20Design%20%26%20Build%20regarding%20${encodeURIComponent(inquiryDetail.reference)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:underline mt-0.5"
                    >
                      <span>💬 Message on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Customer Message */}
                {inquiryDetail.message && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      Customer Message:
                    </span>
                    <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#2B313D] text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
                      {inquiryDetail.message}
                    </div>
                  </div>
                )}

                {/* Quotation Line Items Breakdown (if present) */}
                {inquiryDetail.items && inquiryDetail.items.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#C5A869] font-bold">
                        Quotation Line Items Breakdown ({inquiryDetail.items.length})
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Server-authoritative database rates snapshot
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#2B313D] overflow-hidden bg-[#0D0F12]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#14171C] text-neutral-400 border-b border-[#2B313D] uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Discipline</th>
                            <th className="py-2.5 px-3">Rate</th>
                            <th className="py-2.5 px-3">Quantity</th>
                            <th className="py-2.5 px-3 text-right">Calculated Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2B313D]/40">
                          {inquiryDetail.items.map((item) => (
                            <tr key={item.id} className="hover:bg-[#1D2128]">
                              <td className="py-2 px-3 text-white font-medium">
                                {item.serviceNameSnapshot}
                              </td>
                              <td className="py-2 px-3 text-neutral-400">
                                {item.formattedRate} / {item.unitNameSnapshot}
                              </td>
                              <td className="py-2 px-3 text-neutral-300">
                                {parseFloat(item.userQuantity)}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-amber-400">
                                {item.formattedAmount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-[#14171C] border-t border-[#2B313D] font-bold">
                          <tr>
                            <td colSpan={3} className="py-3 px-3 uppercase text-neutral-300">
                              Total Commercial Estimate
                            </td>
                            <td className="py-3 px-3 text-right text-base text-amber-400">
                              {inquiryDetail.formattedBudget || "₹" + inquiryDetail.tentativeBudget}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Workflow Status Selector */}
                <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#2B313D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                      Inquiry Workflow Status
                    </span>
                    {isUpdatingStatus && (
                      <span className="text-xs font-mono text-[#C5A869] animate-pulse">
                        Updating status...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["new", "contacted", "in_progress", "closed"] as const).map((st) => {
                      const isCurrent = inquiryDetail.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleStatusChange(st)}
                          className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition border ${
                            isCurrent
                              ? "bg-[#C5A869] text-neutral-950 border-[#C5A869]"
                              : "bg-[#14171C] text-neutral-400 border-[#2B313D] hover:text-white hover:border-neutral-500"
                          }`}
                        >
                          {st.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Internal Admin Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                      Internal Admin Notes
                    </span>
                    {notesSuccessMessage && (
                      <span className="text-xs font-mono text-emerald-400">
                        ✓ Notes saved successfully
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Add site meeting notes, customer call logs, or project status..."
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-neutral-200 placeholder-neutral-500 focus:outline-hidden"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSavingNotes}
                      onClick={handleSaveNotes}
                      className="px-4 py-2 rounded-lg bg-[#C5A869] hover:bg-[#d4af37] text-neutral-950 font-bold text-xs uppercase tracking-wider transition"
                    >
                      {isSavingNotes ? "Saving Notes..." : "Save Admin Notes"}
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <div className="pt-4 border-t border-[#2B313D] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setInquiryToDelete(inquiryDetail)}
                    className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-bold transition border border-red-500/30"
                  >
                    Delete Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInquiryId(null);
                      setInquiryDetail(null);
                    }}
                    className="px-6 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold transition"
                  >
                    Close Drawer
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {inquiryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#14171C] border border-red-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <IconAlert className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold">Delete Inquiry?</h3>
            </div>
            <p className="text-sm text-neutral-300">
              Are you sure you want to permanently delete inquiry{" "}
              <strong className="text-white">{inquiryToDelete.reference}</strong> from{" "}
              <strong className="text-white">{inquiryToDelete.fullName}</strong>?
            </p>
            <p className="text-xs text-neutral-400">
              Any attached quotation line-item records will also be removed. This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setInquiryToDelete(null)}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
