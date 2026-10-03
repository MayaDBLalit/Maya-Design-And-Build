import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getStorageDriver } from "@/lib/storage";
import { processImage, validateImageMagicBytes } from "@/lib/media/image-processor";
import { inspectVideo, validateVideoMagicBytes } from "@/lib/media/video-inspector";
import crypto from "crypto";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_GALLERY_VIDEO_DURATION_SECONDS = 60; // 60 seconds max for gallery videos

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const purpose = (formData.get("purpose") as string | null)?.toLowerCase() || "general";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in 'file' field" },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error: "Unsupported file type",
          message: `Supported formats: JPEG, PNG, WebP, AVIF (images $\\le$ 10MB) or MP4, WebM (videos $\\le$ 50MB). Received: ${file.type}`,
        },
        { status: 400 }
      );
    }

    // Size limit check
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxMb = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          error: "File size exceeds limit",
          message: `Maximum allowed size for ${isImage ? "images" : "videos"} is ${maxMb}MB. Uploaded file is ${(
            file.size / (1024 * 1024)
          ).toFixed(2)}MB.`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const storageDriver = getStorageDriver();

    // --------------------------------------------------------------------------
    // A. IMAGE PROCESSING PIPELINE (SHARP)
    // --------------------------------------------------------------------------
    if (isImage) {
      // Magic bytes verification
      const magic = validateImageMagicBytes(fileBuffer);
      if (!magic.valid) {
        return NextResponse.json(
          {
            error: "Invalid image content",
            message: "File data does not match valid JPEG, PNG, WebP, or AVIF image headers.",
          },
          { status: 400 }
        );
      }

      // Process and optimize image
      const shouldGenerateThumb = purpose === "gallery" || purpose === "project";
      const processed = await processImage(fileBuffer, {
        generateThumbnail: shouldGenerateThumb,
        maxWidth: 2560,
        quality: 82,
      });

      // Upload primary optimized WebP
      const uploadResult = await storageDriver.upload(
        processed.optimizedBuffer,
        processed.fileName,
        processed.mimeType
      );

      let thumbnailUrl: string | undefined;

      // Upload thumbnail if generated
      if (processed.thumbnailBuffer && processed.thumbnailFileName) {
        const thumbResult = await storageDriver.upload(
          processed.thumbnailBuffer,
          processed.thumbnailFileName,
          "image/webp"
        );
        thumbnailUrl = thumbResult.url;
      }

      return NextResponse.json(
        {
          success: true,
          message: "Image processed and uploaded successfully",
          url: uploadResult.url,
          thumbnailUrl,
          fileName: processed.fileName,
          originalName: file.name,
          width: processed.width,
          height: processed.height,
          originalSizeBytes: processed.originalSizeBytes,
          fileSizeBytes: processed.optimizedSizeBytes,
          savingsPercentage: processed.savingsPercentage,
          mediaType: "image",
          format: "webp",
        },
        { status: 201 }
      );
    }

    // --------------------------------------------------------------------------
    // B. VIDEO INSPECTION & UPLOAD
    // --------------------------------------------------------------------------
    if (isVideo) {
      const videoInspection = inspectVideo(fileBuffer, MAX_GALLERY_VIDEO_DURATION_SECONDS);

      if (!videoInspection.valid) {
        return NextResponse.json(
          {
            error: "Invalid video content",
            message: videoInspection.error || "File data does not match standard MP4 or WebM video containers.",
          },
          { status: 400 }
        );
      }

      // Enforce video duration limit for gallery walkthrough videos
      if (purpose === "gallery" && videoInspection.exceedsDurationLimit) {
        return NextResponse.json(
          {
            error: "Video duration exceeds limit",
            message: `Gallery walkthrough videos must be 60 seconds or less. Detected duration: ${videoInspection.durationSeconds}s.`,
          },
          { status: 400 }
        );
      }

      const safeUUID = crypto.randomUUID();
      const ext = videoInspection.format || "mp4";
      const videoFileName = `${Date.now()}-${safeUUID}.${ext}`;

      const uploadResult = await storageDriver.upload(fileBuffer, videoFileName, mimeType);

      return NextResponse.json(
        {
          success: true,
          message: "Video uploaded successfully",
          url: uploadResult.url,
          fileName: videoFileName,
          originalName: file.name,
          fileSizeBytes: file.size,
          durationSeconds: videoInspection.durationSeconds,
          mediaType: "video",
          format: ext,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Admin upload handler error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message || "Failed to process file upload" },
      { status: 500 }
    );
  }
}
