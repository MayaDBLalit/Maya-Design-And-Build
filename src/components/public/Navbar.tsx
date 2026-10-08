"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/home" },
  { label: "Factors", href: "/factors" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Quotation", href: "/quotation" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isFactors = pathname === "/factors";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const headerBgClass = isFactors
    ? isScrolled
      ? "bg-[#032D47]/95 backdrop-blur-md border-b border-white/10 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
      : "bg-[#032D47]/40 backdrop-blur-xs border-b border-white/10 py-4"
    : isScrolled
    ? "bg-[#F9F6F5]/95 backdrop-blur-md border-b border-[#BCC1C4]/50 py-3.5 shadow-[0_4px_24px_rgba(3,45,71,0.04)]"
    : "bg-[#F9F6F5]/80 backdrop-blur-xs border-b border-[#BCC1C4]/20 py-5";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBgClass}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Architectural Brand Identity */}
          <Link
            href="/home"
            className="group flex items-center gap-3.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#966015] rounded-xs"
          >
            <div
              className={`w-10 h-10 rounded-xs flex items-center justify-center font-serif text-xl font-bold tracking-wider transition-colors duration-300 shadow-xs ${
                isFactors
                  ? "bg-[#C5A869] text-[#032D47] group-hover:bg-white"
                  : "bg-[#032D47] text-[#F9F6F5] group-hover:bg-[#966015]"
              }`}
            >
              M
            </div>
            <div className="flex flex-col">
              <span
                className={`text-lg font-black tracking-[0.22em] transition-colors duration-300 ${
                  isFactors
                    ? "text-white group-hover:text-[#C5A869]"
                    : "text-[#032D47] group-hover:text-[#966015]"
                }`}
              >
                MAYA
              </span>
              <span
                className={`text-[9px] uppercase tracking-[0.28em] font-semibold ${
                  isFactors ? "text-neutral-300" : "text-[#455668]"
                }`}
              >
                Design &amp; Build
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/home"
                  ? pathname === "/home"
                  : pathname?.startsWith(link.href);

              const linkColorClass = isFactors
                ? isActive
                  ? "text-[#C5A869] font-bold"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
                : isActive
                ? "text-[#966015] font-bold"
                : "text-[#455668] hover:text-[#032D47] hover:bg-[#032D47]/5";

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-xs uppercase tracking-[0.16em] font-semibold transition-all duration-200 rounded-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#966015] ${linkColorClass}`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full ${
                        isFactors ? "bg-[#C5A869]" : "bg-[#966015]"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Primary Action & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/quotation"
              className={`hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-[0.16em] transition-all duration-200 shadow-xs active:scale-98 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#966015] ${
                isFactors
                  ? "bg-[#C5A869] hover:bg-white text-[#032D47]"
                  : "bg-[#032D47] hover:bg-[#966015] text-[#F9F6F5]"
              }`}
            >
              <span>Instant Estimate</span>
              <span className="text-sm font-serif">→</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xs transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#966015] ${
                isFactors
                  ? "text-white hover:bg-white/10"
                  : "text-[#032D47] hover:bg-[#032D47]/5"
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div
            className="fixed inset-0 bg-[#032D47]/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative ml-auto w-80 max-w-[85vw] h-full bg-[#F9F6F5] border-l border-[#BCC1C4]/60 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#BCC1C4]/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xs bg-[#032D47] text-[#F9F6F5] flex items-center justify-center font-serif text-lg font-bold">
                    M
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-black tracking-widest text-[#032D47]">
                      MAYA
                    </span>
                    <span className="text-[8px] uppercase tracking-widest text-[#455668] font-semibold">
                      Design &amp; Build
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xs text-[#455668] hover:text-[#032D47] hover:bg-[#032D47]/5 transition"
                  aria-label="Close navigation menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col space-y-1.5">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === "/home"
                      ? pathname === "/home"
                      : pathname?.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 text-sm uppercase tracking-[0.16em] font-semibold rounded-xs transition-all ${
                        isActive
                          ? "bg-[#966015]/10 text-[#966015] font-bold border-l-2 border-[#966015]"
                          : "text-[#032D47] hover:bg-[#032D47]/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Drawer Actions */}
            <div className="pt-6 border-t border-[#BCC1C4]/40 space-y-3">
              <Link
                href="/quotation"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-3.5 rounded-xs bg-[#966015] hover:bg-[#032D47] text-[#FFFFFF] text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-xs"
              >
                Estimate Project Cost
              </Link>
              <p className="text-[10px] text-center uppercase tracking-widest text-[#455668] font-mono">
                Established 2021 • Bardoli
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
