import type {
  BuyOrderQuery,
  BuyOrderStatus,
  CreateBuyOrderInput,
  UpdateBuyOrderInput,
} from "./contracts";

export type BuyOrderRecord = Readonly<{
  id: string;
  buyerOrganisationId: string;
  createdByUserId: string | null;
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  deliveryCountry: string | null;
  deliveryDestination: string | null;
  requestedDeliveryDate: Date | null;
  targetPriceAmount: number | null;
  currency: string;
  targetPriceUnit: string;
  acceptableOriginCountries: string | null;
  qualityRequirements: string | null;
  packagingRequirements: string | null;
  certificationRequirements: string | null;
  transportPreferences: string | null;
  paymentTerms: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  buyerOrganisation?: {
    id: string;
    name: string;
    country: string | null;
    verificationStatus: string;
  };
}>;

export abstract class BuyOrdersRepository {
  abstract findBuyOrdersForOrganisation(
    buyerOrganisationId: string,
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }>;

  abstract findBuyOrderById(id: string): Promise<BuyOrderRecord | null>;

  abstract createBuyOrder(
    buyerOrganisationId: string,
    createdByUserId: string | null,
    input: CreateBuyOrderInput,
    initialStatus: BuyOrderStatus,
  ): Promise<BuyOrderRecord>;

  abstract updateBuyOrder(
    id: string,
    input: UpdateBuyOrderInput,
  ): Promise<BuyOrderRecord>;

  abstract updateStatus(
    id: string,
    newStatus: BuyOrderStatus,
  ): Promise<BuyOrderRecord>;

  abstract findOpenBuyOrdersForTrader(
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }>;

  abstract findDraftBuyOrdersForTrader(
    traderUserId: string,
    query?: BuyOrderQuery,
  ): Promise<{ items: BuyOrderRecord[]; total: number }>;

  abstract deleteBuyOrder(id: string): Promise<void>;
}
