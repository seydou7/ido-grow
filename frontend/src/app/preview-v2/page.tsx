import type { Metadata } from "next";
import { Suspense } from "react";
import { HomepageV2View } from "@/marketplace/homepage-v2-view";

export const metadata: Metadata = {
  title: "I Do Grow | Preview Homepage V2",
  description: "Preview of Homepage Proposal V2 — Buy and sell natural fibres you can trust.",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
  },
  robots: { index: false, follow: false },
};

export default function PreviewV2() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-8 text-[#15211D]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#1e5442] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading I Do Grow...</p>
          </div>
        </div>
      }
    >
      <HomepageV2View />
    </Suspense>
  );
}

