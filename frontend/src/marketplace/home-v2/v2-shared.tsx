import type { PublicMarketplaceListing } from "../public-contracts";

/*
 * Homepage V2 design system (homepage-only, no shared styles touched).
 * Colours: paper #FAFAF7, ink #15211D, muted #5A6661, rule #E3E5E0, logo green #1E5442, logo gold #B8862F (sparingly).
 * Type scale: H1 40/52px, H2 28/34px, H3 19px, body 17px, small 15px, eyebrow 13px.
 */

export const V2_FIBRES = [
  { code: "FLAX", name: "Flax", image: "/images/home-v2/fibre-flax.jpg" },
  { code: "HEMP", name: "Hemp", image: "/images/home-v2/fibre-hemp.jpg" },
  { code: "SISAL", name: "Sisal", image: "/images/home-v2/fibre-sisal.jpg" },
  { code: "JUTE", name: "Jute", image: "/images/home-v2/fibre-jute.jpg" },
  { code: "COIR", name: "Coir", image: "/images/home-v2/fibre-coir.jpg" },
] as const;

export function v2ListingImage(listing: PublicMarketplaceListing): string {
  return listing.images?.[0] || V2_FIBRES.find((f) => f.code === listing.materialType)?.image || V2_FIBRES[0].image;
}

export function v2Price(listing: PublicMarketplaceListing, onRequest: string, unit: string): string {
  return listing.priceAmount !== null ? `€${listing.priceAmount.toLocaleString()} ${unit}` : onRequest;
}

export const v2Container = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
export const v2Section = "py-16 lg:py-20";
export const v2H2 = "text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.015em] text-[#15211D] lg:text-[2.125rem]";
export const v2Body = "text-[17px] leading-[1.65] text-[#5A6661]";

export function V2Eyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.12em] ${light ? "text-[#E9D5A8]" : "text-[#1E5442]"}`}>
      <span className={`h-px w-6 ${light ? "bg-[#E9D5A8]" : "bg-[#B8862F]"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

const btnBase =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E5442] focus-visible:ring-offset-2";
export const v2BtnPrimary = `${btnBase} bg-[#1E5442] text-white hover:bg-[#173F33]`;
export const v2BtnSecondary = `${btnBase} border border-[#C9CEC8] bg-white text-[#15211D] hover:border-[#15211D]`;
export const v2BtnOnDark = `${btnBase} bg-white text-[#15211D] hover:bg-[#F1EFE8]`;
export const v2BtnOnDarkOutline = `${btnBase} border border-white/40 text-white hover:border-white hover:bg-white/10`;
export const v2TextLink = "inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#1E5442] hover:underline underline-offset-4";
