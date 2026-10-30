"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/i18n-provider";
import { AuthGateModal } from "./auth-gate-modal";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

interface TimelineStage {
  readonly id: string;
  readonly number: string;
  readonly shortName: string;
  readonly title: string;
  readonly summary: string;
  readonly actor: string;
  readonly artifact: string;
  readonly badge: string;
  readonly operationalDetails: readonly string[];
}

const MASTER_STAGES: readonly TimelineStage[] = [
  {
    id: "stage-01",
    number: "01",
    shortName: "SUPPLY INTAKE",
    title: "Supply Enters the Platform",
    summary:
      "Certified European agricultural cooperatives, cultivators, and primary processing mills register verified raw material batches with field parcel GPS coordinates, retting methods, and warehouse tonnage.",
    actor: "Primary Producers & Cooperatives",
    artifact: "Harvest Parcel Intake Record",
    badge: "Origin Verified",
    operationalDetails: [
      "GPS parcel mapping & cooperative registry verification",
      "Retting method: dew-retted, water-retted, or green-harvested",
      "Estimated gross inventory & initial moisture readings",
    ],
  },
  {
    id: "stage-02",
    number: "02",
    shortName: "LISTING CREATION",
    title: "Products Are Listed in Catalog",
    summary:
      "Raw materials are structured into standardized product formats (bales, scutched fibres, pellets, technical bast fibres) with indicative commercial pricing, origin region, and certified agricultural documents.",
    actor: "Suppliers & Platform Onboarding",
    artifact: "Standardized Commodity Listing",
    badge: "Catalog Ready",
    operationalDetails: [
      "Standard product forms: retted straw, scutched, combed, or short fibres",
      "Available tonnage, minimum order quantities, and pickup readiness",
      "Sanitized public presentation preserving supplier commercial privacy",
    ],
  },
  {
    id: "stage-03",
    number: "03",
    shortName: "BUYER DISCOVERY",
    title: "Buyers Discover Supply or Create Demand",
    summary:
      "Industrial procurement engineers browse active inventory using multi-dimensional technical filters, or submit a structured Buy Order when exact specifications require custom sourcing.",
    actor: "Industrial Procurement Teams",
    artifact: "Public Search / Structured Buy Order",
    badge: "Discovery & Demand",
    operationalDetails: [
      "Path A: Filter existing lots by fineness, origin, and certifications",
      "Path B: Submit custom Buy Order with target tolerances and delivery dates",
      "Anonymous discovery with authenticated conversion for commercial actions",
    ],
  },
  {
    id: "stage-04",
    number: "04",
    shortName: "TRADER MATCHING",
    title: "Trader Matches Demand and Supply",
    summary:
      "Specialized commodity operators at the Central Trading Desk evaluate candidate lots against buyer technical thresholds, volume compatibility, delivery geography, and landed cost viability.",
    actor: "I Do Grow Central Trading Desk",
    artifact: "Approved Commercial Match",
    badge: "Human Oversight",
    operationalDetails: [
      "Rigorous human matching — explicitly not autonomous algorithmic risk",
      "Technical compatibility review against manufacturing tolerances",
      "Logistics feasibility, counterparty vetting, and route validation",
    ],
  },
  {
    id: "stage-05",
    number: "05",
    shortName: "QUOTE & NEGOTIATION",
    title: "Bilateral Quote & Versioned Negotiation",
    summary:
      "The trading desk issues an itemized quotation breaking down raw commodity value, platform commission, lab testing, packing, freight, insurance, and taxes. Counterparties negotiate version-controlled counter-offers.",
    actor: "Buyer, Supplier & Trading Desk",
    artifact: "Versioned Quotation Agreement",
    badge: "Version Controlled",
    operationalDetails: [
      "Line-item cost transparency: raw material, logistics, inspection, fees",
      "Negotiation lifecycle: Draft → Review → Sent → Countered → Accepted",
      "Full immutable version audit history preventing price misunderstandings",
    ],
  },
  {
    id: "stage-06",
    number: "06",
    shortName: "QUALITY TESTING",
    title: "Independent Quality Verification Gate",
    summary:
      "Commercial agreement alone is not enough — independent laboratories and accredited inspectors extract physical batch samples to verify hygrometric moisture, mechanical fineness, and shive ratio under ISO 17025 standards.",
    actor: "Independent Accredited Labs",
    artifact: "ISO 17025 Inspection Certificate",
    badge: "Quality Gate",
    operationalDetails: [
      "Accredited hygrometric testing to prevent degradation during transit",
      "Quantitative decortication purity, shive content, and fiber tenacity",
      "Inspection certificate reference cryptographically attached to batch ID",
    ],
  },
  {
    id: "stage-07",
    number: "07",
    shortName: "BINDING CONTRACT",
    title: "Contract Confirmation & Incoterms",
    summary:
      "Upon mutual acceptance and quality clearance, a legally binding digital commodity sales contract is executed. It defines governing law, Incoterms (EXW, FCA, DAP), pickup windows, tolerance margins, and dispute clauses.",
    actor: "Buyer, Supplier & Central Trading Desk",
    artifact: "Digital Sales Contract (PDF-1.4)",
    badge: "Legally Binding",
    operationalDetails: [
      "Precise Incoterm definitions: EXW depot pickup, FCA terminal, or DAP factory gate",
      "Clear risk transfer boundaries, packaging standards, and payment terms",
      "Standard dispute arbitration clauses and documentary requirements",
    ],
  },
  {
    id: "stage-08",
    number: "08",
    shortName: "LOGISTICS EXECUTION",
    title: "Freight Dispatch & Multimodal Transit",
    summary:
      "Licensed European road and intermodal hauliers quote on shipment requirements. The selected carrier executes pickup, logs border crossings, and uploads signed e-CMR consignment notes upon arrival.",
    actor: "European Freight Carriers & Logistics",
    artifact: "e-CMR & Milestone Transit Telemetry",
    badge: "Physical Movement",
    operationalDetails: [
      "Carrier bidding: compare freight rates and transit schedules",
      "Milestone tracking: depot departure, international border transit, gate arrival",
      "Operational exception logging: transit delay, damage notice, quantity difference",
    ],
  },
  {
    id: "stage-09",
    number: "09",
    shortName: "SETTLEMENT TRACKING",
    title: "Administrative Settlement Tracking",
    summary:
      "The platform coordinates commercial settlement documentation — tracking supplier invoices, payment instructions, advance deposits, remaining balances, credit notes, and final clearance status without acting as a bank.",
    actor: "Trading Desk Commercial Administration",
    artifact: "Settlement Reconciliation Record",
    badge: "Administrative Clearance",
    operationalDetails: [
      "Administrative milestone ledger — zero speculative direct payment execution",
      "Tracking of invoices, payment due dates, and deposit confirmations",
      "Audit of broker commissions, claims adjustments, and final balance closing",
    ],
  },
  {
    id: "stage-10",
    number: "10",
    shortName: "DIGITAL PASSPORT",
    title: "Digital Product Passport Lot Release",
    summary:
      "Upon final factory receipt, the complete immutable Digital Product Passport (DPP) is unlocked for the buyer. It aggregates parcel coordinates, harvest batch, certified lab metrics, and freight custody for EU CSRD & ESPR compliance.",
    actor: "Industrial Buyer & ESG Auditing",
    artifact: "Digital Product Passport (DPP)",
    badge: "ESPR / CSRD Compliant",
    operationalDetails: [
      "Immutable chronological event ledger from field sowing to factory gate",
      "Cryptographic audit proof for CSRD sustainability due diligence",
      "Authorised counterparty access via secure portal and QR validation",
    ],
  },
];

