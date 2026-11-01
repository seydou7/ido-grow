"use client";

import { useI18n } from "@/i18n/i18n-provider";

export interface MaterialCategoriesProps {
  readonly selectedMaterial: string;
  readonly onSelectMaterial: (material: string) => void;
}

export function MaterialCategories({
  selectedMaterial,
  onSelectMaterial,
}: MaterialCategoriesProps) {
  const { t } = useI18n();

  const categories = [
    {
      id: "ALL",
      name: t("marketplace.categories.all.name"),
      description: t("marketplace.categories.all.desc"),
      image: "/images/warehouse_commodity.png",
    },
    {
      id: "HEMP",
      name: t("marketplace.categories.hemp.name"),
      description: t("marketplace.categories.hemp.desc"),
      image: "/images/home-v2/fibre-hemp.jpg",
    },
    {
      id: "FLAX",
      name: t("marketplace.categories.flax.name"),
      description: t("marketplace.categories.flax.desc"),
      image: "/images/home-v2/fibre-flax.jpg",
    },
    {
      id: "SISAL",
      name: t("marketplace.categories.sisal.name"),
      description: t("marketplace.categories.sisal.desc"),
      image: "/images/home-v2/fibre-sisal.jpg",
    },
    {
      id: "JUTE",
      name: t("marketplace.categories.jute.name"),
      description: t("marketplace.categories.jute.desc"),
      image: "/images/home-v2/fibre-jute.jpg",
    },
    {
      id: "COIR",
      name: t("marketplace.categories.coir.name"),
      description: t("marketplace.categories.coir.desc"),
      image: "/images/home-v2/fibre-coir.jpg",
    },
  ];

  return (
    <section className="py-6 border-b border-[#e4ded0] bg-[#f2eddf]/70">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a22]">
            {t("marketplace.categories.label")}
          </h2>
          {selectedMaterial !== "ALL" && (
            <button
              type="button"
              onClick={() => onSelectMaterial("ALL")}
              className="text-xs font-semibold text-[#173f35] hover:text-[#1e5442] underline underline-offset-4 cursor-pointer"
            >
              {t("marketplace.categories.reset")} &times;
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedMaterial === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectMaterial(cat.id)}
                aria-pressed={isSelected}
                className={`text-left rounded-md p-2.5 transition-colors duration-150 border flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-[#173f35] text-white border-[#173f35] shadow-xs"
                    : "bg-white text-[#173f35] border-[#ded8c4] hover:border-[#173f35]"
                }`}
              >
                <div className="w-12 h-12 shrink-0 rounded-sm overflow-hidden bg-[#ece6d6] relative">
                  <img
                    src={cat.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-bold truncate leading-snug ${
                      isSelected ? "text-white" : "text-[#173f35]"
                    }`}
                  >
                    {cat.name}
                  </div>
                  <div
                    className={`text-[11px] truncate leading-tight mt-0.5 ${
                      isSelected ? "text-[#dbe7e1]" : "text-[#5c6e66]"
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
