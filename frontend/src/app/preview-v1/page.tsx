import type { Metadata } from "next";
import { Suspense } from "react";
import { HomepageV1View } from "@/marketplace/homepage-v1-view";

export const metadata: Metadata = {
  title: "I Do Grow | Preview Homepage V1",
  description: "Preview of Homepage Proposal V1 — European Natural Agricultural Commodities Exchange.",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
  },
  robots: { index: false, follow: false },
};

export default function PreviewV1() {
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
      <HomepageV1View />
    </Suspense>
  );
}

