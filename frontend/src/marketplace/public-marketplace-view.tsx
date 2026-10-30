"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  const [authGateAction, setAuthGateAction] = useState("Marketplace Transaction");

  // Data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<PublicMarketplaceListingCollection | null>(null);

  // Synchronize local search input with URL searchParam
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Push new query params to URL
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
      // Reset page to 1 whenever filters change (unless updating page itself)
      if (!("page" in updates)) {
        nextParams.delete("page");
      }
      const qs = nextParams.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Fetch data whenever URL parameters change
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
      pageSize: 15,
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
          setError(err instanceof Error ? err.message : "Failed to load listings");
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

  // Active filter count calculation
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
    <div className="min-h-screen bg-[#faf8f1] flex flex-col text-[#173f35]">
      {/* 1. Refined Public Header with Far-Right Language Selector */}
      <PublicHeader
        activeRoute="marketplace"
        onOpenAuthGate={(action) => {
          setAuthGateAction(action || "Platform Access");
          setAuthGateOpen(true);
        }}
      />

      {/* 2. Compact Marketplace Hero */}
      <PremiumHero
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* 3. Material Category Discovery */}
      <div id="materials">
        <MaterialCategories
          selectedMaterial={materialParam}
          onSelectMaterial={handleSelectCategory}
        />
      </div>

      {/* 4. Horizontal Sticky Filter Toolbar (Permanent Left Sidebar Removed) */}
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

      {/* 5. Main Full-Width Catalogue Container */}
      <main id="catalogue" className="flex-1 max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full scroll-mt-28">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4decb] gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#173f35] tracking-tight">
              Available Materials
            </h2>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#e2ede7] text-[#1e5442] border border-[#c4ded0]">
              {collection ? `${collection.total} verified lots` : "Loading..."}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#5c6e66]">
            <span>Showing verified European bulk agricultural inventory</span>
          </div>
        </div>

        {/* 6. Active Filter Chips Bar */}
        {(activeFilterCount > 0 || searchParam) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 pb-3">
            <span className="text-xs text-[#6d7e76] font-semibold mr-1">Active filters:</span>

            {searchParam && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                Search: &ldquo;{searchParam}&rdquo;
                <button
                  type="button"
                  onClick={() => updateUrlParams({ search: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove search filter"
                >
                  &times;
                </button>
              </span>
            )}

            {materialParam !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                Material: {formatMaterialType(materialParam)}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ materialType: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove material filter"
                >
                  &times;
                </button>
              </span>
            )}

            {formParam !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                Form: {formatProductForm(formParam)}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ productForm: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove form filter"
                >
                  &times;
                </button>
              </span>
            )}

            {countryParam !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                Country: {formatOriginCountry(countryParam)}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ originCountry: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove country filter"
                >
                  &times;
                </button>
              </span>
            )}

            {(minQtyParam || maxQtyParam) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                Volume: {minQtyParam || "0"}–{maxQtyParam || "∞"} tonnes
                <button
                  type="button"
                  onClick={() => updateUrlParams({ minQuantity: null, maxQuantity: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove volume filter"
                >
                  &times;
                </button>
              </span>
            )}

            {(minPriceParam || maxPriceParam) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                Price: €{minPriceParam || "0"}–€{maxPriceParam || "∞"} / t
                <button
                  type="button"
                  onClick={() => updateUrlParams({ minPrice: null, maxPrice: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove price filter"
                >
                  &times;
                </button>
              </span>
            )}

            {hasDppParam && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                DPP Traceable
                <button
                  type="button"
                  onClick={() => updateUrlParams({ hasDpp: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove DPP filter"
                >
                  &times;
                </button>
              </span>
            )}

            {hasQualityParam && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                Quality Verified
                <button
                  type="button"
                  onClick={() => updateUrlParams({ hasQualityApproved: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove quality filter"
                >
                  &times;
                </button>
              </span>
            )}

            {hasCertsParam && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef6f2] text-[#173f35] border border-[#c4ded0]">
                Certified
                <button
                  type="button"
                  onClick={() => updateUrlParams({ hasCertifications: null })}
                  className="ml-1.5 text-[#173f35] hover:text-black font-bold"
                  aria-label="Remove certification filter"
                >
                  &times;
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-[#173f35] hover:underline font-bold ml-2 underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* 7. Full-Width Product Grid — Responsive: 5 cols (>=1600px), 4 cols (~1440px), 3 cols (~1024px), 2 cols (tablet), 1 col (mobile) */}
        <div className="mt-6 w-full">
          {loading ? (
            /* Loading Skeletons matching full-width grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#e4decb] p-4 h-96 flex flex-col justify-between">
                  <div className="aspect-[16/10] bg-[#f0ebe0] rounded-xl w-full mb-3" />
                  <div className="space-y-2">
                    <div className="h-4 bg-[#f0ebe0] rounded w-1/3" />
                    <div className="h-5 bg-[#f0ebe0] rounded w-3/4" />
                  </div>
                  <div className="h-10 bg-[#f0ebe0] rounded-lg w-full mt-4" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center text-[#173f35] max-w-xl mx-auto my-12">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-red-900">Failed to load marketplace listings</h3>
              <p className="mt-1 text-sm text-[#5c6e66]">{error}</p>
              <button
                type="button"
                onClick={() => updateUrlParams({ page: "1" })}
                className="mt-4 py-2 px-5 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Retry
              </button>
            </div>
          ) : collection && collection.items.length === 0 ? (
            /* No Results State */
            <div className="bg-white rounded-2xl border border-[#ded8c4] p-12 text-center text-[#173f35] shadow-xs max-w-2xl mx-auto my-12">
              <div className="w-14 h-14 rounded-full bg-[#f4f0e2] text-[#6d7e76] mx-auto flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#173f35]">No natural materials match these filters</h3>
              <p className="mt-1 text-sm text-[#5c6e66] max-w-md mx-auto">
                Try clearing some filter criteria or selecting &ldquo;All Materials&rdquo; to view available European stock.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="py-2.5 px-6 bg-[#173f35] hover:bg-[#1e5442] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            /* Full-Width Products Grid */
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6">
                {collection?.items.map((listing: PublicMarketplaceListing) => (
                  <PublicProductCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* 8. Pagination */}
              {collection && collection.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-between border-t border-[#e4decb] pt-6">
                  <button
                    type="button"
                    disabled={collection.page <= 1}
                    onClick={() => {
                      updateUrlParams({ page: String(collection.page - 1) });
                      const el = document.getElementById("catalogue");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="py-2.5 px-4 rounded-lg border border-[#c8c0aa] text-xs font-bold text-[#173f35] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent shadow-xs"
                  >
                    &larr; Previous Page
                  </button>
                  <span className="text-xs text-[#5c6e66]">
                    Page <strong className="text-[#173f35]">{collection.page}</strong> of{" "}
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
                    className="py-2.5 px-4 rounded-lg border border-[#c8c0aa] text-xs font-bold text-[#173f35] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent shadow-xs"
                  >
                    Next Page &rarr;
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

      {/* 10. All Filters Slide-Over Drawer (for Desktop & Mobile) */}
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
