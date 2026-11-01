"use client";

import { useEffect, useState } from "react";
import { AuthGateModal } from "./auth-gate-modal";
import { V2Hero } from "./home-v2/v2-hero";
import { V2Fibres, V2Final, V2How, V2Lots, V2Trust, V2Who } from "./home-v2/v2-sections";
import { fetchPublicListings } from "./public-api";
import type { PublicMarketplaceListing } from "./public-contracts";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

/** Homepage V2 — a more commercial alternative to HomepageView. Uses the same listings call. */
export function HomepageV2View() {
  const [listings, setListings] = useState<readonly PublicMarketplaceListing[]>([]);
    const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("Platform Access");

  useEffect(() => {
    let isMounted = true;
    fetchPublicListings({ pageSize: 4, sort: "newest" })
      .then((res) => {
        if (isMounted) setListings(res.items);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthGate = (action?: string) => {
    setAuthGateAction(action || "Platform Access");
    setAuthGateOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col text-[#15211D] selection:bg-[#1e5442] selection:text-white">
      <PublicHeader activeRoute="home-v2" onOpenAuthGate={openAuthGate} />

      <main className="flex-1">
        <V2Hero onSell={openAuthGate} />
        <V2Fibres />
        <V2How />
        <V2Lots listings={listings} />
        <V2Who onSell={openAuthGate} />
        <V2Trust />
        <V2Final onSell={openAuthGate} />
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
