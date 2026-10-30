"use client";

import { useI18n } from "@/i18n/i18n-provider";

export function HomeTrust() {
  const { t } = useI18n();

  const points = [
    { title: t("home.trust.suppliers.title"), body: t("home.trust.suppliers.body") },
    { title: t("home.trust.quality.title"), body: t("home.trust.quality.body") },
    { title: t("home.trust.traceability.title"), body: t("home.trust.traceability.body") },
    { title: t("home.trust.logistics.title"), body: t("home.trust.logistics.body") },
    { title: t("home.trust.documentation.title"), body: t("home.trust.documentation.body") },
  ];

  return (
    <section id="trust" className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid gap-14 lg:grid-cols-2 lg:gap-20 items-start">
        <div className="lg:sticky lg:top-28">
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-[#ece6d6]">
            <img src="/images/quality_lab.png" alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6a22]">{t("home.trust.eyebrow")}</p>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-[-0.025em] text-[#173f35]">
            {t("home.trust.title")}
          </h2>

          <dl className="mt-12 divide-y divide-[#e4ded0] border-y border-[#e4ded0]">
            {points.map((p) => (
              <div key={p.title} className="grid gap-2 py-7 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
                <dt className="text-lg font-bold tracking-tight text-[#173f35]">{p.title}</dt>
                <dd className="text-[15px] leading-relaxed text-[#4f625a]">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
