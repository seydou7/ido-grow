/**
 * Trader Copilot Service — Contextual Intelligence for I DO GROW (TRADER-AI-01)
 *
 * Implements bounded, explainable contextual AI assistance across Trader workflows:
 * - Dashboard: Daily operational briefing & "Que dois-je traiter en premier ?"
 * - Matching: "Pourquoi ce lot ?" (pros, watchpoints, risks, compatibility)
 * - Comparison: "Résumer les différences" (economic, quality, lead time, tradeoffs, recommendation)
 * - Quote Builder: "Suggérer une marge" / "Analyser ce devis" with explicit human apply gate
 * - Transaction Overview: 360° dossier synthesis with backend fallback
 * - Quality: Inspection measurements, conformity, and risks synthesis
 * - Logistics: Shipment diagnostics & blockage root-cause analysis
 * - Documents / DPP: Missing documents detection & DPP completeness audit
 *
 * Security & Governance:
 * - Trader margins and internal costs are strictly protected and NEVER leaked to counterparty views.
 * - Human-in-the-loop: Level 1 (Read-only), Level 2 (Proposal with Trader approval), Level 3 (Critical human-only actions).
 * - Resilient fallback: Graceful degradation if backend AI services are unreachable.
 */

import { initiateAgentRun, getAgentRunById } from "./api";
import type { StructuredAiOutputEnvelope } from "./contracts";

// ============================================================================
// 1. DASHBOARD BRIEFING TYPES & SERVICE
// ============================================================================

export interface DashboardBriefingInput {
  readonly urgentCount: number;
  readonly actionRequiredCount: number;
  readonly toWatchCount: number;
  readonly demandsNeedingOffers48h: number;
  readonly counterOffersReceived: number;
  readonly blockedShipments: number;
  readonly reviewsPending: number;
  readonly inspectionsPending: number;
  readonly topPriorityItem?: {
    readonly id: string;
    readonly title: string;
    readonly counterparty: string;
    readonly ageHours?: number;
    readonly estimatedValue?: string;
    readonly type: "DEMAND" | "COUNTER_OFFER" | "SHIPMENT" | "QUOTE" | "INSPECTION";
  } | null;
}

export interface DashboardBriefingResult {
  readonly headline: string;
  readonly summaryPoints: readonly string[];
  readonly topPriority: {
    readonly title: string;
    readonly level: "URGENT" | "ACTION_REQUISE" | "A_SUIVRE";
    readonly justification: string;
    readonly impact: string;
    readonly recommendedAction: string;
    readonly actionType: "DEMAND" | "COUNTER_OFFER" | "SHIPMENT" | "QUOTE" | "INSPECTION";
  };
}

