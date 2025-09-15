import Slider from "./components/Slider";
import HomeProductsSection from "./components/HomeProductsSection";
import { getBanners } from "./lib/wordpress-api";

export default async function Home() {
  // Obtener los banners desde WordPress
  const banners = await getBanners();

  // Transformar los banners al formato esperado por el Slider
  const sliderImages = banners.map((banner) => ({
    src: banner.imageUrl,
    alt: banner.imageAlt,
  }));

  return (
    <main className="px-[50px]">
      {/* Hero Section con Slider */}
      <section className="pt-4">
        <Slider
          images={sliderImages}
          autoPlay={true}
          autoPlayInterval={5000}
          maxHeight="60vh"
        />
      </section>

      {/* Sección de Productos Destacados */}
      <HomeProductsSection />
    </main>
  );
}
