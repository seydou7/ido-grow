"use client";

import { useEffect, useState } from "react";
import { AuthGateModal } from "./auth-gate-modal";
import { HomeAudiences } from "./home/home-audiences";
import { HomeChain } from "./home/home-chain";
import { HomeFinalCta } from "./home/home-final-cta";
import { HomeHero } from "./home/home-hero";
import { HomeSteps } from "./home/home-steps";
import { HomeSupplyPreview } from "./home/home-supply-preview";
import { HomeTrust } from "./home/home-trust";
import { fetchPublicListings } from "./public-api";
import type { PublicMarketplaceListing } from "./public-contracts";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

export function HomepageV1View() {
  const [featuredListings, setFeaturedListings] = useState<readonly PublicMarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("Platform Access");

  useEffect(() => {
    let isMounted = true;
    fetchPublicListings({ pageSize: 4, sort: "newest" })
      .then((res) => {
        if (isMounted) {
          setFeaturedListings(res.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthGate = (action?: string) => {
    setAuthGateAction(action || "Platform Access");
    setAuthGateOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35] selection:bg-[#1e5442] selection:text-white">
      <PublicHeader activeRoute="home" onOpenAuthGate={openAuthGate} />

      <main className="flex-1">
        <HomeHero onBecomeSupplier={openAuthGate} />
        <HomeAudiences onBecomeSupplier={openAuthGate} />
        <HomeSteps />
        <HomeSupplyPreview listings={featuredListings} loading={loading} />
        <HomeTrust />
        <HomeChain />
        <HomeFinalCta onJoin={openAuthGate} />
      </main>

      <PublicFooter />

      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        actionName={authGateAction}
        returnTo="/marketplace"
      />
    </div>
  );
}

