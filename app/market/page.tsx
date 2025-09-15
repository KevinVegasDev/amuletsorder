"use client";

import CatalogLayout from "../components/CatalogLayout";

export default function Market() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="pt-20">
        {/* Catálogo de productos */}
        <div className="px-12 py-8">
          <CatalogLayout showFilters={true} />
        </div>
      </div>
    </main>
  );
}
