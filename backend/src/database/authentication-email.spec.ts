import { normalizeAuthenticationEmail } from "./authentication-email";

describe("normalizeAuthenticationEmail", () => {
  it("normalizes surrounding whitespace and casing", () => {
    expect(normalizeAuthenticationEmail("  Local.User@Example.COM  ")).toBe(
      "local.user@example.com",
    );
  });

  it("does not rewrite characters beyond trimming and case normalization", () => {
    expect(normalizeAuthenticationEmail("user+local@example.com")).toBe(
      "user+local@example.com",
    );
  });
});
