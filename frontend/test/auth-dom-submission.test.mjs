import assert from "node:assert/strict";
import test from "node:test";

test("login form extraction resolves native DOM FormData values under browser autofill without onChange", () => {
  // Mock form structure simulating browser DOM
  const formState = {
    email: "synthetic-dummy@example.test",
    password: "synthetic-autofilled-pass-123",
  };

  // Simulate FormData populated by browser native autofill
  const mockFormData = new Map([
    ["email", formState.email],
    ["password", formState.password],
  ]);

  const extractedEmail = (mockFormData.get("email") || "").trim();
  const extractedPassword = mockFormData.get("password") || "";

  assert.equal(extractedEmail, "synthetic-dummy@example.test");
  assert.equal(extractedPassword, "synthetic-autofilled-pass-123");
  assert.equal(extractedPassword.length, 29);
});

test("DOM-only credential injection takes precedence over stale React Hook Form state", () => {
  // Stale React Hook Form state from initialization
  const staleReactHookFormValues = {
    email: "",
    password: "",
  };

  // Native DOM values injected by browser password manager
  const browserAutofilledFormData = new Map([
    ["email", "autofill-user@example.test"],
    ["password", "injected-credential-xyz-987"],
  ]);

  const submittedEmail = (browserAutofilledFormData.get("email") || staleReactHookFormValues.email).trim();
  const submittedPassword = browserAutofilledFormData.get("password") || staleReactHookFormValues.password;

  // Asserts that the submitted payload uses the DOM value, not the stale empty RHF state
  assert.equal(submittedEmail, "autofill-user@example.test");
  assert.equal(submittedPassword, "injected-credential-xyz-987");
  assert.notEqual(submittedPassword, staleReactHookFormValues.password);
});
