import CatalogLayout from "../components/CatalogLayout";
import { getProducts } from "../lib/wordpress-api";

export default async function Market() {
  // Obtener productos iniciales en el servidor
  let initialProducts;
  try {
    initialProducts = await getProducts(1, 12);
  } catch (error) {
    console.error('Error loading initial products:', error);
    initialProducts = undefined;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="pt-20">
        {/* Catálogo de productos */}
        <div className="px-12 py-8">
          <CatalogLayout 
            initialProducts={initialProducts}
            showFilters={true}
          />
        </div>
      </div>
    </main>
  );
}
