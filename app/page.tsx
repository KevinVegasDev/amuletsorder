import Slider from "./components/Slider";
import HomeProductsSection from "./components/HomeProductsSection";
import ResumeHome from "./components/ResumeHome";
import { getBanners } from "./lib/wordpress-api";
import Footer from "./components/Footer";

export default async function Home() {
  // Obtener los banners desde WordPress
  const banners = await getBanners();

  // Transformar los banners al formato esperado por el Slider
  const sliderImages = banners.map((banner) => ({
    src: banner.imageUrl,
    alt: banner.imageAlt,
  }));

  return (
    <main className="">
      {/* Hero Section con Slider */}
      <section className="pt-4 px-[50px]">
        <Slider
          images={sliderImages}
          autoPlay={true}
          autoPlayInterval={5000}
          maxHeight="60vh"
        />
      </section>

      {/* Sección de Productos Destacados */}
      <HomeProductsSection />
      <ResumeHome />
    </main>
  );
}
