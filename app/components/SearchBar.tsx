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
  const [suggestions, setSuggestions] = useState<Array<{ id: number, name: string, slug: string, image: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isMobile = useIsMobile();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalQuery(searchValue ?? "");
  }, [searchValue]);

  // Cierra los resultados si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch a la API de Sugerencias
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (e) {
      console.error("Failed to fetch suggestions:", e);
    }
  };

  useEffect(() => {
    const urlValue = searchValue ?? "";
    if (internalQuery === urlValue) return;
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(internalQuery);
      // Removed automatic onSearch emit on typing to prevent full page reload on every key stroke
      debounceRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [internalQuery, searchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalQuery(e.target.value);
    if (e.target.value.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    // Dirigir directamente a la página del producto para mayor agilidad:
    window.location.href = `/market/product/${slug}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch?.(internalQuery ?? "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowSuggestions(false);
      onSearch?.(internalQuery ?? "");
    }
  };

  return (
    <div className="flex flex-row gap-4 max-w-[601px] py-1.5" ref={searchContainerRef}>
      {/* Móvil: "Filters" abre el sidebar. Desktop: "Hide filters" / "Show filters" */}
      <button
        type="button"
        onClick={isMobile ? onOpenMobileFilters : onToggleFilters}
        className="px-8 font-semibold text-base text-negro transition-colors whitespace-nowrap hover:opacity-80"
      >
        {isMobile ? "Filters" : (filtersVisible ? "Hide filters" : "Show filters")}
      </button>

      {/* Contenedor del Search Input */}
      <div className="flex-1 relative">
        <form onSubmit={handleSubmit} className="flex items-center justify-between bg-white rounded-[12px] px-3 h-full min-h-[44px]">
          <input
            type="text"
            placeholder="What are you looking for?"
            value={internalQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="flex-1 w-full text-[14px]/10 placeholder:text-[#212121/25] text-[#212121] focus:outline-none bg-transparent"
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

        {/* Dropdown de Sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
            <ul className="flex flex-col">
              {suggestions.map((item) => (
                <li key={item.id} className="border-b last:border-b-0 border-gray-50">
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(item.slug)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-negro truncate">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
