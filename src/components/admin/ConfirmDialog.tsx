"use client";

import React from "react";
import { Modal } from "./Modal";
import { IconAlert } from "./Icons";
import { Spinner } from "@/components/ui/Spinner";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loadingLabel,
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  const activeLoadingText =
    loadingLabel || (isDestructive ? "Deleting..." : "Processing...");

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title={title} maxWidth="md">
      <div className="space-y-4" aria-busy={isLoading}>
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-full flex-shrink-0 ${
              isDestructive
                ? "bg-red-500/10 text-red-400"
                : "bg-amber-500/10 text-amber-400"
            }`}
          >
            <IconAlert className="w-6 h-6" />
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#2B313D]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#C5A869] hover:bg-[#d4af37] text-neutral-900"
            }`}
          >
            {isLoading ? (
              <>
                <Spinner size="xs" />
                <span>{activeLoadingText}</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
