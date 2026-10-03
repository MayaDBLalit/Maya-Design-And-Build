import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES: Record<string, { ext: string; type: "image" | "video"; maxSize: number }> = {
  "image/jpeg": { ext: "jpg", type: "image", maxSize: MAX_IMAGE_SIZE },
  "image/png": { ext: "png", type: "image", maxSize: MAX_IMAGE_SIZE },
  "image/webp": { ext: "webp", type: "image", maxSize: MAX_IMAGE_SIZE },
  "image/avif": { ext: "avif", type: "image", maxSize: MAX_IMAGE_SIZE },
  "video/mp4": { ext: "mp4", type: "video", maxSize: MAX_VIDEO_SIZE },
  "video/webm": { ext: "webm", type: "video", maxSize: MAX_VIDEO_SIZE },
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in 'file' field" },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    const fileConfig = ALLOWED_MIME_TYPES[mimeType];

    if (!fileConfig) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: `Supported formats: JPEG, PNG, WebP, AVIF (images $\\le$ 10MB) or MP4, WebM (videos $\\le$ 50MB). Received: ${file.type}`,
        },
        { status: 400 }
      );
    }

    if (file.size > fileConfig.maxSize) {
      const maxMb = fileConfig.maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          error: "File size exceeds limit",
          message: `Maximum allowed size for ${fileConfig.type}s is ${maxMb}MB. Uploaded file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
        },
        { status: 400 }
      );
    }

    // Generate safe UUID-based filename
    const safeUUID = crypto.randomUUID();
    const fileName = `${Date.now()}-${safeUUID}.${fileConfig.ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        url: publicUrl,
        fileName,
        originalName: file.name,
        fileSizeBytes: file.size,
        mediaType: fileConfig.type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin upload handler error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to process file upload" },
      { status: 500 }
    );
  }
}
