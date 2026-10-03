"use client";

import React, { useState } from "react";

interface ContactSectionProps {
  settings: Record<string, string>;
}

export function ContactSection({ settings }: ContactSectionProps) {
  const phone = settings.contact_phone || "+91 8980703374";
  const email = settings.contact_email || "mayadb01@gmail.com";
  const address =
    settings.contact_address ||
    "Shop 5, Seven leaf arcade, Dhamdod-Lumbha Road, Bardoli, Dis. Surat";
  const mapsUrl = settings.google_maps_url || "https://maps.app.goo.gl/gq8gfLLBnNVpSShk9";

  // Form State
  const [fullName, setFullName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [interestedService, setInterestedService] = useState("Turnkey Construction");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    reference: string;
    whatsappUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    // Basic client checks
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters).");
      return;
    }
    const cleanDigits = customerPhone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || undefined,
          interestedService,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.details?.fieldErrors) {
          const firstErr = Object.values(data.details.fieldErrors).flat()[0];
          throw new Error(String(firstErr) || "Validation failed");
        }
        throw new Error(data.message || data.error || "Failed to submit inquiry");
      }

      setSuccessData({
        reference: data.reference,
        whatsappUrl: data.whatsappUrl,
      });

      // Clear form inputs
      setFullName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Consultation Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>09</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Initiate Consultation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Begin Your Architectural Journey.
            </h2>

            <p className="text-sm text-neutral-400 font-light leading-relaxed">
              Whether you are planning a modern residential villa, a commercial facility, or a
              complete interior transformation, our engineering team is ready to evaluate your site
              and provide transparent, scientific guidance.
            </p>

            {/* Direct Studio Credentials */}
            <div className="p-6 rounded-2xl bg-[#14171C] border border-[#2B313D] space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-[#C5A869]">
                MAYA Head Office &amp; Engineering Studio
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <span className="text-[#C5A869] text-sm">📍</span>
                  <div>
                    <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                      Address
                    </span>
                    <span className="text-neutral-200 leading-relaxed block mt-0.5">
                      {address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#C5A869] text-sm">📞</span>
                  <div>
                    <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                      Office Phone
                    </span>
                    <a
                      href={`tel:${phone}`}
                      className="text-white hover:text-[#C5A869] font-bold block mt-0.5"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#C5A869] text-sm">✉️</span>
                  <div>
                    <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                      Email
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-neutral-300 hover:text-[#C5A869] block mt-0.5"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#C5A869] text-sm">⏱️</span>
                  <div>
                    <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                      Office Hours
                    </span>
                    <span className="text-neutral-300 block mt-0.5">
                      {settings.office_hours || "Monday – Saturday: 9:00 AM – 7:30 PM"}
                    </span>
                  </div>
                </div>
              </div>

              {mapsUrl && (
                <div className="pt-3 border-t border-neutral-800">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#C5A869] hover:underline"
                  >
                    <span>View Location on Google Maps</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Consultation & Lead Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-[#14171C] border border-[#2B313D] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A869]/5 rounded-full blur-3xl pointer-events-none" />

              {successData ? (
                /* Success State */
                <div className="py-6 space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>

                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded bg-[#C5A869]/20 text-[#C5A869] font-mono font-bold text-xs uppercase tracking-wider">
                      Reference: {successData.reference}
                    </span>
                    <h3 className="text-2xl font-black text-white">
                      Inquiry Stored Successfully!
                    </h3>
                    <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                      Your consultation request has been officially recorded in our engineering
                      system. Our team will review your specifications and contact you promptly.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-[#0D0F12] border border-[#2B313D] space-y-4 max-w-md mx-auto">
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      You can also continue immediately on WhatsApp to discuss blueprints, photos,
                      or urgent site visit schedules:
                    </p>

                    <a
                      href={successData.whatsappUrl}
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
                      onClick={() => setSuccessData(null)}
                      className="text-xs font-mono text-neutral-400 hover:text-white uppercase tracking-wider underline"
                    >
                      Submit Another Consultation Request
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Schedule a Consultation
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Fill out your project requirement below. We guarantee a prompt, professional
                      engineering response.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                      <span className="font-bold">⚠️</span>
                      <span>{errorMessage}</span>
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Phone Number */}
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
                        className="w-full px-4 py-3 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden font-mono"
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
                        className="w-full px-4 py-3 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Interested Service */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                        Primary Service
                      </label>
                      <select
                        value={interestedService}
                        onChange={(e) => setInterestedService(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white focus:outline-hidden"
                      >
                        <option value="Turnkey Construction">Turnkey Construction</option>
                        <option value="Interior Design">Interior Design</option>
                        <option value="Architectural Visualization">
                          Architectural Visualization (3D Renders / Elevation)
                        </option>
                        <option value="Project Management Services (PMS)">
                          Project Management Services (PMS / Supervision)
                        </option>
                        <option value="Structural Estimation & Billing">
                          Structural Estimation &amp; BOQ
                        </option>
                        <option value="General Consultation">General Architectural Inquiry</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                      Project Details / Requirement <span className="text-neutral-500">(Optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your site location, plot dimensions, tentative built-up area, or architectural preferences..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#0D0F12] border border-[#2B313D] focus:border-[#C5A869] text-sm text-white placeholder-neutral-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C5A869] to-[#d4af37] text-neutral-950 font-black text-xs uppercase tracking-[0.15em] hover:brightness-110 shadow-lg shadow-[#C5A869]/20 transition duration-300 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting Inquiry..." : "Submit Consultation Request →"}
                    </button>
                    <p className="text-[11px] text-neutral-500 text-center mt-2.5">
                      Database persistence is guaranteed first. You will be able to continue on
                      WhatsApp immediately after submission.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
