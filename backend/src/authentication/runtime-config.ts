export const LOCAL_SESSION_DURATION_MS = 8 * 60 * 60 * 1_000;
export const LOCAL_FRONTEND_ORIGIN = "http://localhost:3000";
export const SESSION_COOKIE_NAME = "ido_grow_session";

export function isLocalRuntime(): boolean {
  return process.env.IDO_GROW_RUNTIME_ENV === "local";
}

export function isDemoRuntime(): boolean {
  return process.env.IDO_GROW_RUNTIME_ENV === "demo";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: !isLocalRuntime(),
    path: "/",
    maxAge: LOCAL_SESSION_DURATION_MS,
  };
}

export function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: !isLocalRuntime(),
    path: "/",
  };
}
