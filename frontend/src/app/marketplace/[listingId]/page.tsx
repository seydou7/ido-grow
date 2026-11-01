import type { Metadata } from "next";
import { PublicProductDetailView } from "@/marketplace/public-product-detail-view";

interface PageProps {
  readonly params: Promise<{ readonly listingId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { listingId } = await params;
  return {
    title: `Commodity Detail (${listingId}) | I Do Grow Marketplace`,
    description: "View specifications, origin, quality certification, and Digital Product Passport traceability for this natural fibre lot.",
    openGraph: {
      title: `Natural Material Detail | I Do Grow`,
      description: "Verified European natural raw fibre on I Do Grow.",
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { listingId } = await params;

  return <PublicProductDetailView listingId={listingId} />;
}
