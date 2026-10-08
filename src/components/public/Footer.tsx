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
  const linkedinUrl = settings.linkedin_url;
  const youtubeUrl = settings.youtube_url;

  return (
    <footer className="bg-[#F2EFEB] text-[#032D47] border-t border-[#BCC1C4]/60 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 items-start">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/home" className="inline-block group">
              <span className="text-2xl font-black tracking-[0.2em] text-[#032D47] group-hover:text-[#966015] transition-colors">
                MAYA
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-[#455668] block font-semibold">
                Design &amp; Build
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#455668] max-w-sm leading-relaxed">
              Designing Elegance, Building Legacy. Providing turnkey civil engineering, interior
              architecture, photorealistic 3D visualization, and project management controls in Bardoli since 2021.
            </p>

            {/* Social Media Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 hover:border-[#032D47] text-xs font-mono text-[#032D47] hover:bg-[#032D47] hover:text-[#FFFFFF] transition-all shadow-xs"
                >
                  Instagram
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 hover:border-[#032D47] text-xs font-mono text-[#032D47] hover:bg-[#032D47] hover:text-[#FFFFFF] transition-all shadow-xs"
                >
                  Facebook
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 hover:border-[#032D47] text-xs font-mono text-[#032D47] hover:bg-[#032D47] hover:text-[#FFFFFF] transition-all shadow-xs"
                >
                  LinkedIn
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/80 hover:border-[#032D47] text-xs font-mono text-[#032D47] hover:bg-[#032D47] hover:text-[#FFFFFF] transition-all shadow-xs"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-[#966015]">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-[#455668] font-semibold uppercase tracking-wider">
              <li>
                <Link href="/home" className="hover:text-[#032D47] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#032D47] transition-colors">
                  Services &amp; Disciplines
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#032D47] transition-colors">
                  Projects &amp; Team
                </Link>
              </li>
              <li>
                <Link href="/quotation" className="hover:text-[#032D47] transition-colors">
                  Quotation Calculator
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#032D47] transition-colors">
                  Media Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#032D47] transition-colors">
                  Contact Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Services */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-[#966015]">
              Core Disciplines
            </h4>
            <ul className="space-y-2.5 text-xs text-[#455668] font-medium">
              <li>
                <Link href="/services" className="hover:text-[#032D47] transition-colors">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#032D47] transition-colors">
                  Architectural Visualization
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#032D47] transition-colors">
                  Project Management Services
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#032D47] transition-colors">
                  Turnkey Construction
                </Link>
              </li>
              <li>
                <Link href="/quotation" className="text-[#966015] hover:text-[#032D47] font-mono font-bold transition-colors">
                  Online Estimation Tool &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-[#966015]">
              Studio
            </h4>
            <p className="text-xs text-[#455668] leading-relaxed">
              {address}
            </p>
            <p className="text-xs font-mono text-[#032D47] font-bold">
              <a href={`tel:${phone}`} className="hover:text-[#966015] transition-colors">
                {phone}
              </a>
            </p>
            <p className="text-xs font-mono text-[#032D47]">
              <a href={`mailto:${email}`} className="hover:text-[#966015] transition-colors">
                {email}
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Links (No public Admin link) */}
        <div className="pt-8 border-t border-[#BCC1C4]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#455668]">
          <p>
            &copy; 2021 – {currentYear} MAYA Design &amp; Build. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-[#455668] hover:text-[#032D47] transition-colors uppercase tracking-widest text-[11px]"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-[#455668] hover:text-[#032D47] transition-colors uppercase tracking-widest text-[11px]"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
