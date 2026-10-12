"use client";

import React, { useState } from "react";
import { Modal } from "@/components/admin/Modal";

interface WorkflowStep {
  id: number;
  stepNumber: number;
  title: string;
  details: string | null;
}

interface Workflow {
  id: number;
  title: string;
  steps: WorkflowStep[];
}

interface SubService {
  id: number;
  serviceName: string;
  rateType: string;
  unitName: string | null;
  unitSymbol: string | null;
  workflow?: Workflow | null;
}

interface Package {
  id: number;
  packageName: string;
  showRatePublicly: boolean;
  packageRatePerSqFt: number | null;
  isRecommended: boolean;
  subServices: SubService[];
}

interface ServiceDetailClientProps {
  serviceTitle: string;
  packages: Package[];
}

export function ServiceDetailClient({
  serviceTitle,
  packages,
}: ServiceDetailClientProps) {
  // Modal state
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [builtUpArea, setBuiltUpArea] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    reference: string;
    totalEstimate: number;
    formattedTotal: string;
    whatsappUrl?: string;
  } | null>(null);

  // Workflow expand/collapse state: key = `${pkgId}-${subId}`
  const [expandedWorkflows, setExpandedWorkflows] = useState<Record<string, boolean>>({});

  const toggleWorkflow = (pkgId: number, subId: number) => {
    const key = `${pkgId}-${subId}`;
    setExpandedWorkflows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOpenModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setBuiltUpArea("");
    setFullName("");
    setPhone("");
    setEmail("");
    setLocation("");
    setNotes("");
    setErrorMsg(null);
    setResult(null);
  };

  const handleCloseModal = () => {
    setSelectedPackage(null);
    setResult(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    setErrorMsg(null);

    const numArea = parseFloat(builtUpArea);
    if (isNaN(numArea) || numArea <= 0) {
      setErrorMsg("Please enter a valid Built-Up Area greater than 0 sq.ft.");
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!location.trim()) {
      setErrorMsg("Please specify the project location or city.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquirySource: "package",
          packageId: selectedPackage.id,
          builtUpArea: numArea,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          interestedService: `${serviceTitle} — ${selectedPackage.packageName}`,
          message: `Project Location: ${location.trim()}${
            notes.trim() ? `\n\nNotes: ${notes.trim()}` : ""
          }`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to submit inquiry");
      }

      setResult({
        reference: data.reference,
        totalEstimate: data.totalEstimate,
        formattedTotal: data.formattedTotal,
        whatsappUrl: data.whatsappUrl,
      });
    } catch (err: any) {
      console.error("Package inquiry error:", err);
      setErrorMsg(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Packages Section Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#BCC1C4]/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
            <span>Structured Turnkey Solutions</span>
            <span className="w-8 h-px bg-[#966015]/60" />
            <span>Curated Execution Packages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
            Execution Packages
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#455668] max-w-md leading-relaxed">
          Select a package to review included engineering disciplines, inspect our exact workflows,
          and request an authoritative estimate tailored to your built-up area.
        </p>
      </div>

      {/* Packages Grid or Empty State */}
      {packages.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] border border-[#BCC1C4]/60 rounded-xs">
          <p className="text-sm text-[#455668]">
            No packages are currently published for this service. Please reach out to our team directly
            for custom scopes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {packages.map((pkg) => {
            const hasPublicRate = pkg.showRatePublicly && pkg.packageRatePerSqFt !== null;

            return (
              <div
                key={pkg.id}
                className={`rounded-xs transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  pkg.isRecommended
                    ? "bg-[#FFFFFF] border-2 border-[#966015] shadow-[0_8px_30px_rgba(150,96,21,0.1)] relative"
                    : "bg-[#FFFFFF] border border-[#BCC1C4]/80 hover:border-[#966015]/60 shadow-[0_4px_20px_rgba(3,45,71,0.03)] hover:shadow-[0_8px_30px_rgba(3,45,71,0.08)]"
                }`}
              >
                {/* Package Header with Visual Hierarchy */}
                <div
                  className={`p-6 sm:p-8 border-b space-y-4 ${
                    pkg.isRecommended
                      ? "border-[#966015]/20 bg-gradient-to-br from-[#FFFFFF] via-[#FDFBF7] to-[#F8F3EA]"
                      : "border-[#BCC1C4]/30 bg-gradient-to-br from-[#FFFFFF] to-[#F9F6F5]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Recommended Badge only when true */}
                    {pkg.isRecommended ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#966015]/15 text-[#966015] text-[10px] font-mono font-bold uppercase tracking-[0.2em] border border-[#966015]/30 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#966015]" />
                        RECOMMENDED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#455668] font-bold">
                        EXECUTION PACKAGE
                      </span>
                    )}

                    {/* Rate Display: only if showRatePublicly == true; NO placeholder text if false */}
                    {hasPublicRate && (
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight font-serif">
                          ₹{pkg.packageRatePerSqFt!.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-[#455668] font-mono ml-1">
                          / sq.ft
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-[#032D47] tracking-tight">
                    {pkg.packageName}
                  </h3>
                </div>

                {/* Included SubServices & Detailed Workflows */}
                <div className="p-6 sm:p-8 flex-1 space-y-6">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#BCC1C4]/30">
                      <h4 className="text-xs font-mono uppercase tracking-[0.18em] text-[#966015] font-bold">
                        Included Disciplines
                      </h4>
                      <span className="text-xs font-mono font-bold text-[#032D47] bg-[#F9F6F5] px-2 py-0.5 rounded-xs border border-[#BCC1C4]/40">
                        {pkg.subServices.length} {pkg.subServices.length === 1 ? "Discipline" : "Disciplines"}
                      </span>
                    </div>

                    {pkg.subServices.length === 0 ? (
                      <p className="text-xs text-[#455668] italic">
                        All foundational disciplines included. Contact team for comprehensive line items.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {pkg.subServices.map((sub) => {
                          const wfKey = `${pkg.id}-${sub.id}`;
                          const isWfOpen = !!expandedWorkflows[wfKey];
                          const hasWorkflow =
                            sub.workflow &&
                            sub.workflow.steps &&
                            sub.workflow.steps.length > 0;

                          return (
                            <div
                              key={sub.id}
                              className="rounded-xs border border-[#BCC1C4]/40 bg-[#F9F6F5]/60 hover:bg-[#F9F6F5] transition p-3.5 space-y-2.5"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#966015]" />
                                  <span className="text-sm font-bold text-[#032D47]">
                                    {sub.serviceName}
                                  </span>
                                </div>

                                {hasWorkflow && (
                                  <button
                                    type="button"
                                    onClick={() => toggleWorkflow(pkg.id, sub.id)}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#966015] hover:text-[#032D47] font-semibold cursor-pointer transition-colors"
                                  >
                                    <span>{isWfOpen ? "Hide Steps" : `View Workflow (${sub.workflow!.steps.length})`}</span>
                                    <svg
                                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                        isWfOpen ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                              </div>

                              {/* Expanded Workflow Steps */}
                              {hasWorkflow && isWfOpen && (
                                <div className="mt-3 pt-3 border-t border-[#BCC1C4]/40 space-y-3 animate-in fade-in duration-150">
                                  <div className="text-[11px] font-mono text-[#032D47] font-bold uppercase tracking-wider">
                                    Workflow: {sub.workflow!.title}
                                  </div>
                                  <div className="space-y-2 pl-2 border-l-2 border-[#966015]/40">
                                    {sub.workflow!.steps.map((st) => (
                                      <div key={st.id} className="text-xs space-y-0.5">
                                        <div className="font-bold text-[#032D47] flex items-center gap-1.5">
                                          <span className="font-mono text-[#966015]">
                                            Step {st.stepNumber}:
                                          </span>
                                          <span>{st.title}</span>
                                        </div>
                                        {st.details && (
                                          <p className="text-[11px] text-[#455668] leading-relaxed pl-4">
                                            {st.details}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Package Card Action Footer */}
                <div className="p-6 sm:p-8 pt-4 border-t border-[#BCC1C4]/30 bg-[#FFFFFF]">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(pkg)}
                    className="w-full py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Select Package &amp; Inquire</span>
                    <span className="font-serif text-sm">&rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Package Inquiry Modal */}
      {selectedPackage && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title={`Package Inquiry — ${selectedPackage.packageName}`}
          maxWidth="2xl"
          variant="light"
        >
          {result ? (
            /* Successful Submission View with Server-Calculated Estimate */
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#032D47] tracking-tight">
                  Inquiry Successfully Recorded
                </h3>
                <p className="text-xs font-mono uppercase tracking-widest text-[#966015]">
                  Reference #{result.reference}
                </p>
              </div>

              {result.totalEstimate > 0 ? (
                <div className="p-6 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80 space-y-2">
                  <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#455668]">
                    Authoritative Calculated Estimate
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#032D47] font-serif">
                    {result.formattedTotal}
                  </div>
                  <p className="text-xs text-[#455668]">
                    Computed for {builtUpArea} sq.ft under the {selectedPackage.packageName} package.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/80">
                  <p className="text-sm text-[#032D47] font-medium leading-relaxed">
                    Thank you! Our engineering team will review your {builtUpArea} sq.ft scope under the{" "}
                    {selectedPackage.packageName} package and deliver a formal quotation within 24 hours.
                  </p>
                </div>
              )}

              <p className="text-xs text-[#455668] max-w-md mx-auto leading-relaxed">
                A verification record has been dispatched to our engineering desk. You can also connect
                with our principal architect directly via WhatsApp:
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {result.whatsappUrl && (
                  <a
                    href={result.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-xs bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Chat on WhatsApp &rarr;
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-6 py-3 rounded-xs border border-[#BCC1C4]/80 text-[#032D47] hover:bg-[#F2EFEB] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Form View */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xs bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="p-4 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#966015]">
                    Selected Scope
                  </div>
                  <div className="text-base font-black text-[#032D47]">
                    {selectedPackage.packageName}
                  </div>
                </div>
                {selectedPackage.showRatePublicly && selectedPackage.packageRatePerSqFt && (
                  <div className="text-right">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#455668]">
                      Rate
                    </div>
                    <div className="text-base font-black text-[#032D47] font-serif">
                      ₹{selectedPackage.packageRatePerSqFt.toLocaleString("en-IN")}/sq.ft
                    </div>
                  </div>
                )}
              </div>

              {/* Built Up Area Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-1.5">
                  Built-Up Area (sq.ft) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="e.g. 1850"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015] bg-[#FFFFFF]"
                />
                <span className="text-[11px] text-[#455668] mt-1 block">
                  Authoritative calculations will multiply your area by the verified package scope.
                </span>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015] bg-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-1.5">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015] bg-[#FFFFFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-1.5">
                    Email Address <span className="text-xs text-[#455668] font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015] bg-[#FFFFFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-1.5">
                    Project Location / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bardoli, Surat, Navsari"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015] bg-[#FFFFFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#032D47] mb-1.5">
                  Project Notes / Requirements <span className="text-xs text-[#455668] font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Plot dimensions, special floor height requirements, elevation ideas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xs border border-[#BCC1C4]/80 text-sm text-[#032D47] focus:outline-hidden focus:border-[#966015] focus:ring-1 focus:ring-[#966015] bg-[#FFFFFF]"
                />
              </div>

              <div className="pt-3 border-t border-[#BCC1C4]/40 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xs border border-[#BCC1C4]/80 text-xs font-bold uppercase tracking-wider text-[#455668] hover:text-[#032D47] hover:bg-[#F2EFEB] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#F9F6F5] border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Submit &amp; Calculate Estimate &rarr;</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
