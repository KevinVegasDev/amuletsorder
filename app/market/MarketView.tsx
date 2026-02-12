"use client";

import { useState } from "react";
import CatalogLayout from "../components/CatalogLayout";
import SearchBar from "../components/SearchBar";

export default function MarketView() {
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <>
      <SearchBar
        filtersVisible={filtersVisible}
        onToggleFilters={() => setFiltersVisible((v) => !v)}
        onOpenMobileFilters={() => setMobileFiltersOpen(true)}
      />
      <div className="py-8">
        <CatalogLayout
          showFilters={filtersVisible}
          isMobileFiltersOpen={mobileFiltersOpen}
          onCloseMobileFilters={() => setMobileFiltersOpen(false)}
        />
      </div>
    </>
  );
}
