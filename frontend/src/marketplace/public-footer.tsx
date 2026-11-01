"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/i18n-provider";

export function PublicFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-[#0d1d17] text-[#e8f1ec] border-t border-[#1e5442]/40 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-block hover:opacity-90 transition-opacity"
              aria-label="I Do Grow"
            >
              <div className="bg-white/95 px-3 py-1.5 rounded-lg inline-block">
                <img
                  src="/images/Logo IDoGrow principale.png"
                  alt="I Do Grow"
                  loading="lazy"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-[#b8d4c7] max-w-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-2.5 text-xs pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-[#173f35] border border-[#256852] text-[11px] font-semibold text-[#e2c98c]">
                EU DPP Ready
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-[#173f35] border border-[#256852] text-[11px] font-semibold text-white">
                CSRD Aligned
              </span>
            </div>
          </div>

          {/* Sourcing & Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e2c98c]">
              {t("footer.col.marketplace")}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#b8d4c7]">
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  {t("footer.link.allMaterials")}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?materialType=HEMP"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.link.hemp")}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?materialType=FLAX"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.link.flax")}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?materialType=SISAL"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.link.sisal")}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?materialType=JUTE"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.link.jute")}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?materialType=COIR"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.link.coir")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e2c98c]">
              {t("footer.col.platform")}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#b8d4c7]">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  {t("navigation.howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#actor-view"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.link.ecosystem")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#dpp-lifecycle"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.link.traceability")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#quality-contract"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.link.quality")}
                </Link>
              </li>
              <li>
                <Link href="/#trust" className="hover:text-white transition-colors">
                  {t("footer.link.benefits")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e2c98c]">
              {t("footer.col.portals")}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#b8d4c7]">
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  {t("footer.link.portalAccess")}
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  {t("footer.link.buyerDesk")}
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  {t("footer.link.producerCockpit")}
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  {t("footer.link.inspectorDesk")}
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  {t("footer.link.traderCockpit")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8daea0] gap-4">
          <p>
            © {new Date().getFullYear()} I Do Grow SAS. {t("footer.rights")}
          </p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-white transition-colors cursor-pointer">
              {t("footer.terms")}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {t("footer.privacy")}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {t("footer.traceabilityPolicy")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
