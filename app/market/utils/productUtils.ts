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

const FALLBACK_HEX = "#CCCCCC";

/**
 * Mapa ampliado de nombres de color a hex (inglés y español).
 * Así no hay que mapear 1 a 1; cualquier color nuevo en variaciones
 * que no esté aquí se mostrará con iniciales en el swatch.
 */
const COLOR_HEX_MAP: Record<string, string> = {
  black: "#000000",
  negro: "#000000",
  white: "#FFFFFF",
  blanco: "#FFFFFF",
  red: "#DC2626",
  rojo: "#DC2626",
  blue: "#2563EB",
  azul: "#2563EB",
  green: "#16A34A",
  verde: "#16A34A",
  yellow: "#EAB308",
  amarillo: "#EAB308",
  orange: "#EA580C",
  naranja: "#EA580C",
  purple: "#7C3AED",
  morado: "#7C3AED",
  violet: "#7C3AED",
  violeta: "#7C3AED",
  pink: "#DB2777",
  rosa: "#DB2777",
  gray: "#6B7280",
  grey: "#6B7280",
  gris: "#6B7280",
  navy: "#1E3A8A",
  teal: "#0D9488",
  mint: "#5EEAD4",
  lavender: "#A78BFA",
  burgundy: "#881337",
  maroon: "#881337",
  brown: "#78350F",
  marrón: "#78350F",
  beige: "#D6D3D1",
  cream: "#FEF3C7",
  crema: "#FEF3C7",
  charcoal: "#374151",
  gold: "#CA8A04",
  dorado: "#CA8A04",
  silver: "#9CA3AF",
  plateado: "#9CA3AF",
  coral: "#F97316",
  olive: "#65A30D",
  oliva: "#65A30D",
  turquoise: "#0D9488",
  turquesa: "#0D9488",
  mustard: "#CA8A04",
  mostaza: "#CA8A04",
  forest: "#15803D",
  "forest green": "#15803D",
  lime: "#84CC16",
  "lime green": "#84CC16",
  salmon: "#F97316",
  peach: "#FDBA74",
  durazno: "#FDBA74",
  indigo: "#4F46E5",
  cyan: "#06B6D4",
  magenta: "#D946EF",
  tan: "#D6D3D1",
  khaki: "#C3B091",
  wine: "#881337",
  vino: "#881337",
  // Variantes comunes de talleres/Printful
  "heather gray": "#9CA3AF",
  "heather grey": "#9CA3AF",
  "dark heather": "#4B5563",
  "army green": "#4D5D53",
  "military green": "#4D5D53",
  "royal blue": "#2563EB",
  "navy blue": "#1E3A8A",
  "sky blue": "#0EA5E9",
  "light blue": "#7DD3FC",
  "dark green": "#166534",
  "light pink": "#F9A8D4",
  "hot pink": "#DB2777",
  "dusty rose": "#E11D48",
  "dusty purple": "#7C3AED",
  "red/orange": "#EA580C",
  "orange/red": "#EA580C",
  seafoam: "#93E9BE",
  melon: "#FBBF24",
  "heather blue": "#93C5FD",
  "sport grey": "#9CA3AF",
  "sport gray": "#9CA3AF",
};

/**
 * Devuelve el hex para un nombre de color si está en el mapa; si no, null.
 * Útil para saber si debemos mostrar swatch con color o con iniciales.
 */
export const getColorHexIfKnown = (colorName: string): string | null => {
  const key = colorName.toLowerCase().trim();
  return COLOR_HEX_MAP[key] ?? null;
};

/**
 * Get hex color code from color name. Si no está mapeado, devuelve #CCCCCC.
 * Para mostrar swatches sin mapeo manual, mejor usar getColorHexIfKnown + iniciales.
 */
export const getColorHex = (colorName: string): string => {
  return getColorHexIfKnown(colorName) ?? FALLBACK_HEX;
};

/**
 * Iniciales para mostrar en swatch cuando el color no está mapeado (máx. 2 letras).
 */
export const getColorInitials = (colorName: string): string => {
  const trimmed = colorName.trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase().slice(0, 2);
  }
  return trimmed.slice(0, 2).toUpperCase();
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

