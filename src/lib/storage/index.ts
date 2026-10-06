import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

export interface UploadResult {
  url: string;
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
}

export interface StorageDriver {
  upload(fileBuffer: Buffer, fileName: string, mimeType?: string): Promise<UploadResult>;
  delete(fileName: string): Promise<boolean>;
  exists(fileName: string): Promise<boolean>;
  getUrl(fileName: string): string;
}

/**
 * Local Disk Storage Driver
 * Safely persists uploaded media to /public/uploads with strict path traversal prevention.
 */
export class LocalStorageDriver implements StorageDriver {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(process.cwd(), "public", "uploads");
  }

  private resolveSafePath(fileName: string): string {
    // Strip directory paths to prevent path traversal attacks (e.g. ../../etc)
    const sanitizedName = path.basename(fileName);
    const resolvedPath = path.resolve(this.uploadsDir, sanitizedName);

    if (!resolvedPath.startsWith(this.uploadsDir)) {
      throw new Error(`Security Violation: Path traversal attempt detected for ${fileName}`);
    }

    return resolvedPath;
  }

  async upload(fileBuffer: Buffer, fileName: string): Promise<UploadResult> {
    await fs.mkdir(this.uploadsDir, { recursive: true });

    const safePath = this.resolveSafePath(fileName);
    await fs.writeFile(safePath, fileBuffer);

    const safeName = path.basename(safePath);
    return {
      url: `/uploads/${safeName}`,
      filePath: safePath,
      fileName: safeName,
      fileSizeBytes: fileBuffer.length,
    };
  }

  async delete(fileName: string): Promise<boolean> {
    try {
      const safePath = this.resolveSafePath(fileName);
      if (existsSync(safePath)) {
        await fs.unlink(safePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete local storage file ${fileName}:`, error);
      return false;
    }
  }

  async exists(fileName: string): Promise<boolean> {
    try {
      const safePath = this.resolveSafePath(fileName);
      return existsSync(safePath);
    } catch {
      return false;
    }
  }

  getUrl(fileName: string): string {
    const safeName = path.basename(fileName);
    return `/uploads/${safeName}`;
  }
}

/**
 * Storage Driver Factory
 * Returns the configured storage adapter (default: local).
 * Designed for seamless future expansion to S3, Cloudflare R2, or Cloudinary.
 */
let storageInstance: StorageDriver | null = null;

export function getStorageDriver(): StorageDriver {
  if (storageInstance) return storageInstance;

  const driverType = process.env.STORAGE_DRIVER?.toLowerCase() || "local";

  switch (driverType) {
    case "local":
    default:
      storageInstance = new LocalStorageDriver();
      break;
  }

  return storageInstance;
}