export function generateDashboardBriefing(input: DashboardBriefingInput): DashboardBriefingResult {
  const totalItems = input.urgentCount + input.actionRequiredCount + input.toWatchCount;

  const summaryPoints: string[] = [];
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
  if (input.reviewsPending > 0) {
    summaryPoints.push(
      `${input.reviewsPending} devis en attente de validation interne`,
    );
  }
  if (input.inspectionsPending > 0) {
    summaryPoints.push(
      `${input.inspectionsPending} lot${input.inspectionsPending > 1 ? "s" : ""} en attente de décision de contrôle qualité`,
    );
  }

  // Fallback if counts are empty
  if (summaryPoints.length === 0) {
    summaryPoints.push("Tous les flux commerciaux et logistiques sont actuellement sous contrôle.");
  }

  // Determine top priority
  let topPriority: DashboardBriefingResult["topPriority"];

  if (input.demandsNeedingOffers48h > 0 || input.topPriorityItem?.type === "DEMAND") {
    topPriority = {
      title: input.topPriorityItem?.title || "Demande acheteur ouverte depuis plus de 48h",
      level: "URGENT",
      justification: "Le délai d'engagement de réponse rapide (SLA 48h) est dépassé. L'acheteur risque de sourcer auprès d'un autre canal.",
      impact: input.topPriorityItem?.estimatedValue
        ? `Enjeu commercial : ~${input.topPriorityItem.estimatedValue}. Risque direct de perte de la commande.`
        : "Risque de détérioration du taux de conversion et de perte du client industriel.",
      recommendedAction: "Accéder au Matching pour sélectionner un lot disponible et émettre un devis.",
      actionType: "DEMAND",
    };
  } else if (input.counterOffersReceived > 0 || input.topPriorityItem?.type === "COUNTER_OFFER") {
    topPriority = {
      title: input.topPriorityItem?.title || "Contre-offre acheteur reçue",
      level: "URGENT",
      justification: "L'acheteur a proposé des conditions révisées. La négociation commerciale est active.",
      impact: "Possibilité de conclure la transaction immédiatement en ajustant la marge ou la logistique.",
      recommendedAction: "Ouvrir la négociation pour accepter ou soumettre un devis révisé.",
      actionType: "COUNTER_OFFER",
    };
  } else if (input.blockedShipments > 0 || input.topPriorityItem?.type === "SHIPMENT") {
    topPriority = {
      title: input.topPriorityItem?.title || "Expédition en attente de transporteur",
      level: "ACTION_REQUISE",
      justification: "Le contrat est confirmé mais le transport n'a pas encore de cotation retenue ou accuse un retard d'enlèvement.",
      impact: "Risque de non-respect du délai de livraison convenu (Incoterm) et pénalités de retard.",
      recommendedAction: "Vérifier les cotations des transporteurs et sélectionner l'offre de fret.",
      actionType: "SHIPMENT",
    };
  } else if (input.inspectionsPending > 0) {
    topPriority = {
      title: "Rapport de contrôle qualité à formaliser",
      level: "ACTION_REQUISE",
      justification: "Les prélèvements ont été réalisés. Le certificat de conformité doit être validé pour débloquer l'enlèvement.",
      impact: "Le lot ne peut pas être expédié sans certificat de conformité valide.",
      recommendedAction: "Consulter la fiche qualité et émettre la décision d'agrément.",
      actionType: "INSPECTION",
    };
  } else {
    topPriority = {
      title: "Veille opérationnelle & sourcing continu",
      level: "A_SUIVRE",
      justification: "Aucun blocage critique immédiat.",
      impact: "Maintien d'un niveau élevé de réactivité sur les futures demandes entrantes.",
      recommendedAction: "Consulter la Marketplace pour identifier de nouveaux producteurs disponibles.",
      actionType: "DEMAND",
    };
  }

  return {
    headline: `${totalItems} dossier${totalItems > 1 ? "s" : ""} nécessite${totalItems > 1 ? "nt" : ""} votre attention aujourd'hui.`,
    summaryPoints,
    topPriority,
  };
}

// ============================================================================
// 2. MATCHING LOT EXPLANATION ("Pourquoi ce lot ?")
// ============================================================================

export interface LotExplanationInput {
  readonly demand: {
    readonly materialType: string;
    readonly productForm?: string | null;
    readonly quantity: number;
    readonly quantityUnit: string;
    readonly deliveryCountry?: string | null;
    readonly targetPriceAmount?: number | null;
    readonly currency: string;
  };
  readonly candidate: {
    readonly id: string;
    readonly title: string;
    readonly organisationName: string;
    readonly materialType: string;
    readonly productForm?: string | null;
    readonly quantity: number;
    readonly quantityUnit: string;
    readonly priceAmount?: number | null;
    readonly currency: string;
    readonly originCountry?: string | null;
    readonly verifiedProducer?: boolean;
    readonly harvestYear?: number | null;
    readonly moisturePercentage?: number | null;
    readonly certification?: string | null;
  };
}

export interface LotExplanationResult {
  readonly matchLevel: "Compatibilité élevée" | "Compatibilité intermédiaire" | "Compatibilité partielle";
  readonly scorePercentage: number;
  readonly pros: readonly string[];
  readonly watchpoints: readonly string[];
  readonly operationalRisks: readonly string[];
  readonly summaryText: string;
}

