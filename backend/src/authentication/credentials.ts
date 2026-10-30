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

export type RegisterBuyerInput = Readonly<{
  email: string;
  password: string;
  companyName: string;
  contactName?: string | null;
  country?: string | null;
}>;

export function parseRegisterBuyerInput(value: unknown): RegisterBuyerInput {
  if (!isRecord(value)) {
    throwInvalidRegisterBuyerInput("Invalid input payload.");
  }

  const { email: rawEmail, password: rawPassword, companyName: rawCompany, contactName: rawContact, country: rawCountry } = value;

  if (typeof rawEmail !== "string" || typeof rawPassword !== "string" || typeof rawCompany !== "string") {
    throwInvalidRegisterBuyerInput("Email, password, and company name are required.");
  }

  const email = normalizeAuthenticationEmail(rawEmail);
  if (!isValidNormalizedAuthenticationEmail(email)) {
    throwInvalidRegisterBuyerInput("Invalid email format.");
  }

  if (rawPassword.length < 8 || Buffer.byteLength(rawPassword, "utf8") > 1_024) {
    throwInvalidRegisterBuyerInput("Password must be at least 8 characters long.");
  }

  const companyName = rawCompany.trim();
  if (companyName.length < 2 || companyName.length > 200) {
    throwInvalidRegisterBuyerInput("Company name must be between 2 and 200 characters.");
  }

  const contactName = typeof rawContact === "string" && rawContact.trim().length > 0
    ? rawContact.trim().slice(0, 150)
    : null;

  const country = typeof rawCountry === "string" && rawCountry.trim().length > 0
    ? rawCountry.trim().slice(0, 100)
    : null;

  return {
    email,
    password: rawPassword,
    companyName,
    contactName,
    country,
  };
}

function throwInvalidLoginInput(): never {
  throw new AuthenticationProblem(
    422,
    "VALIDATION_FAILED",
    "Validation failed",
    "Email and password must be supplied in the expected format.",
  );
}

function throwInvalidRegisterBuyerInput(detail: string): never {
  throw new AuthenticationProblem(
    422,
    "VALIDATION_FAILED",
    "Validation failed",
    detail,
  );
}
