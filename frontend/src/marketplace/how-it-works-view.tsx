"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
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
  readonly checkpoints: readonly string[];
}

interface ActorRole {
  readonly id: string;
  readonly roleName: string;
  readonly title: string;
  readonly image: string;
  readonly summary: string;
  readonly responsibilities: readonly string[];
  readonly deliverables: readonly string[];
}

interface PillarItem {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly body: string;
  readonly meta: string;
}

interface HowItWorksLocaleCopy {
  readonly heroPillars: readonly { label: string; value: string }[];
  readonly heroCaption: string;
  readonly pathsIntro: string;
  readonly pathA: {
    readonly tag: string;
    readonly title: string;
    readonly body: string;
    readonly bullets: readonly string[];
  };
  readonly pathB: {
    readonly tag: string;
    readonly title: string;
    readonly body: string;
    readonly bullets: readonly string[];
  };
  readonly timelineLabels: {
    readonly checkpoints: string;
    readonly governance: string;
    readonly actor: string;
    readonly artifact: string;
    readonly exploreCta: string;
  };
  readonly stages: readonly TimelineStage[];
  readonly actorLabels: {
    readonly subtitle: string;
    readonly profileEyebrow: string;
    readonly responsibilities: string;
    readonly deliverables: string;
  };
  readonly actors: readonly ActorRole[];
  readonly pillarsSection: {
    readonly eyebrow: string;
    readonly title: string;
    readonly body: string;
    readonly items: readonly PillarItem[];
    readonly dppCard: {
      readonly badge: string;
      readonly subtitle: string;
      readonly f1Label: string;
      readonly f1Value: string;
      readonly f2Label: string;
      readonly f2Value: string;
      readonly f3Label: string;
      readonly f3Value: string;
      readonly f4Label: string;
      readonly f4Value: string;
      readonly note: string;
      readonly cta: string;
    };
  };
}

