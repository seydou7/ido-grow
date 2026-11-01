"use client";

import { useState } from "react";
import type { NavSection } from "./app-shell";
import type {
  ComplianceDocumentSummary,
  OrganisationMemberSummary,
  OrganisationProfile,
  UpdateOrganisationProfileInput,
} from "./contracts";
import {
  getComplianceDocumentDownloadUrl,
  updateOrganisationProfile,
  uploadComplianceDocument,
} from "./api";

export type SettingsTab = "organisation" | "members";

export interface TraderSettingsViewProps {
  initialTab?: SettingsTab;
  profile: OrganisationProfile;
  documents: ComplianceDocumentSummary[];
  members: OrganisationMemberSummary[];
  onProfileUpdated?: (updated: OrganisationProfile) => void;
  onDocumentsUpdated?: (documents: ComplianceDocumentSummary[]) => void;
  onNavigateSection?: (section: NavSection) => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  COMPANY_REGISTRATION: "Company Registration (KVK / SIRET / Registry)",
  TAX_CERTIFICATE: "Tax & VAT Registration Certificate",
  ORGANIC_CERTIFICATION: "Organic Farming Certificate",
  QUALITY_CERTIFICATE: "Quality & Agricultural Standard (ISO / GlobalGAP)",
  FARM_OWNERSHIP_LEASE: "Land Deed / Facility Lease Agreement",
  OTHER_COMPLIANCE: "Other Supporting Compliance Document",
};

