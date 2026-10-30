"use client";

export interface MaterialCategoriesProps {
  readonly selectedMaterial: string;
  readonly onSelectMaterial: (material: string) => void;
}

const CATEGORIES = [
  {
    id: "ALL",
    name: "All Materials",
    description: "Full European inventory",
    image: "/images/warehouse_commodity.png",
  },
  {
    id: "HEMP",
    name: "Industrial Hemp",
    description: "Retted straw, bast, shives",
    image: "/images/categories/cat-hemp.jpg",
  },
  {
    id: "FLAX",
    name: "European Flax",
    description: "Scutched line, combed tow",
    image: "/images/categories/cat-flax.jpg",
  },
  {
    id: "SISAL",
    name: "Raw Sisal",
    description: "Cordage & industrial bast",
    image: "/images/categories/cat-sisal.jpg",
  },
  {
    id: "JUTE",
    name: "Golden Jute",
    description: "Sacks, textiles & insulation",
    image: "/images/categories/cat-jute.jpg",
  },
  {
    id: "COIR",
    name: "Coconut Coir",
    description: "Erosion geotextiles, bulk",
    image: "/images/categories/cat-coir.jpg",
  },
];

export function MaterialCategories({
  selectedMaterial,
  onSelectMaterial,
}: MaterialCategoriesProps) {
  return (
    <section className="py-4 sm:py-5 border-b border-[#e4decb] bg-white/70">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173f35]">
              Explore by Material Category
            </h2>
          </div>
          {selectedMaterial !== "ALL" && (
            <button
              type="button"
              onClick={() => onSelectMaterial("ALL")}
              className="text-xs font-bold text-[#173f35] hover:underline"
            >
              Reset to all materials &times;
            </button>
          )}
        </div>

        {/* Compact Horizontal Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedMaterial === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectMaterial(cat.id)}
                className={`group text-left rounded-xl p-2 transition-all duration-200 border flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-[#173f35] text-white border-[#173f35] shadow-sm ring-1 ring-[#c89b3c]"
                    : "bg-white text-[#173f35] border-[#e2dcce] hover:border-[#173f35] hover:shadow-xs"
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-[#f4f0e2] relative border border-[#e4decb]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#173f35]/50 flex items-center justify-center text-white text-[11px] font-bold">
                      ✓
                    </div>
                  )}
                </div>

                {/* Information */}
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-bold truncate leading-tight ${
                      isSelected ? "text-white" : "text-[#173f35]"
                    }`}
                  >
                    {cat.name}
                  </div>
                  <div
                    className={`text-[10px] truncate leading-tight mt-0.5 ${
                      isSelected ? "text-white/70" : "text-[#6d7e76]"
                    }`}
                  >
                    {cat.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
