"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/i18n-provider";
import { HomeSectionHeading } from "./home-section-heading";

export interface HomeAudiencesProps {
  readonly onBecomeSupplier: (action?: string) => void;
}

export function HomeAudiences({ onBecomeSupplier }: HomeAudiencesProps) {
  const { t } = useI18n();

  const audiences = [
    {
      key: "producers",
      image: "/images/actor_producer_field.png",
      title: t("home.audience.producers.title"),
      body: t("home.audience.producers.body"),
      link: t("home.audience.producers.link"),
      href: null,
    },
    {
      key: "traders",
      image: "/images/trader_platform.png",
      title: t("home.audience.traders.title"),
      body: t("home.audience.traders.body"),
      link: t("home.audience.traders.link"),
      href: "/marketplace",
    },
    {
      key: "industrial",
      image: "/images/b2b_team.png",
      title: t("home.audience.industrial.title"),
      body: t("home.audience.industrial.body"),
      link: t("home.audience.industrial.link"),
      href: "/marketplace",
    },
  ] as const;

  const linkClass =
    "mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1e5442] underline-offset-4 hover:underline";

  return (
    <section id="who-its-for" className="bg-[#faf8f1] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <HomeSectionHeading eyebrow={t("home.audience.eyebrow")} title={t("home.audience.title")} />

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {audiences.map((a) => (
            <article key={a.key}>
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-[#ece6d6]">
                <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-[#173f35]">{a.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#4f625a]">{a.body}</p>
              {a.href ? (
                <Link href={a.href} className={linkClass}>
                  {a.link} <span aria-hidden="true">&rarr;</span>
                </Link>
              ) : (
                <button type="button" onClick={() => onBecomeSupplier()} className={linkClass}>
                  {a.link} <span aria-hidden="true">&rarr;</span>
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
