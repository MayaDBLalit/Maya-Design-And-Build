/**
 * Video Inspector & Container Duration Parser
 * Pure Node.js implementation without external binary/FFmpeg dependencies.
 */

export interface VideoInspectionResult {
  valid: boolean;
  format?: "mp4" | "webm";
  durationSeconds: number | null;
  exceedsDurationLimit?: boolean;
  error?: string;
}

/**
 * Validates video container magic bytes.
 */
export function validateVideoMagicBytes(buffer: Buffer): { valid: boolean; format?: "mp4" | "webm" } {
  if (buffer.length < 8) return { valid: false };

  // WebM / Matroska EBML header: 1A 45 DF A3
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return { valid: true, format: "webm" };
  }

  // MP4 / QuickTime: Look for 'ftyp' within the first 32 bytes
  for (let i = 4; i <= Math.min(buffer.length - 4, 32); i++) {
    if (buffer.toString("ascii", i, i + 4) === "ftyp") {
      return { valid: true, format: "mp4" };
    }
  }

  return { valid: false };
}

/**
 * Parses duration from an MP4 buffer by reading the 'moov' -> 'mvhd' atom.
 * ISO/IEC 14496-12 standard MP4 box parser.
 */
export function parseMp4Duration(buffer: Buffer): number | null {
  try {
    let offset = 0;
    const len = buffer.length;

    while (offset + 8 <= len) {
      const boxSize = buffer.readUInt32BE(offset);
      const boxType = buffer.toString("ascii", offset + 4, offset + 8);

      if (boxSize === 0) {
        // Box extends to end of file
        break;
      }
      if (boxSize === 1) {
        // Extended 64-bit size (large box), skip for simplicity
        offset += 16;
        continue;
      }
      if (boxSize < 8 || offset + boxSize > len) {
        break;
      }

      if (boxType === "moov") {
        // Search inside 'moov' container
        let moovOffset = offset + 8;
        const moovEnd = offset + boxSize;

        while (moovOffset + 8 <= moovEnd) {
          const subSize = buffer.readUInt32BE(moovOffset);
          const subType = buffer.toString("ascii", moovOffset + 4, moovOffset + 8);

          if (subSize < 8 || moovOffset + subSize > moovEnd) {
            break;
          }

          if (subType === "mvhd") {
            const version = buffer.readUInt8(moovOffset + 8);

            if (version === 0) {
              // Version 0: 32-bit timescale & duration
              const timeScale = buffer.readUInt32BE(moovOffset + 12 + 8);
              const duration = buffer.readUInt32BE(moovOffset + 12 + 12);
              if (timeScale > 0) {
                return duration / timeScale;
              }
            } else if (version === 1) {
              // Version 1: 64-bit timescale & duration
              const timeScale = buffer.readUInt32BE(moovOffset + 12 + 16);
              const durationHigh = buffer.readUInt32BE(moovOffset + 12 + 20);
              const durationLow = buffer.readUInt32BE(moovOffset + 12 + 24);
              const duration = BigInt(durationHigh) * BigInt(2 ** 32) + BigInt(durationLow);
              if (timeScale > 0) {
                return Number(duration) / timeScale;
              }
            }
          }

          moovOffset += subSize;
        }
      }

      offset += boxSize;
    }

    return null;
  } catch (err) {
    console.warn("Failed to parse MP4 duration headers:", err);
    return null;
  }
}

/**
 * Inspects an uploaded video buffer for valid container structure and duration limits.
 */
export function inspectVideo(
  buffer: Buffer,
  maxAllowedDurationSeconds: number = 60
): VideoInspectionResult {
  const magic = validateVideoMagicBytes(buffer);

  if (!magic.valid) {
    return {
      valid: false,
      durationSeconds: null,
      error: "Invalid video file: Header does not match standard MP4 or WebM containers.",
    };
  }

  let duration: number | null = null;

  if (magic.format === "mp4") {
    duration = parseMp4Duration(buffer);
  }

  // Allow 2-second tolerance for frame rate / timestamp rounding
  const exceedsDuration =
    duration !== null && duration > maxAllowedDurationSeconds + 2;

  return {
    valid: true,
    format: magic.format,
    durationSeconds: duration !== null ? Math.round(duration * 10) / 10 : null,
    exceedsDurationLimit: exceedsDuration,
  };
}
