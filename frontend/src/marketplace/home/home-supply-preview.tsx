"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/i18n-provider";
import { formatMaterialType, formatOriginCountry, formatPriceUnit, formatProductForm, formatQuantity } from "../formatters";
import type { PublicMarketplaceListing } from "../public-contracts";
import { HomeSectionHeading } from "./home-section-heading";

// Same fallback images the previous homepage used for listings without photos.
const MATERIAL_IMAGES: Record<string, string> = {
  HEMP: "/images/materials/hemp-fibre-1.jpg",
  FLAX: "/images/materials/flax-scutched-1.jpg",
  SISAL: "/images/materials/sisal-fibre-1.jpg",
  JUTE: "/images/materials/jute-fibre-1.jpg",
  COIR: "/images/materials/coir-fibre-1.jpg",
};
const DEFAULT_IMAGE = "/images/products/commodity-bales.jpg";

export interface HomeSupplyPreviewProps {
  readonly listings: readonly PublicMarketplaceListing[];
  readonly loading: boolean;
}

export function HomeSupplyPreview({ listings, loading }: HomeSupplyPreviewProps) {
  const { locale, t } = useI18n();

  const seeAll = (
    <Link
      href="/marketplace"
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e5442] underline-offset-4 hover:underline"
    >
      {t("home.supply.seeAll")} <span aria-hidden="true">&rarr;</span>
    </Link>
  );

  return (
    <section id="supply" className="bg-[#faf8f1] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <HomeSectionHeading eyebrow={t("home.supply.eyebrow")} title={t("home.supply.title")} aside={seeAll} />

        {loading ? (
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 animate-pulse" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-sm bg-[#ece6d6]" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {listings.slice(0, 4).map((listing) => {
              const imageUrl = listing.images?.[0] || MATERIAL_IMAGES[listing.materialType] || DEFAULT_IMAGE;
              const href = `/marketplace/${encodeURIComponent(listing.id)}`;
              return (
                <article key={listing.id} className="group">
                  <Link href={href} className="block">
                    <div className="aspect-[4/3] overflow-hidden rounded-sm bg-[#ece6d6] border border-transparent group-hover:border-[#173f35] transition-colors">
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a22]">
                      {formatMaterialType(listing.materialType, locale)} · {formatOriginCountry(listing.originCountry, locale)}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-[#173f35] line-clamp-2 group-hover:text-[#1e5442]">
                      {listing.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-sm text-[#5c6e66]">
                    {formatProductForm(listing.productForm, locale)} · {formatQuantity(listing.quantity, listing.quantityUnit, locale)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#173f35]">
                    {listing.priceAmount !== null
                      ? `€${listing.priceAmount.toLocaleString(locale === "fr" ? "fr-FR" : locale === "nl" ? "nl-NL" : "en-GB")} ${formatPriceUnit(listing.priceUnit, locale)}`
                      : t("home.supply.onRequest")}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-14 max-w-xl text-[15px] leading-relaxed text-[#4f625a]">{t("home.supply.empty")}</p>
        )}
      </div>
    </section>
  );
}
