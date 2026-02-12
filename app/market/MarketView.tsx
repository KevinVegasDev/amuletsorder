"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import CatalogLayout from "../components/CatalogLayout";
import SearchBar from "../components/SearchBar";

export default function MarketView() {
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchValue = searchParams.get("search") ?? "";

  /** Búsqueda solo al enviar (Enter); no en cada tecla */
  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("search", query.trim());
      } else {
        params.delete("search");
      }
      const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newURL, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <>
      <SearchBar
        filtersVisible={filtersVisible}
        onToggleFilters={() => setFiltersVisible((v) => !v)}
        onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        searchValue={searchValue}
        onSearch={handleSearch}
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
