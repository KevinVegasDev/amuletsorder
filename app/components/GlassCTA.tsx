"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GlassCTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  className?: string;
}

const GlassCTA: React.FC<GlassCTAProps> = ({
  title = "Find the piece that resonates with you",
  description,
  buttonText = "Explore Amulets",
  buttonLink = "/market",
  className = "",
}) => {
  return (
    <section
      className={`relative w-full h-screen min-h-[100vh] flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Fondo con efecto glass que ocupa toda la pantalla */}
      <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/90 border-0">
        {/* Gradientes decorativos animados */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-yellow-400/30 via-transparent to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-tl from-pink-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Contenido centrado */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-tight">
          {title}
        </h2>

        {description && (
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-12 max-w-3xl mx-auto font-light">
            {description}
          </p>
        )}

        <Link href={buttonLink}>
          <Button
            variant="shine"
            className="px-4 py-6 sm:px-8 sm:py-4 text-lg sm:text-xl font-medium text-white cursor-pointer shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-black via-gray-900 to-black border border-white/20"
          >
            {buttonText}
          </Button>
        </Link>
      </div>

      {/* Efectos de brillo adicionales */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
      </div>
    </section>
  );
};

export default GlassCTA;
