export interface PublicMarketplaceSupplierSummary {
  readonly isVerified: boolean;
  readonly country: string | null;
}

export interface PublicMarketplaceSiteSummary {
  readonly name: string;
  readonly facilityType: string | null;
  readonly country: string | null;
  readonly city: string | null;
}

export interface PublicMarketplaceCertification {
  readonly documentType: string;
  readonly status: string;
}

export interface PublicMarketplaceQualitySummary {
  readonly hasInspection: boolean;
  readonly isApproved: boolean;
  readonly classificationLabel: string | null;
  readonly certificateNumber: string | null;
}

export interface PublicMarketplaceListing {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly materialType: string;
  readonly productForm: string | null;
  readonly quantity: number;
  readonly quantityUnit: string;
  readonly priceAmount: number | null;
  readonly currency: string;
  readonly priceUnit: string;
  readonly originCountry: string | null;
  readonly harvestYear: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly supplier: PublicMarketplaceSupplierSummary;
  readonly site: PublicMarketplaceSiteSummary | null;
  readonly certifications: readonly PublicMarketplaceCertification[];
  readonly quality: PublicMarketplaceQualitySummary;
  readonly hasDpp: boolean;
  readonly dppNumber: string | null;
  readonly images: readonly string[];
}

export interface PublicMarketplaceListingDetail extends PublicMarketplaceListing {
  readonly relatedListings?: readonly PublicMarketplaceListing[];
}

export interface PublicMarketplaceFacetItem {
  readonly value: string;
  readonly label: string;
  readonly count: number;
}

export interface PublicMarketplaceCountryFacet {
  readonly value: string;
  readonly count: number;
}

export interface PublicMarketplaceFacets {
  readonly materials: readonly PublicMarketplaceFacetItem[];
  readonly productForms: readonly PublicMarketplaceFacetItem[];
  readonly countries: readonly PublicMarketplaceCountryFacet[];
  readonly priceRange: { readonly min: number | null; readonly max: number | null };
  readonly quantityRange: { readonly min: number | null; readonly max: number | null };
  readonly totalWithDpp: number;
  readonly totalWithCertifications: number;
  readonly totalQualityApproved: number;
}

export interface PublicMarketplaceListingCollection {
  readonly items: readonly PublicMarketplaceListing[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly facets: PublicMarketplaceFacets;
}

export interface PublicMarketplaceQuery {
  readonly search?: string;
  readonly materialType?: string;
  readonly productForm?: string;
  readonly originCountry?: string;
  readonly harvestYear?: number;
  readonly minQuantity?: number;
  readonly maxQuantity?: number;
  readonly quantityUnit?: string;
  readonly hasPrice?: boolean;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly priceUnit?: string;
  readonly hasCertifications?: boolean;
  readonly hasQualityApproved?: boolean;
  readonly hasDpp?: boolean;
  readonly sort?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface RegisterBuyerDto {
  readonly email: string;
  readonly password: string;
  readonly companyName: string;
  readonly contactName?: string;
  readonly country?: string;
}

export interface RegisterBuyerResult {
  readonly status: "authenticated";
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly role: string | null;
  };
  readonly organisation: {
    readonly id: string;
    readonly name: string;
    readonly organisationType: "BUYER";
  };
}

export interface SessionStatus {
  readonly status: "authenticated" | "unauthenticated";
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly role?: string | null;
  } | null;
}
