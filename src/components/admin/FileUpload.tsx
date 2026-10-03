"use client";

import React, { useState, useRef } from "react";
import { IconUpload, IconX, IconCheck, IconAlert } from "./Icons";

interface FileUploadProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  acceptType?: "image" | "video" | "any";
  helperText?: string;
  className?: string;
}

export function FileUpload({
  label,
  value,
  onChange,
  acceptType = "image",
  helperText,
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMime =
    acceptType === "image"
      ? "image/jpeg,image/png,image/webp,image/avif"
      : acceptType === "video"
      ? "video/mp4,video/webm"
      : "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm";

  const handleUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Upload failed");
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const isVideo =
    value?.endsWith(".mp4") ||
    value?.endsWith(".webm") ||
    acceptType === "video";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded-lg border border-[#2B313D] bg-[#14171C] p-2 flex items-center gap-3">
          <div className="w-16 h-16 rounded overflow-hidden bg-neutral-900 flex-shrink-0 flex items-center justify-center border border-neutral-800">
            {isVideo ? (
              <video
                src={value}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-neutral-300 truncate">{value}</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
              <IconCheck className="w-3 h-3" /> Uploaded successfully
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition"
            title="Remove media"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all ${
            dragActive
              ? "border-[#C5A869] bg-[#C5A869]/10"
              : "border-[#2B313D] hover:border-neutral-500 bg-[#14171C]/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptMime}
            onChange={handleChange}
            className="hidden"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            {isUploading ? (
              <div className="flex items-center gap-2 text-sm text-[#C5A869]">
                <svg className="animate-spin h-5 w-5 text-[#C5A869]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Uploading to local storage...</span>
              </div>
            ) : (
              <>
                <div className="p-2 rounded-full bg-neutral-800/80 text-[#C5A869]">
                  <IconUpload className="w-5 h-5" />
                </div>
                <div className="text-xs text-neutral-300">
                  <span className="font-semibold text-[#C5A869]">Click to browse</span> or drag and drop
                </div>
                <p className="text-[11px] text-neutral-500">
                  {acceptType === "video"
                    ? "MP4, WebM up to 50MB (max 1 min)"
                    : acceptType === "image"
                    ? "PNG, JPG, WebP, AVIF up to 10MB"
                    : "Images up to 10MB or Videos up to 50MB"}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
          <IconAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <p className="text-[11px] text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}
