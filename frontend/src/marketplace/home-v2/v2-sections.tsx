"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/i18n-provider";
import { formatMaterialType, formatOriginCountry, formatPriceUnit, formatQuantity } from "../formatters";
import type { PublicMarketplaceListing } from "../public-contracts";
import {
  V2_FIBRES,
  V2Eyebrow,
  v2Body,
  v2BtnOnDark,
  v2BtnOnDarkOutline,
  v2Container,
  v2H2,
  v2ListingImage,
  v2Price,
  v2Section,
  v2TextLink,
} from "./v2-shared";

type OnSell = (action?: string) => void;

/* Materials strip */
export function V2Fibres() {
  const { t } = useI18n();
  return (
    <section className="border-b border-[#E3E5E0] bg-white py-10">
      <div className={v2Container}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold text-[#15211D]">{t("home.v2.fibres.title")}</h2>
          <Link href="/marketplace" className={v2TextLink}>
            {t("home.v2.fibres.all")} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {V2_FIBRES.map((f) => (
            <li key={f.code}>
              <Link href="/marketplace" className="group flex items-center gap-3">
                <img src={f.image} alt="" loading="lazy" className="h-14 w-14 rounded-md object-cover" />
                <span className="text-[16px] font-medium text-[#15211D] group-hover:text-[#1E5442]">{f.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* How it works: image + numbered list */
export function V2How() {
  const { t } = useI18n();
  const steps = [1, 2, 3, 4].map((n) => ({
    title: t(`home.v2.how.s${n}.title` as "home.v2.how.s1.title"),
    body: t(`home.v2.how.s${n}.body` as "home.v2.how.s1.body"),
  }));
  return (
    <section className={`bg-[#FAFAF7] ${v2Section}`}>
      <div className={`${v2Container} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
        <img src="/images/home-v2/warehouse-inspection.jpg" alt="" loading="lazy" className="aspect-[5/4] w-full rounded-lg object-cover" />
        <div>
          <V2Eyebrow>{t("home.v2.how.eyebrow")}</V2Eyebrow>
          <h2 className={`mt-4 ${v2H2}`}>{t("home.v2.how.title")}</h2>
          <ol className="mt-8 divide-y divide-[#E3E5E0] border-y border-[#E3E5E0]">
            {steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-2 py-5">
                <span className="text-[15px] font-semibold text-[#B8862F]">0{i + 1}</span>
                <div>
                  <h3 className="text-[19px] font-semibold text-[#15211D]">{s.title}</h3>
                  <p className="mt-1 text-[16px] leading-relaxed text-[#5A6661]">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* Live lots as a clean list */
export function V2Lots({ listings = [] }: { listings?: readonly PublicMarketplaceListing[] }) {
  const { locale, t } = useI18n();
  return (
    <section className={`bg-white ${v2Section}`}>
      <div className={v2Container}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <V2Eyebrow>{t("home.v2.lots.eyebrow")}</V2Eyebrow>
            <h2 className={`mt-4 ${v2H2}`}>{t("home.v2.lots.title")}</h2>
          </div>
          <Link href="/marketplace" className={v2TextLink}>
            {t("home.v2.lots.all")} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className={`mt-8 ${v2Body}`}>{t("home.v2.lots.empty")}</p>
        ) : (
          <ul className="mt-8 divide-y divide-[#E3E5E0] border-y border-[#E3E5E0]">
            {listings.slice(0, 4).map((l) => (
              <li key={l.id}>
                <Link
                  href={`/marketplace/${encodeURIComponent(l.id)}`}
                  className="group grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[4.5rem_1.6fr_1fr_0.8fr_auto] sm:gap-6"
                >
                  <img src={v2ListingImage(l)} alt="" loading="lazy" className="h-16 w-16 rounded-md object-cover sm:h-[4.5rem] sm:w-[4.5rem]" />
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-semibold text-[#15211D] group-hover:text-[#1E5442]">{l.title}</p>
                    <p className="mt-0.5 text-[15px] text-[#5A6661]">
                      {formatMaterialType(l.materialType, locale)}
                      {l.supplier.isVerified ? <span className="ml-2 text-[#1E5442]">· {t("home.v2.lots.verified")}</span> : null}
                    </p>
                  </div>
                  <p className="hidden text-[15px] text-[#5A6661] sm:block">
                    {formatOriginCountry(l.originCountry, locale)} · {formatQuantity(l.quantity, l.quantityUnit, locale)}
                  </p>
                  <p className="hidden text-[16px] font-semibold text-[#15211D] sm:block">
                    {v2Price(l, t("home.v2.onRequest"), formatPriceUnit(l.priceUnit, locale))}
                  </p>
                  <span className="text-[#5A6661] transition-transform group-hover:translate-x-1 group-hover:text-[#1E5442]" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* Audiences: three photo columns, no boxes */
export function V2Who({ onSell }: { onSell: OnSell }) {
  const { t } = useI18n();
  const items = [
    { key: "producers", image: "/images/home-v2/producer-field.jpg", sell: true },
    { key: "industrial", image: "/images/home-v2/industrial-mill.jpg", sell: false },
    { key: "traders", image: "/images/home-v2/port-trade.jpg", sell: false },
  ] as const;
  return (
    <section className={`border-t border-[#E3E5E0] bg-[#FAFAF7] ${v2Section}`}>
      <div className={v2Container}>
        <V2Eyebrow>{t("home.v2.who.eyebrow")}</V2Eyebrow>
        <h2 className={`mt-4 max-w-2xl ${v2H2}`}>{t("home.v2.who.title")}</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {items.map((it) => {
            const title = t(`home.v2.who.${it.key}.title` as "home.v2.who.producers.title");
            const body = t(`home.v2.who.${it.key}.body` as "home.v2.who.producers.body");
            const cta = t(`home.v2.who.${it.key}.cta` as "home.v2.who.producers.cta");
            return (
              <article key={it.key}>
                <img src={it.image} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
                <h3 className="mt-5 text-[19px] font-semibold text-[#15211D]">{title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-[#5A6661]">{body}</p>
                {it.sell ? (
                  <button type="button" onClick={() => onSell()} className={`mt-4 ${v2TextLink}`}>
                    {cta} <span aria-hidden="true">&rarr;</span>
                  </button>
                ) : (
                  <Link href="/marketplace" className={`mt-4 ${v2TextLink}`}>
                    {cta} <span aria-hidden="true">&rarr;</span>
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Traceability and trust */
export function V2Trust() {
  const { t } = useI18n();
  const items = [1, 2, 3].map((n) => ({
    title: t(`home.v2.trust.i${n}.title` as "home.v2.trust.i1.title"),
    body: t(`home.v2.trust.i${n}.body` as "home.v2.trust.i1.body"),
  }));
  return (
    <section className={`bg-white ${v2Section}`}>
      <div className={`${v2Container} grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16`}>
        <div>
          <V2Eyebrow>{t("home.v2.trust.eyebrow")}</V2Eyebrow>
          <h2 className={`mt-4 ${v2H2}`}>{t("home.v2.trust.title")}</h2>
          <p className={`mt-4 max-w-lg ${v2Body}`}>{t("home.v2.trust.body")}</p>
        </div>
        <ul className="self-center divide-y divide-[#E3E5E0] border-y border-[#E3E5E0]">
          {items.map((it) => (
            <li key={it.title} className="flex gap-5 py-6">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0EC] text-[#1E5442]" aria-hidden="true">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8.5l3 3 7-7" />
                </svg>
              </span>
              <div>
                <h3 className="text-[19px] font-semibold text-[#15211D]">{it.title}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-[#5A6661]">{it.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Closing call to action */
export function V2Final({ onSell }: { onSell: OnSell }) {
  const { t } = useI18n();
  return (
    <section className="bg-[#1E5442] py-14">
      <div className={`${v2Container} flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.015em] text-white lg:text-[2rem]">{t("home.v2.final.title")}</h2>
          <p className="mt-3 text-[17px] text-white/80">{t("home.v2.final.body")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/marketplace" className={v2BtnOnDark}>
            {t("home.v2.hero.buy")}
          </Link>
          <button type="button" onClick={() => onSell()} className={v2BtnOnDarkOutline}>
            {t("home.v2.final.join")}
          </button>
        </div>
      </div>
    </section>
  );
}
