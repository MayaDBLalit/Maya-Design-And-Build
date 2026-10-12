"use client";

import React, { useState } from "react";

interface SubServiceItem {
  id: number;
  serviceName: string;
  rateType: string;
  defaultQty?: string;
  unitName: string | null;
  unitSymbol: string | null;
}

interface BHKItem {
  id: number;
  bhkNumber: number;
}

interface CalculatorClientProps {
  calculatorId: number;
  calculatorTitle: string;
  subServices: SubServiceItem[];
  bhkList: BHKItem[];
}

export function CalculatorClient({
  calculatorId,
  calculatorTitle,
  subServices,
  bhkList,
}: CalculatorClientProps) {
  // Form State
  const [bhkId, setBhkId] = useState<number | "">(bhkList[0]?.id || "");
  const [builtUpArea, setBuiltUpArea] = useState<string>("");
  const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>(
    subServices.map((s) => s.id)
  );

  // Variable discipline quantities state (per_view, per_visit, etc.)
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    subServices.forEach((s) => {
      initial[s.id] = parseFloat(s.defaultQty || "1") || 1;
    });
    return initial;
  });

  const handleQuantityChange = (id: number, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, Math.floor(val) || 1),
    }));
  };

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    reference: string;
    totalEstimate: number;
    formattedTotal: string;
    whatsappUrl?: string;
  } | null>(null);

  const toggleSubService = (id: number) => {
    setSelectedSubServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubServiceIds.length === subServices.length) {
      setSelectedSubServiceIds([]);
    } else {
      setSelectedSubServiceIds(subServices.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numArea = parseFloat(builtUpArea);
    if (isNaN(numArea) || numArea <= 0) {
      setErrorMsg("Please enter a valid Built-Up Area greater than 0 sq.ft.");
      return;
    }

    if (selectedSubServiceIds.length === 0) {
      setErrorMsg("Please select at least one discipline or sub-service.");
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name (minimum 2 characters).");
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    if (!location.trim()) {
      setErrorMsg("Please enter your project location or city.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquirySource: "calculator",
          calculatorId,
          bhkId: bhkId ? Number(bhkId) : undefined,
          builtUpArea: numArea,
          subServiceIds: selectedSubServiceIds,
          subServiceQuantities: quantities,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: `Project Location: ${location.trim()}${
            notes.trim() ? `\n\nNotes: ${notes.trim()}` : ""
          }`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to process calculator inquiry");
      }

      setResult({
        reference: data.reference,
        totalEstimate: data.totalEstimate,
        formattedTotal: data.formattedTotal,
        whatsappUrl: data.whatsappUrl,
      });

      // Scroll to top of results
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err: any) {
      console.error("Calculator submission error:", err);
      setErrorMsg(err.message || "Failed to generate estimate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setBuiltUpArea("");
    setSelectedSubServiceIds(subServices.map((s) => s.id));
    setFullName("");
    setPhone("");
    setEmail("");
    setLocation("");
    setNotes("");
    setErrorMsg(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {result ? (
        /* Result Confirmation Card */
        <div className="rounded-xs bg-[#FFFFFF] border-2 border-[#966015]/40 p-8 sm:p-12 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-[#BCC1C4]/40">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#966015] font-bold">
                <span>Inquiry Secured</span>
                <span>•</span>
                <span>Reference #{result.reference}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#032D47] tracking-tight">
                Authoritative Cost Estimate
              </h2>
              <p className="text-xs sm:text-sm text-[#455668]">
                Calculated authoritatively by MAYA Design &amp; Build engineering database.
              </p>
            </div>
          </div>

          {/* Highlight Estimate Amount */}
          <div className="p-8 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#455668] font-bold">
                Total Estimated Investment
              </span>
              <div className="text-4xl sm:text-5xl font-black text-[#032D47] font-serif">
                {result.formattedTotal}
              </div>
            </div>

            <div className="text-xs font-mono text-[#455668] space-y-1 sm:text-right border-t sm:border-t-0 sm:border-l border-[#BCC1C4]/50 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
              <div>Scope: <span className="text-[#032D47] font-bold">{builtUpArea} sq.ft</span></div>
              {bhkId && (
                <div>Configuration: <span className="text-[#032D47] font-bold">{bhkList.find(b => b.id === Number(bhkId))?.bhkNumber} BHK</span></div>
              )}
              <div>Disciplines: <span className="text-[#032D47] font-bold">{selectedSubServiceIds.length} Selected</span></div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#455668] leading-relaxed">
            Your technical parameters and contact details have been queued for our chief structural designer.
            A verified Bill of Quantities (BOQ) with physical site feasibility notes will be delivered to your contact number.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#BCC1C4]/40">
            {result.whatsappUrl && (
              <a
                href={result.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-xs text-center"
              >
                Discuss Scope on WhatsApp &rarr;
              </a>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-8 py-4 rounded-xs border border-[#BCC1C4]/80 text-[#032D47] hover:bg-[#F2EFEB] text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer"
            >
              Calculate Another Project
            </button>
          </div>
        </div>
      ) : (
        /* Calculator Form */
        <form onSubmit={handleSubmit} className="space-y-10">
          {errorMsg && (
            <div className="p-4 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Property Specifications */}
          <div className="rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/70 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1 pb-4 border-b border-[#BCC1C4]/40">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#966015] font-bold">
                Step 01
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#032D47]">
                Spatial Scope &amp; Dimensions
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* BHK Configuration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-2 font-mono">
                  BHK Configuration <span className="text-xs font-normal text-[#455668]">(Residential)</span>
                </label>
                <select
                  value={bhkId}
                  onChange={(e) => setBhkId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-3 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] bg-[#FFFFFF] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015]"
                >
                  <option value="">Select Configuration (Optional)</option>
                  {bhkList.map((bhk) => (
                    <option key={bhk.id} value={bhk.id}>
                      {bhk.bhkNumber} BHK Configuration
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#455668] mt-1.5 block">
                  Informational layout indicator for our architectural drafting desk.
                </span>
              </div>

              {/* Built-Up Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-2 font-mono">
                  Built-Up Area (sq.ft) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 1500"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] bg-[#FFFFFF] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015]"
                />
                {/* Quick Area Presets */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-[#455668]">Presets:</span>
                  {[1000, 1500, 2000, 2500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBuiltUpArea(String(val))}
                      className="px-2 py-0.5 text-[11px] font-mono rounded-xs border border-[#BCC1C4]/60 text-[#455668] hover:text-[#032D47] hover:border-[#966015] bg-[#F9F6F5] cursor-pointer"
                    >
                      {val.toLocaleString()} sq.ft
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Included Disciplines / SubServices (Rate Privacy Strictly Guaranteed) */}
          <div className="rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/70 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#BCC1C4]/40">
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#966015] font-bold">
                  Step 02
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#032D47]">
                  Disciplines &amp; Engineering Deliverables
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                className="self-start sm:self-auto text-xs font-mono font-bold uppercase tracking-wider text-[#966015] hover:text-[#032D47] cursor-pointer border border-[#966015]/40 px-3 py-1.5 rounded-xs"
              >
                {selectedSubServiceIds.length === subServices.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <p className="text-xs text-[#455668]">
              Select which specialized disciplines are required for your project. Rates are calculated
              authoritatively by our backend upon submission to preserve pricing integrity.
            </p>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subServices.map((sub) => {
                const isSelected = selectedSubServiceIds.includes(sub.id);
                const isVariable = sub.rateType !== "per_sqft" && sub.rateType !== "fixed";
                const currentQty = quantities[sub.id] ?? (parseFloat(sub.defaultQty || "1") || 1);

                return (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubService(sub.id)}
                    className={`flex flex-col justify-between p-4 rounded-xs border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-[#966015] bg-[#966015]/5 text-[#032D47] shadow-xs"
                        : "border-[#BCC1C4]/50 bg-[#F9F6F5]/40 text-[#455668] hover:border-[#BCC1C4]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSubService(sub.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 accent-[#966015] rounded-xs cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-sm font-bold leading-tight truncate">
                          {sub.serviceName}
                        </div>
                        <div className="text-[11px] font-mono text-[#966015] uppercase tracking-wider">
                          {sub.rateType === "per_sqft"
                            ? `Scales with Built-Up Area (${builtUpArea ? `${builtUpArea} sq.ft` : "Step 1 Area"})`
                            : sub.rateType === "fixed"
                            ? "Standard Scope (Fixed 1)"
                            : `Deliverable Scope (${sub.unitSymbol || sub.unitName || "Units"})`}
                        </div>
                      </div>
                    </div>

                    {/* Variable Quantity Controls if applicable */}
                    {isVariable && (
                      <div
                        className="mt-3 pt-3 border-t border-[#BCC1C4]/40 flex items-center justify-between gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-xs font-mono text-[#455668]">
                          Quantity ({sub.unitSymbol || sub.unitName || "Units"}):
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={!isSelected || currentQty <= 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(sub.id, currentQty - 1);
                            }}
                            className="w-7 h-7 rounded-xs border border-[#BCC1C4] bg-white text-[#032D47] font-mono font-bold hover:bg-[#F2EFEB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            disabled={!isSelected}
                            value={currentQty}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(sub.id, parseInt(e.target.value, 10) || 1);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 h-7 text-center rounded-xs border border-[#BCC1C4] text-xs font-mono font-bold bg-white text-[#032D47] focus:outline-hidden focus:border-[#966015] disabled:opacity-40"
                          />
                          <button
                            type="button"
                            disabled={!isSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(sub.id, currentQty + 1);
                            }}
                            className="w-7 h-7 rounded-xs border border-[#BCC1C4] bg-white text-[#032D47] font-mono font-bold hover:bg-[#F2EFEB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Client Contact Details & Verification */}
          <div className="rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/70 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1 pb-4 border-b border-[#BCC1C4]/40">
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#966015] font-bold">
                Step 03
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#032D47]">
                Project Location &amp; Contact Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-2 font-mono">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] bg-[#FFFFFF] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-2 font-mono">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] bg-[#FFFFFF] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-2 font-mono">
                  Email Address <span className="text-xs font-normal text-[#455668]">(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] bg-[#FFFFFF] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-2 font-mono">
                  Project Location / City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bardoli, Surat, Navsari"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] bg-[#FFFFFF] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-2 font-mono">
                Project Notes / Specific Requirements <span className="text-xs font-normal text-[#455668]">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Mention plot dimensions, number of floors, orientation, or timeline expectations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] bg-[#FFFFFF] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015]"
              />
            </div>

            {/* Submission Action */}
            <div className="pt-6 border-t border-[#BCC1C4]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#455668] font-mono text-center sm:text-left">
                Estimate calculations will be computed authoritatively and displayed immediately upon submission.
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-10 py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#F9F6F5] border-t-transparent rounded-full animate-spin" />
                    <span>Calculating Authoritative Estimate...</span>
                  </>
                ) : (
                  <span>Calculate Project Estimate &rarr;</span>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
