import {
  assertUsableLocalSyntheticUserPassword,
  validateLocalSyntheticUserTarget,
} from "./local-synthetic-user";

describe("validateLocalSyntheticUserTarget", () => {
  it.each(["localhost", "127.0.0.1", "[::1]"])(
    "allows the exact local PostgreSQL database through %s",
    (host) => {
      expect(
        validateLocalSyntheticUserTarget(
          `postgresql://local:secret@${host}:5432/ido_grow?schema=public`,
          "  Synthetic@Example.Test ",
        ),
      ).toBe("synthetic@example.test");
    },
  );

  it.each([
    "postgresql://local:secret@database.example.test:5432/ido_grow",
    "postgresql://local:secret@localhost.example:5432/ido_grow",
    "postgresql://local:secret@localhost:5432/other_database",
    "postgresql://local:secret@localhost:5432/ido_grow?host=remote.example",
    "postgresql://local:secret@localhost:5432/ido_grow?schema=other",
    "postgres://local:secret@localhost:5432/ido_grow",
    "not-a-database-url",
  ])("rejects a non-exact local database target", (databaseUrl) => {
    expect(() =>
      validateLocalSyntheticUserTarget(databaseUrl, "synthetic@example.test"),
    ).toThrow(/local PostgreSQL ido_grow database/);
  });

  it("rejects a synthetic user outside the reserved .test namespace", () => {
    expect(() =>
      validateLocalSyntheticUserTarget(
        "postgresql://local:secret@localhost:5432/ido_grow",
        "person@example.com",
      ),
    ).toThrow(/\.test email address/);
  });

  it("rejects the committed example password sentinel", () => {
    expect(() =>
      assertUsableLocalSyntheticUserPassword(
        "replace-with-a-local-only-password",
      ),
    ).toThrow(/non-placeholder local password/);
  });

  it("allows a non-placeholder local password without defining product policy", () => {
    expect(() =>
      assertUsableLocalSyntheticUserPassword("local-test-only-value"),
    ).not.toThrow();
  });
});
