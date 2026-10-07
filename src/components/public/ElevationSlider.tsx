"use client";

import React, { useState, useRef, useCallback } from "react";

interface ElevationSliderProps {
  oldElevationUrl: string;
  newElevationUrl: string;
  projectTitle?: string;
  className?: string;
}

export function ElevationSlider({
  oldElevationUrl,
  newElevationUrl,
  projectTitle = "Project Transformation",
  className = "",
}: ElevationSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Legend Bar */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#455668] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#BCC1C4]" />
          Original Elevation (Before)
        </span>
        <span className="text-[#966015] uppercase tracking-wider flex items-center gap-1.5 font-bold">
          Proposed Modern Elevation (After)
          <span className="w-2 h-2 rounded-full bg-[#966015]" />
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative h-80 sm:h-96 md:h-[460px] w-full rounded-xs overflow-hidden border border-[#BCC1C4]/80 select-none cursor-ew-resize bg-[#F2EFEB] shadow-sm"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* Modern / After Elevation (Base Image) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={newElevationUrl}
          alt={`${projectTitle} Modern Elevation After`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 right-4 px-3 py-1 rounded-xs bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#BCC1C4]/60 text-[#966015] text-xs font-mono font-bold tracking-wider pointer-events-none shadow-xs">
          AFTER
        </div>

        {/* Original / Before Elevation (Clipped Layer) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={oldElevationUrl}
            alt={`${projectTitle} Original Elevation Before`}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
            }}
            draggable={false}
          />
          <div className="absolute top-4 left-4 px-3 py-1 rounded-xs bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#BCC1C4]/60 text-[#455668] text-xs font-mono font-bold tracking-wider pointer-events-none shadow-xs">
            BEFORE
          </div>
        </div>

        {/* Divider Slider Bar */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#032D47] cursor-ew-resize flex items-center justify-center -translate-x-1/2 shadow-md"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border-2 border-[#032D47] flex items-center justify-center text-[#032D47] shadow-lg">
            <svg className="w-4 h-4 text-[#032D47]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-center text-[#455668] font-mono">
        Drag slider left or right to compare architectural metamorphosis
      </p>
    </div>
  );
}
