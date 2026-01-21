"use client";

import React from "react";

interface StaticAttributesProps {
  selectedAttributes: Record<string, string>;
  onAttributeChange: (attributeName: string, value: string) => void;
}

/**
 * Component to display static fallback attributes (Size, Color)
 */
export const StaticAttributes: React.FC<StaticAttributesProps> = ({
  selectedAttributes,
  onAttributeChange,
}) => {
  return (
    <>
      {/* Static Size */}
      <div className="mb-6">
        <label className="block text-negro font-medium mb-2">Talla</label>
        <div className="flex gap-2 flex-wrap">
          {["S", "M", "X", "XL", "XLL"].map((size) => (
            <button
              key={size}
              onClick={() => onAttributeChange("Talla", size)}
              className={`px-4 py-2 border-2 rounded transition-colors duration-200 font-medium ${
                selectedAttributes["Talla"] === size
                  ? "bg-negro text-white border-negro"
                  : "bg-white text-negro border-gray-300 hover:border-negro"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Static Color */}
      <div className="mb-6">
        <label className="block text-negro font-medium mb-2">Color</label>
        <div className="flex gap-3 flex-wrap">
          {[
            { name: "Black", value: "black", hex: "#000000" },
            { name: "Red", value: "red", hex: "#8B0000" },
            { name: "Purple", value: "purple", hex: "#800080" },
          ].map((color) => (
            <button
              key={color.value}
              onClick={() => onAttributeChange("Color", color.value)}
              className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                selectedAttributes["Color"] === color.value
                  ? "border-negro scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={color.name}
            >
              {selectedAttributes["Color"] === color.value && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

