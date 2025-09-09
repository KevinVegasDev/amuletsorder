// 🚀 Configuración SEO Base - E-commerce Amulets
// Este archivo contiene toda la configuración SEO necesaria antes de implementar features

export const seoConfig = {
  // 📱 Información básica de la tienda (se completará después)
  site: {
    name: "Amulets Store", // Nombre temporal, se cambiará
    description: "Tienda de amuletos y accesorios espirituales", // Descripción temporal
    url: "https://amulets-store.com", // URL temporal, se cambiará
    logo: "/logo.png", // Logo temporal, se implementará después
    favicon: "/favicon.ico", // Favicon temporal, se implementará después
  },

  // 🔍 Configuración de motores de búsqueda
  seo: {
    defaultTitle: "Amulets Store - Amuletos y Accesorios Espirituales",
    titleTemplate: "%s | Amulets Store",
    defaultDescription:
      "Descubre nuestra colección única de amuletos, cristales y accesorios espirituales. Envío gratis en pedidos superiores a $50.",
    keywords: [
      "amuletos",
      "cristales",
      "espiritual",
      "energía",
      "protección",
      "meditación",
    ],
    author: "Amulets Store",
    language: "es",
    locale: "es_ES",
    type: "website",
  },

  // 📊 Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://amulets-store.com",
    siteName: "Amulets Store",
    title: "Amulets Store - Amuletos y Accesorios Espirituales",
    description:
      "Descubre nuestra colección única de amuletos, cristales y accesorios espirituales.",
    images: [
      {
        url: "/og-image.jpg", // Imagen temporal, se implementará después
        width: 1200,
        height: 630,
        alt: "Amulets Store - Amuletos y Accesorios Espirituales",
      },
    ],
  },

  // 🐦 Twitter Cards
  twitter: {
    handle: "@amuletsstore", // Handle temporal, se cambiará
    site: "@amuletsstore", // Site temporal, se cambiará
    cardType: "summary_large_image",
  },

  // 🏗️ Structured Data (JSON-LD)
  structuredData: {
    organization: {
      "@type": "Organization",
      name: "Amulets Store",
      url: "https://amulets-store.com",
      logo: "https://amulets-store.com/logo.png",
      description: "Tienda especializada en amuletos y accesorios espirituales",
      address: {
        "@type": "PostalAddress",
        // Se completará después
      },
      contactPoint: {
        "@type": "ContactPoint",
        // Se completará después
      },
    },
    website: {
      "@type": "WebSite",
      name: "Amulets Store",
      url: "https://amulets-store.com",
      description: "Tienda online de amuletos y accesorios espirituales",
    },
  },

  // 📱 PWA Configuration
  pwa: {
    name: "Amulets Store",
    shortName: "Amulets",
    description: "Tienda de amuletos y accesorios espirituales",
    themeColor: "#000000", // Color temporal, se cambiará
    backgroundColor: "#ffffff", // Color temporal, se cambiará
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    startUrl: "/",
  },

  // 🔧 Performance y Core Web Vitals
  performance: {
    // Meta targets para Core Web Vitals
    lcp: 2500, // 2.5 segundos
    fid: 100, // 100 milisegundos
    cls: 0.1, // 0.1
    // Configuración de imágenes
    imageOptimization: {
      formats: ["webp", "avif"],
      sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      quality: 85,
    },
  },

  // ♿ Accesibilidad
  accessibility: {
    // Meta targets para WCAG 2.1 AA
    contrastRatio: 4.5, // Mínimo para texto normal
    contrastRatioLarge: 3.0, // Mínimo para texto grande
    // Configuración de navegación
    skipLinks: true,
    focusIndicators: true,
    keyboardNavigation: true,
  },
};

// 🎯 Tipos TypeScript para SEO
export interface SEOConfig {
  site: {
    name: string;
    description: string;
    url: string;
    logo: string;
    favicon: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
    author: string;
    language: string;
    locale: string;
    type: string;
  };
  openGraph: {
    type: string;
    locale: string;
    url: string;
    siteName: string;
    title: string;
    description: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
  };
  twitter: {
    handle: string;
    site: string;
    cardType: string;
  };
  structuredData: {
    organization: {
      "@type": string;
      name: string;
      url: string;
      logo: string;
      description: string;
      address: {
        "@type": string;
      };
      contactPoint: {
        "@type": string;
      };
    };
    website: {
      "@type": string;
      name: string;
      url: string;
      description: string;
    };
  };
  pwa: {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    display: string;
    orientation: string;
    scope: string;
    startUrl: string;
  };
  performance: {
    lcp: number;
    fid: number;
    cls: number;
    imageOptimization: {
      formats: string[];
      sizes: number[];
      quality: number;
    };
  };
  accessibility: {
    contrastRatio: number;
    contrastRatioLarge: number;
    skipLinks: boolean;
    focusIndicators: boolean;
    keyboardNavigation: boolean;
  };
}

// 📝 Notas importantes:
// 1. Este archivo se actualizará con información real de la tienda
// 2. Todas las URLs, nombres y descripciones son temporales
// 3. Se implementará antes de cualquier feature visual
// 4. Se optimizará constantemente basado en métricas
