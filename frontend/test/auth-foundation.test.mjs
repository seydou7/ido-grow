import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import ts from "typescript";

async function importTypeScript(relativePath) {
  const sourceUrl = new URL(relativePath, import.meta.url);
  const source = await readFile(sourceUrl, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourceUrl.pathname,
  });

  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

test("local API configuration accepts only the exact local backend", async () => {
  const { getLocalApiBaseUrl } = await importTypeScript("../src/auth/config.ts");

  assert.equal(getLocalApiBaseUrl("http://localhost:3001"), "http://localhost:3001");
  assert.equal(getLocalApiBaseUrl("http://127.0.0.1:3001"), "http://127.0.0.1:3001");

  for (const value of [
    undefined,
    "https://localhost:3001",
    "http://localhost:3000",
    "http://example.com:3001",
    "http://localhost:3001/api",
    "http://user:password@localhost:3001",
  ]) {
    assert.throws(() => getLocalApiBaseUrl(value), /Local API configuration/);
  }
});

test("authenticated session parsing exposes only safe user identity fields", async () => {
  const { parseAuthenticatedSession } = await importTypeScript("../src/auth/responses.ts");

  assert.deepEqual(
    parseAuthenticatedSession({
      status: "authenticated",
      user: {
        id: "user-1",
        email: "owner@example.test",
        passwordHash: "must-not-leak",
        roles: ["admin"],
      },
    }),
    {
      status: "authenticated",
      user: { id: "user-1", email: "owner@example.test" },
    },
  );

  assert.equal(parseAuthenticatedSession({ status: "authenticated", user: null }), null);
  assert.equal(
    parseAuthenticatedSession({
      status: "authenticated",
      user: { id: "", email: "owner@example.test" },
    }),
    null,
  );
});
