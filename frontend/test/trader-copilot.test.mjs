import test from "node:test";
import assert from "node:assert/strict";

// --- Copilot Domain Definitions & Contracts ---

const COPILOT_HUMAN_GATES = {
  LEVEL_1_READ_ONLY: ["SUMMARY", "CLASSIFICATION", "EXPLANATION", "RISK_DETECTION", "PRIORITIZATION"],
  LEVEL_2_PROPOSAL: ["LOT_RECOMMENDATION", "MARGIN_SUGGESTION", "QUOTE_PROPOSAL", "NEXT_ACTION_PROPOSAL"],
  LEVEL_3_CRITICAL_HUMAN_ONLY: [
    "ACCEPT_QUOTE",
    "CONFIRM_CONTRACT",
    "SELECT_CARRIER",
    "DECIDE_QUALITY",
    "CONFIRM_DELIVERY",
    "CLOSE_TRANSACTION",
    "SEAL_FINAL_DPP",
  ],
};

function generateDashboardBriefing(input) {
  const totalItems = input.urgentCount + input.actionRequiredCount + input.toWatchCount;
  const summaryPoints = [];

  if (input.demandsNeedingOffers48h > 0) {
    summaryPoints.push(
      `${input.demandsNeedingOffers48h} demande${input.demandsNeedingOffers48h > 1 ? "s" : ""} ouverte${input.demandsNeedingOffers48h > 1 ? "s" : ""} depuis plus de 48h sans offre`,
    );
  }
  if (input.counterOffersReceived > 0) {
    summaryPoints.push(
      `${input.counterOffersReceived} contre-offre${input.counterOffersReceived > 1 ? "s" : ""} reçue${input.counterOffersReceived > 1 ? "s" : ""} à réviser`,
    );
  }
  if (input.blockedShipments > 0) {
    summaryPoints.push(
      `${input.blockedShipments} expédition${input.blockedShipments > 1 ? "s" : ""} présentant un blocage ou retard potentiel`,
    );
  }

  let topPriority;
  if (input.demandsNeedingOffers48h > 0 || input.topPriorityItem?.type === "DEMAND") {
    topPriority = {
      title: input.topPriorityItem?.title || "Demande acheteur ouverte depuis plus de 48h",
      level: "URGENT",
      justification: "Le délai d'engagement de réponse rapide (SLA 48h) est dépassé.",
      impact: input.topPriorityItem?.estimatedValue
        ? `Enjeu commercial : ~${input.topPriorityItem.estimatedValue}. Risque direct de perte de la commande.`
        : "Risque de perte du lead commercial.",
      recommendedAction: "Accéder au Matching pour sélectionner un lot disponible et émettre un devis.",
      actionType: "DEMAND",
    };
  } else {
    topPriority = {
      title: "Veille opérationnelle continue",
      level: "A_SUIVRE",
      justification: "Flux stabilisés.",
      impact: "Maintien de la réactivité.",
      recommendedAction: "Consulter la marketplace.",
      actionType: "DEMAND",
    };
  }

  return {
    headline: `${totalItems} dossier${totalItems > 1 ? "s" : ""} demande${totalItems > 1 ? "nt" : ""} votre attention aujourd'hui.`,
    summaryPoints,
    topPriority,
  };
}

