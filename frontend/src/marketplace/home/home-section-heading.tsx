import type { ReactNode } from "react";

export interface HomeSectionHeadingProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly tone?: "light" | "dark";
  readonly aside?: ReactNode;
}

/** Shared heading style for homepage sections only. */
export function HomeSectionHeading({ eyebrow, title, tone = "light", aside }: HomeSectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-[#e2c98c]" : "text-[#8a6a22]"}`}>
          {eyebrow}
        </p>
        <h2
          className={`mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-[-0.025em] ${dark ? "text-white" : "text-[#173f35]"}`}
        >
          {title}
        </h2>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