export function explainCandidateLot(input: LotExplanationInput): LotExplanationResult {
  const { demand, candidate } = input;
  const pros: string[] = [];
  const watchpoints: string[] = [];
  const operationalRisks: string[] = [];

  let score = 70;

  // 1. Material & Form
  if (demand.materialType.toUpperCase() === candidate.materialType.toUpperCase()) {
    score += 10;
  }
  if (demand.productForm && candidate.productForm) {
    if (demand.productForm.toUpperCase() === candidate.productForm.toUpperCase()) {
      pros.push(`Forme produit strictement conforme (${candidate.productForm})`);
      score += 5;
    } else {
      watchpoints.push(`Forme produit divergente (${candidate.productForm} proposé vs ${demand.productForm} demandé)`);
      score -= 10;
    }
  }

  // 2. Quantity
  const qtyRatio = candidate.quantity / (demand.quantity || 1);
  if (qtyRatio >= 1.0) {
    pros.push(`Volume disponible suffisant (${candidate.quantity} ${candidate.quantityUnit} pour ${demand.quantity} ${demand.quantityUnit} demandés)`);
    score += 5;
  } else {
    watchpoints.push(`Volume partiel (${candidate.quantity} ${candidate.quantityUnit} disponibles sur ${demand.quantity} demandés — couverture de ${(qtyRatio * 100).toFixed(0)}%)`);
    operationalRisks.push("Nécessitera de compléter avec un second lot fournisseur pour honorer l'intégralité de la demande.");
    score -= 15;
  }

  // 3. Price comparison
  if (demand.targetPriceAmount && candidate.priceAmount) {
    const diff = candidate.priceAmount - demand.targetPriceAmount;
    const diffPct = Math.round((Math.abs(diff) / demand.targetPriceAmount) * 100);
    if (diff < 0) {
      pros.push(`Prix fournisseur inférieur de ${diffPct}% à la cible acheteur (marge Trader optimisée)`);
      score += 10;
    } else if (diff === 0) {
      pros.push("Prix fournisseur exactement aligné sur la cible acheteur");
      score += 5;
    } else {
      watchpoints.push(`Prix fournisseur supérieur de ${diffPct}% à la cible acheteur`);
      operationalRisks.push("Ajustement de marge nécessaire pour préserver la compétitivité du devis final.");
      score -= 10;
    }
  } else if (candidate.priceAmount) {
    pros.push(`Prix compétitif dans les fourchettes marché (${candidate.priceAmount} ${candidate.currency}/${candidate.quantityUnit})`);
  }

  // 4. Producer reliability
  if (candidate.verifiedProducer !== false) {
    pros.push(`Fournisseur vérifié (${candidate.organisationName}) avec documentation KYC conforme`);
    score += 5;
  }

  // 5. Origin & Logistics
  if (candidate.originCountry) {
    if (demand.deliveryCountry && candidate.originCountry === demand.deliveryCountry) {
      pros.push(`Approvisionnement local (${candidate.originCountry}) réduisant le coût de transport et le bilan carbone`);
      score += 5;
    } else {
      pros.push(`Origine certifiée ${candidate.originCountry}`);
    }
  }

  // 6. Moisture & Technical Specs
  if (candidate.moisturePercentage !== undefined && candidate.moisturePercentage !== null) {
    if (candidate.moisturePercentage > 14) {
      watchpoints.push(`Humidité mesurée à ${candidate.moisturePercentage}% (légèrement supérieure à la norme standard de 12–13%)`);
      operationalRisks.push("Prévoir une vérification au contrôle qualité pour éviter des risques de fermentation lors du transit.");
      score -= 5;
    } else {
      pros.push(`Taux d'humidité optimal (${candidate.moisturePercentage}%) garantissant une excellente conservation`);
    }
  }

  // Clamp score
  const finalScore = Math.max(40, Math.min(98, score));
  let matchLevel: LotExplanationResult["matchLevel"] = "Compatibilité intermédiaire";
  if (finalScore >= 85) matchLevel = "Compatibilité élevée";
  else if (finalScore < 60) matchLevel = "Compatibilité partielle";

  const summaryText =
    finalScore >= 85
      ? `Ce lot de ${candidate.organisationName} constitue une excellente opportunité pour répondre immédiatement aux exigences techniques et budgétaires de l'acheteur.`
      : `Ce lot présente des atouts solides sur le volume ou le prix, mais demande un arbitrage sur les écarts techniques ou géographiques recensés.`;

  return {
    matchLevel,
    scorePercentage: finalScore,
    pros,
    watchpoints,
    operationalRisks,
    summaryText,
  };
}

// ============================================================================
// 3. COMPARISON SYNTHESIS ("Résumer les différences")
// ============================================================================

export interface ComparisonCandidateItem {
  readonly id: string;
  readonly organisationName: string;
  readonly title: string;
  readonly priceAmount?: number | null;
  readonly currency: string;
  readonly quantity: number;
  readonly quantityUnit: string;
  readonly originCountry?: string | null;
  readonly certification?: string | null;
  readonly harvestYear?: number | null;
  readonly moisturePercentage?: number | null;
}

export interface ComparisonSynthesisResult {
  readonly bestEconomicChoice: {
    readonly organisationName: string;
    readonly detail: string;
  };
  readonly bestQualityChoice: {
    readonly organisationName: string;
    readonly detail: string;
  };
  readonly bestAvailabilityChoice: {
    readonly organisationName: string;
    readonly detail: string;
  };
  readonly keyTradeoffs: readonly string[];
  readonly recommendation: string;
}

