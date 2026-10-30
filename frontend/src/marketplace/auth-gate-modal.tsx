"use client";

import { useEffect, useRef, useState } from "react";
import { loginUser, registerBuyer } from "./public-api";

export interface AuthGateModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly returnTo?: string;
  readonly actionName?: string;
  readonly onAuthenticated?: () => void;
}

/**
 * Validates returnTo to strictly protect against open redirect attacks.
 * Only internal relative paths starting with a single '/' are permitted.
 */
export function sanitizeReturnTo(returnTo?: string | null): string {
  if (!returnTo || typeof returnTo !== "string") {
    return "/";
  }
  const trimmed = returnTo.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://")
  ) {
    return trimmed;
  }
  return "/";
}

export function AuthGateModal({
  isOpen,
  onClose,
  returnTo,
  actionName = "Request a Quote",
  onAuthenticated,
}: AuthGateModalProps) {
  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regContactName, setRegContactName] = useState("");
  const [regCountry, setRegCountry] = useState("FR");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handlePostAuthSuccess = () => {
    if (onAuthenticated) {
      onAuthenticated();
    }
    const safeUrl = sanitizeReturnTo(returnTo);
    window.location.href = safeUrl;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      await loginUser(loginEmail.trim(), loginPassword);
      handlePostAuthSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);

    try {
      await registerBuyer({
        email: regEmail.trim(),
        password: regPassword,
        companyName: regCompanyName.trim(),
        contactName: regContactName.trim() || undefined,
        country: regCountry.trim() || undefined,
      });
      handlePostAuthSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please check your information.";
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        className="w-full max-w-lg bg-[#faf8f1] rounded-2xl shadow-2xl border border-[#e4decb] overflow-hidden text-[#173f35]"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#e4decb] bg-[#f4f0e2] relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 text-[#5c6e66] hover:text-[#173f35] p-1.5 rounded-lg transition-colors focus:ring-2 focus:ring-[#2e6b56] focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <span className="inline-block px-2.5 py-0.5 mb-2 text-xs font-semibold tracking-wide uppercase bg-[#e2ede7] text-[#1e5442] rounded-full">
            Buyer Authentication Gate
          </span>
          <h2 id="auth-gate-title" className="text-xl font-bold text-[#173f35]">
            Ready to start sourcing?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#486358]">
            Sign in or create a Buyer account to request quotes, negotiate terms, and execute purchase contracts for{" "}
            <span className="font-semibold text-[#173f35]">{actionName}</span>.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#e4decb] bg-[#faf8f1]">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "LOGIN"}
            onClick={() => setActiveTab("LOGIN")}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors border-b-2 ${
              activeTab === "LOGIN"
                ? "border-[#1e5442] text-[#1e5442] bg-[#f4f0e2]"
                : "border-transparent text-[#5c6e66] hover:text-[#173f35]"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "REGISTER"}
            onClick={() => setActiveTab("REGISTER")}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors border-b-2 ${
              activeTab === "REGISTER"
                ? "border-[#1e5442] text-[#1e5442] bg-[#f4f0e2]"
                : "border-transparent text-[#5c6e66] hover:text-[#173f35]"
            }`}
          >
            Create Buyer Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {activeTab === "LOGIN" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div role="alert" className="p-3 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200">
                  {loginError}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-[#2f4f4f] uppercase tracking-wider mb-1">
                  Work Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c8c0aa] rounded-lg text-[#173f35] placeholder-[#8c9c94] focus:outline-none focus:ring-2 focus:ring-[#1e5442] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-[#2f4f4f] uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c8c0aa] rounded-lg text-[#173f35] placeholder-[#8c9c94] focus:outline-none focus:ring-2 focus:ring-[#1e5442] focus:border-transparent text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 bg-[#1e5442] hover:bg-[#173f35] text-white font-medium text-sm rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-[#2e6b56] focus:outline-none disabled:opacity-60"
                >
                  {loginLoading ? "Signing in..." : "Sign In & Continue"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div role="alert" className="p-3 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200">
                  {regError}
                </div>
              )}

              <div>
                <label htmlFor="reg-company" className="block text-xs font-semibold text-[#2f4f4f] uppercase tracking-wider mb-1">
                  Company / Organisation Name *
                </label>
                <input
                  id="reg-company"
                  type="text"
                  required
                  autoFocus
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  placeholder="Acme Sustainable Textiles Ltd."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c8c0aa] rounded-lg text-[#173f35] placeholder-[#8c9c94] focus:outline-none focus:ring-2 focus:ring-[#1e5442] focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-[#2f4f4f] uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="procurement@acme.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#c8c0aa] rounded-lg text-[#173f35] placeholder-[#8c9c94] focus:outline-none focus:ring-2 focus:ring-[#1e5442] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="reg-contact" className="block text-xs font-semibold text-[#2f4f4f] uppercase tracking-wider mb-1">
                    Contact Name
                  </label>
                  <input
                    id="reg-contact"
                    type="text"
                    value={regContactName}
                    onChange={(e) => setRegContactName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#c8c0aa] rounded-lg text-[#173f35] placeholder-[#8c9c94] focus:outline-none focus:ring-2 focus:ring-[#1e5442] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-[#2f4f4f] uppercase tracking-wider mb-1">
                    Password * (min 8 chars)
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#c8c0aa] rounded-lg text-[#173f35] placeholder-[#8c9c94] focus:outline-none focus:ring-2 focus:ring-[#1e5442] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="reg-country" className="block text-xs font-semibold text-[#2f4f4f] uppercase tracking-wider mb-1">
                    Country *
                  </label>
                  <select
                    id="reg-country"
                    required
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#c8c0aa] rounded-lg text-[#173f35] focus:outline-none focus:ring-2 focus:ring-[#1e5442] focus:border-transparent text-sm"
                  >
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                    <option value="BE">Belgium</option>
                    <option value="NL">Netherlands</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="PL">Poland</option>
                    <option value="UK">United Kingdom</option>
                    <option value="US">United States</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 px-4 bg-[#1e5442] hover:bg-[#173f35] text-white font-medium text-sm rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-[#2e6b56] focus:outline-none disabled:opacity-60"
                >
                  {regLoading ? "Creating Buyer Account..." : "Create Buyer Account & Continue"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 pt-4 border-t border-[#e4decb] flex items-center justify-between text-xs text-[#5c6e66]">
            <span>Need supplier onboarding instead?</span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#1e5442] hover:underline font-medium"
            >
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
