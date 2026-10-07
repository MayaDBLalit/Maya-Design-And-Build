"use client";

import React, { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

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
    <section id="contact" className="py-28 bg-[#FFFFFF] relative border-t border-[#BCC1C4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Consultation Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>09</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Initiate Consultation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47] leading-tight">
              Begin Your Architectural Journey.
            </h2>

            <p className="text-sm sm:text-base text-[#455668] leading-relaxed">
              Whether you are planning a modern residential villa, a commercial facility, or a
              complete interior transformation, our engineering team is ready to evaluate your site
              and provide transparent, scientific guidance.
            </p>

            {/* Direct Studio Credentials */}
            <div className="p-6 sm:p-8 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 space-y-5 shadow-xs">
              <h3 className="text-xs font-bold text-[#032D47] tracking-widest uppercase font-mono">
                MAYA Head Office &amp; Engineering Studio
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <span className="text-[#966015] text-sm">📍</span>
                  <div>
                    <span className="text-[#455668] uppercase tracking-widest block text-[10px] font-bold">
                      Address
                    </span>
                    <span className="text-[#032D47] leading-relaxed block mt-0.5 font-sans font-medium text-xs">
                      {address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#966015] text-sm">📞</span>
                  <div>
                    <span className="text-[#455668] uppercase tracking-widest block text-[10px] font-bold">
                      Office Phone
                    </span>
                    <a
                      href={`tel:${phone}`}
                      className="text-[#032D47] hover:text-[#966015] font-bold block mt-0.5 text-xs transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#966015] text-sm">✉️</span>
                  <div>
                    <span className="text-[#455668] uppercase tracking-widest block text-[10px] font-bold">
                      Email
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-[#032D47] hover:text-[#966015] block mt-0.5 text-xs transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-[#966015] text-sm">⏱️</span>
                  <div>
                    <span className="text-[#455668] uppercase tracking-widest block text-[10px] font-bold">
                      Office Hours
                    </span>
                    <span className="text-[#032D47] block mt-0.5 text-xs">
                      {settings.office_hours || "Monday – Saturday: 9:00 AM – 7:30 PM"}
                    </span>
                  </div>
                </div>
              </div>

              {mapsUrl && (
                <div className="pt-3 border-t border-[#BCC1C4]/40">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#966015] hover:text-[#032D47] font-bold transition-colors"
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
            <div className="p-8 sm:p-10 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 shadow-[0_4px_24px_rgba(3,45,71,0.03)] relative">
              {successData ? (
                /* Success State */
                <div className="py-6 space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>

                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-xs bg-[#966015]/10 text-[#966015] font-mono font-bold text-xs uppercase tracking-wider border border-[#966015]/30">
                      Reference: {successData.reference}
                    </span>
                    <h3 className="text-2xl font-black text-[#032D47]">
                      Inquiry Stored Successfully!
                    </h3>
                    <p className="text-sm text-[#455668] max-w-md mx-auto leading-relaxed">
                      Your consultation request has been officially recorded in our engineering
                      system. Our team will review your specifications and contact you promptly.
                    </p>
                  </div>

                  <div className="p-6 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/60 space-y-4 max-w-md mx-auto shadow-xs">
                    <p className="text-xs text-[#455668] leading-relaxed">
                      You can also continue immediately on WhatsApp to discuss blueprints, photos,
                      or urgent site visit schedules:
                    </p>

                    <a
                      href={successData.whatsappUrl}
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
                      onClick={() => setSuccessData(null)}
                      className="text-xs font-mono text-[#455668] hover:text-[#032D47] uppercase tracking-wider underline cursor-pointer"
                    >
                      Submit Another Consultation Request
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-black text-[#032D47] tracking-tight">
                      Schedule a Consultation
                    </h3>
                    <p className="text-xs text-[#455668] mt-1">
                      Fill out your project requirement below. We guarantee a prompt, professional
                      engineering response.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xs bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                      <span className="font-bold">⚠️</span>
                      <span>{errorMessage}</span>
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden"
                      />
                    </div>

                    {/* Phone Number */}
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
                        className="w-full px-4 py-3 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden font-mono"
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
                        className="w-full px-4 py-3 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden"
                      />
                    </div>

                    {/* Interested Service */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-[#032D47] font-bold block">
                        Primary Service
                      </label>
                      <select
                        value={interestedService}
                        onChange={(e) => setInterestedService(e.target.value)}
                        className="w-full px-4 py-3 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] focus:outline-hidden"
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
                    <label className="text-xs font-mono uppercase tracking-wider text-[#032D47] font-bold block">
                      Project Details / Requirement <span className="text-[#455668] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your site location, plot dimensions, tentative built-up area, or architectural preferences..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 focus:border-[#032D47] text-sm text-[#032D47] placeholder-[#455668]/50 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                      className="w-full py-4 rounded-xs bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting && <Spinner size="sm" />}
                      <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Consultation Request →"}</span>
                    </button>
                    <p className="text-[11px] text-[#455668] text-center mt-2.5">
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
