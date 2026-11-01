import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicMarketplaceView } from "@/marketplace/public-marketplace-view";

export const metadata: Metadata = {
  title: "Natural Fibres & Commodity Marketplace | I Do Grow",
  description:
    "Browse traceable European hemp, flax, and natural raw materials. Connect directly with certified producers and access verified quality and Digital Product Passports.",
  openGraph: {
    title: "I Do Grow — Public Natural Fibres Marketplace",
    description: "Traceable European natural fibre commodities, quality verified and DPP-enabled.",
    type: "website",
  },
};

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f1] flex items-center justify-center p-8 text-[#173f35]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#1e5442] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading Marketplace Catalogue...</p>
          </div>
        </div>
      }
    >
      <PublicMarketplaceView />
    </Suspense>
  );
}
