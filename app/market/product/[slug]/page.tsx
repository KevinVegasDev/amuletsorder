import { getProductBySlug } from "../../../lib/wordpress-api";
import { notFound } from "next/navigation";
import ProductImageGallery from "../../../components/ProductDetails/ProductImageGallery";
import ProductImagePreview from "../../../components/ProductDetails/ProductImagePreview";
import ProductDetails from "../../../components/ProductDetails/ProductDetails";
import ProductPageClient from "./ProductPageClient";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}
