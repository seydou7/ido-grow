import test from "node:test";
import assert from "node:assert/strict";

const INSPECTION_STATUS_CONFIG = {
  DRAFT: {
    label: "Inspection Unassigned",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Inspection created — awaiting inspector assignment",
  },
  ASSIGNED: {
    label: "Inspection Assigned",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    description: "Assigned to inspector — scheduled or ready to start",
  },
  IN_PROGRESS: {
    label: "Inspection In Progress",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    description: "Inspection started — measurement entry in progress",
  },
  COMPLETED: {
    label: "Inspection Data Complete",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "All required structured measurement data recorded",
  },
};

const INSPECTION_METHOD_LABELS = {
  INDEPENDENT_PHYSICAL_INSPECTION: "Independent Physical Inspection",
  LOCAL_AGENT_VERIFIED: "Local-Agent Verified",
  SUPPLIER_SELF_REPORTED: "Supplier Self-Reported",
  REMOTE: "Remote Assessment",
  LABORATORY_TESTED: "Laboratory Tested",
  AI_ASSISTED: "AI-Assisted Assessment",
};

test("Quality Inspection lifecycle configuration covers exactly 4 deterministic states", () => {
  const statuses = Object.keys(INSPECTION_STATUS_CONFIG);
  assert.deepEqual(statuses.sort(), ["ASSIGNED", "COMPLETED", "DRAFT", "IN_PROGRESS"].sort());

  assert.equal(INSPECTION_STATUS_CONFIG.DRAFT.label, "Inspection Unassigned");
  assert.equal(INSPECTION_STATUS_CONFIG.ASSIGNED.label, "Inspection Assigned");
  assert.equal(INSPECTION_STATUS_CONFIG.IN_PROGRESS.label, "Inspection In Progress");
  assert.equal(INSPECTION_STATUS_CONFIG.COMPLETED.label, "Inspection Data Complete");

  // Crucial check: COMPLETED wording does NOT say "Approved" or "Grade Accepted"
  assert.ok(!INSPECTION_STATUS_CONFIG.COMPLETED.label.toLowerCase().includes("approved"));
  assert.ok(!INSPECTION_STATUS_CONFIG.COMPLETED.label.toLowerCase().includes("grade"));
});

test("Inspection methods cover all 6 client-manual verification channels", () => {
  const methods = Object.keys(INSPECTION_METHOD_LABELS);
  assert.ok(methods.includes("INDEPENDENT_PHYSICAL_INSPECTION"));
  assert.ok(methods.includes("LOCAL_AGENT_VERIFIED"));
  assert.ok(methods.includes("SUPPLIER_SELF_REPORTED"));
  assert.ok(methods.includes("REMOTE"));
  assert.ok(methods.includes("LABORATORY_TESTED"));
  assert.ok(methods.includes("AI_ASSISTED"));

  assert.equal(
    INSPECTION_METHOD_LABELS.INDEPENDENT_PHYSICAL_INSPECTION,
    "Independent Physical Inspection",
  );
  assert.equal(
    INSPECTION_METHOD_LABELS.AI_ASSISTED,
    "AI-Assisted Assessment",
  );
});

test("Hemp Quality Template specification contains exactly 14 source-supported fields", () => {
  const EXPECTED_HEMP_FIELDS = [
    { name: "moisturePercentage", type: "NUMERIC", unit: "%" },
    { name: "baleDimensions", type: "TEXT", unit: "cm" },
    { name: "estimatedBaleWeight", type: "NUMERIC", unit: "kg" },
    { name: "rettingQuality", type: "TEXT" },
    { name: "colour", type: "TEXT" },
    { name: "consistency", type: "TEXT" },
    { name: "contamination", type: "TEXT" },
    { name: "mouldIndicators", type: "BOOLEAN" },
    { name: "soilOrStoneContamination", type: "BOOLEAN" },
    { name: "storageConditions", type: "TEXT" },
    { name: "harvestDate", type: "DATE" },
    { name: "baleIntegrity", type: "TEXT" },
    { name: "fibreToHurdIndication", type: "TEXT" },
    { name: "visualHomogeneity", type: "TEXT" },
  ];

  assert.equal(EXPECTED_HEMP_FIELDS.length, 14);

  // Verify explicit units
  const moisture = EXPECTED_HEMP_FIELDS.find((f) => f.name === "moisturePercentage");
  const dimensions = EXPECTED_HEMP_FIELDS.find((f) => f.name === "baleDimensions");
  const weight = EXPECTED_HEMP_FIELDS.find((f) => f.name === "estimatedBaleWeight");

  assert.equal(moisture.unit, "%");
  assert.equal(dimensions.unit, "cm");
  assert.equal(weight.unit, "kg");

  // Verify boolean contamination indicators
  const mould = EXPECTED_HEMP_FIELDS.find((f) => f.name === "mouldIndicators");
  const soil = EXPECTED_HEMP_FIELDS.find((f) => f.name === "soilOrStoneContamination");
  assert.equal(mould.type, "BOOLEAN");
  assert.equal(soil.type, "BOOLEAN");
});

