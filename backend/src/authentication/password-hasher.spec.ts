import { PasswordHasher } from "./password-hasher";

describe("PasswordHasher", () => {
  const hasher = new PasswordHasher();

  it("uses a random salt and never stores the plaintext password", async () => {
    const first = await hasher.hash("local-test-password");
    const second = await hasher.hash("local-test-password");

    expect(first).not.toBe(second);
    expect(first).not.toContain("local-test-password");
    expect(first.startsWith("scrypt$")).toBe(true);
    expect(first).toContain("$p=2$");
  });

  it("verifies only the matching password", async () => {
    const encoded = await hasher.hash("correct-password");

    await expect(hasher.verify("correct-password", encoded)).resolves.toBe(true);
    await expect(hasher.verify("wrong-password", encoded)).resolves.toBe(false);
  });

  it("rejects malformed stored values safely", async () => {
    await expect(hasher.verify("password", "not-a-password-hash")).resolves.toBe(
      false,
    );
  });
});
