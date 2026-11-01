"use client";

import { useEffect, useState } from "react";
import type { ContractDetail, ContractSummary } from "../contracts/contracts";
import type {
  ConfirmDeliveryInput,
  CreateShipmentInput,
  CustomsStatusInput,
  FreightQuotationSummary,
  LogisticsRequestSummary,
  MarkDisputedInput,
  MarkInTransitInput,
  MarkPickedUpInput,
  ReconcileCostsInput,
  RecordDiscrepancyInput,
  ReportDelayInput,
  ResolveDisputeInput,
  SchedulePickupInput,
  SettlementDetail,
  SettlementDocumentType,
  ShipmentDetail,
} from "./contracts";
import {
  closeShipment,
  confirmDelivery,
  createFreightRequests,
  createSettlement,
  createSettlementClaim,
  createShipmentForContract,
  fetchFreightQuotations,
  fetchFreightRequests,
  fetchSettlementByTradeId,
  fetchShipmentById,
  fetchShipments,
  getSettlementDocumentDownloadUrl,
  getShippingDocumentDownloadUrl,
  markDisputed,
  markInTransit,
  markPickedUp,
  reconcileCosts,
  recordDiscrepancy,
  reportDelay,
  resolveDispute,
  resolveSettlementClaim,
  schedulePickup,
  selectCarrier,
  setCustomsStatus,
  submitTraderManualQuotation,
  updateSettlement,
  updateShipmentRequirements,
  uploadSettlementDocument,
  uploadShippingDocument,
} from "./api";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}

interface TradeLogisticsSectionProps {
  contract: ContractSummary | ContractDetail;
}

