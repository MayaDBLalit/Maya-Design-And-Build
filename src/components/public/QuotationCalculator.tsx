"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { formatINR } from "@/lib/formatters";

export interface RateItem {
  id: number;
  serviceName: string;
  baseRate: string;
  rateType: "fixed" | "per_sqft" | "per_view" | "per_visit" | "percentage" | string;
  defaultQty: string;
  displayOrder: number;
  unitName: string | null;
  unitSymbol: string | null;
}

interface QuotationCalculatorProps {
  initialRates: RateItem[];
}

interface SelectedItemState {
  selected: boolean;
  quantity: number;
}

export function QuotationCalculator({ initialRates }: QuotationCalculatorProps) {
  // Sort initial active rates by displayOrder
  const sortedRates = useMemo(
    () => [...initialRates].sort((a, b) => a.displayOrder - b.displayOrder),
    [initialRates]
  );

  // Global Area synchronizer (e.g. 2000 sqft)
  const defaultArea = useMemo(() => {
    const sqftItem = sortedRates.find((r) => r.rateType === "per_sqft");
    return sqftItem ? parseFloat(sqftItem.defaultQty) || 2000 : 2000;
  }, [sortedRates]);

  const [projectArea, setProjectArea] = useState<number>(defaultArea);

  // State for each rate item
  const [itemStates, setItemStates] = useState<Record<number, SelectedItemState>>(() => {
    const initial: Record<number, SelectedItemState> = {};
    sortedRates.forEach((rate) => {
      initial[rate.id] = {
        selected: true,
        quantity: parseFloat(rate.defaultQty) || 1,
      };
    });
    return initial;
  });

  // Server-side authoritative calculation result
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Inquiry Submission Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquirySuccessData, setInquirySuccessData] = useState<{
    reference: string;
    formattedTotal: string;
    whatsappUrl: string;
  } | null>(null);

  // Trigger authoritative server-side calculation
  const triggerServerCalculation = useCallback(
    async (currentStates: Record<number, SelectedItemState>) => {
      const activePayload = sortedRates
        .filter((r) => currentStates[r.id]?.selected)
        .map((r) => ({
          rateId: r.id,
          quantity: currentStates[r.id]?.quantity ?? 0,
        }));

      if (activePayload.length === 0) {
        setServerTotal(0);
        return;
      }

      setIsCalculating(true);
      try {
        const res = await fetch("/api/quotation/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: activePayload }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setServerTotal(data.total);
        }
      } catch (err) {
        console.error("Server calculation error:", err);
      } finally {
        setIsCalculating(false);
      }
    },
    [sortedRates]
  );

  // Run calculation on initial mount and state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerServerCalculation(itemStates);
    }, 250);
    return () => clearTimeout(timer);
  }, [itemStates, triggerServerCalculation]);

  // Synchronize area across all per_sqft disciplines
  const handleAreaChange = (newArea: number) => {
    const validArea = Math.max(0, newArea);
    setProjectArea(validArea);
    setItemStates((prev) => {
      const updated = { ...prev };
      sortedRates.forEach((r) => {
        if (r.rateType === "per_sqft") {
          updated[r.id] = {
            ...updated[r.id],
            quantity: validArea,
          };
        }
      });
      return updated;
    });
  };

  const toggleItem = (id: number) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id]?.selected,
      },
    }));
  };

  const handleQuantityChange = (id: number, qty: number) => {
    const validQty = Math.max(0, qty);
    setItemStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: validQty,
      },
    }));
  };

  // Immediate client fallback while server verifies
  const clientSubtotal = useMemo(() => {
    return sortedRates.reduce((acc, rate) => {
      const state = itemStates[rate.id];
      if (!state || !state.selected) return acc;
      const rateVal = parseFloat(rate.baseRate);
      if (rate.rateType === "fixed") {
        return acc + (state.quantity > 0 ? rateVal * state.quantity : rateVal);
      }
      return acc + state.quantity * rateVal;
    }, 0);
  }, [sortedRates, itemStates]);

  const displayTotal = serverTotal !== null ? serverTotal : clientSubtotal;
  const activeCount = Object.values(itemStates).filter((s) => s.selected).length;

  // Handle Inquiry Submission
  const handleSubmitQuotationInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingInquiry) return;

    setInquiryError(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setInquiryError("Please enter your full name (at least 2 characters).");
      return;
    }
    const cleanDigits = customerPhone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setInquiryError("Please enter a valid 10-digit phone number.");
      return;
    }

    const quotationItemsPayload = sortedRates
      .filter((r) => itemStates[r.id]?.selected)
      .map((r) => ({
        rateId: r.id,
        quantity: itemStates[r.id]?.quantity ?? 0,
      }));

    if (quotationItemsPayload.length === 0) {
      setInquiryError("Please select at least one quotation discipline before submitting.");
      return;
    }

    setIsSubmittingInquiry(true);

    try {
      const fullMessage = [
        projectLocation.trim() ? `Project Location: ${projectLocation.trim()}` : null,
        `Built-Up Area: ${projectArea} sq.ft`,
        customerNotes.trim() ? `Notes: ${customerNotes.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || undefined,
          interestedService: `Turnkey Quotation (${activeCount} disciplines)`,
          message: fullMessage,
          quotationItems: quotationItemsPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.details?.fieldErrors) {
          const firstErr = Object.values(data.details.fieldErrors).flat()[0];
          throw new Error(String(firstErr) || "Validation failed");
        }
        throw new Error(data.message || data.error || "Failed to submit quotation inquiry");
      }

      setInquirySuccessData({
        reference: data.reference,
        formattedTotal: data.formattedTotal || formatINR(displayTotal),
        whatsappUrl: data.whatsappUrl,
      });
    } catch (err: any) {
      setInquiryError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <section id="quotation" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>08</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Dynamic Quotation Calculator
            </h2>
          </div>
          <p className="text-sm text-neutral-400 max-w-md font-light leading-relaxed">
            Real-time, itemized engineering estimates. No fixed or opaque packages. Choose the exact
            disciplines required for your project.
          </p>
        </div>

        {/* Global Built-Up Area Control Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#14171C] via-[#1D2128] to-[#14171C] border border-[#C5A869]/40 mb-10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C5A869] font-bold">
                Project Scale Multiplier
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Total Built-Up Area (Sq.Ft)
              </h3>
              <p className="text-xs text-neutral-400">
                Adjusting this value updates all area-based disciplines automatically.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={projectArea}
                  onChange={(e) => handleAreaChange(parseFloat(e.target.value) || 0)}
                  className="w-40 sm:w-48 px-4 py-3 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-xl font-mono font-black text-white text-right focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400 pointer-events-none">
                  sq.ft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Disciplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {sortedRates.map((rate) => {
            const isSelected = itemStates[rate.id]?.selected ?? false;
            const quantity = itemStates[rate.id]?.quantity ?? 0;
            const numericRate = parseFloat(rate.baseRate);
            const lineTotal =
              rate.rateType === "fixed"
                ? numericRate * (quantity > 0 ? quantity : 1)
                : quantity * numericRate;

            return (
              <div
                key={rate.id}
                className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#14171C] border-[#C5A869]/60 shadow-md"
                    : "bg-[#14171C]/40 border-[#2B313D]/60 opacity-60"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Checkbox + Title + Rate Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(rate.id)}
                        className="mt-1 w-4 h-4 rounded text-[#C5A869] focus:ring-[#C5A869] bg-neutral-900 border-[#2B313D] cursor-pointer"
                      />
                      <div>
                        <h4
                          className={`text-sm font-bold tracking-tight transition ${
                            isSelected ? "text-white" : "text-neutral-400"
                          }`}
                        >
                          {rate.serviceName}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-400">
                          Rate: ₹{numericRate.toLocaleString("en-IN")} / {rate.unitSymbol || "unit"}
                        </span>
                      </div>
                    </label>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black/60 text-[#C5A869] border border-[#C5A869]/30">
                      {rate.rateType}
                    </span>
                  </div>

                  {/* Quantity Input Controls */}
                  {isSelected && (
                    <div className="pt-3 border-t border-[#2B313D]/60 flex items-center justify-between gap-4">
                      <span className="text-xs text-neutral-400 font-mono">
                        Quantity ({rate.unitSymbol || "units"}):
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              rate.id,
                              Math.max(0, quantity - (rate.rateType === "per_sqft" ? 100 : 1))
                            )
                          }
                          className="w-7 h-7 rounded bg-[#0D0F12] border border-[#2B313D] text-neutral-300 hover:text-white hover:border-[#C5A869] flex items-center justify-center font-mono font-bold text-sm transition"
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="0"
                          step={rate.rateType === "per_sqft" ? "50" : "1"}
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(rate.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 rounded bg-[#0D0F12] border border-[#2B313D] text-xs font-mono font-bold text-white text-center focus:outline-hidden focus:border-[#C5A869]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              rate.id,
                              quantity + (rate.rateType === "per_sqft" ? 100 : 1)
                            )
                          }
                          className="w-7 h-7 rounded bg-[#0D0F12] border border-[#2B313D] text-neutral-300 hover:text-white hover:border-[#C5A869] flex items-center justify-center font-mono font-bold text-sm transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Line Item Total */}
                {isSelected && (
                  <div className="pt-3 mt-3 border-t border-[#2B313D]/40 flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-mono text-[11px]">
                      Line Total:
                    </span>
                    <span className="font-mono font-bold text-[#C5A869] text-sm">
                      {formatINR(lineTotal)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Authoritative Total Estimation Summary Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#14171C] border-2 border-[#C5A869] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-[#C5A869]/20 text-[#C5A869] text-xs font-mono font-bold uppercase tracking-wider">
                  Authoritative Server Estimate
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {activeCount} of {sortedRates.length} Disciplines Selected
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Estimated Commercial Total
              </h3>

              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Estimated Quotation — Final scope and commercial terms are subject to physical site
                inspection and executed engineering agreement by MAYA Design &amp; Build. No hidden
                package markups.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="text-left lg:text-right">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block">
                  Total Estimate (INR)
                </span>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-white mt-1">
                  {isCalculating ? (
                    <span className="text-[#C5A869] animate-pulse">Calculating...</span>
                  ) : (
                    formatINR(displayTotal)
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInquirySuccessData(null);
                  setInquiryError(null);
                  setModalOpen(true);
                }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#C5A869] to-[#d4af37] text-neutral-950 font-black text-xs uppercase tracking-[0.15em] hover:brightness-110 shadow-lg hover:shadow-[#C5A869]/30 transition duration-300 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Submit Inquiry with this Estimate &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Inquiry Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#14171C] border border-[#2B313D] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {inquirySuccessData ? (
              /* Success confirmation state */
              <div className="py-6 space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded bg-[#C5A869]/20 text-[#C5A869] font-mono font-bold text-xs uppercase tracking-wider">
                    {inquirySuccessData.reference}
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    Quotation Inquiry Stored!
                  </h3>
                  <p className="text-sm text-neutral-300 max-w-sm mx-auto leading-relaxed">
                    Your quotation breakdown and estimated total of{" "}
                    <strong className="text-amber-400 font-mono">
                      {inquirySuccessData.formattedTotal}
                    </strong>{" "}
                    have been saved in MySQL. Our engineers have been alerted.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-[#0D0F12] border border-[#2B313D] space-y-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                    Next Step: Continuation
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Click below to open WhatsApp with your prefilled inquiry reference and proposal
                    summary to connect directly with our engineering team:
                  </p>

                  <a
                    href={inquirySuccessData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/40 active:scale-95"
                  >
                    <span>💬 Continue on WhatsApp</span>
                    <span>&rarr;</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setInquirySuccessData(null);
                    }}
                    className="text-xs font-mono text-neutral-400 hover:text-white uppercase tracking-wider underline"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              /* Quotation Inquiry Submission Form */
              <form onSubmit={handleSubmitQuotationInquiry} className="space-y-5">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2B313D]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A869] font-bold">
                      Official Engineering Proposal
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                      Request Quotation Proposal
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Estimate Snapshot Banner */}
                <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#2B313D] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      Built-Up Area &amp; Disciplines
                    </span>
                    <span className="text-xs font-mono text-white font-semibold mt-0.5 block">
                      {projectArea} sq.ft • {activeCount} disciplines
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      Authoritative Total
                    </span>
                    <span className="text-base font-mono font-black text-amber-400">
                      {formatINR(displayTotal)}
                    </span>
                  </div>
                </div>

                {inquiryError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    ⚠️ {inquiryError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                      Full Name <span className="text-[#C5A869]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Er. Rajesh Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                      Phone Number <span className="text-[#C5A869]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                      Email Address <span className="text-neutral-500">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                      Site Location <span className="text-neutral-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bardoli / Surat / Navsari"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                    Special Requirements / Site Conditions <span className="text-neutral-500">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Plot dimensions, number of floors, target commencement month..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C5A869] to-[#d4af37] text-neutral-950 font-black text-xs uppercase tracking-[0.15em] hover:brightness-110 shadow-lg shadow-[#C5A869]/20 transition duration-300 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingInquiry
                      ? "Recording Quotation Inquiry..."
                      : "Confirm & Submit Quotation Inquiry →"}
                  </button>
                  <p className="text-[11px] text-neutral-500 text-center mt-2.5">
                    Inquiry and quotation line items will be stored securely in MySQL first.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
