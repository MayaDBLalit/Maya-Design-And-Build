import React from "react";

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

  const rawPhone = phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${rawPhone}?text=Hello%20MAYA%20Design%20%26%20Build,%20I%20would%20like%20to%20consult%20regarding%20my%20architectural%20and%20construction%20project.`;

  return (
    <section id="contact" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Consultation Invitation */}
          <div className="lg:col-span-6 space-y-6">
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

            <div className="pt-2 flex flex-wrap gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
              >
                <span>💬 Consult on WhatsApp</span>
              </a>

              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#14171C] hover:bg-[#1D2128] border border-[#2B313D] hover:border-[#C5A869] text-white font-bold text-xs uppercase tracking-wider transition"
              >
                <span>📞 Call Office: {phone}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Office Credentials & Location Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-8 rounded-2xl bg-[#14171C] border border-[#2B313D] space-y-6">
              <h3 className="text-lg font-bold text-white tracking-tight">
                MAYA Head Office &amp; Engineering Studio
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-[#C5A869]/10 text-[#C5A869] flex items-center justify-center flex-shrink-0 border border-[#C5A869]/30">
                    📍
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                      Address
                    </span>
                    <span className="text-neutral-200 leading-relaxed block mt-0.5">
                      {address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-[#C5A869]/10 text-[#C5A869] flex items-center justify-center flex-shrink-0 border border-[#C5A869]/30">
                    ✉️
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase tracking-widest block text-[10px]">
                      Email
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-[#C5A869] hover:underline block mt-0.5"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-[#C5A869]/10 text-[#C5A869] flex items-center justify-center flex-shrink-0 border border-[#C5A869]/30">
                    ⏱️
                  </div>
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
                <div className="pt-4 border-t border-neutral-800">
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
        </div>
      </div>
    </section>
  );
}
