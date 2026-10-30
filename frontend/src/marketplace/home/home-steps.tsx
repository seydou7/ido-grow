"use client";

import { useI18n } from "@/i18n/i18n-provider";
import { HomeSectionHeading } from "./home-section-heading";

export function HomeSteps() {
  const { t } = useI18n();

  const steps = [
    { title: t("home.steps.source.title"), body: t("home.steps.source.body") },
    { title: t("home.steps.verify.title"), body: t("home.steps.verify.body") },
    { title: t("home.steps.trade.title"), body: t("home.steps.trade.body") },
    { title: t("home.steps.deliver.title"), body: t("home.steps.deliver.body") },
  ];

  return (
    <section id="how-it-works" className="bg-[#f2eddf] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <HomeSectionHeading eyebrow={t("home.steps.eyebrow")} title={t("home.steps.title")} />

        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-[#173f35]/25 pt-6">
              <span className="text-sm font-semibold tabular-nums text-[#8a6a22]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#173f35]">
                {step.title}
                {index < steps.length - 1 ? (
                  <span aria-hidden="true" className="ml-3 hidden text-[#173f35]/30 lg:inline">
                    &rarr;
                  </span>
                ) : null}
              </h3>
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-[#4f625a]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
