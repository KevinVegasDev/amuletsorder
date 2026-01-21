"use client";

import { useState, useMemo, useEffect } from "react";
import { Product, ProductVariation, ProductImage } from "../../types/product";

interface UseProductVariationsProps {
  product: Product;
  onVariationImageChange?: (image: ProductImage | null) => void;
}

interface UseProductVariationsReturn {
  selectedAttributes: Record<string, string>;
  selectedVariation: ProductVariation | null;
  currentPrice: number;
  currentRegularPrice: number;
  isOnSale: boolean;
  isInStock: boolean;
  getAvailableOptions: (attributeName: string) => string[];
  isOptionAvailable: (attributeName: string, optionValue: string) => boolean;
  handleAttributeChange: (attributeName: string, value: string) => void;
}

/**
 * Hook to manage product variations and attributes
 */
export const useProductVariations = ({
  product,
  onVariationImageChange,
}: UseProductVariationsProps): UseProductVariationsReturn => {
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  // Find the selected variation based on attributes
  const selectedVariation = useMemo(() => {
    if (!product.variations || product.variations.length === 0) {
      return null;
    }

    // If no attributes are selected, return null
    if (Object.keys(selectedAttributes).length === 0) {
      return null;
    }

    // Debug in development
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Buscando variación con atributos:", selectedAttributes);
      console.log(
        "📦 Variaciones disponibles:",
        product.variations.map((v) => ({
          id: v.id,
          attributes: v.attributes,
          price: v.price,
        }))
      );
    }

    const found = product.variations.find((variation) => {
      // Compare all selected attributes with variation attributes
      const matches = Object.keys(selectedAttributes).every((attrName) => {
        const selectedValue = selectedAttributes[attrName];
        const variationValue = variation.attributes[attrName];

        // Case-insensitive and normalized comparison
        const normalizedSelected = selectedValue
          ?.toString()
          .toLowerCase()
          .trim();
        const normalizedVariation = variationValue
          ?.toString()
          .toLowerCase()
          .trim();

        const match = normalizedSelected === normalizedVariation;

        if (process.env.NODE_ENV === "development" && !match) {
          console.log(
            `❌ No match: ${attrName} - Selected: "${normalizedSelected}" vs Variation: "${normalizedVariation}"`
          );
        }

        return match;
      });

      if (matches && process.env.NODE_ENV === "development") {
        console.log("✅ Variación encontrada:", variation.id, variation.price);
      }

      return matches;
    });

    return found || null;
  }, [product.variations, selectedAttributes]);

  // Update image when selected variation changes
  useEffect(() => {
    if (onVariationImageChange) {
      if (selectedVariation && selectedVariation.image) {
        // Find variation image in available product images
        const variationImage = selectedVariation.image;

        // If variation image exists in product images, use it
        const foundInProduct = product.images?.find(
          (img) =>
            img.id === variationImage.id || img.src === variationImage.src
        );

        if (foundInProduct) {
          onVariationImageChange(foundInProduct);
        } else {
          // If not in product images, use variation image directly
          onVariationImageChange(variationImage);
        }
      } else {
        // If no variation or no image, return to main product image
        onVariationImageChange(
          product.images && product.images.length > 0 ? product.images[0] : null
        );
      }
    }
  }, [selectedVariation, product.images, onVariationImageChange]);

  // Get current price (from variation or base product)
  const currentPrice = useMemo(() => {
    if (selectedVariation) {
      const price =
        selectedVariation.onSale && selectedVariation.salePrice
          ? selectedVariation.salePrice
          : selectedVariation.price;

      if (process.env.NODE_ENV === "development") {
        console.log(
          "💰 Precio de variación:",
          price,
          "Variation ID:",
          selectedVariation.id
        );
      }

      return price;
    }

    const basePrice =
      product.onSale && product.salePrice ? product.salePrice : product.price;

    if (process.env.NODE_ENV === "development") {
      console.log("💰 Precio base del producto:", basePrice);
    }

    return basePrice;
  }, [selectedVariation, product]);

  const currentRegularPrice = useMemo(() => {
    if (selectedVariation) {
      return selectedVariation.regularPrice;
    }
    return product.regularPrice;
  }, [selectedVariation, product]);

  const isOnSale = useMemo(() => {
    if (selectedVariation) {
      return selectedVariation.onSale;
    }
    return product.onSale;
  }, [selectedVariation, product]);

  // Check if selected variation is in stock
  const isInStock = useMemo(() => {
    if (selectedVariation) {
      return selectedVariation.inStock;
    }
    return product.inStock;
  }, [selectedVariation, product]);

  // Get available options for an attribute based on variations
  const getAvailableOptions = useMemo(() => {
    return (attributeName: string): string[] => {
      // If no variations, show all attribute options
      if (!product.variations || product.variations.length === 0) {
        const attr = product.attributes?.find((a) => a.name === attributeName);
        return attr?.options || [];
      }

      // If no attributes selected, show all available options in variations
      if (Object.keys(selectedAttributes).length === 0) {
        const availableOptions = new Set<string>();
        product.variations.forEach((variation) => {
          const value = variation.attributes[attributeName];
          if (value) {
            availableOptions.add(value);
          }
        });
        return Array.from(availableOptions);
      }

      // Filter options based on already selected attributes
      const availableOptions = new Set<string>();

      product.variations.forEach((variation) => {
        // Check if this variation is compatible with already selected attributes
        const isCompatible = Object.keys(selectedAttributes).every(
          (selectedAttrName) => {
            // If it's the same attribute we're evaluating, don't compare
            if (selectedAttrName === attributeName) {
              return true;
            }
            // Compare with case-insensitive
            const selectedValue = selectedAttributes[selectedAttrName]
              ?.toLowerCase()
              .trim();
            const variationValue = variation.attributes[selectedAttrName]
              ?.toLowerCase()
              .trim();
            return selectedValue === variationValue;
          }
        );

        if (isCompatible) {
          const value = variation.attributes[attributeName];
          if (value) {
            availableOptions.add(value);
          }
        }
      });

      return Array.from(availableOptions);
    };
  }, [product.variations, product.attributes, selectedAttributes]);

  // Check if an option is available
  const isOptionAvailable = useMemo(() => {
    return (attributeName: string, optionValue: string): boolean => {
      const availableOptions = getAvailableOptions(attributeName);
      return availableOptions.some(
        (opt) => opt.toLowerCase().trim() === optionValue.toLowerCase().trim()
      );
    };
  }, [getAvailableOptions]);

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => {
      // If the same option is clicked, deselect it
      if (prev[attributeName] === value) {
        const newAttributes = { ...prev };
        delete newAttributes[attributeName];
        return newAttributes;
      }
      // Otherwise, select the new option
      return {
        ...prev,
        [attributeName]: value,
      };
    });
  };

  return {
    selectedAttributes,
    selectedVariation,
    currentPrice,
    currentRegularPrice,
    isOnSale,
    isInStock,
    getAvailableOptions,
    isOptionAvailable,
    handleAttributeChange,
  };
};
