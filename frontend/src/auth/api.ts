import type { AuthenticationSession } from "./contracts";
import { getLocalApiBaseUrl } from "./config";
import { parseAuthenticatedSession } from "./responses";

type LoginCredentials = Readonly<{
  email: string;
  password: string;
}>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class AuthenticationRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationRequestError";
  }
}

function endpoint(path: string): string {
  return `${getLocalApiBaseUrl(API_BASE_URL)}${path}`;
}

async function readAuthenticatedSession(response: Response): Promise<AuthenticationSession> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new AuthenticationRequestError("The authentication service returned an invalid response.");
  }

  const session = parseAuthenticatedSession(payload);

  if (!session) {
    throw new AuthenticationRequestError("The authentication service returned an invalid response.");
  }

  return session;
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(endpoint(path), {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new AuthenticationRequestError("The authentication service is unavailable.");
  }
}

export async function getAuthenticationSession(): Promise<AuthenticationSession> {
  const response = await send("/api/v1/auth/session", { method: "GET" });

  if (response.status === 401) {
    return { status: "unauthenticated" };
  }

  if (!response.ok) {
    throw new AuthenticationRequestError("Unable to check your authentication status.");
  }

  return readAuthenticatedSession(response);
}

export async function login(credentials: LoginCredentials): Promise<AuthenticationSession> {
  const response = await send("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new AuthenticationRequestError(
      response.status === 401
        ? "The email or password is incorrect."
        : "Unable to sign in. Please try again.",
    );
  }

  return readAuthenticatedSession(response);
}

export async function logout(): Promise<void> {
  const response = await send("/api/v1/auth/logout", { method: "POST" });

  if (!response.ok) {
    throw new AuthenticationRequestError("Unable to sign out. Please try again.");
  }
}
