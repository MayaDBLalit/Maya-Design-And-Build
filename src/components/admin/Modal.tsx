"use client";

import React, { useEffect } from "react";
import { IconX } from "./Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  variant?: "dark" | "light";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "2xl",
  variant = "dark",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  const isLight = variant === "light";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#032D47]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full ${maxWidthClasses} max-h-[90vh] flex flex-col rounded-xs border shadow-2xl overflow-hidden ${
          isLight
            ? "border-[#BCC1C4]/80 bg-[#FFFFFF] text-[#032D47]"
            : "border-[#2B313D] bg-[#14171C] text-white"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isLight
              ? "border-[#BCC1C4]/40 bg-[#F9F6F5]"
              : "border-[#2B313D] bg-[#0F1115]"
          }`}
        >
          <h2
            className={`text-lg font-bold tracking-tight ${
              isLight ? "text-[#032D47]" : "text-white"
            }`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-xs transition cursor-pointer ${
              isLight
                ? "text-[#455668] hover:text-[#032D47] hover:bg-[#F2EFEB]"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
            aria-label="Close modal"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