export function TraderSettingsView({
  initialTab = "organisation",
  profile,
  documents,
  members,
  onProfileUpdated,
  onDocumentsUpdated,
}: TraderSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Edit profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateOrganisationProfileInput>({
    name: profile.name,
    legalName: profile.legalName ?? "",
    businessType: profile.businessType ?? "",
    registrationNumber: profile.registrationNumber ?? "",
    vatNumber: profile.vatNumber ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
    postalCode: profile.postalCode ?? "",
    country: profile.country ?? "",
    contactName: profile.contactName ?? "",
    contactEmail: profile.contactEmail ?? "",
    contactPhone: profile.contactPhone ?? "",
  });

  // Document upload state
  const [uploadType, setUploadType] = useState<string>("COMPANY_REGISTRATION");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const updated = await updateOrganisationProfile(profile.id, formData);
      onProfileUpdated?.(updated);
      setIsEditing(false);
      setSaveSuccess("Profil de l'organisation mis à jour avec succès.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const newDoc = await uploadComplianceDocument(profile.id, uploadType, uploadFile);
      onDocumentsUpdated?.([...documents, newDoc]);
      setUploadFile(null);
      setUploadSuccess("Document de conformité téléversé avec succès.");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur de téléversement.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Sub-Header & Navigation Tabs */}
      <div className="rounded-2xl border border-[#e2dccd] bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#f0ece1]">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#173f35]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#173f35]">
                Workspace &amp; Administration
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#173f35]">
              Paramètres &amp; Accès
            </h1>
            <p className="mt-0.5 text-xs text-[#52635c]">
              Identité légale de l'organisation, profil commercial et gestion des membres d'équipe.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("organisation")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "organisation"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Profil de l'organisation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "members"
                ? "bg-[#173f35] text-[#fffaf0] shadow-sm"
                : "border border-[#e2dccd] bg-white text-[#52635c] hover:bg-[#faf8f1] hover:text-[#173f35]"
            }`}
          >
            <span>Équipe &amp; Membres</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
              {members.length}
            </span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          {saveError}
        </div>
      )}

      {/* 2. TAB 1: ORGANISATION PROFILE */}
      {activeTab === "organisation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3) : Information & Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* General & Legal Information Card */}
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#f0ece1] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#173f35]">Informations Générales &amp; Légales</h2>
                  <p className="text-xs text-[#6e7d77]">Identité d'enregistrement officiel au registre du commerce</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs font-semibold text-[#173f35] hover:bg-[#faf8f1] transition-all"
                >
                  {isEditing ? "Annuler la modification" : "Modifier le profil"}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-name">
                        Nom Commercial *
                      </label>
                      <input
                        id="field-name"
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-legalName">
                        Raison Sociale Légale
                      </label>
                      <input
                        id="field-legalName"
                        type="text"
                        value={formData.legalName || ""}
                        onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-businessType">
                        Type d'Activité / Secteur
                      </label>
                      <input
                        id="field-businessType"
                        type="text"
                        value={formData.businessType || ""}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-regNumber">
                        N° d'Enregistrement (SIREN / KVK)
                      </label>
                      <input
                        id="field-regNumber"
                        type="text"
                        value={formData.registrationNumber || ""}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-vatNumber">
                        N° de TVA Intracommunautaire
                      </label>
                      <input
                        id="field-vatNumber"
                        type="text"
                        value={formData.vatNumber || ""}
                        onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-country">
                        Pays
                      </label>
                      <input
                        id="field-country"
                        type="text"
                        value={formData.country || ""}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-address">
                        Adresse du Siège Social
                      </label>
                      <input
                        id="field-address"
                        type="text"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-city">
                        Ville
                      </label>
                      <input
                        id="field-city"
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#173f35]" htmlFor="field-postalCode">
                        Code Postal
                      </label>
                      <input
                        id="field-postalCode"
                        type="text"
                        value={formData.postalCode || ""}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-[#d4cdbc] bg-white px-3 py-2 text-xs text-[#173f35] focus:border-[#173f35] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-[#f0ece1]">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-[#e2dccd] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#52635c] hover:bg-[#faf8f1]"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[#173f35] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#245347] disabled:opacity-50 transition-all"
                    >
                      {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#6e7d77] block text-[10px] uppercase font-bold tracking-wider">
                      Nom Commercial
                    </span>
                    <span className="text-sm font-bold text-[#173f35] mt-0.5 block">{profile.name}</span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px] uppercase font-bold tracking-wider">
                      Raison Sociale
                    </span>
                    <span className="font-semibold text-[#173f35] mt-0.5 block">
                      {profile.legalName || "Identique au nom commercial"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px] uppercase font-bold tracking-wider">
                      Type d'Organisation
                    </span>
                    <span className="font-semibold text-[#173f35] mt-0.5 block">
                      {profile.organisationType} {profile.businessType ? `· ${profile.businessType}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px] uppercase font-bold tracking-wider">
                      N° d'Enregistrement Légale
                    </span>
                    <span className="font-mono text-[#173f35] mt-0.5 block">
                      {profile.registrationNumber || "Non renseigné"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px] uppercase font-bold tracking-wider">
                      N° de TVA
                    </span>
                    <span className="font-mono text-[#173f35] mt-0.5 block">
                      {profile.vatNumber || "Non renseigné"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6e7d77] block text-[10px] uppercase font-bold tracking-wider">
                      Siège Social
                    </span>
                    <span className="text-[#52635c] mt-0.5 block">
                      {[profile.address, profile.city, profile.postalCode, profile.country]
                        .filter(Boolean)
                        .join(", ") || "Adresse non renseignée"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Compliance Documents Card */}
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs space-y-4">
              <div className="border-b border-[#f0ece1] pb-3">
                <h3 className="text-base font-bold text-[#173f35]">Documents de Conformité &amp; KYC</h3>
                <p className="text-xs text-[#6e7d77]">Justificatifs légaux et certificats d'exploitation</p>
              </div>

              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d4cdbc] p-6 text-center text-xs text-[#6e7d77]">
                  Aucun document de conformité téléversé pour le moment.
                </div>
              ) : (
                <div className="divide-y divide-[#f0ece1]">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <p className="font-semibold text-[#173f35]">
                          {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                        </p>
                        <p className="text-[11px] text-[#6e7d77]">
                          {doc.originalFilename} · {(doc.fileSize / 1024).toFixed(1)} Ko
                        </p>
                      </div>
                      <a
                        href={getComplianceDocumentDownloadUrl(profile.id, doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[#e2dccd] bg-[#faf8f1] px-2.5 py-1 text-xs font-semibold text-[#173f35] hover:bg-[#f0ece1]"
                      >
                        Télécharger →
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload form */}
              <form onSubmit={handleUploadDocument} className="pt-2 border-t border-[#f0ece1] space-y-3 text-xs">
                <span className="font-bold text-[#173f35] block">Ajouter un justificatif</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="rounded-xl border border-[#e2dccd] bg-[#faf8f1] px-3 py-2 text-xs font-semibold text-[#173f35] focus:outline-hidden"
                  >
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="rounded-xl border border-[#e2dccd] bg-white px-3 py-1.5 text-xs text-[#52635c] file:mr-2 file:rounded-lg file:border-0 file:bg-[#173f35] file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white"
                  />
                </div>
                {uploadError && <p className="text-red-700 text-xs">{uploadError}</p>}
                {uploadSuccess && <p className="text-emerald-700 text-xs">{uploadSuccess}</p>}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!uploadFile || uploading}
                    className="rounded-xl bg-[#173f35] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#245347] disabled:opacity-50 transition-all"
                  >
                    {uploading ? "Téléversement..." : "Téléverser le document"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Side Column (1/3) : Status, Verification & Contact */}
          <div className="space-y-6">
            {/* Verification Status Card */}
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e7d77]">
                Statut de Vérification KYC
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                    profile.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-amber-50 text-amber-800 border-amber-300"
                  }`}
                >
                  {profile.verificationStatus}
                </span>
                <span className="text-xs text-[#6e7d77]">
                  {profile.completenessPercent}% complété
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#f0ece1] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#173f35] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profile.completenessPercent}%` }}
                />
              </div>

              {profile.missingFields && profile.missingFields.length > 0 && (
                <div className="pt-2 text-xs text-[#52635c] border-t border-[#f0ece1]">
                  <span className="text-[10px] font-bold uppercase text-[#6e7d77] block">
                    Champs recommandés :
                  </span>
                  <ul className="mt-1 space-y-0.5 text-[11px]">
                    {profile.missingFields.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Primary Contact Person Card */}
            <div className="rounded-2xl border border-[#e2dccd] bg-white p-5 shadow-2xs space-y-3 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e7d77] block">
                Contact Commercial Référent
              </span>
              <div>
                <p className="font-bold text-sm text-[#173f35]">{profile.contactName || "Non spécifié"}</p>
                <p className="text-[#52635c] mt-0.5">{profile.contactEmail || "Email non renseigné"}</p>
                {profile.contactPhone && (
                  <p className="text-[#52635c] mt-0.5">{profile.contactPhone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: TEAM & MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e2dccd] bg-white p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#f0ece1] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#173f35]">
                  Membres &amp; Collaborateurs de l'Équipe
                </h2>
                <p className="text-xs text-[#6e7d77]">
                  Comptes utilisateurs rattachés à {profile.name} autorisés sur la plateforme
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#173f35]/10 px-3 py-1 text-xs font-semibold text-[#173f35]">
                {members.length} {members.length === 1 ? "Membre actif" : "Membres actifs"}
              </span>
            </div>

            {members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d4cdbc] p-8 text-center text-xs text-[#6e7d77]">
                Aucun membre trouvé pour cette organisation.
              </div>
            ) : (
              <div className="divide-y divide-[#f0ece1]">
                {members.map((m) => {
                  const initials = m.userEmail ? m.userEmail.substring(0, 2).toUpperCase() : "MB";
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#173f35] text-xs font-bold text-[#fffaf0]">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#173f35]">{m.userEmail}</p>
                          <p className="text-[11px] text-[#6e7d77]">
                            Inscrit le : {new Date(m.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Trader / Opérateur Actif
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Information Notice regarding IAM Policies */}
            <div className="rounded-xl bg-[#faf8f1] p-4 text-xs text-[#52635c] border border-[#e2dccd]">
              <p className="font-bold text-[#173f35]">Gestion des accès &amp; Permissions</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Les attributions de rôles et privilèges d'organisation respectent les règles strictes d'isolation tenant. Pour inviter un nouveau collaborateur ou ajuster des droits d'accès, contactez l'administrateur principal de votre organisation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
