"use client";

import React from "react";
import Link from "next/link";

interface MoreDropdownPanelProps {
  alignLeft: number;
}

const linkClassName =
  "text-sm uppercase font-medium text-black hover:text-[var(--color-hovered)] transition-colors";

const MoreDropdownPanel: React.FC<MoreDropdownPanelProps> = ({
  alignLeft,
}) => {
  return (
    <div className="flex flex-row gap-16 w-full" style={{ paddingLeft: alignLeft }}>
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
  );
};

export default MoreDropdownPanel;