const COPY_BY_LOCALE: Record<Locale, HowItWorksLocaleCopy> = {
  fr: {
    heroPillars: [
      { label: "Cycle complet", value: "10 étapes reliées" },
      { label: "Gouvernance", value: "Validation humaine" },
      { label: "Conformité UE", value: "Prêt ESPR & CSRD" },
    ],
    heroCaption: "Inspection et qualification de lots en entrepôt coopératif européen",
    pathsIntro:
      "Que vous souhaitiez acquérir un lot immédiatement disponible en stock ou exprimer un besoin industriel sur mesure, I DO GROW structure chaque étape de la transaction.",
    pathA: {
      tag: "Parcours A • Stock disponible",
      title: "Explorer les lots publiés sur la Marketplace",
      body: "Consultez en accès libre les lots de fibres naturelles publiés par les coopératives et teillages européens. Filtrez par matière, forme, origine, volume, contrôle qualité et disponibilité du Passeport Numérique (DPP).",
      bullets: [
        "Consultation publique des fiches techniques sans création de compte préalable",
        "Volumes disponibles, année de récolte et prix indicatifs par tonne",
        "Demande de cotation directe sur tout lot vérifié",
      ],
    },
    pathB: {
      tag: "Parcours B • Demande sur mesure",
      title: "Émettre un ordre d'achat structuré",
      body: "Si votre cahier des charges exige un volume spécifique, une finesse particulière ou un cadencement de livraison dédié, soumettez un ordre d'achat structuré à notre desk de négoce.",
      bullets: [
        "Définition précise de la matière, de la forme produit et du tonnage cible",
        "Exigences de certifications (Bio, OEKO-TEX, GOTS, European Flax) et Incoterms",
        "Sélection et appariement supervisés par les traders I DO GROW",
      ],
    },
    timelineLabels: {
      checkpoints: "Points de contrôle opérationnels",
      governance: "Gouvernance de l'étape",
      actor: "Acteur principal",
      artifact: "Livrable de référence",
      exploreCta: "Voir les lots disponibles sur la Marketplace",
    },
    stages: [
      {
        id: "stage-01",
        number: "01",
        shortName: "Offre agricole",
        title: "Enregistrement du producteur et des lots",
        summary:
          "Les coopératives agricoles, producteurs et unités de première transformation enregistrent leur organisation, leurs sites de stockage et les caractéristiques de récolte de leurs lots.",
        actor: "Producteurs & Coopératives",
        artifact: "Dossier Fournisseur & Lot",
        badge: "Origine vérifiée",
        checkpoints: [
          "Vérification de l'entité légale, des sites de production et des documents",
          "Identification de l'origine géographique, de l'année de récolte et du rouissage",
          "Déclaration des volumes disponibles en balles ou en tonnes",
        ],
      },
      {
        id: "stage-02",
        number: "02",
        shortName: "Catalogue",
        title: "Publication structurée sur la Marketplace",
        summary:
          "Après validation, l'offre est normalisée selon une nomenclature claire (paille rouie, fibre technique, lin teillé, étoupe, chènevotte) et publiée sans exposer les données confidentielles du producteur.",
        actor: "Fournisseur & Desk I DO GROW",
        artifact: "Offre Publiée (Listing)",
        badge: "Standardisé",
        checkpoints: [
          "Classification normalisée par famille de fibre et forme produit",
          "Affichage du prix indicatif ou mode sur cotation",
          "Protection de la confidentialité commerciale jusqu'à la contractualisation",
        ],
      },
      {
        id: "stage-03",
        number: "03",
        shortName: "Demande",
        title: "Recherche acheteur ou ordre d'achat",
        summary:
          "Les équipes d'achats industrielles filtrent le catalogue public ou déposent un ordre d'achat structuré détaillant leurs spécifications techniques, volumes et délais.",
        actor: "Acheteurs Industriels",
        artifact: "Ordre d'achat (Buy Order)",
        badge: "Sourcing B2B",
        checkpoints: [
          "Filtrage multicritère par fibre, origine, certifications et DPP",
          "Saisie structurée des besoins en volume, qualité et livraison",
          "Passage sécurisé à l'espace acheteur pour les actions engageantes",
        ],
      },
      {
        id: "stage-04",
        number: "04",
        shortName: "Appariement",
        title: "Rapprochement supervisé par le Trader",
        summary:
          "Le desk de négoce I DO GROW compare les lots candidats aux exigences de l'acheteur (matière, forme, volume, origine, certificats) et valide un appariement commercial unique.",
        actor: "Trader I DO GROW",
        artifact: "Match Commercial Approuvé",
        badge: "Supervision humaine",
        checkpoints: [
          "Évaluation déterministe de compatibilité technique et documentaire",
          "Aucune transaction automatique sans validation humaine explicite",
          "Sélection d'un lot actif vérifié avant préparation du devis",
        ],
      },
      {
        id: "stage-05",
        number: "05",
        shortName: "Cotation",
        title: "Devis détaillé en 11 postes & négociation",
        summary:
          "Le trader établit une cotation transparente détaillant la valeur matière, l'inspection, le conditionnement, le transport et les frais. Chaque contre-proposition crée une nouvelle version immuable.",
        actor: "Acheteur & Desk de Négoce",
        artifact: "Devis Versionné (Quote vN)",
        badge: "Traçabilité des prix",
        checkpoints: [
          "Décomposition complète des coûts (matière, fret, assurance, inspection)",
          "Cycle de négociation structuré : revue interne, envoi, contre-offre, acceptation",
          "Historique complet et immuable de chaque version de devis",
        ],
      },
      {
        id: "stage-06",
        number: "06",
        shortName: "Qualité",
        title: "Inspection indépendante & certificat qualité",
        summary:
          "Un inspecteur qualité assigné relève les mesures physiques du lot (taux d'humidité, poids et dimensions des balles, rouissage, pureté) et émet une décision humaine avec certificat PDF.",
        actor: "Inspecteur Qualité",
        artifact: "Certificat d'Inspection (QIC)",
        badge: "Contrôle physique",
        checkpoints: [
          "Relevé structuré de 14 paramètres techniques sur le lot",
          "Dépôt des preuves photographiques et rapports d'analyse",
          "Émission d'un certificat d'inspection PDF immuable après approbation",
        ],
      },
      {
        id: "stage-07",
        number: "07",
        shortName: "Contrat",
        title: "Confirmation du contrat commercial & Incoterms",
        summary:
          "L'acceptation du devis ouvre l'établissement du contrat de vente structuré reprenant les conditions commerciales figées, les Incoterms et les modalités de livraison.",
        actor: "Acheteur, Fournisseur & Trader",
        artifact: "Contrat Commercial (PDF)",
        badge: "Engagement",
        checkpoints: [
          "Reprise exacte du montant, du volume et de la devise acceptés",
          "Définition claire des Incoterms et des conditions de paiement",
          "Génération d'un document contractuel PDF horodaté",
        ],
      },
      {
        id: "stage-08",
        number: "08",
        shortName: "Logistique",
        title: "Consultation fret & suivi d'expédition",
        summary:
          "Les partenaires logistiques invités soumettent leurs cotations de transport. Le transporteur retenu exécute l'enlèvement, publie les documents d'expédition et renseigne les jalons de transit.",
        actor: "Partenaires Logistiques & Trader",
        artifact: "Dossier d'Expédition & Jalons",
        badge: "Suivi de garde",
        checkpoints: [
          "Mise en concurrence isolée des transporteurs et sélection du fret",
          "Suivi d'état : enlèvement planifié, en transit, douane, livré",
          "Gestion documentaire et rapprochement final des coûts logistiques",
        ],
      },
      {
        id: "stage-09",
        number: "09",
        shortName: "Règlement",
        title: "Suivi administratif du règlement",
        summary:
          "La plateforme assure le suivi administratif des factures, acomptes, soldes restants et éventuelles réclamations jusqu'à la clôture comptable du dossier, sans agir comme établissement bancaire.",
        actor: "Administration Commerciale",
        artifact: "Registre de Règlement",
        badge: "Suivi administratif",
        checkpoints: [
          "Enregistrement des factures, avoirs et instructions de paiement",
          "Calcul serveur du solde restant et suivi des échéances",
          "Résolution structurée des écarts ou réclamations avant clôture",
        ],
      },
      {
        id: "stage-10",
        number: "10",
        shortName: "Passeport DPP",
        title: "Émission du Passeport Numérique du Produit",
        summary:
          "L'ensemble des événements vérifiés (origine du lot, inspection qualité, contrat, transport) est consolidé dans un Passeport Numérique du Produit (DPP) versionné, téléchargeable en PDF et accessible par QR code.",
        actor: "Acheteur, Fournisseur & Auditeurs",
        artifact: "Passeport Numérique (DPP)",
        badge: "Prêt ESPR / CSRD",
        checkpoints: [
          "Consolidation chronologique immuable à partir des données réelles",
          "Protection stricte des marges internes et données bancaires",
          "Export PDF multi-pages et QR code d'accès authentifié",
        ],
      },
    ],
    actorLabels: {
      subtitle:
        "Chaque transaction réunit cinq profils complémentaires autour d'un même référentiel de données, avec des droits d'accès strictement cloisonnés.",
      profileEyebrow: "Rôle opérationnel",
      responsibilities: "Responsabilités clés dans la chaîne",
      deliverables: "Livrables sur la plateforme",
    },
    actors: [
      {
        id: "supplier",
        roleName: "Producteurs & Coopératives",
        title: "Coopératives agricoles, cultivateurs et unités de teillage",
        image: "/images/actor_producer_field.png",
        summary:
          "Les producteurs européens qualifient leurs sites, publient leurs lots de fibres naturelles avec leurs caractéristiques techniques et accèdent aux demandes industrielles structurées.",
        responsibilities: [
          "Enregistrer l'organisation, les sites de production et les certificats",
          "Créer des lots détaillant matière, forme, tonnage, récolte et origine",
          "Fournir les échantillons et informations nécessaires aux contrôles qualité",
          "Consulter les Passeports Numériques (DPP) liés à leurs propres lots",
        ],
        deliverables: ["Profil Producteur Vérifié", "Lots Publiés", "Historique DPP Fournisseur"],
      },
      {
        id: "buyer",
        roleName: "Acheteurs Industriels",
        title: "Équipes d'achats, industriels textiles, matériaux biosourcés et papeteries",
        image: "/images/b2b_team.png",
        summary:
          "Les industriels sourcent des matières premières traçables en parcourant le catalogue ou en déposant des ordres d'achat précis, puis négocient et valident leurs devis.",
        responsibilities: [
          "Rechercher et filtrer les lots vérifiés selon leurs critères techniques",
          "Créer des ordres d'achat structurés pour leurs besoins récurrents ou spécifiques",
          "Examiner les devis détaillés en 11 postes, accepter ou soumettre une contre-offre",
          "Accéder aux contrats confirmés et aux Passeports Numériques (DPP) de leurs achats",
        ],
        deliverables: ["Ordres d'Achat", "Décisions sur Devis", "Accès Passeport DPP"],
      },
      {
        id: "trader",
        roleName: "Desk de Négoce",
        title: "Opérateurs commerciaux I DO GROW & supervision des transactions",
        image: "/images/trader_platform.png",
        summary:
          "Au cœur de la plateforme, les traders accompagnent l'onboarding, rapprochent l'offre et la demande, préparent les cotations, coordonnent la qualité, la logistique et le règlement.",
        responsibilities: [
          "Vérifier les dossiers fournisseurs et accompagner la mise en ligne des lots",
          "Évaluer la compatibilité offre/demande et approuver les appariements",
          "Construire et réviser les devis versionnés et générer les contrats",
          "Piloter les inspections, les appels d'offres fret, le règlement et les DPP",
        ],
        deliverables: ["Match Approuvé", "Devis & Contrat", "Supervision de Bout en Bout"],
      },
      {
        id: "quality",
        roleName: "Inspecteurs Qualité",
        title: "Inspecteurs indépendants & contrôle technique des lots",
        image: "/images/quality_lab.png",
        summary:
          "Les inspecteurs qualité interviennent sur mission pour mesurer objectivement les caractéristiques physiques des lots avant expédition et délivrer les certificats d'inspection.",
        responsibilities: [
          "Prendre en charge les missions d'inspection assignées dans leur portail dédié",
          "Saisir les mesures techniques (humidité, poids de balle, rouissage, propreté)",
          "Joindre les preuves photographiques, rapports labo et constats d'écart",
          "Rendre la décision qualité humaine et émettre le certificat PDF officiel",
        ],
        deliverables: ["Relevé de Mesures", "Évaluation Qualité", "Certificat QIC (PDF)"],
      },
      {
        id: "logistics",
        roleName: "Partenaires Logistiques",
        title: "Transporteurs routiers et opérateurs multimodaux européens",
        image: "/images/freight_port.png",
        summary:
          "Les partenaires logistiques répondent aux demandes de cotation fret sur les contrats confirmés et assurent le suivi opérationnel des expéditions qui leur sont confiées.",
        responsibilities: [
          "Répondre aux consultations de transport avec prix, devise et délai de transit",
          "Planifier l'enlèvement et assurer le transport jusqu'au site de livraison",
          "Mettre à jour les jalons de suivi et déposer les documents de transport",
          "Signaler tout retard, dommage ou écart de quantité constaté à la livraison",
        ],
        deliverables: ["Cotation de Fret", "Jalons de Suivi", "Documents d'Expédition"],
      },
    ],
    pillarsSection: {
      eyebrow: "Garanties opérationnelles",
      title: "Quatre engagements structurants à chaque transaction.",
      body: "Contrairement à un annuaire passif ou à une place de marché automatisée sans contrôle, I DO GROW encadre chaque étape critique par des preuves vérifiables et une validation humaine.",
      items: [
        {
          id: "quote-negotiation",
          number: "01",
          title: "Transparence tarifaire en 11 postes",
          body: "Chaque devis détaille séparément la valeur de la matière, la commission, les frais d'inspection, le conditionnement, le pré-acheminement, le fret international, la douane, l'assurance, le stockage et les taxes.",
          meta: "Négociation versionnée immuable",
        },
        {
          id: "quality-contract",
          number: "02",
          title: "Contrôle qualité indépendant & contrat Incoterms",
          body: "Les décisions qualité reposent sur des relevés physiques documentés et génèrent un certificat PDF infalsifiable. Le contrat de vente fige les termes commerciaux acceptés.",
          meta: "Certificat QIC & Contrat PDF",
        },
        {
          id: "logistics-settlement",
          number: "03",
          title: "Exécution logistique & suivi administratif du règlement",
          body: "Du choix du transporteur jusqu'à la réconciliation des coûts finaux et au suivi des factures et acomptes, chaque étape est tracée sans intermédiation bancaire opaque.",
          meta: "Clôture documentaire contrôlée",
        },
        {
          id: "dpp-governance",
          number: "04",
          title: "Passeport Numérique du Produit (DPP) par lot",
          body: "Chaque lot dispose d'un passeport numérique versionné consolidant son origine, ses inspections, ses certificats et sa chaîne de garde, sans jamais divulguer les marges commerciales.",
          meta: "Prêt pour ESPR & CSRD",
        },
      ],
      dppCard: {
        badge: "Passeport Numérique • DPP",
        subtitle: "Architecture de traçabilité par lot",
        f1Label: "Identité & Origine",
        f1Value: "Lot, matière, forme, pays et site producteur",
        f2Label: "Qualité & Certificats",
        f2Value: "Mesures d'inspection, statut et référence QIC",
        f3Label: "Transaction & Logistique",
        f3Value: "Contrat confirmé, expédition et jalons de garde",
        f4Label: "Confidentialité B2B",
        f4Value: "Marges internes et coordonnées bancaires masquées",
        note: "Exportable en PDF multi-pages et consultable via QR code sécurisé par les contreparties autorisées.",
        cta: "Parcourir les lots traçables DPP",
      },
    },
  },
  en: {
    heroPillars: [
      { label: "Full Lifecycle", value: "10 connected stages" },
      { label: "Governance", value: "Human-approved gates" },
      { label: "EU Compliance", value: "ESPR & CSRD ready" },
    ],
    heroCaption: "Lot inspection and grading inside a European cooperative warehouse",
    pathsIntro:
      "Whether you want to secure immediately available cooperative stock or submit custom manufacturing specifications, I DO GROW structures the entire commercial pathway.",
    pathA: {
      tag: "Path A • Available Inventory",
      title: "Browse Published Marketplace Lots",
      body: "Explore verified natural fibre lots published by European agricultural cooperatives and primary processing mills. Filter by material, product form, origin, volume, quality approval, and DPP readiness.",
      bullets: [
        "Open public technical browsing without mandatory upfront registration",
        "Available tonnage, harvest year, and indicative price per tonne",
        "Request a formal quotation directly on any verified lot",
      ],
    },
    pathB: {
      tag: "Path B • Custom Demand",
      title: "Submit a Structured Buy Order",
      body: "When your production line requires specific volume call-offs, technical tolerances, or delivery schedules, submit a structured Buy Order to our trading desk.",
      bullets: [
        "Define exact fibre family, product form, and target volume",
        "Specify required certifications (Organic, OEKO-TEX, GOTS, European Flax) and Incoterms",
        "Human-controlled candidate matching by I DO GROW traders",
      ],
    },
    timelineLabels: {
      checkpoints: "Operational verification checkpoints",
      governance: "Stage governance",
      actor: "Primary actor",
      artifact: "Platform record",
      exploreCta: "Explore available lots on the Marketplace",
    },
    stages: [
      {
        id: "stage-01",
        number: "01",
        shortName: "Supply Intake",
        title: "Supplier Onboarding & Lot Registration",
        summary:
          "European agricultural cooperatives, growers, and primary processing mills register their organisation, storage sites, and harvest lot characteristics.",
        actor: "Producers & Cooperatives",
        artifact: "Verified Supplier & Lot Record",
        badge: "Origin Verified",
        checkpoints: [
          "Organisation identity, production sites, and compliance document review",
          "Capture of origin country, harvest year, and retting method",
          "Structured declaration of available volume in bales or tonnes",
        ],
      },
      {
        id: "stage-02",
        number: "02",
        shortName: "Catalogue",
        title: "Standardized Marketplace Publication",
        summary:
          "Approved supply is structured into standardized commodity formats (retted straw, technical fibre, scutched flax, tow, hurds) while protecting sensitive supplier details.",
        actor: "Supplier & I DO GROW Desk",
        artifact: "Published Marketplace Listing",
        badge: "Standardized",
        checkpoints: [
          "Standardized classification by fibre family and product form",
          "Clear indicative pricing or quote-on-request terms",
          "Commercial privacy preserved until formal transaction stages",
        ],
      },
      {
        id: "stage-03",
        number: "03",
        shortName: "Demand",
        title: "Buyer Discovery or Structured Buy Order",
        summary:
          "Industrial procurement teams filter the public catalogue or submit a structured Buy Order specifying their technical parameters, volumes, and delivery terms.",
        actor: "Industrial Buyers",
        artifact: "Structured Buy Order",
        badge: "B2B Sourcing",
        checkpoints: [
          "Multi-dimensional filtering by fibre, origin, certifications, and DPP",
          "Structured capture of volume, quality, and delivery requirements",
          "Authenticated buyer workspace for binding commercial actions",
        ],
      },
      {
        id: "stage-04",
        number: "04",
        shortName: "Matching",
        title: "Human-Controlled Trader Matching",
        summary:
          "The I DO GROW trading desk evaluates candidate lots against buyer requirements (material, form, quantity, origin, certifications) and approves a single commercial match.",
        actor: "I DO GROW Trader",
        artifact: "Approved Commercial Match",
        badge: "Human Oversight",
        checkpoints: [
          "Deterministic technical and documentary compatibility evaluation",
          "Zero autonomous binding trades — explicit human approval required",
          "Single active approved match invariant before quotation preparation",
        ],
      },
      {
        id: "stage-05",
        number: "05",
        shortName: "Quotation",
        title: "11-Line Itemized Quote & Versioned Negotiation",
        summary:
          "The trader prepares a transparent quotation breaking down product value, inspection, packaging, freight, and fees. Every counter-offer creates a new immutable version.",
        actor: "Buyer & Trading Desk",
        artifact: "Versioned Quote (Quote vN)",
        badge: "Price Transparency",
        checkpoints: [
          "Full 11-line commercial breakdown (product, freight, insurance, inspection)",
          "Controlled lifecycle: internal review, dispatch, counter-offer, acceptance",
          "Immutable version history preventing commercial ambiguity",
        ],
      },
      {
        id: "stage-06",
        number: "06",
        shortName: "Quality",
        title: "Independent Inspection & Quality Certificate",
        summary:
          "An assigned Quality Inspector records physical lot measurements (moisture percentage, bale weight and dimensions, retting, purity) and issues a human quality decision with a PDF certificate.",
        actor: "Quality Inspector",
        artifact: "Inspection Certificate (QIC)",
        badge: "Quality Gate",
        checkpoints: [
          "Structured capture of 14 source-backed technical measurement fields",
          "Photo evidence, supporting documents, and lab report uploads",
          "Immutable PDF Inspection Certificate issued upon human approval",
        ],
      },
      {
        id: "stage-07",
        number: "07",
        shortName: "Contract",
        title: "Commercial Contract Confirmation & Incoterms",
        summary:
          "An accepted quote unlocks a structured sales contract preserving the agreed commercial baseline, Incoterms, and delivery obligations.",
        actor: "Buyer, Supplier & Trader",
        artifact: "Confirmed Sales Contract (PDF)",
        badge: "Binding Terms",
        checkpoints: [
          "Immutable preservation of accepted amount, volume, and currency",
          "Explicit Incoterms and payment terms definition",
          "Deterministic multi-page PDF contract generation",
        ],
      },
      {
        id: "stage-08",
        number: "08",
        shortName: "Logistics",
        title: "Freight Quoting & Shipment Execution",
        summary:
          "Invited logistics partners submit freight quotations. The selected carrier executes pickup, uploads shipping documents, and records operational transit milestones.",
        actor: "Logistics Partners & Trader",
        artifact: "Shipment Record & Milestones",
        badge: "Custody Tracking",
        checkpoints: [
          "Isolated carrier freight bidding and deterministic carrier selection",
          "Milestone progression: pickup scheduled, in transit, customs, delivered",
          "Discrepancy logging and final logistics cost reconciliation",
        ],
      },
      {
        id: "stage-09",
        number: "09",
        shortName: "Settlement",
        title: "Administrative Settlement Tracking",
        summary:
          "The platform tracks invoices, payment instructions, deposits, remaining balances, and administrative claims through final settlement without acting as a bank.",
        actor: "Commercial Administration",
        artifact: "Settlement Reconciliation Record",
        badge: "Administrative Ledger",
        checkpoints: [
          "Recording of invoices, credit notes, and payment instructions",
          "Server-calculated remaining balance and due-date tracking",
          "Structured administrative claim resolution before closure",
        ],
      },
      {
        id: "stage-10",
        number: "10",
        shortName: "DPP Passport",
        title: "Digital Product Passport Issuance",
        summary:
          "Verified lifecycle events (lot origin, quality inspection, contract, shipment) project into a versioned Digital Product Passport (DPP), downloadable as a PDF and accessible via QR code.",
        actor: "Buyer, Supplier & Auditors",
        artifact: "Digital Product Passport (DPP)",
        badge: "ESPR / CSRD Ready",
        checkpoints: [
          "Deterministic chronological event ledger from authoritative records",
          "Strict redaction of internal trader margins and bank details",
          "Printable human-readable passport, PDF download, and protected QR entry",
        ],
      },
    ],
    actorLabels: {
      subtitle:
        "Every transaction coordinates five specialized participants around a shared data model with strict role-based isolation.",
      profileEyebrow: "Operational role",
      responsibilities: "Core supply chain responsibilities",
      deliverables: "Platform deliverables",
    },
    actors: [
      {
        id: "supplier",
        roleName: "Producers & Cooperatives",
        title: "Agricultural cooperatives, growers, and primary scutching mills",
        image: "/images/actor_producer_field.png",
        summary:
          "European producers verify their sites, publish natural fibre lots with structured technical attributes, and connect with qualified industrial demand.",
        responsibilities: [
          "Register organisation details, production sites, and compliance certificates",
          "Create structured listings with material, form, volume, harvest year, and origin",
          "Support physical quality inspections and documentation verification",
          "Access Digital Product Passports scoped to their own lots",
        ],
        deliverables: ["Verified Supplier Profile", "Published Lots", "Supplier DPP Ledger"],
      },
      {
        id: "buyer",
        roleName: "Industrial Buyers",
        title: "Procurement teams in textiles, biocomposites, insulation, and paper",
        image: "/images/b2b_team.png",
        summary:
          "Industrial manufacturers source traceable raw materials by browsing published lots or submitting structured Buy Orders, then review and accept versioned quotes.",
        responsibilities: [
          "Search and filter verified lots by technical and compliance criteria",
          "Submit structured Buy Orders for custom or recurring procurement needs",
          "Review 11-line itemized quotations, accept terms, or submit counter-offers",
          "Access confirmed contracts and Digital Product Passports for purchased lots",
        ],
        deliverables: ["Structured Buy Orders", "Quote Decisions", "Buyer DPP Access"],
      },
      {
        id: "trader",
        roleName: "Trading Desk",
        title: "I DO GROW commodity operators & transaction supervision",
        image: "/images/trader_platform.png",
        summary:
          "Operating at the center of the lifecycle, traders review onboarding, match supply and demand, structure quotations, and coordinate quality, contracts, logistics, and settlement.",
        responsibilities: [
          "Review supplier onboarding and assist with structured lot publication",
          "Evaluate supply-demand compatibility and approve commercial matches",
          "Prepare and revise versioned quotes and confirm sales contracts",
          "Coordinate quality inspections, freight RFQs, settlement, and DPP issuance",
        ],
        deliverables: ["Approved Match", "Versioned Quote & Contract", "Lifecycle Governance"],
      },
      {
        id: "quality",
        roleName: "Quality Inspectors",
        title: "Independent inspectors & technical lot verification",
        image: "/images/quality_lab.png",
        summary:
          "Assigned Quality Inspectors record objective physical measurements on lots prior to shipment and issue human-approved inspection certificates.",
        responsibilities: [
          "Manage assigned inspection tasks from a dedicated inspector work queue",
          "Record structured technical measurements (moisture, bale weight, retting, purity)",
          "Upload photo evidence, lab reports, and non-conformity records",
          "Record human quality decisions and issue official PDF certificates",
        ],
        deliverables: ["Technical Measurements", "Quality Decision", "QIC Certificate (PDF)"],
      },
      {
        id: "logistics",
        roleName: "Logistics Partners",
        title: "European road freight and multimodal transport providers",
        image: "/images/freight_port.png",
        summary:
          "Logistics partners respond to freight quotation requests on confirmed contracts and report operational milestones on awarded shipments.",
        responsibilities: [
          "Submit freight quotations with amount, currency, and transit duration",
          "Execute scheduled pickups and cross-border delivery to the buyer site",
          "Log tracking milestones and upload shipping documentation",
          "Report transit delays, damage, or quantity discrepancies",
        ],
        deliverables: ["Freight Quotation", "Tracking Milestones", "Shipping Documents"],
      },
    ],
    pillarsSection: {
      eyebrow: "Operational Safeguards",
      title: "Four structural guarantees behind every trade.",
      body: "Unlike passive directories or unverified marketplaces, I DO GROW anchors every critical transition in verifiable records and explicit human control.",
      items: [
        {
          id: "quote-negotiation",
          number: "01",
          title: "11-line itemized commercial clarity",
          body: "Every quotation separates raw product value, commission, inspection cost, packaging, inland transport, international freight, customs, insurance, storage, and taxes.",
          meta: "Immutable quote versioning",
        },
        {
          id: "quality-contract",
          number: "02",
          title: "Independent quality gate & Incoterms contracts",
          body: "Quality approvals rely on documented measurements and issue a verifiable PDF certificate. Confirmed contracts lock the agreed commercial baseline.",
          meta: "QIC Certificate & PDF Contract",
        },
        {
          id: "logistics-settlement",
          number: "03",
          title: "Coordinated logistics & administrative settlement",
          body: "From carrier selection and milestone tracking to final cost reconciliation and invoice tracking, every step is recorded transparently without speculative banking.",
          meta: "Auditable operational closure",
        },
        {
          id: "dpp-governance",
          number: "04",
          title: "Lot-linked Digital Product Passport (DPP)",
          body: "Each lot carries a versioned digital passport consolidating origin, inspection results, certificates, and custody events while redacting internal commercial margins.",
          meta: "EU ESPR & CSRD aligned",
        },
      ],
      dppCard: {
        badge: "Digital Product Passport • DPP",
        subtitle: "Lot-level provenance architecture",
        f1Label: "Identity & Origin",
        f1Value: "Lot reference, fibre form, country, and producer site",
        f2Label: "Quality & Certificates",
        f2Value: "Inspection measurements, approval status, and QIC reference",
        f3Label: "Trade & Custody",
        f3Value: "Confirmed contract, shipment milestones, and delivery handoff",
        f4Label: "Commercial Redaction",
        f4Value: "Internal margins and bank instructions strictly protected",
        note: "Downloadable as a deterministic multi-page PDF and accessible via authenticated QR code.",
        cta: "Browse DPP-traceable lots",
      },
    },
  },
  nl: {
    heroPillars: [
      { label: "Volledige cyclus", value: "10 verbonden stappen" },
      { label: "Governance", value: "Menselijke goedkeuring" },
      { label: "EU-compliance", value: "Klaar voor ESPR & CSRD" },
    ],
    heroCaption: "Partijcontrole en kwaliteitskeuring in een Europees coöperatiemagazijn",
    pathsIntro:
      "Of u nu direct beschikbare voorraad wilt inkopen of specifieke industriële eisen wilt indienen, I DO GROW structureert het volledige handelstraject.",
    pathA: {
      tag: "Route A • Beschikbare voorraad",
      title: "Verken gepubliceerde partijen op de Marketplace",
      body: "Bekijk vrij toegankelijke natuurvezelpartijen van Europese landbouwcoöperaties en zwingelbedrijven. Filter op materiaal, vorm, herkomst, volume, kwaliteitskeuring en DPP-status.",
      bullets: [
        "Openbare technische inzage zonder verplichte registratie vooraf",
        "Beschikbaar tonnage, oogstjaar en richtprijs per ton",
        "Vraag direct een formele offerte aan voor elke geverifieerde partij",
      ],
    },
    pathB: {
      tag: "Route B • Inkoop op maat",
      title: "Dien een gestructureerde inkooporder in",
      body: "Wanneer uw productieproces specifieke volumes, kwaliteitsmarges of leveringsschema's vereist, dient u een gestructureerde inkooporder in bij onze tradingdesk.",
      bullets: [
        "Definieer exacte vezelfamilie, productvorm en gewenst volume",
        "Specificeer vereiste certificaten (Biologisch, OEKO-TEX, GOTS, European Flax) en Incoterms",
        "Menselijk gecontroleerde matching door I DO GROW-handelaren",
      ],
    },
    timelineLabels: {
      checkpoints: "Operationele controlepunten",
      governance: "Fase-governance",
      actor: "Hoofdrolspeler",
      artifact: "Platformdocument",
      exploreCta: "Bekijk beschikbare partijen op de Marketplace",
    },
    stages: [
      {
        id: "stage-01",
        number: "01",
        shortName: "Aanbod",
        title: "Onboarding van producent & partijregistratie",
        summary:
          "Europese landbouwcoöperaties, telers en primaire verwerkers registreren hun organisatie, opslaglocaties en oogstgegevens per partij.",
        actor: "Producenten & Coöperaties",
        artifact: "Geverifieerd Leveranciers- & Partijdossier",
        badge: "Herkomst geverifieerd",
        checkpoints: [
          "Controle van juridische entiteit, productielocaties en documenten",
          "Registratie van land van herkomst, oogstjaar en rotingsmethode",
          "Gestructureerde opgave van beschikbaar volume in balen of tonnen",
        ],
      },
      {
        id: "stage-02",
        number: "02",
        shortName: "Catalogus",
        title: "Gestandaardiseerde publicatie op de Marketplace",
        summary:
          "Goedgekeurd aanbod wordt gestructureerd in standaard productvormen (geroot stro, technische vezel, gezwingeld vlas, lokken, scheven) met behoud van commerciële vertrouwelijkheid.",
        actor: "Leverancier & I DO GROW Desk",
        artifact: "Gepubliceerd Aanbod (Listing)",
        badge: "Gestandaardiseerd",
        checkpoints: [
          "Eenduidige classificatie op vezelfamilie en productvorm",
          "Duidelijke richtprijs of prijs-op-aanvraag",
          "Bescherming van gevoelige leveranciersgegevens tot contractfase",
        ],
      },
      {
        id: "stage-03",
        number: "03",
        shortName: "Inkoopvraag",
        title: "Zoeken in catalogus of gestructureerde inkooporder",
        summary:
          "Industriële inkoopteams filteren de openbare catalogus of dienen een gestructureerde inkooporder in met hun technische specificaties, volumes en leveringsvoorwaarden.",
        actor: "Industriële Kopers",
        artifact: "Gestructureerde Inkooporder",
        badge: "B2B-sourcing",
        checkpoints: [
          "Multidimensionaal filteren op vezel, herkomst, certificaten en DPP",
          "Gestructureerde invoer van volume-, kwaliteits- en leveringseisen",
          "Beveiligde kopersomgeving voor bindende commerciële acties",
        ],
      },
      {
        id: "stage-04",
        number: "04",
        shortName: "Matching",
        title: "Menselijk gecontroleerde matching door de Trader",
        summary:
          "De I DO GROW-tradingdesk vergelijkt kandidaat-partijen met de eisen van de koper (materiaal, vorm, volume, herkomst, certificaten) en keurt één actieve commerciële match goed.",
        actor: "I DO GROW Trader",
        artifact: "Goedgekeurde Commerciële Match",
        badge: "Menselijk toezicht",
        checkpoints: [
          "Deterministische evaluatie van technische en documentaire aansluiting",
          "Geen autonome automatische transacties zonder menselijke goedkeuring",
          "Eén goedgekeurde match per inkooporder vóór offertevoorbereiding",
        ],
      },
      {
        id: "stage-05",
        number: "05",
        shortName: "Offerte",
        title: "Offerte met 11 kostenposten & versiebeheer",
        summary:
          "De trader stelt een transparante offerte op met uitsplitsing van productwaarde, keuring, verpakking, vracht en kosten. Elk tegenbod maakt een nieuwe onveranderlijke versie aan.",
        actor: "Koper & Tradingdesk",
        artifact: "Versiebeheerde Offerte (Quote vN)",
        badge: "Prijstransparantie",
        checkpoints: [
          "Volledige uitsplitsing in 11 regels (product, vracht, verzekering, keuring)",
          "Gecontroleerde statusflow: interne review, verzonden, tegenbod, geaccepteerd",
          "Onveranderlijke versiehistorie voorkomt onduidelijkheid",
        ],
      },
      {
        id: "stage-06",
        number: "06",
        shortName: "Kwaliteit",
        title: "Onafhankelijke keuring & kwaliteitscertificaat",
        summary:
          "Een toegewezen kwaliteitsinspecteur legt fysieke metingen vast (vochtpercentage, baalgewicht en -afmetingen, roting, zuiverheid) en geeft een menselijk kwaliteitsbesluit met PDF-certificaat af.",
        actor: "Kwaliteitsinspecteur",
        artifact: "Keuringscertificaat (QIC)",
        badge: "Kwaliteitspoort",
        checkpoints: [
          "Gestructureerde registratie van 14 technische meetvelden",
          "Upload van fotobewijs, documenten en laboratoriumrapporten",
          "Onveranderlijk PDF-keuringscertificaat bij goedkeuring",
        ],
      },
      {
        id: "stage-07",
        number: "07",
        shortName: "Contract",
        title: "Contractbevestiging & Incoterms",
        summary:
          "Na acceptatie van de offerte wordt een gestructureerd verkoopcontract opgesteld waarin de overeengekomen commerciële basis, Incoterms en leveringsvoorwaarden worden vastgelegd.",
        actor: "Koper, Leverancier & Trader",
        artifact: "Bevestigd Verkoopcontract (PDF)",
        badge: "Bindende afspraken",
        checkpoints: [
          "Onveranderlijke vastlegging van geaccepteerd bedrag, volume en valuta",
          "Duidelijke vastlegging van Incoterms en betalingsvoorwaarden",
          "Deterministische generatie van een meerpagina PDF-contract",
        ],
      },
      {
        id: "stage-08",
        number: "08",
        shortName: "Logistiek",
        title: "Vrachtoffertes & zendingsuitvoering",
        summary:
          "Uitgenodigde logistieke partners dienen vrachtoffertes in. De geselecteerde vervoerder voert de ophaling uit, uploadt transportdocumenten en registreert mijlpalen.",
        actor: "Logistieke Partners & Trader",
        artifact: "Zendingsdossier & Mijlpalen",
        badge: "Transportopvolging",
        checkpoints: [
          "Geïsoleerde vrachtoffertes en deterministische vervoerdersselectie",
          "Statusopvolging: ophaling gepland, onderweg, douane, afgeleverd",
          "Registratie van afwijkingen en definitieve kostenafstemming",
        ],
      },
      {
        id: "stage-09",
        number: "09",
        shortName: "Afwikkeling",
        title: "Administratieve betalingsopvolging",
        summary:
          "Het platform volgt facturen, betalingsinstructies, aanbetalingen, openstaande saldi en claims administratief op tot de definitieve afsluiting, zonder als bank op te treden.",
        actor: "Commerciële Administratie",
        artifact: "Afwikkelingsregister",
        badge: "Administratief",
        checkpoints: [
          "Registratie van facturen, creditnota's en betalingsinstructies",
          "Door de server berekend restsaldo en opvolging van vervaldata",
          "Gestructureerde afhandeling van claims vóór dossierafsluiting",
        ],
      },
      {
        id: "stage-10",
        number: "10",
        shortName: "DPP-paspoort",
        title: "Uitgifte van het Digitaal Productpaspoort",
        summary:
          "Geverifieerde gebeurtenissen (herkomst, kwaliteitskeuring, contract, transport) worden samengebracht in een versiebeheerd Digitaal Productpaspoort (DPP), downloadbaar als PDF en toegankelijk via QR-code.",
        actor: "Koper, Leverancier & Auditors",
        artifact: "Digitaal Productpaspoort (DPP)",
        badge: "Klaar voor ESPR / CSRD",
        checkpoints: [
          "Chronologisch en onveranderlijk overzicht op basis van brondata",
          "Strikte afscherming van interne handelsmarges en bankgegevens",
          "Afdrukbaar paspoort, PDF-export en beveiligde QR-toegang",
        ],
      },
    ],
    actorLabels: {
      subtitle:
        "Elke transactie verbindt vijf gespecialiseerde rollen rond één gedeeld datamodel met strikte toegangsscheiding.",
      profileEyebrow: "Operationele rol",
      responsibilities: "Kerntaken in de keten",
      deliverables: "Platformresultaten",
    },
    actors: [
      {
        id: "supplier",
        roleName: "Producenten & Coöperaties",
        title: "Landbouwcoöperaties, telers en zwingelbedrijven",
        image: "/images/actor_producer_field.png",
        summary:
          "Europese producenten registreren hun locaties, publiceren natuurvezelpartijen met gestructureerde specificaties en krijgen toegang tot gekwalificeerde industriële vraag.",
        responsibilities: [
          "Organisatie, productielocaties en certificaten registreren",
          "Partijen aanmaken met materiaal, vorm, volume, oogstjaar en herkomst",
          "Meewerken aan fysieke kwaliteitskeuringen en documentcontrole",
          "Digitale Productpaspoorten (DPP) voor hun eigen partijen raadplegen",
        ],
        deliverables: ["Geverifieerd Leveranciersprofiel", "Gepubliceerde Partijen", "Leveranciers-DPP"],
      },
      {
        id: "buyer",
        roleName: "Industriële Kopers",
        title: "Inkoopteams in textiel, biocomposieten, isolatie en papier",
        image: "/images/b2b_team.png",
        summary:
          "Industriële verwerkers kopen traceerbare grondstoffen in via de catalogus of via gestructureerde inkooporders en beoordelen versiebeheerde offertes.",
        responsibilities: [
          "Geverifieerde partijen zoeken en filteren op technische eisen",
          "Gestructureerde inkooporders indienen voor specifieke behoeften",
          "Offertes met 11 kostenposten beoordelen, accepteren of tegenbod doen",
          "Bevestigde contracten en Digitale Productpaspoorten (DPP) inzien",
        ],
        deliverables: ["Inkooporders", "Offertebesluiten", "Toegang tot Kopers-DPP"],
      },
      {
        id: "trader",
        roleName: "Tradingdesk",
        title: "I DO GROW-handelaren & transactiebegeleiding",
        image: "/images/trader_platform.png",
        summary:
          "Als centraal coördinatiepunt beoordelen traders de onboarding, koppelen zij vraag en aanbod, stellen zij offertes op en begeleiden zij kwaliteit, contracten, logistiek en afwikkeling.",
        responsibilities: [
          "Leveranciersonboarding controleren en partijpublicatie ondersteunen",
          "Compatibiliteit tussen vraag en aanbod beoordelen en matches goedkeuren",
          "Versiebeheerde offertes opstellen en verkoopcontracten bevestigen",
          "Kwaliteitskeuringen, vrachtaanvragen, afwikkeling en DPP's coördineren",
        ],
        deliverables: ["Goedgekeurde Match", "Offerte & Contract", "Regie over de Cyclus"],
      },
      {
        id: "quality",
        roleName: "Kwaliteitsinspecteurs",
        title: "Onafhankelijke inspecteurs & technische partijkeuring",
        image: "/images/quality_lab.png",
        summary:
          "Toegewezen kwaliteitsinspecteurs voeren objectieve fysieke metingen uit vóór verzending en geven door mensen goedgekeurde keuringscertificaten af.",
        responsibilities: [
          "Toegewezen inspectietaken beheren in een eigen inspecteursportaal",
          "Technische metingen vastleggen (vocht, baalgewicht, roting, zuiverheid)",
          "Fotobewijs, labrapporten en non-conformiteiten uploaden",
          "Menselijk kwaliteitsbesluit vastleggen en officieel PDF-certificaat uitgeven",
        ],
        deliverables: ["Technische Metingen", "Kwaliteitsbesluit", "QIC-certificaat (PDF)"],
      },
      {
        id: "logistics",
        roleName: "Logistieke Partners",
        title: "Europese wegvervoerders en multimodale transporteurs",
        image: "/images/freight_port.png",
        summary:
          "Logistieke partners reageren op vrachtaanvragen voor bevestigde contracten en rapporteren mijlpalen voor toegewezen zendingen.",
        responsibilities: [
          "Vrachtoffertes indienen met prijs, valuta en transittijd",
          "Geplande ophalingen en levering aan de fabriekspoort uitvoeren",
          "Trackingmijlpalen bijwerken en transportdocumenten uploaden",
          "Vertragingen, schade of hoeveelheidsverschillen melden",
        ],
        deliverables: ["Vrachtofferte", "Trackingmijlpalen", "Transportdocumenten"],
      },
    ],
    pillarsSection: {
      eyebrow: "Operationele waarborgen",
      title: "Vier structurele garanties bij elke transactie.",
      body: "In tegenstelling tot passieve gidsen of ongetoetste marktplaatsen verankert I DO GROW elke kritieke stap in verifieerbare gegevens en expliciete menselijke controle.",
      items: [
        {
          id: "quote-negotiation",
          number: "01",
          title: "Transparante offerte met 11 kostenposten",
          body: "Elke offerte splitst grondstofwaarde, commissie, keuringskosten, verpakking, voortransport, internationaal transport, douane, verzekering, opslag en belastingen helder uit.",
          meta: "Onveranderlijk versiebeheer",
        },
        {
          id: "quality-contract",
          number: "02",
          title: "Onafhankelijke kwaliteitskeuring & Incoterms-contract",
          body: "Kwaliteitsbesluiten zijn gebaseerd op gedocumenteerde metingen en leveren een verifieerbaar PDF-certificaat op. Bevestigde contracten leggen de commerciële basis vast.",
          meta: "QIC-certificaat & PDF-contract",
        },
        {
          id: "logistics-settlement",
          number: "03",
          title: "Gecoördineerde logistiek & administratieve afwikkeling",
          body: "Van vervoerdersselectie en mijlpaaltracking tot kostenafstemming en factuuropvolging wordt elke stap transparant vastgelegd zonder speculatieve bankrol.",
          meta: "Controleerbare dossierafsluiting",
        },
        {
          id: "dpp-governance",
          number: "04",
          title: "Digitaal Productpaspoort (DPP) per partij",
          body: "Elke partij krijgt een versiebeheerd digitaal paspoort met herkomst, keuringsresultaten, certificaten en ketenstappen, met strikte afscherming van commerciële marges.",
          meta: "Klaar voor ESPR & CSRD",
        },
      ],
      dppCard: {
        badge: "Digitaal Productpaspoort • DPP",
        subtitle: "Architectuur voor partij-traceerbaarheid",
        f1Label: "Identiteit & Herkomst",
        f1Value: "Partijreferentie, vezelvorm, land en productielocatie",
        f2Label: "Kwaliteit & Certificaten",
        f2Value: "Inspectiemetingen, keuringsstatus en QIC-referentie",
        f3Label: "Handel & Keten",
        f3Value: "Bevestigd contract, zendingsmijlpalen en aflevering",
        f4Label: "Commerciële afscherming",
        f4Value: "Interne marges en bankgegevens strikt afgeschermd",
        note: "Downloadbaar als meerpagina-PDF en toegankelijk via beveiligde QR-code voor geautoriseerde partijen.",
        cta: "Bekijk DPP-traceerbare partijen",
      },
    },
  },
};

