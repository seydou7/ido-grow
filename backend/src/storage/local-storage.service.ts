import { Injectable, BadRequestException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, createReadStream, statSync, unlinkSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import { StorageService, type StoredFileMetadata, type RetrievedFile } from "./contracts";

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type DetectedFileType = {
  mimeType: string;
  extension: string;
};

export function detectFileTypeFromBuffer(buffer: Buffer): DetectedFileType | null {
  if (!buffer || buffer.length < 4) {
    return null;
  }

  // PDF: starts with %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return { mimeType: "application/pdf", extension: ".pdf" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: ".png" };
  }

  // JPEG: starts with FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { mimeType: "image/jpeg", extension: ".jpg" };
  }

  // WebP: RIFF at 0..3 and WEBP at 8..11
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { mimeType: "image/webp", extension: ".webp" };
  }

  return null;
}

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly storageDirectory: string;

  constructor() {
    super();
    const baseDir = process.cwd().endsWith("backend")
      ? path.resolve(process.cwd(), ".local-storage", "compliance")
      : path.resolve(process.cwd(), "backend", ".local-storage", "compliance");
    this.storageDirectory = baseDir;
    if (!existsSync(this.storageDirectory)) {
      mkdirSync(this.storageDirectory, { recursive: true });
    }
  }

  async store(
    filename: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StoredFileMetadata> {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(
        `Invalid declared file type "${mimeType}". Allowed types: PDF, JPG, PNG, WEBP.`,
      );
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File size exceeds limit of 10MB (got ${(buffer.length / 1024 / 1024).toFixed(2)}MB).`,
      );
    }

    const detected = detectFileTypeFromBuffer(buffer);
    if (!detected) {
      throw new BadRequestException(
        "Invalid file content signature. Uploaded file does not match any allowed format (PDF, JPG, PNG, WEBP).",
      );
    }

    if (detected.mimeType !== mimeType) {
      throw new BadRequestException(
        `MIME type mismatch: declared "${mimeType}" but file signature indicates "${detected.mimeType}".`,
      );
    }

    const sanitizedBaseName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = `${randomUUID()}${detected.extension}`;
    const targetPath = path.join(this.storageDirectory, storageKey);

    mkdirSync(this.storageDirectory, { recursive: true });
    writeFileSync(targetPath, buffer);

    return {
      storageKey,
      originalFilename: sanitizedBaseName,
      mimeType: detected.mimeType,
      fileSize: buffer.length,
    };
  }

  async retrieve(
    storageKey: string,
    originalFilename: string,
    mimeType: string,
  ): Promise<RetrievedFile | null> {
    const safeKey = path.basename(storageKey);
    const filePath = path.join(this.storageDirectory, safeKey);

    if (!filePath.startsWith(this.storageDirectory) || !existsSync(filePath)) {
      return null;
    }

    const stat = statSync(filePath);
    const stream = createReadStream(filePath);

    return {
      stream,
      mimeType,
      fileSize: stat.size,
      filename: originalFilename,
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    const safeKey = path.basename(storageKey);
    const filePath = path.join(this.storageDirectory, safeKey);

    if (filePath.startsWith(this.storageDirectory) && existsSync(filePath)) {
      unlinkSync(filePath);
      return true;
    }
    return false;
  }
}
