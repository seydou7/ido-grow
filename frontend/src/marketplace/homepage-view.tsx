"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n-provider";
import { AuthGateModal } from "./auth-gate-modal";
import { formatCertification, formatMaterialType, formatOriginCountry, formatPriceUnit, formatProductForm, formatQuantity } from "./formatters";
import { fetchPublicListings } from "./public-api";
import type { PublicMarketplaceListing } from "./public-contracts";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

export function HomepageView() {
  const { t } = useI18n();
  const [featuredListings, setFeaturedListings] = useState<readonly PublicMarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("Platform Access");

  // Lead / briefing subscription state
  const [briefingEmail, setBriefingEmail] = useState("");
  const [briefingSubmitted, setBriefingSubmitted] = useState(false);

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

  const handleBriefingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (briefingEmail.trim()) {
      setBriefingSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35] selection:bg-[#1e5442] selection:text-white">
      {/* Top Header Navigation */}
      <PublicHeader
        activeRoute="home"
        onOpenAuthGate={(action) => {
          setAuthGateAction(action || "Platform Access");
          setAuthGateOpen(true);
        }}
      />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* HERO: Video-Ready, Cinematic Editorial Hero (No Right-Side Competing Card) */}
        {/* ========================================================================= */}
        <section className="relative min-h-[560px] lg:min-h-[640px] flex items-center bg-[#0d1d17] text-white overflow-hidden border-b border-[#0a1813]">
          {/* Background Video Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={(el) => {
                if (el) {
                  el.muted = true;
                  el.defaultMuted = true;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/media/hero-video-poster.jpg"
              className="w-full h-full object-cover object-center transform scale-101"
            >
              <source src="/media/hero-section.mp4" type="video/mp4" />
              {/* Fallback image if video cannot load */}
              <img
                src="/media/hero-video-poster.jpg"
                alt="European agricultural landscape with harvested raw material bales"
                className="w-full h-full object-cover"
              />
            </video>

            {/* Multi-Stop Sophisticated Overlay: Transparent Deep Forest Green, Charcoal & Warm Neutrals */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(9, 23, 18, 0.92) 0%, rgba(13, 31, 24, 0.82) 42%, rgba(13, 31, 24, 0.55) 75%, rgba(13, 31, 24, 0.35) 100%)",
              }}
            />
            {/* Subtle bottom transition gradient into the warm cream of next section */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1d17] via-[#0d1d17]/60 to-transparent pointer-events-none" />
          </div>

          {/* Left-Aligned Controlled Hero Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 w-full">
            <div className="max-w-3xl space-y-6">
              {/* Subtle Sector Eyebrow */}
              <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#c89b3c]/35 backdrop-blur-xs text-xs font-semibold text-[#f5ebd2]">
                <span className="w-2 h-2 rounded-full bg-[#c89b3c] animate-pulse" />
                <span>{t("hero.eyebrow")}</span>
              </div>

              {/* Controlled, Credible Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                {t("hero.headline")}
              </h1>

              {/* Precise Supporting Statement */}
              <p className="text-base sm:text-lg text-[#d0e2da] max-w-2xl font-normal leading-relaxed">
                {t("hero.description")}
              </p>

              {/* Maximum 2 Clear CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-md">
                <Link
                  href="/marketplace"
                  className="py-3.5 px-7 bg-[#c89b3c] hover:bg-[#b8860b] text-[#13352c] text-sm font-bold rounded-xl shadow-lg transition-all text-center flex items-center justify-center space-x-2 focus:ring-2 focus:ring-[#c89b3c]"
                >
                  <span>{t("cta.exploreMarketplace")}</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setAuthGateAction("Access Platform");
                    setAuthGateOpen(true);
                  }}
                  className="py-3.5 px-6 border border-white/25 bg-black/25 hover:bg-black/40 text-white text-sm font-semibold rounded-xl backdrop-blur-xs transition-colors text-center"
                >
                  {t("cta.accessPlatform")}
                </button>
              </div>

              {/* Subtle Trust Indicators */}
              <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#a9c9bc]">
                <div>
                  <span className="font-bold text-white block text-sm">Verified Producers</span>
                  <span>Cooperative Audited</span>
                </div>
                <div>
                  <span className="font-bold text-white block text-sm">Accredited Labs</span>
                  <span>Physical &amp; Chemical Specs</span>
                </div>
                <div>
                  <span className="font-bold text-white block text-sm">Digital Contracts</span>
                  <span>Binding Incoterm Sales</span>
                </div>
                <div>
                  <span className="font-bold text-white block text-sm">EU DPP Ready</span>
                  <span>Immutable Lot Custody</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1 — WHAT IS I DO GROW: Editorial Split Layout                      */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#faf8f1] border-b border-[#e4ded0]" id="about">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Clear Institutional Narrative */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  <span>Operational Infrastructure</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  Connecting agricultural harvest with professional industrial procurement.
                </h2>

                <p className="text-sm text-[#4d5f57] leading-relaxed">
                  For decades, industrial procurement of natural raw materials has been constrained by fragmented supply, undocumented quality variances, and opaque middlemen. Manufacturers seeking sustainable agricultural alternatives to synthetic materials required institutional reliability.
                </p>

                <p className="text-sm text-[#4d5f57] leading-relaxed">
                  <strong className="text-[#173f35] font-bold">I Do Grow</strong> introduces structured commodity trading to European agriculture. We unite primary producers, industrial buyers, independent testing laboratories, and freight hauliers inside one coordinated transaction lifecycle.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-3">
                  <div className="p-4 rounded-xl bg-white border border-[#ded8c4]">
                    <span className="text-[11px] font-bold uppercase text-[#1e5442] block">Raw Material Supply</span>
                    <p className="text-xs text-[#5c6e66] mt-1">
                      Aggregated lots from certified French, Belgian, Dutch and European cooperatives.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#ded8c4]">
                    <span className="text-[11px] font-bold uppercase text-[#1e5442] block">Industrial Compliance</span>
                    <p className="text-xs text-[#5c6e66] mt-1">
                      Standardized moisture, fineness, shive ratio, and EU CSRD traceability.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center space-x-2 text-xs font-bold text-[#1e5442] hover:text-[#173f35] hover:underline"
                  >
                    <span>Browse available agricultural lots in catalogue</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Actual Agriculture / Supply Chain Context */}
              <div className="lg:col-span-6 space-y-3">
                <div className="relative rounded-3xl overflow-hidden border border-[#ded8c4] shadow-md bg-white">
                  <img
                    src="/images/warehouse_commodity.png"
                    alt="European agricultural consolidation warehouse with prepared commodity lots"
                    className="w-full h-[380px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-white/95 backdrop-blur-xs border border-white/40 text-xs text-[#173f35] flex items-center justify-between">
                    <div>
                      <span className="font-bold block">European Agricultural Consolidation Depot</span>
                      <span className="text-[11px] text-[#5c6e66]">Baled raw material lots prepared for industrial dispatch</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#1e5442] text-white font-bold text-[10px] tracking-wide">
                      VERIFIED SITE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — ECOSYSTEM & ACTORS: Human-Centered Visual Story (6 Actors)    */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white border-b border-[#e4ded0]" id="ecosystem">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                Ecosystem Participants
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight mt-1">
                The people and institutions powering the supply chain.
              </h2>
              <p className="mt-3 text-sm text-[#5c6e66] leading-relaxed">
                I Do Grow connects every verified counterpart along the natural commodity lifecycle — aligning primary cultivators, trading desks, quality inspectors, warehouse hubs, logistics carriers, and industrial procurement.
              </p>
            </div>

            {/* 6 Distinct Participant Cards with dedicated local imagery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Actor 1: Producers / Cooperatives / Fibre Mills */}
              <div className="rounded-2xl border border-[#ded8c4] bg-[#faf8f1] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#1e5442] transition-colors">
                <div>
                  <div className="relative h-52 bg-[#ece6d6] overflow-hidden">
                    <img
                      src="/images/actor_producer_field.png"
                      alt="European agricultural cooperative farmer in field"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#173f35] text-white text-[11px] font-bold uppercase tracking-wider">
                      Producers &amp; Cooperatives
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-[#173f35]">Producers, Cooperatives &amp; Fibre Mills</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      Agricultural cooperatives and regional scutching/decortication facilities who cultivate, harvest, ret, and process raw natural fibres.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 border-t border-[#e8e2d2] mt-4">
                  <span className="text-[11px] text-[#1e5442] font-semibold block pt-3">
                    Role: Catalogues verified lots, issues harvest data, and fulfills forward contracts.
                  </span>
                </div>
              </div>

              {/* Actor 2: Commercial Trading / Platform Operations */}
              <div className="rounded-2xl border border-[#ded8c4] bg-[#faf8f1] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#1e5442] transition-colors">
                <div>
                  <div className="relative h-52 bg-[#ece6d6] overflow-hidden">
                    <img
                      src="/images/trader_platform.png"
                      alt="Commercial commodity trading desk and platform operations specialist"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#173f35] text-white text-[11px] font-bold uppercase tracking-wider">
                      Commercial Trading
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-[#173f35]">Commercial Trading &amp; Platform Operations</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      Specialized commodity desk that structures bilateral trade, coordinates RFQ negotiations, matches supply, and mitigates counterparty risk.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 border-t border-[#e8e2d2] mt-4">
                  <span className="text-[11px] text-[#1e5442] font-semibold block pt-3">
                    Role: Facilitates RFQ matching, verifies counterparties, and oversees transaction execution.
                  </span>
                </div>
              </div>

              {/* Actor 3: Quality Inspection / Laboratory / Certification */}
              <div className="rounded-2xl border border-[#ded8c4] bg-[#faf8f1] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#1e5442] transition-colors">
                <div>
                  <div className="relative h-52 bg-[#ece6d6] overflow-hidden">
                    <img
                      src="/images/quality_lab.png"
                      alt="Accredited laboratory quality testing and classification"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#173f35] text-white text-[11px] font-bold uppercase tracking-wider">
                      Quality &amp; Laboratory
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-[#173f35]">Quality Inspection &amp; Certification Labs</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      Accredited testing facilities providing objective scientific grading of moisture content, impurity ratios, and mechanical fineness.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 border-t border-[#e8e2d2] mt-4">
                  <span className="text-[11px] text-[#1e5442] font-semibold block pt-3">
                    Role: Issues certified inspection reports and attaches cryptographic quality proofs.
                  </span>
                </div>
              </div>

              {/* Actor 4: Warehousing / Commodity Preparation */}
              <div className="rounded-2xl border border-[#ded8c4] bg-[#faf8f1] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#1e5442] transition-colors">
                <div>
                  <div className="relative h-52 bg-[#ece6d6] overflow-hidden">
                    <img
                      src="/images/warehouse_commodity.png"
                      alt="Agricultural warehouse consolidation and commodity preparation"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#173f35] text-white text-[11px] font-bold uppercase tracking-wider">
                      Warehousing &amp; Prep
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-[#173f35]">Warehousing &amp; Commodity Preparation</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      Consolidation depots and dry storage hubs ensuring high-density bale conditioning, batch weighing, and dispatch staging.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 border-t border-[#e8e2d2] mt-4">
                  <span className="text-[11px] text-[#1e5442] font-semibold block pt-3">
                    Role: Prepares conditioned inventory lots, verifies batch tallies, and stages transport.
                  </span>
                </div>
              </div>

              {/* Actor 5: Logistics / Freight / Shipment Execution */}
              <div className="rounded-2xl border border-[#ded8c4] bg-[#faf8f1] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#1e5442] transition-colors">
                <div>
                  <div className="relative h-52 bg-[#ece6d6] overflow-hidden">
                    <img
                      src="/images/logistics_loading.png"
                      alt="European logistics and freight carrier loading shipment"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#173f35] text-white text-[11px] font-bold uppercase tracking-wider">
                      Logistics &amp; Freight
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-[#173f35]">Logistics &amp; Freight Execution</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      Road freight, intermodal, and bulk carrier networks operating under standard Incoterms (EXW, FCA, DAP) with verified custody handoffs.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 border-t border-[#e8e2d2] mt-4">
                  <span className="text-[11px] text-[#1e5442] font-semibold block pt-3">
                    Role: Executes freight transport, logs bill of lading, and confirms milestone delivery.
                  </span>
                </div>
              </div>

              {/* Actor 6: Buyers / Procurement / Industrial Teams */}
              <div className="rounded-2xl border border-[#ded8c4] bg-[#faf8f1] overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#1e5442] transition-colors">
                <div>
                  <div className="relative h-52 bg-[#ece6d6] overflow-hidden">
                    <img
                      src="/images/b2b_team.png"
                      alt="Industrial procurement and manufacturing engineering team"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#173f35] text-white text-[11px] font-bold uppercase tracking-wider">
                      Industrial Buyers
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-[#173f35]">Buyers, Procurement &amp; Industrial Teams</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      Automotive composites, bio-construction, technical textiles, and packaging manufacturers sourcing volume raw materials with guaranteed technical specs.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 border-t border-[#e8e2d2] mt-4">
                  <span className="text-[11px] text-[#1e5442] font-semibold block pt-3">
                    Role: Submits formal RFQs, negotiates terms, executes sales agreements, and receives DPPs.
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Summary Box */}
            <div className="mt-8 rounded-2xl border border-[#cbe6d7] bg-[#eef6f2] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-[#1e5442] text-white flex items-center justify-center font-bold text-xs">
                    IDG
                  </span>
                  <h3 className="text-base font-bold text-[#173f35]">Unified Supply Chain Governance</h3>
                </div>
                <p className="text-xs text-[#4d5f57] max-w-2xl leading-relaxed">
                  By coordinating all six participant groups within standardized data contracts, I Do Grow transforms previously fragmented bilateral trade into scalable, audit-ready commodity transactions.
                </p>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAuthGateAction("Register Counterparty");
                    setAuthGateOpen(true);
                  }}
                  className="py-2.5 px-6 bg-[#1e5442] hover:bg-[#173f35] text-white text-xs font-bold rounded-lg transition-colors w-full md:w-auto text-center"
                >
                  Join the Ecosystem
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 — HOW IT WORKS: Connected Journey (SOURCE -> VERIFY -> TRADE -> MOVE -> TRACE) */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#f4f0e2] border-b border-[#ded8c4]" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                Continuous Transaction Lifecycle
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight mt-1">
                From field harvest to factory gate in five verified stages.
              </h2>
              <p className="mt-3 text-sm text-[#5c6e66] leading-relaxed">
                Every trade follows an established continuous pathway that eliminates speculation, clarifies liability, and guarantees material provenance.
              </p>
            </div>

            {/* Connected Pathway Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Step 1: SOURCE */}
              <div className="bg-white p-5 rounded-2xl border border-[#ded8c4] shadow-xs flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-[#1e5442] uppercase px-2 py-0.5 rounded bg-[#eef6f2]">
                      Stage 01
                    </span>
                    <span className="text-xs font-extrabold text-[#173f35]">SOURCE</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#173f35] mb-1.5">Cooperative Aggregation</h3>
                  <p className="text-xs text-[#5c6e66] leading-relaxed">
                    European cooperatives register raw material lots with harvest coordinates, ret method, and estimated tonnage.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#e8e2d2] text-[10px] font-semibold text-[#6d7e76]">
                  Public discovery in marketplace
                </div>
              </div>

              {/* Step 2: VERIFY */}
              <div className="bg-white p-5 rounded-2xl border border-[#ded8c4] shadow-xs flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-[#1e5442] uppercase px-2 py-0.5 rounded bg-[#eef6f2]">
                      Stage 02
                    </span>
                    <span className="text-xs font-extrabold text-[#173f35]">VERIFY</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#173f35] mb-1.5">Lab Quality Grading</h3>
                  <p className="text-xs text-[#5c6e66] leading-relaxed">
                    Accredited laboratories test moisture, purity, and mechanical fiber parameters, recording certified test reports.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#e8e2d2] text-[10px] font-semibold text-[#6d7e76]">
                  Standardized test certificates
                </div>
              </div>

              {/* Step 3: TRADE */}
              <div className="bg-white p-5 rounded-2xl border border-[#ded8c4] shadow-xs flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-[#1e5442] uppercase px-2 py-0.5 rounded bg-[#eef6f2]">
                      Stage 03
                    </span>
                    <span className="text-xs font-extrabold text-[#173f35]">TRADE</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#173f35] mb-1.5">Bilateral Contracting</h3>
                  <p className="text-xs text-[#5c6e66] leading-relaxed">
                    Buyer and seller agree on volume, pricing, and Incoterms through versioned quotes, culminating in a binding contract.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#e8e2d2] text-[10px] font-semibold text-[#6d7e76]">
                  Digital contract execution
                </div>
              </div>

              {/* Step 4: MOVE */}
              <div className="bg-white p-5 rounded-2xl border border-[#ded8c4] shadow-xs flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-[#1e5442] uppercase px-2 py-0.5 rounded bg-[#eef6f2]">
                      Stage 04
                    </span>
                    <span className="text-xs font-extrabold text-[#173f35]">MOVE</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#173f35] mb-1.5">Physical Freight Dispatch</h3>
                  <p className="text-xs text-[#5c6e66] leading-relaxed">
                    Licensed freight carriers execute road and intermodal transport, logging dispatch, border transit, and delivery handoffs.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#e8e2d2] text-[10px] font-semibold text-[#6d7e76]">
                  Chain-of-custody milestones
                </div>
              </div>

              {/* Step 5: TRACE */}
              <div className="bg-white p-5 rounded-2xl border border-[#ded8c4] shadow-xs flex flex-col justify-between relative">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-[#1e5442] uppercase px-2 py-0.5 rounded bg-[#eef6f2]">
                      Stage 05
                    </span>
                    <span className="text-xs font-extrabold text-[#173f35]">TRACE</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#173f35] mb-1.5">DPP Lot Transfer</h3>
                  <p className="text-xs text-[#5c6e66] leading-relaxed">
                    Upon final receipt, the complete Digital Product Passport is transferred to the verified buyer for EU CSRD and ESPR compliance.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#e8e2d2] text-[10px] font-semibold text-[#6d7e76]">
                  Audit-ready passport release
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/marketplace"
                className="py-3 px-7 bg-[#1e5442] hover:bg-[#173f35] text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center space-x-2 transition-colors"
              >
                <span>Browse Materials in Marketplace</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 — PRODUCTS / MARKETPLACE PREVIEW: Curated Real Commodity Lots    */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white border-b border-[#e4ded0]" id="catalogue-preview">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  Available Inventory Preview
                </span>
                <h2 className="text-3xl font-extrabold text-[#173f35] tracking-tight mt-1">
                  European Natural Commodities Ready for Prompt Quote
                </h2>
                <p className="mt-2 text-sm text-[#5c6e66]">
                  A curated preview across industrial hemp, scutched flax, sisal, and agricultural raw materials.
                </p>
              </div>

              <div className="mt-4 md:mt-0">
                <Link
                  href="/marketplace"
                  className="py-2.5 px-5 bg-[#faf8f1] border border-[#dcd6c4] hover:border-[#1e5442] text-[#173f35] hover:text-[#1e5442] text-xs font-bold rounded-lg transition-colors inline-flex items-center space-x-1.5"
                >
                  <span>{t("cta.exploreCatalogue")}</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#faf8f1] rounded-2xl h-80 border border-[#e4decb]" />
                ))}
              </div>
            ) : featuredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredListings.map((listing) => {
                  const rawImage = listing.images?.[0];
                  const materialImageMap: Record<string, string> = {
                    HEMP: "/images/materials/hemp-fibre-1.jpg",
                    FLAX: "/images/materials/flax-scutched-1.jpg",
                    SISAL: "/images/materials/sisal-fibre-1.jpg",
                    JUTE: "/images/materials/jute-fibre-1.jpg",
                    COIR: "/images/materials/coir-fibre-1.jpg",
                  };
                  const defaultCommodityImage = materialImageMap[listing.materialType] || "/images/products/commodity-bales.jpg";
                  const imageUrl = !rawImage ? defaultCommodityImage : rawImage;
                  const formattedMaterial = formatMaterialType(listing.materialType);
                  const formattedForm = formatProductForm(listing.productForm);
                  const formattedCountry = formatOriginCountry(listing.originCountry);
                  const formattedUnit = formatPriceUnit(listing.priceUnit);

                  return (
                    <article
                      key={listing.id}
                      className="group bg-[#faf8f1] rounded-2xl border border-[#ded8c4] hover:border-[#1e5442] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative aspect-[16/11] bg-[#ece6d6] overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-[#173f35] text-white font-bold uppercase tracking-wider">
                              {formattedMaterial}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/95 text-[#173f35] font-semibold">
                              {formattedCountry}
                            </span>
                          </div>
                        </div>

                        {/* Text */}
                        <div className="p-4 space-y-2">
                          <span className="text-[11px] font-semibold text-[#256852] uppercase tracking-wider block">
                            {formattedForm}
                          </span>
                          <h3 className="text-sm font-bold text-[#173f35] line-clamp-2 leading-snug group-hover:text-[#1e5442] transition-colors">
                            <Link href={`/marketplace/${encodeURIComponent(listing.id)}`}>
                              {listing.title}
                            </Link>
                          </h3>

                          {listing.certifications.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {listing.certifications.slice(0, 2).map((c) => (
                                <span
                                  key={c.documentType}
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#eef6f2] text-[#1e5442] border border-[#cbe6d7]"
                                >
                                  {formatCertification(c.documentType)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Specification CTA */}
                      <div className="p-4 pt-2 border-t border-[#e8e2d2] space-y-3">
                        <div className="flex items-baseline justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#6d7e76] uppercase block font-medium">Batch Volume</span>
                            <span className="font-bold text-[#173f35]">
                              {formatQuantity(listing.quantity, listing.quantityUnit)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#6d7e76] uppercase block font-medium">Indicative Price</span>
                            {listing.priceAmount !== null ? (
                              <span className="font-extrabold text-[#1e5442] text-sm">
                                €{listing.priceAmount.toLocaleString()} {formattedUnit}
                              </span>
                            ) : (
                              <span className="italic text-[#6d7e76] text-xs">On Request</span>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/marketplace/${encodeURIComponent(listing.id)}`}
                          className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-white hover:bg-[#1e5442] hover:text-white border border-[#d8d1bd] text-[#173f35] text-center block transition-colors"
                        >
                          {t("cta.viewSpecifications")} &rarr;
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — TRACEABILITY & DIGITAL PRODUCT PASSPORT (Structured Preview)   */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#14352b] text-white border-b border-[#0d231d]" id="traceability">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1e5442] border border-[#2e6b56] text-xs font-semibold text-[#b4dfcb]">
                  <span>EU ESPR &amp; CSRD Compliance Ready</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                  Immutable batch traceability with Digital Product Passports.
                </h2>

                <p className="text-sm text-[#c0d6cc] leading-relaxed">
                  Every commercial lot traded through I Do Grow carries an authentic Digital Product Passport. We record field parcel coordinates, primary decortication batch, certified laboratory tests, and freight custody events without leaking confidential supplier terms publicly.
                </p>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#1e5442] text-[#c89b3c] flex items-center justify-center font-bold shrink-0">
                      ✓
                    </span>
                    <div>
                      <strong className="text-white block font-bold">Field-to-Factory Provenance:</strong>
                      <span className="text-[#a8c6b9]">GPS parcel mapping and cooperative origin authentication.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#1e5442] text-[#c89b3c] flex items-center justify-center font-bold shrink-0">
                      ✓
                    </span>
                    <div>
                      <strong className="text-white block font-bold">Scientific Quality Grading:</strong>
                      <span className="text-[#a8c6b9]">Standardized moisture, fiber fineness, and impurity analysis.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#1e5442] text-[#c89b3c] flex items-center justify-center font-bold shrink-0">
                      ✓
                    </span>
                    <div>
                      <strong className="text-white block font-bold">Responsible Data Governance:</strong>
                      <span className="text-[#a8c6b9]">Anonymous public discovery; full passport records released only to verified transaction counterparties.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/marketplace"
                    className="py-3 px-6 bg-white hover:bg-[#faf8f1] text-[#173f35] text-xs font-bold rounded-xl shadow-md inline-block transition-colors"
                  >
                    Browse DPP-Enabled Materials &rarr;
                  </Link>
                </div>
              </div>

              {/* DPP Interface Preview (Structured Visual Card) */}
              <div className="lg:col-span-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-[#0e241d] border border-white/15 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <span className="w-9 h-9 rounded-lg bg-[#256852] text-white flex items-center justify-center font-bold text-xs">
                        DPP
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">Digital Product Passport</span>
                        <span className="text-[10px] text-[#7da394]">IDG-FR-2026-LOT-0492</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#256852]/80 text-[#c89b3c] text-[11px] font-bold">
                      VERIFIED LOT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="bg-[#173f35] p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] text-[#7da394] uppercase block font-medium">Material Classification</span>
                      <strong className="text-white">Technical Hemp Fibre</strong>
                    </div>
                    <div className="bg-[#173f35] p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] text-[#7da394] uppercase block font-medium">Harvest Region</span>
                      <strong className="text-white">Grand Est, France (Aube)</strong>
                    </div>
                    <div className="bg-[#173f35] p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] text-[#7da394] uppercase block font-medium">Moisture Content</span>
                      <strong className="text-[#c89b3c]">11.4% (Standard &lt;14%)</strong>
                    </div>
                    <div className="bg-[#173f35] p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] text-[#7da394] uppercase block font-medium">Certification Document</span>
                      <strong className="text-white">Organic &amp; OEKO-TEX</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#9fc0b2] flex items-center justify-between">
                    <span>Cryptographic Audit Proof: <code className="text-[#d4af37] font-mono">0x4f8a...c91d</code></span>
                    <span>ESPR Standard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — QUALITY & OPERATIONAL TRUST (Labs & Inspectors)               */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#faf8f1] border-b border-[#e4ded0]" id="quality">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-[#ded8c4] shadow-sm bg-white">
                  <img
                    src="/images/quality_lab.png"
                    alt="Accredited laboratory quality testing and classification for agricultural commodities"
                    className="w-full h-80 object-cover object-center"
                  />
                  <div className="p-4 bg-[#faf8f1] text-xs border-t border-[#ded8c4] flex items-center justify-between">
                    <span className="font-bold text-[#173f35]">Standardized ISO 17025 Test Methodology</span>
                    <span className="text-[#1e5442] font-semibold">Ghent &amp; Lyon Testing Centers</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  Standardized Testing &amp; Verification
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  Operational trust based on certified scientific analysis.
                </h2>
                <p className="text-sm text-[#5c6e66] leading-relaxed">
                  We replace subjective grading with accredited laboratory inspection. Every commercial lot can be verified for standardized moisture thresholds, shive ratio, fiber length distribution, and foreign matter before contracts are finalized.
                </p>

                <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-[#ded8c4]">
                    <span className="font-bold text-[#173f35] block">Moisture Verification</span>
                    <span className="text-[#5c6e66]">Certified hygrometric testing to prevent degradation during transit.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ded8c4]">
                    <span className="font-bold text-[#173f35] block">Fineness &amp; Tenacity</span>
                    <span className="text-[#5c6e66]">Consistent technical grading for composite and spinning mills.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ded8c4]">
                    <span className="font-bold text-[#173f35] block">Cleanliness &amp; Shive</span>
                    <span className="text-[#5c6e66]">Quantitative decortication purity metrics.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ded8c4]">
                    <span className="font-bold text-[#173f35] block">Chain-of-Custody</span>
                    <span className="text-[#5c6e66]">Auditable sealing of samples against listed batch records.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 — TRADER / DIGITAL OPERATIONS (Digital + Physical Platform)     */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white border-b border-[#e4ded0]" id="operations">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  Digital Trade Cockpit
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  Where data intelligence meets the physical supply chain.
                </h2>
                <p className="text-sm text-[#5c6e66] leading-relaxed">
                  I Do Grow combines on-the-ground commodity logistics with modern digital execution. Our trading desk and software platform coordinate buyer demand against verified European cooperative supply in real time.
                </p>

                <div className="space-y-3 text-xs text-[#4d5f57]">
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#eef6f2] text-[#1e5442] flex items-center justify-center font-bold shrink-0">
                      01
                    </span>
                    <div>
                      <strong className="text-[#173f35] block font-bold">Bilateral RFQ &amp; Negotiation:</strong>
                      <span>Transparent counter-proposals with versioned quotation history.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#eef6f2] text-[#1e5442] flex items-center justify-center font-bold shrink-0">
                      02
                    </span>
                    <div>
                      <strong className="text-[#173f35] block font-bold">Standardized Incoterms Execution:</strong>
                      <span>Clear demarcation of freight costs, risk transfer, and delivery milestones.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#eef6f2] text-[#1e5442] flex items-center justify-center font-bold shrink-0">
                      03
                    </span>
                    <div>
                      <strong className="text-[#173f35] block font-bold">Automated Custody Transition:</strong>
                      <span>Real-time status updates from dispatch through final gate arrival.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthGateAction("Access Platform Cockpit");
                      setAuthGateOpen(true);
                    }}
                    className="py-2.5 px-5 bg-[#1e5442] hover:bg-[#173f35] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                  >
                    Enter Platform Cockpit
                  </button>
                </div>
              </div>

              {/* Digital Platform Screen Visual */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-[#ded8c4] shadow-md bg-white">
                  <img
                    src="/images/trader_platform.png"
                    alt="I Do Grow digital operations cockpit showing transaction matching, live lot allocation and contract settlement"
                    className="w-full h-80 object-cover object-center"
                  />
                  <div className="p-4 bg-[#faf8f1] text-[#173f35] text-xs border-t border-[#ded8c4] flex items-center justify-between">
                    <span className="font-bold">Digital Platform Cockpit &amp; Sourcing Engine</span>
                    <span className="text-[#1e5442] font-semibold text-[11px]">TRANSACTION TELEMETRY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8 — LOGISTICS & PHYSICAL MOVEMENT (Freight, Trucks, Warehousing) */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#faf8f1] border-b border-[#ded8c4]" id="logistics">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden border border-[#ded8c4] shadow-sm bg-white">
                  <img
                    src="/images/freight_port.png"
                    alt="European freight transport truck and commodity loading hub under standard Incoterms"
                    className="w-full h-80 object-cover object-center"
                  />
                  <div className="p-4 bg-white text-xs border-t border-[#ded8c4] flex items-center justify-between">
                    <span className="font-bold text-[#173f35]">Multimodal European Road &amp; Intermodal Freight</span>
                    <span className="text-[#1e5442] font-semibold">EXW / FCA / DAP Coordinated</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  Physical Delivery Infrastructure
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  Reliable physical movement across European borders.
                </h2>
                <p className="text-sm text-[#5c6e66] leading-relaxed">
                  Natural materials must move efficiently from regional agricultural storage to industrial processing facilities. We work with vetted European carriers to support full-truckload (FTL), intermodal container, and consolidated pallet freight under clear Incoterms.
                </p>

                <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-[#ded8c4]">
                    <span className="font-bold text-[#173f35] block">Standardized Packaging</span>
                    <span className="text-[#5c6e66]">High-density industrial bales, bulk big-bags, and palletized lots.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ded8c4]">
                    <span className="font-bold text-[#173f35] block">Milestone Tracking</span>
                    <span className="text-[#5c6e66]">Loading confirmation, border crossing, and delivery receipts.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9 — MARKETPLACE CTA GATEWAY (Visually Rich Invitation)             */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#143a2f] text-white border-b border-[#0d261e]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c89b3c]">
              Direct Sourcing Gateway
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Ready to source verified European agricultural commodities?
            </h2>
            <p className="text-sm sm:text-base text-[#c4dfd4] max-w-2xl mx-auto font-normal leading-relaxed">
              Open the dedicated public marketplace to browse current available inventory, filter by technical specifications, and initiate formal quote negotiations.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/marketplace"
                className="py-3.5 px-8 bg-[#c89b3c] hover:bg-[#b8860b] text-[#13352c] text-sm font-bold rounded-xl shadow-lg transition-colors flex items-center space-x-2 focus:ring-2 focus:ring-[#c89b3c]"
              >
                <span>{t("cta.exploreMarketplace")}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setAuthGateAction("Create Buyer Account");
                  setAuthGateOpen(true);
                }}
                className="py-3.5 px-7 border border-white/30 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {t("cta.createAccount")}
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10 — MARKET INTELLIGENCE: European Commodity Insights              */}
        {/* ========================================================================= */}
        <section className="py-16 bg-[#faf8f1] border-b border-[#ded8c4]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
              Market Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173f35] tracking-tight">
              European Natural Commodity Insights
            </h2>
            <p className="text-xs sm:text-sm text-[#5c6e66] max-w-xl mx-auto leading-relaxed">
              Receive authoritative updates on harvest yields, acreage estimates, laboratory standards, and regulatory developments directly from our commodities desk.
            </p>

            {briefingSubmitted ? (
              <div className="p-4 rounded-xl bg-[#eef6f2] border border-[#cbe6d7] text-xs font-bold text-[#1e5442] max-w-md mx-auto">
                ✓ Thank you. Your commodity briefing subscription is confirmed.
              </div>
            ) : (
              <form onSubmit={handleBriefingSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="procurement@company.com"
                  value={briefingEmail}
                  onChange={(e) => setBriefingEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-[#c8c0aa] rounded-xl text-xs text-[#173f35] placeholder-[#8c9c94] focus:outline-none focus:ring-2 focus:ring-[#1e5442]"
                />
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#1e5442] hover:bg-[#173f35] text-white text-xs font-bold rounded-xl shadow-sm transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="text-[11px] text-[#7d8f85]">
              Strictly B2B industrial intelligence. No marketing spam. Unsubscribe anytime.
            </p>
          </div>
        </section>
      </main>

      {/* 11. Complete Institutional Footer */}
      <PublicFooter />

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        actionName={authGateAction}
        returnTo="/marketplace"
      />
    </div>
  );
}
