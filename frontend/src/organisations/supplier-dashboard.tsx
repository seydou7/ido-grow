"use client";

import { MatchingWorkspaceView, TraderCockpitView, TraderSuppliersView, TraderBuyersView } from "../matching";
import { BuyerQuotesView } from "../quotes";
import { TraderTradesView } from "../trades";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthenticatedAppShell, type NavSection } from "./app-shell";
import {
  createOrganisation,
  createSite,
  getComplianceDocumentDownloadUrl,
  getOrganisationProfile,
  getSelfMemberships,
  listComplianceDocuments,
  listOrganisationMembers,
  updateOrganisationProfile,
  updateSite,
  uploadComplianceDocument,
} from "./api";
import type {
  ComplianceDocumentSummary,
  CreateOrganisationInput,
  CreateSiteInput,
  OrganisationMemberSummary,
  OrganisationProfile,
  SiteSummary,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";
import {
  createListing,
  listListings,
  updateListing,
} from "../listings/api";
import {
  MarketplaceCatalogue,
  MarketplaceListingDetailView,
} from "../marketplace";
import {
  BuyerBuyOrdersView,
  TraderDemandOverview,
} from "../buy-orders";
import {
  APPROVED_MATERIAL_TYPES,
  APPROVED_PRICE_UNITS,
  APPROVED_PRODUCT_FORMS,
  APPROVED_QUANTITY_UNITS,
  type CreateListingInput,
  type ListingStatus,
  type ListingSummary,
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  PRICE_UNIT_LABELS,
  type PriceUnit,
  PRODUCT_FORM_LABELS,
  type ProductForm,
  QUANTITY_UNIT_LABELS,
  type QuantityUnit,
} from "../listings/contracts";

type SupplierDashboardProps = Readonly<{
  userEmail: string;
  onLogout: () => void;
  isLoggingOut: boolean;
}>;

function Building2Icon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect width="20" height="16" x="2" y="4" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SproutSmallIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M7 20h10M12 20v-8M12 12a5 5 0 0 1 5-5h2a5 5 0 0 1-5 5M12 12a5 5 0 0 0-5-5H5a5 5 0 0 0 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadCloudIcon({ className = "h-5 w-5" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  COMPANY_REGISTRATION: "Company Registration (KVK / SIRET / Registry)",
  TAX_CERTIFICATE: "Tax & VAT Registration Certificate",
  ORGANIC_CERTIFICATION: "Organic Farming Certificate (EU Organic, etc.)",
  QUALITY_CERTIFICATE: "Quality & Agricultural Standard (GlobalGAP, ISO)",
  FARM_OWNERSHIP_LEASE: "Land Deed / Parcel Lease Agreement",
  OTHER_COMPLIANCE: "Other Supporting Compliance Document",
};

export function SupplierDashboard({
  userEmail,
  onLogout,
  isLoggingOut,
}: SupplierDashboardProps) {
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<OrganisationProfile | null>(null);
  const [documents, setDocuments] = useState<ComplianceDocumentSummary[]>([]);
  const [members, setMembers] = useState<OrganisationMemberSummary[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [isAddingListing, setIsAddingListing] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [selectedMaterialFilter, setSelectedMaterialFilter] =
    useState<string>("ALL");
  const [cockpitMatchingOrderId, setCockpitMatchingOrderId] = useState<string | null>(null);
  const [selectedTraderSupplierId, setSelectedTraderSupplierId] = useState<string | null>(null);
  const [selectedTraderBuyerId, setSelectedTraderBuyerId] = useState<string | null>(null);
  const [selectedMarketplaceListingId, setSelectedMarketplaceListingId] =
    useState<string | null>(null);

  // Document upload state
  const [selectedDocType, setSelectedDocType] = useState("COMPANY_REGISTRATION");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { isSubmitting: isSavingProfile },
  } = useForm<UpdateOrganisationProfileInput>();

  const {
    register: regNewOrg,
    handleSubmit: handleNewOrgSubmit,
    formState: { isSubmitting: isCreatingOrg },
  } = useForm<CreateOrganisationInput>();

  const {
    register: regSite,
    handleSubmit: handleSiteSubmit,
    reset: resetSiteForm,
    formState: { isSubmitting: isSavingSite },
  } = useForm<CreateSiteInput>();

  const {
    register: regListing,
    handleSubmit: handleListingSubmit,
    reset: resetListingForm,
    formState: { isSubmitting: isSavingListing },
  } = useForm<CreateListingInput>();

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const memberships = await getSelfMemberships();
        if (!isMounted) return;
        if (memberships.items.length > 0) {
          const first = memberships.items[0];
          setOrgId(first.organisation.id);
          const fullProfile = await getOrganisationProfile(first.organisation.id);
          if (!isMounted) return;
          setProfile(fullProfile);
          const docCollection = await listComplianceDocuments(first.organisation.id);
          if (!isMounted) return;
          setDocuments([...docCollection.items]);
          const memberCollection = await listOrganisationMembers(first.organisation.id);
          if (!isMounted) return;
          setMembers([...memberCollection.items]);
          if (first.organisation.organisationType === "SUPPLIER") {
            const listingCollection = await listListings(first.organisation.id);
            if (!isMounted) return;
            setListings([...listingCollection.items]);
          }
          if (first.organisation.organisationType === "BUYER") {
            setActiveSection("marketplace");
          } else if (first.organisation.organisationType === "TRADER") {
            setActiveSection("trader-cockpit");
          }
          resetProfileForm({
            name: fullProfile.name,
            legalName: fullProfile.legalName,
            businessType: fullProfile.businessType,
            registrationNumber: fullProfile.registrationNumber,
            vatNumber: fullProfile.vatNumber,
            address: fullProfile.address,
            city: fullProfile.city,
            postalCode: fullProfile.postalCode,
            country: fullProfile.country,
            contactName: fullProfile.contactName,
            contactEmail: fullProfile.contactEmail,
            contactPhone: fullProfile.contactPhone,
          });
        } else {
          setProfile(null);
          setDocuments([]);
          setMembers([]);
          setListings([]);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load supplier organisation.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [resetProfileForm]);

  async function onSaveProfile(data: UpdateOrganisationProfileInput) {
    if (!orgId) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updated = await updateOrganisationProfile(orgId, data);
      setProfile(updated);
      setIsEditingProfile(false);
      setSuccessMessage("Organisation profile updated successfully.");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    }
  }

  async function onCreateOrg(data: CreateOrganisationInput) {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const created = await createOrganisation(data);
      setOrgId(created.id);
      setProfile(created);
      setSuccessMessage("Organisation registered successfully.");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to register organisation.",
      );
    }
  }

  async function onSaveSite(data: CreateSiteInput) {
    if (!orgId) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (editingSiteId) {
        await updateSite(orgId, editingSiteId, data as UpdateSiteInput);
        setSuccessMessage("Production site updated successfully.");
      } else {
        await createSite(orgId, data);
        setSuccessMessage("Production site added successfully.");
      }
      setIsAddingSite(false);
      setEditingSiteId(null);
      resetSiteForm({});
      const updatedProfile = await getOrganisationProfile(orgId);
      setProfile(updatedProfile);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save production site.",
      );
    }
  }

  async function onUploadDocumentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !selectedFile) return;
    setIsUploadingDoc(true);
    setDocUploadError(null);
    setSuccessMessage(null);
    try {
      await uploadComplianceDocument(orgId, selectedDocType, selectedFile);
      setSelectedFile(null);
      setSuccessMessage("Compliance document uploaded successfully.");
      const updatedDocs = await listComplianceDocuments(orgId);
      setDocuments([...updatedDocs.items]);
      const updatedProfile = await getOrganisationProfile(orgId);
      setProfile(updatedProfile);
    } catch (err: unknown) {
      setDocUploadError(
        err instanceof Error ? err.message : "Failed to upload compliance document.",
      );
    } finally {
      setIsUploadingDoc(false);
    }
  }

  function startEditSite(site: SiteSummary) {
    setEditingSiteId(site.id);
    resetSiteForm({
      name: site.name,
      facilityType: site.facilityType,
      address: site.address,
      city: site.city,
      postalCode: site.postalCode,
      country: site.country,
      latitude: site.latitude,
      longitude: site.longitude,
      landAreaHectares: site.landAreaHectares,
    });
    setIsAddingSite(true);
  }

  async function onSaveListing(data: CreateListingInput) {
    if (!orgId) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const payload: CreateListingInput = {
        title: data.title,
        description: data.description || null,
        materialType: data.materialType,
        productForm: data.productForm || null,
        quantity: Number(data.quantity),
        quantityUnit: data.quantityUnit || "TONNES",
        priceAmount:
          data.priceAmount !== undefined &&
          data.priceAmount !== null &&
          String(data.priceAmount).trim() !== ""
            ? Number(data.priceAmount)
            : null,
        priceUnit: data.priceUnit || "PER_TONNE",
        currency: "EUR",
        originCountry: data.originCountry || null,
        harvestYear: data.harvestYear ? Number(data.harvestYear) : null,
        siteId: data.siteId && data.siteId !== "" ? data.siteId : null,
        status: data.status || "DRAFT",
      };

      if (editingListingId) {
        const updated = await updateListing(orgId, editingListingId, payload);
        setListings((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l)),
        );
        setSuccessMessage("Product listing updated successfully.");
      } else {
        const created = await createListing(orgId, payload);
        setListings((prev) => [created, ...prev]);
        setSuccessMessage("Product listing created successfully.");
      }
      setIsAddingListing(false);
      setEditingListingId(null);
      resetListingForm({});
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save product listing.",
      );
    }
  }

  async function toggleListingStatus(listing: ListingSummary) {
    if (!orgId) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const nextStatus =
        listing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const updated = await updateListing(orgId, listing.id, {
        status: nextStatus,
      });
      setListings((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l)),
      );
      setSuccessMessage(
        `Listing "${listing.title}" is now ${nextStatus.toLowerCase()}.`,
      );
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update listing status.",
      );
    }
  }

  function startEditListing(listing: ListingSummary) {
    setEditingListingId(listing.id);
    resetListingForm({
      title: listing.title,
      description: listing.description ?? "",
      materialType: listing.materialType as MaterialType,
      productForm: (listing.productForm || undefined) as ProductForm | undefined,
      quantity: listing.quantity,
      quantityUnit: (listing.quantityUnit || "TONNES") as QuantityUnit,
      priceAmount: listing.priceAmount ?? undefined,
      priceUnit: (listing.priceUnit || "PER_TONNE") as PriceUnit,
      originCountry: listing.originCountry ?? "",
      harvestYear: listing.harvestYear ?? undefined,
      siteId: listing.siteId ?? "",
      status: (listing.status || "DRAFT") as ListingStatus,
    });
    setIsAddingListing(true);
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf8f1]">
        <div className="flex items-center gap-3 text-sm font-medium text-[#245347]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#173f35] border-t-transparent" />
          <span>Loading Supplier Portal...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#faf8f1] p-6 sm:p-12">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#e2dccd] bg-white p-8 shadow-xs">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#173f35] text-[#e5b84b]">
              <Building2Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#173f35]">Register Your Organisation</h2>
              <p className="text-xs text-[#52635c]">
                Join I Do Grow as a verified natural fibre supplier
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleNewOrgSubmit(onCreateOrg)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#203e35]" htmlFor="reg-name">
                Organisation / Commercial Name *
              </label>
              <input
                id="reg-name"
                {...regNewOrg("name", { required: true })}
                placeholder="e.g. Green Fields Hemp Cooperative"
                className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 py-2 text-sm text-[#173f35] placeholder:text-[#9e9686] focus:border-[#173f35] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#203e35]" htmlFor="reg-legalName">
                Legal Entity Name
              </label>
              <input
                id="reg-legalName"
                {...regNewOrg("legalName")}
                placeholder="e.g. Green Fields Agricultural Coop BV"
                className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 py-2 text-sm text-[#173f35] placeholder:text-[#9e9686] focus:border-[#173f35] focus:outline-hidden"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#203e35]" htmlFor="reg-businessType">
                  Business Activity
                </label>
                <select
                  id="reg-businessType"
                  {...regNewOrg("businessType")}
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                >
                  <option value="farmer">Farmer / Grower</option>
                  <option value="cooperative">Producer Cooperative</option>
                  <option value="processor">Primary Processor</option>
                  <option value="trader">Agricultural Trader</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#203e35]" htmlFor="reg-country">
                  Country
                </label>
                <input
                  id="reg-country"
                  {...regNewOrg("country")}
                  placeholder="e.g. Netherlands"
                  className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 py-2 text-sm text-[#173f35] placeholder:text-[#9e9686] focus:border-[#173f35] focus:outline-hidden"
                />
              </div>
            </div>

            <button
              disabled={isCreatingOrg}
              type="submit"
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#173f35] py-2.5 text-sm font-semibold text-[#fffaf0] transition-colors hover:bg-[#204e42] disabled:opacity-50"
            >
              {isCreatingOrg ? "Creating Organisation..." : "Register Organisation"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedAppShell
      activeSection={activeSection}
      onSelectSection={(section) => {
        setSelectedMarketplaceListingId(null);
        setActiveSection(section);
      }}
      userEmail={userEmail}
      organisationType={profile.organisationType}
      companyName={profile.name}
      verificationStatus={profile.verificationStatus}
      onLogout={onLogout}
      isLoggingOut={isLoggingOut}
    >
      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 shadow-2xs">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800 shadow-2xs">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-900"
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Organisation Header & Progress Overview (Supplier Only) */}
      {profile && profile.organisationType !== "BUYER" &&
        activeSection !== "marketplace" &&
        activeSection !== "buy-orders" &&
        activeSection !== "trader-demand" &&
        activeSection !== "trader-cockpit" &&
        activeSection !== "trader-suppliers" &&
        activeSection !== "trader-buyers" &&
        activeSection !== "trader-trades" &&
        activeSection !== "buyer-quotes" && (
        <div className="mb-8 rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[#173f35] sm:text-2xl">
                {profile.name}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  profile.verificationStatus === "VERIFIED"
                    ? "bg-[#e2f3ea] text-[#1b6b47]"
                    : profile.verificationStatus === "UNDER_REVIEW"
                    ? "bg-[#eaf1fb] text-[#1e58a9]"
                    : "bg-[#fef4dd] text-[#875908]"
                }`}
              >
                {profile.verificationStatus === "PENDING"
                  ? "Pending Verification"
                  : profile.verificationStatus}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#52635c]">
              {profile.legalName || "Legal name not set"} • {profile.businessType || "Supplier"} •{" "}
              {profile.country || "Location not set"}
            </p>
          </div>

          {/* Compact Completeness Progress */}
          <div className="w-full rounded-xl bg-[#faf8f1] p-3.5 sm:w-72">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#203e35]">Profile Readiness</span>
              <span className="font-bold text-[#173f35]">{profile.completenessPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8e2d2]">
              <div
                className="h-full rounded-full bg-[#173f35] transition-all duration-500"
                style={{ width: `${profile.completenessPercent}%` }}
              />
            </div>
            {profile.missingFields.length > 0 && (
              <p className="mt-1.5 truncate text-[11px] text-[#718079]">
                Missing: {profile.missingFields.slice(0, 2).join(", ")}
                {profile.missingFields.length > 2 && ` +${profile.missingFields.length - 2} more`}
              </p>
            )}
          </div>
        </div>
      </div>
      )}

      {/* VIEW 0: ONBOARDING OVERVIEW & READINESS CHECKLIST */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e2dccd] pb-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#173f35]">
                Supplier Onboarding & Readiness
              </h2>
              <p className="text-xs text-[#52635c]">
                Complete your organisation profile, production sites, and compliance evidence.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#173f35]/10 px-3 py-1 text-xs font-semibold text-[#173f35]">
                <span className="h-2 w-2 rounded-full bg-[#173f35]" />
                {profile.completenessPercent}% Complete
              </span>
            </div>
          </div>

          {/* 4 Step Cards Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Step 1: Organisation Profile */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2dccd] bg-[#faf8f1] text-[#173f35]">
                    <Building2Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-[#718079]">Step 1</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#173f35]">
                  Organisation Profile
                </h3>
                <p className="mt-1 text-xs text-[#52635c]">
                  Company registration, VAT number, legal entity details, physical address, and contact information.
                </p>
                <div className="mt-4 space-y-1.5 border-t border-[#f0ece1] pt-3 text-xs">
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Legal Entity:</span>
                    <span className="font-semibold text-[#173f35]">{profile.legalName || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Registration (KVK/SIRET):</span>
                    <span className="font-semibold text-[#173f35]">{profile.registrationNumber || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Location:</span>
                    <span className="font-semibold text-[#173f35]">{profile.country || "Not set"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[#f0ece1] pt-4">
                <button
                  onClick={() => {
                    setActiveSection("organisation");
                    setIsEditingProfile(true);
                  }}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173f35] py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#204e42]"
                >
                  <span>Edit Organisation Profile</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Step 2: Production Sites */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2dccd] bg-[#faf8f1] text-[#173f35]">
                    <SproutSmallIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-[#718079]">Step 2</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#173f35]">
                  Production Sites & Facilities
                </h3>
                <p className="mt-1 text-xs text-[#52635c]">
                  Agricultural land parcels, cultivation farms, and processing facilities.
                </p>
                <div className="mt-4 space-y-1.5 border-t border-[#f0ece1] pt-3 text-xs">
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Registered Sites:</span>
                    <span className="font-semibold text-[#173f35]">
                      {profile.sites.length} {profile.sites.length === 1 ? "site" : "sites"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Status:</span>
                    <span className={`font-semibold ${profile.sites.length > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                      {profile.sites.length > 0 ? "Configured" : "Site registration needed"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[#f0ece1] pt-4">
                <button
                  onClick={() => {
                    setActiveSection("sites");
                  }}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173f35] py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#204e42]"
                >
                  <span>Manage Production Sites</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Step 3: Compliance & Documents */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2dccd] bg-[#faf8f1] text-[#173f35]">
                    <DownloadIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-[#718079]">Step 3</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#173f35]">
                  Compliance & Verification Documents
                </h3>
                <p className="mt-1 text-xs text-[#52635c]">
                  Company registration certificate, tax/VAT records, organic certifications, and land deeds.
                </p>
                <div className="mt-4 space-y-1.5 border-t border-[#f0ece1] pt-3 text-xs">
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Uploaded Documents:</span>
                    <span className="font-semibold text-[#173f35]">
                      {documents.length} {documents.length === 1 ? "document" : "documents"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Status:</span>
                    <span className={`font-semibold ${documents.length > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                      {documents.length > 0 ? "Evidence submitted" : "Document upload needed"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[#f0ece1] pt-4">
                <button
                  onClick={() => {
                    setActiveSection("compliance");
                  }}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173f35] py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#204e42]"
                >
                  <span>Upload Documents</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Step 4: Team & Members */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2dccd] bg-[#faf8f1] text-[#173f35]">
                    <Building2Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-[#718079]">Step 4</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#173f35]">
                  Team & Organisation Members
                </h3>
                <p className="mt-1 text-xs text-[#52635c]">
                  Associated users with access to manage this organisation context.
                </p>
                <div className="mt-4 space-y-1.5 border-t border-[#f0ece1] pt-3 text-xs">
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Active Team:</span>
                    <span className="font-semibold text-[#173f35]">
                      {members.length} {members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#52635c]">
                    <span>Primary User:</span>
                    <span className="truncate font-semibold text-[#173f35]">{userEmail}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[#f0ece1] pt-4">
                <button
                  onClick={() => {
                    setActiveSection("members");
                  }}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173f35] py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#204e42]"
                >
                  <span>View Team Members</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: ORGANISATION PROFILE */}
      {activeSection === "organisation" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main 2/3 Column: General Information Card */}
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs lg:col-span-2">
            <div className="mb-6 flex items-center justify-between border-b border-[#f0ece1] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#173f35]">General Information</h2>
                <p className="text-xs text-[#6e7d77]">Official legal registry & business details</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                type="button"
                className="rounded-lg border border-[#d4cdbc] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] transition-colors hover:bg-[#faf8f1]"
              >
                {isEditingProfile ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-name">
                      Commercial Name *
                    </label>
                    <input
                      id="edit-name"
                      {...regProfile("name", { required: true })}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-legalName">
                      Legal Entity Name
                    </label>
                    <input
                      id="edit-legalName"
                      {...regProfile("legalName")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-businessType">
                      Business Activity
                    </label>
                    <select
                      id="edit-businessType"
                      {...regProfile("businessType")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    >
                      <option value="farmer">Farmer / Grower</option>
                      <option value="cooperative">Producer Cooperative</option>
                      <option value="processor">Primary Processor</option>
                      <option value="trader">Agricultural Trader</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-regNum">
                      Registration (KVK/SIRET)
                    </label>
                    <input
                      id="edit-regNum"
                      {...regProfile("registrationNumber")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-vat">
                      VAT Number
                    </label>
                    <input
                      id="edit-vat"
                      {...regProfile("vatNumber")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-address">
                    Physical Address
                  </label>
                  <input
                    id="edit-address"
                    {...regProfile("address")}
                    className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-city">
                      City
                    </label>
                    <input
                      id="edit-city"
                      {...regProfile("city")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-postal">
                      Postal Code
                    </label>
                    <input
                      id="edit-postal"
                      {...regProfile("postalCode")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-country">
                      Country
                    </label>
                    <input
                      id="edit-country"
                      {...regProfile("country")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-cName">
                      Primary Contact Name
                    </label>
                    <input
                      id="edit-cName"
                      {...regProfile("contactName")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-cEmail">
                      Contact Email
                    </label>
                    <input
                      id="edit-cEmail"
                      {...regProfile("contactEmail")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="edit-cPhone">
                      Contact Phone
                    </label>
                    <input
                      id="edit-cPhone"
                      {...regProfile("contactPhone")}
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    type="button"
                    className="rounded-lg border border-[#d4cdbc] px-4 py-2 text-xs font-semibold text-[#455750] hover:bg-[#faf8f1]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSavingProfile}
                    type="submit"
                    className="rounded-lg bg-[#173f35] px-5 py-2 text-xs font-semibold text-[#fffaf0] transition-colors hover:bg-[#204e42] disabled:opacity-50"
                  >
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">
                    Commercial Name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#173f35]">{profile.name}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">
                    Legal Entity
                  </p>
                  <p className="mt-1 text-sm text-[#203e35]">{profile.legalName || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">
                    Business Activity
                  </p>
                  <p className="mt-1 text-sm capitalize text-[#203e35]">{profile.businessType || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">
                    Registration Number (KVK)
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#203e35]">
                    {profile.registrationNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">
                    VAT Number
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#203e35]">{profile.vatNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">
                    Location / Address
                  </p>
                  <p className="mt-1 text-sm text-[#203e35]">
                    {[profile.address, profile.city, profile.country].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 1/3 Side Column: "At a Glance" Card */}
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
            <h3 className="mb-4 border-b border-[#f0ece1] pb-3 text-sm font-bold text-[#173f35]">
              At a Glance
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#faf8f1] text-[#245347]">
                  <Building2Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">
                    Contact Person
                  </p>
                  <p className="text-xs font-semibold text-[#173f35]">
                    {profile.contactName || "No contact specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#faf8f1] text-[#245347]">
                  <MailIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">Email</p>
                  <p className="truncate text-xs font-medium text-[#203e35]">
                    {profile.contactEmail || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#faf8f1] text-[#245347]">
                  <PhoneIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">Phone</p>
                  <p className="text-xs font-medium text-[#203e35]">{profile.contactPhone || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#faf8f1] text-[#245347]">
                  <SproutSmallIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b9993]">
                    Registered Sites
                  </p>
                  <p className="text-xs font-semibold text-[#173f35]">
                    {profile.sites.length} {profile.sites.length === 1 ? "Site" : "Sites"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PRODUCTION SITES */}
      {activeSection === "sites" && (
        <div>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#173f35]">Production Sites</h2>
              <p className="text-xs text-[#6e7d77]">
                Manage agricultural parcels, drying facilities, and storage hubs
              </p>
            </div>
            <button
              onClick={() => {
                setEditingSiteId(null);
                resetSiteForm({});
                setIsAddingSite(true);
              }}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-[#fffaf0] transition-colors hover:bg-[#204e42]"
            >
              <span>+ Add Production Site</span>
            </button>
          </div>

          {/* Site Cards Grid */}
          {profile.sites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d4cdbc] bg-white p-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#faf8f1] text-[#245347]">
                <SproutSmallIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-[#173f35]">No Production Sites Added</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-[#6e7d77]">
                Add your farms, retting fields, or warehouses to enable full traceability.
              </p>
              <button
                onClick={() => setIsAddingSite(true)}
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#173f35] px-4 py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#204e42]"
              >
                + Add First Site
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profile.sites.map((site) => (
                <div
                  key={site.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-md bg-[#faf8f1] px-2 py-0.5 text-[11px] font-semibold text-[#245347] capitalize">
                        {site.facilityType?.replace("_", " ") || "Farm"}
                      </span>
                      {site.landAreaHectares && (
                        <span className="text-xs font-bold text-[#173f35]">
                          {site.landAreaHectares} ha
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#173f35]">{site.name}</h3>
                    <p className="mt-1 text-xs text-[#6e7d77]">
                      {[site.address, site.city, site.country].filter(Boolean).join(", ") ||
                        "No address provided"}
                    </p>
                    {site.latitude && site.longitude && (
                      <p className="mt-2 font-mono text-[11px] text-[#8b9993]">
                        GPS: {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 border-t border-[#f0ece1] pt-3">
                    <button
                      onClick={() => startEditSite(site)}
                      type="button"
                      className="text-xs font-semibold text-[#173f35] hover:underline"
                    >
                      Edit Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit Site Modal */}
          {isAddingSite && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between border-b border-[#f0ece1] pb-3">
                  <h3 className="text-base font-bold text-[#173f35]">
                    {editingSiteId ? "Edit Production Site" : "Add Production Site"}
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddingSite(false);
                      setEditingSiteId(null);
                    }}
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSiteSubmit(onSaveSite)} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-name">
                      Site Name *
                    </label>
                    <input
                      id="site-name"
                      {...regSite("name", { required: true })}
                      placeholder="e.g. North Retting Field"
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-type">
                        Facility Type
                      </label>
                      <select
                        id="site-type"
                        {...regSite("facilityType")}
                        className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      >
                        <option value="farm">Farm / Parcel</option>
                        <option value="processing_facility">Processing Facility</option>
                        <option value="storage_hub">Storage Hub</option>
                        <option value="warehouse">Warehouse</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-area">
                        Land Area (Hectares)
                      </label>
                      <input
                        id="site-area"
                        type="number"
                        step="0.1"
                        {...regSite("landAreaHectares", { valueAsNumber: true })}
                        placeholder="e.g. 75.5"
                        className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-addr">
                      Address
                    </label>
                    <input
                      id="site-addr"
                      {...regSite("address")}
                      placeholder="e.g. Rural Route 10"
                      className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-city">
                        City
                      </label>
                      <input
                        id="site-city"
                        {...regSite("city")}
                        className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-postal">
                        Postal Code
                      </label>
                      <input
                        id="site-postal"
                        {...regSite("postalCode")}
                        className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-country">
                        Country
                      </label>
                      <input
                        id="site-country"
                        {...regSite("country")}
                        className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-lat">
                        Latitude
                      </label>
                      <input
                        id="site-lat"
                        type="number"
                        step="0.0001"
                        {...regSite("latitude", { valueAsNumber: true })}
                        placeholder="52.3676"
                        className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#203e35]" htmlFor="site-lng">
                        Longitude
                      </label>
                      <input
                        id="site-lng"
                        type="number"
                        step="0.0001"
                        {...regSite("longitude", { valueAsNumber: true })}
                        placeholder="4.9041"
                        className="mt-1 w-full rounded-lg border border-[#d4cdbc] px-3 py-2 text-sm text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setIsAddingSite(false);
                        setEditingSiteId(null);
                      }}
                      type="button"
                      className="rounded-lg border border-[#d4cdbc] px-4 py-2 text-xs font-semibold text-[#455750] hover:bg-[#faf8f1]"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSavingSite}
                      type="submit"
                      className="rounded-lg bg-[#173f35] px-5 py-2 text-xs font-semibold text-[#fffaf0] transition-colors hover:bg-[#204e42] disabled:opacity-50"
                    >
                      {isSavingSite ? "Saving..." : "Save Site"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: COMPLIANCE & DOCUMENTS */}
      {activeSection === "compliance" && (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-[#173f35]">Compliance & Verification Documents</h2>
            <p className="text-xs text-[#6e7d77]">
              Upload company registration extract, VAT certificates, and agricultural certifications
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* 1/3 Upload Card */}
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
              <h3 className="mb-3 text-sm font-bold text-[#173f35]">Upload Evidence</h3>
              <p className="mb-4 text-xs text-[#6e7d77]">
                Accepted formats: PDF, JPG, PNG (max 10MB per file).
              </p>

              {docUploadError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  {docUploadError}
                </div>
              )}

              <form onSubmit={onUploadDocumentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#203e35]" htmlFor="doc-category">
                    Document Category *
                  </label>
                  <select
                    id="doc-category"
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                  >
                    <option value="COMPANY_REGISTRATION">Company Registration (KVK/SIRET)</option>
                    <option value="TAX_CERTIFICATE">Tax & VAT Registration</option>
                    <option value="ORGANIC_CERTIFICATION">Organic Farming Certificate</option>
                    <option value="QUALITY_CERTIFICATE">Quality / Agricultural Standard</option>
                    <option value="FARM_OWNERSHIP_LEASE">Land Deed / Lease Contract</option>
                    <option value="OTHER_COMPLIANCE">Other Compliance Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#203e35]" htmlFor="file-input">
                    File Attachment *
                  </label>
                  <div className="mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d4cdbc] bg-[#faf8f1] p-5 text-center transition-colors hover:border-[#173f35]">
                    <UploadCloudIcon className="h-7 w-7 text-[#245347]" />
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="mt-2 block w-full text-xs text-[#52635c] file:mr-2 file:rounded-md file:border-0 file:bg-[#173f35] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-[#204e42]"
                    />
                    {selectedFile && (
                      <p className="mt-2 text-xs font-semibold text-[#173f35]">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                </div>

                <button
                  disabled={!selectedFile || isUploadingDoc}
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#173f35] py-2.5 text-xs font-semibold text-[#fffaf0] transition-colors hover:bg-[#204e42] disabled:opacity-50"
                >
                  <UploadCloudIcon className="h-4 w-4" />
                  <span>{isUploadingDoc ? "Uploading..." : "Upload Document"}</span>
                </button>
              </form>
            </div>

            {/* 2/3 List of Uploaded Documents */}
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs lg:col-span-2">
              <div className="mb-4 flex items-center justify-between border-b border-[#f0ece1] pb-3">
                <h3 className="text-sm font-bold text-[#173f35]">
                  Submitted Documents ({documents.length})
                </h3>
              </div>

              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d4cdbc] p-8 text-center">
                  <p className="text-xs text-[#6e7d77]">
                    No compliance documents uploaded yet. Upload required evidence on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-[#e8e2d2] bg-[#faf8f1] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-[#245347] px-2 py-0.5 text-[10px] font-bold text-[#e5b84b]">
                            {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                          </span>
                          <span className="rounded-md bg-[#fef4dd] px-2 py-0.5 text-[10px] font-semibold text-[#875908]">
                            {doc.status === "PENDING_REVIEW" ? "Pending Review" : doc.status}
                          </span>
                        </div>
                        <p className="mt-1.5 truncate text-xs font-bold text-[#173f35]">
                          {doc.originalFilename}
                        </p>
                        <p className="text-[11px] text-[#718079]">
                          Size: {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded:{" "}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {orgId && (
                          <a
                            href={getComplianceDocumentDownloadUrl(orgId, doc.id)}
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4cdbc] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#eee9dc]"
                          >
                            <DownloadIcon className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Team & Members */}
      {activeSection === "members" && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e2dccd] pb-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#173f35]">
                Team & Organisation Members
              </h2>
              <p className="text-xs text-[#52635c]">
                Authenticated users associated with {profile.name}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#173f35]/10 px-3 py-1 text-xs font-semibold text-[#173f35]">
                {members.length} {members.length === 1 ? "Member" : "Members"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs">
            <div className="mb-4 flex items-center justify-between border-b border-[#f0ece1] pb-3">
              <h3 className="text-sm font-bold text-[#173f35]">
                Organisation Members
              </h3>
            </div>

            {members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d4cdbc] p-8 text-center">
                <p className="text-xs text-[#6e7d77]">
                  No members found for this organisation.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0ece1]">
                {members.map((m) => {
                  const memberInitials = m.userEmail
                    ? m.userEmail.substring(0, 2).toUpperCase()
                    : "MB";
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#284f41] text-xs font-bold text-[#e5b84b]">
                          {memberInitials}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <p className="truncate text-xs font-bold text-[#173f35]">
                            {m.userEmail}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#718079]">
                            Joined: {new Date(m.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: Product Listings */}
      {activeSection === "listings" && (
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e2dccd] pb-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#173f35]">
                Product Listings & Material Inventory
              </h2>
              <p className="text-xs text-[#52635c]">
                Manage natural fibre inventory, specifications, pricing, and availability.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingListingId(null);
                  resetListingForm({
                    title: "",
                    description: "",
                    materialType: "HEMP",
                    productForm: "STRAW_RETTED",
                    quantity: 50,
                    quantityUnit: "TONNES",
                    priceAmount: undefined,
                    priceUnit: "PER_TONNE",
                    originCountry: profile.country || "Netherlands",
                    harvestYear: new Date().getFullYear(),
                    siteId: profile.sites && profile.sites.length > 0 ? profile.sites[0].id : "",
                    status: "DRAFT",
                  });
                  setIsAddingListing(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#173f35] px-4 py-2.5 text-xs font-bold text-[#fffaf0] shadow-sm hover:bg-[#245347]"
              >
                <span>+ Create New Listing</span>
              </button>
            </div>
          </div>

          {/* Material Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <button
              type="button"
              onClick={() => setSelectedMaterialFilter("ALL")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedMaterialFilter === "ALL"
                  ? "bg-[#173f35] text-[#fffaf0] shadow-2xs"
                  : "bg-white text-[#52635c] border border-[#e2dccd] hover:bg-[#f6f2e8]"
              }`}
            >
              All Materials ({listings.length})
            </button>
            {APPROVED_MATERIAL_TYPES.map((mat) => {
              const count = listings.filter((l) => l.materialType === mat).length;
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setSelectedMaterialFilter(mat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    selectedMaterialFilter === mat
                      ? "bg-[#173f35] text-[#fffaf0] shadow-2xs"
                      : "bg-white text-[#52635c] border border-[#e2dccd] hover:bg-[#f6f2e8]"
                  }`}
                >
                  {mat} ({count})
                </button>
              );
            })}
          </div>

          {/* Modal / Form Drawer for Adding/Editing Listing */}
          {isAddingListing && (
            <div className="rounded-2xl border-2 border-[#173f35]/20 bg-white p-6 shadow-md">
              <div className="mb-5 flex items-center justify-between border-b border-[#f0ece1] pb-3">
                <h3 className="text-sm font-bold text-[#173f35]">
                  {editingListingId ? "Edit Product Listing" : "Create New Product Listing"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingListing(false);
                    setEditingListingId(null);
                  }}
                  className="rounded-lg p-1.5 text-[#6e7d77] hover:bg-[#f6f2e8]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleListingSubmit(onSaveListing)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Listing Title *
                    </label>
                    <input
                      {...regListing("title", { required: true })}
                      placeholder="e.g. European Retted Hemp Straw — Grade A"
                      className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] placeholder:text-[#9ba8a2] focus:border-[#173f35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Natural Fibre Material *
                    </label>
                    <select
                      {...regListing("materialType", { required: true })}
                      className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] focus:border-[#173f35] focus:outline-none"
                    >
                      {APPROVED_MATERIAL_TYPES.map((mat) => (
                        <option key={mat} value={mat}>
                          {MATERIAL_TYPE_LABELS[mat]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Product Form
                    </label>
                    <select
                      {...regListing("productForm")}
                      className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] focus:border-[#173f35] focus:outline-none"
                    >
                      <option value="">Select form...</option>
                      {APPROVED_PRODUCT_FORMS.map((form) => (
                        <option key={form} value={form}>
                          {PRODUCT_FORM_LABELS[form]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Available Quantity *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        {...regListing("quantity", { required: true, valueAsNumber: true })}
                        placeholder="e.g. 100"
                        className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] placeholder:text-[#9ba8a2] focus:border-[#173f35] focus:outline-none"
                      />
                      <select
                        {...regListing("quantityUnit")}
                        className="w-40 rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3 py-2 text-xs font-medium text-[#173f35] focus:border-[#173f35] focus:outline-none"
                      >
                        {APPROVED_QUANTITY_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {QUANTITY_UNIT_LABELS[unit]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Indicative Price (€ EUR)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        {...regListing("priceAmount")}
                        placeholder="e.g. 240 (optional)"
                        className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] placeholder:text-[#9ba8a2] focus:border-[#173f35] focus:outline-none"
                      />
                      <select
                        {...regListing("priceUnit")}
                        className="w-36 rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3 py-2 text-xs font-medium text-[#173f35] focus:border-[#173f35] focus:outline-none"
                      >
                        {APPROVED_PRICE_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {PRICE_UNIT_LABELS[unit]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Origin Country
                    </label>
                    <input
                      {...regListing("originCountry")}
                      placeholder="e.g. Netherlands"
                      className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] placeholder:text-[#9ba8a2] focus:border-[#173f35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Harvest Year
                    </label>
                    <input
                      type="number"
                      {...regListing("harvestYear")}
                      placeholder="e.g. 2026"
                      className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] placeholder:text-[#9ba8a2] focus:border-[#173f35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Production Site
                    </label>
                    <select
                      {...regListing("siteId")}
                      className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] focus:border-[#173f35] focus:outline-none"
                    >
                      <option value="">No site linked / Multi-site</option>
                      {profile.sites?.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name} ({site.facilityType || "Plot"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Status *
                    </label>
                    <select
                      {...regListing("status")}
                      className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] focus:border-[#173f35] focus:outline-none"
                    >
                      <option value="DRAFT">Draft (Internal preparation)</option>
                      <option value="PUBLISHED">Published (Active listing offer)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-[#173f35]">
                      Commercial Description & Specifications
                    </label>
                    <textarea
                      rows={3}
                      {...regListing("description")}
                      placeholder="Specify quality parameters, retting method, moisture content, packaging (bales/big bags), or minimum order quantities."
                      className="w-full rounded-xl border border-[#d4cdbc] bg-[#faf8f1] px-3.5 py-2 text-xs font-medium text-[#173f35] placeholder:text-[#9ba8a2] focus:border-[#173f35] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingListing(false);
                      setEditingListingId(null);
                    }}
                    className="rounded-xl border border-[#d4cdbc] px-4 py-2 text-xs font-semibold text-[#52635c] hover:bg-[#f6f2e8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingListing}
                    className="rounded-xl bg-[#173f35] px-5 py-2 text-xs font-bold text-[#fffaf0] hover:bg-[#245347] disabled:opacity-50"
                  >
                    {isSavingListing ? "Saving..." : editingListingId ? "Update Listing" : "Create Listing"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listings Grid */}
          {(() => {
            const filtered =
              selectedMaterialFilter === "ALL"
                ? listings
                : listings.filter((l) => l.materialType === selectedMaterialFilter);

            if (filtered.length === 0) {
              return (
                <div className="rounded-2xl border border-dashed border-[#d4cdbc] bg-white p-12 text-center shadow-2xs">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#faf8f1] text-[#173f35]">
                    <span className="text-xl">🌿</span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-[#173f35]">
                    {selectedMaterialFilter === "ALL"
                      ? "No Product Listings Created Yet"
                      : `No ${selectedMaterialFilter} Listings Found`}
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-xs text-[#6e7d77]">
                    Create your first product listing to showcase natural fibre materials, stock levels, and commercial offers.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingListingId(null);
                      resetListingForm({
                        title: "",
                        description: "",
                        materialType:
                          selectedMaterialFilter === "ALL"
                            ? "HEMP"
                            : (selectedMaterialFilter as MaterialType),
                        productForm: "STRAW_RETTED",
                        quantity: 50,
                        quantityUnit: "TONNES",
                        priceAmount: undefined,
                        priceUnit: "PER_TONNE",
                        originCountry: profile.country || "Netherlands",
                        harvestYear: new Date().getFullYear(),
                        siteId: profile.sites && profile.sites.length > 0 ? profile.sites[0].id : "",
                        status: "DRAFT",
                      });
                      setIsAddingListing(true);
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173f35] px-4 py-2 text-xs font-bold text-[#fffaf0] hover:bg-[#245347]"
                  >
                    + Create First Listing
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((listing) => {
                  const isPublished = listing.status === "PUBLISHED";
                  return (
                    <div
                      key={listing.id}
                      className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs"
                    >
                      <div className="space-y-3">
                        {/* Top badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center rounded-md bg-[#173f35]/10 px-2.5 py-1 text-[11px] font-bold text-[#173f35]">
                            {listing.materialType}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              isPublished
                                ? "bg-[#e2f3ea] text-[#1b6b47]"
                                : "bg-[#fef4dd] text-[#875908]"
                            }`}
                          >
                            {isPublished ? "● Published" : "○ Draft"}
                          </span>
                        </div>

                        {/* Title & Product Form */}
                        <div>
                          <h3 className="text-sm font-bold text-[#173f35] leading-snug">
                            {listing.title}
                          </h3>
                          {listing.productForm && (
                            <p className="mt-0.5 text-xs text-[#52635c]">
                              {PRODUCT_FORM_LABELS[listing.productForm as keyof typeof PRODUCT_FORM_LABELS] || listing.productForm}
                            </p>
                          )}
                        </div>

                        {/* Quantity and Price Metrics */}
                        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#faf8f1] p-3">
                          <div>
                            <span className="block text-[10px] font-medium text-[#6e7d77] uppercase tracking-wider">
                              Quantity
                            </span>
                            <span className="text-xs font-bold text-[#173f35]">
                              {listing.quantity} {QUANTITY_UNIT_LABELS[listing.quantityUnit as keyof typeof QUANTITY_UNIT_LABELS] || listing.quantityUnit}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-[#6e7d77] uppercase tracking-wider">
                              Price
                            </span>
                            <span className="text-xs font-bold text-[#173f35]">
                              {listing.priceAmount !== null && listing.priceAmount !== undefined
                                ? `€${listing.priceAmount} / ${listing.priceUnit === "PER_KG" ? "kg" : "t"}`
                                : "Price not specified"}
                            </span>
                          </div>
                        </div>

                        {/* Production Site & Harvest Details */}
                        <div className="space-y-1 text-[11px] text-[#6e7d77]">
                          {listing.siteName && (
                            <div className="flex items-center gap-1.5">
                              <span>🌱</span>
                              <span className="font-medium text-[#173f35]">{listing.siteName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {listing.harvestYear && <span>Harvest {listing.harvestYear}</span>}
                            {listing.harvestYear && listing.originCountry && <span>•</span>}
                            {listing.originCountry && <span>{listing.originCountry}</span>}
                          </div>
                        </div>

                        {/* Description snippet */}
                        {listing.description && (
                          <p className="line-clamp-2 text-xs text-[#52635c]">
                            {listing.description}
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 flex items-center justify-between border-t border-[#f0ece1] pt-3">
                        <button
                          type="button"
                          onClick={() => startEditListing(listing)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#f6f2e8]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleListingStatus(listing)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            isPublished
                              ? "text-[#875908] hover:bg-[#fef4dd]"
                              : "text-[#1b6b47] hover:bg-[#e2f3ea]"
                          }`}
                        >
                          {isPublished ? "Set to Draft" : "Publish Listing"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 0: TRADER COCKPIT */}
      {activeSection === "trader-cockpit" && (
        <div>
          {cockpitMatchingOrderId ? (
            <MatchingWorkspaceView
              buyOrderId={cockpitMatchingOrderId}
              onBack={() => setCockpitMatchingOrderId(null)}
            />
          ) : (
            <TraderCockpitView
              onOpenMatching={(buyOrderId) => setCockpitMatchingOrderId(buyOrderId)}
              onNavigateSection={(sec) => setActiveSection(sec as NavSection)}
              onNavigateToSupplier={(supplierId) => {
                setSelectedTraderSupplierId(supplierId);
                setActiveSection("trader-suppliers");
              }}
              onNavigateToBuyer={(buyerId) => {
                setSelectedTraderBuyerId(buyerId);
                setActiveSection("trader-buyers");
              }}
            />
          )}
        </div>
      )}

      {/* VIEW: TRADER SUPPLIERS MANAGEMENT */}
      {activeSection === "trader-suppliers" && (
        <TraderSuppliersView
          initialSupplierId={selectedTraderSupplierId}
          onSelectSupplier={(supplierId) => setSelectedTraderSupplierId(supplierId)}
        />
      )}

      {/* VIEW: TRADER BUYERS MANAGEMENT */}
      {activeSection === "trader-buyers" && (
        <TraderBuyersView
          initialBuyerId={selectedTraderBuyerId}
          onSelectBuyer={(buyerId) => setSelectedTraderBuyerId(buyerId)}
          onOpenMatching={(buyOrderId: string) => {
            setCockpitMatchingOrderId(buyOrderId);
            setActiveSection("trader-cockpit");
          }}
        />
      )}

      {/* VIEW 6: BUYER MARKETPLACE */}
      {activeSection === "marketplace" && (
        <div>
          {selectedMarketplaceListingId ? (
            <MarketplaceListingDetailView
              listingId={selectedMarketplaceListingId}
              onBack={() => setSelectedMarketplaceListingId(null)}
            />
          ) : (
            <MarketplaceCatalogue
              onSelectListing={(listingId) =>
                setSelectedMarketplaceListingId(listingId)
              }
            />
          )}
        </div>
      )}

      {/* VIEW 7: BUYER MY BUY ORDERS */}
      {activeSection === "buy-orders" && (
        <BuyerBuyOrdersView buyerOrganisationId={orgId ?? undefined} />
      )}

      {/* VIEW 8: TRADER DEMAND OVERVIEW */}
      {activeSection === "trader-demand" && (
        <TraderDemandOverview />
      )}

      {/* VIEW 9: BUYER QUOTATIONS */}
      {activeSection === "buyer-quotes" && (
        <BuyerQuotesView />
      )}

      {/* VIEW 10: TRADER TRANSACTIONS / TRADE RECORDS (SPRINT 06 BLOCK 03) */}
      {activeSection === "trader-trades" && (
        <TraderTradesView
          onNavigateSection={(sec) => setActiveSection(sec as NavSection)}
        />
      )}

    </AuthenticatedAppShell>
  );
}
