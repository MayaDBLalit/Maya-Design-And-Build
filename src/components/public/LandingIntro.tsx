"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function LandingIntro() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    // 1. Immediately prefetch /home route payload in the background so it is instantly ready
    try {
      router.prefetch("/home");
    } catch {
      // ignore prefetch errors if any
    }

    // 2. Detect reduced-motion preference for accessibility
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 3. Choreographed sequence timings: fade-out initiates at 2.5s, route replacement smoothly executes
    const exitDelay = prefersReduced ? 750 : 2500;
    const navigateDelay = prefersReduced ? 950 : 2800;

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, exitDelay);

    const navigateTimer = setTimeout(() => {
      router.replace("/home");
    }, navigateDelay);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navigateTimer);
    };
  }, [router]);

  return (
    <div
      role="presentation"
      aria-label="MAYA Design & Build Introduction"
      className={`min-h-screen w-full flex flex-col items-center justify-center bg-[#F9F6F5] overflow-hidden select-none relative transition-all duration-600 ease-out ${
        isExiting ? "opacity-0 scale-[1.015]" : "opacity-100 scale-100"
      }`}
    >
      {/* Soft Sunlit Clay Ambient Radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[340px] max-w-[90vw] bg-[#E1A857]/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Architectural Drafting Corner Coordinates */}
      <div className="animate-intro-drafting absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-[#966015]/75 uppercase">
        <span className="font-bold">+</span>
        <span>MAYA • EST. 2021</span>
      </div>
      <div className="animate-intro-drafting absolute top-6 right-6 sm:top-10 sm:right-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-[#455668]/65 uppercase">
        <span>BARDOLI • GUJARAT</span>
        <span className="font-bold">+</span>
      </div>
      <div className="animate-intro-drafting absolute bottom-6 left-6 sm:bottom-10 sm:left-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-[#455668]/65 uppercase">
        <span className="font-bold">+</span>
        <span>ARCHITECTURAL PRACTICE</span>
      </div>
      <div className="animate-intro-drafting absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-[#966015]/75 uppercase">
        <span>PMS &amp; TURNKEY</span>
        <span className="font-bold">+</span>
      </div>

      {/* Center Composition: Official Logo + Hairline Measure + Official Quote */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-6 text-center">
        {/* Official MAYA 3D Gold Logo */}
        <div className="animate-intro-logo relative flex items-center justify-center">
          <Image
            src="/images/maya-logo-official.png"
            alt="MAYA Design & Build"
            width={460}
            height={322}
            priority
            className="w-auto h-auto max-h-[150px] sm:max-h-[190px] md:max-h-[230px] lg:max-h-[270px] max-w-[85vw] object-contain select-none pointer-events-none drop-shadow-[0_16px_32px_rgba(150,96,21,0.14)]"
          />
        </div>

        {/* Architectural Hairline Divider */}
        <div className="animate-intro-line h-[1.5px] bg-gradient-to-r from-transparent via-[#966015] to-transparent my-5 sm:my-7 mx-auto rounded-full" />

        {/* Official Quote */}
        <p className="animate-intro-quote text-xs sm:text-sm md:text-base font-semibold tracking-[0.22em] sm:tracking-[0.26em] text-[#032D47] uppercase text-center px-4 leading-relaxed font-sans">
          Designing Elegance, Building Legacy
        </p>

        {/* Accessible Screen Reader Announcement */}
        <div className="sr-only" aria-live="polite">
          MAYA Design &amp; Build: Designing Elegance, Building Legacy
        </div>
      </div>
    </div>
  );
}