export function summarizeCandidateComparison(
  demandQuantity: number,
  candidates: readonly ComparisonCandidateItem[],
): ComparisonSynthesisResult {
  if (candidates.length === 0) {
    return {
      bestEconomicChoice: { organisationName: "N/A", detail: "Aucun lot sélectionné" },
      bestQualityChoice: { organisationName: "N/A", detail: "Aucun lot sélectionné" },
      bestAvailabilityChoice: { organisationName: "N/A", detail: "Aucun lot sélectionné" },
      keyTradeoffs: [],
      recommendation: "Sélectionnez au moins 2 lots pour générer une synthèse comparative.",
    };
  }

  // 1. Sort by price for best economic
  const priced = [...candidates].filter((c) => typeof c.priceAmount === "number");
  const bestEco = priced.length > 0
    ? priced.reduce((min, curr) => ((curr.priceAmount || 0) < (min.priceAmount || 0) ? curr : min), priced[0])
    : candidates[0];

  // 2. Sort for best availability
  const bestAvail = [...candidates].reduce(
    (max, curr) => (curr.quantity > max.quantity ? curr : max),
    candidates[0],
  );

  // 3. Quality choice: certification or harvest year or lowest moisture
  const bestQual = [...candidates].reduce((best, curr) => {
    let scoreCurr = 0;
    let scoreBest = 0;
    if (curr.certification && curr.certification !== "NONE") scoreCurr += 2;
    if (best.certification && best.certification !== "NONE") scoreBest += 2;
    if ((curr.harvestYear || 0) > (best.harvestYear || 0)) scoreCurr += 1;
    if (curr.moisturePercentage && curr.moisturePercentage <= 13) scoreCurr += 1;
    return scoreCurr >= scoreBest ? curr : best;
  }, candidates[0]);

  // Tradeoffs
  const tradeoffs: string[] = [];
  if (bestEco.id !== bestQual.id) {
    tradeoffs.push(
      `Arbitrage Prix vs Qualité : ${bestEco.organisationName} propose l'offre la plus économique (${bestEco.priceAmount} ${bestEco.currency}), alors que ${bestQual.organisationName} apporte des garanties de certification supérieures.`,
    );
  }
  if (bestAvail.quantity < demandQuantity) {
    tradeoffs.push(
      `Disponibilité globale : Aucun des lots ne couvre seul la totalité des ${demandQuantity} tonnes demandées ; un approvisionnement mixte est envisageable.`,
    );
  } else {
    tradeoffs.push(
      `${bestAvail.organisationName} garantit une livraison complète en un seul lot (${bestAvail.quantity} ${bestAvail.quantityUnit}).`,
    );
  }

  let recommendation = `Si le critère prépondérant de l'acheteur est la compétitivité tarifaire, privilégiez ${bestEco.organisationName}. Si le cahier des charges exige une certification stricte ou une traçabilité premium, retenez ${bestQual.organisationName}.`;
  if (bestEco.id === bestQual.id) {
    recommendation = `${bestEco.organisationName} combine le prix le plus attractif et le meilleur niveau de spécification technique. C'est l'option recommandée pour le devisage.`;
  }

  return {
    bestEconomicChoice: {
      organisationName: bestEco.organisationName,
      detail: `${bestEco.priceAmount ?? "Prix TBD"} ${bestEco.currency}/${bestEco.quantityUnit}`,
    },
    bestQualityChoice: {
      organisationName: bestQual.organisationName,
      detail: bestQual.certification || `Récolte ${bestQual.harvestYear || "récente"}`,
    },
    bestAvailabilityChoice: {
      organisationName: bestAvail.organisationName,
      detail: `${bestAvail.quantity} ${bestAvail.quantityUnit} disponibles`,
    },
    keyTradeoffs: tradeoffs,
    recommendation,
  };
}

// ============================================================================
// 4. QUOTE MARGIN ASSISTANCE ("Suggérer une marge" / "Analyser ce devis")
// ============================================================================

export interface QuoteMarginAnalysisInput {
  readonly productValue: number;
  readonly logisticsTotal: number;
  readonly ancillaryFeesTotal: number;
  readonly currentMarginAmount: number;
  readonly targetPriceTotal?: number | null;
  readonly currency: string;
}

export interface QuoteMarginAnalysisResult {
  readonly currentMarginPercent: number;
  readonly currentMarginAmount: number;
  readonly suggestedRange: string;
  readonly suggestedPercentage: number;
  readonly suggestedMarginAmount: number;
  readonly calculatedTargetDifference?: {
    readonly isBelowTarget: boolean;
    readonly differenceAmount: number;
    readonly message: string;
  } | null;
  readonly reasons: readonly string[];
}

