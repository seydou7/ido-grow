import type { AuthenticatedSession } from "./contracts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseAuthenticatedSession(
  value: unknown,
): AuthenticatedSession | null {
  if (!isRecord(value) || value.status !== "authenticated" || !isRecord(value.user)) {
    return null;
  }

  const { id, email } = value.user;

  if (
    typeof id !== "string" ||
    id.trim() === "" ||
    typeof email !== "string" ||
    email.trim() === ""
  ) {
    return null;
  }

  return {
    status: "authenticated",
    user: { id, email },
  };
}
