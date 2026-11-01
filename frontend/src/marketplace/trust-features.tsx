"use client";

import { useI18n } from "@/i18n/i18n-provider";

export function TrustFeatures() {
  const { t } = useI18n();

  const features = [
    {
      title: t("marketplace.trust.f1.title"),
      description: t("marketplace.trust.f1.body"),
    },
    {
      title: t("marketplace.trust.f2.title"),
      description: t("marketplace.trust.f2.body"),
    },
    {
      title: t("marketplace.trust.f3.title"),
      description: t("marketplace.trust.f3.body"),
    },
    {
      title: t("marketplace.trust.f4.title"),
      description: t("marketplace.trust.f4.body"),
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#f2eddf] border-t border-[#e4ded0]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6a22]">
            {t("marketplace.trust.eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#173f35] leading-[1.1]">
            {t("marketplace.trust.title")}
          </h2>
          <p className="mt-3 text-[15px] text-[#4f625a] leading-relaxed">
            {t("marketplace.trust.subtitle")}
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {features.map((feat, index) => (
            <li key={feat.title} className="border-t border-[#173f35]/25 pt-6">
              <span className="text-xs font-semibold tabular-nums text-[#8a6a22]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-[#173f35]">
                {feat.title}
              </h3>
              <p className="mt-2.5 text-sm text-[#4f625a] leading-relaxed">
                {feat.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
