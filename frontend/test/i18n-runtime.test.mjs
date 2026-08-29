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

test("locale resolution is deterministic and supports exactly en, nl, and fr", async () => {
  const { DEFAULT_LOCALE, SUPPORTED_LOCALES, resolveLocale } = await importTypeScript(
    "../src/i18n/config.ts",
  );

  assert.deepEqual(SUPPORTED_LOCALES, ["en", "nl", "fr"]);
  assert.equal(DEFAULT_LOCALE, "en");
  assert.equal(resolveLocale(undefined), "en");
  assert.equal(resolveLocale("invalid"), "en");
  assert.equal(resolveLocale("nl"), "nl");
  assert.equal(resolveLocale("fr"), "fr");
});

test("locale preference uses the approved non-sensitive cookie boundary", async () => {
  const {
    LOCALE_COOKIE_MAX_AGE_SECONDS,
    LOCALE_COOKIE_NAME,
    serializeLocalePreferenceCookie,
  } = await importTypeScript("../src/i18n/config.ts");

  assert.equal(LOCALE_COOKIE_NAME, "ido_grow_locale");
  assert.equal(LOCALE_COOKIE_MAX_AGE_SECONDS, 31_536_000);
  assert.equal(
    serializeLocalePreferenceCookie("nl"),
    "ido_grow_locale=nl; Max-Age=31536000; Path=/; SameSite=Lax",
  );
});

test("English, Dutch, and French catalogs have identical non-empty keys", async () => {
  const [{ enCatalog }, { nlCatalog }, { frCatalog }] = await Promise.all([
    importTypeScript("../src/i18n/catalogs/en.ts"),
    importTypeScript("../src/i18n/catalogs/nl.ts"),
    importTypeScript("../src/i18n/catalogs/fr.ts"),
  ]);
  const englishKeys = Object.keys(enCatalog).sort();

  assert.deepEqual(Object.keys(nlCatalog).sort(), englishKeys);
  assert.deepEqual(Object.keys(frCatalog).sort(), englishKeys);
  assert.ok(englishKeys.length > 10);

  for (const catalog of [enCatalog, nlCatalog, frCatalog]) {
    assert.ok(Object.values(catalog).every((message) => message.trim().length > 0));
  }
});

test("runtime keeps English as the missing-copy fallback", async () => {
  const runtimeSource = await readFile(
    new URL("../src/i18n/runtime.ts", import.meta.url),
    "utf8",
  );

  assert.match(runtimeSource, /catalogs\[DEFAULT_LOCALE\]\[key\]/);
});

test("selector persists a validated locale and refreshes without changing routes", async () => {
  const selectorSource = await readFile(
    new URL("../src/i18n/language-selector.tsx", import.meta.url),
    "utf8",
  );
  const layoutSource = await readFile(
    new URL("../src/app/layout.tsx", import.meta.url),
    "utf8",
  );

  assert.match(selectorSource, /if \(!isLocale\(value\)/);
  assert.match(selectorSource, /document\.cookie = serializeLocalePreferenceCookie\(value\)/);
  assert.match(selectorSource, /router\.refresh\(\)/);
  assert.doesNotMatch(selectorSource, /router\.(push|replace)\(/);
  assert.match(selectorSource, /defaultValue=\{locale\}/);
  assert.match(layoutSource, /<html lang=\{locale\}>/);
});