export function analyzeQuoteMargin(input: QuoteMarginAnalysisInput): QuoteMarginAnalysisResult {
  const baseCost = input.productValue + input.logisticsTotal + input.ancillaryFeesTotal;
  const totalCurrentPrice = baseCost + input.currentMarginAmount;

  const currentMarginPercent =
    totalCurrentPrice > 0
      ? Math.round((input.currentMarginAmount / totalCurrentPrice) * 1000) / 10
      : 0;

  // Recommended default range is 10–12%
  const suggestedPercentage = 11.5;
  const suggestedMarginAmount =
    baseCost > 0
      ? Math.round(baseCost * (suggestedPercentage / (100 - suggestedPercentage)) * 100) / 100
      : 0;

  const reasons: string[] = [
    "Coûts logistiques (inland + fret maritime) identifiés et stables.",
    "Fourchette de marge standard I DO GROW (10–12%) préservant la rentabilité d'intermédiation.",
    "Prise en compte des frais d'assurance et d'inspection intégrés dans l'assiette de coût.",
  ];

  let calculatedTargetDifference: QuoteMarginAnalysisResult["calculatedTargetDifference"] = null;

  if (input.targetPriceTotal && input.targetPriceTotal > 0) {
    const proposedTotalWithSuggested = baseCost + suggestedMarginAmount;
    const diff = proposedTotalWithSuggested - input.targetPriceTotal;
    if (diff <= 0) {
      reasons.push(
        `Prix final proposé (${proposedTotalWithSuggested.toFixed(2)} ${input.currency}) reste inférieur au budget acheteur (${input.targetPriceTotal.toFixed(2)} ${input.currency}).`,
      );
      calculatedTargetDifference = {
        isBelowTarget: true,
        differenceAmount: Math.abs(diff),
        message: `Marge confortable : vous êtes en dessous du prix plafond de l'acheteur de ${Math.abs(diff).toFixed(2)} ${input.currency}.`,
      };
    } else {
      reasons.push(
        `Attention : le prix final avec 11.5% dépasse le budget acheteur de ${diff.toFixed(2)} ${input.currency}. Vous pouvez ajuster vers 8–9% si l'acheteur est sensible au prix.`,
      );
      calculatedTargetDifference = {
        isBelowTarget: false,
        differenceAmount: diff,
        message: `Dépassement du budget acheteur de ${diff.toFixed(2)} ${input.currency}.`,
      };
    }
  }

  return {
    currentMarginPercent,
    currentMarginAmount: input.currentMarginAmount,
    suggestedRange: "10–12 %",
    suggestedPercentage,
    suggestedMarginAmount,
    calculatedTargetDifference,
    reasons,
  };
}

// ============================================================================
// 5. TRANSACTION 360° OVERVIEW SYNTHESIS ("Résumer ce dossier")
// ============================================================================

export interface TransactionOverviewContext {
  readonly tradeId: string;
  readonly tradeNumber: string;
  readonly materialType: string;
  readonly quantity: number;
  readonly quantityUnit: string;
  readonly totalCommercialAmount: number;
  readonly currency: string;
  readonly isContractConfirmed: boolean;
  readonly contractNumber?: string | null;
  readonly inspectionStatus?: string | null;
  readonly inspectionDecision?: string | null;
  readonly shipmentStatus?: string | null;
  readonly shipmentCarrier?: string | null;
  readonly isDelivered: boolean;
  readonly paymentStatus?: string | null;
  readonly dppStatus?: string | null;
}

export interface TransactionOverviewResult {
  readonly commercialStatus: "OK" | "EN_ATTENTE" | "A_CONFIRMER";
  readonly qualityStatus: "CONFORME" | "EN_COURS" | "A_INSPECTER" | "NON_CONFORME";
  readonly logisticsStatus: "LIVRE" | "EN_TRANSIT" | "PLANIFIE" | "RETARD_ESTIME" | "NON_INITIE";
  readonly documentsStatus: "COMPLET" | "PARTIEL" | "INCOMPLET";
  readonly overallSummary: string;
  readonly priorityNextAction: string;
  readonly potentialBlockages: readonly string[];
}

export async function summarizeTransactionDossier(
  context: TransactionOverviewContext,
): Promise<TransactionOverviewResult> {
  // 1. Try to invoke existing backend agent run if available
  try {
    const runResponse = await initiateAgentRun({
      agentKey: "TRADER_CONTEXT_ASSISTANT",
      targetResourceType: "TRADE",
      targetResourceId: context.tradeId,
    });

    if (runResponse && runResponse.runId) {
      const detail = await getAgentRunById(runResponse.runId);
      if (detail && detail.summary) {
        // Parse backend structured synthesis
        return buildSynthesisFromBackend(context, detail.summary);
      }
    }
  } catch {
    // Graceful fallback to deterministic synthesis
  }

  return buildDeterministicTransactionSynthesis(context);
}

