"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/i18n-provider";

export interface HomeHeroProps {
  readonly onBecomeSupplier: (action?: string) => void;
}

export function HomeHero({ onBecomeSupplier }: HomeHeroProps) {
  const { t } = useI18n();

  return (
    <section className="relative min-h-[620px] lg:min-h-[720px] flex items-end bg-[#0d1d17] text-white overflow-hidden">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <video
          ref={(el) => {
            if (el) {
              el.muted = true;
              el.defaultMuted = true;
              el.play().catch(() => {});
            }
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/media/hero-video-poster.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/media/hero-section.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1d17]/90 via-[#0d1d17]/45 to-[#0d1d17]/20" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 lg:pb-28 pt-40">
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#e2c98c]">
            {t("home.hero.eyebrow")}
          </p>
          <h1 className="mt-6 text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-white">
            {t("home.hero.headline")}
          </h1>
          <p className="mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-[#dbe7e1]">
            {t("home.hero.description")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c89b3c] px-7 py-4 text-sm font-bold text-[#13352c] transition-colors hover:bg-[#d8ad52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2c98c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1d17]"
            >
              {t("home.cta.exploreMarketplace")}
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <button
              type="button"
              onClick={() => onBecomeSupplier()}
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {t("home.cta.becomeSupplier")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
