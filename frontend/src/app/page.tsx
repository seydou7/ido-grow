import type { Metadata } from "next";
import { Suspense } from "react";
import { HomepageView } from "@/marketplace/homepage-view";

export const metadata: Metadata = {
  title: "I Do Grow | European Natural Agricultural Commodities Exchange",
  description:
    "The institutional B2B platform for traceable European agricultural raw materials — connecting certified agricultural cooperatives with industrial manufacturers through structured trading, quality grading, and Digital Product Passports.",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
  },
  openGraph: {
    title: "I Do Grow — European Natural Commodities Exchange",
    description: "Traceable European agricultural commodities, quality verified and DPP-enabled.",
    type: "website",
  },
};

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f1] flex items-center justify-center p-8 text-[#173f35]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#1e5442] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading I Do Grow...</p>
          </div>
        </div>
      }
    >
      <HomepageView />
    </Suspense>
  );
}
