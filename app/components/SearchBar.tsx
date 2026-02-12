"use client";

import Image from "next/image";
import { useState } from "react";

interface SearchBarProps {
  onToggleFilters?: () => void;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onToggleFilters, onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="flex flex-row gap-4 max-w-[601px] py-1.5">
      {/* Botón Hide filters */}
      <button
        onClick={onToggleFilters}
        className="px-8  font-semibold text-base text-negro   transition-colors whitespace-nowrap"
      >
        Hide filters
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
