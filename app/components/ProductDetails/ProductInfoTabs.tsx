"use client";

import React, { useState } from "react";

interface ProductInfoTabsProps {
  description: string;
  shortDescription: string;
}

const TABS = ["Description", "Shipping", "Returns"] as const;
type TabKey = (typeof TABS)[number];

/**
 * Contenido estático de Shipping y Returns.
 * Si en el futuro se quiere extraerlo de WordPress (ej. de una página o
 * meta‐campo), basta con recibirlo por props y eliminar estas constantes.
 */
const SHIPPING_HTML = `
<p>We offer worldwide shipping through our print‑on‑demand partner, Printful. Orders are typically produced within <strong>2–5 business days</strong> and shipped directly to you.</p>
<p><strong>Estimated delivery times:</strong></p>
<ul>
  <li>USA: 5–10 business days</li>
  <li>Europe: 7–14 business days</li>
  <li>Rest of World: 10–20 business days</li>
</ul>
<p>Tracking information will be sent to your email once the order ships.</p>
`;

const RETURNS_HTML = `
<p>Because every item is made to order, we do <strong>not</strong> accept general returns or exchanges.</p>
<p>However, if your product arrives damaged or defective, please contact us within <strong>30 days</strong> of delivery at <a href="mailto:support@amuletsorder.com">support@amuletsorder.com</a> with photos of the issue, and we will arrange a replacement at no extra cost.</p>
`;

const ProductInfoTabs: React.FC<ProductInfoTabsProps> = ({
  description,
  shortDescription,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("Description");

  const getContent = (): string => {
    switch (activeTab) {
      case "Description":
        return (
          description || shortDescription || "<p>No description available.</p>"
        );
      case "Shipping":
        return SHIPPING_HTML;
      case "Returns":
        return RETURNS_HTML;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Tab header */}
      <div className="flex flex-row ">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              py-4 px-6 text-sm font-medium cursor-pointer transition-colors relative
              ${
                activeTab === tab
                  ? "text-negro"
                  : "text-gray-400 hover:text-gray-600"
              }
            `}
          >
            {tab}
            {/* Active indicator */}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-negro" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="py-6 text-sm text-gray-600 leading-relaxed product-description"
        dangerouslySetInnerHTML={{ __html: getContent() }}
      />
    </div>
  );
};

export default ProductInfoTabs;
