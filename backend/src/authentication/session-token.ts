import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

@Injectable()
export class SessionTokenService {
  create(): Readonly<{ raw: string; hash: string }> {
    const raw = randomBytes(32).toString("base64url");
    return { raw, hash: hashSessionToken(raw) };
  }
}
