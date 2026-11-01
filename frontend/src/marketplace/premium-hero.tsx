"use client";

import { useI18n } from "@/i18n/i18n-provider";

export interface PremiumHeroProps {
  readonly searchInput: string;
  readonly onSearchChange: (value: string) => void;
  readonly onSearchSubmit: (e: React.FormEvent) => void;
  readonly onOpenCustomOrder?: () => void;
}

export function PremiumHero({
  searchInput,
  onSearchChange,
  onSearchSubmit,
  onOpenCustomOrder,
}: PremiumHeroProps) {
  const { t } = useI18n();

  const proofs = [
    t("marketplace.hero.proof1"),
    t("marketplace.hero.proof2"),
    t("marketplace.hero.proof3"),
    t("marketplace.hero.proof4"),
  ];

  return (
    <section className="bg-[#0d1d17] text-white border-b border-[#173f35]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Sourcing Pitch & Search Bar */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e2c98c]">
              {t("marketplace.hero.eyebrow")}
            </p>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-white leading-[1.08]">
              {t("marketplace.hero.title")}
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#c4dfd4] max-w-2xl leading-relaxed">
              {t("marketplace.hero.subtitle")}
            </p>

            {/* Sourcing Search Bar */}
            <form onSubmit={onSearchSubmit} className="mt-7 max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2 bg-white p-1.5 rounded-lg shadow-lg">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5c6e66]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t("marketplace.hero.searchPlaceholder")}
                    className="w-full pl-10 pr-4 py-3 bg-white text-[#173f35] rounded-md text-sm placeholder-[#6b7c74] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 bg-[#c89b3c] hover:bg-[#d8ad52] text-[#13352c] text-sm font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#173f35] shrink-0 cursor-pointer"
                >
                  {t("marketplace.hero.searchButton")}
                </button>
              </div>
            </form>

            {/* Secondary Custom Demand Trigger & Procurement Trust Strip */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
              <ul className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#d0e2da]">
                {proofs.map((proof) => (
                  <li key={proof} className="flex items-center gap-1.5">
                    <span className="text-[#e2c98c] font-bold" aria-hidden="true">
                      ✓
                    </span>
                    <span>{proof}</span>
                  </li>
                ))}
              </ul>

              {onOpenCustomOrder ? (
                <button
                  type="button"
                  onClick={onOpenCustomOrder}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e2c98c] hover:text-white underline-offset-4 hover:underline transition-colors cursor-pointer"
                >
                  <span>{t("marketplace.hero.customOrderCta")}</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Right Column: Tactile Warehouse Inspection Photograph */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative aspect-[5/4] rounded-sm overflow-hidden border border-white/15 bg-[#143a2f]">
              <img
                src="/images/home-v2/warehouse-inspection.jpg"
                alt={t("marketplace.hero.title")}
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d17]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <span className="text-white/95 font-semibold tracking-tight">
                  {t("marketplace.results.subtitle")}
                </span>
                <span className="px-2.5 py-1 rounded-sm bg-[#c89b3c] text-[#13352c] font-bold text-[11px] uppercase tracking-wider shrink-0 ml-3">
                  EU
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
