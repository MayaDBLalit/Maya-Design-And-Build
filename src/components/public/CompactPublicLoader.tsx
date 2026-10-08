import React from "react";

interface CompactPublicLoaderProps {
  label?: string;
  minHeight?: string;
}

/**
 * Compact Architectural Loading Indicator for Public Routes.
 * Implements a 220ms delay threshold to eliminate loader flicker on fast transitions.
 * Features minimalist architectural drafting geometry and Maya brand tokens.
 */
export function CompactPublicLoader({
  label = "Loading Space",
  minHeight = "min-h-[70vh]",
}: CompactPublicLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`w-full ${minHeight} flex flex-col items-center justify-center p-6 bg-[#F9F6F5] select-none`}
    >
      {/* Delayed appearance: Hidden for first 220ms so fast transitions remain completely seamless */}
      <div className="animate-loader-delayed flex flex-col items-center justify-center gap-3.5">
        {/* Architectural Structural Geometry Indicator */}
        <div className="relative w-11 h-11 flex items-center justify-center">
          {/* Hairline Precision Rotating Circle */}
          <div
            className="absolute inset-0 rounded-full border border-[#BCC1C4]/50 border-t-[#966015] animate-spin motion-reduce:animate-none"
            style={{ animationDuration: "1.1s" }}
          />

          {/* Inner Structural Drafting Diamond */}
          <div className="w-4 h-4 rotate-45 border border-[#032D47]/70 bg-[#966015]/10 flex items-center justify-center shadow-xs">
            {/* Center Core Gold Axis */}
            <div className="w-1.5 h-1.5 bg-[#966015] rounded-xs" />
          </div>

          {/* Hairline Drafting Ticks */}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-px bg-[#966015]/70" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-px bg-[#966015]/70" />
        </div>

        {/* Minimal Architectural Editorial Typography */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.26em] text-[#032D47] font-semibold">
            MAYA • STUDIO
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#455668]/70">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
