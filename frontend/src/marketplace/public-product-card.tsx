"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/i18n-provider";
import {
  formatMaterialType,
  formatOriginCountry,
  formatPriceUnit,
  formatProductForm,
  formatQuantity,
} from "./formatters";
import type { PublicMarketplaceListing } from "./public-contracts";

export interface PublicProductCardProps {
  readonly listing: PublicMarketplaceListing;
}

export function PublicProductCard({ listing }: PublicProductCardProps) {
  const { locale, t } = useI18n();
  const [imageError, setImageError] = useState(false);
  const rawImage = listing.images?.[0];

  const getCommodityImage = (material: string, form: string | null) => {
    const mat = (material || "").toUpperCase();
    const f = (form || "").toUpperCase();

    if (mat === "HEMP") {
      if (f.includes("FIBRE") || f.includes("TECHNICAL")) {
        return "/images/materials/hemp-technical-fibre-1.jpg";
      }
      return "/images/materials/hemp-retted-straw-1.jpg";
    }
    if (mat === "FLAX") {
      return "/images/materials/flax-scutched-1.jpg";
    }
    if (mat === "SISAL") {
      return "/images/materials/sisal-fibre-1.jpg";
    }
    if (mat === "JUTE") {
      return "/images/products/commodity-sacks.jpg";
    }
    if (mat === "COIR") {
      return "/images/materials/coir-fibre-1.jpg";
    }
    return "/images/products/commodity-bales.jpg";
  };

  const fallbackImage = getCommodityImage(listing.materialType, listing.productForm);
  const imageUrl = imageError || !rawImage ? fallbackImage : rawImage;

  const formattedMaterial = formatMaterialType(listing.materialType, locale);
  const formattedForm = formatProductForm(listing.productForm, locale);
  const formattedCountry = formatOriginCountry(listing.originCountry, locale);
  const formattedUnit = formatPriceUnit(listing.priceUnit, locale);

  const trustBadges: { label: string; kind: "dpp" | "quality" | "cert" }[] = [];
  if (listing.hasDpp) {
    trustBadges.push({ label: t("marketplace.card.dppBadge"), kind: "dpp" });
  }
  if (listing.quality.isApproved && trustBadges.length < 2) {
    trustBadges.push({ label: t("marketplace.card.qualityBadge"), kind: "quality" });
  } else if (listing.certifications.length > 0 && trustBadges.length < 2) {
    trustBadges.push({ label: t("marketplace.card.certBadge"), kind: "cert" });
  }

  const detailHref = `/marketplace/${encodeURIComponent(listing.id)}`;

  return (
    <article className="group bg-white rounded-md border border-[#ded8c4] hover:border-[#173f35] transition-colors duration-200 flex flex-col h-full overflow-hidden focus-within:ring-2 focus-within:ring-[#173f35]">
      {/* 1. VISUAL LOT AREA — Zero hover scale on img per Impeccable rules */}
      <Link href={detailHref} className="relative aspect-[16/10] bg-[#ece6d6] block overflow-hidden">
        <img
          src={imageUrl}
          alt={`${formattedMaterial} — ${listing.title}`}
          onError={() => setImageError(true)}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Origin pill */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/95 text-[#173f35] rounded-sm border border-[#e4ded0]">
            {formattedCountry}
          </span>
        </div>

        {/* Bottom verification badges */}
        {trustBadges.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
            {trustBadges.map((badge) => (
              <span
                key={badge.label}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs ${
                  badge.kind === "dpp"
                    ? "bg-[#0d1d17]/95 text-[#e2c98c] border border-[#c89b3c]/50"
                    : badge.kind === "quality"
                      ? "bg-[#173f35]/95 text-white border border-white/20"
                      : "bg-[#faf8f1]/95 text-[#173f35] border border-[#ded8c4]"
                }`}
              >
                {badge.kind === "dpp" ? "● " : badge.kind === "quality" ? "✓ " : ""}
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* 2. STRUCTURED B2B SPECIFICATION AREA */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Eyebrow: Material · Form & Harvest Year */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a6a22]">
            <span className="truncate">
              {formattedMaterial} · {formattedForm}
            </span>
            {listing.harvestYear ? (
              <span className="text-[#5c6e66] shrink-0 tabular-nums">
                {t("marketplace.card.harvest")} {listing.harvestYear}
              </span>
            ) : null}
          </div>

          {/* Product Name / Title */}
          <h3 className="mt-2 text-base sm:text-lg font-bold tracking-tight text-[#173f35] line-clamp-2 leading-snug group-hover:text-[#1e5442] transition-colors">
            <Link href={detailHref} className="focus:outline-none">
              {listing.title}
            </Link>
          </h3>
        </div>

        {/* Volume & Price Ledger */}
        <div className="pt-3.5 border-t border-[#e4ded0] grid grid-cols-2 gap-3 items-end">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#5c6e66] mb-1">
              {t("marketplace.card.volume")}
            </span>
            <span className="text-base font-bold tabular-nums text-[#173f35] leading-none">
              {formatQuantity(listing.quantity, listing.quantityUnit, locale)}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#5c6e66] mb-1">
              {t("marketplace.card.price")}
            </span>
            {listing.priceAmount !== null ? (
              <div className="text-base font-bold tabular-nums text-[#173f35] leading-none">
                €{listing.priceAmount.toLocaleString(locale === "fr" ? "fr-FR" : locale === "nl" ? "nl-NL" : "en-GB")}
                <span className="text-[11px] font-normal text-[#5c6e66] ml-1">
                  {formattedUnit}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-[#5c6e66]">
                {t("marketplace.card.onRequest")}
              </span>
            )}
          </div>
        </div>

        {/* Action Link */}
        <div className="pt-1">
          <Link
            href={detailHref}
            className="w-full inline-flex items-center justify-between py-2.5 px-3.5 text-xs font-bold rounded-sm border border-[#d8d1bd] text-[#173f35] bg-[#faf8f1] group-hover:bg-[#173f35] group-hover:text-white group-hover:border-[#173f35] transition-colors duration-150"
          >
            <span>{t("marketplace.card.viewSpecs")}</span>
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
