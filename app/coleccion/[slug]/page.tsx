import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCollections } from "../../lib/wordpress-api";
import CatalogLayout from "../../components/CatalogLayout";
import CollectionStoriesNavigation from "../../components/CollectionStoriesNavigation";
import ProductSkeleton from "../../components/ProductSkeleton";
import { getProductCategories } from "../../lib/wordpress-api";
import { loadProductsData } from "../../lib/product-helpers";

// Evitar prerender en build: fetches a /api usan localhost (no existe en build)
// y CatalogLayout/CollectionStories usan useSearchParams (requieren Suspense)
export const dynamic = "force-dynamic";

// Función para generar slug desde el título (debe coincidir con CollectionStoriesNavigation)
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ""); // Remover guiones al inicio y final
};

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const collections = await getCollections();
    return collections.map((collection) => ({
      slug: generateSlug(collection.title),
    }));
  } catch (error) {
    console.error("Error generating static params for collections:", error);
    return [];
  }
}

export async function generateMetadata({ params }: CollectionPageProps) {
  try {
    const { slug } = await params;
    const collections = await getCollections();
    const collection = collections.find(
      (c) => generateSlug(c.title) === slug
    );

    if (!collection) {
      return {
        title: "Colección no encontrada",
      };
    }

    return {
      title: `${collection.title} | Amulets`,
      description: collection.description,
      openGraph: {
        title: collection.title,
        description: collection.description,
        images: collection.imageUrl ? [collection.imageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Colección | Amulets",
    };
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  try {
    const { slug } = await params;
    const collections = await getCollections();
    const collection = collections.find(
      (c) => generateSlug(c.title) === slug
    );

    if (!collection) {
      notFound();
    }

    // Obtener categorías de productos para la navegación
    const categories = await getProductCategories();

    // Obtener productos para las imágenes de categorías
    const productsData = await loadProductsData({
      productLimit: 100,
      filterOptions: {
        excludeSlugs: ["uncategorized", "all"],
        excludeEmpty: true,
      },
    });

    // Filtrar categorías que tienen productos
    const categoriesWithProducts = categories.filter(
      (cat) => cat.count && cat.count > 0
    );

    return (
      <main className="min-h-screen bg-gray-50">
        <div className="pt-20">
          {/* Header de la colección (fuera de Suspense, no usa useSearchParams) */}
          <div className="max-w-[1920px] mx-auto px-4 md:px-12 py-8">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="text-lg text-gray-600">{collection.description}</p>
              )}
            </div>
          </div>

          <Suspense
            fallback={
              <div className="px-4 md:px-12 pb-8">
                <ProductSkeleton count={12} className="mb-8" />
              </div>
            }
          >
            {/* Navegación y catálogo usan useSearchParams */}
            {categoriesWithProducts.length > 0 && (
              <CollectionStoriesNavigation
                categories={categoriesWithProducts}
                categoryImages={productsData.categoryImages}
              />
            )}
            <div className="px-4 md:px-12 pb-8">
              <CatalogLayout showFilters={true} />
            </div>
          </Suspense>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading collection:", error);
    notFound();
  }
}