export function HowItWorksView() {
  const { locale, t } = useI18n();
  const copy = COPY_BY_LOCALE[locale] || COPY_BY_LOCALE.fr;

  const [selectedStageId, setSelectedStageId] = useState<string>("stage-01");
  const [selectedActorId, setSelectedActorId] = useState<string>("supplier");
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState(t("cta.createAccount"));

  const currentStage =
    copy.stages.find((s) => s.id === selectedStageId) || copy.stages[0];
  const currentActor =
    copy.actors.find((a) => a.id === selectedActorId) || copy.actors[0];

  const openAuthGate = (action?: string) => {
    setAuthGateAction(action || t("cta.createAccount"));
    setAuthGateOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35] selection:bg-[#1e5442] selection:text-white">
      <PublicHeader activeRoute="how-it-works" onOpenAuthGate={openAuthGate} />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* SECTION 1 — EDITORIAL HERO                                                */}
        {/* ========================================================================= */}
        <section className="bg-[#0d1d17] text-white border-b border-[#173f35]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e2c98c]">
                  {t("howItWorks.heroEyebrow")}
                </p>

                <h1 className="mt-5 text-3xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-[-0.03em] text-white leading-[1.06]">
                  {t("howItWorks.heroTitle")}
                </h1>

                <p className="mt-6 text-base sm:text-lg text-[#dbe7e1] max-w-2xl leading-relaxed">
                  {t("howItWorks.heroSubtitle")}
                </p>

                <div className="mt-9 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c89b3c] px-7 py-4 text-sm font-bold text-[#13352c] transition-colors hover:bg-[#d8ad52]"
                  >
                    <span>{t("cta.exploreMarketplace")}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => openAuthGate(t("cta.createAccount"))}
                    className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 cursor-pointer"
                  >
                    {t("cta.createAccount")}
                  </button>
                </div>

                <dl className="mt-12 pt-8 border-t border-white/15 grid grid-cols-3 gap-6">
                  {copy.heroPillars.map((pillar) => (
                    <div key={pillar.label}>
                      <dt className="text-xs uppercase tracking-wider text-[#9fc0b2]">
                        {pillar.label}
                      </dt>
                      <dd className="mt-1 text-sm sm:text-base font-bold text-white">
                        {pillar.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="lg:col-span-5">
                <figure className="relative rounded-sm overflow-hidden border border-white/15 bg-[#143a2f]">
                  <img
                    src="/images/home-v2/warehouse-inspection.jpg"
                    alt={copy.heroCaption}
                    fetchPriority="high"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="p-4 bg-[#143a2f] border-t border-white/10 text-xs text-[#dbe7e1] flex items-center justify-between gap-3">
                    <span>{copy.heroCaption}</span>
                    <span className="px-2 py-0.5 rounded-xs bg-[#c89b3c] text-[#13352c] font-bold text-[10px] uppercase shrink-0">
                      I DO GROW
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — TWO SOURCING PATHWAYS                                         */}
        {/* ========================================================================= */}
        <section id="two-entry-paths" className="py-20 lg:py-28 bg-[#faf8f1] border-b border-[#e4ded0]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6a22]">
                {t("howItWorks.entryPathsTitle")}
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#173f35] leading-[1.1]">
                {t("howItWorks.buyOrderTitle")}
              </h2>
              <p className="mt-3 text-[15px] text-[#4f625a] leading-relaxed">
                {copy.pathsIntro}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Path A */}
              <div className="bg-white rounded-md border border-[#ded8c4] p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a22]">
                    {copy.pathA.tag}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-[#173f35]">
                    {copy.pathA.title}
                  </h3>
                  <p className="text-sm text-[#4f625a] leading-relaxed">
                    {copy.pathA.body}
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-[#173f35]">
                    {copy.pathA.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <span className="text-[#1e5442] font-bold" aria-hidden="true">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 border-t border-[#e4ded0]">
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#173f35] hover:text-[#1e5442] underline underline-offset-4"
                  >
                    <span>{t("cta.findProduct")}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Path B */}
              <div className="bg-white rounded-md border border-[#ded8c4] p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a22]">
                    {copy.pathB.tag}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-[#173f35]">
                    {copy.pathB.title}
                  </h3>
                  <p className="text-sm text-[#4f625a] leading-relaxed">
                    {copy.pathB.body}
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-[#173f35]">
                    {copy.pathB.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <span className="text-[#8a6a22] font-bold" aria-hidden="true">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 border-t border-[#e4ded0]">
                  <button
                    type="button"
                    onClick={() => openAuthGate(t("cta.createBuyOrder"))}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#173f35] hover:text-[#1e5442] underline underline-offset-4 cursor-pointer"
                  >
                    <span>{t("cta.createBuyOrder")}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 — 10-STAGE TRANSACTION LIFECYCLE                                */}
        {/* ========================================================================= */}
        <section id="master-timeline" className="py-20 lg:py-28 bg-[#f2eddf] border-b border-[#e4ded0]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6a22]">
                {t("howItWorks.timelineTitle")}
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#173f35] leading-[1.1]">
                {t("home.steps.title")}
              </h2>
              <p className="mt-3 text-[15px] text-[#4f625a] leading-relaxed">
                {t("howItWorks.timelineSubtitle")}
              </p>
            </div>

            {/* Interactive 10-Stage Selector Grid */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {copy.stages.map((stage) => {
                const isSelected = selectedStageId === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSelectedStageId(stage.id)}
                    aria-pressed={isSelected}
                    className={`py-3 px-2.5 rounded-sm border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#173f35] text-white border-[#173f35]"
                        : "bg-white text-[#173f35] border-[#ded8c4] hover:border-[#173f35]"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold tabular-nums block ${
                        isSelected ? "text-[#e2c98c]" : "text-[#8a6a22]"
                      }`}
                    >
                      {stage.number}
                    </span>
                    <span className="text-xs font-semibold truncate block mt-1">
                      {stage.shortName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Stage Detail Panel */}
            <div className="mt-6 bg-white rounded-md border border-[#ded8c4] p-7 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-bold tabular-nums text-[#8a6a22]">
                      {currentStage.number}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#173f35]">
                      {currentStage.title}
                    </h3>
                  </div>

                  <p className="text-[15px] text-[#4f625a] leading-relaxed">
                    {currentStage.summary}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#173f35] mb-3">
                      {copy.timelineLabels.checkpoints}
                    </h4>
                    <ul className="space-y-2.5 text-sm text-[#4f625a]">
                      {currentStage.checkpoints.map((cp) => (
                        <li key={cp} className="flex items-start gap-2.5">
                          <span className="text-[#8a6a22] font-bold" aria-hidden="true">
                            ✓
                          </span>
                          <span>{cp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#faf8f1] rounded-sm border border-[#e4ded0] p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e4ded0]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5c6e66]">
                      {copy.timelineLabels.governance}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xs bg-[#173f35] text-[#e2c98c] text-[11px] font-semibold">
                      {currentStage.badge}
                    </span>
                  </div>

                  <dl className="space-y-4 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-[#5c6e66] font-semibold">
                        {copy.timelineLabels.actor}
                      </dt>
                      <dd className="mt-1 font-bold text-[#173f35]">
                        {currentStage.actor}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-[#5c6e66] font-semibold">
                        {copy.timelineLabels.artifact}
                      </dt>
                      <dd className="mt-1 font-bold text-[#1e5442]">
                        {currentStage.artifact}
                      </dd>
                    </div>
                  </dl>

                  <div className="pt-3 border-t border-[#e4ded0]">
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#173f35] hover:text-[#1e5442] underline underline-offset-4"
                    >
                      <span>{copy.timelineLabels.exploreCta}</span>
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 — FIVE ECOSYSTEM ACTORS                                         */}
        {/* ========================================================================= */}
        <section id="actor-view" className="py-20 lg:py-28 bg-white border-b border-[#e4ded0]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6a22]">
                {t("howItWorks.actorTitle")}
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#173f35] leading-[1.1]">
                {t("home.audience.title")}
              </h2>
              <p className="mt-3 text-[15px] text-[#4f625a] leading-relaxed">
                {copy.actorLabels.subtitle}
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="mt-10 flex flex-wrap gap-2">
              {copy.actors.map((actor) => {
                const isSelected = selectedActorId === actor.id;
                return (
                  <button
                    key={actor.id}
                    type="button"
                    onClick={() => setSelectedActorId(actor.id)}
                    aria-pressed={isSelected}
                    className={`py-2.5 px-4 rounded-sm text-xs font-bold border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#173f35] text-white border-[#173f35]"
                        : "bg-[#faf8f1] border-[#ded8c4] text-[#173f35] hover:border-[#173f35]"
                    }`}
                  >
                    {actor.roleName}
                  </button>
                );
              })}
            </div>

            {/* Selected Role Showcase */}
            <div className="mt-8 bg-[#faf8f1] rounded-md border border-[#ded8c4] p-7 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-5">
                  <div className="aspect-[4/3] rounded-sm overflow-hidden bg-[#ece6d6] border border-[#ded8c4]">
                    <img
                      src={currentActor.image}
                      alt={currentActor.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a22]">
                      {copy.actorLabels.profileEyebrow} • {currentActor.roleName}
                    </span>
                    <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#173f35]">
                      {currentActor.title}
                    </h3>
                    <p className="mt-3 text-[15px] text-[#4f625a] leading-relaxed">
                      {currentActor.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#173f35] mb-2.5">
                      {copy.actorLabels.responsibilities}
                    </h4>
                    <ul className="space-y-2 text-sm text-[#4f625a]">
                      {currentActor.responsibilities.map((r) => (
                        <li key={r} className="flex items-start gap-2.5">
                          <span className="text-[#8a6a22] font-bold" aria-hidden="true">
                            ✓
                          </span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[#e4ded0] flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#5c6e66] mr-1">
                      {copy.actorLabels.deliverables}:
                    </span>
                    {currentActor.deliverables.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-xs bg-white text-[#173f35] font-semibold border border-[#ded8c4]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — GOVERNANCE PILLARS & DIGITAL PRODUCT PASSPORT (DPP)           */}
        {/* ========================================================================= */}
        <section id="dpp-lifecycle" className="py-20 lg:py-28 bg-[#faf8f1]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: 4 Architectural Guarantees */}
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6a22]">
                {copy.pillarsSection.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#173f35] leading-[1.1]">
                {copy.pillarsSection.title}
              </h2>
              <p className="mt-3 text-[15px] text-[#4f625a] leading-relaxed">
                {copy.pillarsSection.body}
              </p>

              <dl className="mt-10 divide-y divide-[#e4ded0] border-y border-[#e4ded0]">
                {copy.pillarsSection.items.map((item) => (
                  <div id={item.id} key={item.id} className="py-6 scroll-mt-24">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-lg font-bold tracking-tight text-[#173f35] flex items-baseline gap-3">
                        <span className="text-xs font-semibold tabular-nums text-[#8a6a22]">
                          {item.number}
                        </span>
                        <span>{item.title}</span>
                      </dt>
                      <span className="text-[11px] font-semibold text-[#1e5442] shrink-0 hidden sm:inline">
                        {item.meta}
                      </span>
                    </div>
                    <dd className="mt-2 text-sm text-[#4f625a] leading-relaxed pl-6">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right Column: DPP Architectural Summary Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-md bg-[#0d1d17] text-white p-7 sm:p-8 border border-[#173f35] space-y-6">
                <div className="pb-4 border-b border-white/15 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e2c98c] block">
                      {copy.pillarsSection.dppCard.badge}
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      {copy.pillarsSection.dppCard.subtitle}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-xs bg-[#173f35] text-[#e2c98c] text-[10px] font-bold uppercase border border-[#256852]">
                    DPP v1
                  </span>
                </div>

                <dl className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-sm bg-white/5 border border-white/10">
                    <dt className="text-[10px] uppercase tracking-wider text-[#9fc0b2] font-semibold">
                      {copy.pillarsSection.dppCard.f1Label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {copy.pillarsSection.dppCard.f1Value}
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-sm bg-white/5 border border-white/10">
                    <dt className="text-[10px] uppercase tracking-wider text-[#9fc0b2] font-semibold">
                      {copy.pillarsSection.dppCard.f2Label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {copy.pillarsSection.dppCard.f2Value}
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-sm bg-white/5 border border-white/10">
                    <dt className="text-[10px] uppercase tracking-wider text-[#9fc0b2] font-semibold">
                      {copy.pillarsSection.dppCard.f3Label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {copy.pillarsSection.dppCard.f3Value}
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-sm bg-white/5 border border-white/10">
                    <dt className="text-[10px] uppercase tracking-wider text-[#9fc0b2] font-semibold">
                      {copy.pillarsSection.dppCard.f4Label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-[#e2c98c]">
                      {copy.pillarsSection.dppCard.f4Value}
                    </dd>
                  </div>
                </dl>

                <p className="text-xs text-[#b8d4c7] leading-relaxed">
                  {copy.pillarsSection.dppCard.note}
                </p>

                <div className="pt-2">
                  <Link
                    href="/marketplace?hasDpp=true"
                    className="w-full inline-flex items-center justify-between py-3 px-4 rounded-sm bg-[#c89b3c] hover:bg-[#d8ad52] text-[#13352c] text-xs font-bold transition-colors"
                  >
                    <span>{copy.pillarsSection.dppCard.cta}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — FINAL CALL TO ACTION                                          */}
        {/* ========================================================================= */}
        <section className="bg-[#143a2f] text-white py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold leading-[1.08] tracking-[-0.03em] text-white">
              {t("howItWorks.ctaHeadline")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-[#c4dfd4]">
              {t("howItWorks.ctaSubtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c89b3c] px-7 py-4 text-sm font-bold text-[#13352c] transition-colors hover:bg-[#d8ad52]"
              >
                <span>{t("cta.exploreMarketplace")}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <button
                type="button"
                onClick={() => openAuthGate(t("cta.createAccount"))}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 cursor-pointer"
              >
                {t("cta.createAccount")}
              </button>
            </div>
          </div>
        </section>
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
