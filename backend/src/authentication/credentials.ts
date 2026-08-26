import { AuthenticationProblem } from "./authentication-problem";
import { normalizeAuthenticationEmail } from "../database";

export type LoginCredentials = Readonly<{ email: string; password: string }>;

function containsWhitespaceOrControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const codePoint = character.codePointAt(0);
    return (
      /\s/u.test(character) ||
      codePoint === undefined ||
      codePoint <= 0x1f ||
      (codePoint >= 0x7f && codePoint <= 0x9f)
    );
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidNormalizedAuthenticationEmail(email: string): boolean {
  return (
    email.length > 0 &&
    email.length <= 320 &&
    !containsWhitespaceOrControlCharacter(email) &&
    /^[^@]+@[^@]+$/.test(email)
  );
}

export function parseLoginCredentials(value: unknown): LoginCredentials {
  if (!isRecord(value) || Object.keys(value).some((key) => key !== "email" && key !== "password")) {
    throwInvalidLoginInput();
  }

  const emailValue = value.email;
  const passwordValue = value.password;

  if (typeof emailValue !== "string" || typeof passwordValue !== "string") {
    throwInvalidLoginInput();
  }

  const email = normalizeAuthenticationEmail(emailValue);

  if (
    !isValidNormalizedAuthenticationEmail(email) ||
    passwordValue.length === 0 ||
    Buffer.byteLength(passwordValue, "utf8") > 1_024
  ) {
    throwInvalidLoginInput();
  }

  return { email, password: passwordValue };
}

function throwInvalidLoginInput(): never {
  throw new AuthenticationProblem(
    422,
    "VALIDATION_FAILED",
    "Validation failed",
    "Email and password must be supplied in the expected format.",
  );
}
