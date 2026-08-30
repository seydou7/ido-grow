"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  APPROVED_MATERIAL_TYPES,
  APPROVED_PRODUCT_FORMS,
  APPROVED_QUANTITY_UNITS,
  APPROVED_TARGET_PRICE_UNITS,
  type BuyOrderDetail,
  type CreateBuyOrderInput,
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  PRODUCT_FORM_LABELS,
  type ProductForm,
  QUANTITY_UNIT_LABELS,
  type QuantityUnit,
  TARGET_PRICE_UNIT_LABELS,
  type TargetPriceUnit,
} from "./contracts";

interface CreateEditBuyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft: (data: CreateBuyOrderInput, targetBuyerOrgId?: string) => Promise<void>;
  onSubmitDirectly: (data: CreateBuyOrderInput, targetBuyerOrgId?: string) => Promise<void>;
  existingOrder?: BuyOrderDetail | null;
  isTrader?: boolean;
  buyerOrganisations?: Array<{ id: string; name: string; country: string | null }>;
}

interface FormValues {
  buyerOrganisationId: string;
  materialType: MaterialType;
  productForm: ProductForm | "";
  quantity: number;
  quantityUnit: QuantityUnit;
  deliveryCountry: string;
  deliveryDestination: string;
  requestedDeliveryDate: string;
  targetPriceAmount: number | "";
  currency: string;
  targetPriceUnit: TargetPriceUnit;
  acceptableOriginCountries: string;
  qualityRequirements: string;
  packagingRequirements: string;
  certificationRequirements: string;
  transportPreferences: string;
  paymentTerms: string;
}

