import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CartIcon, HeartIcon, PersonIcon } from "./icons";

const Header = () => {
  return (
    <header className="w-full bg-white px-[50px] py-4 font-teko">
      <div className="flex items-center justify-between">
        {/* Logo y Navegación */}
        <div className="flex items-center gap-2 ">
          {/* Logo */}
          <div>
            <Link href="/">
              <Image
                src="/logotipo.svg"
                alt="AMULETS"
                width={94}
                height={15}
                className="h-[15px] w-auto"
              />
            </Link>
          </div>

          {/* Navegación */}
          <nav className="flex items-center text-[24px]">
            <Link
              href="/"
              className="px-4 py-2 font-teko text-black leading-[0] tracking-[0] mt-[3px]"
            >
              + home
            </Link>
            <Link
              href="/market"
              className="px-4 py-2 font-teko text-black leading-[0] tracking-[0] mt-[3px]"
            >
              + Market
            </Link>
            <Link
              href="/about-us"
              className="px-4 py-2 font-teko text-black leading-[0] tracking-[0] mt-[3px]"
            >
              + about us
            </Link>
          </nav>
        </div>

        {/* Iconos de acción */}
        <div className="flex items-center gap-4">
          <CartIcon color="#212121" />
          <HeartIcon color="#212121" />
          <PersonIcon color="#212121" />
        </div>
      </div>
    </header>
  );
};

export default Header;
