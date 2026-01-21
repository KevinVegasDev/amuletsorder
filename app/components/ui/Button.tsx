"use client";

import React from "react";
import Link from "next/link";

interface ButtonProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "glitch-brightness";
}

const Button: React.FC<ButtonProps> = ({
  href,
  className = "",
  children,
  variant = "default",
}) => {
  const baseClasses = "inline-flex items-center justify-center px-8 py-3 text-base font-light transition-all duration-300 ease-in-out";
  
  const variantClasses = {
    default: "bg-black text-white hover:bg-[var(--color-hovered)]",
    "glitch-brightness": `
      relative bg-black text-white overflow-hidden
      before:content-[''] before:absolute before:w-[110%] before:h-[110%] before:left-[-5%] before:top-[-5%]
      before:bg-[var(--color-hovered)] before:opacity-0
      before:transition-all before:duration-500 before:ease-out
      before:mix-blend-screen before:blur-[10px]
      after:content-[''] after:absolute after:w-full after:h-full after:left-0 after:top-0
      after:bg-black after:opacity-0 after:transition-opacity after:duration-500
      hover:before:opacity-100 hover:after:opacity-20
      [&>span]:relative [&>span]:z-10 [&>span]:transition-colors [&>span]:duration-500
      hover:[&>span]:text-black
    `,
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button className={combinedClasses}>
      <span>{children}</span>
    </button>
  );
};

export default Button;