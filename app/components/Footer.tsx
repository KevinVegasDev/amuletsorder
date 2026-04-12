"use client";

import Image from "next/image";
import Link from "next/link";

const categoryLinks = [
  { label: "Woman", href: "/market/category/woman" },
  { label: "Men", href: "/market/category/men" },
  { label: "Accessories", href: "/market/category/accessories" },
  { label: "Hoodies", href: "/market/category/hoodies" },
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
    <footer className="w-full bg-negro text-white px-4 md:px-[50px] py-6 md:py-6 relative">
      <div className="flex flex-col md:flex-row md:h-[300px] md:justify-between">
        {/* ===== MOBILE: Logo row (symbol left, AMULETS right) ===== */}
        <div className="flex md:hidden justify-between items-center mb-10">
          <Image
            src="/simbolo.svg"
            alt="Amulets Logo"
            width={40}
            height={40}
            className="h-auto"
          />
          <span className="text-2xl font-bold">AMULETS</span>
        </div>

        {/* ===== DESKTOP: Columna izquierda ===== */}
        <div className="hidden md:flex flex-col justify-between">
          <div>
            <span className="text-4xl font-bold">AMULETS</span>
          </div>
          <div className="text-gray-300">
            <span className="text-lg font-light">Contact us in WhatsApp</span>
            <p className="text-lg font-light">+58 5482 58432 548</p>
          </div>
          <div>
            <Image
              src="/simbolo.svg"
              alt="Amulets Logo"
              width={48}
              height={48}
              className="h-auto"
            />
          </div>
        </div>

        {/* ===== Links columns ===== */}
        <div className="flex flex-col">
          {/* Links Container */}
          <div className="flex flex-row justify-between md:gap-40">
            {/* Categorías */}
            <div className="flex flex-col">
              <span className="text-[16px] font-light text-white md:hidden mb-[40px] block">
                Category
              </span>
              <ul className="flex flex-col gap-[40px] md:gap-0">
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[16px] font-light md:text-base text-gray-300 hover:text-white transition-colors md:p-4 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About us */}
            <div className="flex flex-col">
              <span className="text-[16px] font-light text-white md:hidden mb-[40px] block">
                About us
              </span>
              <ul className="flex flex-col gap-[40px] md:gap-0">
                {aboutLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[16px] font-light md:text-base text-gray-300 hover:text-white transition-colors md:p-4 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes sociales */}
            <div className="flex flex-col">
              <ul className="flex flex-col gap-[40px] md:gap-0">
                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] font-light md:text-base text-gray-300 hover:text-white transition-colors md:p-4 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ===== MOBILE: Contact + Reserved ===== */}
          <div className="flex md:hidden flex-col items-end mt-12">
            <span className="text-lg font-bold text-white">
              Contact us in WhatsApp
            </span>
            <p className="text-lg font-bold text-white">
              +58 5482 58432 548
            </p>
          </div>

          {/* Reserved */}
          <div className="text-sm text-[#ffffff] opacity-40 font-light flex justify-center md:justify-end mt-8 md:mt-0">
            <p>Amulets Order. All rights reserved. 2025.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
