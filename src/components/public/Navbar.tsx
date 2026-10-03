"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Projects", href: "/#projects" },
  { label: "Five Factors", href: "/#factors" },
  { label: "Process", href: "/#process" },
  { label: "Team", href: "/#team" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Calculator", href: "/#quotation" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0D0F12]/92 backdrop-blur-md border-b border-[#2B313D]/70 py-3 shadow-xl"
            : "bg-gradient-to-b from-[#0D0F12]/90 via-[#0D0F12]/50 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Maya Brand Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#14171C] border border-[#C5A869]/50 flex items-center justify-center group-hover:border-[#C5A869] transition duration-300 shadow-sm">
              <span className="text-xl font-black tracking-widest text-[#C5A869]">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-[0.2em] text-white group-hover:text-[#C5A869] transition duration-300">
                MAYA
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
                Design & Build
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-xs uppercase tracking-wider font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Button & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <a
              href="/#quotation"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-[#C5A869] to-[#d4af37] text-neutral-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md transition duration-200 active:scale-95"
            >
              <span>Instant Estimate</span>
              <span className="text-sm">→</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 transition focus:outline-hidden"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto w-72 max-w-[80vw] h-full bg-[#14171C] border-l border-[#2B313D] p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#2B313D]">
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-widest text-[#C5A869]">MAYA</span>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                    Design & Build
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm uppercase tracking-wider font-medium text-neutral-300 hover:text-[#C5A869] hover:bg-neutral-800/50 rounded transition"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#2B313D] space-y-3">
              <a
                href="/#quotation"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 rounded bg-[#C5A869] text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37] transition"
              >
                Estimate Quotation
              </a>
              <p className="text-[11px] text-center text-neutral-500">
                Designing Elegance, Building Legacy
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