function buildSynthesisFromBackend(
  context: TransactionOverviewContext,
  backendSummary: string,
): TransactionOverviewResult {
  const deterministic = buildDeterministicTransactionSynthesis(context);
  return {
    ...deterministic,
    overallSummary: backendSummary || deterministic.overallSummary,
  };
}

function buildDeterministicTransactionSynthesis(
  context: TransactionOverviewContext,
): TransactionOverviewResult {
  const potentialBlockages: string[] = [];

  // Commercial
  let commercialStatus: TransactionOverviewResult["commercialStatus"] = "A_CONFIRMER";
  if (context.isContractConfirmed) {
    commercialStatus = "OK";
  } else {
    potentialBlockages.push("Contrat commercial non encore confirmé par les deux parties.");
  }

  // Quality
  let qualityStatus: TransactionOverviewResult["qualityStatus"] = "A_INSPECTER";
  if (context.inspectionDecision === "APPROVED") {
    qualityStatus = "CONFORME";
  } else if (context.inspectionDecision === "REJECTED") {
    qualityStatus = "NON_CONFORME";
    potentialBlockages.push("Contrôle qualité NON CONFORME : lot rejeté ou soumis à réclamation.");
  } else if (context.inspectionStatus === "IN_PROGRESS" || context.inspectionStatus === "ASSIGNED") {
    qualityStatus = "EN_COURS";
  }

  // Logistics
  let logisticsStatus: TransactionOverviewResult["logisticsStatus"] = "NON_INITIE";
  if (context.isDelivered) {
    logisticsStatus = "LIVRE";
  } else if (context.shipmentStatus === "IN_TRANSIT") {
    logisticsStatus = "EN_TRANSIT";
  } else if (context.shipmentStatus === "CARRIER_SELECTED") {
    logisticsStatus = "PLANIFIE";
  } else if (context.shipmentStatus === "QUOTE_REQUESTED") {
    logisticsStatus = "RETARD_ESTIME";
    potentialBlockages.push("Cotation fret en attente d'attribution : expédition non sécurisée.");
  }

  // Documents
  let documentsStatus: TransactionOverviewResult["documentsStatus"] = "INCOMPLET";
  if (context.dppStatus === "ACTIVE" && context.paymentStatus === "SETTLED") {
    documentsStatus = "COMPLET";
  } else if (context.dppStatus || context.paymentStatus === "PARTIALLY_RECORDED") {
    documentsStatus = "PARTIEL";
  }

  // Priority action
  let priorityNextAction = "Vérifier le dossier global.";
  if (!context.isContractConfirmed) {
    priorityNextAction = "Faire signer et confirmer le contrat commercial avant d'engager les frais.";
  } else if (qualityStatus === "A_INSPECTER") {
    priorityNextAction = "Mandater l'inspecteur pour vérifier le lot avant expédition.";
  } else if (logisticsStatus === "NON_INITIE" || logisticsStatus === "RETARD_ESTIME") {
    priorityNextAction = "Sélectionner la cotation de transport pour planifier l'enlèvement.";
  } else if (!context.isDelivered) {
    priorityNextAction = "Vérifier le document de transport (CMR / BL) avant livraison chez l'acheteur.";
  } else if (documentsStatus !== "COMPLET") {
    priorityNextAction = "Clôturer le règlement financier et publier la version finale du DPP.";
  } else {
    priorityNextAction = "Dossier achevé avec succès. Archiver la transaction.";
  }

  const overallSummary = `Dossier ${context.tradeNumber} (${context.materialType}, ${context.quantity} ${context.quantityUnit}). Commercial : ${commercialStatus}. Qualité : ${qualityStatus}. Logistique : ${logisticsStatus}. Documents : ${documentsStatus}.`;

  return {
    commercialStatus,
    qualityStatus,
    logisticsStatus,
    documentsStatus,
    overallSummary,
    priorityNextAction,
    potentialBlockages,
  };
}

// ============================================================================
// 6. QUALITY INSPECTION SYNTHESIS ("Résumer l'inspection")
// ============================================================================

export interface QualityInspectionContext {
  readonly inspectionReference: string;
  readonly status: string;
  readonly inspectionMethod?: string | null;
  readonly moisturePercentage?: number | null;
  readonly impurityPercentage?: number | null;
  readonly technicalNotes?: string | null;
  readonly nonConformitiesCount: number;
  readonly openNonConformitiesCount: number;
  readonly evidenceCount: number;
  readonly decision?: string | null;
  readonly classificationLabel?: string | null;
  readonly hasCertificate: boolean;
}

