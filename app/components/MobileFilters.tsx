"use client";

import React, { useState } from 'react';
import { ProductFilters as ProductFiltersType } from '../types/product';
import ProductFilters from './ProductFilters';
import { getProductCategories } from "../lib/wordpress-api";

interface MobileFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onClose
}) => {
  const [tempFilters, setTempFilters] = useState<ProductFiltersType>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setTempFilters({});
    onClearFilters();
    onClose();
  };

  const handleTempFiltersChange = (newFilters: ProductFiltersType) => {
    setTempFilters(newFilters);
  };

  const hasActiveFilters = Object.keys(tempFilters).length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close filters"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <ProductFilters
            filters={tempFilters}
            onFiltersChange={handleTempFiltersChange}
            onClearFilters={() => setTempFilters({})}
            className="border-0 rounded-none shadow-none"
          />
        </div>

        {/* Action buttons footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-negro rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilters;