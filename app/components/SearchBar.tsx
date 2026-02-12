"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface SearchBarProps {
  onToggleFilters?: () => void;
  onSearch?: (query: string) => void;
  /** Si los filtros están visibles; usado para el texto del botón (Show/Hide filters) en desktop */
  filtersVisible?: boolean;
  /** En móvil, al tocar "Filters" se abre el sidebar de filtros por la izquierda */
  onOpenMobileFilters?: () => void;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 1023px)");
    setIsMobile(m.matches);
    const fn = () => setIsMobile(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  return isMobile;
};

export default function SearchBar({ onToggleFilters, onSearch, filtersVisible = true, onOpenMobileFilters }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="flex flex-row gap-4 max-w-[601px] py-1.5">
      {/* Móvil: "Filters" abre el sidebar. Desktop: "Hide filters" / "Show filters" */}
      <button
        type="button"
        onClick={isMobile ? onOpenMobileFilters : onToggleFilters}
        className="px-8 font-semibold text-base text-negro transition-colors whitespace-nowrap hover:opacity-80"
      >
        {isMobile ? "Filters" : (filtersVisible ? "Hide filters" : "Show filters")}
      </button>

      {/* Barra buscadora */}
      <div className="flex-1 flex items-center justify-between bg-white rounded-[12px] px-3">
        <input
          type="text"
          placeholder="What are you looking for?"
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1  text-[14px]/10  placeholder:text-[#212121/25] text-[#212121] focus:outline-none bg-transparent"
        />
        <Image
          src="/icons/lupa.svg"
          alt="Search"
          width={16}
          height={16}
          className="ml-3"
        />
      </div>
    </div>
  );
}
