"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n-provider";
import { LanguageSelector } from "@/i18n/language-selector";
import { fetchAuthSession, logoutUser } from "./public-api";
import type { SessionStatus } from "./public-contracts";

export interface PublicHeaderProps {
  readonly onOpenAuthGate?: (actionName?: string) => void;
  readonly activeRoute?: "home" | "marketplace" | "how-it-works";
}

export function PublicHeader({ onOpenAuthGate, activeRoute }: PublicHeaderProps) {
  const { t } = useI18n();
  const [session, setSession] = useState<SessionStatus>({
    status: "unauthenticated",
    user: null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAuthSession()
      .then(setSession)
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setSession({ status: "unauthenticated", user: null });
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e4ded0] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Primary Nav Links */}
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity"
            aria-label="I Do Grow Home"
          >
            <img
              src="/images/Logo IDoGrow principale.png"
              alt="I Do Grow"
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-bold uppercase tracking-wider">
            <Link
              href="/"
              className={`transition-colors pb-0.5 ${
                activeRoute === "home"
                  ? "text-[#173f35] border-b-2 border-[#1e5442]"
                  : "text-[#5c6e66] hover:text-[#173f35]"
              }`}
            >
              {t("navigation.home")}
            </Link>
            <Link
              href="/marketplace"
              className={`transition-colors pb-0.5 ${
                activeRoute === "marketplace"
                  ? "text-[#173f35] border-b-2 border-[#1e5442]"
                  : "text-[#5c6e66] hover:text-[#173f35]"
              }`}
            >
              {t("navigation.marketplace")}
            </Link>
            <Link
              href="/how-it-works"
              className={`transition-colors pb-0.5 ${
                activeRoute === "how-it-works"
                  ? "text-[#173f35] border-b-2 border-[#1e5442]"
                  : "text-[#5c6e66] hover:text-[#173f35]"
              }`}
            >
              {t("navigation.howItWorks")}
            </Link>
          </nav>
        </div>

        {/* Right CTA / Session / Language Selector Area */}
        <div className="flex items-center space-x-3">
          {session.status === "authenticated" && session.user ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-[#5c6e66] hidden lg:inline-block">
                Buyer: <strong className="text-[#173f35]">{session.user.email}</strong>
              </span>
              <Link
                href="/portal"
                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-[#e2ede7] text-[#1e5442] hover:bg-[#d0e4da] transition-colors"
              >
                {t("app.platform")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="py-1.5 px-3 rounded-lg text-xs font-semibold border border-[#c8c0aa] text-[#5c6e66] hover:text-[#173f35] hover:bg-[#f4f0e2] transition-colors"
              >
                {t("auth.logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onOpenAuthGate?.(t("navigation.login"))}
                className="py-2 px-3 text-xs font-bold text-[#173f35] hover:bg-[#f4f0e2] rounded-lg transition-colors"
              >
                {t("navigation.login")}
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthGate?.(t("navigation.createAccount"))}
                className="py-2 px-3.5 text-xs font-bold bg-[#1e5442] hover:bg-[#173f35] text-white rounded-lg shadow-sm transition-colors border border-[#1e5442] focus:ring-2 focus:ring-[#c89b3c]"
              >
                {t("navigation.createAccount")}
              </button>
            </div>
          )}

          {/* Language Selector Dropdown — Positioned at FAR RIGHT of header */}
          <div className="hidden sm:block pl-2 border-l border-[#e4ded0]">
            <LanguageSelector hideLabel />
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-[#5c6e66] hover:text-[#173f35] hover:bg-[#f4f0e2] md:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e4ded0] bg-white px-4 py-4 space-y-3 text-xs font-bold uppercase tracking-wider">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-[#173f35]"
          >
            {t("navigation.home")}
          </Link>
          <Link
            href="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-[#173f35]"
          >
            {t("navigation.marketplace")}
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-[#173f35]"
          >
            {t("navigation.howItWorks")}
          </Link>
          <div className="pt-3 border-t border-[#e4ded0] flex items-center justify-end">
            <LanguageSelector hideLabel />
          </div>
        </div>
      )}
    </header>
  );
}

