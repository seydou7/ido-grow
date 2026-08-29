import { Readable } from "node:stream";

export type StoredFileMetadata = Readonly<{
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
}>;

export type RetrievedFile = Readonly<{
  stream: Readable;
  mimeType: string;
  fileSize: number;
  filename: string;
}>;

export abstract class StorageService {
  abstract store(
    filename: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StoredFileMetadata>;

  abstract retrieve(
    storageKey: string,
    originalFilename: string,
    mimeType: string,
  ): Promise<RetrievedFile | null>;

  abstract delete(storageKey: string): Promise<boolean>;
}
