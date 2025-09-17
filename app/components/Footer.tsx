"use client";

const Footer = () => {
  return (
    <footer className="h-[387px] w-full bg-[#1C1C1C] text-white px-[50px] py-12 relative">
      <div className="flex h-full justify-between">
        {/* Columna izquierda: Logo, contacto y espacio para logo */}
        <div className="flex flex-col justify-between w-1/3">
          <div>
            <h1 className="text-4xl font-light mb-12">AMULETS</h1>
            <div className="text-gray-300">
              <h2 className="text-lg font-light mb-2">
                Contact us in WhatsApp
              </h2>
              <p className="text-lg font-light">+58 5482 58432 548</p>
            </div>
          </div>
          {/* Espacio para logo futuro */}
          <div className="mt-8 mb-12">{/* Logo placeholder */}</div>
        </div>

        {/* Columna derecha: Menús flexibles */}
        <div className="flex items-start gap-32">
          {/* Categorías */}
          <div>
            <h3 className="text-base font-light mb-6">Category</h3>
            <ul className="space-y-4 text-gray-300 text-base font-light">
              <li>Woman</li>
              <li>Men</li>
              <li>Accessories</li>
              <li>Hoodies</li>
            </ul>
          </div>

          {/* About us */}
          <div>
            <h3 className="text-base font-light mb-6">About us</h3>
            <ul className="space-y-4 text-gray-300 text-base font-light">
              <li>Our Story</li>
              <li>Our Mission</li>
              <li>Vision</li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <ul className="space-y-4 text-gray-300 text-base font-light pt-[26px]">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>Tik Tok</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="absolute bottom-6 left-[50px] text-sm text-gray-500 font-light">
        <p>Amulets Order. All rights reserved. 2025.</p>
      </div>
    </footer>
  );
};

export default Footer;