export function TradeLogisticsSection({ contract }: TradeLogisticsSectionProps) {
  const isConfirmed = contract.status === "CONFIRMED";

  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [settlement, setSettlement] = useState<SettlementDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sub-resources
  const [requests, setRequests] = useState<LogisticsRequestSummary[]>([]);
  const [quotations, setQuotations] = useState<FreightQuotationSummary[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditRequirements, setShowEditRequirements] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showManualQuoteModal, setShowManualQuoteModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showPickedUpModal, setShowPickedUpModal] = useState(false);
  const [showInTransitModal, setShowInTransitModal] = useState(false);
  const [showCustomsModal, setShowCustomsModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showResolveDisputeModal, setShowResolveDisputeModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [showCreateSettlementModal, setShowCreateSettlementModal] = useState(false);
  const [showUpdateSettlementModal, setShowUpdateSettlementModal] = useState(false);
  const [showSettlementDocModal, setShowSettlementDocModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showResolveClaimModal, setShowResolveClaimModal] = useState<string | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState<CreateShipmentInput>({
    origin: "",
    destination: "",
    shipmentQuantity: contract.quantity ?? 1000,
    requestedPickupDate: "",
    requestedDeliveryDate: "",
    transportRequirements: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState<CreateShipmentInput>({
    origin: "",
    destination: "",
    shipmentQuantity: contract.quantity ?? 1000,
    requestedPickupDate: "",
    requestedDeliveryDate: "",
    transportRequirements: "",
    notes: "",
  });

  const [inviteProviderId, setInviteProviderId] = useState("");
  const [manualQuoteForm, setManualQuoteForm] = useState({
    logisticsRequestId: "",
    freightAmount: 0,
    currency: contract.currency || "EUR",
    validUntil: "",
    proposedPickupDate: "",
    estimatedDeliveryDate: "",
    notes: "",
  });

  const [pickupForm, setPickupForm] = useState<SchedulePickupInput>({
    scheduledPickupAt: "",
    notes: "",
  });

  const [pickedUpForm, setPickedUpForm] = useState<MarkPickedUpInput>({
    actualPickupAt: "",
    location: "",
    notes: "",
  });

  const [inTransitForm, setInTransitForm] = useState<MarkInTransitInput>({
    location: "",
    notes: "",
  });

  const [customsForm, setCustomsForm] = useState<CustomsStatusInput>({
    location: "",
    notes: "",
  });

  const [delayForm, setDelayForm] = useState<ReportDelayInput>({
    delayReason: "",
    revisedExpectedDeliveryDate: "",
    notes: "",
  });

  const [deliveryForm, setDeliveryForm] = useState<ConfirmDeliveryInput>({
    deliveredAt: "",
    deliveredLocation: "",
    deliveryNotes: "",
  });

  const [discrepancyForm, setDiscrepancyForm] = useState<RecordDiscrepancyInput>({
    type: "DAMAGE",
    description: "",
    expectedQuantity: 0,
    deliveredQuantity: 0,
    quantityUnit: "KG",
  });

  const [disputeForm, setDisputeForm] = useState<MarkDisputedInput>({
    disputeReason: "",
    notes: "",
  });

  const [resolveDisputeForm, setResolveDisputeForm] = useState<ResolveDisputeInput>({
    disputeResolutionNotes: "",
  });

  const [reconcileForm, setReconcileForm] = useState<ReconcileCostsInput>({
    finalAmount: 0,
    finalCurrency: "EUR",
    notes: "",
  });

  const [closeForm, setCloseForm] = useState<{ notes: string }>({ notes: "" });

  const [docFile, setDocFile] = useState<File | null>(null);
  const [docLabel, setDocLabel] = useState("");
  const [docRef, setDocRef] = useState("");

  const [settlementDocFile, setSettlementDocFile] = useState<File | null>(null);
  const [settlementDocType, setSettlementDocType] = useState<SettlementDocumentType>("INVOICE");
  const [settlementDocRef, setSettlementDocRef] = useState("");

  const [settlementForm, setSettlementForm] = useState({
    depositAmount: 0,
    commissionAmount: 0,
    finalSettlementAmount: contract.acceptedCommercialAmount || 0,
    paymentDueDate: "",
    paymentInstructions: "",
    notes: "",
  });

  const [claimForm, setClaimForm] = useState({
    description: "",
    amount: 0,
    discrepancyId: "",
  });

  const [resolveClaimNotes, setResolveClaimNotes] = useState("");

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load shipment and settlement
  const loadData = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Shipment
      const allShipments = await fetchShipments();
      const matching = allShipments.items.find((s) => s.contractId === contract.id);
      if (matching) {
        const detail = await fetchShipmentById(matching.id);
        setShipment(detail);
        setEditForm({
          origin: detail.origin ?? "",
          destination: detail.destination ?? "",
          shipmentQuantity: detail.shipmentQuantity ?? contract.quantity,
          requestedPickupDate: detail.requestedPickupDate ? detail.requestedPickupDate.substring(0, 10) : "",
          requestedDeliveryDate: detail.requestedDeliveryDate ? detail.requestedDeliveryDate.substring(0, 10) : "",
          transportRequirements: detail.transportRequirements ?? "",
          notes: detail.notes ?? "",
        });
        setDiscrepancyForm((prev) => ({ ...prev, quantityUnit: detail.quantityUnit }));
        setReconcileForm({
          finalAmount: detail.carrierTotalCost ?? 0,
          finalCurrency: detail.carrierCurrency ?? detail.contractCurrency,
          notes: "",
        });

        const [reqList, quoteList] = await Promise.all([
          fetchFreightRequests(detail.id).catch(() => []),
          fetchFreightQuotations(detail.id).catch(() => []),
        ]);
        setRequests(reqList);
        setQuotations(quoteList);
      } else {
        setShipment(null);
      }

      // 2. Settlement
      if (contract.tradeId) {
        const stl = await fetchSettlementByTradeId(contract.tradeId).catch(() => null);
        setSettlement(stl);
        if (stl) {
          setSettlementForm({
            depositAmount: stl.depositAmount,
            commissionAmount: stl.commissionAmount,
            finalSettlementAmount: stl.finalSettlementAmount,
            paymentDueDate: stl.paymentDueDate ? stl.paymentDueDate.substring(0, 10) : "",
            paymentInstructions: stl.paymentInstructions ?? "",
            notes: stl.notes ?? "",
          });
        }
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load logistics & settlement data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contract.id, contract.tradeId, isConfirmed]);

  // Action handlers
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createShipmentForContract(contract.id, {
        origin: createForm.origin?.trim() || null,
        destination: createForm.destination?.trim() || null,
        shipmentQuantity: Number(createForm.shipmentQuantity),
        requestedPickupDate: createForm.requestedPickupDate ? new Date(createForm.requestedPickupDate).toISOString() : null,
        requestedDeliveryDate: createForm.requestedDeliveryDate ? new Date(createForm.requestedDeliveryDate).toISOString() : null,
        transportRequirements: createForm.transportRequirements?.trim() || null,
        notes: createForm.notes?.trim() || null,
      });
      setShowCreateModal(false);
      setSuccess(`Shipment ${created.shipmentNumber} initialized in PLANNING status.`);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create shipment"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRequirements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await updateShipmentRequirements(shipment.id, {
        origin: editForm.origin?.trim() || null,
        destination: editForm.destination?.trim() || null,
        shipmentQuantity: Number(editForm.shipmentQuantity),
        requestedPickupDate: editForm.requestedPickupDate ? new Date(editForm.requestedPickupDate).toISOString() : null,
        requestedDeliveryDate: editForm.requestedDeliveryDate ? new Date(editForm.requestedDeliveryDate).toISOString() : null,
        transportRequirements: editForm.transportRequirements?.trim() || null,
        notes: editForm.notes?.trim() || null,
      });
      setShowEditRequirements(false);
      setSuccess("Shipment requirements updated successfully.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update requirements"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !inviteProviderId.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createFreightRequests(shipment.id, {
        targetProviderUserIds: [inviteProviderId.trim()],
      });
      setShowInviteModal(false);
      setInviteProviderId("");
      setSuccess("Logistics partner invited.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to invite provider"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !manualQuoteForm.logisticsRequestId) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await submitTraderManualQuotation(
        shipment.id,
        manualQuoteForm.logisticsRequestId,
        {
          freightAmount: Number(manualQuoteForm.freightAmount),
          currency: manualQuoteForm.currency,
          validUntil: manualQuoteForm.validUntil ? new Date(manualQuoteForm.validUntil).toISOString() : null,
          proposedPickupDate: manualQuoteForm.proposedPickupDate ? new Date(manualQuoteForm.proposedPickupDate).toISOString() : null,
          estimatedDeliveryDate: manualQuoteForm.estimatedDeliveryDate ? new Date(manualQuoteForm.estimatedDeliveryDate).toISOString() : null,
          notes: manualQuoteForm.notes?.trim() || null,
        },
      );
      setShowManualQuoteModal(false);
      setSuccess("Manual quotation recorded.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to submit quotation"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCarrier = async (quotationId: string) => {
    if (!shipment) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await selectCarrier(shipment.id, quotationId);
      setSuccess("Carrier selected. Status moved to CARRIER_SELECTED.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to select carrier"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedulePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !pickupForm.scheduledPickupAt) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await schedulePickup(shipment.id, {
        scheduledPickupAt: new Date(pickupForm.scheduledPickupAt).toISOString(),
        notes: pickupForm.notes?.trim() || null,
      });
      setShowPickupModal(false);
      setSuccess("Pickup scheduled. Status moved to PICKUP_SCHEDULED.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to schedule pickup"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkPickedUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await markPickedUp(shipment.id, {
        actualPickupAt: pickedUpForm.actualPickupAt ? new Date(pickedUpForm.actualPickupAt).toISOString() : new Date().toISOString(),
        location: pickedUpForm.location?.trim() || null,
        notes: pickedUpForm.notes?.trim() || null,
      });
      setShowPickedUpModal(false);
      setSuccess("Shipment marked as PICKED_UP.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to mark picked up"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkInTransit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await markInTransit(shipment.id, {
        location: inTransitForm.location?.trim() || null,
        notes: inTransitForm.notes?.trim() || null,
      });
      setShowInTransitModal(false);
      setSuccess("Shipment is now IN_TRANSIT.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to mark in transit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomsStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await setCustomsStatus(shipment.id, {
        location: customsForm.location?.trim() || null,
        notes: customsForm.notes?.trim() || null,
      });
      setShowCustomsModal(false);
      setSuccess("Shipment marked in CUSTOMS clearance.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update customs status"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !delayForm.delayReason.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await reportDelay(shipment.id, {
        delayReason: delayForm.delayReason.trim(),
        revisedExpectedDeliveryDate: delayForm.revisedExpectedDeliveryDate ? new Date(delayForm.revisedExpectedDeliveryDate).toISOString() : null,
        notes: delayForm.notes?.trim() || null,
      });
      setShowDelayModal(false);
      setSuccess("Delay reported. Status changed to DELAYED.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to report delay"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await confirmDelivery(shipment.id, {
        deliveredAt: deliveryForm.deliveredAt ? new Date(deliveryForm.deliveredAt).toISOString() : new Date().toISOString(),
        deliveredLocation: deliveryForm.deliveredLocation?.trim() || null,
        deliveryNotes: deliveryForm.deliveryNotes?.trim() || null,
      });
      setShowDeliveryModal(false);
      setSuccess("Delivery confirmed! Status moved to DELIVERED.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to confirm delivery"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordDiscrepancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !discrepancyForm.description.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await recordDiscrepancy(shipment.id, {
        type: discrepancyForm.type,
        description: discrepancyForm.description.trim(),
        expectedQuantity: discrepancyForm.type === "QUANTITY_DIFFERENCE" ? Number(discrepancyForm.expectedQuantity) : null,
        deliveredQuantity: discrepancyForm.type === "QUANTITY_DIFFERENCE" ? Number(discrepancyForm.deliveredQuantity) : null,
        quantityUnit: discrepancyForm.type === "QUANTITY_DIFFERENCE" ? shipment.quantityUnit : null,
      });
      setShowDiscrepancyModal(false);
      setSuccess("Operational discrepancy recorded.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to record discrepancy"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDisputed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !disputeForm.disputeReason.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await markDisputed(shipment.id, {
        disputeReason: disputeForm.disputeReason.trim(),
        notes: disputeForm.notes?.trim() || null,
      });
      setShowDisputeModal(false);
      setSuccess("Shipment marked as DISPUTED.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to mark disputed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !resolveDisputeForm.disputeResolutionNotes.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await resolveDispute(shipment.id, {
        disputeResolutionNotes: resolveDisputeForm.disputeResolutionNotes.trim(),
      });
      setShowResolveDisputeModal(false);
      setSuccess("Dispute resolved. Status returned to DELIVERED.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to resolve dispute"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReconcileCosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await reconcileCosts(shipment.id, {
        finalAmount: Number(reconcileForm.finalAmount),
        finalCurrency: reconcileForm.finalCurrency,
        notes: reconcileForm.notes?.trim() || null,
      });
      setShowReconcileModal(false);
      setSuccess("Final logistics costs reconciled.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to reconcile costs"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await closeShipment(shipment.id, {
        notes: closeForm.notes?.trim() || null,
      });
      setShowCloseModal(false);
      setSuccess("Shipment closed successfully.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to close shipment"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadShippingDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !docFile || !docLabel.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await uploadShippingDocument(shipment.id, docFile, docLabel.trim(), docRef.trim() || undefined);
      setShowDocUploadModal(false);
      setDocFile(null);
      setDocLabel("");
      setDocRef("");
      setSuccess("Shipping document uploaded.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to upload document"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Settlement handlers
  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract.tradeId) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createSettlement(contract.tradeId, {
        shipmentId: shipment?.id ?? null,
        depositAmount: Number(settlementForm.depositAmount),
        commissionAmount: Number(settlementForm.commissionAmount),
        finalSettlementAmount: Number(settlementForm.finalSettlementAmount),
        paymentDueDate: settlementForm.paymentDueDate ? new Date(settlementForm.paymentDueDate).toISOString() : null,
        paymentInstructions: settlementForm.paymentInstructions?.trim() || null,
        notes: settlementForm.notes?.trim() || null,
      });
      setShowCreateSettlementModal(false);
      setSuccess("Administrative settlement tracking record created.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create settlement"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlement) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await updateSettlement(settlement.id, {
        depositAmount: Number(settlementForm.depositAmount),
        commissionAmount: Number(settlementForm.commissionAmount),
        finalSettlementAmount: Number(settlementForm.finalSettlementAmount),
        paymentDueDate: settlementForm.paymentDueDate ? new Date(settlementForm.paymentDueDate).toISOString() : null,
        paymentInstructions: settlementForm.paymentInstructions?.trim() || null,
        notes: settlementForm.notes?.trim() || null,
      });
      setShowUpdateSettlementModal(false);
      setSuccess("Settlement tracking record updated.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update settlement"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSettlementDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlement || !settlementDocFile) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await uploadSettlementDocument(
        settlement.id,
        settlementDocFile,
        settlementDocType,
        settlementDocRef.trim() || undefined,
      );
      setShowSettlementDocModal(false);
      setSettlementDocFile(null);
      setSettlementDocRef("");
      setSuccess("Settlement document uploaded.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to upload settlement document"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlement || !claimForm.description.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createSettlementClaim(settlement.id, {
        description: claimForm.description.trim(),
        amount: claimForm.amount ? Number(claimForm.amount) : null,
        discrepancyId: claimForm.discrepancyId.trim() || null,
      });
      setShowClaimModal(false);
      setClaimForm({ description: "", amount: 0, discrepancyId: "" });
      setSuccess("Settlement claim recorded.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create claim"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveClaim = async (claimId: string) => {
    if (!settlement || !resolveClaimNotes.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await resolveSettlementClaim(settlement.id, claimId, {
        resolutionNotes: resolveClaimNotes.trim(),
      });
      setShowResolveClaimModal(null);
      setResolveClaimNotes("");
      setSuccess("Settlement claim resolved.");
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to resolve claim"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper status color styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNING":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#e8e4dc] text-[#59554a]">PLANNING</span>;
      case "QUOTE_REQUESTED":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#fef3c7] text-[#92400e]">QUOTE REQUESTED</span>;
      case "CARRIER_SELECTED":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#e0f2fe] text-[#0369a1]">CARRIER SELECTED</span>;
      case "PICKUP_SCHEDULED":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#e0e7ff] text-[#3730a3]">PICKUP SCHEDULED</span>;
      case "PICKED_UP":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#ede9fe] text-[#5b21b6]">PICKED UP</span>;
      case "IN_TRANSIT":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#ccfbf1] text-[#115e59]">IN TRANSIT</span>;
      case "CUSTOMS":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#fae8ff] text-[#86198f]">CUSTOMS</span>;
      case "DELAYED":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#ffedd5] text-[#9a3412]">DELAYED</span>;
      case "DELIVERED":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#dcfce7] text-[#166534]">DELIVERED</span>;
      case "DISPUTED":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#fee2e2] text-[#991b1b]">DISPUTED</span>;
      case "CLOSED":
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-[#e5e7eb] text-[#374151]">CLOSED</span>;
      default:
        return <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Passive notice for non-confirmed contracts
  if (!isConfirmed) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-[#dcd7cb] bg-[#faf8f4] p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#6e7d77]">
          <span>Logistics &amp; Shipments</span>
        </div>
        <p className="mt-1 text-xs text-[#8a9992]">
          Contract is in <span className="font-bold text-[#b5821b]">{contract.status}</span> status. Logistics requirements, quote requests, and execution require a CONFIRMED contract.
        </p>
      </div>
    );
  }

  const isExecutionStage =
    shipment &&
    ["CARRIER_SELECTED", "PICKUP_SCHEDULED", "PICKED_UP", "IN_TRANSIT", "CUSTOMS", "DELAYED", "DELIVERED", "DISPUTED", "CLOSED"].includes(
      shipment.status,
    );

  const isClosed = shipment?.status === "CLOSED";

  return (
    <div className="mt-4 rounded-xl border border-[#e2dccd] bg-[#fdfcf9] p-4 shadow-sm" data-testid="trade-logistics-section">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece7dc] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#173f35] text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#173f35]">Logistics &amp; Shipment Operations</h3>
              {shipment && getStatusBadge(shipment.status)}
            </div>
            <p className="text-[11px] text-[#6e7d77]">
              {shipment ? `Shipment #${shipment.shipmentNumber}` : "No shipment initialized for this confirmed contract."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="rounded-lg border border-[#dcd7cb] bg-white px-2.5 py-1 text-xs font-semibold text-[#52635c] hover:bg-[#f6f4ee] disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          {!shipment && (
            <button
              type="button"
              data-testid="create-shipment-btn"
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
            >
              + Create Shipment
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800" role="status">
          {success}
        </div>
      )}

      {/* TAB NAVIGATION */}
      {shipment && (
        <div className="mt-3 flex flex-wrap gap-1 border-b border-[#ece7dc] pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === "overview" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
            }`}
          >
            1. Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === "timeline" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
            }`}
          >
            2. Tracking Timeline ({shipment.trackingEvents?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === "documents" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
            }`}
          >
            3. Shipping Documents ({shipment.documents?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("delivery")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === "delivery" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
            }`}
          >
            4. Delivery &amp; Discrepancies ({shipment.discrepancies?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reconciliation")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === "reconciliation" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
            }`}
          >
            5. Cost Reconciliation {shipment.costReconciliation ? "✓" : ""}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settlement")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === "settlement" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
            }`}
          >
            6. Administrative Settlement
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("commercial")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              activeTab === "commercial" ? "bg-[#173f35] text-white" : "text-[#52635c] hover:bg-[#ece7dc]"
            }`}
          >
            Commercial Baseline &amp; Quotes
          </button>
        </div>
      )}

      {/* CONTENT PANELS */}
      {shipment && (
        <div className="mt-4">
          {/* 1. OVERVIEW & OPERATIONAL CONTROLS */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* OPERATIONAL ACTION BAR */}
              {!isClosed && isExecutionStage && (
                <div className="rounded-xl border border-[#dcd7cb] bg-[#faf8f4] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#173f35]">Available Operational Actions</div>
                      <div className="text-[11px] text-[#6e7d77]">
                        State-driven operational steps for <span className="font-semibold">{shipment.status}</span>.
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {shipment.status === "CARRIER_SELECTED" && (
                        <button
                          type="button"
                          data-testid="schedule-pickup-btn"
                          onClick={() => setShowPickupModal(true)}
                          className="rounded-lg bg-[#0369a1] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0284c7]"
                        >
                          Schedule Pickup
                        </button>
                      )}

                      {shipment.status === "PICKUP_SCHEDULED" && (
                        <>
                          <button
                            type="button"
                            data-testid="mark-picked-up-btn"
                            onClick={() => setShowPickedUpModal(true)}
                            className="rounded-lg bg-[#5b21b6] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#6d28d9]"
                          >
                            Mark Picked Up
                          </button>
                          <button
                            type="button"
                            data-testid="report-delay-btn"
                            onClick={() => setShowDelayModal(true)}
                            className="rounded-lg border border-[#ea580c] bg-white px-3 py-1.5 text-xs font-bold text-[#ea580c] hover:bg-orange-50"
                          >
                            Report Delay
                          </button>
                        </>
                      )}

                      {shipment.status === "PICKED_UP" && (
                        <>
                          <button
                            type="button"
                            data-testid="mark-in-transit-btn"
                            onClick={() => setShowInTransitModal(true)}
                            className="rounded-lg bg-[#115e59] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0d9488]"
                          >
                            Mark In Transit
                          </button>
                          <button
                            type="button"
                            data-testid="report-delay-btn"
                            onClick={() => setShowDelayModal(true)}
                            className="rounded-lg border border-[#ea580c] bg-white px-3 py-1.5 text-xs font-bold text-[#ea580c] hover:bg-orange-50"
                          >
                            Report Delay
                          </button>
                        </>
                      )}

                      {shipment.status === "IN_TRANSIT" && (
                        <>
                          <button
                            type="button"
                            data-testid="set-customs-btn"
                            onClick={() => setShowCustomsModal(true)}
                            className="rounded-lg bg-[#86198f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#a21caf]"
                          >
                            Customs Status
                          </button>
                          <button
                            type="button"
                            data-testid="confirm-delivery-btn"
                            onClick={() => setShowDeliveryModal(true)}
                            className="rounded-lg bg-[#166534] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#15803d]"
                          >
                            Confirm Delivery
                          </button>
                          <button
                            type="button"
                            data-testid="report-delay-btn"
                            onClick={() => setShowDelayModal(true)}
                            className="rounded-lg border border-[#ea580c] bg-white px-3 py-1.5 text-xs font-bold text-[#ea580c] hover:bg-orange-50"
                          >
                            Report Delay
                          </button>
                        </>
                      )}

                      {shipment.status === "CUSTOMS" && (
                        <>
                          <button
                            type="button"
                            data-testid="confirm-delivery-btn"
                            onClick={() => setShowDeliveryModal(true)}
                            className="rounded-lg bg-[#166534] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#15803d]"
                          >
                            Confirm Delivery
                          </button>
                          <button
                            type="button"
                            data-testid="report-delay-btn"
                            onClick={() => setShowDelayModal(true)}
                            className="rounded-lg border border-[#ea580c] bg-white px-3 py-1.5 text-xs font-bold text-[#ea580c] hover:bg-orange-50"
                          >
                            Report Delay
                          </button>
                        </>
                      )}

                      {shipment.status === "DELAYED" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowInTransitModal(true)}
                            className="rounded-lg bg-[#115e59] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0d9488]"
                          >
                            Resume In Transit
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeliveryModal(true)}
                            className="rounded-lg bg-[#166534] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#15803d]"
                          >
                            Confirm Delivery
                          </button>
                        </>
                      )}

                      {shipment.status === "DELIVERED" && (
                        <>
                          <button
                            type="button"
                            data-testid="record-discrepancy-btn"
                            onClick={() => setShowDiscrepancyModal(true)}
                            className="rounded-lg border border-[#b91c1c] bg-white px-3 py-1.5 text-xs font-bold text-[#b91c1c] hover:bg-red-50"
                          >
                            Record Discrepancy
                          </button>
                          <button
                            type="button"
                            data-testid="reconcile-costs-btn"
                            onClick={() => setShowReconcileModal(true)}
                            className="rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#123129]"
                          >
                            Reconcile Costs
                          </button>
                          {shipment.costReconciliation && (
                            <button
                              type="button"
                              data-testid="close-shipment-btn"
                              onClick={() => setShowCloseModal(true)}
                              className="rounded-lg bg-[#374151] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1f2937]"
                            >
                              Close Shipment
                            </button>
                          )}
                        </>
                      )}

                      {shipment.status === "DISPUTED" && (
                        <button
                          type="button"
                          data-testid="resolve-dispute-btn"
                          onClick={() => setShowResolveDisputeModal(true)}
                          className="rounded-lg bg-[#166534] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#15803d]"
                        >
                          Resolve Dispute
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* READ-ONLY CLOSED NOTICE */}
              {isClosed && (
                <div className="rounded-xl border border-gray-300 bg-gray-50 p-3 text-center text-xs text-gray-700">
                  <span className="font-bold">Shipment Closed:</span> Completed operational cycle. History is immutable and read-only.
                </div>
              )}

              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                  <div className="text-[11px] font-semibold text-[#8a9992] uppercase tracking-wider">Logistics Route</div>
                  <div className="mt-1 text-xs text-[#2c3e38]">
                    <div><span className="font-semibold">Origin:</span> {shipment.origin || "Not specified"}</div>
                    <div><span className="font-semibold">Destination:</span> {shipment.destination || "Not specified"}</div>
                    <div><span className="font-semibold">Quantity:</span> {shipment.shipmentQuantity} {shipment.quantityUnit}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                  <div className="text-[11px] font-semibold text-[#8a9992] uppercase tracking-wider">Operational Timestamps</div>
                  <div className="mt-1 text-xs text-[#2c3e38]">
                    <div><span className="font-semibold">Scheduled Pickup:</span> {shipment.scheduledPickupAt ? new Date(shipment.scheduledPickupAt).toLocaleString() : "Pending"}</div>
                    <div><span className="font-semibold">Actual Pickup:</span> {shipment.actualPickupAt ? new Date(shipment.actualPickupAt).toLocaleString() : "Pending"}</div>
                    <div><span className="font-semibold">Delivered:</span> {shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleString() : "Pending"}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                  <div className="text-[11px] font-semibold text-[#8a9992] uppercase tracking-wider">Carrier &amp; Cost Baseline</div>
                  <div className="mt-1 text-xs text-[#2c3e38]">
                    <div><span className="font-semibold">Carrier:</span> {shipment.selectedCarrierName || (quotations.find((q) => q.isSelected || q.id === shipment.selectedFreightQuotationId)?.providerEmail) || "None selected"}</div>
                    <div><span className="font-semibold">Quoted Freight:</span> {shipment.carrierTotalCost != null ? `${shipment.carrierTotalCost} ${shipment.carrierCurrency}` : (() => {
                      const selQ = quotations.find((q) => q.isSelected || q.id === shipment.selectedFreightQuotationId);
                      return selQ ? `${selQ.freightAmount} ${selQ.currency}` : "Pending";
                    })()}</div>
                    <div><span className="font-semibold">Reconciled Final:</span> {shipment.costReconciliation ? `${shipment.costReconciliation.finalAmount} ${shipment.costReconciliation.finalCurrency}` : "Pending"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TRACKING TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Immutable Operational Tracking Events</h4>
                <span className="text-[11px] text-[#6e7d77]">{shipment.trackingEvents?.length ?? 0} recorded events</span>
              </div>

              {(!shipment.trackingEvents || shipment.trackingEvents.length === 0) ? (
                <div className="rounded-xl border border-dashed border-[#dcd7cb] p-6 text-center text-xs text-[#8a9992]">
                  No tracking events recorded yet. Events are appended automatically on each status transition.
                </div>
              ) : (
                <div className="space-y-2 border-l-2 border-[#173f35] pl-4">
                  {shipment.trackingEvents.map((evt) => (
                    <div key={evt.id} className="relative rounded-lg border border-[#ece7dc] bg-white p-2.5 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#173f35]">
                            {evt.previousStatus} → {evt.resultingStatus}
                          </span>
                          <span className="text-[10px] rounded bg-[#e8e4dc] px-1.5 py-0.5 text-[#59554a] font-semibold">
                            {evt.actorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8a9992]">{new Date(evt.occurredAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-[#52635c]">
                        Actor: {evt.actorUserEmail || evt.actorUserId}
                        {evt.location && <span className="ml-2">📍 {evt.location}</span>}
                        {evt.notes && <span className="ml-2 italic text-[#6e7d77]">&ldquo;{evt.notes}&rdquo;</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. SHIPPING DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Shipping Documents</h4>
                  <p className="text-[11px] text-[#6e7d77]">Bill of lading, CMR, packing lists, delivery receipts.</p>
                </div>
                {!isClosed && (
                  <button
                    type="button"
                    data-testid="upload-shipping-doc-btn"
                    onClick={() => setShowDocUploadModal(true)}
                    className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                  >
                    + Upload Document
                  </button>
                )}
              </div>

              {contract.requiredDocuments && (
                <div className="rounded-lg border border-[#e2dccd] bg-[#f8f6f0] p-2.5 text-xs text-[#52635c]">
                  <span className="font-semibold text-[#173f35]">Contract Reference Documents:</span> {contract.requiredDocuments}
                </div>
              )}

              {(!shipment.documents || shipment.documents.length === 0) ? (
                <div className="rounded-xl border border-dashed border-[#dcd7cb] p-6 text-center text-xs text-[#8a9992]">
                  No shipping documents uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {shipment.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-[#ece7dc] bg-white p-2.5">
                      <div>
                        <div className="text-xs font-bold text-[#173f35]">{doc.label}</div>
                        <div className="text-[11px] text-[#6e7d77]">
                          {doc.originalFilename} • {(doc.sizeBytes / 1024).toFixed(1)} KB
                          {doc.documentReference && ` • Ref: ${doc.documentReference}`}
                        </div>
                        <div className="text-[10px] text-[#8a9992]">{new Date(doc.uploadedAt).toLocaleString()} by {doc.uploadedByUserEmail}</div>
                      </div>
                      <a
                        href={getShippingDocumentDownloadUrl(shipment.id, doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[#dcd7cb] bg-[#faf8f4] px-2.5 py-1 text-xs font-semibold text-[#173f35] hover:bg-[#ece7dc]"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. DELIVERY & DISCREPANCIES */}
          {activeTab === "delivery" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Delivery card */}
                <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                  <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Delivery Confirmation Details</h4>
                  <div className="mt-2 text-xs text-[#2c3e38] space-y-1">
                    <div><span className="font-semibold">Confirmed At:</span> {shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleString() : "Not delivered"}</div>
                    <div><span className="font-semibold">Location:</span> {shipment.deliveredLocation || "N/A"}</div>
                    <div><span className="font-semibold">Notes:</span> {shipment.deliveryNotes || "None"}</div>
                  </div>
                </div>

                {/* Dispute card */}
                <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Dispute Follow-Up</h4>
                    {shipment.discrepancies?.length > 0 && !isClosed && shipment.status !== "DISPUTED" && (
                      <button
                        type="button"
                        data-testid="mark-disputed-btn"
                        onClick={() => setShowDisputeModal(true)}
                        className="rounded bg-[#b91c1c] px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-800"
                      >
                        Mark Disputed
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-[#2c3e38] space-y-1">
                    <div><span className="font-semibold">Status:</span> {shipment.status === "DISPUTED" ? "ACTIVE DISPUTE" : "None"}</div>
                    {shipment.disputeReason && <div><span className="font-semibold">Reason:</span> {shipment.disputeReason}</div>}
                    {shipment.disputeResolvedAt && (
                      <div className="text-emerald-700">
                        <span className="font-semibold">Resolved At:</span> {new Date(shipment.disputeResolvedAt).toLocaleString()}
                        <div>Notes: {shipment.disputeResolutionNotes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Discrepancies Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Recorded Discrepancies</h4>
                  {!isClosed && (
                    <button
                      type="button"
                      onClick={() => setShowDiscrepancyModal(true)}
                      className="rounded-lg bg-[#b91c1c] px-2.5 py-1 text-xs font-bold text-white hover:bg-red-800"
                    >
                      + Record Discrepancy
                    </button>
                  )}
                </div>

                {(!shipment.discrepancies || shipment.discrepancies.length === 0) ? (
                  <div className="rounded-xl border border-dashed border-[#dcd7cb] p-4 text-center text-xs text-[#8a9992]">
                    No damage or quantity discrepancies reported.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shipment.discrepancies.map((disc) => (
                      <div key={disc.id} className="rounded-lg border border-red-200 bg-red-50/40 p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#991b1b]">{disc.type}</span>
                          <span className="text-[10px] text-[#8a9992]">{new Date(disc.recordedAt).toLocaleString()} by {disc.reportedByUserEmail}</span>
                        </div>
                        <p className="mt-1 text-[#450a0a]">{disc.description}</p>
                        {disc.type === "QUANTITY_DIFFERENCE" && (
                          <div className="mt-1 text-[11px] text-[#7f1d1d] font-semibold">
                            Expected: {disc.expectedQuantity} {disc.quantityUnit} • Delivered: {disc.deliveredQuantity} {disc.quantityUnit} • Difference: {disc.differenceQuantity} {disc.quantityUnit}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. COST RECONCILIATION */}
          {activeTab === "reconciliation" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#ece7dc] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Final Logistics Cost Reconciliation</h4>
                  {!isClosed && (
                    <button
                      type="button"
                      data-testid="reconcile-costs-card-btn"
                      onClick={() => setShowReconcileModal(true)}
                      className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                    >
                      {shipment.costReconciliation ? "Re-Reconcile Costs" : "Reconcile Final Costs"}
                    </button>
                  )}
                </div>

                {shipment.costReconciliation ? (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-lg bg-[#faf8f4] p-2.5">
                      <div className="text-[11px] text-[#6e7d77]">Quoted Amount (Immutable)</div>
                      <div className="text-base font-bold text-[#173f35]">
                        {shipment.costReconciliation.quotedAmount} {shipment.costReconciliation.quotedCurrency}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#faf8f4] p-2.5">
                      <div className="text-[11px] text-[#6e7d77]">Final Logistics Cost</div>
                      <div className="text-base font-bold text-[#173f35]">
                        {shipment.costReconciliation.finalAmount} {shipment.costReconciliation.finalCurrency}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#faf8f4] p-2.5">
                      <div className="text-[11px] text-[#6e7d77]">Variance (Server Calculated)</div>
                      <div className={`text-base font-bold ${shipment.costReconciliation.differenceAmount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                        {shipment.costReconciliation.differenceAmount > 0 ? `+${shipment.costReconciliation.differenceAmount}` : shipment.costReconciliation.differenceAmount} {shipment.costReconciliation.finalCurrency}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#faf8f4] p-2.5">
                      <div className="text-[11px] text-[#6e7d77]">Reconciled At</div>
                      <div className="text-xs text-[#2c3e38]">
                        {new Date(shipment.costReconciliation.reconciledAt).toLocaleString()}
                        <div className="text-[10px] text-[#8a9992]">{shipment.costReconciliation.reconciledByUserEmail}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-dashed border-[#dcd7cb] p-4 text-center text-xs text-[#8a9992]">
                    Final logistics costs have not been reconciled yet. Quoted baseline: {shipment.carrierTotalCost ?? "N/A"} {shipment.carrierCurrency}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. ADMINISTRATIVE SETTLEMENT */}
          {activeTab === "settlement" && (
            <div className="space-y-4" data-testid="settlement-administrative-view">
              {/* MANDATORY NOTICE BANNER */}
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                <span className="font-bold">Notice:</span> Administrative tracking only. I Do Grow records financial metadata and commercial references without executing money movement, banking transfers, payment processing, or escrow services.
              </div>

              {!settlement ? (
                <div className="rounded-xl border border-dashed border-[#dcd7cb] bg-white p-6 text-center">
                  <p className="text-xs text-[#6e7d77]">
                    No administrative settlement record initialized for Trade <span className="font-bold">{contract.tradeNumber}</span>.
                  </p>
                  <button
                    type="button"
                    data-testid="init-settlement-btn"
                    onClick={() => setShowCreateSettlementModal(true)}
                    className="mt-3 rounded-lg bg-[#173f35] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#123129]"
                  >
                    Initialize Settlement Record
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* METRICS GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="rounded-lg border border-[#ece7dc] bg-white p-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#8a9992]">Payment Status</div>
                      <div className="mt-1 font-bold text-[#173f35]">{settlement.paymentStatus}</div>
                    </div>
                    <div className="rounded-lg border border-[#ece7dc] bg-white p-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#8a9992]">Commercial Amount</div>
                      <div className="mt-1 font-bold text-[#173f35]">{settlement.totalCommercialAmount} {settlement.currency}</div>
                    </div>
                    <div className="rounded-lg border border-[#ece7dc] bg-white p-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#8a9992]">Deposit Recorded</div>
                      <div className="mt-1 font-bold text-[#173f35]">{settlement.depositAmount} {settlement.currency}</div>
                    </div>
                    <div className="rounded-lg border border-[#ece7dc] bg-white p-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#8a9992]">Remaining Balance</div>
                      <div className="mt-1 font-bold text-[#173f35]">{settlement.remainingBalance} {settlement.currency}</div>
                    </div>
                    <div className="rounded-lg border border-[#ece7dc] bg-white p-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#8a9992]">Due Date</div>
                      <div className="mt-1 font-bold text-[#173f35]">{settlement.paymentDueDate ? new Date(settlement.paymentDueDate).toLocaleDateString() : "None"}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUpdateSettlementModal(true)}
                      className="rounded-lg border border-[#dcd7cb] bg-white px-3 py-1 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f4]"
                    >
                      Update Settlement Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettlementDocModal(true)}
                      className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                    >
                      + Upload Invoice / Credit Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(true)}
                      className="rounded-lg border border-[#b91c1c] bg-white px-3 py-1 text-xs font-bold text-[#b91c1c] hover:bg-red-50"
                    >
                      + Record Claim
                    </button>
                  </div>

                  {/* DOCUMENTS & CLAIMS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Documents */}
                    <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                      <h5 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Settlement Documents</h5>
                      {(!settlement.documents || settlement.documents.length === 0) ? (
                        <p className="mt-2 text-xs text-[#8a9992]">No settlement documents uploaded.</p>
                      ) : (
                        <div className="mt-2 space-y-1.5">
                          {settlement.documents.map((sdoc) => (
                            <div key={sdoc.id} className="flex items-center justify-between rounded border border-[#ece7dc] p-2 text-xs">
                              <div>
                                <span className="font-bold text-[#173f35]">{sdoc.documentType}</span>
                                <div className="text-[11px] text-[#6e7d77]">{sdoc.originalFilename} {sdoc.documentReference && `(Ref: ${sdoc.documentReference})`}</div>
                              </div>
                              <a
                                href={getSettlementDocumentDownloadUrl(settlement.id, sdoc.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#173f35] underline"
                              >
                                Download
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Claims */}
                    <div className="rounded-xl border border-[#ece7dc] bg-white p-3">
                      <h5 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">Administrative Claims</h5>
                      {(!settlement.claims || settlement.claims.length === 0) ? (
                        <p className="mt-2 text-xs text-[#8a9992]">No claims recorded.</p>
                      ) : (
                        <div className="mt-2 space-y-1.5">
                          {settlement.claims.map((clm) => (
                            <div key={clm.id} className="rounded border border-[#ece7dc] p-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#991b1b]">{clm.description}</span>
                                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100">{clm.status}</span>
                              </div>
                              {clm.amount != null && <div className="text-[11px] text-[#52635c]">Claim Amount: {clm.amount} {settlement.currency}</div>}
                              {clm.status === "OPEN" && (
                                <button
                                  type="button"
                                  onClick={() => setShowResolveClaimModal(clm.id)}
                                  className="mt-1 text-[11px] font-bold text-emerald-700 underline"
                                >
                                  Resolve Claim
                                </button>
                              )}
                              {clm.resolvedAt && (
                                <div className="mt-1 text-[10px] text-emerald-800">
                                  Resolved: {clm.resolutionNotes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMMERCIAL BASELINE & QUOTES */}
          {activeTab === "commercial" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#ece7dc] bg-white p-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#173f35]">Contract Commercial Baseline (Immutable)</h4>
                  <span className="text-[11px] text-[#6e7d77]">Contract #{contract.contractNumber}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[#2c3e38]">
                  <div><span className="font-semibold">Material:</span> {contract.materialType}</div>
                  <div><span className="font-semibold">Quantity:</span> {contract.quantity} {contract.quantityUnit}</div>
                  <div><span className="font-semibold">Commercial Total:</span> {contract.acceptedCommercialAmount} {contract.currency}</div>
                  <div><span className="font-semibold">Incoterm:</span> {contract.incoterm || "N/A"}</div>
                </div>
              </div>

              {/* Quotations & Providers */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#173f35] uppercase tracking-wider">
                    Freight Quotations &amp; Providers
                  </h4>
                  {!isClosed && shipment.status !== "CARRIER_SELECTED" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid="invite-provider-btn"
                        onClick={() => setShowInviteModal(true)}
                        className="rounded-lg bg-[#173f35] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                      >
                        + Invite Provider
                      </button>
                      <button
                        type="button"
                        data-testid="manual-quote-btn"
                        onClick={() => {
                          if (!manualQuoteForm.logisticsRequestId && requests.length > 0) {
                            setManualQuoteForm((prev) => ({
                              ...prev,
                              logisticsRequestId: requests[0].id,
                            }));
                          }
                          setShowManualQuoteModal(true);
                        }}
                        className="rounded-lg border border-[#173f35] bg-white px-2.5 py-1 text-xs font-bold text-[#173f35] hover:bg-[#f4efe6]"
                      >
                        + Record Manual Quote
                      </button>
                    </div>
                  )}
                </div>

                {/* Invited Providers List */}
                {requests.length > 0 && (
                  <div className="space-y-1.5 rounded-xl border border-[#ece7dc] bg-[#faf8f5] p-3">
                    <h5 className="text-[11px] font-bold text-[#52635c] uppercase tracking-wider">
                      Invited Providers ({requests.length})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between rounded-lg border border-[#ece7dc] bg-white p-2.5 text-xs shadow-sm"
                        >
                          <div>
                            <div className="font-semibold text-[#173f35]">{req.targetProviderEmail}</div>
                            <div className="text-[10px] text-[#6e7d77]">
                              Status: <span className="font-medium text-[#2c3e38]">{req.status}</span>
                              {req.hasQuotation && <span className="ml-1 text-emerald-700 font-bold">• Quoted</span>}
                            </div>
                          </div>
                          {!isClosed && shipment.status !== "CARRIER_SELECTED" && !req.hasQuotation && (
                            <button
                              type="button"
                              onClick={() => {
                                setManualQuoteForm((prev) => ({ ...prev, logisticsRequestId: req.id }));
                                setShowManualQuoteModal(true);
                              }}
                              className="rounded bg-[#173f35] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#123129]"
                            >
                              Enter Quote
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {quotations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#dcd7cb] p-4 text-center text-xs text-[#8a9992]">
                    No quotations submitted yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quotations.map((q) => (
                      <div
                        key={q.id}
                        className={`rounded-lg border p-3 text-xs ${
                          q.isSelected ? "border-emerald-600 bg-emerald-50/30" : "border-[#ece7dc] bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#173f35]">{q.freightAmount} {q.currency}</span>
                          {q.isSelected ? (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">SELECTED</span>
                          ) : (
                            !isClosed && (
                              <button
                                type="button"
                                onClick={() => handleSelectCarrier(q.id)}
                                className="rounded bg-[#173f35] px-2 py-0.5 text-[10px] font-bold text-white hover:bg-[#123129]"
                              >
                                Select Carrier
                              </button>
                            )
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-[#52635c]">
                          Provider: {q.providerEmail} {q.enteredOnBehalfOfProvider && "(Trader manual entry)"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}

      {/* CREATE SHIPMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Initialize Shipment Requirements</h3>
            <form onSubmit={handleCreateShipment} className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Origin Port / City</label>
                  <input
                    type="text"
                    value={createForm.origin || ""}
                    onChange={(e) => setCreateForm({ ...createForm, origin: e.target.value })}
                    placeholder="e.g. Dakar Port"
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Destination Port / City</label>
                  <input
                    type="text"
                    value={createForm.destination || ""}
                    onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                    placeholder="e.g. Le Havre Port"
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={createForm.shipmentQuantity}
                    onChange={(e) => setCreateForm({ ...createForm, shipmentQuantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Requested Pickup Date</label>
                  <input
                    type="date"
                    value={createForm.requestedPickupDate || ""}
                    onChange={(e) => setCreateForm({ ...createForm, requestedPickupDate: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                >
                  {isSubmitting ? "Creating..." : "Save Shipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE LOGISTICS PROVIDER MODAL */}
      {showInviteModal && shipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Invite Logistics Partner</h3>
            <p className="mt-1 text-xs text-[#52635c]">
              Invite a registered logistics partner to submit a quotation for shipment #{shipment.shipmentNumber}.
            </p>
            {error && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleInviteProvider} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">
                  Provider User ID
                </label>
                <input
                  type="text"
                  required
                  data-testid="input-invite-provider-id"
                  value={inviteProviderId}
                  onChange={(e) => setInviteProviderId(e.target.value)}
                  placeholder="e.g. UUID of registered Logistics Partner"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
                <p className="mt-1 text-[10px] text-[#8a9992]">
                  The provider must be an active user with the LOGISTICS_PARTNER role.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button
                  type="button"
                  data-testid="cancel-invite-provider-btn"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !inviteProviderId.trim()}
                  data-testid="submit-invite-provider-btn"
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129] disabled:opacity-50"
                >
                  {isSubmitting ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL FREIGHT QUOTATION MODAL */}
      {showManualQuoteModal && shipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Record Manual Freight Quotation</h3>
            <p className="mt-1 text-xs text-[#52635c]">
              Record an offline quotation received on behalf of an invited logistics partner.
            </p>
            {error && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleManualQuoteSubmit} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">
                  Logistics Request / Provider
                </label>
                {requests.length > 0 ? (
                  <select
                    required
                    data-testid="select-manual-quote-request-id"
                    value={manualQuoteForm.logisticsRequestId}
                    onChange={(e) =>
                      setManualQuoteForm({ ...manualQuoteForm, logisticsRequestId: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  >
                    <option value="">Select an invited provider...</option>
                    {requests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.targetProviderEmail} ({r.status}){r.hasQuotation ? " - Quoted" : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      data-testid="input-manual-quote-request-id"
                      placeholder="Logistics Request UUID"
                      value={manualQuoteForm.logisticsRequestId}
                      onChange={(e) =>
                        setManualQuoteForm({ ...manualQuoteForm, logisticsRequestId: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                    />
                    <p className="mt-1 text-[10px] text-[#8a9992]">
                      No invited providers in list. Enter the Request ID or invite a provider first.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">
                    Freight Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    data-testid="input-manual-quote-amount"
                    value={manualQuoteForm.freightAmount || ""}
                    onChange={(e) =>
                      setManualQuoteForm({
                        ...manualQuoteForm,
                        freightAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g. 2500"
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    required
                    data-testid="input-manual-quote-currency"
                    value={manualQuoteForm.currency}
                    onChange={(e) =>
                      setManualQuoteForm({ ...manualQuoteForm, currency: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">
                    Proposed Pickup Date
                  </label>
                  <input
                    type="date"
                    data-testid="input-manual-quote-pickup-date"
                    value={manualQuoteForm.proposedPickupDate || ""}
                    onChange={(e) =>
                      setManualQuoteForm({
                        ...manualQuoteForm,
                        proposedPickupDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    data-testid="input-manual-quote-delivery-date"
                    value={manualQuoteForm.estimatedDeliveryDate || ""}
                    onChange={(e) =>
                      setManualQuoteForm({
                        ...manualQuoteForm,
                        estimatedDeliveryDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  data-testid="input-manual-quote-valid-until"
                  value={manualQuoteForm.validUntil || ""}
                  onChange={(e) =>
                    setManualQuoteForm({
                      ...manualQuoteForm,
                      validUntil: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  data-testid="input-manual-quote-notes"
                  value={manualQuoteForm.notes || ""}
                  onChange={(e) =>
                    setManualQuoteForm({ ...manualQuoteForm, notes: e.target.value })
                  }
                  placeholder="Terms, carrier quotation ref, transit vessel..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button
                  type="button"
                  data-testid="cancel-manual-quote-btn"
                  onClick={() => setShowManualQuoteModal(false)}
                  className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !manualQuoteForm.logisticsRequestId || manualQuoteForm.freightAmount <= 0}
                  data-testid="submit-manual-quote-btn"
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129] disabled:opacity-50"
                >
                  {isSubmitting ? "Recording..." : "Record Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE PICKUP MODAL */}
      {showPickupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Schedule Shipment Pickup</h3>
            <form onSubmit={handleSchedulePickup} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Scheduled Pickup Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  data-testid="input-scheduled-pickup"
                  value={pickupForm.scheduledPickupAt}
                  onChange={(e) => setPickupForm({ ...pickupForm, scheduledPickupAt: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={pickupForm.notes || ""}
                  onChange={(e) => setPickupForm({ ...pickupForm, notes: e.target.value })}
                  placeholder="Gate details, driver reference..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowPickupModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-schedule-pickup-btn"
                  className="rounded-lg bg-[#0369a1] px-3 py-1 text-xs font-bold text-white hover:bg-[#0284c7]"
                >
                  {isSubmitting ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK PICKED UP MODAL */}
      {showPickedUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Mark Goods Picked Up</h3>
            <form onSubmit={handleMarkPickedUp} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={pickedUpForm.location || ""}
                  onChange={(e) => setPickedUpForm({ ...pickedUpForm, location: e.target.value })}
                  placeholder="Terminal, dock number..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={pickedUpForm.notes || ""}
                  onChange={(e) => setPickedUpForm({ ...pickedUpForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowPickedUpModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="confirm-picked-up-btn"
                  className="rounded-lg bg-[#5b21b6] px-3 py-1 text-xs font-bold text-white hover:bg-[#6d28d9]"
                >
                  Confirm Picked Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK IN TRANSIT MODAL */}
      {showInTransitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Mark Shipment In Transit</h3>
            <form onSubmit={handleMarkInTransit} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Current Transit Corridor / Hub</label>
                <input
                  type="text"
                  value={inTransitForm.location || ""}
                  onChange={(e) => setInTransitForm({ ...inTransitForm, location: e.target.value })}
                  placeholder="e.g. Atlantic maritime route"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowInTransitModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="confirm-in-transit-btn"
                  className="rounded-lg bg-[#115e59] px-3 py-1 text-xs font-bold text-white hover:bg-[#0d9488]"
                >
                  Set In Transit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMS MODAL */}
      {showCustomsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Update Customs Clearance Status</h3>
            <form onSubmit={handleCustomsStatus} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Customs Office / Post</label>
                <input
                  type="text"
                  value={customsForm.location || ""}
                  onChange={(e) => setCustomsForm({ ...customsForm, location: e.target.value })}
                  placeholder="Customs terminal"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Customs Reference / Notes</label>
                <textarea
                  rows={2}
                  value={customsForm.notes || ""}
                  onChange={(e) => setCustomsForm({ ...customsForm, notes: e.target.value })}
                  placeholder="Clearance document reference"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowCustomsModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="confirm-customs-btn"
                  className="rounded-lg bg-[#86198f] px-3 py-1 text-xs font-bold text-white hover:bg-[#a21caf]"
                >
                  Set Customs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT DELAY MODAL */}
      {showDelayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#ea580c]">Report Shipment Delay</h3>
            <form onSubmit={handleReportDelay} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Delay Reason (Required)</label>
                <input
                  type="text"
                  required
                  data-testid="input-delay-reason"
                  value={delayForm.delayReason}
                  onChange={(e) => setDelayForm({ ...delayForm, delayReason: e.target.value })}
                  placeholder="e.g. Severe storm, port congestion"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Revised Expected Delivery Date</label>
                <input
                  type="date"
                  value={delayForm.revisedExpectedDeliveryDate || ""}
                  onChange={(e) => setDelayForm({ ...delayForm, revisedExpectedDeliveryDate: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDelayModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-delay-btn"
                  className="rounded-lg bg-[#ea580c] px-3 py-1 text-xs font-bold text-white hover:bg-orange-700"
                >
                  Submit Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELIVERY MODAL */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#166534]">Confirm Delivery</h3>
            <form onSubmit={handleConfirmDelivery} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Delivered Location</label>
                <input
                  type="text"
                  value={deliveryForm.deliveredLocation || ""}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveredLocation: e.target.value })}
                  placeholder="Buyer warehouse dock 4"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Delivery Notes</label>
                <textarea
                  rows={2}
                  value={deliveryForm.deliveryNotes || ""}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNotes: e.target.value })}
                  placeholder="Signed POD received..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDeliveryModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-confirm-delivery-btn"
                  className="rounded-lg bg-[#166534] px-3 py-1 text-xs font-bold text-white hover:bg-[#15803d]"
                >
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DISCREPANCY MODAL */}
      {showDiscrepancyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#b91c1c]">Record Discrepancy</h3>
            <form onSubmit={handleRecordDiscrepancy} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Discrepancy Type</label>
                <select
                  value={discrepancyForm.type}
                  onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, type: e.target.value as "DAMAGE" | "QUANTITY_DIFFERENCE" })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                >
                  <option value="DAMAGE">DAMAGE</option>
                  <option value="QUANTITY_DIFFERENCE">QUANTITY_DIFFERENCE</option>
                </select>
              </div>

              {discrepancyForm.type === "QUANTITY_DIFFERENCE" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Expected ({shipment?.quantityUnit ?? "KG"})</label>
                    <input
                      type="number"
                      required
                      value={discrepancyForm.expectedQuantity ?? 0}
                      onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, expectedQuantity: Number(e.target.value) })}
                      className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Delivered ({shipment?.quantityUnit ?? "KG"})</label>
                    <input
                      type="number"
                      required
                      value={discrepancyForm.deliveredQuantity ?? 0}
                      onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, deliveredQuantity: Number(e.target.value) })}
                      className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Description (Required)</label>
                <textarea
                  rows={3}
                  required
                  data-testid="input-discrepancy-description"
                  value={discrepancyForm.description}
                  onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, description: e.target.value })}
                  placeholder="Detail the damage or quantity variance..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDiscrepancyModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-discrepancy-btn"
                  className="rounded-lg bg-[#b91c1c] px-3 py-1 text-xs font-bold text-white hover:bg-red-800"
                >
                  Record Discrepancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK DISPUTED MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#b91c1c]">Mark Shipment as Disputed</h3>
            <p className="mt-1 text-xs text-[#6e7d77]">
              Explicit trader action to flag delivery discrepancy for formal resolution.
            </p>
            <form onSubmit={handleMarkDisputed} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Dispute Reason (Required)</label>
                <input
                  type="text"
                  required
                  data-testid="input-dispute-reason"
                  value={disputeForm.disputeReason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, disputeReason: e.target.value })}
                  placeholder="e.g. Unresolved 50 KG shortage"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDisputeModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-dispute-btn"
                  className="rounded-lg bg-[#b91c1c] px-3 py-1 text-xs font-bold text-white hover:bg-red-800"
                >
                  Confirm Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE DISPUTE MODAL */}
      {showResolveDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#166534]">Resolve Shipment Dispute</h3>
            <form onSubmit={handleResolveDispute} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Resolution Agreement Notes</label>
                <textarea
                  rows={3}
                  required
                  value={resolveDisputeForm.disputeResolutionNotes}
                  onChange={(e) => setResolveDisputeForm({ disputeResolutionNotes: e.target.value })}
                  placeholder="Agreement terms, credit notes issued..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowResolveDisputeModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#166534] px-3 py-1 text-xs font-bold text-white hover:bg-[#15803d]"
                >
                  Resolve Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECONCILE COSTS MODAL */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Reconcile Final Logistics Costs</h3>
            <form onSubmit={handleReconcileCosts} className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Final Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    data-testid="input-reconcile-amount"
                    value={reconcileForm.finalAmount}
                    onChange={(e) => setReconcileForm({ ...reconcileForm, finalAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    value={reconcileForm.finalCurrency}
                    onChange={(e) => setReconcileForm({ ...reconcileForm, finalCurrency: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Reconciliation Notes</label>
                <textarea
                  rows={2}
                  value={reconcileForm.notes || ""}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, notes: e.target.value })}
                  placeholder="Invoice number, demurrage/fuel explanation..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowReconcileModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-reconcile-btn"
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                >
                  Save Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE SHIPMENT MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Close Shipment Operation</h3>
            <p className="mt-1 text-xs text-[#6e7d77]">
              Closing is final and freezes execution data into an immutable read-only history. Delivery and cost reconciliation are verified.
            </p>
            <form onSubmit={handleCloseShipment} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Closing Notes</label>
                <textarea
                  rows={2}
                  value={closeForm.notes}
                  onChange={(e) => setCloseForm({ notes: e.target.value })}
                  placeholder="Operational closure signoff..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowCloseModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="confirm-close-shipment-btn"
                  className="rounded-lg bg-[#374151] px-3 py-1 text-xs font-bold text-white hover:bg-[#1f2937]"
                >
                  Confirm Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD SHIPPING DOCUMENT MODAL */}
      {showDocUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Upload Shipping Document</h3>
            <form onSubmit={handleUploadShippingDoc} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Document Label (e.g. Bill of Lading, CMR)</label>
                <input
                  type="text"
                  required
                  data-testid="input-doc-label"
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  placeholder="e.g. Bill of Lading"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Reference Number (Optional)</label>
                <input
                  type="text"
                  value={docRef}
                  onChange={(e) => setDocRef(e.target.value)}
                  placeholder="BL-9921"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">File (PDF, PNG, JPG, max 10MB)</label>
                <input
                  type="file"
                  required
                  data-testid="input-doc-file"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#52635c]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowDocUploadModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !docFile}
                  data-testid="submit-shipping-doc-btn"
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SETTLEMENT MODAL */}
      {showCreateSettlementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Initialize Administrative Settlement</h3>
            <form onSubmit={handleCreateSettlement} className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Deposit Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    data-testid="input-settlement-deposit"
                    value={settlementForm.depositAmount}
                    onChange={(e) => setSettlementForm({ ...settlementForm, depositAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Commission Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settlementForm.commissionAmount}
                    onChange={(e) => setSettlementForm({ ...settlementForm, commissionAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Final Settlement Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settlementForm.finalSettlementAmount}
                    onChange={(e) => setSettlementForm({ ...settlementForm, finalSettlementAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={settlementForm.paymentDueDate}
                    onChange={(e) => setSettlementForm({ ...settlementForm, paymentDueDate: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Payment Instructions (SWIFT, IBAN details)</label>
                <textarea
                  rows={2}
                  value={settlementForm.paymentInstructions}
                  onChange={(e) => setSettlementForm({ ...settlementForm, paymentInstructions: e.target.value })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowCreateSettlementModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="submit-create-settlement-btn"
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE SETTLEMENT MODAL */}
      {showUpdateSettlementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Update Settlement Details</h3>
            <form onSubmit={handleUpdateSettlement} className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Deposit Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settlementForm.depositAmount}
                    onChange={(e) => setSettlementForm({ ...settlementForm, depositAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Commission Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settlementForm.commissionAmount}
                    onChange={(e) => setSettlementForm({ ...settlementForm, commissionAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Final Settlement Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settlementForm.finalSettlementAmount}
                    onChange={(e) => setSettlementForm({ ...settlementForm, finalSettlementAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={settlementForm.paymentDueDate}
                    onChange={(e) => setSettlementForm({ ...settlementForm, paymentDueDate: e.target.value })}
                    className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowUpdateSettlementModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLEMENT DOCUMENT MODAL */}
      {showSettlementDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#173f35]">Upload Settlement Document</h3>
            <form onSubmit={handleUploadSettlementDoc} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Document Type</label>
                <select
                  value={settlementDocType}
                  onChange={(e) => setSettlementDocType(e.target.value as SettlementDocumentType)}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                >
                  <option value="INVOICE">INVOICE</option>
                  <option value="CREDIT_NOTE">CREDIT_NOTE</option>
                  <option value="PAYMENT_INSTRUCTION">PAYMENT_INSTRUCTION</option>
                  <option value="CLAIM">CLAIM</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Document Reference (Optional)</label>
                <input
                  type="text"
                  value={settlementDocRef}
                  onChange={(e) => setSettlementDocRef(e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">File (PDF, max 10MB)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSettlementDocFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#52635c]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowSettlementDocModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !settlementDocFile}
                  className="rounded-lg bg-[#173f35] px-3 py-1 text-xs font-bold text-white hover:bg-[#123129]"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CLAIM MODAL */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#b91c1c]">Record Settlement Claim</h3>
            <form onSubmit={handleCreateClaim} className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Claim Description (Required)</label>
                <input
                  type="text"
                  required
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  placeholder="e.g. Quality deduction / quantity shortfall"
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Claim Amount (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={claimForm.amount}
                  onChange={(e) => setClaimForm({ ...claimForm, amount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowClaimModal(false)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#b91c1c] px-3 py-1 text-xs font-bold text-white hover:bg-red-800"
                >
                  Record Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE CLAIM MODAL */}
      {showResolveClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#166534]">Resolve Claim</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleResolveClaim(showResolveClaimModal);
              }}
              className="mt-3 space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-[#52635c] mb-1">Resolution Notes</label>
                <textarea
                  rows={2}
                  required
                  value={resolveClaimNotes}
                  onChange={(e) => setResolveClaimNotes(e.target.value)}
                  placeholder="Credit note reference, accepted resolution..."
                  className="w-full rounded-lg border border-[#e2dccd] px-3 py-1.5 text-xs text-[#173f35]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece7dc]">
                <button type="button" onClick={() => setShowResolveClaimModal(null)} className="rounded-lg px-3 py-1 text-xs text-[#6e7d77]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#166534] px-3 py-1 text-xs font-bold text-white hover:bg-[#15803d]"
                >
                  Resolve Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
