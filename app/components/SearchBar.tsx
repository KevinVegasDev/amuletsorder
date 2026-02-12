"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const SEARCH_DEBOUNCE_MS = 600;

interface SearchBarProps {
  onToggleFilters?: () => void;
  onSearch?: (query: string) => void;
  /** Valor del campo de búsqueda (ej. desde URL); si se pasa, el input es controlado */
  searchValue?: string;
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

export default function SearchBar({ onToggleFilters, onSearch, searchValue, filtersVisible = true, onOpenMobileFilters }: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState(searchValue ?? "");
  const isMobile = useIsMobile();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInternalQuery(searchValue ?? "");
  }, [searchValue]);

  useEffect(() => {
    const urlValue = searchValue ?? "";
    if (internalQuery === urlValue) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(internalQuery ?? "");
      debounceRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [internalQuery, searchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(internalQuery ?? "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch?.(internalQuery ?? "");
    }
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

      {/* Barra buscadora: búsqueda al pulsar Enter (comportamiento estándar) */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center justify-between bg-white rounded-[12px] px-3">
        <input
          type="text"
          placeholder="What are you looking for?"
          value={internalQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="flex-1  text-[14px]/10  placeholder:text-[#212121/25] text-[#212121] focus:outline-none bg-transparent"
        />
        <button type="submit" className="ml-3 p-0 border-0 bg-transparent cursor-pointer" aria-label="Search">
          <Image
            src="/icons/lupa.svg"
            alt=""
            width={16}
            height={16}
          />
        </button>
      </form>
    </div>
  );
}