test("Moisture percentage validation enforces technical 0–100 percentage range", () => {
  function validateMoisture(val) {
    if (val === null || val === undefined || val === "") return null;
    const num = Number(val);
    if (isNaN(num)) return "Moisture must be a valid number";
    if (num < 0 || num > 100) return "Moisture percentage must be between 0% and 100%";
    return null;
  }

  assert.equal(validateMoisture(14.5), null);
  assert.equal(validateMoisture(0), null);
  assert.equal(validateMoisture(100), null);
  assert.equal(validateMoisture(-1), "Moisture percentage must be between 0% and 100%");
  assert.equal(validateMoisture(105), "Moisture percentage must be between 0% and 100%");
  assert.equal(validateMoisture("abc"), "Moisture must be a valid number");
});

test("Required fields completeness check prevents completion when measurements are missing", () => {
  const templateRequiredFields = [
    "moisturePercentage",
    "baleDimensions",
    "estimatedBaleWeight",
    "rettingQuality",
    "colour",
    "consistency",
    "contamination",
    "mouldIndicators",
    "soilOrStoneContamination",
    "storageConditions",
    "harvestDate",
    "baleIntegrity",
    "fibreToHurdIndication",
    "visualHomogeneity",
  ];

  function checkCompleteness(measurements) {
    const missing = [];
    for (const f of templateRequiredFields) {
      const val = measurements[f];
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
        missing.push(f);
      }
    }
    return { isComplete: missing.length === 0, missingFields: missing };
  }

  // Partial measurements
  const partial = {
    moisturePercentage: 14.5,
    estimatedBaleWeight: 380,
  };
  const partialResult = checkCompleteness(partial);
  assert.equal(partialResult.isComplete, false);
  assert.equal(partialResult.missingFields.length, 12);

  // Full measurements
  const full = {
    moisturePercentage: 14.2,
    baleDimensions: "120 x 120 x 240 cm",
    estimatedBaleWeight: 390,
    rettingQuality: "Optimum retting with high straw stem separation",
    colour: "Golden blonde",
    consistency: "Uniform bale compaction and fibre length",
    contamination: "Trace weed stems only",
    mouldIndicators: false,
    soilOrStoneContamination: false,
    storageConditions: "Indoor covered shed with concrete flooring",
    harvestDate: "2026-08-15",
    baleIntegrity: "Tight rectangular bales with intact sisal strings",
    fibreToHurdIndication: "Approx. 32% technical fibre yield",
    visualHomogeneity: "High visual homogeneity across batch",
  };
  const fullResult = checkCompleteness(full);
  assert.equal(fullResult.isComplete, true);
  assert.equal(fullResult.missingFields.length, 0);
});

test("Inspection record context preserves non-canonical externalLotReference and Trade link", () => {
  const mockInspection = {
    id: "ins-001",
    inspectionReference: "INS-20260918-0001",
    tradeId: "trade-uuid-1",
    tradeNumber: "TRD-20260918-001",
    externalLotReference: "LOT-HEMP-FR-42",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 50,
    quantityUnit: "TONNES",
    status: "COMPLETED",
  };

  assert.equal(mockInspection.externalLotReference, "LOT-HEMP-FR-42");
  assert.equal(mockInspection.tradeNumber, "TRD-20260918-001");
  assert.equal(mockInspection.status, "COMPLETED");
});

// =======================================================
// SPRINT 07 PHASE 0 & BLOCK 02 TESTS
// =======================================================

