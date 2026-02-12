import { getProductBySlug, getRecommendedProducts } from "../../../lib/wordpress-api";
import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, recommended] = await Promise.all([
    getProductBySlug(slug),
    getRecommendedProducts(20),
  ]);

  if (!product) {
    notFound();
  }

  const recommendedFiltered = recommended.filter((p) => p.id !== product.id);

  return (
    <ProductPageClient
      product={product}
      recommendedProducts={recommendedFiltered}
    />
  );
}
