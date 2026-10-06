import sharp from "sharp";
import crypto from "crypto";

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
}

export interface ProcessedImageResult {
  optimizedBuffer: Buffer;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  format: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  savingsPercentage: number;
  thumbnailBuffer?: Buffer;
  thumbnailFileName?: string;
}

/**
 * Validates image magic bytes to reject disguised or corrupted files.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedFormat?: string } {
  if (buffer.length < 12) return { valid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedFormat: "jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedFormat: "png" };
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { valid: true, detectedFormat: "webp" };
  }

  // AVIF: ... ftypavif or ftypavis
  const ftypStr = buffer.slice(4, 16).toString("ascii");
  if (ftypStr.includes("ftypavif") || ftypStr.includes("ftypavis")) {
    return { valid: true, detectedFormat: "avif" };
  }

  // GIF: GIF87a or GIF89a
  if (buffer.toString("ascii", 0, 3) === "GIF") {
    return { valid: true, detectedFormat: "gif" };
  }

  return { valid: false };
}

/**
 * Optimizes an uploaded image using Sharp:
 * - Strips EXIF metadata
 * - Normalizes orientation
 * - Resizes overly large dimensions (down to max 2560px)
 * - Converts to high-quality modern WebP
 * - Optionally generates a compressed thumbnail variant
 */
export async function processImage(
  inputBuffer: Buffer,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImageResult> {
  const {
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 82,
    generateThumbnail = false,
    thumbnailWidth = 600,
  } = options;

  // Validate magic bytes
  const magicValidation = validateImageMagicBytes(inputBuffer);
  if (!magicValidation.valid) {
    throw new Error(
      "Invalid image format: File header does not match valid JPEG, PNG, WebP, or AVIF magic bytes."
    );
  }

  const baseImage = sharp(inputBuffer).rotate(); // auto-rotate based on EXIF before stripping
  const metadata = await baseImage.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read image dimensions from file.");
  }

  // Optimize primary image to WebP
  const optimizedPipeline = sharp(inputBuffer)
    .rotate()
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 4,
    });

  const optimizedBuffer = await optimizedPipeline.toBuffer();
  const optimizedMeta = await sharp(optimizedBuffer).metadata();

  const originalSize = inputBuffer.length;
  const optimizedSize = optimizedBuffer.length;
  const savingsPercentage = Math.max(
    0,
    Math.round(((originalSize - optimizedSize) / originalSize) * 100)
  );

  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  const fileName = `${timestamp}-${uuid}.webp`;

  let thumbnailBuffer: Buffer | undefined;
  let thumbnailFileName: string | undefined;

  if (generateThumbnail) {
    thumbnailBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: thumbnailWidth,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 75, effort: 3 })
      .toBuffer();

    thumbnailFileName = `${timestamp}-${uuid}-thumb.webp`;
  }

  return {
    optimizedBuffer,
    fileName,
    mimeType: "image/webp",
    width: optimizedMeta.width || metadata.width,
    height: optimizedMeta.height || metadata.height,
    format: "webp",
    originalSizeBytes: originalSize,
    optimizedSizeBytes: optimizedSize,
    savingsPercentage,
    thumbnailBuffer,
    thumbnailFileName,
  };
}
