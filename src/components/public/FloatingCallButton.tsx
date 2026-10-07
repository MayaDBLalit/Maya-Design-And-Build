"use client";

import React, { useState, useEffect } from "react";
import { normalizeTelHref } from "@/lib/formatters";

export { normalizeTelHref };

interface FloatingCallButtonProps {
  /**
   * The dynamically configured contact phone number (e.g., from settings.contact_phone).
   * If omitted, the component falls back to fetching /api/settings client-side.
   */
  phone?: string | null;
  className?: string;
}

function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function FloatingCallButton({ phone: propPhone, className = "" }: FloatingCallButtonProps) {
  const [activePhone, setActivePhone] = useState<string | null>(propPhone || null);

  useEffect(() => {
    if (propPhone !== undefined) {
      setActivePhone(propPhone);
    }
  }, [propPhone]);

  useEffect(() => {
    if (propPhone !== undefined) return;

    let isMounted = true;
    async function fetchPhoneSetting() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const json = await res.json();
        const configuredPhone = json.data?.contact_phone || json.settings?.contact_phone;
        if (isMounted && configuredPhone) {
          setActivePhone(configuredPhone);
        }
      } catch (err) {
        console.error("Failed to fetch contact phone for floating button:", err);
      }
    }

    fetchPhoneSetting();

    return () => {
      isMounted = false;
    };
  }, [propPhone]);

  const telTarget = normalizeTelHref(activePhone);

  if (!telTarget || !activePhone) {
    return null;
  }

  const displayPhone = activePhone.trim();

  return (
    <aside
      aria-label="Contact Maya Design & Build"
      className="pointer-events-none"
    >
      <a
        href={`tel:${telTarget}`}
        aria-label={`Call Maya Design & Build at ${displayPhone}`}
        title={`Call Maya Design & Build: ${displayPhone}`}
        style={{
          bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
          right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
        }}
        className={`pointer-events-auto fixed z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5] shadow-[0_8px_25px_rgba(3,45,71,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-[#FFFFFF] flex items-center justify-center cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#966015] focus-visible:ring-offset-2 ${className}`}
      >
        <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#F9F6F5] shrink-0" />
        <span className="sr-only">Call Maya Design & Build at {displayPhone}</span>
      </a>
    </aside>
  );
}
