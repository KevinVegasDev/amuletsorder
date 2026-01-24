import HomeProductsSection from "./components/HomeProductsSection";
import ResumeHome from "./components/ResumeHome";
import { getBannersData } from "./lib/banner-helpers";
import { loadProductsData } from "./lib/product-helpers";
import Hero from "./components/Hero";
import CollectionSection from "./components/CollectionSection";
import { getCollectionsData } from "./lib/collection-helpers";
import RecommendedSection from "./components/RecommendedSection";
import Trending from "./components/Trending";
import FeaturesSection from "./components/FeaturesSection";
import CountdownTimer from "./components/CountdownTimer";

// Evitar prerender en build: fetches a /api usan localhost (no existe durante build)
export const dynamic = "force-dynamic";

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

// Fecha objetivo para la próxima colección (configura esto según tu necesidad)
// Formato: YYYY-MM-DDTHH:mm:ss
const NEXT_COLLECTION_DATE = "2024-12-31T23:59:59"; // Ejemplo: Fin de año

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

  // Obtener colecciones (fetch directo WordPress, como loadProductsData)
  const collections = await getCollectionsData();

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

      {/* Countdown Timer para próxima colección */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-8">
        <CountdownTimer
          targetDate={NEXT_COLLECTION_DATE}
          title="Próxima Colección Limitada"
          description="No te pierdas nuestro próximo lanzamiento exclusivo"
        />
      </div>

      {/* Sección de Categorías HOME */}
      <HomeProductsSection
        categories={productsData.homeCategories}
        categoryImages={productsData.categoryImages}
      />
      <CollectionSection collections={collections} />

      {/* Sección de Productos Recomendados (desde loadProductsData, fetch directo WooCommerce) */}
      <RecommendedSection products={productsData.recommendedProducts} />

      {/* Sección Trending (desde loadProductsData, fetch directo WooCommerce) */}
      <Trending products={productsData.trendingProducts} />

      {/* Sección caracteristicas */}
      <FeaturesSection features={featuresData} />

      {/* Sección Resum about us */}
      <ResumeHome />
    </main>
  );
}
