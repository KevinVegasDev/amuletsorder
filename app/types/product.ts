// Tipos para productos de WordPress con integración Printful

export interface PrintfulVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  main_category_id: number;
  warehouse_product_variant_id: number | null;
  retail_price: string;
  sku: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: Array<{
    id: number;
    type: string;
    hash: string | null;
    url: string;
    filename: string;
    mime_type: string;
    size: number;
    width: number;
    height: number;
    dpi: number | null;
    status: string;
    created: number;
    thumbnail_url: string;
    preview_url: string;
    visible: boolean;
  }>;
  options: Array<{
    id: string;
    value: string;
  }>;
  is_ignored: boolean;
}

export interface WordPressProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: "simple" | "grouped" | "external" | "variable";
  status: "draft" | "pending" | "private" | "publish";
  featured: boolean;
  catalog_visibility: "visible" | "catalog" | "search" | "hidden";
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: Array<{
    id: string;
    name: string;
    file: string;
  }>;
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: "taxable" | "shipping" | "none";
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  backorders: "no" | "notify" | "yes";
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }>;
  default_attributes: Array<{
    id: number;
    name: string;
    option: string;
  }>;
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  price_html: string;
  related_ids: number[];
  meta_data: Array<{
    id: number;
    key: string;
    value: string | number | boolean | null;
  }>;
  stock_status: "instock" | "outofstock" | "onbackorder";
  has_options: boolean;
  post_password: string;
  global_unique_id: string;
}

// Tipo simplificado para mostrar en el frontend
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  regularPrice: number;
  salePrice?: number;
  onSale: boolean;
  sku: string;
  images: ProductImage[];
  categories: ProductCategory[];
  tags: ProductTag[];
  inStock: boolean;
  stockQuantity?: number;
  averageRating: number;
  ratingCount: number;
  permalink: string;
  featured: boolean;
  // Datos específicos de Printful
  printfulVariants?: PrintfulVariant[];
  printfulSyncProductId?: number;
}

export interface ProductImage {
  id: number;
  src: string;
  alt: string;
  name: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  count?: number;
}

export interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

// Tipos para filtros y búsqueda
export interface ProductFilters {
  categories?: string[];
  tags?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  search?: string;
  minRating?: number;
  sortBy?: "name" | "price" | "date" | "popularity" | "rating";
  sortOrder?: "asc" | "desc";
}

// Tipos para respuestas de API
export interface ProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Tipos para configuración de API
export interface WordPressAPIConfig {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  version: string;
}

// Tipos para banners de WordPress
export interface WordPressBanner {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface Banner {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
}

// Utilidades de transformación
export type WordPressToProduct = (wpProduct: WordPressProduct) => Product;
export type ProductsToResponse = (
  products: Product[],
  total: number,
  page: number,
  perPage: number
) => ProductsResponse;
