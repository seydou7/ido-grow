"use client";

import { useState } from "react";
import { LanguageSelector } from "@/i18n/language-selector";

export type NavSection =
  | "overview"
  | "organisation"
  | "sites"
  | "compliance"
  | "members"
  | "listings"
  | "marketplace";

type AppShellProps = Readonly<{
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  userEmail: string;
  organisationType?: string;
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

function ClipboardCheckIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

function TagIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StoreIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 7h20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 7v5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 7v5" strokeLinecap="round" strokeLinejoin="round" />
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
  organisationType = "SUPPLIER",
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

  const isBuyer = organisationType.toUpperCase() === "BUYER";
  const isTrader = organisationType.toUpperCase() === "TRADER";

  const portalTitle = isBuyer
    ? "Buyer Portal"
    : isTrader
      ? "Trader Portal"
      : "Supplier Portal";

  const navigationItems = isBuyer
    ? [
        {
          id: "marketplace" as const,
          label: "Marketplace",
          sublabel: "Discover raw material supply",
          icon: StoreIcon,
        },
        {
          id: "organisation" as const,
          label: "Buyer Profile",
          sublabel: "Company details & verification",
          icon: BuildingIcon,
        },
        {
          id: "members" as const,
          label: "Team & Members",
          sublabel: "Organisation users & access",
          icon: UsersIcon,
        },
      ]
    : isTrader
      ? [
          {
            id: "marketplace" as const,
            label: "Marketplace",
            sublabel: "Browse & inspect supply",
            icon: StoreIcon,
          },
          {
            id: "overview" as const,
            label: "Onboarding Overview",
            sublabel: "Getting started & readiness",
            icon: ClipboardCheckIcon,
          },
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
          {
            id: "listings" as const,
            label: "Product Listings",
            sublabel: "Material inventory & offers",
            icon: TagIcon,
          },
        ]
      : [
          {
            id: "overview" as const,
            label: "Onboarding Overview",
            sublabel: "Getting started & readiness",
            icon: ClipboardCheckIcon,
          },
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
          {
            id: "listings" as const,
            label: "Product Listings",
            sublabel: "Material inventory & offers",
            icon: TagIcon,
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
            {portalTitle}
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

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e2d9c8] bg-[#fbf8ef]/95 px-4 backdrop-blur-md sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#e2d9c8] text-[#173f35] md:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>

            {/* Breadcrumb / Page Title */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#284f41]">
                {portalTitle}
              </p>
              <h1 className="text-base font-bold text-slate-800 sm:text-lg">
                {navigationItems.find((n) => n.id === activeSection)?.label ?? "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {verificationStatus && (
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {verificationStatus}
              </span>
            )}
            <LanguageSelector />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex w-4/5 max-w-xs flex-col bg-[#173f35] p-5 text-[#fffaf0]">
              <div className="flex items-center justify-between border-b border-[#245347] pb-4">
                <div className="flex items-center gap-2.5">
                  <BrandMark />
                  <span className="font-bold text-[#fffaf0]">I Do Grow</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  type="button"
                  className="rounded-lg p-1 text-[#d6deda] hover:bg-[#284f41]"
                >
                  <CloseIcon />
                </button>
              </div>

              <nav className="mt-4 flex-1 space-y-1">
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
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                        active
                          ? "bg-[#284f41] text-[#fffaf0]"
                          : "text-[#d6deda] hover:bg-[#204539]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-[#e5b84b]" : "text-[#a8bbb4]"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-[#245347] pt-4">
                <p className="text-xs font-semibold text-[#fffaf0]">{companyName}</p>
                <p className="text-[11px] text-[#a8bbb4]">{userEmail}</p>
                <button
                  onClick={onLogout}
                  type="button"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#204539] py-2 text-xs font-medium text-[#d6deda]"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