export interface QualityInspectionResult {
  readonly summary: string;
  readonly keyMeasurements: readonly { readonly label: string; readonly value: string; readonly isCompliant: boolean }[];
  readonly conformityStatus: "CONFORME" | "NON_CONFORME" | "EVALUATION_EN_COURS";
  readonly identifiedRisks: readonly string[];
  readonly humanDecisionGate: string;
}

export function summarizeQualityInspection(
  context: QualityInspectionContext,
): QualityInspectionResult {
  const measurements: { label: string; value: string; isCompliant: boolean }[] = [];
  const risks: string[] = [];

  if (context.moisturePercentage !== undefined && context.moisturePercentage !== null) {
    const isCompliant = context.moisturePercentage <= 13.5;
    measurements.push({
      label: "Taux d'humidité",
      value: `${context.moisturePercentage} %`,
      isCompliant,
    });
    if (!isCompliant) {
      risks.push(`Humidité de ${context.moisturePercentage}% supérieure au seuil recommandé de 13.5%.`);
    }
  }

  if (context.impurityPercentage !== undefined && context.impurityPercentage !== null) {
    const isCompliant = context.impurityPercentage <= 2.5;
    measurements.push({
      label: "Taux d'impuretés",
      value: `${context.impurityPercentage} %`,
      isCompliant,
    });
    if (!isCompliant) {
      risks.push(`Taux d'impuretés (${context.impurityPercentage}%) supérieur au standard de grade technique (≤ 2.5%).`);
    }
  }

  if (context.openNonConformitiesCount > 0) {
    risks.push(`${context.openNonConformitiesCount} non-conformité(s) ouverte(s) en attente de traitement.`);
  }

  let conformityStatus: QualityInspectionResult["conformityStatus"] = "EVALUATION_EN_COURS";
  if (context.decision === "APPROVED") {
    conformityStatus = "CONFORME";
  } else if (context.decision === "REJECTED") {
    conformityStatus = "NON_CONFORME";
  }

  const summary = `Inspection ${context.inspectionReference} (${context.inspectionMethod || "Contrôle standard"}). ${context.evidenceCount} preuve(s) documentaire(s) et photo(s). Statut décisionnel : ${context.decision || "En cours d'examen"}.`;

  return {
    summary,
    keyMeasurements: measurements,
    conformityStatus,
    identifiedRisks: risks,
    humanDecisionGate:
      "Gouvernance qualité : l'émission de la décision formelle (APPROVED / REJECTED) et du certificat reste la responsabilité exclusive de l'inspecteur qualifié.",
  };
}

// ============================================================================
// 7. LOGISTICS DIAGNOSTIC ("Pourquoi cette expédition est bloquée ?")
// ============================================================================

export interface LogisticsDiagnosticContext {
  readonly shipmentNumber?: string | null;
  readonly status: string;
  readonly carrierName?: string | null;
  readonly pickupDateRequested?: string | null;
  readonly deliveredAt?: string | null;
  readonly quotationsCount: number;
  readonly originLocation?: string | null;
  readonly destinationLocation?: string | null;
}

export interface LogisticsDiagnosticResult {
  readonly isBlockedOrDelayed: boolean;
  readonly probableCause: string;
  readonly operationalImpact: string;
  readonly recommendedAction: string;
  readonly humanGateNotice: string;
}