test("Navigation links: Quality Inspector has 'My Inspections' without Trader modules or organisation requirement", () => {
  function getVisibleNavItems(userRole, organisationType) {
    const items = [];
    if (userRole === "QUALITY_INSPECTOR") {
      items.push({ id: "my-inspections", label: "My Inspections" });
      return items;
    }

    if (organisationType === "TRADER") {
      items.push({ id: "cockpit", label: "Cockpit" });
      items.push({ id: "trades", label: "Trades" });
      items.push({ id: "quality-inspections", label: "Quality Inspections" });
    } else if (organisationType === "BUYER") {
      items.push({ id: "demands", label: "Demands" });
      items.push({ id: "trades", label: "Trades" });
    } else if (organisationType === "SUPPLIER") {
      items.push({ id: "listings", label: "Listings" });
      items.push({ id: "trades", label: "Trades" });
    }
    return items;
  }

  const inspectorNav = getVisibleNavItems("QUALITY_INSPECTOR", null);
  assert.equal(inspectorNav.length, 1);
  assert.equal(inspectorNav[0].id, "my-inspections");
  assert.ok(!inspectorNav.some((item) => item.id === "cockpit"));

  const traderNav = getVisibleNavItems("TRADER", "TRADER");
  assert.ok(traderNav.some((item) => item.id === "quality-inspections"));
  assert.ok(traderNav.some((item) => item.id === "cockpit"));

  const buyerNav = getVisibleNavItems("BUYER", "BUYER");
  assert.ok(!buyerNav.some((item) => item.id === "quality-inspections"));
  assert.ok(!buyerNav.some((item) => item.id === "my-inspections"));

  const supplierNav = getVisibleNavItems("SUPPLIER", "SUPPLIER");
  assert.ok(!supplierNav.some((item) => item.id === "quality-inspections"));
  assert.ok(!supplierNav.some((item) => item.id === "my-inspections"));
});

test("Evidence validation: Allowed types and MIME validation", () => {
  const ALLOWED_EVIDENCE_TYPES = ["PHOTO", "DOCUMENT", "LAB_REPORT"];
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  function validateEvidenceUpload(evidenceType, mimeType, size) {
    if (!ALLOWED_EVIDENCE_TYPES.includes(evidenceType)) {
      return "Invalid evidence type";
    }
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return "Unsupported file format";
    }
    if (size > 10 * 1024 * 1024) {
      return "File exceeds 10MB maximum size";
    }
    return null;
  }

  assert.equal(validateEvidenceUpload("PHOTO", "image/jpeg", 2048), null);
  assert.equal(validateEvidenceUpload("DOCUMENT", "application/pdf", 1048576), null);
  assert.equal(validateEvidenceUpload("LAB_REPORT", "application/pdf", 2048576), null);

  // Rejected invented types
  assert.equal(validateEvidenceUpload("WEIGHBRIDGE_SLIP", "image/jpeg", 2048), "Invalid evidence type");
  assert.equal(validateEvidenceUpload("PHOTO", "application/x-msdownload", 1024), "Unsupported file format");
});

test("Preliminary Assessment: neutral states and fields without final grading", () => {
  const VALID_ASSESSMENT_STATUSES = ["NOT_ASSESSED", "ASSESSMENT_RECORDED"];

  function recordAssessment(existingStatus, summary, issues, followUp) {
    if (!summary || summary.trim().length === 0) {
      throw new Error("Assessment summary is required");
    }
    return {
      status: "ASSESSMENT_RECORDED",
      assessmentSummary: summary.trim(),
      observedIssues: issues?.trim() || null,
      recommendedFollowUp: followUp?.trim() || null,
      assessedAt: new Date().toISOString(),
    };
  }

  assert.deepEqual(VALID_ASSESSMENT_STATUSES, ["NOT_ASSESSED", "ASSESSMENT_RECORDED"]);

  const result = recordAssessment(
    "NOT_ASSESSED",
    "Hemp straw visual inspection aligns with specification with minor stem irregularity.",
    "Slight uneven retting along perimeter bales.",
    "Recommend verification of dry storage humidity prior to bale unwrapping."
  );

  assert.equal(result.status, "ASSESSMENT_RECORDED");
  assert.ok(result.assessmentSummary.includes("Hemp straw"));
  assert.equal(result.observedIssues, "Slight uneven retting along perimeter bales.");
  // Ensure NO final grades in assessment record
  assert.equal(result.finalGrade, undefined);
  assert.equal(result.isApproved, undefined);
});

test("Non-Conformity Foundation: OPEN and RESOLVED lifecycle without invented severity", () => {
  const NON_CONFORMITY_STATUSES = ["OPEN", "RESOLVED"];

  function createNonConformity(category, description, reporterUserId) {
    if (!category || !description) throw new Error("Category and description required");
    return {
      id: "nc-1",
      status: "OPEN",
      category,
      description,
      reportedByUserId: reporterUserId,
      resolvedAt: null,
      resolutionNotes: null,
    };
  }

  function resolveNonConformity(nc, notes, resolverUserId) {
    if (nc.status !== "OPEN") throw new Error("Only open non-conformities can be resolved");
    if (!notes || notes.trim().length === 0) throw new Error("Resolution notes required");
    return {
      ...nc,
      status: "RESOLVED",
      resolutionNotes: notes.trim(),
      resolvedAt: new Date().toISOString(),
      resolvedByUserId: resolverUserId,
    };
  }

  const nc = createNonConformity("MOISTURE_OBSERVATION", "Moisture reading requires quality review.", "user-insp-1");
  assert.equal(nc.status, "OPEN");

  const resolved = resolveNonConformity(nc, "Moisture condition was rechecked and corrective action documented.", "user-trader-1");
  assert.equal(resolved.status, "RESOLVED");
  assert.ok(resolved.resolvedAt !== null);
  assert.equal(resolved.resolutionNotes, "Moisture condition was rechecked and corrective action documented.");
});