interface ActorRole {
  readonly id: string;
  readonly roleName: string;
  readonly title: string;
  readonly image: string;
  readonly summary: string;
  readonly responsibilities: readonly string[];
  readonly platformTools: readonly string[];
  readonly keyOutputs: readonly string[];
}

const ACTOR_ROLES: readonly ActorRole[] = [
  {
    id: "supplier",
    roleName: "PRODUCER & MILL",
    title: "Primary Cultivator, Cooperative & Scutching Mill",
    image: "/images/actor_producer_field.png",
    summary:
      "European farmers, agricultural cooperatives, and decortication mills who cultivate, harvest, and condition natural raw commodities for industrial conversion.",
    responsibilities: [
      "Record agricultural harvest parcels, ret method, and harvest year",
      "Stage baled inventory in consolidation warehouses with batch tallies",
      "Receive structured RFQs with forward pricing from verified manufacturers",
      "Fulfill forward sales contracts without speculative intermediaries",
    ],
    platformTools: [
      "Mobile-friendly producer inventory intake",
      "Lot classification & documentation manager",
      "Forward contract delivery scheduling desk",
    ],
    keyOutputs: ["Harvest Batch Record", "Warehouse Staging Slip", "Dispatch Consignment"],
  },
  {
    id: "buyer",
    roleName: "INDUSTRIAL BUYER",
    title: "Procurement, Engineering & Materials Management",
    image: "/images/b2b_team.png",
    summary:
      "Automotive lightweighting, bio-based insulation, technical textiles, and sustainable packaging teams requiring stable volume and documented technical thresholds.",
    responsibilities: [
      "Discover and filter available natural commodity lots by technical specs",
      "Create custom Buy Orders when inventory does not match exact production lines",
      "Review itemized quotation breakdowns and negotiate terms via versioned counter-offers",
      "Receive immutable Digital Product Passports for European regulatory audits",
    ],
    platformTools: [
      "Multi-faceted public & portal search engine",
      "Structured Buy Order creation wizard",
      "Versioned RFQ negotiation workspace",
    ],
    keyOutputs: ["Formal RFQ", "Purchase Agreement", "Receiving Gate Clearance"],
  },
  {
    id: "trader",
    roleName: "TRADING DESK",
    title: "Central Commodity Operations & Transaction Clearance",
    image: "/images/trader_platform.png",
    summary:
      "Experienced commodity professionals who evaluate commercial fit, mitigate counterparty risk, coordinate versioned quotes, and supervise transaction fulfillment.",
    responsibilities: [
      "Evaluate buyer demand against candidate cooperative lots",
      "Execute human-controlled matching based on volume, specs, and logistics cost",
      "Structure transparent multi-component quotations across Incoterms",
      "Supervise logistics scheduling, contract compliance, and settlement tracking",
    ],
    platformTools: [
      "Bilateral matching cockpit with compatibility scoring",
      "Versioned quote negotiation console",
      "Trade clearance & settlement monitoring desk",
    ],
    keyOutputs: ["Approved Match Status", "Binding Sales Contract", "Settlement Ledger"],
  },
  {
    id: "quality",
    roleName: "QUALITY LAB",
    title: "Independent Laboratory & Accredited Inspector",
    image: "/images/quality_lab.png",
    summary:
      "Accredited third-party testing facilities providing objective scientific grading under ISO 17025 standards to ensure lots comply before shipping.",
    responsibilities: [
      "Extract representative batch samples according to standardized sampling protocols",
      "Measure moisture content, mechanical fineness, shive ratio, and cleanliness",
      "Record objective test certificates tied cryptographically to specific lot IDs",
      "Provide independent measurement arbitration if quality claims arise",
    ],
    platformTools: [
      "Structured inspection measurement logger",
      "Evidence photo & lab test report uploader",
      "Certificate generation & digital sealing suite",
    ],
    keyOutputs: ["ISO 17025 Test Certificate", "Moisture Analysis Report", "Quality Seal"],
  },
  {
    id: "logistics",
    roleName: "LOGISTICS CARRIER",
    title: "European Freight Carrier & Multimodal Operator",
    image: "/images/freight_port.png",
    summary:
      "Licensed European road freight, container, and intermodal carriers transporting baled raw materials across national borders under clear Incoterms.",
    responsibilities: [
      "Submit competitive freight quotes for awarded shipment requirements",
      "Inspect packaging, load security, and moisture protection at collection",
      "Log digital transit milestones from cooperative warehouse to factory gate",
      "Upload signed electronic consignment notes (e-CMR) upon delivery",
    ],
    platformTools: [
      "Freight quotation submission portal",
      "Milestone transit logger & exception reporter",
      "Consignment document & CMR repository",
    ],
    keyOutputs: ["Freight Quote", "Transit Milestone Log", "Signed Delivery Proof (CMR)"],
  },
];

