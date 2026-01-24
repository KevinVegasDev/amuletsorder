"use client";

import React from "react";
import { ProductAttribute } from "../../types/product";
import { isColorAttribute, getColorHex } from "../../market/utils/productUtils";

interface ProductAttributesProps {
  attributes: ProductAttribute[];
  selectedAttributes: Record<string, string>;
  getAvailableOptions: (attributeName: string) => string[];
  isOptionAvailable: (attributeName: string, optionValue: string) => boolean;
  onAttributeChange: (attributeName: string, value: string) => void;
}

/**
 * Component to display product attributes (Size, Color, etc.)
 */
export const ProductAttributes: React.FC<ProductAttributesProps> = ({
  attributes,
  selectedAttributes,
  getAvailableOptions,
  isOptionAvailable,
  onAttributeChange,
}) => {
  void getAvailableOptions; // Prop passed by parent, used for future filtering
  return (
    <>
      {attributes.map((attribute, index) => {
        const isColor = isColorAttribute(attribute.name);
        const selectedValue = selectedAttributes[attribute.name];

        return (
          <div
            key={`${attribute.name}-${attribute.id || index}`}
            className="mb-6"
          >
            <label className="block text-negro font-medium mb-2">
              {attribute.name}
            </label>
            {isColor ? (
              <div className="flex gap-3 flex-wrap">
                {attribute.options.map((option, optIndex) => {
                  const isAvailable = isOptionAvailable(
                    attribute.name,
                    option
                  );
                  const isSelected = selectedValue === option;

                  return (
                    <button
                      key={`${attribute.name}-${option}-${optIndex}`}
                      onClick={() => {
                        if (isAvailable) {
                          onAttributeChange(attribute.name, option);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 ${isSelected
                          ? "border-negro scale-110"
                          : isAvailable
                            ? "border-gray-300 hover:border-gray-400"
                            : "border-gray-200 opacity-40 cursor-not-allowed"
                        }`}
                      style={{
                        backgroundColor: getColorHex(option),
                        cursor: isAvailable ? "pointer" : "not-allowed",
                      }}
                      aria-label={option}
                      title={!isAvailable ? "Not available" : option}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {attribute.options.map((option, optIndex) => {
                  const isAvailable = isOptionAvailable(
                    attribute.name,
                    option
                  );
                  const isSelected = selectedValue === option;

                  return (
                    <button
                      key={`${attribute.name}-${option}-${optIndex}`}
                      onClick={() => {
                        if (isAvailable) {
                          onAttributeChange(attribute.name, option);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`px-4 py-2 border-2 rounded transition-colors duration-200 font-medium ${isSelected
                          ? "bg-negro text-white border-negro"
                          : isAvailable
                            ? "bg-white text-negro border-gray-300 hover:border-negro"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                        }`}
                      title={!isAvailable ? "Not available" : option}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

