"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { formatINR } from "@/lib/formatters";
import { Spinner } from "@/components/ui/Spinner";

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

  // Run calculation on initial mount and state changes with debounce
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
    <section id="quotation" className="py-28 bg-[#F9F6F5] relative border-t border-[#BCC1C4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>08</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47]">
              Dynamic Quotation Calculator
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#455668] max-w-md font-normal leading-relaxed">
            Real-time, itemized engineering estimates. No fixed or opaque packages. Choose the exact
            disciplines required for your project.
          </p>
        </div>

        {/* Global Built-Up Area Control Banner */}
        <div className="p-6 sm:p-8 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 mb-10 shadow-[0_4px_20px_rgba(3,45,71,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#966015] font-bold">
                Project Scale Multiplier
              </span>
              <h3 className="text-xl font-bold text-[#032D47] tracking-tight">
                Total Built-Up Area (Sq.Ft)
              </h3>
              <p className="text-xs text-[#455668]">
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
                  className="w-40 sm:w-48 px-4 py-3 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 focus:border-[#032D47] text-xl font-mono font-black text-[#032D47] text-right focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#455668] pointer-events-none font-bold">
                  sq.ft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Disciplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
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
                className={`p-6 rounded-xs border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FFFFFF] border-[#966015] shadow-xs"
                    : "bg-[#FFFFFF]/60 border-[#BCC1C4]/50 opacity-60"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Checkbox + Title + Rate Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-3.5 cursor-pointer select-none flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(rate.id)}
                        className="mt-1 w-4 h-4 rounded-xs text-[#966015] focus:ring-[#966015] bg-[#F9F6F5] border-[#BCC1C4] cursor-pointer"
                      />
                      <div>
                        <h4
                          className={`text-base font-bold tracking-tight transition-colors ${
                            isSelected ? "text-[#032D47]" : "text-[#455668]"
                          }`}
                        >
                          {rate.serviceName}
                        </h4>
                        <span className="text-xs font-mono text-[#455668]">
                          Rate: ₹{numericRate.toLocaleString("en-IN")} / {rate.unitSymbol || "unit"}
                        </span>
                      </div>
                    </label>

                    <span className="px-2.5 py-0.5 rounded-xs text-[10px] font-mono uppercase tracking-wider bg-[#F9F6F5] text-[#966015] border border-[#BCC1C4]/50 font-bold">
                      {rate.rateType}
                    </span>
                  </div>

                  {/* Quantity Input Controls */}
                  {isSelected && (
                    <div className="pt-3.5 border-t border-[#BCC1C4]/40 flex items-center justify-between gap-4">
                      <span className="text-xs text-[#455668] font-mono">
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
                          className="w-7 h-7 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 text-[#032D47] hover:bg-[#032D47] hover:text-[#F9F6F5] flex items-center justify-center font-mono font-bold text-sm transition-colors cursor-pointer"
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
                          className="w-24 px-2 py-1 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 text-xs font-mono font-bold text-[#032D47] text-center focus:outline-hidden focus:border-[#032D47]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              rate.id,
                              quantity + (rate.rateType === "per_sqft" ? 100 : 1)
                            )
                          }
                          className="w-7 h-7 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 text-[#032D47] hover:bg-[#032D47] hover:text-[#F9F6F5] flex items-center justify-center font-mono font-bold text-sm transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Line Item Total */}
                {isSelected && (
                  <div className="pt-3.5 mt-3.5 border-t border-[#BCC1C4]/40 flex items-center justify-between text-xs">
                    <span className="text-[#455668] font-mono text-[11px]">
                      Line Total:
                    </span>
                    <span className="font-mono font-bold text-[#966015] text-sm">
                      {formatINR(lineTotal)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Authoritative Total Estimation Summary Card */}
        <div className="p-8 sm:p-10 rounded-xs bg-[#FFFFFF] border-2 border-[#032D47] shadow-[0_8px_30px_rgba(3,45,71,0.06)] relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xs bg-[#032D47] text-[#F9F6F5] text-xs font-mono font-bold uppercase tracking-wider">
                  Authoritative Server Estimate
                </span>
                <span className="text-xs text-[#455668] font-mono font-bold">
                  {activeCount} of {sortedRates.length} Disciplines Selected
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
                Estimated Commercial Total
              </h3>

              <p className="text-xs text-[#455668] leading-relaxed">
                Estimated Quotation — Final scope and commercial terms are subject to physical site
                inspection and executed engineering agreement by MAYA Design &amp; Build. No hidden
                package markups.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="text-left lg:text-right">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#455668] block font-bold">
                  Total Estimate (INR)
                </span>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-[#032D47] mt-1">
                  {isCalculating ? (
                    <span className="text-[#966015] animate-pulse inline-flex items-center gap-2">
                      <Spinner size="md" />
                      <span>Calculating...</span>
                    </span>
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
                className="px-8 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-black text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm active:scale-98 whitespace-nowrap cursor-pointer"
              >
                Submit Inquiry with this Estimate &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Inquiry Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#032D47]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#BCC1C4]/80 rounded-xs w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {inquirySuccessData ? (
              /* Success confirmation state */
              <div className="py-6 space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-xs bg-[#966015]/10 text-[#966015] font-mono font-bold text-xs uppercase tracking-wider border border-[#966015]/30">
                    {inquirySuccessData.reference}
                  </span>
                  <h3 className="text-2xl font-black text-[#032D47]">
                    Quotation Inquiry Stored!
                  </h3>
                  <p className="text-sm text-[#455668] max-w-sm mx-auto leading-relaxed">
                    Your quotation breakdown and estimated total of{" "}
                    <strong className="text-[#032D47] font-mono">
                      {inquirySuccessData.formattedTotal}
                    </strong>{" "}
                    have been saved in MySQL. Our engineers have been alerted.
                  </p>
                </div>

                <div className="p-6 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 space-y-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#455668] block font-bold">
                    Next Step: Continuation
                  </span>
                  <p className="text-xs text-[#455668] leading-relaxed">
                    Click below to open WhatsApp with your prefilled inquiry reference and proposal
                    summary to connect directly with our engineering team:
                  </p>

                  <a
                    href={inquirySuccessData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-98"
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
                    className="text-xs font-mono text-[#455668] hover:text-[#032D47] uppercase tracking-wider underline cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              /* Quotation Inquiry Submission Form */
              <form onSubmit={handleSubmitQuotationInquiry} className="space-y-5">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#BCC1C4]/40">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#966015] font-bold">
                      Official Engineering Proposal
                    </span>
                    <h3 className="text-xl font-bold text-[#032D47] tracking-tight mt-1">
                      Request Quotation Proposal
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-xs bg-[#F9F6F5] text-[#455668] hover:text-[#032D47] hover:bg-[#F2EFEB] transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Estimate Snapshot Banner */}
                <div className="p-4 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#455668] block font-bold">
                      Built-Up Area &amp; Disciplines
                    </span>
                    <span className="text-xs font-mono text-[#032D47] font-semibold mt-0.5 block">
                      {projectArea} sq.ft • {activeCount} disciplines
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#455668] block font-bold">
                      Authoritative Total
                    </span>
                    <span className="text-base font-mono font-black text-[#032D47]">
                      {formatINR(displayTotal)}
                    </span>
                  </div>
                </div>

                {inquiryError && (
                  <div className="p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-800 text-xs">
                    ⚠️ {inquiryError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#032D47] font-bold block">
                      Full Name <span className="text-[#966015]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Er. Rajesh Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#032D47] font-bold block">
                      Phone Number <span className="text-[#966015]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#032D47] font-bold block">
                      Email Address <span className="text-[#455668] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#032D47] font-bold block">
                      Site Location <span className="text-[#455668] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bardoli / Surat / Navsari"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#032D47] font-bold block">
                    Special Requirements / Site Conditions <span className="text-[#455668] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Plot dimensions, number of floors, target commencement month..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    aria-busy={isSubmittingInquiry}
                    className="w-full py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-black text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmittingInquiry && <Spinner size="sm" />}
                    <span>
                      {isSubmittingInquiry
                        ? "Recording Quotation Inquiry..."
                        : "Confirm & Submit Quotation Inquiry →"}
                    </span>
                  </button>
                  <p className="text-[11px] text-[#455668] text-center mt-2.5">
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
