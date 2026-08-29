import { BadRequestException } from "@nestjs/common";
import { LocalStorageService, MAX_FILE_SIZE_BYTES } from "./local-storage.service";
import { rmSync, existsSync } from "node:fs";
import * as path from "node:path";

describe("LocalStorageService", () => {
  let service: LocalStorageService;
  const testStorageDir = process.cwd().endsWith("backend")
    ? path.resolve(process.cwd(), ".local-storage", "compliance")
    : path.resolve(process.cwd(), "backend", ".local-storage", "compliance");

  beforeEach(() => {
    service = new LocalStorageService();
  });

  afterAll(() => {
    if (existsSync(testStorageDir)) {
      rmSync(testStorageDir, { recursive: true, force: true });
    }
  });

  it("stores a real PDF document safely and derives storage extension from content", async () => {
    const buffer = Buffer.from("%PDF-1.7 standard header test stream");
    const result = await service.store("cert_2026.pdf", buffer, "application/pdf");

    expect(result.originalFilename).toBe("cert_2026.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(result.fileSize).toBe(buffer.length);
    expect(result.storageKey).toMatch(/^[0-9a-f-]+\.pdf$/i);

    const retrieved = await service.retrieve(
      result.storageKey,
      result.originalFilename,
      result.mimeType,
    );
    expect(retrieved).not.toBeNull();
    expect(retrieved?.filename).toBe("cert_2026.pdf");
    expect(retrieved?.fileSize).toBe(buffer.length);

    const chunks: Buffer[] = [];
    for await (const chunk of retrieved!.stream) {
      chunks.push(Buffer.from(chunk));
    }
    expect(Buffer.concat(chunks).toString()).toBe("%PDF-1.7 standard header test stream");

    const deleted = await service.delete(result.storageKey);
    expect(deleted).toBe(true);
  });

  it("stores valid JPEG, PNG, and WebP images safely", async () => {
    // JPEG: FF D8 FF
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const jpegResult = await service.store("scan.jpg", jpegBuffer, "image/jpeg");
    expect(jpegResult.storageKey).toMatch(/^[0-9a-f-]+\.jpg$/i);

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const pngResult = await service.store("badge.png", pngBuffer, "image/png");
    expect(pngResult.storageKey).toMatch(/^[0-9a-f-]+\.png$/i);

    // WebP: RIFF ... WEBP
    const webpBuffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x00, 0x00, 0x00, 0x00, // size
      0x57, 0x45, 0x42, 0x50, // WEBP
      0x56, 0x50, 0x38, 0x20, // VP8
    ]);
    const webpResult = await service.store("photo.webp", webpBuffer, "image/webp");
    expect(webpResult.storageKey).toMatch(/^[0-9a-f-]+\.webp$/i);
  });

  it("rejects fake PDF with arbitrary text/script content", async () => {
    const fakePdfBuffer = Buffer.from("<html><body><h1>Not a PDF</h1></body></html>");
    await expect(
      service.store("fake.pdf", fakePdfBuffer, "application/pdf"),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects MIME and content signature mismatch (e.g. JPEG declared as PDF)", async () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    await expect(
      service.store("mismatch.pdf", jpegBuffer, "application/pdf"),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects executable content disguised as allowed MIME (e.g. ELF/Mach-O/PE binary renamed to .pdf)", async () => {
    // ELF binary signature: 7F 45 4C 46
    const elfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01]);
    await expect(
      service.store("malicious.pdf", elfBuffer, "application/pdf"),
    ).rejects.toThrow(BadRequestException);

    // Shell script / shebang: #!/bin/bash
    const scriptBuffer = Buffer.from("#!/bin/bash\nrm -rf /");
    await expect(
      service.store("attack.pdf", scriptBuffer, "application/pdf"),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects unsupported declared MIME types", async () => {
    const buffer = Buffer.from("plain text content");
    await expect(
      service.store("script.sh", buffer, "application/x-sh"),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects files exceeding 10MB limit defensively", async () => {
    const hugeBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024);
    await expect(
      service.store("huge.pdf", hugeBuffer, "application/pdf"),
    ).rejects.toThrow(BadRequestException);
  });

  it("sanitizes filename and prevents directory traversal attacks", async () => {
    const buffer = Buffer.from("%PDF-1.4 safe content");
    const result = await service.store("../../../etc/passwd.pdf", buffer, "application/pdf");

    expect(result.originalFilename).toBe("passwd.pdf");
    expect(result.storageKey).not.toContain("..");

    const retrieved = await service.retrieve("../../../etc/passwd", "test.pdf", "application/pdf");
    expect(retrieved).toBeNull();
  });
});
