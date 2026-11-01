"use client";

import { useEffect, useState } from "react";
import {
  APPROVED_MATERIAL_TYPES,
  APPROVED_PRICE_UNITS,
  APPROVED_PRODUCT_FORMS,
  APPROVED_QUANTITY_UNITS,
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  PRICE_UNIT_LABELS,
  type PriceUnit,
  PRODUCT_FORM_LABELS,
  type ProductForm,
  QUANTITY_UNIT_LABELS,
  type QuantityUnit,
} from "../listings/contracts";
import { listMarketplaceListings } from "./api";
import type {
  MarketplaceListingSummary,
  MarketplaceQuery,
} from "./contracts";

type MarketplaceCatalogueProps = Readonly<{
  onSelectListing: (listingId: string) => void;
}>;

function SearchIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RotateCcwIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
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

function GlobeIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ScaleIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MarketplaceCatalogue({ onSelectListing }: MarketplaceCatalogueProps) {
  const [listings, setListings] = useState<MarketplaceListingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [materialType, setMaterialType] = useState<string>("ALL");
  const [productForm, setProductForm] = useState<string>("ALL");
  const [originCountry, setOriginCountry] = useState<string>("");
  const [harvestYear, setHarvestYear] = useState<string>("");
  const [quantityUnit, setQuantityUnit] = useState<string>("ALL");
  const [minQuantity, setMinQuantity] = useState<string>("");
  const [maxQuantity, setMaxQuantity] = useState<string>("");
  const [hasPriceOnly, setHasPriceOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    const query: MarketplaceQuery = {
      search: searchTerm.trim() || undefined,
      materialType: materialType !== "ALL" ? materialType : undefined,
      productForm: productForm !== "ALL" ? productForm : undefined,
      originCountry: originCountry.trim() || undefined,
      harvestYear: harvestYear ? Number.parseInt(harvestYear, 10) : undefined,
      quantityUnit: quantityUnit !== "ALL" ? quantityUnit : undefined,
      minQuantity: minQuantity ? Number.parseFloat(minQuantity) : undefined,
      maxQuantity: maxQuantity ? Number.parseFloat(maxQuantity) : undefined,
      hasPrice: hasPriceOnly ? true : undefined,
      minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
    };

    try {
      const response = await listMarketplaceListings(query);
      setListings(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load marketplace listings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchListings();
  }, [
    materialType,
    productForm,
    quantityUnit,
    hasPriceOnly,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchListings();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setMaterialType("ALL");
    setProductForm("ALL");
    setOriginCountry("");
    setHarvestYear("");
    setQuantityUnit("ALL");
    setMinQuantity("");
    setMaxQuantity("");
    setHasPriceOnly(false);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    materialType !== "ALL" ||
    productForm !== "ALL" ||
    Boolean(originCountry) ||
    Boolean(harvestYear) ||
    quantityUnit !== "ALL" ||
    Boolean(minQuantity) ||
    Boolean(maxQuantity) ||
    hasPriceOnly ||
    Boolean(minPrice) ||
    Boolean(maxPrice);

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="rounded-2xl border border-[#e2d9c8] bg-gradient-to-r from-[#173f35] via-[#204a3e] to-[#284f41] p-6 text-[#fffaf0] shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-[#e5b84b]/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#e5b84b]">
              <ScaleIcon className="h-3.5 w-3.5" />
              Verified B2B Commodity Trading
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Natural Fibre Marketplace
            </h1>
            <p className="mt-1 text-sm text-[#e2d9c8]/90">
              Discover verified European supply of raw straw, retted fibres, technical hemp, sisal, and natural co-products.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {loading ? "Searching..." : `${total} Available Listing${total === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Quick Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by fibre type, description, origin (e.g. hemp, France, retted)..."
            className="w-full rounded-xl border border-[#e2d9c8] bg-white py-2.5 pl-10 pr-24 text-sm text-slate-800 placeholder-slate-400 focus:border-[#284f41] focus:outline-none focus:ring-2 focus:ring-[#284f41]/20"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#284f41] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1f3f34]"
          >
            Search
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2d9c8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 md:hidden"
        >
          <FilterIcon className="h-4 w-4 text-[#284f41]" />
          Filters {hasActiveFilters && "(Active)"}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-transparent px-3 py-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            <RotateCcwIcon className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Content Layout: Filters Sidebar + Listings Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside
          className={`space-y-5 rounded-2xl border border-[#e2d9c8] bg-[#fffaf0]/60 p-5 backdrop-blur-sm ${
            showFiltersMobile ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#e2d9c8] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#173f35]">
              Marketplace Filters
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-medium text-[#284f41] underline hover:text-[#173f35]"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Material Type Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Natural Fibre Type
            </label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#e2d9c8] bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#284f41] focus:outline-none focus:ring-1 focus:ring-[#284f41]"
            >
              <option value="ALL">All Materials</option>
              {APPROVED_MATERIAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MATERIAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Product Form Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Product Form
            </label>
            <select
              value={productForm}
              onChange={(e) => setProductForm(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#e2d9c8] bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#284f41] focus:outline-none focus:ring-1 focus:ring-[#284f41]"
            >
              <option value="ALL">All Forms</option>
              {APPROVED_PRODUCT_FORMS.map((form) => (
                <option key={form} value={form}>
                  {PRODUCT_FORM_LABELS[form]}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Unit & Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Quantity / Volume
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                placeholder="Min qty"
                className="w-full rounded-lg border border-[#e2d9c8] bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#284f41] focus:outline-none"
              />
              <input
                type="number"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
                placeholder="Max qty"
                className="w-full rounded-lg border border-[#e2d9c8] bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#284f41] focus:outline-none"
              />
            </div>
            <select
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#e2d9c8] bg-white px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="ALL">Any Unit</option>
              {APPROVED_QUANTITY_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {QUANTITY_UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
          </div>

          {/* Origin Country */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Country of Origin
            </label>
            <input
              type="text"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              placeholder="e.g. France, Netherlands, Germany"
              className="mt-1.5 w-full rounded-lg border border-[#e2d9c8] bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#284f41] focus:outline-none"
            />
          </div>

          {/* Harvest Year */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Harvest Year
            </label>
            <input
              type="number"
              value={harvestYear}
              onChange={(e) => setHarvestYear(e.target.value)}
              placeholder="e.g. 2026"
              className="mt-1.5 w-full rounded-lg border border-[#e2d9c8] bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#284f41] focus:outline-none"
            />
          </div>

          {/* Pricing Filters */}
          <div className="space-y-2 border-t border-[#e2d9c8] pt-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Price Filter
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasPriceOnly"
                checked={hasPriceOnly}
                onChange={(e) => setHasPriceOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#284f41] focus:ring-[#284f41]"
              />
              <label htmlFor="hasPriceOnly" className="text-xs text-slate-700">
                Price specified only
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min €"
                className="w-full rounded-lg border border-[#e2d9c8] bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#284f41] focus:outline-none"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max €"
                className="w-full rounded-lg border border-[#e2d9c8] bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#284f41] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void fetchListings()}
            className="w-full rounded-lg bg-[#173f35] py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#204a3e]"
          >
            Apply Filters
          </button>
        </aside>

        {/* Listings Grid */}
        <section className="space-y-4 md:col-span-3">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">Error retrieving marketplace listings</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={() => void fetchListings()}
                className="mt-2 text-xs font-bold underline hover:text-red-900"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="h-5 w-24 rounded bg-slate-200" />
                  <div className="mt-3 h-6 w-3/4 rounded bg-slate-200" />
                  <div className="mt-4 h-16 rounded bg-slate-100" />
                  <div className="mt-4 flex justify-between">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="h-4 w-20 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e2d9c8] bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fbf8ef] text-[#284f41]">
                <SearchIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-800">
                No matching listings found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your search terms or clearing some filters to see available raw materials.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#284f41] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f3f34]"
                >
                  <RotateCcwIcon className="h-3.5 w-3.5" />
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-[#e2d9c8] bg-white p-5 shadow-sm transition-all hover:border-[#284f41]/50 hover:shadow-md"
                >
                  <div>
                    {/* Badges & Meta */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-[#284f41]/10 px-2 py-0.5 text-xs font-semibold text-[#284f41]">
                        {MATERIAL_TYPE_LABELS[item.materialType as MaterialType] || item.materialType}
                      </span>
                      {item.productForm && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200/60">
                          {PRODUCT_FORM_LABELS[item.productForm as ProductForm] || item.productForm}
                        </span>
                      )}
                      {item.originCountry && (
                        <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <GlobeIcon className="h-3 w-3 text-slate-400" />
                          {item.originCountry}
                          {item.harvestYear && ` (${item.harvestYear})`}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-[#284f41]">
                      {item.title}
                    </h3>

                    {/* Description preview */}
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                        {item.description}
                      </p>
                    )}

                    {/* Commercial Highlights */}
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#fbf8ef] p-3 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">
                          Available Volume
                        </span>
                        <p className="mt-0.5 font-bold text-slate-900">
                          {item.quantity.toLocaleString()}{" "}
                          <span className="font-normal text-slate-600">
                            {QUANTITY_UNIT_LABELS[item.quantityUnit as QuantityUnit] || item.quantityUnit}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">
                          Target Price
                        </span>
                        <p className="mt-0.5 font-bold text-[#173f35]">
                          {item.priceAmount !== null && item.priceAmount !== undefined ? (
                            <>
                              €{item.priceAmount.toLocaleString()}{" "}
                              <span className="font-normal text-slate-600">
                                {PRICE_UNIT_LABELS[item.priceUnit as PriceUnit] || item.priceUnit}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium text-slate-500 italic">
                              Price not specified
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Trust & Action */}
                  <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <ShieldCheckIcon className="h-4 w-4 text-[#284f41]" />
                      <span className="font-medium text-slate-700 truncate max-w-[140px]">
                        {item.supplier.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectListing(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#284f41] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#173f35]"
                    >
                      View Details
                      <ArrowRightIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
