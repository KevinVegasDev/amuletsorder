"use client";

import Image from "next/image";
import Link from "next/link";

const categoryLinks = [
  { label: "Woman", href: "/market?category=woman" },
  { label: "Men", href: "/market?category=men" },
  { label: "Accessories", href: "/market?category=accessories" },
  { label: "Hoodies", href: "/market?category=hoodies" },
];

const aboutLinks = [
  { label: "Our Story", href: "/about-us" },
  { label: "Our Mission", href: "/about-us#mission" },
  { label: "Vision", href: "/about-us#vision" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/amulets" },
  { label: "Facebook", href: "https://facebook.com/amulets" },
  { label: "Tik Tok", href: "https://tiktok.com/@amulets" },
];

const Footer = () => {
  return (
    <footer className="h-[300px] w-full bg-negro text-white px-[50px] py-6 relative">
      <div className="flex h-full justify-between">
        {/* Columna izquierda: Logo, contacto y espacio para logo */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-4xl font-bold">AMULETS</span>
            {/* Contact Whatsapp */}
          </div>
          <div className="text-gray-300">
            <span className="text-lg font-light">Contact us in WhatsApp</span>
            <p className="text-lg font-light">+58 5482 58432 548</p>
          </div>
          {/* Logo */}
          <div className="">
            <Image
              src="/simbolo.svg"
              alt="Amulets Logo"
              width={48}
              height={48}
              className="h-auto"
            />
          </div>
        </div>

        {/* Links y Reserved */}
        <div className="flex flex-col py-4">
          {/* Links Container */}
          <div className="flex gap-40">
            {/* Categorías */}
            <div className="flex flex-col">
              <ul className="flex flex-col">
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors p-4 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About us */}
            <div className="flex flex-col">
              <ul className="flex flex-col">
                {aboutLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors p-4 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes sociales */}
            <div className="flex flex-col">
              <ul className="flex flex-col">
                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors p-4 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Reserved */}
          <div className="text-sm text-[#ffffff] opacity-40 font-light flex justify-end">
            <p>Amulets Order. All rights reserved. 2025.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