export function CreateEditBuyOrderModal({
  isOpen,
  onClose,
  onSaveDraft,
  onSubmitDirectly,
  existingOrder,
  isTrader = false,
  buyerOrganisations = [],
}: CreateEditBuyOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(existingOrder);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      buyerOrganisationId:
        existingOrder?.buyerOrganisationId ||
        (buyerOrganisations.length > 0 ? buyerOrganisations[0].id : ""),
      materialType: (existingOrder?.materialType as MaterialType) || "HEMP",
      productForm: (existingOrder?.productForm as ProductForm) || "STRAW_RETTED",
      quantity: existingOrder?.quantity || 50,
      quantityUnit: (existingOrder?.quantityUnit as QuantityUnit) || "TONNES",
      deliveryCountry: existingOrder?.deliveryCountry || "",
      deliveryDestination: existingOrder?.deliveryDestination || "",
      requestedDeliveryDate: existingOrder?.requestedDeliveryDate
        ? existingOrder.requestedDeliveryDate.split("T")[0]
        : "",
      targetPriceAmount:
        existingOrder?.targetPriceAmount !== null &&
        existingOrder?.targetPriceAmount !== undefined
          ? existingOrder.targetPriceAmount
          : "",
      currency: existingOrder?.currency || "EUR",
      targetPriceUnit:
        (existingOrder?.targetPriceUnit as TargetPriceUnit) || "PER_TONNE",
      acceptableOriginCountries: existingOrder?.acceptableOriginCountries || "",
      qualityRequirements: existingOrder?.qualityRequirements || "",
      packagingRequirements: existingOrder?.packagingRequirements || "",
      certificationRequirements: existingOrder?.certificationRequirements || "",
      transportPreferences: existingOrder?.transportPreferences || "",
      paymentTerms: existingOrder?.paymentTerms || "",
    },
  });

  if (!isOpen) return null;

  const handleAction = async (values: FormValues, submitDirectly: boolean) => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (isTrader && !isEditing && !values.buyerOrganisationId) {
        throw new Error("Please select a target Buyer organisation.");
      }

      const payload: CreateBuyOrderInput = {
        materialType: values.materialType,
        productForm: values.productForm ? values.productForm : null,
        quantity: Number(values.quantity),
        quantityUnit: values.quantityUnit,
        deliveryCountry: values.deliveryCountry || null,
        deliveryDestination: values.deliveryDestination || null,
        requestedDeliveryDate: values.requestedDeliveryDate
          ? new Date(values.requestedDeliveryDate).toISOString()
          : null,
        targetPriceAmount:
          values.targetPriceAmount !== ""
            ? Number(values.targetPriceAmount)
            : null,
        currency: "EUR",
        targetPriceUnit: values.targetPriceUnit,
        acceptableOriginCountries: values.acceptableOriginCountries || null,
        qualityRequirements: values.qualityRequirements || null,
        packagingRequirements: values.packagingRequirements || null,
        certificationRequirements: values.certificationRequirements || null,
        transportPreferences: values.transportPreferences || null,
        paymentTerms: values.paymentTerms || null,
        submitDirectly,
      };

      const targetBuyerOrgId = isTrader
        ? values.buyerOrganisationId || existingOrder?.buyerOrganisationId
        : undefined;

      if (submitDirectly) {
        await onSubmitDirectly(payload, targetBuyerOrgId);
      } else {
        await onSaveDraft(payload, targetBuyerOrgId);
      }
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to process Buy Order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-[#e2dccd] bg-[#faf8f1] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2dccd] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#173f35]">
              {isEditing
                ? isTrader
                  ? "Edit Buy Order (on behalf of Buyer)"
                  : "Edit Buy Order Demand"
                : isTrader
                  ? "Create Buy Order (on behalf of Buyer)"
                  : "Create New Buy Order"}
            </h2>
            <p className="text-xs text-[#52635c]">
              {isTrader
                ? "Specify structured raw material requirements for the selected Buyer organisation."
                : "Specify structured raw material requirements for I Do Grow sourcing & matching."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#52635c] hover:bg-[#e8e2d2] hover:text-[#173f35]"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
          id="buy-order-form"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          {/* Section 0: Target Buyer Organisation (Trader Mode Only) */}
          {isTrader && (
            <div className="rounded-xl border border-[#e2dccd] bg-[#fffbf0] p-4 shadow-2xs">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#875908]">
                Target Buyer Organisation *
              </h3>
              {isEditing ? (
                <div className="text-xs font-semibold text-[#173f35]">
                  {existingOrder?.buyerOrganisationName ||
                    `Buyer Organisation (${existingOrder?.buyerOrganisationId})`}
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="buyerOrganisationId"
                    className="block text-xs font-semibold text-[#173f35] mb-1"
                  >
                    Select Buyer Organisation
                  </label>
                  <select
                    id="buyerOrganisationId"
                    {...register("buyerOrganisationId", { required: isTrader })}
                    className="w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                  >
                    {buyerOrganisations.length === 0 ? (
                      <option value="">No Buyer organisations available</option>
                    ) : (
                      buyerOrganisations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} {org.country ? `(${org.country})` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Material Requirement */}
          <div className="rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#284f41]">
              1. Material Requirement
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="materialType"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Natural Fibre Type *
                </label>
                <select
                  id="materialType"
                  {...register("materialType", { required: true })}
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                >
                  {APPROVED_MATERIAL_TYPES.map((mat) => (
                    <option key={mat} value={mat}>
                      {MATERIAL_TYPE_LABELS[mat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="productForm"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Product Form
                </label>
                <select
                  id="productForm"
                  {...register("productForm")}
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                >
                  <option value="">Any / Unspecified Form</option>
                  {APPROVED_PRODUCT_FORMS.map((form) => (
                    <option key={form} value={form}>
                      {PRODUCT_FORM_LABELS[form]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Volume & Quantity */}
          <div className="rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#284f41]">
              2. Volume & Quantity
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Target Quantity *
                </label>
                <input
                  id="quantity"
                  type="number"
                  step="any"
                  min="0.01"
                  {...register("quantity", { required: true, min: 0.01 })}
                  placeholder="e.g. 50"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
                {errors.quantity && (
                  <p className="mt-1 text-[11px] text-red-600">
                    Valid positive quantity is required.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="quantityUnit"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Quantity Unit *
                </label>
                <select
                  id="quantityUnit"
                  {...register("quantityUnit", { required: true })}
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                >
                  {APPROVED_QUANTITY_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {QUANTITY_UNIT_LABELS[unit]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Specifications */}
          <div className="rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#284f41]">
              3. Delivery & Destination
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="deliveryCountry"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Destination Country
                </label>
                <input
                  id="deliveryCountry"
                  {...register("deliveryCountry")}
                  placeholder="e.g. Germany, Netherlands"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="deliveryDestination"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Delivery Address / Port
                </label>
                <input
                  id="deliveryDestination"
                  {...register("deliveryDestination")}
                  placeholder="e.g. Hamburg Facility, Warehouse 3"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="requestedDeliveryDate"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Requested Delivery Date
                </label>
                <input
                  id="requestedDeliveryDate"
                  type="date"
                  {...register("requestedDeliveryDate")}
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Commercial Target */}
          <div className="rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#284f41]">
              4. Commercial Target (Optional)
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="targetPriceAmount"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Target Price (€ EUR)
                </label>
                <input
                  id="targetPriceAmount"
                  type="number"
                  step="any"
                  min="0"
                  {...register("targetPriceAmount")}
                  placeholder="e.g. 240 (leave blank for market quotes)"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="targetPriceUnit"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Price Unit
                </label>
                <select
                  id="targetPriceUnit"
                  {...register("targetPriceUnit")}
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                >
                  {APPROVED_TARGET_PRICE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {TARGET_PRICE_UNIT_LABELS[unit]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Quality, Packaging & Certifications */}
          <div className="rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#284f41]">
              5. Quality, Packaging & Certifications
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="acceptableOriginCountries"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Acceptable Origin Countries
                </label>
                <input
                  id="acceptableOriginCountries"
                  {...register("acceptableOriginCountries")}
                  placeholder="e.g. France, Belgium, Netherlands (or leave empty for any)"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="qualityRequirements"
                    className="block text-xs font-semibold text-[#173f35]"
                  >
                    Quality Requirements / Specs
                  </label>
                  <textarea
                    id="qualityRequirements"
                    rows={2}
                    {...register("qualityRequirements")}
                    placeholder="e.g. Moisture < 14%, dew-retted, clean fibre"
                    className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label
                    htmlFor="packagingRequirements"
                    className="block text-xs font-semibold text-[#173f35]"
                  >
                    Packaging Requirements
                  </label>
                  <textarea
                    id="packagingRequirements"
                    rows={2}
                    {...register("packagingRequirements")}
                    placeholder="e.g. Standard rectangular bales, strapped"
                    className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="certificationRequirements"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Certification Requirements
                </label>
                <input
                  id="certificationRequirements"
                  {...register("certificationRequirements")}
                  placeholder="e.g. GOTS, Organic EU, ISO 9001"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Additional Trade Requirements */}
          <div className="rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#284f41]">
              6. Transport & Payment Terms
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="transportPreferences"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Transport Preferences
                </label>
                <input
                  id="transportPreferences"
                  {...register("transportPreferences")}
                  placeholder="e.g. Road freight, DAP incoterms preferred"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>

              <div>
                <label
                  htmlFor="paymentTerms"
                  className="block text-xs font-semibold text-[#173f35]"
                >
                  Payment Terms
                </label>
                <input
                  id="paymentTerms"
                  {...register("paymentTerms")}
                  placeholder="e.g. Net 30 days after delivery"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#e2dccd] bg-white px-6 py-4 sm:flex-row sm:items-center">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-[#d4cdbc] px-4 py-2 text-xs font-semibold text-[#52635c] hover:bg-[#faf8f1]"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit((vals) => handleAction(vals, false))}
              disabled={isSubmitting}
              type="button"
              className="rounded-lg border border-[#173f35] px-4 py-2 text-xs font-semibold text-[#173f35] transition-colors hover:bg-[#173f35]/5 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </button>

            <button
              onClick={handleSubmit((vals) => handleAction(vals, true))}
              disabled={isSubmitting}
              type="button"
              className="rounded-lg bg-[#173f35] px-5 py-2 text-xs font-semibold text-[#fffaf0] shadow-sm transition-colors hover:bg-[#204e42] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Buy Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
