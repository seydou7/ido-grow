import { hashSessionToken, SessionTokenService } from "./session-token";

describe("SessionTokenService", () => {
  it("creates opaque 32-byte tokens and stores only a SHA-256 hash shape", () => {
    const token = new SessionTokenService().create();

    expect(Buffer.from(token.raw, "base64url")).toHaveLength(32);
    expect(token.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(token.hash).toBe(hashSessionToken(token.raw));
    expect(token.hash).not.toContain(token.raw);
  });

  it("generates independent tokens", () => {
    const service = new SessionTokenService();
    expect(service.create().raw).not.toBe(service.create().raw);
  });
});
