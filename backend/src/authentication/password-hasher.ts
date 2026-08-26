import { Injectable } from "@nestjs/common";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_VERSION = 1;
const SCRYPT_N = 65_536;
const SCRYPT_R = 8;
const SCRYPT_P = 2;
const SCRYPT_MAX_MEMORY = 128 * 1024 * 1024;
const SALT_BYTES = 32;
const DERIVED_KEY_BYTES = 64;

const DUMMY_PASSWORD_HASH = [
  "scrypt",
  `v=${SCRYPT_VERSION}`,
  `n=${SCRYPT_N}`,
  `r=${SCRYPT_R}`,
  `p=${SCRYPT_P}`,
  Buffer.alloc(SALT_BYTES).toString("base64url"),
  Buffer.alloc(DERIVED_KEY_BYTES).toString("base64url"),
].join("$");

type ParsedPasswordHash = Readonly<{
  salt: Buffer;
  expected: Buffer;
}>;

function derivePasswordKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      DERIVED_KEY_BYTES,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: SCRYPT_MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

function parsePasswordHash(encoded: string): ParsedPasswordHash | null {
  const [algorithm, version, n, r, p, saltValue, expectedValue, ...extra] =
    encoded.split("$");

  if (
    extra.length !== 0 ||
    algorithm !== "scrypt" ||
    version !== `v=${SCRYPT_VERSION}` ||
    n !== `n=${SCRYPT_N}` ||
    r !== `r=${SCRYPT_R}` ||
    p !== `p=${SCRYPT_P}` ||
    !saltValue ||
    !expectedValue ||
    !/^[A-Za-z0-9_-]+$/.test(saltValue) ||
    !/^[A-Za-z0-9_-]+$/.test(expectedValue)
  ) {
    return null;
  }

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(expectedValue, "base64url");

    if (salt.length !== SALT_BYTES || expected.length !== DERIVED_KEY_BYTES) {
      return null;
    }

    return { salt, expected };
  } catch {
    return null;
  }
}

@Injectable()
export class PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const derivedKey = await derivePasswordKey(password, salt);

    return [
      "scrypt",
      `v=${SCRYPT_VERSION}`,
      `n=${SCRYPT_N}`,
      `r=${SCRYPT_R}`,
      `p=${SCRYPT_P}`,
      salt.toString("base64url"),
      derivedKey.toString("base64url"),
    ].join("$");
  }

  async verify(password: string, encoded: string): Promise<boolean> {
    const parsed = parsePasswordHash(encoded);

    if (!parsed) {
      return false;
    }

    const actual = await derivePasswordKey(password, parsed.salt);
    return timingSafeEqual(actual, parsed.expected);
  }

  dummyHash(): string {
    return DUMMY_PASSWORD_HASH;
  }
}
