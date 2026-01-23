import HomeProductsSection from "./components/HomeProductsSection";
import ResumeHome from "./components/ResumeHome";
import { getBannersData } from "./lib/banner-helpers";
import { loadProductsData } from "./lib/product-helpers";
import Hero from "./components/Hero";
import CollectionSection from "./components/CollectionSection";
import { getCollectionsData } from "./lib/collection-helpers";
import RecommendedSection from "./components/RecommendedSection";
import { getRecommendedProductsData } from "./lib/recommended-helpers";
import Trending from "./components/Trending";
import { getTrendingProductsData } from "./lib/trending-helpers";
import FeaturesSection from "./components/FeaturesSection";

// Array de características con iconos y descripciones
const featuresData = [
  {
    icon: "/icons/shipping.svg",
    description: "Free shipping in +$30 orders ",
  },
  {
    icon: "/icons/returns.svg",
    description: "Secure payments",
  },
  {
    icon: "/icons/payments.svg",
    description: "Returns available within 15 days",
  },
];

export default async function Home() {
  // Obtener y transformar los banners desde WordPress
  const { heroImage } = await getBannersData();

  // Obtener y procesar productos y categorías
  const productsData = await loadProductsData({
    productLimit: 20,
    filterOptions: {
      excludeSlugs: ["uncategorized"],
      excludeEmpty: true,
    },
  });

  // Obtener colecciones
  const collections = await getCollectionsData();

  // Obtener productos recomendados
  const recommendedProducts = await getRecommendedProductsData();

  // Obtener productos trending
  const trendingProducts = await getTrendingProductsData();

  return (
    <main className="">
      {heroImage && (
        <Hero
          imageSrc={heroImage.imageUrl}
          imageAlt={heroImage.imageAlt || "Street wear fashion hero image"}
          title="Street wear is the new era"
          description="Your soul is your best outfit."
          ctaText="Check market"
          ctaLink="/market"
        />
      )}

      {/* Sección de Categorías HOME */}
      <HomeProductsSection
        categories={productsData.homeCategories}
        categoryImages={productsData.categoryImages}
      />
      <CollectionSection collections={collections} />

      {/* Sección de Productos Recomendados */}
      <RecommendedSection products={recommendedProducts} />

      {/* Sección Trending */}
      <Trending products={trendingProducts} />

      {/* Sección caracteristicas */}
      <FeaturesSection features={featuresData} />

      {/* Sección Resum about us */}
      <ResumeHome />
    </main>
  );
}
