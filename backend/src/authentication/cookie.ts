import { SESSION_COOKIE_NAME } from "./runtime-config";

export function readSessionToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");

    if (name !== SESSION_COOKIE_NAME) {
      continue;
    }

    const value = valueParts.join("=");

    if (!/^[A-Za-z0-9_-]{43}$/.test(value)) {
      return null;
    }

    return value;
  }

  return null;
}