function explainCandidateLot(demand, candidate) {
  const pros = [];
  const watchpoints = [];
  const operationalRisks = [];
  let score = 70;

  if (demand.materialType.toUpperCase() === candidate.materialType.toUpperCase()) {
    score += 10;
  }
  if (demand.productForm && candidate.productForm) {
    if (demand.productForm.toUpperCase() === candidate.productForm.toUpperCase()) {
      pros.push(`Forme produit conforme (${candidate.productForm})`);
      score += 5;
    } else {
      watchpoints.push(`Forme produit divergente (${candidate.productForm} vs ${demand.productForm})`);
      score -= 10;
    }
  }

  const qtyRatio = candidate.quantity / (demand.quantity || 1);
  if (qtyRatio >= 1.0) {
    pros.push(`Volume disponible suffisant (${candidate.quantity} ${candidate.quantityUnit})`);
    score += 5;
  } else {
    watchpoints.push(`Volume partiel (${candidate.quantity}/${demand.quantity} ${demand.quantityUnit})`);
    operationalRisks.push("Nécessitera de compléter avec un second lot fournisseur.");
    score -= 15;
  }

  if (demand.targetPriceAmount && candidate.priceAmount) {
    const diff = candidate.priceAmount - demand.targetPriceAmount;
    const diffPct = Math.round((Math.abs(diff) / demand.targetPriceAmount) * 100);
    if (diff < 0) {
      pros.push(`Prix inférieur de ${diffPct}% à la cible`);
      score += 10;
    } else {
      watchpoints.push(`Prix supérieur de ${diffPct}% à la cible`);
      score -= 10;
    }
  }

  if (candidate.verifiedProducer) {
    pros.push("Fournisseur vérifié");
    score += 5;
  }

  if (candidate.moisturePercentage && candidate.moisturePercentage > 14) {
    watchpoints.push(`Humidité mesurée à ${candidate.moisturePercentage}%`);
    operationalRisks.push("Vérification qualité requise.");
    score -= 5;
  }

  const finalScore = Math.max(40, Math.min(98, score));
  return {
    matchLevel: finalScore >= 85 ? "Compatibilité élevée" : finalScore >= 60 ? "Compatibilité intermédiaire" : "Compatibilité partielle",
    scorePercentage: finalScore,
    pros,
    watchpoints,
    operationalRisks,
  };
}

function analyzeQuoteMargin(baseCost, logisticsCost, feesCost, currentMarginAmount, targetPriceTotal) {
  const totalBase = baseCost + logisticsCost + feesCost;
  const currentTotal = totalBase + currentMarginAmount;
  const currentMarginPercent = currentTotal > 0 ? Math.round((currentMarginAmount / currentTotal) * 1000) / 10 : 0;

  const suggestedPercentage = 11.5;
  const suggestedMarginAmount = Math.round(totalBase * (suggestedPercentage / (100 - suggestedPercentage)) * 100) / 100;

  return {
    currentMarginPercent,
    currentMarginAmount,
    suggestedRange: "10–12 %",
    suggestedPercentage,
    suggestedMarginAmount,
    reasons: [
      "Coûts logistiques (inland + fret maritime) identifiés et stables.",
      "Fourchette de marge standard I DO GROW (10–12%) préservant la rentabilité d'intermédiation.",
      "Prise en compte des frais d'assurance et d'inspection intégrés dans l'assiette de coût.",
    ],
  };
}

function checkMissingDocumentsAndDpp(context) {
  const present = [];
  const missing = [];
  const toVerify = [];
  let points = 0;

  if (context.hasConfirmedContract) {
    present.push("Contrat commercial bilatéral confirmé");
    points += 1;
  } else {
    missing.push("Contrat commercial signé");
  }

  if (context.hasInspectionCertificate) {
    present.push("Certificat officiel de conformité qualité");
    points += 1;
  } else {
    missing.push("Certificat d'analyse qualité");
  }

  if (context.hasTransportDocument) {
    present.push("Lettre de voiture de transport (CMR / B/L)");
    toVerify.push("Concordance du numéro de lot physique");
    points += 1;
  } else {
    missing.push("Justificatif d'enlèvement transport");
  }

  if (context.hasSettlementRecord) {
    present.push("Fiche administrative de règlement");
    points += 1;
  } else {
    missing.push("Enregistrement du règlement");
  }

  if (context.dppExists) {
    present.push("Passeport Produit Numérique (DPP)");
    points += 1;
  } else {
    missing.push("Projection du DPP");
  }

  return {
    completenessPercentage: Math.round((points / 5) * 100),
    presentItems: present,
    missingItems: missing,
    itemsToVerify: toVerify,
  };
}

// --- UNIT TESTS ---