export function HowItWorksView() {
  const { t } = useI18n();
  const [selectedStageId, setSelectedStageId] = useState<string>("stage-01");
  const [selectedActorId, setSelectedActorId] = useState<string>("supplier");
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("Platform Access");

  const currentStage =
    MASTER_STAGES.find((s) => s.id === selectedStageId) || MASTER_STAGES[0];
  const currentActor =
    ACTOR_ROLES.find((a) => a.id === selectedActorId) || ACTOR_ROLES[0];

  return (
    <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35] selection:bg-[#1e5442] selection:text-white">
      {/* 1. Header Navigation */}
      <PublicHeader
        activeRoute="how-it-works"
        onOpenAuthGate={(action) => {
          setAuthGateAction(action || "Platform Access");
          setAuthGateOpen(true);
        }}
      />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* SECTION 1 — HERO: Distinct Pedagogical Hero with Lifecycle Diagram        */}
        {/* ========================================================================= */}
        <section className="relative bg-[#112d24] text-white py-16 lg:py-24 border-b border-[#0b1f19] overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background:
                "radial-gradient(circle at 75% 20%, rgba(200, 155, 60, 0.2) 0%, rgba(23, 63, 53, 0.5) 50%, rgba(11, 31, 24, 0.9) 100%)",
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Mission & CTAs */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#c89b3c]/35 backdrop-blur-xs text-xs font-semibold text-[#f5ebd2]">
                  <span className="w-2 h-2 rounded-full bg-[#c89b3c] animate-pulse" />
                  <span>{t("howItWorks.heroEyebrow")}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                  {t("howItWorks.heroTitle")}
                </h1>

                <p className="text-sm sm:text-base text-[#c4dfd4] font-normal leading-relaxed">
                  {t("howItWorks.heroSubtitle")}
                </p>

                {/* Primary & Secondary CTAs */}
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
                      setAuthGateAction("Create Buyer Account");
                      setAuthGateOpen(true);
                    }}
                    className="py-3.5 px-6 border border-white/25 bg-black/25 hover:bg-black/40 text-white text-sm font-semibold rounded-xl backdrop-blur-xs transition-colors text-center"
                  >
                    {t("cta.createAccount")}
                  </button>
                </div>

                {/* Quick Trust Highlights */}
                <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-xs text-[#a9c9bc]">
                  <div>
                    <strong className="text-white block font-bold text-sm">10 Stages</strong>
                    <span>Connected Lifecycle</span>
                  </div>
                  <div>
                    <strong className="text-white block font-bold text-sm">Human Vetted</strong>
                    <span>Central Trading Desk</span>
                  </div>
                  <div>
                    <strong className="text-white block font-bold text-sm">Audit-Ready</strong>
                    <span>EU CSRD / DPP</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Level Interactive Lifecycle Flow Diagram */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl bg-[#0d221b] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#c89b3c]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Transaction Pipeline Architecture
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#8ebfb0]">
                      Continuous Custody
                    </span>
                  </div>

                  {/* Flow Stages Grid Preview */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c89b3c]">01 &bull; SUPPLY</span>
                      <strong className="text-white block text-xs">Cooperative Batches</strong>
                      <span className="text-[11px] text-[#9fc0b2]">GPS parcel origin &amp; gross tonnage</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c89b3c]">02 &bull; CATALOG</span>
                      <strong className="text-white block text-xs">Marketplace Listing</strong>
                      <span className="text-[11px] text-[#9fc0b2]">Sanitized public discovery specs</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c89b3c]">03 &bull; DEMAND</span>
                      <strong className="text-white block text-xs">Buyer RFQ / Order</strong>
                      <span className="text-[11px] text-[#9fc0b2]">Structured industrial criteria</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c89b3c]">04 &bull; MATCH</span>
                      <strong className="text-white block text-xs">Trader Clearance</strong>
                      <span className="text-[11px] text-[#9fc0b2]">Human-controlled matching desk</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c89b3c]">05 &bull; NEGOTIATE</span>
                      <strong className="text-white block text-xs">Versioned Quotes</strong>
                      <span className="text-[11px] text-[#9fc0b2]">Itemized fee &amp; freight clarity</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c89b3c]">06 &bull; QUALITY</span>
                      <strong className="text-white block text-xs">ISO 17025 Lab Test</strong>
                      <span className="text-[11px] text-[#9fc0b2]">Moisture, shive &amp; fineness gate</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c89b3c]">07 &bull; CONTRACT</span>
                      <strong className="text-white block text-xs">Incoterm Agreement</strong>
                      <span className="text-[11px] text-[#9fc0b2]">EXW, FCA or DAP legal terms</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c89b3c]">08 &bull; LOGISTICS</span>
                      <strong className="text-white block text-xs">Carrier Transport</strong>
                      <span className="text-[11px] text-[#9fc0b2]">Milestone e-CMR custody logging</span>
                    </div>
                  </div>

                  {/* Terminal DPP Outcome Banner */}
                  <div className="p-3.5 rounded-xl bg-[#173f35] border border-[#c89b3c]/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#c89b3c] block">09 &bull; SETTLEMENT &rarr; 10 &bull; DPP</span>
                      <strong className="text-white">Audit-Ready Passport &amp; Custody Handoff</strong>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#c89b3c] text-[#13352c] font-bold text-[10px] uppercase">
                      Immutable
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — END-TO-END MASTER TIMELINE: 10 Connected Stages               */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#faf8f1] border-b border-[#ded8c4]" id="master-timeline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                {t("howItWorks.timelineTitle")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight mt-1">
                From Harvest to Industrial Receiving Gate
              </h2>
              <p className="mt-3 text-sm text-[#5c6e66] leading-relaxed">
                {t("howItWorks.timelineSubtitle")} Select any milestone below to inspect its operational criteria and generated artifacts.
              </p>
            </div>

            {/* Interactive Progress Rail / Step Selector */}
            <div className="mb-10 overflow-x-auto pb-3">
              <div className="flex items-center space-x-2 min-w-[820px]">
                {MASTER_STAGES.map((stage) => {
                  const isSelected = selectedStageId === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSelectedStageId(stage.id)}
                      className={`flex-1 py-3 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#173f35] text-white border-[#173f35] shadow-md ring-2 ring-[#c89b3c]"
                          : "bg-white text-[#5c6e66] border-[#ded8c4] hover:bg-[#eef6f2] hover:text-[#173f35]"
                      }`}
                    >
                      <span className="text-[10px] font-black block tracking-widest uppercase">
                        {stage.number}
                      </span>
                      <span className="text-[11px] font-bold truncate block mt-0.5">
                        {stage.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Stage Detail Showcase Card */}
            <div className="bg-white rounded-3xl border border-[#ded8c4] p-8 lg:p-10 shadow-sm transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left: Stage Title & Narrative */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-xl bg-[#1e5442] text-white flex items-center justify-center font-black text-sm">
                      {currentStage.number}
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#c89b3c] block">
                        STAGE {currentStage.number} &bull; {currentStage.shortName}
                      </span>
                      <h3 className="text-2xl font-extrabold text-[#173f35]">
                        {currentStage.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-[#4d5f57] leading-relaxed">
                    {currentStage.summary}
                  </p>

                  {/* Operational Criteria Checkpoints */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#173f35] block">
                      Execution Checkpoints:
                    </span>
                    <ul className="space-y-2 text-xs text-[#5c6e66]">
                      {currentStage.operationalDetails.map((detail, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <span className="text-[#c89b3c] font-bold mt-0.5">✓</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Operational Governance Snapshot */}
                <div className="lg:col-span-5 bg-[#faf8f1] rounded-2xl border border-[#ded8c4] p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6dfcd]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d8f85]">
                      Stage Governance
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1e5442] text-white text-[10px] font-bold">
                      {currentStage.badge}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#7d8f85] uppercase block font-semibold">
                        Primary Counterparty / Actor
                      </span>
                      <strong className="text-[#173f35] text-sm font-bold block mt-0.5">
                        {currentStage.actor}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#7d8f85] uppercase block font-semibold">
                        Authoritative Platform Artifact
                      </span>
                      <strong className="text-[#1e5442] text-sm font-bold block mt-0.5">
                        {currentStage.artifact}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#e6dfcd]">
                    <Link
                      href="/marketplace"
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#1e5442] hover:text-white border border-[#ded8c4] text-[#173f35] font-bold text-xs text-center block transition-colors shadow-2xs"
                    >
                      Explore Active Materials in Stage &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 — SUPPLY SIDE: Farmers, Cooperatives & Mills                    */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white border-b border-[#e4ded0]" id="supply-side">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  {t("howItWorks.supplyTitle")}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  How European Agricultural Supply Enters the Platform
                </h2>
                <p className="text-sm text-[#5c6e66] leading-relaxed">
                  For European farmers, agricultural cooperatives, and scutching mills, I Do Grow replaces fragmented broker networks with direct access to industrial procurement. Producers log real inventory with structured harvest parameters:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#faf8f1] border border-[#ded8c4]">
                    <strong className="text-[#173f35] block font-bold">Parcel Coordinates &amp; Harvest Date:</strong>
                    <span className="text-[#5c6e66]">GPS polygon mapping of field parcel and retting dates.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#faf8f1] border border-[#ded8c4]">
                    <strong className="text-[#173f35] block font-bold">Standardized Material Form:</strong>
                    <span className="text-[#5c6e66]">Retted straw, scutched line, short fibre, or shive pellets.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#faf8f1] border border-[#ded8c4]">
                    <strong className="text-[#173f35] block font-bold">Inventory Volume &amp; Target Price:</strong>
                    <span className="text-[#5c6e66]">Certified tonnage tallies and minimum contract volume.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#faf8f1] border border-[#ded8c4]">
                    <strong className="text-[#173f35] block font-bold">Mobile-First Supplier Onboarding:</strong>
                    <span className="text-[#5c6e66]">Assisted lot registration designed for cooperative weighbridges.</span>
                  </div>
                </div>

                <p className="text-xs text-[#6e8077] italic">
                  Supplier commercial confidentiality is preserved: parcel GPS and supplier legal entity details remain protected until mutual quote acceptance.
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border border-[#ded8c4] shadow-md bg-[#faf8f1]">
                  <img
                    src="/images/actor_producer_field.png"
                    alt="Agricultural producer in field inspecting harvested hemp crop"
                    className="w-full h-[380px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-white/40 text-xs text-[#173f35] flex items-center justify-between">
                    <div>
                      <span className="font-bold block">European Producer Intake Station</span>
                      <span className="text-[11px] text-[#5c6e66]">Verified cooperative lot staging</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#1e5442] text-white font-bold text-[10px]">
                      STAGE 01
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 & 5 — PUBLIC DISCOVERY & STRUCTURED BUY ORDER (Two Paths)       */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#faf8f1] border-b border-[#ded8c4]" id="two-entry-paths">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14 text-center mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                {t("howItWorks.entryPathsTitle")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight">
                Two Ways for Industrial Buyers to Source
              </h2>
              <p className="text-sm text-[#5c6e66] max-w-2xl mx-auto leading-relaxed">
                Whether you wish to purchase immediate inventory from published cooperative lots or issue custom manufacturing specifications, I Do Grow supports both procurement pathways.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PATH A: Browse Marketplace */}
              <div className="rounded-3xl border border-[#ded8c4] bg-white p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-[#1e5442] transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ece6d6]">
                    <span className="px-3 py-1 rounded-full bg-[#eef6f2] text-[#1e5442] text-xs font-bold uppercase tracking-wider">
                      PATH A &bull; IMMEDIATE INVENTORY
                    </span>
                    <span className="text-xs font-bold text-[#8c6b2d]">Live Catalogue</span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#173f35]">
                    Explore Published Marketplace Lots
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5c6e66] leading-relaxed">
                    Browse published European agricultural commodities ready for prompt commercial quote. Filter by technical fibre specs, moisture thresholds, harvest year, origin country, and certification standards.
                  </p>

                  <div className="space-y-2.5 pt-2 text-xs text-[#4d5f57]">
                    <div className="flex items-start space-x-2">
                      <span className="text-[#1e5442] font-bold">✓</span>
                      <span>Public open browsing — no registration needed to inspect technical specs.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#1e5442] font-bold">✓</span>
                      <span>Indicative volume and price per ton with laboratory grade indicators.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#1e5442] font-bold">✓</span>
                      <span>Click &quot;Request a Quote&quot; on any listing to begin commercial negotiation.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0ebd9]">
                  <Link
                    href="/marketplace"
                    className="w-full py-3 px-6 rounded-xl bg-[#1e5442] hover:bg-[#173f35] text-white font-bold text-xs text-center block transition-colors shadow-sm"
                  >
                    {t("cta.findProduct")} &rarr;
                  </Link>
                </div>
              </div>

              {/* PATH B: Structured Buy Order */}
              <div className="rounded-3xl border border-[#ded8c4] bg-white p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-[#c89b3c] transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ece6d6]">
                    <span className="px-3 py-1 rounded-full bg-[#fcf8ee] text-[#8c6b2d] border border-[#e2d8b8] text-xs font-bold uppercase tracking-wider">
                      PATH B &bull; CUSTOM DEMAND
                    </span>
                    <span className="text-xs font-bold text-[#1e5442]">Custom Procurement</span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#173f35]">
                    Create a Structured Buy Order
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5c6e66] leading-relaxed">
                    Can&apos;t find the exact product or need customized volume call-offs? Submit a formal Buy Order specifying your manufacturing requirements, destination gate, and target price.
                  </p>

                  <div className="space-y-2.5 pt-2 text-xs text-[#4d5f57]">
                    <div className="flex items-start space-x-2">
                      <span className="text-[#c89b3c] font-bold">✓</span>
                      <span>Specify commodity, quantity tolerances, and required Incoterms (DAP/FCA).</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#c89b3c] font-bold">✓</span>
                      <span>Define required certifications (OEKO-TEX, GOTS, Organic, FSC) and packaging.</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-[#c89b3c] font-bold">✓</span>
                      <span>Central Trading Desk matches candidate cooperatives and structures supply quotes.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0ebd9]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthGateAction("Create Buy Order");
                      setAuthGateOpen(true);
                    }}
                    className="w-full py-3 px-6 rounded-xl bg-[#c89b3c] hover:bg-[#b8860b] text-[#13352c] font-bold text-xs text-center block transition-colors shadow-sm"
                  >
                    {t("cta.createBuyOrder")} &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — MATCHING / TRADER: Human-Controlled Matching Desk            */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white border-b border-[#e4ded0]" id="trader-matching">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  {t("howItWorks.matchingTitle")}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  Human-Controlled Trade Matching &amp; Due Diligence
                </h2>
                <p className="text-sm text-[#5c6e66] leading-relaxed">
                  I Do Grow does not rely on opaque or autonomous AI matching. Commercial commodity trade requires experienced human judgment to balance technical tolerances, freight corridors, and counterparty viability.
                </p>

                <div className="space-y-3 pt-2 text-xs text-[#4d5f57]">
                  <div className="flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#eef6f2] text-[#1e5442] flex items-center justify-center font-bold shrink-0">
                      01
                    </span>
                    <div>
                      <strong className="text-[#173f35] block font-bold">Demand &amp; Candidate Supply Review:</strong>
                      <span>Comparing buyer tolerance thresholds directly against certified cooperative lot lab metrics.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#eef6f2] text-[#1e5442] flex items-center justify-center font-bold shrink-0">
                      02
                    </span>
                    <div>
                      <strong className="text-[#173f35] block font-bold">Geographic &amp; Logistics Viability:</strong>
                      <span>Evaluating freight haul distance, border crossings, and packaging suitability for multimodal transit.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#eef6f2] text-[#1e5442] flex items-center justify-center font-bold shrink-0">
                      03
                    </span>
                    <div>
                      <strong className="text-[#173f35] block font-bold">Match Approval Gate:</strong>
                      <span>Only verified matches move forward into the formal bilateral quotation workflow.</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f1] border border-[#ded8c4] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#173f35] block">Trader Matching Cockpit</span>
                    <span className="text-[11px] text-[#5c6e66]">Buyer Demand ⇄ Candidate Supply &rarr; Approved Match</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#1e5442] text-white font-bold text-[10px]">
                    STAGE 04
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border border-[#ded8c4] shadow-md bg-[#faf8f1]">
                  <img
                    src="/images/trader_platform.png"
                    alt="Commodity trader at platform operations cockpit reviewing supply and demand matching"
                    className="w-full h-[380px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-white/40 text-xs text-[#173f35] flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Central Trading Desk Operations</span>
                      <span className="text-[11px] text-[#5c6e66]">Active counterparty vetting &amp; clearance</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#1e5442] text-white font-bold text-[10px]">
                      HUMAN VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 — QUOTE & NEGOTIATION: Transparent Breakdown & Versioning       */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#faf8f1] border-b border-[#ded8c4]" id="quote-negotiation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                {t("howItWorks.quoteTitle")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight mt-1">
                Versioned Negotiation with Itemized Fee Clarity
              </h2>
              <p className="mt-3 text-sm text-[#5c6e66] leading-relaxed">
                Bilateral trade negotiations occur within an audit-controlled quotation workflow. Every price adjustment, Incoterm variation, or delivery adjustment creates a versioned quote record.
              </p>
            </div>

            {/* Gamified Negotiation Lifecycle Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-10 text-xs">
              <div className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-1">
                <span className="text-[10px] font-bold text-[#8c6b2d] block uppercase">Step 1</span>
                <strong className="text-[#173f35] block font-bold">Draft Quote</strong>
                <span className="text-[#5c6e66] text-[11px]">Trader structures preliminary costs</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-1">
                <span className="text-[10px] font-bold text-[#8c6b2d] block uppercase">Step 2</span>
                <strong className="text-[#173f35] block font-bold">Internal Review</strong>
                <span className="text-[#5c6e66] text-[11px]">Margin &amp; supplier validation</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-1">
                <span className="text-[10px] font-bold text-[#8c6b2d] block uppercase">Step 3</span>
                <strong className="text-[#173f35] block font-bold">Sent to Buyer</strong>
                <span className="text-[#5c6e66] text-[11px]">Buyer inspects line-item fees</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#ded8c4] space-y-1">
                <span className="text-[10px] font-bold text-[#8c6b2d] block uppercase">Step 4</span>
                <strong className="text-[#173f35] block font-bold">Counter-Proposal</strong>
                <span className="text-[#5c6e66] text-[11px]">Buyer adjusts target price or tonnage</span>
              </div>
              <div className="p-4 rounded-xl bg-[#eef6f2] border border-[#cbe6d7] space-y-1">
                <span className="text-[10px] font-bold text-[#1e5442] block uppercase">Step 5</span>
                <strong className="text-[#173f35] block font-bold">Mutual Acceptance</strong>
                <span className="text-[#1e5442] text-[11px]">Contract generation unlocked</span>
              </div>
            </div>

            {/* Line-Item Transparency Mockup */}
            <div className="bg-white rounded-3xl border border-[#ded8c4] p-8 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#ece6d6]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442] block">
                    Structured Line-Item Transparency
                  </span>
                  <span className="text-xs text-[#5c6e66]">Sample Quotation Breakdown (Quote IDG-QT-2026-0814)</span>
                </div>
                <span className="px-3 py-1 rounded bg-[#eef6f2] text-[#1e5442] text-xs font-bold">
                  VERSION 2 &bull; COUNTERED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-[#faf8f1] rounded-xl border border-[#ece6d6]">
                  <span className="text-[10px] text-[#7d8f85] uppercase block">Raw Commodity Value</span>
                  <strong className="text-[#173f35] font-bold">€1,450 / MT</strong>
                </div>
                <div className="p-3 bg-[#faf8f1] rounded-xl border border-[#ece6d6]">
                  <span className="text-[10px] text-[#7d8f85] uppercase block">Independent Lab Testing</span>
                  <strong className="text-[#173f35] font-bold">€45 / MT</strong>
                </div>
                <div className="p-3 bg-[#faf8f1] rounded-xl border border-[#ece6d6]">
                  <span className="text-[10px] text-[#7d8f85] uppercase block">Multimodal Freight (DAP)</span>
                  <strong className="text-[#173f35] font-bold">€180 / MT</strong>
                </div>
                <div className="p-3 bg-[#faf8f1] rounded-xl border border-[#ece6d6]">
                  <span className="text-[10px] text-[#7d8f85] uppercase block">IDG Service &amp; Governance</span>
                  <strong className="text-[#1e5442] font-bold">Included</strong>
                </div>
              </div>

              <p className="text-[11px] text-[#7d8f85] pt-2">
                No hidden spreads. Quotes include explicit allowances for packaging, freight, insurance, and taxes. Transactions never bind automatically until mutually approved.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8 & 9 — QUALITY GATE & STRUCTURED CONTRACT                        */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white border-b border-[#e4ded0]" id="quality-contract">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Section 8: Quality Gate */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  {t("howItWorks.qualityTitle")}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  The Quality Checkpoint Gate
                </h2>
                <p className="text-sm text-[#5c6e66] leading-relaxed">
                  Commercial agreement alone is not enough — physical quality is verified before dispatch. Certified testing laboratories conduct objective ISO 17025 tests, generating immutable certificates tied to batch IDs:
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#faf8f1] border border-[#ded8c4]">
                    <strong className="text-[#173f35] block font-bold">Moisture Testing:</strong>
                    <span className="text-[#5c6e66]">Standardized hygrometry preventing fiber mold in transit.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#faf8f1] border border-[#ded8c4]">
                    <strong className="text-[#173f35] block font-bold">Fineness &amp; Tenacity:</strong>
                    <span className="text-[#5c6e66]">Fibre length and diameter distribution analysis.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#faf8f1] border border-[#ded8c4]">
                    <strong className="text-[#173f35] block font-bold">Shive &amp; Impurities:</strong>
                    <span className="text-[#5c6e66]">Quantitative decortication purity metrics.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#faf8f1] border border-[#ded8c4]">
                    <strong className="text-[#173f35] block font-bold">Non-Conformity Gate:</strong>
                    <span className="text-[#5c6e66]">Failing batches are paused and arbitrated immediately.</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border border-[#ded8c4] shadow-md bg-[#faf8f1]">
                  <img
                    src="/images/quality_lab.png"
                    alt="Quality inspector conducting laboratory test on natural commodity fibers"
                    className="w-full h-[360px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-white/40 text-xs text-[#173f35] flex items-center justify-between">
                    <div>
                      <span className="font-bold block">ISO 17025 Accredited Laboratory</span>
                      <span className="text-[11px] text-[#5c6e66]">Cryptographic certificate issuance</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#1e5442] text-white font-bold text-[10px]">
                      STAGE 06
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 9: Structured Contract Mockup */}
            <div className="bg-[#faf8f1] rounded-3xl border border-[#ded8c4] p-8 lg:p-10 space-y-6">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  {t("howItWorks.contractTitle")}
                </span>
                <h3 className="text-2xl font-extrabold text-[#173f35]">
                  Structured Legal Contracts Under Binding Incoterms
                </h3>
                <p className="text-xs sm:text-sm text-[#5c6e66] leading-relaxed">
                  Upon accepted quote and quality approval, a formal digital sales contract is executed with clear legal demarcation of liabilities:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-white rounded-2xl border border-[#ded8c4]">
                  <span className="text-[10px] text-[#7d8f85] uppercase block font-semibold">Incoterms Definition</span>
                  <strong className="text-[#173f35] font-bold block mt-1">DAP / FCA / EXW</strong>
                  <span className="text-[11px] text-[#5c6e66]">Clear risk transfer point</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#ded8c4]">
                  <span className="text-[10px] text-[#7d8f85] uppercase block font-semibold">Quantity &amp; Tolerance</span>
                  <strong className="text-[#173f35] font-bold block mt-1">&plusmn;5% Weight Window</strong>
                  <span className="text-[11px] text-[#5c6e66]">Weighbridge verification</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#ded8c4]">
                  <span className="text-[10px] text-[#7d8f85] uppercase block font-semibold">Payment Milestones</span>
                  <strong className="text-[#173f35] font-bold block mt-1">Deposit &amp; Gate Balance</strong>
                  <span className="text-[11px] text-[#5c6e66]">Clear commercial schedule</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#ded8c4]">
                  <span className="text-[10px] text-[#7d8f85] uppercase block font-semibold">Governing Law</span>
                  <strong className="text-[#173f35] font-bold block mt-1">EU Commercial Code</strong>
                  <span className="text-[11px] text-[#5c6e66]">Arbitration clauses included</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10 & 11 — LOGISTICS TIMELINE & SETTLEMENT GOVERNANCE              */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#faf8f1] border-b border-[#ded8c4]" id="logistics-settlement">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Logistics Execution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden border border-[#ded8c4] shadow-md bg-white">
                  <img
                    src="/images/freight_port.png"
                    alt="Freight transport carrier loading natural raw material commodity shipment"
                    className="w-full h-[360px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-white/40 text-xs text-[#173f35] flex items-center justify-between">
                    <div>
                      <span className="font-bold block">European Logistics Corridor</span>
                      <span className="text-[11px] text-[#5c6e66]">Milestone-backed e-CMR tracking</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#1e5442] text-white font-bold text-[10px]">
                      STAGE 08
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  {t("howItWorks.logisticsTitle")}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  Multimodal Freight Execution &amp; Custody Logging
                </h2>
                <p className="text-sm text-[#5c6e66] leading-relaxed">
                  Logistics providers submit binding freight quotations for confirmed shipments. From cooperative dispatch to industrial factory gate arrival, every custody milestone is documented:
                </p>

                <div className="space-y-2.5 text-xs text-[#4d5f57]">
                  <div className="p-3 bg-white rounded-xl border border-[#ded8c4] flex items-center justify-between">
                    <span>1. Carrier Quoting &amp; Selection</span>
                    <strong className="text-[#1e5442]">Competitive FTL / Intermodal</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#ded8c4] flex items-center justify-between">
                    <span>2. Depot Pickup &amp; Moisture Check</span>
                    <strong className="text-[#1e5442]">Load Security Verified</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#ded8c4] flex items-center justify-between">
                    <span>3. Cross-Border Transit &amp; Customs</span>
                    <strong className="text-[#1e5442]">e-CMR Consignment Note</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#ded8c4] flex items-center justify-between">
                    <span>4. Factory Gate Delivery &amp; Tally</span>
                    <strong className="text-[#1e5442]">Signed Custody Handoff</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 11: Settlement Tracking Disclaimer & Ledger */}
            <div className="bg-[#173f35] text-white rounded-3xl p-8 lg:p-10 space-y-6 shadow-xl">
              <div className="max-w-3xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c89b3c]">
                  {t("howItWorks.settlementTitle")}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Administrative Settlement Tracking Only
                </h3>
                <p className="text-xs sm:text-sm text-[#c0d6cc] leading-relaxed">
                  I Do Grow operates as an administrative settlement coordinator — explicitly NOT as a bank, escrow agent, or payment processor. The platform records invoices, payment due dates, advance deposit proofs, credit notes, and final balance closures between verified counterparties.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                  <span className="text-[10px] text-[#8ebfb0] uppercase block">Invoicing</span>
                  <strong className="text-white block mt-1">Direct Seller Invoice</strong>
                  <span className="text-[11px] text-[#a8c6b9]">Cooperative legal billing</span>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                  <span className="text-[10px] text-[#8ebfb0] uppercase block">Deposit Tracking</span>
                  <strong className="text-white block mt-1">Advance Escrow Record</strong>
                  <span className="text-[11px] text-[#a8c6b9]">Milestone payment log</span>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                  <span className="text-[10px] text-[#8ebfb0] uppercase block">Credit &amp; Claims</span>
                  <strong className="text-white block mt-1">Discrepancy Resolution</strong>
                  <span className="text-[11px] text-[#a8c6b9]">Weight &amp; moisture adjustments</span>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/15">
                  <span className="text-[10px] text-[#8ebfb0] uppercase block">Platform Status</span>
                  <strong className="text-[#c89b3c] block mt-1">Settled &amp; Closed</strong>
                  <span className="text-[11px] text-[#a8c6b9]">Audit-ready ledger</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 12 — DIGITAL PRODUCT PASSPORT (DPP): Event Lifecycle               */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white border-b border-[#e4ded0]" id="dpp-lifecycle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                  {t("howItWorks.dppTitle")}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                  Full Provenance Captured in an Immutable Digital Passport
                </h2>
                <p className="text-sm text-[#5c6e66] leading-relaxed">
                  Every trade culminates in a transferable Digital Product Passport (DPP). Designed for EU ESPR and CSRD sustainability reporting, the passport links sequential immutable events from field harvest to delivery:
                </p>

                <div className="space-y-2.5 text-xs text-[#4d5f57]">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#1e5442] font-bold">1.</span>
                    <strong className="text-[#173f35]">Lot Created:</strong>
                    <span>Field coordinates, harvest year &amp; cooperative parcel ID</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#1e5442] font-bold">2.</span>
                    <strong className="text-[#173f35]">Inspection Event:</strong>
                    <span>ISO 17025 test parameters, laboratory certificate reference</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#1e5442] font-bold">3.</span>
                    <strong className="text-[#173f35]">Trade &amp; Contract:</strong>
                    <span>Accepted Incoterms, batch quantity &amp; agreed delivery gate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#1e5442] font-bold">4.</span>
                    <strong className="text-[#173f35]">Shipment &amp; Delivery:</strong>
                    <span>Signed e-CMR handoff &amp; final factory receiving timestamp</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/marketplace"
                    className="py-3 px-6 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-xl shadow-sm inline-block transition-colors"
                  >
                    Browse DPP-Enabled Materials &rarr;
                  </Link>
                </div>
              </div>

              {/* DPP Visual Mockup Card */}
              <div className="lg:col-span-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-[#0f2820] text-white border border-white/15 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <span className="w-10 h-10 rounded-xl bg-[#c89b3c] text-[#13352c] flex items-center justify-center font-bold text-xs">
                        DPP
                      </span>
                      <div>
                        <strong className="text-white text-sm block">Digital Product Passport</strong>
                        <span className="text-[10px] text-[#8ebfb0]">IDG-FR-2026-DPP-0941 &bull; v1.0</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#1e5442] text-[#c89b3c] text-[10px] font-bold uppercase">
                      VERIFIED LOT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-[#8ebfb0] uppercase block">Material Form</span>
                      <strong className="text-white">Technical Hemp Fibre</strong>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-[#8ebfb0] uppercase block">Origin Parcel</span>
                      <strong className="text-white">Aube, France (Coop #412)</strong>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-[#8ebfb0] uppercase block">Certified Moisture</span>
                      <strong className="text-[#c89b3c]">11.4% (ISO 17025)</strong>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-[#8ebfb0] uppercase block">ESG Compliance</span>
                      <strong className="text-white">EU ESPR &amp; CSRD Ready</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[11px] text-[#9fc0b2] flex items-center justify-between">
                    <span>Cryptographic Batch Hash: <code className="text-[#d4af37] font-mono">0x7c9f...a12e</code></span>
                    <span>Authorised Access Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 13 — ACTOR VIEW: Who Does What? (Interactive Role Matrix)         */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#faf8f1] border-b border-[#ded8c4]" id="actor-view">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
                {t("howItWorks.actorTitle")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173f35] tracking-tight mt-1">
                Five Distinct Ecosystem Responsibilities
              </h2>
              <p className="mt-3 text-sm text-[#5c6e66] leading-relaxed">
                Every transaction aligns five specialized counterparts under standardized data contracts. Click an actor below to inspect their portal tools and artifacts.
              </p>
            </div>

            {/* Interactive Role Selector Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {ACTOR_ROLES.map((actor) => (
                <button
                  key={actor.id}
                  type="button"
                  onClick={() => setSelectedActorId(actor.id)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedActorId === actor.id
                      ? "bg-[#173f35] text-white shadow-md ring-2 ring-[#c89b3c]"
                      : "bg-white border border-[#ded8c4] text-[#173f35] hover:bg-[#eef6f2]"
                  }`}
                >
                  {actor.roleName}
                </button>
              ))}
            </div>

            {/* Selected Actor Detailed Showcase Card */}
            <div className="bg-white rounded-3xl border border-[#ded8c4] p-8 lg:p-10 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden border border-[#ded8c4] shadow-md bg-[#faf8f1]">
                    <img
                      src={currentActor.image}
                      alt={currentActor.title}
                      className="w-full h-80 object-cover object-center"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#173f35] text-white text-xs font-bold uppercase tracking-wider">
                      {currentActor.roleName}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#c89b3c]">
                      Operational Profile
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#173f35] mt-1">
                      {currentActor.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5c6e66] mt-2 leading-relaxed">
                      {currentActor.summary}
                    </p>
                  </div>

                  {/* Core Responsibilities */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#173f35] block">
                      Core Supply Chain Responsibilities:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#5c6e66]">
                      {currentActor.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-[#c89b3c] font-bold">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Outputs */}
                  <div className="pt-2 border-t border-[#f0ebd9] flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#7d8f85]">Key Deliverables:</span>
                    {currentActor.keyOutputs.map((output, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-[#eef6f2] text-[#1e5442] font-semibold text-[11px] border border-[#cbe6d7]"
                      >
                        {output}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 15 — FINAL END-TO-END SUMMARY BANNER                              */}
        {/* ========================================================================= */}
        <section className="py-16 bg-[#173f35] text-white border-b border-[#0d231d]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c89b3c]">
              Complete Traceability Pathway
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              One Unified Journey: From Harvest to Factory Receiving Gate
            </h2>

            {/* Step-by-Step Chain Visualization */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-white pt-2">
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Supplier</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Listing</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Buyer RFQ</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Match</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Quote</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Quality Lab</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Contract</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Shipment</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">Settlement</span>
              <span className="text-[#c89b3c]">&rarr;</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#c89b3c] text-[#13352c] font-black">DPP Handoff</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 16 — FINAL CALL TO ACTION (Conversion Gateway)                     */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-[#143a2f] text-white border-b border-[#0d261e]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c89b3c]">
              Institutional Procurement Ready
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {t("howItWorks.ctaHeadline")}
            </h2>
            <p className="text-sm sm:text-base text-[#c4dfd4] max-w-2xl mx-auto font-normal leading-relaxed">
              {t("howItWorks.ctaSubtitle")}
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
      </main>

      {/* Institutional Footer */}
      <PublicFooter />

      {/* Authentication Gate Modal */}
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        actionName={authGateAction}
        returnTo="/marketplace"
      />
    </div>
  );
}
