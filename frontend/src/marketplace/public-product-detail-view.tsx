"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGateModal } from "./auth-gate-modal";
import {
  formatCertification,
  formatMaterialType,
  formatOriginCountry,
  formatPriceUnit,
  formatProductForm,
  formatQuantity,
} from "./formatters";
import { fetchAuthSession, fetchPublicListing } from "./public-api";
import type {
  PublicMarketplaceListingDetail,
  SessionStatus,
} from "./public-contracts";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import { PublicProductCard } from "./public-product-card";

export interface PublicProductDetailViewProps {
  readonly listingId: string;
}

export function PublicProductDetailView({ listingId }: PublicProductDetailViewProps) {
  const [listing, setListing] = useState<PublicMarketplaceListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Auth gate state
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("Request a Quote");

  // User session state
  const [session, setSession] = useState<SessionStatus>({
    status: "unauthenticated",
    user: null,
  });

  // Transaction action state (for logged in buyers)
  const [buyerActionActive, setBuyerActionActive] = useState<string | null>(null);
  const [quoteRequested, setQuoteRequested] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchAuthSession()
      .then((s) => {
        if (isMounted) setSession(s);
      })
      .catch(() => {});

    fetchPublicListing(listingId)
      .then((data) => {
        if (isMounted) {
          setListing(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to retrieve listing detail");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  const handleTransactionalCta = (actionName: string) => {
    if (session.status !== "authenticated" || !session.user) {
      setAuthGateAction(actionName);
      setAuthGateOpen(true);
      return;
    }

    setBuyerActionActive(actionName);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteRequested(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35]">
        <PublicHeader onOpenAuthGate={() => setAuthGateOpen(true)} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-pulse">
          <div className="h-6 bg-[#f0ebe0] rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-[#f0ebe0] rounded-2xl" />
            <div className="lg:col-span-5 h-96 bg-[#f0ebe0] rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35]">
        <PublicHeader onOpenAuthGate={() => setAuthGateOpen(true)} />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f4f0e2] text-[#8a9990] mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#173f35]">Product Not Found</h1>
          <p className="mt-2 text-sm text-[#5c6e66]">
            {error || "This listing may have expired, been withdrawn, or is not publicly published."}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="py-2.5 px-6 bg-[#1e5442] hover:bg-[#173f35] text-white text-sm font-semibold rounded-lg shadow-sm inline-block"
            >
              Back to Marketplace
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const activeImage = images[activeImageIndex] || null;
  const humanMaterial = formatMaterialType(listing.materialType);
  const humanForm = formatProductForm(listing.productForm);
  const humanOrigin = formatOriginCountry(listing.originCountry);

  return (
    <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35]">
      {/* Top Header */}
      <PublicHeader
        activeRoute="marketplace"
        onOpenAuthGate={(action) => {
          setAuthGateAction(action || "Platform Access");
          setAuthGateOpen(true);
        }}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-[#f4f0e2] border-b border-[#e4ded0] py-3 text-xs font-medium text-[#5c6e66]">
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2">
          <Link href="/" className="hover:text-[#173f35] hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-[#173f35] hover:underline">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-[#173f35] font-semibold">{humanMaterial}</span>
          <span>/</span>
          <span className="truncate max-w-xs">{listing.title}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Main Grid: Gallery on Left (approx 60%), Commercial Summary on Right (approx 40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Product Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] bg-white rounded-2xl border border-[#ded8c4] overflow-hidden shadow-xs flex items-center justify-center relative group">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-[#8a9990]">
                  <svg className="w-16 h-16 mb-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {humanMaterial} Natural Material
                  </span>
                </div>
              )}

              {/* Status and DPP Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#173f35] text-white rounded-md shadow-xs">
                  {humanMaterial}
                </span>
                {listing.hasDpp && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#e2ede7] text-[#1e5442] rounded-md border border-[#c4ded0] shadow-xs">
                    DPP Traceability
                  </span>
                )}
                {listing.quality.isApproved && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/90 text-[#173f35] rounded-md border border-[#c8c0aa] shadow-xs backdrop-blur-xs">
                    Verified Quality
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail rail with keyboard accessibility */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2" role="tablist" aria-label="Product thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeImageIndex}
                    aria-label={`View photo ${idx + 1}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-[#1e5442] ${
                      idx === activeImageIndex
                        ? "border-[#1e5442] shadow-sm scale-102"
                        : "border-[#ded8c4] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Commercial Card & Hero Summary */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#ded8c4] shadow-xs space-y-6 sticky top-20">
            <div>
              <div className="flex items-center justify-between text-xs text-[#5c6e66] mb-2 font-medium">
                <span className="font-semibold text-[#1e5442] uppercase tracking-wider text-[11px]">{humanForm}</span>
                {listing.harvestYear && <span>Harvest: {listing.harvestYear}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173f35] tracking-tight leading-snug">
                {listing.title}
              </h1>
              <p className="mt-2 text-xs text-[#5c6e66] flex items-center gap-1.5">
                <span>Origin:</span>
                <strong className="text-[#173f35] font-semibold">{humanOrigin}</strong>
                {listing.site?.city ? <span className="text-[#6d7e76]">({listing.site.city})</span> : null}
              </p>
            </div>

            {/* Commercial Parameters */}
            <div className="bg-[#faf8f1] p-5 rounded-xl border border-[#e4ded0] grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-[#6d7e76] font-medium mb-1">Available Volume</span>
                <span className="text-xl font-bold text-[#173f35]">
                  {formatQuantity(listing.quantity, listing.quantityUnit)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-[#6d7e76] font-medium mb-1">Indicative Price</span>
                {listing.priceAmount !== null ? (
                  <span className="text-xl font-extrabold text-[#1e5442]">
                    €{listing.priceAmount.toLocaleString()}
                    <span className="text-xs font-normal text-[#5c6e66] ml-1">
                      {formatPriceUnit(listing.priceUnit)}
                    </span>
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-[#5c6e66]">Price on Request</span>
                )}
              </div>
            </div>

            {/* Supplier Verification Indicator (Strict Neutrality - No bank or private contact leak) */}
            <div className="flex items-center space-x-3 p-3.5 bg-[#f4f0e2] rounded-xl border border-[#ded8c4]">
              <div className="w-8 h-8 rounded-full bg-[#1e5442] text-white flex items-center justify-center font-bold text-xs shrink-0">
                ✓
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#173f35] block">
                  {listing.supplier.isVerified ? "Verified Producer Organisation" : "Registered Producer"}
                </span>
                <span className="text-[#5c6e66]">
                  Traceable trade facilitated through the I Do Grow commodity platform
                </span>
              </div>
            </div>

            {/* Transactional CTAs */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleTransactionalCta("Request a Quote")}
                className="w-full py-3.5 px-6 bg-[#1e5442] hover:bg-[#173f35] text-white text-sm font-bold rounded-xl shadow-xs transition-colors focus:ring-2 focus:ring-[#2e6b56] focus:outline-none flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Request a Quote</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransactionalCta("Start Buying")}
                className="w-full py-2.5 px-6 border border-[#c8c0aa] bg-white hover:bg-[#faf8f1] text-[#173f35] text-xs font-bold rounded-xl transition-colors focus:ring-2 focus:ring-[#1e5442] focus:outline-none flex items-center justify-center space-x-2"
              >
                <span>Start Buying</span>
              </button>

              {session.status !== "authenticated" && (
                <p className="text-[11px] text-center text-[#6d7e76] pt-1">
                  Anonymous discovery is free. A Buyer account is required to negotiate and execute purchase contracts.
                </p>
              )}
            </div>

            {/* Authenticated Buyer RFQ Form State */}
            {buyerActionActive && (
              <div className="mt-4 p-4 rounded-xl border border-[#c4ded0] bg-[#eef6f2]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e5442] mb-2">
                  {buyerActionActive} — Buyer Desk
                </h4>
                {quoteRequested ? (
                  <div className="text-xs text-[#1e5442] font-medium space-y-1">
                    <p className="font-bold">✓ Quote Request Registered</p>
                    <p>
                      Your trade interest for {formatQuantity(listing.quantity, listing.quantityUnit)} of {listing.title} has been logged.
                      Our commodities desk will match your inquiry.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleQuoteSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                        Target Volume ({formatQuantity(2, listing.quantityUnit).replace(/^2\s/, "")})
                      </label>
                      <input
                        type="number"
                        defaultValue={Math.min(25, listing.quantity)}
                        max={listing.quantity}
                        min={1}
                        className="w-full px-3 py-1.5 bg-white border border-[#c8c0aa] rounded text-xs text-[#173f35]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#173f35] mb-1">
                        Delivery Destination / Incoterm
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FCA Troyes or DAP Rotterdam"
                        className="w-full px-3 py-1.5 bg-white border border-[#c8c0aa] rounded text-xs text-[#173f35]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#1e5442] text-white text-xs font-bold rounded-lg hover:bg-[#173f35]"
                    >
                      Confirm Quote Request
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Structured Technical Specifications & Details (Clean two-column rows) */}
        <div className="mt-12 bg-white rounded-2xl border border-[#ded8c4] p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-[#173f35] mb-6 pb-3 border-b border-[#f0ebe0]">
            Technical Specifications & Compliance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs">
            <div className="flex justify-between py-2 border-b border-[#f4f0e2]">
              <span className="text-[#6d7e76] font-medium">Material Classification</span>
              <span className="font-bold text-[#173f35]">{humanMaterial}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f4f0e2]">
              <span className="text-[#6d7e76] font-medium">Product Processing Form</span>
              <span className="font-bold text-[#173f35]">{humanForm}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f4f0e2]">
              <span className="text-[#6d7e76] font-medium">Origin Country</span>
              <span className="font-bold text-[#173f35]">{humanOrigin}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f4f0e2]">
              <span className="text-[#6d7e76] font-medium">Harvest Campaign</span>
              <span className="font-bold text-[#173f35]">{listing.harvestYear ? String(listing.harvestYear) : "Not recorded"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f4f0e2]">
              <span className="text-[#6d7e76] font-medium">Quality Inspection Status</span>
              <span className="font-bold text-[#1e5442]">
                {listing.quality.isApproved ? "Inspected & Approved" : "Self-Declared / Pending Inspection"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f4f0e2]">
              <span className="text-[#6d7e76] font-medium">Digital Product Passport</span>
              <span className="font-bold text-[#1e5442]">
                {listing.hasDpp ? `Available (${listing.dppNumber || "Issued"})` : "Initiates upon contract"}
              </span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="mt-6 pt-6 border-t border-[#f0ebe0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6d7e76] mb-2">
                Producer Notes & Lot Description
              </h3>
              <p className="text-xs text-[#3b5449] leading-relaxed max-w-3xl">
                {listing.description}
              </p>
            </div>
          )}

          {/* Certifications badges */}
          {listing.certifications && listing.certifications.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#f0ebe0]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6d7e76] mb-3">
                Verified Certifications & Standards
              </h3>
              <div className="flex flex-wrap gap-2">
                {listing.certifications.map((c) => (
                  <span
                    key={c.documentType}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#1e5442] border border-[#cbe6d7]"
                  >
                    <span>✓</span>
                    <span>{formatCertification(c.documentType)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Materials Section */}
        {listing.relatedListings && listing.relatedListings.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#e4ded0]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#173f35]">
                Similar {humanMaterial} Lots
              </h3>
              <Link href="/marketplace" className="text-xs font-bold text-[#1e5442] hover:underline">
                View all available materials &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listing.relatedListings.map((related) => (
                <PublicProductCard key={related.id} listing={related} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <PublicFooter />

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        actionName={authGateAction}
        returnTo={`/marketplace/${listing.id}?action=request-quote`}
      />
    </div>
  );
}
