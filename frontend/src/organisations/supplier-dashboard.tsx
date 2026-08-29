"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthenticatedAppShell, type NavSection } from "./app-shell";
import {
  createOrganisation,
  createSite,
  getOrganisationProfile,
  getSelfMemberships,
  updateOrganisationProfile,
  updateSite,
} from "./api";
import type {
  CreateOrganisationInput,
  CreateSiteInput,
  OrganisationProfile,
  SiteSummary,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";

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

function MapPinIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
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

export function SupplierDashboard({
  userEmail,
  onLogout,
  isLoggingOut,
}: SupplierDashboardProps) {
  const [activeSection, setActiveSection] = useState<NavSection>("organisation");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<OrganisationProfile | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

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

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const memberships = await getSelfMemberships();
        if (!active) return;

        if (memberships.items.length > 0) {
          const currentOrg = memberships.items[0].organisation;
          setOrgId(currentOrg.id);
          const fullProfile = await getOrganisationProfile(currentOrg.id);
          if (!active) return;
          setProfile(fullProfile);
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
          setOrgId(null);
        }
      } catch {
        if (active) {
          setErrorMessage("Unable to load organisation information. Please check your connection.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [resetProfileForm]);

  async function onSaveProfile(data: UpdateOrganisationProfileInput) {
    if (!orgId) return;
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const updated = await updateOrganisationProfile(orgId, data);
      setProfile(updated);
      setIsEditingProfile(false);
      setSuccessMessage("Company profile updated successfully.");
    } catch {
      setErrorMessage("Failed to update organisation profile.");
    }
  }

  async function onCreateOrg(data: CreateOrganisationInput) {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const created = await createOrganisation(data);
      setProfile(created);
      setOrgId(created.id);
      setSuccessMessage("Organisation registered successfully.");
    } catch {
      setErrorMessage("Failed to create organisation.");
    }
  }

  async function onSaveSite(data: CreateSiteInput) {
    if (!orgId) return;
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const payload: CreateSiteInput = {
        ...data,
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        landAreaHectares: data.landAreaHectares ? Number(data.landAreaHectares) : null,
      };

      if (editingSiteId) {
        await updateSite(orgId, editingSiteId, payload as UpdateSiteInput);
        setSuccessMessage("Production site updated successfully.");
      } else {
        await createSite(orgId, payload);
        setSuccessMessage("Production site registered successfully.");
      }
      setIsAddingSite(false);
      setEditingSiteId(null);
      resetSiteForm({});
      const refreshed = await getOrganisationProfile(orgId);
      setProfile(refreshed);
    } catch {
      setErrorMessage("Failed to save production site.");
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

  return (
    <AuthenticatedAppShell
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      userEmail={userEmail}
      companyName={profile?.name}
      verificationStatus={profile?.verificationStatus}
      onLogout={onLogout}
      isLoggingOut={isLoggingOut}
    >
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-[#e7c4bd] bg-[#fff5f2] p-4 text-sm text-[#8c352d] shadow-xs">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-xl border border-[#c4e3d3] bg-[#f2faf5] p-4 text-sm text-[#206649] shadow-xs">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-96 flex-col items-center justify-center text-center">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#ddd6c6] border-t-[#284f41]" />
          <p className="mt-4 text-sm font-medium text-[#5d6e68]">Loading organisation information...</p>
        </div>
      ) : !profile ? (
        /* First-Time Onboarding Form */
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-sm sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f1eb] px-3 py-1 text-xs font-semibold text-[#285d4a]">
            <span className="h-2 w-2 rounded-full bg-[#3b876b]" />
            Supplier Onboarding
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#203e35] sm:text-3xl">
            Register Your Supplier Organisation
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#60706a]">
            Join I Do Grow to offer European natural fibres directly to international buyers and processors.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleNewOrgSubmit(onCreateOrg)}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-name">
                Company / Commercial Name *
              </label>
              <input
                id="onboard-name"
                required
                placeholder="e.g. Green Fields Hemp Cooperative"
                className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                {...regNewOrg("name", { required: true })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-legalName">
                  Legal Entity Name
                </label>
                <input
                  id="onboard-legalName"
                  placeholder="e.g. Green Fields Hemp Coop B.V."
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("legalName")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-businessType">
                  Business Activity
                </label>
                <select
                  id="onboard-businessType"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("businessType")}
                >
                  <option value="">Select Activity</option>
                  <option value="farmer">Farmer / Primary Grower</option>
                  <option value="cooperative">Agricultural Cooperative</option>
                  <option value="producer">Raw Material Producer</option>
                  <option value="processor">Primary Processor</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-reg">
                  Registration Number (KVK / SIRET)
                </label>
                <input
                  id="onboard-reg"
                  placeholder="e.g. 12345678"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("registrationNumber")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-vat">
                  VAT / Tax ID
                </label>
                <input
                  id="onboard-vat"
                  placeholder="e.g. NL123456789B01"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("vatNumber")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-addr">
                  Address
                </label>
                <input
                  id="onboard-addr"
                  placeholder="e.g. Hemp Street 10"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("address")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-country">
                  Country
                </label>
                <input
                  id="onboard-country"
                  placeholder="e.g. Netherlands"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("country")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-contactName">
                  Primary Contact Name
                </label>
                <input
                  id="onboard-contactName"
                  placeholder="e.g. Jan de Vries"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("contactName")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-contactEmail">
                  Contact Email
                </label>
                <input
                  id="onboard-contactEmail"
                  type="email"
                  placeholder="jan@coop.nl"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("contactEmail")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#304f45]" htmlFor="onboard-contactPhone">
                  Phone Number
                </label>
                <input
                  id="onboard-contactPhone"
                  placeholder="+31 6 12345678"
                  className="mt-1.5 h-11 w-full rounded-lg border border-[#d4cdbc] bg-white px-3.5 text-sm text-[#203e35] outline-none transition focus:border-[#356a57] focus:ring-2 focus:ring-[#356a57]/20"
                  {...regNewOrg("contactPhone")}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isCreatingOrg}
                className="h-11 w-full rounded-lg bg-[#284f41] px-6 text-sm font-semibold text-[#fffaf0] shadow-sm transition hover:bg-[#1f4035] focus-visible:outline-2 focus-visible:outline-[#356a57] disabled:opacity-60"
              >
                {isCreatingOrg ? "Creating Organisation..." : "Complete Organisation Registration"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Full-Width Authenticated Supplier Portal */
        <div className="space-y-6">
          {/* Section 1: Organisation Profile */}
          {activeSection === "organisation" && (
            <>
              {/* Page Header with Compact Completeness Summary */}
              <div className="flex flex-col justify-between gap-4 border-b border-[#e2dccd] pb-6 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#203e35] sm:text-3xl">
                    {profile.name}
                  </h1>
                  <p className="mt-1 text-sm text-[#6e7d77]">
                    {profile.legalName || profile.name} · {profile.businessType ? profile.businessType.toUpperCase() : "SUPPLIER"} · {profile.country || "Country Not Set"}
                  </p>
                </div>

                {/* Compact Completeness Widget */}
                <div className="w-full rounded-xl border border-[#e2dccd] bg-white p-4 shadow-2xs sm:w-72">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#304f45]">Profile Completeness</span>
                    <span className="font-bold text-[#284f41]">{profile.completenessPercent}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eee9dc]">
                    <div
                      className="h-full rounded-full bg-[#284f41] transition-all duration-500"
                      style={{ width: `${profile.completenessPercent}%` }}
                    />
                  </div>
                  {profile.missingFields.length > 0 ? (
                    <p className="mt-1.5 truncate text-[11px] text-[#837760]">
                      Missing: {profile.missingFields.slice(0, 2).join(", ")}
                      {profile.missingFields.length > 2 ? ` (+${profile.missingFields.length - 2})` : ""}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] font-medium text-[#1b6b47]">
                      ✓ Profile complete
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Grid: 2/3 Main Card + 1/3 At A Glance Card */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* 2/3 Column: General Information */}
                <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs lg:col-span-2 sm:p-8">
                  <div className="flex items-center justify-between border-b border-[#e2dccd] pb-4">
                    <div>
                      <h2 className="text-base font-bold text-[#203e35]">General Information</h2>
                      <p className="text-xs text-[#6e7d77]">Legal and operational details for trading</p>
                    </div>
                    <button
                      className="rounded-lg border border-[#d4cdbc] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#284f41] transition hover:bg-[#f5f1e7]"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      type="button"
                    >
                      {isEditingProfile ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <form className="mt-6 space-y-4" onSubmit={handleProfileSubmit(onSaveProfile)}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">Commercial Name *</label>
                          <input
                            required
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("name", { required: true })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">Legal Entity Name</label>
                          <input
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("legalName")}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">Business Activity</label>
                          <select
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("businessType")}
                          >
                            <option value="">Select Activity</option>
                            <option value="farmer">Farmer / Primary Grower</option>
                            <option value="cooperative">Agricultural Cooperative</option>
                            <option value="producer">Raw Material Producer</option>
                            <option value="processor">Primary Processor</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">Country</label>
                          <input
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("country")}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">Registration Number (KVK/SIRET)</label>
                          <input
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("registrationNumber")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">VAT Number</label>
                          <input
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("vatNumber")}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-[#304f45]">Address</label>
                          <input
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("address")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">City</label>
                          <input
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("city")}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">Primary Contact Name</label>
                          <input
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("contactName")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">Contact Email</label>
                          <input
                            type="email"
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("contactEmail")}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#304f45]">Contact Phone</label>
                          <input
                            className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                            {...regProfile("contactPhone")}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-[#e2dccd]">
                        <button
                          type="button"
                          className="rounded-lg border border-[#d4cdbc] px-4 py-2 text-xs font-semibold text-[#53625d] hover:bg-[#f1eee6]"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="rounded-lg bg-[#284f41] px-5 py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#1f4035] disabled:opacity-60"
                        >
                          {isSavingProfile ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-6 grid gap-y-6 text-sm sm:grid-cols-2 sm:gap-x-8">
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#837760]">Commercial Name</span>
                        <p className="mt-1 font-medium text-[#203e35] text-base">{profile.name}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#837760]">Legal Entity</span>
                        <p className="mt-1 font-medium text-[#203e35] text-base">{profile.legalName || "—"}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#837760]">Business Activity</span>
                        <p className="mt-1 font-medium capitalize text-[#203e35] text-base">{profile.businessType || "—"}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#837760]">Country</span>
                        <p className="mt-1 font-medium text-[#203e35] text-base">{profile.country || "—"}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#837760]">Registration Number</span>
                        <p className="mt-1 font-medium text-[#203e35] text-base">{profile.registrationNumber || "—"}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#837760]">VAT Number</span>
                        <p className="mt-1 font-medium text-[#203e35] text-base">{profile.vatNumber || "—"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-[#837760]">Address</span>
                        <p className="mt-1 font-medium text-[#203e35] text-base">
                          {[profile.address, profile.postalCode, profile.city].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1/3 Column: At A Glance Card */}
                <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs sm:p-8">
                  <h2 className="border-b border-[#e2dccd] pb-3 text-base font-bold text-[#203e35]">At a Glance</h2>
                  <div className="mt-5 space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7f1eb] text-[#284f41]">
                        <Building2Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#837760]">Primary Contact</p>
                        <p className="text-sm font-semibold text-[#203e35] truncate">{profile.contactName || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7f1eb] text-[#284f41]">
                        <MailIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#837760]">Email</p>
                        <p className="text-sm font-semibold text-[#203e35] truncate">{profile.contactEmail || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7f1eb] text-[#284f41]">
                        <PhoneIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#837760]">Phone</p>
                        <p className="text-sm font-semibold text-[#203e35] truncate">{profile.contactPhone || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7f1eb] text-[#284f41]">
                        <MapPinIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#837760]">Location</p>
                        <p className="text-sm font-semibold text-[#203e35] truncate">
                          {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7f1eb] text-[#284f41]">
                        <SproutSmallIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#837760]">Production Sites</p>
                        <p className="text-sm font-semibold text-[#203e35]">{profile.sites.length} site(s) registered</p>
                      </div>
                    </div>

                    <div className="border-t border-[#e2dccd] pt-4 mt-6">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#837760]">Verification Status</span>
                        <span className="font-semibold text-[#203e35]">{profile.verificationStatus}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-[#837760]">Member Since</span>
                        <span className="font-semibold text-[#203e35]">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Section 2: Production Sites & Farms */}
          {activeSection === "sites" && (
            <>
              {/* Page Header with Add Action */}
              <div className="flex flex-col justify-between gap-4 border-b border-[#e2dccd] pb-6 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#203e35] sm:text-3xl">
                    Production Sites & Farms
                  </h1>
                  <p className="mt-1 text-sm text-[#6e7d77]">
                    Agricultural parcels and storage facilities linked to your supplier profile
                  </p>
                </div>
                {!isAddingSite && (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-[#284f41] px-4 py-2.5 text-xs font-semibold text-[#fffaf0] shadow-sm transition hover:bg-[#1f4035]"
                    onClick={() => {
                      setEditingSiteId(null);
                      resetSiteForm({});
                      setIsAddingSite(true);
                    }}
                    type="button"
                  >
                    <span>+ Add Production Site</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Site Form Modal/Card */}
              {isAddingSite && (
                <div className="rounded-2xl border border-[#d4cdbc] bg-white p-6 shadow-sm sm:p-8">
                  <h3 className="border-b border-[#e2dccd] pb-3 text-base font-bold text-[#203e35]">
                    {editingSiteId ? "Edit Production Site" : "New Production Site / Farm"}
                  </h3>
                  <form className="mt-6 space-y-4" onSubmit={handleSiteSubmit(onSaveSite)}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#304f45]">Site Name *</label>
                        <input
                          required
                          placeholder="e.g. North Parcel Farm"
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                          {...regSite("name", { required: true })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#304f45]">Facility Type</label>
                        <select
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                          {...regSite("facilityType")}
                        >
                          <option value="farm">Farm / Agricultural Land</option>
                          <option value="processing_facility">Primary Processing Facility</option>
                          <option value="storage_warehouse">Storage / Bale Warehouse</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#304f45]">Address</label>
                        <input
                          placeholder="e.g. Rural Route 4"
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                          {...regSite("address")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#304f45]">City</label>
                        <input
                          placeholder="e.g. Reims"
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                          {...regSite("city")}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#304f45]">Country</label>
                        <input
                          placeholder="e.g. France"
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                          {...regSite("country")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#304f45]">Surface (Hectares)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 150.0"
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                          {...regSite("landAreaHectares")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#304f45]">Latitude (GPS)</label>
                        <input
                          type="number"
                          step="0.0001"
                          placeholder="49.2583"
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                          {...regSite("latitude")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#304f45]">Longitude (GPS)</label>
                        <input
                          type="number"
                          step="0.0001"
                          placeholder="4.0317"
                          className="mt-1.5 h-10 w-full rounded-lg border border-[#d4cdbc] bg-white px-3 text-sm text-[#203e35] outline-none focus:border-[#356a57]"
                          {...regSite("longitude")}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#e2dccd]">
                      <button
                        type="button"
                        className="rounded-lg border border-[#d4cdbc] px-4 py-2 text-xs font-semibold text-[#53625d] hover:bg-[#f1eee6]"
                        onClick={() => {
                          setIsAddingSite(false);
                          setEditingSiteId(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingSite}
                        className="rounded-lg bg-[#284f41] px-5 py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#1f4035] disabled:opacity-60"
                      >
                        {isSavingSite ? "Saving..." : editingSiteId ? "Update Site" : "Create Site"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Full-Width Site Cards Grid */}
              {profile.sites.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d4cdbc] bg-white/70 p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#284f41]">
                    <SproutSmallIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#203e35]">No Production Sites Registered</h3>
                  <p className="mt-1 text-xs text-[#6e7d77] max-w-sm mx-auto">
                    Register your primary farm, parcel, or storage facility to enable lot-level provenance.
                  </p>
                  <button
                    className="mt-5 rounded-lg bg-[#284f41] px-5 py-2 text-xs font-semibold text-[#fffaf0] hover:bg-[#1f4035]"
                    onClick={() => {
                      setEditingSiteId(null);
                      resetSiteForm({});
                      setIsAddingSite(true);
                    }}
                    type="button"
                  >
                    + Add Production Site
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {profile.sites.map((site) => (
                    <div
                      key={site.id}
                      className="flex flex-col justify-between rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs transition hover:border-[#284f41]/50 hover:shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-[#203e35] text-base">{site.name}</h4>
                          <span className="rounded-md bg-[#e7f1eb] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#285d4a]">
                            {site.facilityType === "processing_facility"
                              ? "Processing"
                              : site.facilityType === "storage_warehouse"
                              ? "Warehouse"
                              : "Farm"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-[#6e7d77]">
                          {[site.address, site.city, site.country].filter(Boolean).join(", ") || "Location not specified"}
                        </p>

                        <div className="mt-5 space-y-2 border-t border-[#f1eee6] pt-4 text-xs">
                          {site.landAreaHectares ? (
                            <div className="flex items-center justify-between">
                              <span className="text-[#837760]">Surface Area:</span>
                              <span className="font-semibold text-[#203e35]">{site.landAreaHectares} ha</span>
                            </div>
                          ) : null}
                          {site.latitude && site.longitude ? (
                            <div className="flex items-center justify-between">
                              <span className="text-[#837760]">GPS Coordinates:</span>
                              <span className="font-mono font-medium text-[#203e35]">
                                {site.latitude.toFixed(4)}°, {site.longitude.toFixed(4)}°
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-5 flex justify-end border-t border-[#f1eee6] pt-3">
                        <button
                          className="text-xs font-semibold text-[#284f41] hover:underline"
                          onClick={() => startEditSite(site)}
                          type="button"
                        >
                          Edit Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </AuthenticatedAppShell>
  );
}
