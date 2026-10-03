import React from "react";
import Link from "next/link";

interface FooterProps {
  settings: Record<string, string>;
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const phone = settings.contact_phone || "+91 8980703374";
  const email = settings.contact_email || "mayadb01@gmail.com";
  const address =
    settings.contact_address ||
    "Shop 5, Seven leaf arcade, Dhamdod-Lumbha Road, Bardoli, Dis. Surat";
  const instagramUrl = settings.instagram_url;
  const facebookUrl = settings.facebook_url;

  return (
    <footer className="bg-[#0B0D10] text-[#F4F4F6] border-t border-[#2B313D] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 items-start">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="text-2xl font-black tracking-[0.2em] text-[#C5A869]">
                MAYA
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 block font-medium">
                Design &amp; Build
              </span>
            </Link>

            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed font-light">
              Designing Elegance, Building Legacy. Providing turnkey engineering, interior
              architecture, 3D visualization, and project management controls in Bardoli since 2021.
            </p>

            {/* Social Media Links (if configured) */}
            <div className="flex items-center gap-3 pt-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869] text-xs font-mono text-neutral-300 hover:text-white transition"
                >
                  Instagram
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869] text-xs font-mono text-neutral-300 hover:text-white transition"
                >
                  Facebook
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-[#C5A869]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li>
                <a href="/#about" className="hover:text-white transition">
                  About Maya
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-white transition">
                  Core Services
                </a>
              </li>
              <li>
                <a href="/#projects" className="hover:text-white transition">
                  Portfolio Projects
                </a>
              </li>
              <li>
                <a href="/#factors" className="hover:text-white transition">
                  Five Factors
                </a>
              </li>
              <li>
                <a href="/#process" className="hover:text-white transition">
                  5-Step Process
                </a>
              </li>
              <li>
                <a href="/#team" className="hover:text-white transition">
                  Engineering Team
                </a>
              </li>
            </ul>
          </div>

          {/* Core Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-[#C5A869]">
              Core Disciplines
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li>
                <a href="/#services" className="hover:text-white transition">
                  Interior Design
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-white transition">
                  Architectural Visualization
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-white transition">
                  Project Management Services
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-white transition">
                  Turnkey Construction
                </a>
              </li>
              <li>
                <a href="/#quotation" className="text-[#C5A869] hover:underline font-mono">
                  Online Estimation Tool
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-[#C5A869]">
              Studio
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              {address}
            </p>
            <p className="text-xs font-mono text-neutral-300">
              <a href={`tel:${phone}`} className="hover:text-[#C5A869] transition">
                {phone}
              </a>
            </p>
            <p className="text-xs font-mono text-neutral-300">
              <a href={`mailto:${email}`} className="hover:text-[#C5A869] transition">
                {email}
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Portal Link */}
        <div className="pt-8 border-t border-[#2B313D]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <p>
            &copy; 2021 – {currentYear} MAYA Design &amp; Build. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-neutral-500 hover:text-white transition uppercase tracking-widest text-[11px]"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-neutral-500 hover:text-white transition uppercase tracking-widest text-[11px]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/admin/login"
              className="text-neutral-500 hover:text-[#C5A869] transition uppercase tracking-widest text-[11px]"
            >
              Admin Console &rarr;
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