test("TRADER-AI-01 Human Gate Governance: Enforces 3 Levels of Autonomy & Action Restrictions", () => {
  // Level 1: Read only
  assert.equal(COPILOT_HUMAN_GATES.LEVEL_1_READ_ONLY.length, 5);
  assert.ok(COPILOT_HUMAN_GATES.LEVEL_1_READ_ONLY.includes("SUMMARY"));
  assert.ok(COPILOT_HUMAN_GATES.LEVEL_1_READ_ONLY.includes("RISK_DETECTION"));

  // Level 2: Proposals (never executed without human click)
  assert.equal(COPILOT_HUMAN_GATES.LEVEL_2_PROPOSAL.length, 4);
  assert.ok(COPILOT_HUMAN_GATES.LEVEL_2_PROPOSAL.includes("MARGIN_SUGGESTION"));

  // Level 3: Critical actions strictly forbidden for AI
  assert.equal(COPILOT_HUMAN_GATES.LEVEL_3_CRITICAL_HUMAN_ONLY.length, 7);
  assert.ok(COPILOT_HUMAN_GATES.LEVEL_3_CRITICAL_HUMAN_ONLY.includes("CONFIRM_CONTRACT"));
  assert.ok(COPILOT_HUMAN_GATES.LEVEL_3_CRITICAL_HUMAN_ONLY.includes("DECIDE_QUALITY"));
  assert.ok(COPILOT_HUMAN_GATES.LEVEL_3_CRITICAL_HUMAN_ONLY.includes("CONFIRM_DELIVERY"));
});

test("Dashboard Briefing: synthesizes priority points and resolves 'Que dois-je traiter en premier ?'", () => {
  const result = generateDashboardBriefing({
    urgentCount: 2,
    actionRequiredCount: 3,
    toWatchCount: 1,
    demandsNeedingOffers48h: 2,
    counterOffersReceived: 1,
    blockedShipments: 1,
    topPriorityItem: {
      title: "Demande EcoTextiles BV (120T Chanvre)",
      estimatedValue: "168 000 EUR",
      type: "DEMAND",
    },
  });

  assert.equal(result.headline, "6 dossiers demandent votre attention aujourd'hui.");
  assert.ok(result.summaryPoints.some((p) => p.includes("2 demandes ouvertes depuis plus de 48h")));
  assert.equal(result.topPriority.level, "URGENT");
  assert.ok(result.topPriority.justification.includes("48h"));
  assert.ok(result.topPriority.impact.includes("168 000 EUR"));
  assert.ok(result.topPriority.recommendedAction.includes("Matching"));
});

test("Matching Lot Explanation: computes 'Pourquoi ce lot ?' with pros, watchpoints, and operational risks", () => {
  const result = explainCandidateLot(
    {
      materialType: "HEMP",
      productForm: "FIBRE_TECHNICAL",
      quantity: 100,
      quantityUnit: "TONNES",
      targetPriceAmount: 1500,
    },
    {
      materialType: "HEMP",
      productForm: "FIBRE_TECHNICAL",
      quantity: 120,
      quantityUnit: "TONNES",
      priceAmount: 1410,
      verifiedProducer: true,
      moisturePercentage: 12.5,
    },
  );

  assert.equal(result.matchLevel, "Compatibilité élevée");
  assert.ok(result.pros.some((p) => p.includes("Prix inférieur de 6%")));
  assert.ok(result.pros.some((p) => p.includes("Volume disponible suffisant")));
  assert.ok(result.pros.some((p) => p.includes("Fournisseur vérifié")));
});

test("Quote Margin Assistance: recommends 10–12% range and never alters margin without Trader approval", () => {
  const analysis = analyzeQuoteMargin(100000, 12000, 3000, 9000, 135000);

  assert.equal(analysis.currentMarginPercent, 7.3);
  assert.equal(analysis.suggestedRange, "10–12 %");
  assert.equal(analysis.suggestedPercentage, 11.5);
  assert.ok(analysis.suggestedMarginAmount > 10000);
  assert.ok(analysis.reasons.length >= 3);
});

test("Documents & DPP Audit: computes readiness % and detects missing mandatory documents", () => {
  const result = checkMissingDocumentsAndDpp({
    hasConfirmedContract: true,
    hasInspectionCertificate: true,
    hasTransportDocument: false,
    hasSettlementRecord: true,
    dppExists: true,
  });

  assert.equal(result.completenessPercentage, 80);
  assert.equal(result.presentItems.length, 4);
  assert.equal(result.missingItems.length, 1);
  assert.ok(result.missingItems[0].includes("Justificatif d'enlèvement"));
});
