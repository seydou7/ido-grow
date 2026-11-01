"use client";

import React, { useEffect, useState } from "react";
import {
  getInspectionById,
  startInspection,
  saveMeasurements,
  completeInspectionData,
  uploadEvidence,
  getEvidenceFileUrl,
  recordAssessment,
  createNonConformity,
  resolveNonConformity,
  requestPhysicalInspection,
  recordQualityDecision,
  getCertificateFileUrl,
  QualityRequestError,
} from "./api";
import { MAX_INSPECTION_EVIDENCE_BYTES } from "./contracts";
import {
  InspectionDetail,
  InspectionTemplateField,
  INSPECTION_STATUS_CONFIG,
  INSPECTION_METHOD_LABELS,
  InspectionMethod,
  EvidenceType,
  EVIDENCE_TYPE_LABELS,
  ASSESSMENT_STATUS_CONFIG,
  NON_CONFORMITY_STATUS_CONFIG,
} from "./contracts";

interface InspectionDetailViewProps {
  inspectionId: string;
  isTraderView?: boolean;
  onBack?: () => void;
  onOpenTrade?: (tradeId: string) => void;
}

export function InspectionDetailView({
  inspectionId,
  isTraderView = false,
  onBack,
  onOpenTrade,
}: InspectionDetailViewProps) {
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form State - Measurements
  const [measurements, setMeasurements] = useState<Record<string, unknown>>({});
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [equipmentUsed, setEquipmentUsed] = useState<string>("");
  const [measurementMethod, setMeasurementMethod] = useState<string>("");
  const [inspectorNotes, setInspectorNotes] = useState<string>("");

  // Evidence Upload State
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("PHOTO");
  const [evidenceCaption, setEvidenceCaption] = useState<string>("");
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Preliminary Human Assessment State
  const [assessmentSummary, setAssessmentSummary] = useState<string>("");
  const [observedIssues, setObservedIssues] = useState<string>("");
  const [recommendedFollowUp, setRecommendedFollowUp] = useState<string>("");
  const [savingAssessment, setSavingAssessment] = useState(false);

  // Non-Conformity State
  const [ncCategory, setNcCategory] = useState<string>("MOISTURE_EXCESS");
  const [ncDescription, setNcDescription] = useState<string>("");
  const [savingNc, setSavingNc] = useState(false);
  const [resolvingNcId, setResolvingNcId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [savingResolution, setSavingResolution] = useState(false);

  // Physical Inspection Escalation State
  const [showPhysicalModal, setShowPhysicalModal] = useState(false);
  // Block 03 Quality Decision state
  const [classificationLabel, setClassificationLabel] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionAction, setDecisionAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const [physicalReason, setPhysicalReason] = useState<string>("");
  const [savingPhysical, setSavingPhysical] = useState(false);

  const fetchInspection = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInspectionById(inspectionId);
      setInspection(data);
      setMeasurements(data.measurements || {});
      setLatitude(data.latitude !== null ? String(data.latitude) : "");
      setLongitude(data.longitude !== null ? String(data.longitude) : "");
      setEquipmentUsed(data.equipmentUsed || "");
      setMeasurementMethod(data.measurementMethod || "");
      setInspectorNotes(data.inspectorNotes || "");
      if (data.assessmentSummary) {
        setAssessmentSummary(data.assessmentSummary);
        setObservedIssues(data.observedIssues || "");
        setRecommendedFollowUp(data.recommendedFollowUp || "");
      }
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to load inspection task.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInspection();
  }, [inspectionId]);

  const handleFieldChange = (name: string, value: unknown) => {
    setMeasurements((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartInspection = async () => {
    setError(null);
    setFeedbackMessage(null);
    try {
      const updated = await startInspection(inspectionId);
      setInspection(updated);
      setFeedbackMessage("Inspection task started successfully.");
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to start inspection task.");
      }
    }
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    setError(null);
    setFeedbackMessage(null);
    try {
      const latNum = latitude.trim() !== "" ? parseFloat(latitude) : undefined;
      const lngNum = longitude.trim() !== "" ? parseFloat(longitude) : undefined;

      const updated = await saveMeasurements(inspectionId, {
        measurements,
        latitude: isNaN(latNum as number) ? undefined : latNum,
        longitude: isNaN(lngNum as number) ? undefined : lngNum,
        equipmentUsed: equipmentUsed.trim() || undefined,
        measurementMethod: measurementMethod.trim() || undefined,
        inspectorNotes: inspectorNotes.trim() || undefined,
      });

      setInspection(updated);
      setFeedbackMessage("Inspection measurements saved successfully.");
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to save inspection measurements.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteData = async () => {
    setCompleting(true);
    setError(null);
    setFeedbackMessage(null);
    try {
      const latNum = latitude.trim() !== "" ? parseFloat(latitude) : undefined;
      const lngNum = longitude.trim() !== "" ? parseFloat(longitude) : undefined;

      await saveMeasurements(inspectionId, {
        measurements,
        latitude: isNaN(latNum as number) ? undefined : latNum,
        longitude: isNaN(lngNum as number) ? undefined : lngNum,
        equipmentUsed: equipmentUsed.trim() || undefined,
        measurementMethod: measurementMethod.trim() || undefined,
        inspectorNotes: inspectorNotes.trim() || undefined,
      });

      const completed = await completeInspectionData(inspectionId);
      setInspection(completed);
      setFeedbackMessage("Inspection data entry completed successfully.");
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to complete inspection data entry.");
      }
    } finally {
      setCompleting(false);
    }
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile) return;
    if (evidenceFile.size > MAX_INSPECTION_EVIDENCE_BYTES) {
      setError(`File size exceeds 10MB limit (selected: ${(evidenceFile.size / 1024 / 1024).toFixed(2)}MB).`);
      return;
    }
    setUploadingEvidence(true);
    setError(null);
    setFeedbackMessage(null);

    try {
      await uploadEvidence(inspectionId, evidenceFile, {
        evidenceType,
        caption: evidenceCaption.trim() || undefined,
      });
      setEvidenceFile(null);
      setEvidenceCaption("");
      setFeedbackMessage("Evidence uploaded successfully.");
      await fetchInspection();
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to upload evidence.");
      }
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentSummary.trim()) return;
    setSavingAssessment(true);
    setError(null);
    setFeedbackMessage(null);

    try {
      const updated = await recordAssessment(inspectionId, {
        assessmentSummary: assessmentSummary.trim(),
        observedIssues: observedIssues.trim() || undefined,
        recommendedFollowUp: recommendedFollowUp.trim() || undefined,
      });
      setInspection(updated);
      setFeedbackMessage("Preliminary human assessment recorded successfully.");
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to record assessment.");
      }
    } finally {
      setSavingAssessment(false);
    }
  };

  const handleCreateNonConformity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncDescription.trim()) return;
    setSavingNc(true);
    setError(null);
    setFeedbackMessage(null);

    try {
      await createNonConformity(inspectionId, {
        category: ncCategory,
        description: ncDescription.trim(),
      });
      setNcDescription("");
      setFeedbackMessage("Non-conformity recorded successfully.");
      await fetchInspection();
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to record non-conformity.");
      }
    } finally {
      setSavingNc(false);
    }
  };

  const handleResolveNonConformity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingNcId || !resolutionNotes.trim()) return;
    setSavingResolution(true);
    setError(null);
    setFeedbackMessage(null);

    try {
      await resolveNonConformity(inspectionId, resolvingNcId, {
        resolutionNotes: resolutionNotes.trim(),
      });
      setResolvingNcId(null);
      setResolutionNotes("");
      setFeedbackMessage("Non-conformity resolved successfully.");
      await fetchInspection();
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to resolve non-conformity.");
      }
    } finally {
      setSavingResolution(false);
    }
  };


  const handleConfirmDecision = async () => {
    if (!decisionAction) return;
    if (!classificationLabel.trim()) {
      setError("Classification label is required.");
      return;
    }

    setSubmittingDecision(true);
    setError(null);
    setFeedbackMessage(null);

    try {
      await recordQualityDecision(inspectionId, {
        decision: decisionAction,
        classificationLabel: classificationLabel.trim(),
        decisionNotes: decisionNotes.trim() || undefined,
      });
      setShowDecisionModal(false);
      setDecisionAction(null);
      setFeedbackMessage(
        decisionAction === "APPROVED"
          ? "Quality Result APPROVED. Official Inspection Certificate generated."
          : "Quality Result REJECTED. Decision recorded."
      );
      await fetchInspection();
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to record quality decision.");
      }
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleRequestPhysical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!physicalReason.trim()) return;
    setSavingPhysical(true);
    setError(null);
    setFeedbackMessage(null);

    try {
      const updated = await requestPhysicalInspection(inspectionId, {
        reason: physicalReason.trim(),
      });
      setInspection(updated);
      setShowPhysicalModal(false);
      setPhysicalReason("");
      setFeedbackMessage("Physical inspection escalation requested successfully.");
    } catch (err: unknown) {
      if (err instanceof QualityRequestError) {
        setError(err.message);
      } else {
        setError("Failed to request physical inspection.");
      }
    } finally {
      setSavingPhysical(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#173f35] border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-slate-600">Loading inspection details...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-800">
          {error || "Inspection record not found."}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-white"
          >
            Return to Work Queue
          </button>
        )}
      </div>
    );
  }

  const statusConfig = INSPECTION_STATUS_CONFIG[inspection.status];
  const isDraft = inspection.status === "DRAFT";
  const isAssigned = inspection.status === "ASSIGNED";
  const isDataCompleted = inspection.status === "COMPLETED";
  const isDecisionFinalized = Boolean(inspection.qualityResult);

  // Measurements & evidence upload are locked once inspection measurement data entry is COMPLETED (or if decision finalized)
  const isMeasurementsLocked = isDataCompleted || isDecisionFinalized;

  // Preliminary assessment and non-conformities remain manageable after COMPLETED until final decision is recorded
  const isAssessmentLocked = isDecisionFinalized;
  const isNonConformitiesLocked = isDecisionFinalized;

  const fieldsByCategory: Record<string, InspectionTemplateField[]> = {
    PHYSICAL_PROPERTIES: [],
    FIBRE_QUALITY: [],
    CONTAMINATION_STORAGE: [],
  };

  inspection.templateFields.forEach((field) => {
    if (fieldsByCategory[field.category]) {
      fieldsByCategory[field.category].push(field);
    } else {
      fieldsByCategory.PHYSICAL_PROPERTIES.push(field);
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#e2d9c8] bg-white p-5 shadow-xs md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-[#173f35]"
              >
                ← Back to Queue
              </button>
            )}
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ASSESSMENT_STATUS_CONFIG[inspection.assessmentStatus].badgeClass}`}
            >
              {ASSESSMENT_STATUS_CONFIG[inspection.assessmentStatus].label}
            </span>
            {inspection.physicalInspectionRequired && (
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                Physical Inspection Required
              </span>
            )}
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-[#173f35]">
            {inspection.inspectionReference}
          </h1>
          <p className="text-xs text-slate-500">
            Template: {inspection.templateName} (v{inspection.templateVersion}) · Method:{" "}
            {INSPECTION_METHOD_LABELS[inspection.inspectionMethod as InspectionMethod] ||
              inspection.inspectionMethod}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {inspection.tradeId && (
            <button
              onClick={() => onOpenTrade && onOpenTrade(inspection.tradeId!)}
              className="rounded-lg border border-[#e2d9c8] bg-[#fbf8ef] px-3 py-1.5 text-xs font-semibold text-[#173f35] transition-colors hover:bg-[#f5eedc]"
            >
              Trade Record: {inspection.tradeNumber || "View Trade"}
            </button>
          )}

          {!inspection.physicalInspectionRequired && !isDecisionFinalized && (
            <button
              onClick={() => setShowPhysicalModal(true)}
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
            >
              Request Physical Escalation
            </button>
          )}

          {isAssigned && (
            <button
              onClick={handleStartInspection}
              className="rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#204e42]"
            >
              Start Inspection
            </button>
          )}

          {!isDraft && !isMeasurementsLocked && (
            <>
              <button
                onClick={handleSaveProgress}
                disabled={saving}
                className="rounded-lg border border-[#173f35] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Progress"}
              </button>
              <button
                onClick={handleCompleteData}
                disabled={completing}
                className="rounded-lg bg-[#173f35] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#204e42] disabled:opacity-50"
              >
                {completing ? "Completing..." : "Complete Data Entry"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Physical Inspection Banner if Required */}
      {inspection.physicalInspectionRequired && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Physical Inspection Required
              </h4>
              <p className="mt-0.5 text-xs text-amber-800">
                Reason: {inspection.physicalInspectionReason || "Escalation requested by inspector."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {feedbackMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          {feedbackMessage}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
          {error}
        </div>
      )}

      {/* Commercial & Operational Context Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#e2d9c8] bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            External Lot Reference
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {inspection.externalLotReference || "Not specified"}
          </p>
        </div>
        <div className="rounded-lg border border-[#e2d9c8] bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Supplier Organisation
          </p>
          <p className="mt-1 truncate text-sm font-bold text-slate-800">
            {inspection.supplierOrganisation.name}
          </p>
        </div>
        <div className="rounded-lg border border-[#e2d9c8] bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Assigned Inspector
          </p>
          <p className="mt-1 truncate text-sm font-bold text-slate-800">
            {inspection.assignedInspector?.email || "Unassigned"}
          </p>
        </div>
        <div className="rounded-lg border border-[#e2d9c8] bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Evidence Attached
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {inspection.evidence.length} file{inspection.evidence.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* SECTION 1: 14 FIELD MEASUREMENTS */}
      <div className="rounded-xl border border-[#e2d9c8] bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#173f35]">
            Structured Quality Measurements (14 Technical Fields)
          </h2>
          <p className="text-xs text-slate-500">
            Source-safe measurements for European Hemp Straw. No unapproved domain enums or arbitrary thresholds.
          </p>
        </div>

        <div className="mt-5 space-y-6">
          {/* Category A: Physical Properties */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              A. Physical Properties & Bale Dimensions
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fieldsByCategory.PHYSICAL_PROPERTIES.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {field.label} {field.unit && `(${field.unit})`}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    id={`field-${field.name}`}
                    disabled={isMeasurementsLocked}
                    type={field.type === "NUMERIC" ? "number" : field.type === "DATE" ? "date" : "text"}
                    step={field.type === "NUMERIC" ? "0.1" : undefined}
                    value={(measurements[field.name] as string) ?? ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-[#173f35] disabled:bg-slate-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Category B: Fibre Quality */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              B. Fibre Quality & Retting Assessment
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fieldsByCategory.FIBRE_QUALITY.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {field.label} {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    id={`field-${field.name}`}
                    disabled={isMeasurementsLocked}
                    type="text"
                    value={(measurements[field.name] as string) ?? ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-[#173f35] disabled:bg-slate-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Category C: Contamination & Storage */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              C. Contamination, Mould & Storage
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fieldsByCategory.CONTAMINATION_STORAGE.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {field.label} {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {field.type === "BOOLEAN" ? (
                    <select
                      id={`field-${field.name}`}
                      disabled={isMeasurementsLocked}
                      value={
                        measurements[field.name] === true || measurements[field.name] === "true"
                          ? "true"
                          : measurements[field.name] === false || measurements[field.name] === "false"
                            ? "false"
                            : ""
                      }
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value === "true")
                      }
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-[#173f35] disabled:bg-slate-50"
                    >
                      <option value="">-- Select --</option>
                      <option value="true">Yes (Observed)</option>
                      <option value="false">No (Not detected)</option>
                    </select>
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      disabled={isMeasurementsLocked}
                      type="text"
                      value={(measurements[field.name] as string) ?? ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-[#173f35] disabled:bg-slate-50"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Metadata: Geolocation & Notes */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Inspection Execution Details
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Latitude</label>
                <input
                  disabled={isMeasurementsLocked}
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 52.3676"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs outline-none focus:border-[#173f35] disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Longitude</label>
                <input
                  disabled={isMeasurementsLocked}
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 4.9041"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs outline-none focus:border-[#173f35] disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Equipment Used</label>
                <input
                  disabled={isMeasurementsLocked}
                  type="text"
                  value={equipmentUsed}
                  onChange={(e) => setEquipmentUsed(e.target.value)}
                  placeholder="e.g. Delmhorst F-2000 moisture probe"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs outline-none focus:border-[#173f35] disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Measurement Method</label>
                <input
                  disabled={isMeasurementsLocked}
                  type="text"
                  value={measurementMethod}
                  onChange={(e) => setMeasurementMethod(e.target.value)}
                  placeholder="e.g. Core probe sample (5 points)"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs outline-none focus:border-[#173f35] disabled:bg-slate-50"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700">Inspector Observations / Notes</label>
              <textarea
                disabled={isMeasurementsLocked}
                rows={2}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Additional neutral observations on lot, storage, or weather condition..."
                className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-1.5 text-xs outline-none focus:border-[#173f35] disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: EVIDENCE CAPTURE & ATTACHMENTS (BLOCK 02) */}
      <div className="rounded-xl border border-[#e2d9c8] bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#173f35]">
            Photo Evidence & Supporting Documents
          </h2>
          <p className="text-xs text-slate-500">
            Append-only photo evidence, supporting documents, and laboratory test reports.
          </p>
        </div>

        {/* Photo Instructions Box */}
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
          <p className="font-bold">Photo Instructions</p>
          <p className="mt-1">
            Provide clear, well-lit photos of whole bales, cross-sections showing fibre separation, and any observed defects or foreign matter.
          </p>
        </div>

        {/* Upload Evidence Form */}
        {!isMeasurementsLocked && (
          <form onSubmit={handleUploadEvidence} className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Upload Inspection Evidence
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Evidence Type</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-1.5 text-xs text-slate-900"
                >
                  <option value="PHOTO">Photo Evidence (JPG, PNG, WEBP)</option>
                  <option value="DOCUMENT">Supporting Document (PDF, Image)</option>
                  <option value="LAB_REPORT">Laboratory Report (PDF, Image)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">File</label>
                <input
                  type="file"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  className="mt-1 w-full text-xs text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-[#173f35] file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Caption / Notes (Optional)</label>
                <input
                  type="text"
                  value={evidenceCaption}
                  onChange={(e) => setEvidenceCaption(e.target.value)}
                  placeholder="e.g. Core sample, moisture probe reading"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!evidenceFile || uploadingEvidence}
                className="rounded-lg bg-[#173f35] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#204e42] disabled:opacity-50"
              >
                {uploadingEvidence ? "Uploading..." : "Upload Evidence"}
              </button>
            </div>
          </form>
        )}

        {/* Evidence List */}
        <div className="mt-4">
          {inspection.evidence.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              No evidence files attached yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inspection.evidence.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-lg border border-[#e2d9c8] bg-white p-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                        {EVIDENCE_TYPE_LABELS[item.evidenceType] || item.evidenceType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {(item.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    {item.evidenceType === "PHOTO" && (
                      <div className="relative mt-2 h-32 w-full overflow-hidden rounded bg-slate-100">
                        <img
                          src={getEvidenceFileUrl(inspectionId, item.id)}
                          alt={item.caption || item.originalFilename}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <p className="mt-2 truncate text-xs font-semibold text-slate-800">
                      {item.originalFilename}
                    </p>
                    {item.caption && (
                      <p className="mt-0.5 text-xs text-slate-600">{item.caption}</p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <a
                      href={getEvidenceFileUrl(inspectionId, item.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#173f35] hover:underline"
                    >
                      View / Download →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: PRELIMINARY HUMAN ASSESSMENT (BLOCK 02) */}
      <div className="rounded-xl border border-[#e2d9c8] bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#173f35]">
                Preliminary Human Quality Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Human-controlled preliminary assessment of lot quality prior to final grading.
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ASSESSMENT_STATUS_CONFIG[inspection.assessmentStatus].badgeClass}`}
            >
              {ASSESSMENT_STATUS_CONFIG[inspection.assessmentStatus].label}
            </span>
          </div>
        </div>

        {inspection.assessmentStatus === "ASSESSMENT_RECORDED" && (
          <div className="mt-4 space-y-3 rounded-lg border border-purple-200 bg-purple-50/50 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                Assessment Summary
              </p>
              <p className="mt-1 text-xs text-slate-900">{inspection.assessmentSummary}</p>
            </div>
            {inspection.observedIssues && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                  Observed Issues
                </p>
                <p className="mt-1 text-xs text-slate-900">{inspection.observedIssues}</p>
              </div>
            )}
            {inspection.recommendedFollowUp && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                  Recommended Follow-Up
                </p>
                <p className="mt-1 text-xs text-slate-900">{inspection.recommendedFollowUp}</p>
              </div>
            )}
            <div className="border-t border-purple-200 pt-2 text-[10px] text-purple-700">
              Recorded at: {inspection.assessedAt ? new Date(inspection.assessedAt).toLocaleString() : "Recently"}
            </div>
          </div>
        )}

        {!isAssessmentLocked && !isDraft && (
          <form onSubmit={handleSaveAssessment} className="mt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {inspection.assessmentStatus === "ASSESSMENT_RECORDED"
                ? "Update Preliminary Assessment"
                : "Record Preliminary Assessment"}
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Assessment Summary *
              </label>
              <textarea
                required
                rows={2}
                value={assessmentSummary}
                onChange={(e) => setAssessmentSummary(e.target.value)}
                placeholder="Summary of lot condition, fibre properties, and retting quality..."
                className="mt-1 w-full rounded-lg border border-[#d4cdbc] p-2 text-xs outline-none focus:border-[#173f35]"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Observed Issues (Optional)
                </label>
                <input
                  type="text"
                  value={observedIssues}
                  onChange={(e) => setObservedIssues(e.target.value)}
                  placeholder="e.g. Surface dust, slight moisture variation"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] p-2 text-xs outline-none focus:border-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Recommended Follow-Up (Optional)
                </label>
                <input
                  type="text"
                  value={recommendedFollowUp}
                  onChange={(e) => setRecommendedFollowUp(e.target.value)}
                  placeholder="e.g. Secondary moisture test before shipping"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] p-2 text-xs outline-none focus:border-[#173f35]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingAssessment || !assessmentSummary.trim()}
                className="rounded-lg bg-[#173f35] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#204e42] disabled:opacity-50"
              >
                {savingAssessment ? "Saving Assessment..." : "Save Preliminary Assessment"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 4: NON-CONFORMITIES (BLOCK 02) */}
      <div className="rounded-xl border border-[#e2d9c8] bg-white p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#173f35]">
                Non-Conformities & Quality Issues ({inspection.nonConformities.length})
              </h2>
              <p className="text-xs text-slate-500">
                Audited quality defects, foreign materials, or moisture non-conformities.
              </p>
            </div>
          </div>
        </div>

        {/* Non-Conformities List */}
        <div className="mt-4 space-y-3">
          {inspection.nonConformities.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-500">
              No quality non-conformities reported for this inspection.
            </p>
          ) : (
            inspection.nonConformities.map((nc) => (
              <div
                key={nc.id}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${NON_CONFORMITY_STATUS_CONFIG[nc.status].badgeClass}`}
                    >
                      {NON_CONFORMITY_STATUS_CONFIG[nc.status].label}
                    </span>
                    <span className="font-bold text-slate-800">{nc.category}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(nc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-2 text-slate-700">{nc.description}</p>

                {nc.status === "RESOLVED" && (
                  <div className="mt-2 rounded bg-emerald-50 p-2 text-emerald-800">
                    <p className="font-semibold text-[10px] uppercase">Resolution Notes:</p>
                    <p className="mt-0.5">{nc.resolutionNotes}</p>
                    <p className="mt-1 text-[10px] text-emerald-600">
                      Resolved: {nc.resolvedAt ? new Date(nc.resolvedAt).toLocaleDateString() : "Yes"}
                    </p>
                  </div>
                )}

                {nc.status === "OPEN" && !isNonConformitiesLocked && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => setResolvingNcId(nc.id)}
                      className="text-xs font-semibold text-[#173f35] hover:underline"
                    >
                      Mark as Resolved →
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Log New Non-Conformity Form */}
        {!isNonConformitiesLocked && !isDraft && (
          <form onSubmit={handleCreateNonConformity} className="mt-5 rounded-lg border border-red-100 bg-red-50/40 p-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">
              Log Non-Conformity
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={ncCategory}
                  onChange={(e) => setNcCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white p-2 text-xs text-slate-900"
                >
                  <option value="MOISTURE_EXCESS">Moisture Excess</option>
                  <option value="CONTAMINATION_OBSERVED">Foreign Material / Contamination</option>
                  <option value="BALE_INTEGRITY_COMPROMISED">Bale Structural Integrity</option>
                  <option value="MOULD_SUSPECTED">Mould / Fungus Observed</option>
                  <option value="PACKAGING_DEFECT">Twine / Packaging Defect</option>
                  <option value="OTHER">Other Technical Non-Conformity</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Description *</label>
                <input
                  required
                  type="text"
                  value={ncDescription}
                  onChange={(e) => setNcDescription(e.target.value)}
                  placeholder="Detailed description of defect, affected bales, severity..."
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white p-2 text-xs"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingNc || !ncDescription.trim()}
                className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-red-900 disabled:opacity-50"
              >
                {savingNc ? "Recording..." : "Log Non-Conformity"}
              </button>
            </div>
          </form>
        )}
      </div>


      {/* ======================================================== */}
      {/* 5. FINAL HUMAN QUALITY RESULT & CERTIFICATE (BLOCK 03) */}
      {/* ======================================================== */}
      <div className="rounded-xl border border-[#d4cdbc] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2dccd] pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#173f35]">
              Final Quality Result & Certificate
            </h3>
            <p className="text-xs text-slate-500">
              Human-controlled final quality decision based on completed measurements, evidence, and preliminary assessment.
            </p>
          </div>

          {inspection.qualityResult ? (
            <span
              className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${
                inspection.qualityResult.decision === "APPROVED"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-rose-100 text-rose-900 border-rose-300"
              }`}
            >
              FINAL DECISION: {inspection.qualityResult.decision}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              Decision Pending
            </span>
          )}
        </div>

        {/* Existing Final Result Display */}
        {inspection.qualityResult ? (
          <div className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#faf8f1] p-4 rounded-xl border border-[#e2dccd]">
              <div>
                <span className="text-slate-500 block text-[10px]">Classification Label</span>
                <span className="text-sm font-bold text-[#173f35]">
                  {inspection.qualityResult.classificationLabel}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Decided At</span>
                <span className="font-semibold text-slate-800">
                  {new Date(inspection.qualityResult.decidedAt).toLocaleString()}
                </span>
              </div>
              {inspection.qualityResult.decisionNotes && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-[10px]">Decision Notes</span>
                  <p className="mt-0.5 text-slate-700 bg-white p-2.5 rounded-lg border border-[#e2dccd]">
                    {inspection.qualityResult.decisionNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Certificate Display if APPROVED */}
            {inspection.qualityResult.decision === "APPROVED" && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider block">
                    Official Certificate of Quality Inspection
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-950">
                    {inspection.qualityResult.certificateNumber || "Certificate Issued"}
                  </span>
                </div>
                <a
                  href={getCertificateFileUrl(inspectionId)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#123129] transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Certificate PDF
                </a>
              </div>
            )}
          </div>
        ) : (
          /* Decision Input Form (Active Inspector Only, requires COMPLETED + ASSESSMENT_RECORDED) */
          <div className="mt-4 text-xs">
            {inspection.status !== "COMPLETED" ? (
              <p className="text-slate-500 bg-[#faf8f1] p-3 rounded-lg border border-[#e2dccd]">
                Final quality decision requires the inspection data to be completed (status: COMPLETED).
              </p>
            ) : inspection.assessmentStatus !== "ASSESSMENT_RECORDED" ? (
              <p className="text-slate-500 bg-[#faf8f1] p-3 rounded-lg border border-[#e2dccd]">
                A preliminary human assessment must be recorded before final quality decision can be submitted.
              </p>
            ) : !isTraderView ? (
              <div className="space-y-3 bg-[#faf8f1] p-4 rounded-xl border border-[#e2dccd]">
                {/* Non-Conformity Warning Context */}
                {inspection.nonConformities.some((nc) => nc.status === "OPEN") && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
                    <span className="font-bold block">Notice: Open Non-Conformities Present</span>
                    <span className="text-[11px]">
                      This lot has {inspection.nonConformities.filter((nc) => nc.status === "OPEN").length} open non-conformity item(s). Human inspector discretion applies.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Human Classification Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={classificationLabel}
                    onChange={(e) => setClassificationLabel(e.target.value)}
                    placeholder="e.g. Standard Commercial Retting, Technical Long Fibre..."
                    className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white p-2 text-xs outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Decision Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Enter notes explaining the commercial quality determination..."
                    className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white p-2 text-xs outline-none focus:border-[#173f35]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!classificationLabel.trim()) {
                        setError("Classification label is required before approving.");
                        return;
                      }
                      setDecisionAction("APPROVED");
                      setShowDecisionModal(true);
                    }}
                    className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-all"
                  >
                    ✓ Approve Quality Result
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!classificationLabel.trim()) {
                        setError("Classification label is required before rejecting.");
                        return;
                      }
                      setDecisionAction("REJECTED");
                      setShowDecisionModal(true);
                    }}
                    className="rounded-lg bg-rose-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-900 transition-all"
                  >
                    ✕ Reject Quality Result
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 bg-[#faf8f1] p-3 rounded-lg border border-[#e2dccd]">
                Final quality decision is reserved for the assigned Quality Inspector.
              </p>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Resolve Non-Conformity */}
      {resolvingNcId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#173f35]">
              Resolve Non-Conformity
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Record the corrective action or supplier remedy taken to resolve this issue.
            </p>

            <form onSubmit={handleResolveNonConformity} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Resolution Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe the resolution and corrective actions taken..."
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] p-2 text-xs outline-none focus:border-[#173f35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingNcId(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResolution || !resolutionNotes.trim()}
                  className="rounded-lg bg-emerald-800 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-50"
                >
                  {savingResolution ? "Resolving..." : "Confirm Resolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Request Physical Inspection */}
      {showPhysicalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#173f35]">
              Request Physical Inspection Escalation
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Escalate to independent on-site physical inspection.
            </p>

            <form onSubmit={handleRequestPhysical} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Reason for Escalation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={physicalReason}
                  onChange={(e) => setPhysicalReason(e.target.value)}
                  placeholder="Describe why an on-site physical inspection is required..."
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] p-2 text-xs outline-none focus:border-[#173f35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhysicalModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPhysical || !physicalReason.trim()}
                  className="rounded-lg bg-amber-800 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-900 disabled:opacity-50"
                >
                  {savingPhysical ? "Submitting..." : "Submit Escalation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Quality Decision Confirmation */}
      {showDecisionModal && decisionAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#173f35]">
              Confirm Quality Decision: {decisionAction}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {decisionAction === "APPROVED"
                ? "This will record an authoritative APPROVED quality result and generate an official immutable Certificate of Quality Inspection."
                : "This will record an authoritative REJECTED quality result. The trade record will reflect this outcome for downstream handling."}
            </p>

            <div className="my-4 space-y-2 rounded-lg bg-[#faf8f1] p-3 border border-[#e2dccd] text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Classification Label</span>
                <span className="font-bold text-[#173f35]">{classificationLabel}</span>
              </div>
              {decisionNotes && (
                <div>
                  <span className="text-slate-500 block text-[10px]">Notes</span>
                  <span className="text-slate-700">{decisionNotes}</span>
                </div>
              )}
              <div className="border-t border-[#e2dccd] pt-1 text-[11px] text-slate-500">
                • Human Inspector Authority · No AI automation · Decision is immutable once recorded
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDecisionModal(false);
                  setDecisionAction(null);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDecision}
                onClick={handleConfirmDecision}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors ${
                  decisionAction === "APPROVED"
                    ? "bg-emerald-800 hover:bg-emerald-900"
                    : "bg-rose-800 hover:bg-rose-900"
                } disabled:opacity-50`}
              >
                {submittingDecision ? "Recording..." : `Confirm ${decisionAction}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
