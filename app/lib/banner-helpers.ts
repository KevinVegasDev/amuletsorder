import { getBanners } from "./wordpress-api";
import { Banner } from "../types/product";

/**
 * Transformar banners al formato esperado por el Slider
 */
export function transformBannersToSliderImages(banners: Banner[]) {
  return banners.map((banner) => ({
    src: banner.imageUrl,
    alt: banner.imageAlt,
  }));
}

/**
 * Obtener la primera imagen para el Hero (índice 0)
 */
export function getHeroImage(banners: Banner[]) {
  return banners.length > 0 ? banners[0] : null;
}

/**
 * Obtener todos los banners y prepararlos para Slider y Hero
 * Función helper que puede usarse en Server Components
 */
export async function getBannersData() {
  const banners = await getBanners();

  return {
    banners,
    sliderImages: transformBannersToSliderImages(banners),
    heroImage: getHeroImage(banners),
  };
}
