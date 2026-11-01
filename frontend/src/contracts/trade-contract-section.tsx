"use client";

import { useEffect, useState } from "react";
import type { TradeDetail } from "../trades/contracts";
import type { ContractDetail, ContractSummary, UpdateContractDraftInput } from "./contracts";
import {
  confirmContract,
  createContractForTrade,
  downloadContractDocument,
  getContractByTradeId,
  updateContractDraft,
  ContractsRequestError,
} from "./api";
import { TradeLogisticsSection } from "../logistics";

interface TradeContractSectionProps {
  trade: TradeDetail;
  onContractUpdated?: (contract: ContractSummary) => void;
  hideLogistics?: boolean;
}

export function TradeContractSection({
  trade,
  onContractUpdated,
  hideLogistics = false,
}: TradeContractSectionProps) {
  const [contract, setContract] = useState<ContractSummary | ContractDetail | null>(
    trade.contract ?? null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Draft form state initialized from existing contract terms (no fake defaults!)
  const [formData, setFormData] = useState({
    acceptedTolerance: contract?.acceptedTolerance ?? "",
    incoterm: contract?.incoterm ?? trade.incoterm ?? "",
    qualityConditions: contract?.qualityConditions ?? "",
    inspectionMethod: contract?.inspectionMethod ?? "",
    pickupDate: contract?.pickupDate ? contract.pickupDate.substring(0, 10) : "",
    deliveryDate: contract?.deliveryDate ? contract.deliveryDate.substring(0, 10) : "",
    paymentTerms: contract?.paymentTerms ?? trade.paymentTerms ?? "",
    claimsProcess: contract?.claimsProcess ?? "",
    requiredDocuments: contract?.requiredDocuments ?? "",
    cancellationConditions: contract?.cancellationConditions ?? "",
    governingLaw: contract?.governingLaw ?? "",
  });

  // Hydrate full contract details if initialized from partial trade overview
  useEffect(() => {
    let isMounted = true;
    if (trade.id && (trade.contract?.id || contract?.id)) {
      void getContractByTradeId(trade.id)
        .then((fullContract) => {
          if (isMounted && fullContract) {
            setContract(fullContract);
            onContractUpdated?.(fullContract);
            setFormData((prev) => ({
              ...prev,
              acceptedTolerance: fullContract.acceptedTolerance ?? prev.acceptedTolerance,
              incoterm: fullContract.incoterm ?? prev.incoterm,
              qualityConditions: fullContract.qualityConditions ?? prev.qualityConditions,
              inspectionMethod: fullContract.inspectionMethod ?? prev.inspectionMethod,
              pickupDate: fullContract.pickupDate ? fullContract.pickupDate.substring(0, 10) : prev.pickupDate,
              deliveryDate: fullContract.deliveryDate ? fullContract.deliveryDate.substring(0, 10) : prev.deliveryDate,
              paymentTerms: fullContract.paymentTerms ?? prev.paymentTerms,
              claimsProcess: fullContract.claimsProcess ?? prev.claimsProcess,
              requiredDocuments: fullContract.requiredDocuments ?? prev.requiredDocuments,
              cancellationConditions: fullContract.cancellationConditions ?? prev.cancellationConditions,
              governingLaw: fullContract.governingLaw ?? prev.governingLaw,
            }));
          }
        })
        .catch(() => {
          // Gracefully fallback to baseline trade data
        });
    }
    return () => {
      isMounted = false;
    };
  }, [trade.id, trade.contract?.id]);

  const handleCreateContract = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const newContract = await createContractForTrade(trade.id);
      setContract(newContract);
      setFormData({
        acceptedTolerance: newContract.acceptedTolerance ?? "",
        incoterm: newContract.incoterm ?? trade.incoterm ?? "",
        qualityConditions: newContract.qualityConditions ?? "",
        inspectionMethod: newContract.inspectionMethod ?? "",
        pickupDate: newContract.pickupDate ? newContract.pickupDate.substring(0, 10) : "",
        deliveryDate: newContract.deliveryDate ? newContract.deliveryDate.substring(0, 10) : "",
        paymentTerms: newContract.paymentTerms ?? trade.paymentTerms ?? "",
        claimsProcess: newContract.claimsProcess ?? "",
        requiredDocuments: newContract.requiredDocuments ?? "",
        cancellationConditions: newContract.cancellationConditions ?? "",
        governingLaw: newContract.governingLaw ?? "",
      });
      onContractUpdated?.(newContract);
      setSuccess("Contract draft initialized from accepted commercial baseline.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contract draft.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!contract) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const input: UpdateContractDraftInput = {
        acceptedTolerance: formData.acceptedTolerance.trim() || null,
        incoterm: formData.incoterm.trim() || null,
        qualityConditions: formData.qualityConditions.trim() || null,
        inspectionMethod: formData.inspectionMethod.trim() || null,
        pickupDate: formData.pickupDate ? new Date(formData.pickupDate).toISOString() : null,
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null,
        paymentTerms: formData.paymentTerms.trim() || null,
        claimsProcess: formData.claimsProcess.trim() || null,
        requiredDocuments: formData.requiredDocuments.trim() || null,
        cancellationConditions: formData.cancellationConditions.trim() || null,
        governingLaw: formData.governingLaw.trim() || null,
      };

      const updated = await updateContractDraft(contract.id, input);
      setContract(updated);
      onContractUpdated?.(updated);
      setSuccess("Contract draft saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contract draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmContract = async () => {
    if (!contract) return;
    setIsConfirming(true);
    setError(null);
    setSuccess(null);
    try {
      // First save any unsaved form fields before confirming
      const input: UpdateContractDraftInput = {
        acceptedTolerance: formData.acceptedTolerance.trim() || null,
        incoterm: formData.incoterm.trim() || null,
        qualityConditions: formData.qualityConditions.trim() || null,
        inspectionMethod: formData.inspectionMethod.trim() || null,
        pickupDate: formData.pickupDate ? new Date(formData.pickupDate).toISOString() : null,
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null,
        paymentTerms: formData.paymentTerms.trim() || null,
        claimsProcess: formData.claimsProcess.trim() || null,
        requiredDocuments: formData.requiredDocuments.trim() || null,
        cancellationConditions: formData.cancellationConditions.trim() || null,
        governingLaw: formData.governingLaw.trim() || null,
      };
      await updateContractDraft(contract.id, input);

      const confirmed = await confirmContract(contract.id);
      setContract(confirmed);
      onContractUpdated?.(confirmed);
      setSuccess("Contract confirmed and legal PDF generated.");
    } catch (err) {
      if (err instanceof ContractsRequestError && err.status === 400) {
        setError(`Cannot confirm contract: ${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : "Failed to confirm contract.");
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!contract) return;
    setIsDownloading(true);
    setError(null);
    try {
      const { blob, filename } = await downloadContractDocument(contract.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download contract PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e2dccd] bg-white p-4 space-y-4" data-testid="trade-contract-section">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#173f35]">
            Structured Commercial Contract
          </h4>
          <p className="text-[11px] text-[#52635c] mt-0.5">
            Bilateral legal agreement preserving the accepted trade baseline.
          </p>
        </div>
        {contract ? (
          <span
            data-testid="contract-status-badge"
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${
              contract.status === "CONFIRMED"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {contract.status === "CONFIRMED" ? "CONFIRMED" : "DRAFT"}
          </span>
        ) : (
          <span
            data-testid="contract-status-badge"
            className="inline-flex items-center rounded-md border border-[#e2dccd] bg-[#fbf9f4] px-2.5 py-0.5 text-[11px] font-semibold text-[#6e7d77]"
          >
            No Contract
          </span>
        )}
      </div>

      {/* FEEDBACK MESSAGES */}
      {error && (
        <div data-testid="contract-error-alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div data-testid="contract-success-alert" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          {success}
        </div>
      )}

      {/* CASE 1: NO CONTRACT */}
      {!contract && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#fcfaf5] p-3.5 rounded-lg border border-[#f0ece1] text-xs">
          <div>
            <p className="font-medium text-[#173f35]">No contract has been established for this trade.</p>
            <p className="text-[#52635c] text-[11px] mt-0.5">
              Initialize a structured contract record from the accepted quotation baseline.
            </p>
          </div>
          <button
            type="button"
            data-testid="create-contract-button"
            onClick={handleCreateContract}
            disabled={isCreating}
            className="self-start sm:self-auto shrink-0 rounded-lg bg-[#173f35] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#123129] shadow-sm transition-all disabled:opacity-50"
          >
            {isCreating ? "Creating Contract..." : "Create Contract"}
          </button>
        </div>
      )}

      {/* CASE 2 & 3: CONTRACT EXISTS (DRAFT OR CONFIRMED) */}
      {contract && (
        <div className="space-y-4 text-xs">
          {/* REFERENCE & METADATA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#fcfaf5] p-3 rounded-lg border border-[#f0ece1]">
            <div>
              <span className="text-[#6e7d77] block text-[10px]">Contract Reference</span>
              <span data-testid="contract-reference" className="font-mono font-bold text-[#173f35]">
                {contract.contractNumber}
              </span>
            </div>
            <div>
              <span className="text-[#6e7d77] block text-[10px]">Status &amp; Date</span>
              <span className="font-medium text-[#173f35]">
                {contract.status === "CONFIRMED" && contract.confirmedAt
                  ? `Confirmed ${new Date(contract.confirmedAt).toLocaleDateString()}`
                  : `Draft (${new Date(contract.createdAt).toLocaleDateString()})`}
              </span>
            </div>
            <div>
              <span className="text-[#6e7d77] block text-[10px]">Digital Signatures</span>
              <span className="font-medium text-[#52635c]">
                Buyer: <strong className="text-[#173f35]">{contract.buyerSignatureStatus}</strong> · Supplier: <strong className="text-[#173f35]">{contract.supplierSignatureStatus}</strong>
              </span>
            </div>
          </div>

          {/* IMMUTABLE ACCEPTED COMMERCIAL BASELINE */}
          <div className="rounded-lg border border-[#e2dccd] bg-[#fbf9f4] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#6e7d77]">
                Accepted Commercial Baseline (Immutable)
              </span>
              <span className="text-[10px] text-[#6e7d77]">Read-only from Trade</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[#6e7d77] block text-[10px]">Buyer</span>
                <span className="font-semibold text-[#173f35]">{contract.buyerOrganisationName || trade.buyerOrganisationName}</span>
              </div>
              <div>
                <span className="text-[#6e7d77] block text-[10px]">Supplier</span>
                <span className="font-semibold text-[#173f35]">{contract.supplierOrganisationName || trade.supplierOrganisationName}</span>
              </div>
              <div>
                <span className="text-[#6e7d77] block text-[10px]">Material &amp; Form</span>
                <span className="font-semibold text-[#173f35]">
                  {contract.materialType || trade.materialType} {(contract.productForm || trade.productForm) ? `(${contract.productForm || trade.productForm})` : ""}
                </span>
              </div>
              <div>
                <span className="text-[#6e7d77] block text-[10px]">Quantity &amp; Value</span>
                <span className="font-semibold text-[#173f35]">
                  {contract.quantity ?? trade.quantity} {contract.quantityUnit || trade.quantityUnit} · {(contract.acceptedCommercialAmount ?? trade.acceptedTotalAmount)?.toLocaleString()} {contract.currency || trade.currency}
                </span>
              </div>
            </div>
          </div>

          {/* DRAFT: EDITABLE SUPPLEMENTAL TERMS */}
          {contract.status === "DRAFT" ? (
            <div className="space-y-3 rounded-lg border border-[#e2dccd] bg-white p-3.5">
              <div className="flex items-center justify-between border-b border-[#f0ece1] pb-2">
                <span className="font-bold text-xs text-[#173f35]">
                  Trader Contract Terms &amp; Logistics Schedules
                </span>
                <span className="text-[10px] text-[#6e7d77]">
                  All fields required prior to confirmation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Accepted Tolerance *
                  </label>
                  <input
                    type="text"
                    data-testid="input-accepted-tolerance"
                    placeholder="e.g. +/- 5%"
                    value={formData.acceptedTolerance}
                    onChange={(e) => setFormData({ ...formData, acceptedTolerance: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Incoterm *
                  </label>
                  <input
                    type="text"
                    data-testid="input-incoterm"
                    placeholder="e.g. FCA, FOB, CIF"
                    value={formData.incoterm}
                    onChange={(e) => setFormData({ ...formData, incoterm: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Inspection Method *
                  </label>
                  <input
                    type="text"
                    data-testid="input-inspection-method"
                    placeholder="e.g. VISUAL_AND_MEASUREMENT"
                    value={formData.inspectionMethod}
                    onChange={(e) => setFormData({ ...formData, inspectionMethod: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Pickup Date *
                  </label>
                  <input
                    type="date"
                    data-testid="input-pickup-date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    data-testid="input-delivery-date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Payment Terms *
                  </label>
                  <input
                    type="text"
                    data-testid="input-payment-terms"
                    placeholder="e.g. 30 days net upon B/L"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Governing Law *
                  </label>
                  <input
                    type="text"
                    data-testid="input-governing-law"
                    placeholder="e.g. English law / ICC Arbitration"
                    value={formData.governingLaw}
                    onChange={(e) => setFormData({ ...formData, governingLaw: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Quality Conditions *
                  </label>
                  <textarea
                    rows={2}
                    data-testid="input-quality-conditions"
                    placeholder="Describe agreed technical specification, moisture limits, and quality thresholds"
                    value={formData.qualityConditions}
                    onChange={(e) => setFormData({ ...formData, qualityConditions: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Claims Process *
                  </label>
                  <textarea
                    rows={2}
                    data-testid="input-claims-process"
                    placeholder="Agreed window and evidence protocol for defect notice (e.g. 14 business days)"
                    value={formData.claimsProcess}
                    onChange={(e) => setFormData({ ...formData, claimsProcess: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Required Documents *
                  </label>
                  <textarea
                    rows={2}
                    data-testid="input-required-documents"
                    placeholder="Commercial invoice, packing list, bill of lading, phytosanitary certificate"
                    value={formData.requiredDocuments}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                    Cancellation Conditions *
                  </label>
                  <textarea
                    rows={2}
                    data-testid="input-cancellation-conditions"
                    placeholder="Force majeure, default terms, and material breach notice provisions"
                    value={formData.cancellationConditions}
                    onChange={(e) => setFormData({ ...formData, cancellationConditions: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-2.5 py-1.5 text-xs text-[#173f35] focus:outline-none focus:border-[#173f35]"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0ece1]">
                <button
                  type="button"
                  data-testid="save-contract-draft-button"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isConfirming}
                  className="rounded-lg border border-[#e2dccd] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  data-testid="confirm-contract-button"
                  onClick={handleConfirmContract}
                  disabled={isSaving || isConfirming}
                  className="rounded-lg bg-[#173f35] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#123129] shadow-sm transition-all disabled:opacity-50"
                >
                  {isConfirming ? "Confirming Contract..." : "Confirm Contract"}
                </button>
              </div>
            </div>
          ) : (
            /* CONFIRMED: IMMUTABLE TERMS & DOCUMENT ACTIONS */
            <div className="space-y-3 rounded-lg border border-[#e2dccd] bg-white p-3.5">
              <div className="flex items-center justify-between border-b border-[#f0ece1] pb-2">
                <span className="font-bold text-xs text-[#173f35]">
                  Confirmed Contract Terms &amp; Legal Snapshot
                </span>
                <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Immutable Record
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Incoterm</span>
                  <span className="font-semibold text-[#173f35]">{contract.incoterm || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Accepted Tolerance</span>
                  <span className="font-semibold text-[#173f35]">{contract.acceptedTolerance || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Inspection Method</span>
                  <span className="font-semibold text-[#173f35]">{contract.inspectionMethod || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Governing Law</span>
                  <span className="font-semibold text-[#173f35]">{contract.governingLaw || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Pickup Date</span>
                  <span className="font-semibold text-[#173f35]">
                    {contract.pickupDate ? new Date(contract.pickupDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Delivery Date</span>
                  <span className="font-semibold text-[#173f35]">
                    {contract.deliveryDate ? new Date(contract.deliveryDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Payment Terms</span>
                  <span className="font-semibold text-[#173f35]">{contract.paymentTerms || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Confirmed Date</span>
                  <span className="font-semibold text-[#173f35]">
                    {contract.confirmedAt ? new Date(contract.confirmedAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Quality Conditions</span>
                  <p className="text-[#173f35] bg-[#faf8f1] p-2 rounded border border-[#e2dccd]">
                    {contract.qualityConditions || "Standard specifications"}
                  </p>
                </div>
                <div>
                  <span className="text-[#6e7d77] block text-[10px]">Claims Process</span>
                  <p className="text-[#173f35] bg-[#faf8f1] p-2 rounded border border-[#e2dccd]">
                    {contract.claimsProcess || "Standard claims window"}
                  </p>
                </div>
              </div>

              {/* DOCUMENT ACTIONS */}
              <div className="flex items-center justify-between pt-3 border-t border-[#f0ece1]">
                <div className="flex items-center gap-1.5 text-xs text-[#52635c]">
                  <span className="font-semibold text-[#173f35]">Document Status:</span>
                  <span>{contract.hasDocument ? "PDF Ready" : "Document Pending"}</span>
                </div>

                <button
                  type="button"
                  data-testid="view-contract-pdf-button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading || !contract.hasDocument}
                  className="rounded-lg bg-[#173f35] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#123129] shadow-sm transition-all disabled:opacity-50"
                >
                  {isDownloading ? "Downloading PDF..." : "View / Download Contract PDF"}
                </button>
              </div>
            </div>
          )}

          {contract.status === "CONFIRMED" && !hideLogistics && (
            <TradeLogisticsSection contract={contract} />
          )}
        </div>
      )}
    </div>
  );
}
