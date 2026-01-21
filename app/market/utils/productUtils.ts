/**
 * Utility functions for product-related operations
 */

/**
 * Format price as currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

/**
 * Get hex color code from color name (fallback)
 */
export const getColorHex = (colorName: string): string => {
  const colorNameLower = colorName.toLowerCase().trim();
  const colorMap: Record<string, string> = {
    black: "#000000",
    negro: "#000000",
    red: "#FF0000",
    rojo: "#FF0000",
    purple: "#800080",
    morado: "#800080",
    white: "#FFFFFF",
    blanco: "#FFFFFF",
    blue: "#0000FF",
    azul: "#0000FF",
    green: "#008000",
    verde: "#008000",
    yellow: "#FFFF00",
    amarillo: "#FFFF00",
    orange: "#FFA500",
    naranja: "#FFA500",
    pink: "#FFC0CB",
    rosa: "#FFC0CB",
    gray: "#808080",
    gris: "#808080",
    grey: "#808080",
  };
  return colorMap[colorNameLower] || "#CCCCCC";
};

/**
 * Remove HTML tags and entities from text
 */
export const cleanHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

/**
 * Check if an attribute is a color attribute
 */
export const isColorAttribute = (attributeName: string): boolean => {
  const attributeNameLower = attributeName.toLowerCase().trim();
  return (
    attributeNameLower === "color" ||
    attributeNameLower === "colour" ||
    attributeNameLower === "colores" ||
    attributeNameLower.includes("color")
  );
};

