"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProductCategories } from "../lib/wordpress-api";
import { ProductCategory } from "../types/product";

interface MarketDropdownPanelProps {
  alignLeft: number;
}

const linkClassName =
  "text-sm uppercase font-medium text-black hover:text-[var(--color-hovered)] transition-colors";

const MarketDropdownPanel: React.FC<MarketDropdownPanelProps> = ({
  alignLeft,
}) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getProductCategories();
        // Excluir categorías "All" y "uncategorized"
        const filteredCats = cats.filter(
          (cat) =>
            cat.slug.toLowerCase() !== "all" &&
            cat.slug.toLowerCase() !== "uncategorized"
        );
        setCategories(filteredCats);
      } catch (err) {
        console.error("Error loading categories loop:", err);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="flex flex-row gap-16 w-full" style={{ paddingLeft: alignLeft }}>
      {/* Categories List (max 4 items per column) */}
      <div className="flex flex-col gap-2">
        {categories.slice(0, 4).map((category) => (
          <Link key={category.id} href={`/market/category/${category.slug}`} className={linkClassName}>
            {category.name}
          </Link>
        ))}
      </div>
      {categories.length > 4 && (
        <div className="flex flex-col gap-2">
          {categories.slice(4, 8).map((category) => (
            <Link key={category.id} href={`/market/category/${category.slug}`} className={linkClassName}>
              {category.name}
            </Link>
          ))}
        </div>
      )}
      {categories.length > 8 && (
        <div className="flex flex-col gap-2">
          {categories.slice(8, 12).map((category) => (
            <Link key={category.id} href={`/market/category/${category.slug}`} className={linkClassName}>
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketDropdownPanel;
