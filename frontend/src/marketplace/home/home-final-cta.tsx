"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/i18n-provider";

export interface HomeFinalCtaProps {
  readonly onJoin: (action?: string) => void;
}

export function HomeFinalCta({ onJoin }: HomeFinalCtaProps) {
  const { t } = useI18n();

  return (
    <section className="bg-[#143a2f] text-white py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-[-0.03em] text-white">
          {t("home.final.title")}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#c4dfd4]">{t("home.final.body")}</p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c89b3c] px-7 py-4 text-sm font-bold text-[#13352c] transition-colors hover:bg-[#d8ad52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2c98c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#143a2f]"
          >
            {t("home.cta.exploreMarketplace")}
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <button
            type="button"
            onClick={() => onJoin()}
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {t("home.cta.join")}
          </button>
        </div>
      </div>
    </section>
  );
}
