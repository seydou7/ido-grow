import {
  isValidNormalizedAuthenticationEmail,
  parseLoginCredentials,
} from "./credentials";

describe("authentication credential validation", () => {
  it("accepts a normalized authentication email", () => {
    expect(isValidNormalizedAuthenticationEmail("person@example.test")).toBe(
      true,
    );
  });

  it.each([
    "person @example.test",
    "person\t@example.test",
    "person\n@example.test",
    "person\u0000@example.test",
    "person\u007f@example.test",
    "person\u0085@example.test",
  ])("rejects whitespace and control characters in an email", (email) => {
    expect(isValidNormalizedAuthenticationEmail(email)).toBe(false);
  });

  it("rejects credentials containing internal whitespace", () => {
    expect(() =>
      parseLoginCredentials({
        email: "person\t@example.test",
        password: "password",
      }),
    ).toThrow(expect.objectContaining({ status: 422 }));
  });
});
