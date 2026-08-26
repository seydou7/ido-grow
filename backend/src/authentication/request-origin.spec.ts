import { assertAllowedStateChangingOrigin } from "./request-origin";

describe("assertAllowedStateChangingOrigin", () => {
  const originalRuntime = process.env.IDO_GROW_RUNTIME_ENV;

  beforeEach(() => {
    process.env.IDO_GROW_RUNTIME_ENV = "local";
  });

  afterAll(() => {
    if (originalRuntime === undefined) {
      delete process.env.IDO_GROW_RUNTIME_ENV;
    } else {
      process.env.IDO_GROW_RUNTIME_ENV = originalRuntime;
    }
  });

  it("allows the exact local frontend and absent non-browser origins", () => {
    expect(() =>
      assertAllowedStateChangingOrigin("http://localhost:3000"),
    ).not.toThrow();
    expect(() => assertAllowedStateChangingOrigin(undefined)).not.toThrow();
  });

  it.each([
    "null",
    "http://127.0.0.1:3000",
    "http://localhost:3000.example",
    "https://localhost:3000",
  ])("rejects a non-exact browser origin", (origin) => {
    expect(() => assertAllowedStateChangingOrigin(origin)).toThrow(
      expect.objectContaining({ status: 403 }),
    );
  });

  it("fails closed for browser origins outside the local runtime", () => {
    delete process.env.IDO_GROW_RUNTIME_ENV;
    expect(() =>
      assertAllowedStateChangingOrigin("http://localhost:3000"),
    ).toThrow(expect.objectContaining({ status: 403 }));
  });
});
