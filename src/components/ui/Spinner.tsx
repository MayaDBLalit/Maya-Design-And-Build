import React from "react";

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

/**
 * Accessible SVG Spinner component
 * Respects Tailwind v4 styling and supports configurable sizing.
 */
export function Spinner({ size = "sm", className = "", ...props }: SpinnerProps) {
  const sizeClass = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  }[size];

  return (
    <svg
      className={`animate-spin ${sizeClass} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

interface ButtonLoadingContentProps {
  isLoading: boolean;
  loadingText: string;
  defaultText?: React.ReactNode;
  children?: React.ReactNode;
  spinnerSize?: "xs" | "sm" | "md";
}

/**
 * Standard button action content helper
 * Switches smoothly between idle content and spinner + loading label.
 */
export function ButtonLoadingContent({
  isLoading,
  loadingText,
  defaultText,
  children,
  spinnerSize = "sm",
}: ButtonLoadingContentProps) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-2">
        <Spinner size={spinnerSize} />
        <span>{loadingText}</span>
      </span>
    );
  }
  return <>{children || defaultText}</>;
}
