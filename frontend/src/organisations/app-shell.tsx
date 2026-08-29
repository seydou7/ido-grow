"use client";

import { useState } from "react";
import { LanguageSelector } from "@/i18n/language-selector";

export type NavSection = "organisation" | "sites" | "compliance" | "members";

type AppShellProps = Readonly<{
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  userEmail: string;
  companyName?: string;
  verificationStatus?: string;
  onLogout: () => void;
  isLoggingOut: boolean;
  children: React.ReactNode;
}>;

function BrandMark() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e5b84b] text-[#173f35] shadow-sm">
      <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
        <path
          d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <path
          d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4M5 21h14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </svg>
    </div>
  );
}

function BuildingIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SproutIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M7 20h10M12 20v-8M12 12a5 5 0 0 1 5-5h2a5 5 0 0 1-5 5M12 12a5 5 0 0 0-5-5H5a5 5 0 0 0 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentCheckIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ className = "h-5 w-5" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AuthenticatedAppShell({
  activeSection,
  onSelectSection,
  userEmail,
  companyName,
  verificationStatus,
  onLogout,
  isLoggingOut,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : "ID";

  const navigationItems = [
    {
      id: "organisation" as const,
      label: "Organisation Profile",
      sublabel: "Company details & legal identity",
      icon: BuildingIcon,
    },
    {
      id: "sites" as const,
      label: "Production Sites",
      sublabel: "Farms, parcels & facilities",
      icon: SproutIcon,
    },
    {
      id: "compliance" as const,
      label: "Compliance & Documents",
      sublabel: "Certificates & registry evidence",
      icon: DocumentCheckIcon,
    },
    {
      id: "members" as const,
      label: "Team & Members",
      sublabel: "Organisation users & access",
      icon: UsersIcon,
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#faf8f1] font-sans antialiased">
      {/* Desktop Persistent Left Sidebar (256px) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#245347] bg-[#173f35] text-[#fffaf0] md:flex">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-[#245347] px-5">
          <BrandMark />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-[#fffaf0]">I Do Grow</p>
            <p className="text-[10px] uppercase tracking-widest text-[#a8bbb4]">
              Natural Fibres
            </p>
          </div>
        </div>

        {/* Space Context Label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#e5b84b]">
            Supplier Portal
          </p>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-2">
          {navigationItems.map((item) => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                type="button"
                className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                  active
                    ? "bg-[#284f41] text-[#fffaf0] shadow-sm ring-1 ring-white/10"
                    : "text-[#d6deda] hover:bg-[#204539] hover:text-[#fffaf0]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-[#e5b84b]" : "text-[#a8bbb4] group-hover:text-[#fffaf0]"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.label}</p>
                </div>
                {active && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5b84b]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Account / Sign Out Footer */}
        <div className="border-t border-[#245347] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#284f41] text-xs font-bold text-[#e5b84b]">
              {initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-[#fffaf0]">
                {companyName || userEmail}
              </p>
              <p className="truncate text-[11px] text-[#a8bbb4]">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#245347] bg-[#204539] py-1.5 text-xs font-medium text-[#d6deda] transition-all hover:border-[#e5b84b]/40 hover:bg-[#284f41] hover:text-[#fffaf0] disabled:opacity-50"
            type="button"
          >
            <LogoutIcon className="h-3.5 w-3.5" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          type="button"
          aria-label="Close menu"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#173f35] text-[#fffaf0] transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#245347] px-5">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-[#fffaf0]">I Do Grow</p>
              <p className="text-[10px] uppercase tracking-widest text-[#a8bbb4]">
                Natural Fibres
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1 text-[#a8bbb4] hover:bg-[#204539] hover:text-[#fffaf0]"
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#e5b84b]">
            Supplier Portal
          </p>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-2">
          {navigationItems.map((item) => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  setMobileMenuOpen(false);
                }}
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                  active
                    ? "bg-[#284f41] text-[#fffaf0] shadow-sm"
                    : "text-[#d6deda] hover:bg-[#204539] hover:text-[#fffaf0]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#e5b84b]" : "text-[#a8bbb4]"}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-[#e5b84b]" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#245347] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#284f41] text-xs font-bold text-[#e5b84b]">
              {initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-[#fffaf0]">
                {companyName || userEmail}
              </p>
              <p className="truncate text-[11px] text-[#a8bbb4]">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#245347] bg-[#204539] py-1.5 text-xs font-medium text-[#d6deda] hover:bg-[#284f41] hover:text-[#fffaf0]"
            type="button"
          >
            <LogoutIcon className="h-3.5 w-3.5" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Clean Authenticated Header (ONE single LanguageSelector) */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#e2dccd] bg-[#faf8f1]/90 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-[#d4cdbc] p-2 text-[#203e35] hover:bg-[#eee9dc] md:hidden"
              type="button"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-[#6e7d77]">
              <span className="hidden sm:inline">Supplier Portal</span>
              <span className="hidden sm:inline">/</span>
              <span className="font-semibold text-[#203e35]">
                {activeSection === "organisation"
                  ? "Organisation Profile"
                  : activeSection === "sites"
                  ? "Production Sites"
                  : activeSection === "compliance"
                  ? "Compliance & Documents"
                  : "Team & Members"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {verificationStatus && (
              <span
                className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${
                  verificationStatus === "VERIFIED"
                    ? "bg-[#e2f3ea] text-[#1b6b47]"
                    : verificationStatus === "UNDER_REVIEW"
                    ? "bg-[#eaf1fb] text-[#1e58a9]"
                    : "bg-[#fef4dd] text-[#875908]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    verificationStatus === "VERIFIED"
                      ? "bg-[#1b6b47]"
                      : verificationStatus === "UNDER_REVIEW"
                      ? "bg-[#1e58a9]"
                      : "bg-[#875908]"
                  }`}
                />
                {verificationStatus === "PENDING" ? "Pending Verification" : verificationStatus}
              </span>
            )}
            <LanguageSelector />
          </div>
        </header>

        {/* Content Container (Full Width with max-w-7xl) */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
