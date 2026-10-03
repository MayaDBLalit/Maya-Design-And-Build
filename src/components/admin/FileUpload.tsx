"use client";

import React, { useState, useRef } from "react";
import { IconUpload, IconX, IconCheck, IconAlert } from "./Icons";

export interface UploadDetails {
  url: string;
  thumbnailUrl?: string;
  durationSeconds?: number | null;
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  format?: string;
  savingsPercentage?: number;
}

interface FileUploadProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  onUploadDetails?: (details: UploadDetails) => void;
  acceptType?: "image" | "video" | "any";
  purpose?: "gallery" | "project" | "team" | "service" | "general";
  helperText?: string;
  className?: string;
}

export function FileUpload({
  label,
  value,
  onChange,
  onUploadDetails,
  acceptType = "image",
  purpose = "general",
  helperText,
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMime =
    acceptType === "image"
      ? "image/jpeg,image/png,image/webp,image/avif"
      : acceptType === "video"
      ? "video/mp4,video/webm"
      : "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm";

  const handleUpload = async (file: File) => {
    setError(null);
    setUploadInfo(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", purpose);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Upload failed");
      }

      onChange(data.url);

      if (data.savingsPercentage && data.savingsPercentage > 0) {
        setUploadInfo(`Optimized WebP (${data.savingsPercentage}% size reduction)`);
      } else if (data.durationSeconds) {
        setUploadInfo(`Duration: ${data.durationSeconds}s`);
      }

      if (onUploadDetails) {
        onUploadDetails({
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          durationSeconds: data.durationSeconds,
          fileSizeBytes: data.fileSizeBytes,
          width: data.width,
          height: data.height,
          format: data.format,
          savingsPercentage: data.savingsPercentage,
        });
      }
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
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                <IconCheck className="w-3 h-3" /> Stored locally
              </span>
              {uploadInfo && (
                <span className="text-[10px] font-mono text-[#C5A869] bg-[#C5A869]/10 px-1.5 py-0.5 rounded border border-[#C5A869]/20">
                  {uploadInfo}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setUploadInfo(null);
            }}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition cursor-pointer"
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
                <span>Processing &amp; optimizing with Sharp...</span>
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
                    ? "PNG, JPG, WebP, AVIF up to 10MB (auto-compressed to WebP)"
                    : "Images up to 10MB or Videos up to 50MB"}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {helperText && !error && (
        <p className="text-[11px] text-neutral-500">{helperText}</p>
      )}

      {error && (
        <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <IconAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
