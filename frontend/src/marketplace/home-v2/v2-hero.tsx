"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/i18n-provider";
import { V2Eyebrow, v2BtnPrimary, v2BtnSecondary, v2Container } from "./v2-shared";

export interface V2HeroProps {
  readonly onSell: (action?: string) => void;
}

export function V2Hero({ onSell }: V2HeroProps) {
  const { t } = useI18n();
  const proofs = [t("home.v2.hero.p1"), t("home.v2.hero.p2"), t("home.v2.hero.p3")];

  return (
    <section className="border-b border-[#E3E5E0] bg-[#FAFAF7]">
      <div className={`${v2Container} grid items-center gap-10 py-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-16`}>
        <div>
          <V2Eyebrow>{t("home.v2.hero.eyebrow")}</V2Eyebrow>
          <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] text-[#15211D] lg:text-[3.25rem]">
            {t("home.v2.hero.headline")}
          </h1>
          <p className="mt-5 max-w-xl text-[18px] leading-[1.65] text-[#5A6661]">{t("home.v2.hero.description")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/marketplace" className={v2BtnPrimary}>
              {t("home.v2.hero.buy")} <span aria-hidden="true">&rarr;</span>
            </Link>
            <button type="button" onClick={() => onSell()} className={v2BtnSecondary}>
              {t("home.v2.hero.sell")}
            </button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#E3E5E0] pt-6">
            {proofs.map((p) => (
              <li key={p} className="flex items-center gap-2 text-[15px] font-medium text-[#15211D]">
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-[#1E5442]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 8.5l3 3 7-7" />
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-[#15211D]">
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
            className="aspect-[4/3] h-full w-full object-cover"
            aria-hidden="true"
          >
            <source src="/media/hero-section.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