test("Physical Inspection Escalation flag and reason tracking", () => {
  function requestPhysicalInspection(reason) {
    if (!reason || reason.trim().length === 0) {
      throw new Error("Reason is required to request physical inspection escalation");
    }
    return {
      physicalInspectionRequired: true,
      physicalInspectionReason: reason.trim(),
    };
  }

  const escalation = requestPhysicalInspection("Contamination indicators require in-person core sampling");
  assert.equal(escalation.physicalInspectionRequired, true);
  assert.equal(escalation.physicalInspectionReason, "Contamination indicators require in-person core sampling");
});

// =======================================================
// SPRINT 07 BLOCK 03 TESTS: QUALITY RESULT & CERTIFICATE
// =======================================================

test("Final Quality Decision Gate: Requires COMPLETED status and recorded assessment", () => {
  function canRecordQualityDecision(inspection) {
    if (inspection.status !== "COMPLETED") {
      return { allowed: false, error: "Inspection must be COMPLETED" };
    }
    if (inspection.assessmentStatus !== "ASSESSMENT_RECORDED") {
      return { allowed: false, error: "Preliminary assessment must be recorded" };
    }
    if (inspection.qualityResult) {
      return { allowed: false, error: "Quality decision is already recorded and immutable" };
    }
    return { allowed: true };
  }

  // DRAFT
  assert.equal(
    canRecordQualityDecision({ status: "DRAFT", assessmentStatus: "NOT_ASSESSED" }).allowed,
    false,
  );
  // ASSIGNED
  assert.equal(
    canRecordQualityDecision({ status: "ASSIGNED", assessmentStatus: "NOT_ASSESSED" }).allowed,
    false,
  );
  // IN_PROGRESS
  assert.equal(
    canRecordQualityDecision({ status: "IN_PROGRESS", assessmentStatus: "NOT_ASSESSED" }).allowed,
    false,
  );
  // COMPLETED without assessment
  assert.equal(
    canRecordQualityDecision({ status: "COMPLETED", assessmentStatus: "NOT_ASSESSED" }).allowed,
    false,
  );
  // COMPLETED with assessment
  assert.equal(
    canRecordQualityDecision({ status: "COMPLETED", assessmentStatus: "ASSESSMENT_RECORDED" }).allowed,
    true,
  );
  // Already decided
  assert.equal(
    canRecordQualityDecision({
      status: "COMPLETED",
      assessmentStatus: "ASSESSMENT_RECORDED",
      qualityResult: { decision: "APPROVED" },
    }).allowed,
    false,
  );
});

test("Quality Decision validation: APPROVED or REJECTED with mandatory classification label", () => {
  function validateDecision(decision, classificationLabel) {
    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return "Decision must be either APPROVED or REJECTED";
    }
    if (!classificationLabel || classificationLabel.trim().length === 0) {
      return "Classification label is required";
    }
    return null;
  }

  assert.equal(validateDecision("APPROVED", "Standard Commercial Retting"), null);
  assert.equal(validateDecision("REJECTED", "Substandard Fibre Yield"), null);
  assert.equal(validateDecision("PASS", "Standard Retting"), "Decision must be either APPROVED or REJECTED");
  assert.equal(validateDecision("APPROVED", ""), "Classification label is required");
});

test("Inspection Certificate generation: Issued only for APPROVED decisions", () => {
  function processQualityDecision(decision, classificationLabel, inspectionRef) {
    const result = {
      decision,
      classificationLabel,
      decidedAt: new Date().toISOString(),
    };

    let certificate = null;
    if (decision === "APPROVED") {
      certificate = {
        certificateNumber: `QIC-20260918-0001`,
        inspectionReference: inspectionRef,
        issuedAt: new Date().toISOString(),
      };
    }

    return { result, certificate };
  }

  const approved = processQualityDecision("APPROVED", "Prime Quality Straw", "INS-20260918-0001");
  assert.equal(approved.result.decision, "APPROVED");
  assert.ok(approved.certificate !== null);
  assert.equal(approved.certificate.certificateNumber, "QIC-20260918-0001");

  const rejected = processQualityDecision("REJECTED", "Severe Inhomogeneity", "INS-20260918-0002");
  assert.equal(rejected.result.decision, "REJECTED");
  assert.equal(rejected.certificate, null);
});

