"use client";

import { useI18n } from "@/i18n/i18n-provider";
import { HomeSectionHeading } from "./home-section-heading";

export function HomeChain() {
  const { t } = useI18n();

  const stages = [
    { image: "/images/actor_producer_field.png", title: t("home.chain.farm.title"), body: t("home.chain.farm.body") },
    { image: "/images/warehouse_commodity.png", title: t("home.chain.factory.title"), body: t("home.chain.factory.body") },
    { image: "/images/home/natural-fibre-textile.jpg", title: t("home.chain.shelf.title"), body: t("home.chain.shelf.body") },
  ];

  return (
    <section id="farm-to-shelf" className="bg-[#faf8f1] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <HomeSectionHeading eyebrow={t("home.chain.eyebrow")} title={t("home.chain.title")} />

        <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-6">
          {stages.map((stage, index) => (
            <li key={stage.title}>
              <div className="aspect-[3/4] overflow-hidden rounded-sm bg-[#ece6d6]">
                <img src={stage.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-sm font-semibold tabular-nums text-[#8a6a22]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-[#173f35]">{stage.title}</h3>
              </div>
              <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#4f625a]">{stage.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-16 max-w-2xl border-l-2 border-[#c89b3c] pl-5 text-[15px] leading-relaxed text-[#4f625a]">
          {t("home.chain.techNote")}
        </p>
      </div>
    </section>
  );
}
