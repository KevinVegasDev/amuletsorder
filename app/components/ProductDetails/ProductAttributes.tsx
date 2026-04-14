"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { ProductAttribute } from "../../types/product";
import { isColorAttribute } from "../../market/utils/productUtils";

interface ProductAttributesProps {
  attributes: ProductAttribute[];
  selectedAttributes: Record<string, string>;
  getAvailableOptions: (attributeName: string) => string[];
  isOptionAvailable: (attributeName: string, optionValue: string) => boolean;
  onAttributeChange: (attributeName: string, value: string) => void;
  hideLabel?: boolean;
  sizeButtonClassName?: string;
  colorSwatchImages?: Record<string, string>;
  missingAttributes?: string[];
}

export const ProductAttributes: React.FC<ProductAttributesProps> = ({
  attributes,
  selectedAttributes,
  getAvailableOptions,
  isOptionAvailable,
  onAttributeChange,
  hideLabel = false,
  sizeButtonClassName = "px-4 py-2 border-2 rounded transition-colors duration-200 font-medium",
  colorSwatchImages,
  missingAttributes = [],
}) => {
  void getAvailableOptions;
  const [imageFailedKeys, setImageFailedKeys] = useState<Set<string>>(new Set());
  const handleSwatchImageError = useCallback((optionValue: string) => {
    setImageFailedKeys((prev) => new Set(prev).add(optionValue));
  }, []);

  return (
    <>
      {attributes.map((attribute, index) => {
        const isColor = isColorAttribute(attribute.name);
        const selectedValue = selectedAttributes[attribute.name];
        const sizeBtnClass = isColor ? "" : sizeButtonClassName;
        const isMissing = missingAttributes.includes(attribute.name);

        return (
          <div
            key={`${attribute.name}-${attribute.id || index}`}
            className={`mb-0 p-2 -m-2 rounded-lg transition-all duration-300 ${
              isMissing ? "ring-2 ring-rosa ring-offset-2 animate-pulse" : ""
            }`}
          >
            {!hideLabel && (
              <label className={`block font-medium mb-2 ${isMissing ? "text-rosa" : "text-negro"}`}>
                {attribute.name}
              </label>
            )}
            {isColor ? (
              <div className="flex gap-3 flex-wrap">
                {attribute.options.map((option, optIndex) => {
                  const isAvailable = isOptionAvailable(
                    attribute.name,
                    option
                  );
                  const isSelected = selectedValue === option;
                  const swatchImageUrl = colorSwatchImages?.[option];
                  const imageFailed = imageFailedKeys.has(option);
                  const useImage = swatchImageUrl && !imageFailed;

                  return (
                    <button
                      key={`${attribute.name}-${option}-${optIndex}`}
                      onClick={() => {
                        if (isAvailable) {
                          onAttributeChange(attribute.name, option);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden ${isSelected
                        ? "border-negro scale-110 cursor-pointer"
                        : isAvailable
                          ? "border-gray-300 hover:border-gray-400 cursor-pointer"
                          : "border-gray-200 opacity-40 cursor-not-allowed"
                        }`}
                      style={
                        useImage
                          ? undefined
                          : {
                              backgroundColor: "#E5E7EB",
                              cursor: isAvailable ? "pointer" : "not-allowed",
                            }
                      }
                      aria-label={option}
                      title={!isAvailable ? "Not available" : option}
                    >
                      {useImage && (
                        <Image
                          src={swatchImageUrl}
                          alt={option}
                          fill
                          className="object-cover"
                          sizes="40px"
                          onError={() => handleSwatchImageError(option)}
                        />
                      )}
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center z-10">
                          <svg
                            className="w-5 h-5 text-white drop-shadow-md"
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
                      className={`${sizeBtnClass} transition-colors duration-200 font-medium ${isSelected
                        ? "bg-negro text-white border-negro cursor-pointer"
                        : isAvailable
                          ? "bg-white text-negro border-gray-300 hover:border-negro cursor-pointer"
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

