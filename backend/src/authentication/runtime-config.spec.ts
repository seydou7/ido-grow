import {
  clearSessionCookieOptions,
  LOCAL_SESSION_DURATION_MS,
  sessionCookieOptions,
} from "./runtime-config";

describe("authentication runtime configuration", () => {
  const originalRuntime = process.env.IDO_GROW_RUNTIME_ENV;

  afterEach(() => {
    if (originalRuntime === undefined) {
      delete process.env.IDO_GROW_RUNTIME_ENV;
    } else {
      process.env.IDO_GROW_RUNTIME_ENV = originalRuntime;
    }
  });

  it("uses the explicit eight-hour local session baseline", () => {
    expect(LOCAL_SESSION_DURATION_MS).toBe(8 * 60 * 60 * 1_000);
  });

  it("uses an HttpOnly SameSite=Lax cookie without Secure only locally", () => {
    process.env.IDO_GROW_RUNTIME_ENV = "local";
    expect(sessionCookieOptions()).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: LOCAL_SESSION_DURATION_MS,
    });
  });

  it("fails secure outside the explicitly selected local runtime", () => {
    delete process.env.IDO_GROW_RUNTIME_ENV;
    expect(sessionCookieOptions().secure).toBe(true);
    expect(clearSessionCookieOptions().secure).toBe(true);
  });
});
