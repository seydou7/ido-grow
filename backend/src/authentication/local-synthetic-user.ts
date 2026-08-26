import { normalizeAuthenticationEmail } from "../database";
import { isValidNormalizedAuthenticationEmail } from "./credentials";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const EXAMPLE_PASSWORD_SENTINEL = "replace-with-a-local-only-password";

export function validateLocalSyntheticUserTarget(
  databaseUrlValue: string | undefined,
  emailValue: string,
): string {
  let databaseUrl: URL;

  try {
    databaseUrl = new URL(databaseUrlValue ?? "");
  } catch {
    throw invalidLocalTarget();
  }

  const email = normalizeAuthenticationEmail(emailValue);
  const queryParameters = [...databaseUrl.searchParams.entries()];
  const validQueryParameters =
    queryParameters.length <= 1 &&
    queryParameters.every(
      ([name, value]) => name === "schema" && value === "public",
    );
  const validDatabaseTarget =
    databaseUrl.protocol === "postgresql:" &&
    LOOPBACK_HOSTS.has(databaseUrl.hostname) &&
    databaseUrl.pathname === "/ido_grow" &&
    databaseUrl.hash === "" &&
    validQueryParameters;

  if (
    !validDatabaseTarget ||
    !isValidNormalizedAuthenticationEmail(email) ||
    !email.endsWith(".test")
  ) {
    throw invalidLocalTarget();
  }

  return email;
}

export function assertUsableLocalSyntheticUserPassword(password: string): void {
  if (
    password === EXAMPLE_PASSWORD_SENTINEL ||
    Buffer.byteLength(password, "utf8") === 0 ||
    Buffer.byteLength(password, "utf8") > 1_024
  ) {
    throw new Error(
      "Synthetic user creation requires a non-placeholder local password.",
    );
  }
}

function invalidLocalTarget(): Error {
  return new Error(
    "Synthetic user creation requires the local PostgreSQL ido_grow database and a .test email address.",
  );
}
