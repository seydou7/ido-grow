import type { Metadata } from "next";
import { Suspense } from "react";
import { HowItWorksView } from "@/marketplace/how-it-works-view";

export const metadata: Metadata = {
  title: "How It Works | I Do Grow",
  description:
    "Explore the I Do Grow commercial framework: 6-stage sourcing pathway, accredited lab testing, versioned RFQ negotiation, standardized Incoterms contracts, and Digital Product Passports.",
  openGraph: {
    title: "I Do Grow — How It Works",
    description: "End-to-end B2B natural commodity sourcing from certified field to industrial dock.",
    type: "website",
  },
};

export default function HowItWorksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f1] flex items-center justify-center p-8 text-[#173f35]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#1e5442] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading How It Works...</p>
          </div>
        </div>
      }
    >
      <HowItWorksView />
    </Suspense>
  );
}
