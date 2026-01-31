"use client";

import React from "react";
import { AddressElement } from "@stripe/react-stripe-js";
import type { StripeAddressElementChangeEvent } from "@stripe/stripe-js";
import { ShippingAddress, ShippingMethod } from "../../types/checkout";
import { CheckoutValidationErrors } from "../../types/checkout";

interface ShippingFormStripeProps {
  shippingAddress: ShippingAddress;
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod;
  errors: CheckoutValidationErrors;
  onShippingAddressChange: (address: Partial<ShippingAddress>) => void;
  onShippingMethodChange: (methodId: ShippingMethod["id"]) => void;
}

/**
 * Mapea el valor del Address Element de Stripe a nuestro ShippingAddress.
 * Stripe devuelve value: { name, firstName?, lastName?, address: { line1, line2, city, state, postal_code, country }, phone? }.
 */
function mapAddressElementValue(event: StripeAddressElementChangeEvent): Partial<ShippingAddress> {
  const value = event.value;
  if (!value?.address) return {};

  const addr = value.address;
  const nameParts = (value.name || "").trim().split(/\s+/);
  const firstName = value.firstName ?? nameParts[0] ?? "";
  const lastName = value.lastName ?? nameParts.slice(1).join(" ") ?? "";

  return {
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    address: addr.line1 || "",
    apartment: addr.line2 || undefined,
    city: addr.city || "",
    state: addr.state || "",
    zipCode: addr.postal_code || "",
    country: addr.country || "",
  };
}

/**
 * Formulario de envío con Stripe Address Element (dirección + país de Stripe)
 * y campos propios para email, teléfono y métodos de envío estáticos.
 */
export const ShippingFormStripe: React.FC<ShippingFormStripeProps> = ({
  shippingAddress,
  shippingMethods,
  selectedShippingMethod,
  errors,
  onShippingAddressChange,
  onShippingMethodChange,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    const mapped = mapAddressElementValue(event);
    if (Object.keys(mapped).length) {
      onShippingAddressChange(mapped);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-negro">Shipping Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          We need your contact and address to ship your order and send tracking updates.
        </p>
      </div>

      {/* Email y Teléfono (fuera del Address Element) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={shippingAddress.email}
            onChange={(e) => onShippingAddressChange({ email: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
              errors.shippingAddress?.email
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="your@email.com"
          />
          {errors.shippingAddress?.email && (
            <p className="mt-1 text-sm text-red-500">
              {errors.shippingAddress.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={shippingAddress.phone}
            onChange={(e) => onShippingAddressChange({ phone: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
              errors.shippingAddress?.phone
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="(123) 456-7890"
          />
          {errors.shippingAddress?.phone && (
            <p className="mt-1 text-sm text-red-500">
              {errors.shippingAddress.phone}
            </p>
          )}
        </div>
      </div>

      {/* Stripe Address Element: dirección + país (lista de países de Stripe) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shipping Address *
        </label>
        <AddressElement
          options={{
            mode: "shipping",
            allowedCountries: ["US", "CA", "MX", "VE", "CO", "ES", "AR", "CL", "PE", "EC", "GT", "DO", "PR"],
            defaultValues: shippingAddress.country
              ? {
                  name: shippingAddress.firstName || shippingAddress.lastName
                    ? `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim()
                    : undefined,
                  address: {
                    line1: shippingAddress.address || undefined,
                    line2: shippingAddress.apartment || undefined,
                    city: shippingAddress.city || undefined,
                    state: shippingAddress.state || undefined,
                    postal_code: shippingAddress.zipCode || undefined,
                    country: shippingAddress.country,
                  },
                }
              : undefined,
            fields: {
              phone: "never",
            },
            autocomplete: { mode: "automatic" },
          }}
          onChange={handleAddressChange}
        />
      </div>

      {/* Métodos de envío estáticos: Standard (por defecto), Express, Overnight */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-negro mb-1">
          Shipping Method
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Standard Shipping is our default option (5–7 business days, free). Choose Express or Overnight for faster delivery.
        </p>
        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedShippingMethod.id === method.id
                  ? "border-negro bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={method.id}
                checked={selectedShippingMethod.id === method.id}
                onChange={() => onShippingMethodChange(method.id)}
                className="mt-1 mr-3 h-4 w-4 text-negro focus:ring-negro"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-negro flex items-center gap-2">
                      {method.name}
                      {method.id === "standard" && (
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {method.description}
                    </div>
                  </div>
                  <div className="font-medium text-negro ml-4">
                    {method.price === 0 ? "Free" : formatPrice(method.price)}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
