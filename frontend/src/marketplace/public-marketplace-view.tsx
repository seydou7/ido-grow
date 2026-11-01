"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n-provider";
import { AllFiltersDrawer } from "./all-filters-drawer";
import { AuthGateModal } from "./auth-gate-modal";
import { formatMaterialType, formatOriginCountry, formatProductForm } from "./formatters";
import { HorizontalFilterToolbar } from "./horizontal-filter-toolbar";
import { MaterialCategories } from "./material-categories";
import { PremiumHero } from "./premium-hero";
import { fetchPublicListings } from "./public-api";
import type {
  PublicMarketplaceListing,
  PublicMarketplaceListingCollection,
  PublicMarketplaceQuery,
} from "./public-contracts";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import { PublicProductCard } from "./public-product-card";
import { TrustFeatures } from "./trust-features";

export function PublicMarketplaceView() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Query state derived directly from URL
  const searchParam = searchParams.get("search") || "";
  const materialParam = searchParams.get("materialType") || "ALL";
  const formParam = searchParams.get("productForm") || "ALL";
  const countryParam = searchParams.get("originCountry") || "ALL";
  const minQtyParam = searchParams.get("minQuantity") || "";
  const maxQtyParam = searchParams.get("maxQuantity") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const hasDppParam = searchParams.get("hasDpp") === "true";
  const hasQualityParam = searchParams.get("hasQualityApproved") === "true";
  const hasCertsParam = searchParams.get("hasCertifications") === "true";
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);

  // Local search draft & drawers
  const [searchInput, setSearchInput] = useState(searchParam);
  const [allFiltersDrawerOpen, setAllFiltersDrawerOpen] = useState(false);

  // Auth gate modal
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateAction, setAuthGateAction] = useState(t("cta.createBuyOrder"));

  // Data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<PublicMarketplaceListingCollection | null>(null);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "ALL" || value === "false") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }
      if (!("page" in updates)) {
        nextParams.delete("page");
      }
      const qs = nextParams.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const query: PublicMarketplaceQuery = {
      search: searchParam || undefined,
      materialType: materialParam !== "ALL" ? materialParam : undefined,
      productForm: formParam !== "ALL" ? formParam : undefined,
      originCountry: countryParam !== "ALL" ? countryParam : undefined,
      minQuantity: minQtyParam ? Number.parseFloat(minQtyParam) : undefined,
      maxQuantity: maxQtyParam ? Number.parseFloat(maxQtyParam) : undefined,
      minPrice: minPriceParam ? Number.parseFloat(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number.parseFloat(maxPriceParam) : undefined,
      hasDpp: hasDppParam || undefined,
      hasQualityApproved: hasQualityParam || undefined,
      hasCertifications: hasCertsParam || undefined,
      sort: sortParam,
      page: pageParam,
      pageSize: 12,
    };

    fetchPublicListings(query)
      .then((res) => {
        if (isMounted) {
          setCollection(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : t("state.error"));
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    searchParam,
    materialParam,
    formParam,
    countryParam,
    minQtyParam,
    maxQtyParam,
    minPriceParam,
    maxPriceParam,
    hasDppParam,
    hasQualityParam,
    hasCertsParam,
    sortParam,
    pageParam,
    t,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput.trim() || null });
    const catalogueEl = document.getElementById("catalogue");
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const handleSelectCategory = (material: string) => {
    updateUrlParams({ materialType: material === "ALL" ? null : material });
    const catalogueEl = document.getElementById("catalogue");
    if (catalogueEl) {
      catalogueEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openCustomOrderGate = () => {
    setAuthGateAction(t("cta.createBuyOrder"));
    setAuthGateOpen(true);
  };

  let activeFilterCount = 0;
  if (materialParam !== "ALL") activeFilterCount++;
  if (formParam !== "ALL") activeFilterCount++;
  if (countryParam !== "ALL") activeFilterCount++;
  if (minQtyParam || maxQtyParam) activeFilterCount++;
  if (minPriceParam || maxPriceParam) activeFilterCount++;
  if (hasDppParam) activeFilterCount++;
  if (hasQualityParam) activeFilterCount++;
  if (hasCertsParam) activeFilterCount++;

  return (
    <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35] selection:bg-[#1e5442] selection:text-white">
      {/* 1. Public Header */}
      <PublicHeader
        activeRoute="marketplace"
        onOpenAuthGate={(action) => {
          setAuthGateAction(action || t("cta.accessPlatform"));
          setAuthGateOpen(true);
        }}
      />

      {/* 2. Editorial Marketplace Hero */}
      <PremiumHero
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onOpenCustomOrder={openCustomOrderGate}
      />

      {/* 3. Material Category Discovery */}
      <div id="materials">
        <MaterialCategories
          selectedMaterial={materialParam}
          onSelectMaterial={handleSelectCategory}
        />
      </div>

      {/* 4. Horizontal Sticky Filter Toolbar */}
      <HorizontalFilterToolbar
        selectedMaterial={materialParam}
        selectedForm={formParam}
        selectedCountry={countryParam}
        minQuantity={minQtyParam}
        maxQuantity={maxQtyParam}
        minPrice={minPriceParam}
        maxPrice={maxPriceParam}
        hasDpp={hasDppParam}
        hasQualityApproved={hasQualityParam}
        hasCertifications={hasCertsParam}
        sort={sortParam}
        facets={collection?.facets}
        activeCount={activeFilterCount}
        onUpdateParam={updateUrlParams}
        onOpenAllFilters={() => setAllFiltersDrawerOpen(true)}
        onClearAll={handleClearAllFilters}
      />

      {/* 5. Main Catalogue Container */}
      <main
        id="catalogue"
        className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-14 w-full scroll-mt-28"
      >
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 border-b border-[#e4ded0] gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#173f35] tracking-[-0.02em]">
                {t("marketplace.results.title")}
              </h2>
              <span className="px-3 py-1 text-xs font-semibold tabular-nums rounded-sm bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {collection
                  ? `${collection.total} ${t("marketplace.results.lotsCount")}`
                  : t("state.loading")}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#5c6e66]">
              {t("marketplace.results.subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={openCustomOrderGate}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e5442] hover:text-[#173f35] underline underline-offset-4 cursor-pointer self-start sm:self-auto"
          >
            <span>{t("marketplace.hero.customOrderCta")}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        {/* 6. Active Filter Chips Bar */}
        {(activeFilterCount > 0 || searchParam) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 pb-2">
            <span className="text-xs text-[#5c6e66] font-semibold mr-1">
              {t("marketplace.filter.activeFilters")}
            </span>

            {searchParam && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                &ldquo;{searchParam}&rdquo;
                <button
                  type="button"
                  onClick={() => updateUrlParams({ search: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove search filter"
                >
                  &times;
                </button>
              </span>
            )}

            {materialParam !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {t("marketplace.filter.material")}: {formatMaterialType(materialParam, locale)}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ materialType: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove material filter"
                >
                  &times;
                </button>
              </span>
            )}

            {formParam !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {t("marketplace.filter.form")}: {formatProductForm(formParam, locale)}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ productForm: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove form filter"
                >
                  &times;
                </button>
              </span>
            )}

            {countryParam !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {t("marketplace.filter.origin")}: {formatOriginCountry(countryParam, locale)}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ originCountry: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove country filter"
                >
                  &times;
                </button>
              </span>
            )}

            {(minQtyParam || maxQtyParam) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {t("marketplace.filter.volume")}: {minQtyParam || "0"}–{maxQtyParam || "∞"} t
                <button
                  type="button"
                  onClick={() => updateUrlParams({ minQuantity: null, maxQuantity: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove volume filter"
                >
                  &times;
                </button>
              </span>
            )}

            {(minPriceParam || maxPriceParam) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {t("marketplace.filter.price")}: €{minPriceParam || "0"}–€{maxPriceParam || "∞"}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ minPrice: null, maxPrice: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove price filter"
                >
                  &times;
                </button>
              </span>
            )}

            {hasDppParam && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {t("marketplace.filter.dpp")}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ hasDpp: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove DPP filter"
                >
                  &times;
                </button>
              </span>
            )}

            {hasQualityParam && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {t("marketplace.filter.quality")}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ hasQualityApproved: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove quality filter"
                >
                  &times;
                </button>
              </span>
            )}

            {hasCertsParam && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#e8f0ec] text-[#173f35] border border-[#c8dcd2]">
                {t("marketplace.filter.certifications")}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ hasCertifications: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold cursor-pointer"
                  aria-label="Remove certification filter"
                >
                  &times;
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-[#173f35] hover:text-[#1e5442] font-bold ml-2 underline underline-offset-4 cursor-pointer"
            >
              {t("marketplace.filter.clearAll")}
            </button>
          </div>
        )}

        {/* 7. Product Grid */}
        <div className="mt-8 w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-md border border-[#ded8c4] p-4 h-96 flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] bg-[#ece6d6] rounded-sm w-full mb-3" />
                  <div className="space-y-2">
                    <div className="h-3.5 bg-[#ece6d6] rounded-xs w-1/3" />
                    <div className="h-5 bg-[#ece6d6] rounded-xs w-3/4" />
                  </div>
                  <div className="h-10 bg-[#ece6d6] rounded-sm w-full mt-4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-md border border-red-200 p-8 text-center text-[#173f35] max-w-xl mx-auto my-12">
              <h3 className="text-base font-bold text-red-900">
                {t("marketplace.error.title")}
              </h3>
              <p className="mt-1 text-sm text-[#5c6e66]">{error}</p>
              <button
                type="button"
                onClick={() => updateUrlParams({ page: "1" })}
                className="mt-4 py-2.5 px-5 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-sm cursor-pointer"
              >
                {t("marketplace.error.retry")}
              </button>
            </div>
          ) : collection && collection.items.length === 0 ? (
            <div className="bg-white rounded-md border border-[#ded8c4] p-12 text-center text-[#173f35] max-w-2xl mx-auto my-12">
              <h3 className="text-xl font-bold text-[#173f35]">
                {t("marketplace.empty.title")}
              </h3>
              <p className="mt-2 text-sm text-[#5c6e66] max-w-md mx-auto leading-relaxed">
                {t("marketplace.empty.body")}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="py-2.5 px-6 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-sm transition-colors cursor-pointer"
                >
                  {t("marketplace.empty.reset")}
                </button>
                <button
                  type="button"
                  onClick={openCustomOrderGate}
                  className="py-2.5 px-6 border border-[#173f35] text-[#173f35] hover:bg-[#f2eddf] text-xs font-bold rounded-sm transition-colors cursor-pointer"
                >
                  {t("cta.createBuyOrder")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collection?.items.map((listing: PublicMarketplaceListing) => (
                  <PublicProductCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* 8. Pagination */}
              {collection && collection.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-between border-t border-[#e4ded0] pt-6">
                  <button
                    type="button"
                    disabled={collection.page <= 1}
                    onClick={() => {
                      updateUrlParams({ page: String(collection.page - 1) });
                      const el = document.getElementById("catalogue");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="py-2.5 px-4 rounded-sm border border-[#d8d1bd] text-xs font-bold text-[#173f35] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                  >
                    &larr; {t("marketplace.pagination.prev")}
                  </button>
                  <span className="text-xs text-[#5c6e66] tabular-nums">
                    <strong className="text-[#173f35]">{collection.page}</strong>{" "}
                    {t("marketplace.pagination.pageOf")}{" "}
                    <strong className="text-[#173f35]">{collection.totalPages}</strong>
                  </span>
                  <button
                    type="button"
                    disabled={collection.page >= collection.totalPages}
                    onClick={() => {
                      updateUrlParams({ page: String(collection.page + 1) });
                      const el = document.getElementById("catalogue");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="py-2.5 px-4 rounded-sm border border-[#d8d1bd] text-xs font-bold text-[#173f35] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                  >
                    {t("marketplace.pagination.next")} &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 9. Platform Presentation / Trust Section */}
      <div id="why-idogrow">
        <TrustFeatures />
      </div>

      {/* 10. All Filters Slide-Over Drawer */}
      <AllFiltersDrawer
        isOpen={allFiltersDrawerOpen}
        onClose={() => setAllFiltersDrawerOpen(false)}
        selectedMaterial={materialParam}
        selectedForm={formParam}
        selectedCountry={countryParam}
        minQuantity={minQtyParam}
        maxQuantity={maxQtyParam}
        minPrice={minPriceParam}
        maxPrice={maxPriceParam}
        hasDpp={hasDppParam}
        hasQualityApproved={hasQualityParam}
        hasCertifications={hasCertsParam}
        sort={sortParam}
        totalResults={collection?.total}
        loading={loading}
        facets={collection?.facets}
        activeCount={activeFilterCount}
        onUpdateParam={updateUrlParams}
        onClearAll={handleClearAllFilters}
      />

      {/* 11. Public Footer */}
      <PublicFooter />

      {/* 12. Auth Gate Modal */}
      <AuthGateModal
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        actionName={authGateAction}
        returnTo={pathname}
      />
    </div>
  );
}
