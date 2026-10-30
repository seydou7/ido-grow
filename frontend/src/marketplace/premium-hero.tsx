"use client";

export interface PremiumHeroProps {
  readonly searchInput: string;
  readonly onSearchChange: (value: string) => void;
  readonly onSearchSubmit: (e: React.FormEvent) => void;
}

export function PremiumHero({
  searchInput,
  onSearchChange,
  onSearchSubmit,
}: PremiumHeroProps) {
  return (
    <section className="relative bg-[#173f35] text-white overflow-hidden py-8 sm:py-10 lg:py-12 border-b border-[#0f2923]">
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(200,155,60,0.12),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: Sourcing Pitch & Search Bar */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#13352c] border border-[#c89b3c]/40 text-xs font-semibold tracking-wide text-[#f5ebd2]">
              <span className="w-2 h-2 rounded-full bg-[#c89b3c] animate-pulse" />
              <span>European Natural Commodity Sourcing</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Source traceable natural fibres with full commercial clarity.
            </h1>

            <p className="text-xs sm:text-sm text-[#c0d6cc] max-w-xl font-normal leading-relaxed">
              Direct access to certified European agricultural cooperatives and decortication mills.
              Verified specifications, structured quality inspection, and Digital Product Passports.
            </p>

            {/* Prominent Sourcing Search Bar */}
            <form onSubmit={onSearchSubmit} className="pt-1">
              <div className="flex flex-col sm:flex-row gap-2 bg-white/10 p-1.5 rounded-xl border border-white/20 backdrop-blur-md shadow-lg max-w-xl">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86a89b]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search hemp, retted straw, technical fibre, France, organic..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-[#173f35] rounded-lg text-sm placeholder-[#6b7c74] focus:outline-none focus:ring-2 focus:ring-[#c89b3c]"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#c89b3c] hover:bg-[#b8860b] text-[#13352c] text-sm font-bold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c89b3c] shrink-0"
                >
                  Search Materials
                </button>
              </div>
            </form>

            {/* Procurement Trust Badges */}
            <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#d0e2da]">
              <div className="flex items-center space-x-1.5">
                <span className="text-[#c89b3c] font-bold">✓</span>
                <span>Verified Agricultural Lots</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[#c89b3c] font-bold">✓</span>
                <span>Structured Quality Lab</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[#c89b3c] font-bold">✓</span>
                <span>Digital Product Passport</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[#c89b3c] font-bold">✓</span>
                <span>Managed Trade Logistics</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Commodity Warehouse Visual */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-black/20 group">
              <img
                src="/images/warehouse_commodity.png"
                alt="European agricultural commodity warehouse inventory"
                className="w-full h-64 xl:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#173f35]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                <div className="bg-[#173f35]/90 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-md">
                  <span className="font-bold text-white block">Raw Commodity Inventory</span>
                  <span className="text-[11px] text-[#b4dfcb]">Warehouse verified lots</span>
                </div>
                <span className="text-[#f5ebd2] font-semibold px-2.5 py-1 bg-white/20 rounded-md backdrop-blur-md text-[11px] border border-[#c89b3c]/40">
                  EU Origin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