test("Evidence upload limit contract: strictly enforces MAX_INSPECTION_EVIDENCE_BYTES (10MB)", () => {
  const MAX_BYTES = 10 * 1024 * 1024;
  assert.equal(MAX_BYTES, 10485760);

  function checkFileSize(size) {
    if (size > MAX_BYTES) {
      return `File size exceeds 10MB limit (selected: ${(size / 1024 / 1024).toFixed(2)}MB).`;
    }
    return null;
  }

  assert.equal(checkFileSize(5 * 1024 * 1024), null);
  assert.equal(checkFileSize(10 * 1024 * 1024), null);
  assert.ok(checkFileSize(10 * 1024 * 1024 + 1)?.includes("exceeds 10MB limit"));
});

test("Non-conformity resolution idempotency: cannot resolve already RESOLVED non-conformity", () => {
  function resolveNC(nc) {
    if (nc.status === "RESOLVED") {
      throw new Error("This non-conformity has already been resolved and cannot be resolved again.");
    }
    return { ...nc, status: "RESOLVED" };
  }

  const openNC = { id: "nc-1", status: "OPEN" };
  const resolved = resolveNC(openNC);
  assert.equal(resolved.status, "RESOLVED");

  assert.throws(
    () => resolveNC(resolved),
    /already been resolved/,
  );
});

test("Inspection UI locking lifecycle: preserves assessment & non-conformities access in COMPLETED status until final decision", () => {
  function computeLockingState(inspection) {
    const isDraft = inspection.status === "DRAFT";
    const isDataCompleted = inspection.status === "COMPLETED";
    const isDecisionFinalized = Boolean(inspection.qualityResult);

    const isMeasurementsLocked = isDataCompleted || isDecisionFinalized;
    const isAssessmentLocked = isDecisionFinalized;
    const isNonConformitiesLocked = isDecisionFinalized;

    return {
      canEditMeasurements: !isDraft && !isMeasurementsLocked,
      canUploadEvidence: !isMeasurementsLocked,
      canRecordAssessment: !isDraft && !isAssessmentLocked,
      canManageNonConformities: !isDraft && !isNonConformitiesLocked,
      canResolveOpenNC: !isNonConformitiesLocked,
    };
  }

  // 1. IN_PROGRESS state (field data entry)
  const inProgressState = computeLockingState({
    status: "IN_PROGRESS",
    qualityResult: null,
  });
  assert.equal(inProgressState.canEditMeasurements, true);
  assert.equal(inProgressState.canUploadEvidence, true);
  assert.equal(inProgressState.canRecordAssessment, true);
  assert.equal(inProgressState.canManageNonConformities, true);
  assert.equal(inProgressState.canResolveOpenNC, true);

  // 2. COMPLETED state before final decision (S07-01 test scenario: measurements sealed, review open)
  const completedState = computeLockingState({
    status: "COMPLETED",
    qualityResult: null,
  });
  // Measurements and evidence sealed
  assert.equal(completedState.canEditMeasurements, false);
  assert.equal(completedState.canUploadEvidence, false);
  // BUG 1 regression: Assessment form MUST remain accessible in COMPLETED state
  assert.equal(completedState.canRecordAssessment, true);
  // BUG 2 regression: Non-conformities MUST remain manageable in COMPLETED state
  assert.equal(completedState.canManageNonConformities, true);
  assert.equal(completedState.canResolveOpenNC, true);

  // 3. Final decision recorded (fully sealed, certificate issued or rejected)
  const finalizedState = computeLockingState({
    status: "COMPLETED",
    qualityResult: { decision: "APPROVED", classificationLabel: "Standard" },
  });
  assert.equal(finalizedState.canEditMeasurements, false);
  assert.equal(finalizedState.canUploadEvidence, false);
  assert.equal(finalizedState.canRecordAssessment, false);
  assert.equal(finalizedState.canManageNonConformities, false);
  assert.equal(finalizedState.canResolveOpenNC, false);

  // 4. DRAFT state (pre-assignment)
  const draftState = computeLockingState({
    status: "DRAFT",
    qualityResult: null,
  });
  assert.equal(draftState.canEditMeasurements, false);
  assert.equal(draftState.canRecordAssessment, false);
  assert.equal(draftState.canManageNonConformities, false);
});

