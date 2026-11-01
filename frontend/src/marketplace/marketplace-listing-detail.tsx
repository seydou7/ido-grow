"use client";

import { useEffect, useState } from "react";
import {
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  PRICE_UNIT_LABELS,
  type PriceUnit,
  PRODUCT_FORM_LABELS,
  type ProductForm,
  QUANTITY_UNIT_LABELS,
  type QuantityUnit,
} from "../listings/contracts";
import { getMarketplaceListing } from "./api";
import type { MarketplaceListingDetail as MarketplaceListingDetailType } from "./contracts";

type MarketplaceListingDetailProps = Readonly<{
  listingId: string;
  onBack: () => void;
}>;

function ArrowLeftIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BuildingIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function CalendarIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" x2="16" y1="2" y2="6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" x2="8" y1="2" y2="6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" x2="21" y1="10" y2="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HelpCircleIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MarketplaceListingDetailView({
  listingId,
  onBack,
}: MarketplaceListingDetailProps) {
  const [listing, setListing] = useState<MarketplaceListingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMarketplaceListing(listingId);
        if (isMounted) {
          setListing(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to retrieve listing details.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [listingId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#284f41] hover:text-[#173f35]"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to Marketplace
        </button>
        <div className="animate-pulse space-y-4 rounded-2xl border border-[#e2d9c8] bg-white p-8">
          <div className="h-6 w-32 rounded bg-slate-200" />
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-20 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#284f41] hover:text-[#173f35]"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to Marketplace
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h3 className="text-base font-bold text-red-800">
            Listing Unavailable
          </h3>
          <p className="mt-2 text-sm text-red-600">
            {error || "The requested listing could not be found or is not published."}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 rounded-lg bg-[#284f41] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f3f34]"
          >
            Return to Catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#284f41] transition-colors hover:text-[#173f35]"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to Marketplace
        </button>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          Published Supply
        </span>
      </div>

      {/* Main Hero Header */}
      <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#284f41] px-2.5 py-1 text-xs font-bold text-white uppercase">
            {MATERIAL_TYPE_LABELS[listing.materialType as MaterialType] || listing.materialType}
          </span>
          {listing.productForm && (
            <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
              {PRODUCT_FORM_LABELS[listing.productForm as ProductForm] || listing.productForm}
            </span>
          )}
          {listing.originCountry && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 ml-auto">
              <GlobeIcon className="h-3.5 w-3.5 text-slate-400" />
              Origin: {listing.originCountry}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {listing.title}
        </h1>

        <p className="mt-2 text-xs text-slate-400">
          Listed on {new Date(listing.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Commercial Specifications Matrix */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#e2d9c8] bg-[#fbf8ef] p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available Volume
            </span>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {listing.quantity.toLocaleString()}{" "}
              <span className="text-sm font-medium text-slate-600">
                {QUANTITY_UNIT_LABELS[listing.quantityUnit as QuantityUnit] || listing.quantityUnit}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-[#e2d9c8] bg-[#fbf8ef] p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Price / Valuation
            </span>
            <p className="mt-1 text-xl font-bold text-[#173f35]">
              {listing.priceAmount !== null && listing.priceAmount !== undefined ? (
                <>
                  €{listing.priceAmount.toLocaleString()}{" "}
                  <span className="text-sm font-medium text-slate-600">
                    {PRICE_UNIT_LABELS[listing.priceUnit as PriceUnit] || listing.priceUnit}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-slate-500 italic">
                  Price not specified
                </span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-[#e2d9c8] bg-[#fbf8ef] p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Currency & Terms
            </span>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {listing.currency || "EUR"} (Ex-Works / Standard B2B)
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Landed cost calculated at matching / quote stage
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Description & Production Site + Intermediated Supplier Box */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Description & Specifications */}
        <div className="space-y-6 md:col-span-2">
          {/* Description */}
          <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#173f35] border-b border-slate-100 pb-3">
              Description & Specifications
            </h2>
            <div className="mt-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {listing.description || "No additional description provided for this listing."}
            </div>
          </div>

          {/* Origin & Production Site Information */}
          <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#173f35] border-b border-slate-100 pb-3">
              Origin & Production Provenance
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <dt className="font-semibold text-slate-500 uppercase">Country of Origin</dt>
                <dd className="mt-0.5 text-sm font-bold text-slate-800">
                  {listing.originCountry || "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500 uppercase">Harvest / Crop Year</dt>
                <dd className="mt-0.5 text-sm font-bold text-slate-800">
                  {listing.harvestYear ? String(listing.harvestYear) : "Not specified"}
                </dd>
              </div>
              {listing.site && (
                <>
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase">Production Facility</dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-800">
                      {listing.site.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500 uppercase">Facility Type & Location</dt>
                    <dd className="mt-0.5 text-sm font-bold text-slate-800">
                      {[listing.site.facilityType, listing.site.city, listing.site.country]
                        .filter(Boolean)
                        .join(" · ") || "Registered site"}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column: Intermediated Supplier & Trading Notice */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e2d9c8] bg-[#fffaf0] p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-[#284f41]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#173f35]">
                Supplier Transparency
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Organisation Name
                </span>
                <p className="font-bold text-slate-900 text-base">
                  {listing.supplier.name}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Location
                </span>
                <p className="font-medium text-slate-700 text-xs">
                  {listing.supplier.country || "European Union"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Verification Status
                </span>
                <p className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  {listing.supplier.verificationStatus || "REGISTERED"}
                </p>
              </div>
            </div>

            {/* Intermediation Notice */}
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
              <p className="font-bold flex items-center gap-1">
                <HelpCircleIcon className="h-4 w-4 text-amber-700" />
                Intermediated Trading Desk
              </p>
              <p className="mt-1 leading-relaxed text-[11px] text-amber-800">
                To guarantee quality assurance, standardized inspection, and secure settlement, all buyer inquiries and quotations on I Do Grow are handled centrally through the I Do Grow trading desk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
