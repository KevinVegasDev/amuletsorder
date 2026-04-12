"use client";

import React from "react";
import Link from "next/link";

interface MoreDropdownPanelProps {
  isOpen: boolean;
  alignLeft: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const linkClassName =
  "text-sm uppercase font-medium text-black hover:text-[var(--color-hovered)] transition-colors";

const MoreDropdownPanel: React.FC<MoreDropdownPanelProps> = ({
  isOpen,
  alignLeft,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={`hidden sm:block absolute left-0 w-full border-t border-[#212121]/10 overflow-hidden transition-all duration-300 z-40 ${
        isOpen ? "max-h-[300px] py-6" : "max-h-0 py-0"
      }`}
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(3.4px)",
        WebkitBackdropFilter: "blur(3.4px)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex flex-row gap-16" style={{ paddingLeft: alignLeft }}>
        {/* Customer Support */}
        <div className="flex flex-col gap-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            Customer Support
          </span>
          <div className="flex flex-col gap-2">
            <Link href="/contact" className={linkClassName}>
              Contact Us
            </Link>
            <Link href="/shipping" className={linkClassName}>
              Shipping
            </Link>
            <Link href="/returns" className={linkClassName}>
              Returns
            </Link>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            Links
          </span>
          <div className="flex flex-col gap-2">
            <Link href="/about-us" className={linkClassName}>
              About
            </Link>
            <a
              href="https://instagram.com/amuletsorder"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              Instagram
            </a>
            <a
              href="https://youtube.com/@amuletsorder"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              YouTube
            </a>
            <a
              href="https://tiktok.com/@amuletsorder"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreDropdownPanel;