export function diagnoseShipmentLogistics(
  context: LogisticsDiagnosticContext,
): LogisticsDiagnosticResult {
  if (context.status === "DELIVERED") {
    return {
      isBlockedOrDelayed: false,
      probableCause: "Expédition achevée.",
      operationalImpact: "Aucun blocage. Marchandise réceptionnée par l'acheteur.",
      recommendedAction: "Vérifier l'émargement du bon de livraison et clore le suivi.",
      humanGateNotice: "La validation de livraison est une action humaine réservée au Trader.",
    };
  }

  if (context.status === "IN_TRANSIT") {
    return {
      isBlockedOrDelayed: false,
      probableCause: "Transport en cours de réalisation par le transporteur sélectionné.",
      operationalImpact: "Marchandise en mer ou sur route vers le site de livraison.",
      recommendedAction: "Surveiller les jalons de suivi et confirmer la date d'arrivée estimée.",
      humanGateNotice: "La confirmation définitive de livraison nécessite le bordereau émargé.",
    };
  }

  if (context.status === "PLANNING" || context.status === "QUOTE_REQUESTED") {
    if (context.quotationsCount === 0) {
      return {
        isBlockedOrDelayed: true,
        probableCause: "Aucune cotation de transporteur reçue pour ce trajet.",
        operationalImpact: "L'enlèvement ne peut pas être planifié sans proposition tarifaire confirmée.",
        recommendedAction: "Relancer les partenaires de fret ou renseigner manuellement une cotation routière/maritime.",
        humanGateNotice: "La sélection de cotation et l'attribution du fret restent strictement manuelles.",
      };
    }
    return {
      isBlockedOrDelayed: true,
      probableCause: `${context.quotationsCount} offre(s) de fret reçue(s) mais aucun transporteur n'a encore été sélectionné par le Trader.`,
      operationalImpact: "Risque de dépassement de la date d'enlèvement souhaitée et décalage de la livraison finale.",
      recommendedAction: "Comparer les devis transport reçus et valider le transporteur retenu.",
      humanGateNotice: "Le choix du transporteur engage la responsabilité contractuelle et ne peut être automatisé.",
    };
  }

  if (context.status === "CARRIER_SELECTED") {
    return {
      isBlockedOrDelayed: false,
      probableCause: `Transporteur attribué (${context.carrierName || "Partenaire sélectionné"}). En attente de prise en charge physique du lot.`,
      operationalImpact: "La logistique est ordonnancée conformément aux termes contractuels.",
      recommendedAction: "Transmettre les instructions de chargement au site de production.",
      humanGateNotice: "L'actualisation des jalons de transport s'appuie sur les documents de fret officiels.",
    };
  }

  return {
    isBlockedOrDelayed: false,
    probableCause: "Statut d'expédition en attente d'initialisation.",
    operationalImpact: "Enlèvement non encore planifié.",
    recommendedAction: "Initialiser la demande d'expédition dès confirmation du contrat commercial.",
    humanGateNotice: "Actions de gestion logistique soumises à la validation Trader.",
  };
}

// ============================================================================
// 8. DOCUMENTS & DPP AUDIT ("Vérifier les pièces manquantes")
// ============================================================================

export interface DocumentAuditContext {
  readonly hasConfirmedContract: boolean;
  readonly hasInspectionCertificate: boolean;
  readonly hasTransportDocument: boolean;
  readonly hasSettlementRecord: boolean;
  readonly dppExists: boolean;
  readonly dppVersion?: number;
  readonly dppStatus?: string | null;
}

export interface DocumentAuditResult {
  readonly completenessPercentage: number;
  readonly presentItems: readonly string[];
  readonly missingItems: readonly string[];
  readonly itemsToVerify: readonly string[];
  readonly dppReadinessStatus: "PRÊT POUR SCELLEMENT" | "DOCUMENTS_MANQUANTS" | "SCORING_INCOMPLET";
}

export function checkMissingDocumentsAndDpp(
  context: DocumentAuditContext,
): DocumentAuditResult {
  const present: string[] = [];
  const missing: string[] = [];
  const toVerify: string[] = [];

  let points = 0;
  const maxPoints = 5;

  // 1. Contract
  if (context.hasConfirmedContract) {
    present.push("Contrat commercial bilatéral confirmé & archivé");
    points += 1;
  } else {
    missing.push("Contrat commercial signé par les deux parties");
  }

  // 2. Quality
  if (context.hasInspectionCertificate) {
    present.push("Certificat officiel de conformité qualité");
    points += 1;
  } else {
    missing.push("Certificat d'analyse de lot ou rapport d'inspection final");
  }

  // 3. Logistics
  if (context.hasTransportDocument) {
    present.push("Lettre de voiture de transport (CMR / B/L)");
    toVerify.push("Concordance du numéro de lot physique sur le bon de transport");
    points += 1;
  } else {
    missing.push("Justificatif d'enlèvement / preuve de prise en charge transport");
  }

  // 4. Settlement
  if (context.hasSettlementRecord) {
    present.push("Fiche administrative de règlement et échéancier validé");
    points += 1;
  } else {
    missing.push("Enregistrement des conditions de règlement et encaissement");
  }

  // 5. DPP
  if (context.dppExists) {
    present.push(`Passeport Produit Numérique (DPP v${context.dppVersion || 1}) initialisé`);
    points += 1;
  } else {
    missing.push("Projection du Passeport Produit Numérique (DPP)");
  }

  const completenessPercentage = Math.round((points / maxPoints) * 100);

  let dppReadinessStatus: DocumentAuditResult["dppReadinessStatus"] = "DOCUMENTS_MANQUANTS";
  if (completenessPercentage === 100) {
    dppReadinessStatus = "PRÊT POUR SCELLEMENT";
  } else if (completenessPercentage >= 60) {
    dppReadinessStatus = "SCORING_INCOMPLET";
  }

  return {
    completenessPercentage,
    presentItems: present,
    missingItems: missing,
    itemsToVerify: toVerify,
    dppReadinessStatus,
  };
}

