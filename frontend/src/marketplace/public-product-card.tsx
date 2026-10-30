"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [imageError, setImageError] = useState(false);
  const rawImage = listing.images?.[0];

  // Map to realistic commodity bulk lots (bales, sacks, prepared warehouse lots)
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

  const formattedMaterial = formatMaterialType(listing.materialType);
  const formattedForm = formatProductForm(listing.productForm);
  const formattedCountry = formatOriginCountry(listing.originCountry);
  const formattedUnit = formatPriceUnit(listing.priceUnit);

  // Maximum 2 visible trust badges
  const trustBadges: { label: string; kind: "dpp" | "quality" | "cert" }[] = [];
  if (listing.hasDpp) {
    trustBadges.push({ label: "DPP Traceable", kind: "dpp" });
  }
  if (listing.quality.isApproved && trustBadges.length < 2) {
    trustBadges.push({ label: "Quality Verified", kind: "quality" });
  } else if (listing.certifications.length > 0 && trustBadges.length < 2) {
    trustBadges.push({ label: "Certified", kind: "cert" });
  }

  return (
    <article className="group bg-white rounded-2xl border border-[#ded8c4] hover:border-[#173f35] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden focus-within:ring-2 focus-within:ring-[#173f35]">
      {/* 1. VISUAL PRODUCT AREA (50-55% of card height) */}
      <div className="relative aspect-[16/10] bg-[#f4f0e2] overflow-hidden">
        <img
          src={imageUrl}
          alt={`${formattedMaterial} - ${listing.title}`}
          onError={() => setImageError(true)}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Subtle contrast gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges: Material & Origin */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-2.5 py-1 text-xs font-bold tracking-wider uppercase bg-[#173f35]/95 text-[#fbf8ee] rounded-md shadow-sm border border-white/10 backdrop-blur-xs">
            {formattedMaterial}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-white/95 text-[#173f35] rounded-md shadow-sm border border-[#e4decb] backdrop-blur-xs">
            {formattedCountry}
          </span>
        </div>

        {/* Bottom Image Badges: Maximum 2 visible trust badges */}
        {trustBadges.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
            {trustBadges.map((badge) => (
              <span
                key={badge.label}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded shadow-xs ${
                  badge.kind === "dpp"
                    ? "bg-[#173f35]/95 text-[#fbf8ee] border border-[#c89b3c]/50"
                    : badge.kind === "quality"
                      ? "bg-[#1e5442]/95 text-white border border-[#4ade80]/30"
                      : "bg-[#f4f0e2]/95 text-[#173f35] border border-[#d8d1bd]"
                }`}
              >
                {badge.kind === "dpp" ? "● " : badge.kind === "quality" ? "✓ " : ""}
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. STRUCTURED CONTENT AREA */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Form & Harvest Year */}
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#7d8f85] mb-1.5">
            <span className="text-[#2d5246]">{formattedForm}</span>
            {listing.harvestYear ? (
              <span className="text-[#96a69d]">Harvest {listing.harvestYear}</span>
            ) : null}
          </div>

          {/* Product Name / Title */}
          <h3 className="text-sm sm:text-base font-extrabold text-[#173f35] line-clamp-2 leading-snug group-hover:text-[#1e5442] transition-colors">
            <Link
              href={`/marketplace/${encodeURIComponent(listing.id)}`}
              className="focus:outline-none"
            >
              {listing.title}
            </Link>
          </h3>
        </div>

        {/* Volume & Price Hierarchy */}
        <div className="pt-3 border-t border-[#ede7d8] flex items-end justify-between gap-2">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7d8f85] mb-0.5">
              Available Volume
            </span>
            <span className="text-base sm:text-lg font-black text-[#173f35] leading-none">
              {formatQuantity(listing.quantity, listing.quantityUnit)}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7d8f85] mb-0.5">
              Indicative Price
            </span>
            {listing.priceAmount !== null ? (
              <div className="text-base sm:text-lg font-black text-[#1e5442] leading-none">
                €{listing.priceAmount.toLocaleString()}
                <span className="text-[11px] font-medium text-[#5c6e66] ml-1">
                  {formattedUnit}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-[#5c6e66] italic">
                Quote on request
              </span>
            )}
          </div>
        </div>

        {/* Refined Card CTA */}
        <div className="pt-1">
          <Link
            href={`/marketplace/${encodeURIComponent(listing.id)}`}
            className="w-full inline-flex items-center justify-between py-2 px-3.5 text-xs font-bold rounded-lg border border-[#c8c0aa] text-[#173f35] bg-[#faf8f1] group-hover:bg-[#173f35] group-hover:text-white group-hover:border-[#173f35] transition-all duration-200"
          >
            <span>View Specifications</span>
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
