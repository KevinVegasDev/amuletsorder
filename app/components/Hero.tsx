import React from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  imageSrc: string;
  imageAlt: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

const Hero: React.FC<HeroProps> = ({
  imageSrc,
  imageAlt,
  title = "Street wear is the new era",
  description = "Your soul is your best outfit.",
  ctaText = "Check market",
  ctaLink = "/market",
}) => {
  return (
    <section className="relative w-full h-[912px] overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          quality={90}
        />
        {/* Gradiente lineal: transparente (0%) a negro (100%) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)",
          }}
        />
      </div>

      
      <div className="absolute inset-0 flex items-end justify-start">
        <div className="px-8 flex flex-col gap-4 py-16">
          {/* Título principal - H1 para SEO */}
          <h1 className="text-5xl font-bold text-gris leading-tight max-w-2xl">
            {title}
          </h1>

          
          <p className="text-[32px]  text-gris  ">
            {description}
          </p>

          
          <div className="">
            <Link
              href={ctaLink}
              className="inline-block px-8  py-4 rounded-[12px] bg-gris text-black font-semibold hover:bg-gray-200 transition-colors duration-200 text-[20px]"
              aria-label={ctaText}
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
