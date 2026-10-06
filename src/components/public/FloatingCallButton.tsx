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
  /**
   * Optional custom CSS class name.
   */
  className?: string;
}

/**
 * Universal inline phone SVG icon (Feather / Lucide style)
 */
function PhoneIcon({ className = "w-6 h-6" }: { className?: string }) {
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

/**
 * FloatingCallButton
 *
 * Fixed, accessible floating call action button for the public website.
 * Retrieves the phone number dynamically from Maya CMS settings, safely
 * normalizes international dial codes for tel: URIs, and hides gracefully
 * if no valid phone number is configured.
 */
export function FloatingCallButton({ phone: propPhone, className = "" }: FloatingCallButtonProps) {
  const [activePhone, setActivePhone] = useState<string | null>(propPhone || null);

  // Synchronize when prop changes (e.g. fast page navigation or SSR updates)
  useEffect(() => {
    if (propPhone !== undefined) {
      setActivePhone(propPhone);
    }
  }, [propPhone]);

  // Client-side fallback if phone was not provided via SSR props
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

  // Normalize telephone destination safely
  const telTarget = normalizeTelHref(activePhone);

  // If phone is missing, invalid, or unconfigured, do not render a broken tel: link
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
          bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
          right: "calc(1.25rem + env(safe-area-inset-right, 0px))",
        }}
        className={`pointer-events-auto fixed z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#C5A869] to-[#d4af37] text-neutral-950 shadow-xl shadow-black/50 hover:shadow-[#C5A869]/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-[#C5A869]/60 flex items-center justify-center cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C5A869] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F12] ${className}`}
      >
        <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-950 flex-shrink-0" />
        <span className="sr-only">Call Maya Design & Build at {displayPhone}</span>
      </a>
    </aside>
  );
}
