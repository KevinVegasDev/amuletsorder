"use client";

import React from "react";
import { ShippingAddress, ShippingMethod } from "../../types/checkout";
import { CheckoutValidationErrors } from "../../types/checkout";

interface ShippingFormProps {
  shippingAddress: ShippingAddress;
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod;
  errors: CheckoutValidationErrors;
  onShippingAddressChange: (address: Partial<ShippingAddress>) => void;
  onShippingMethodChange: (methodId: ShippingMethod["id"]) => void;
}

/**
 * Formulario de envío
 */
export const ShippingForm: React.FC<ShippingFormProps> = ({
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-negro">Shipping Information</h2>

      {/* Email y Teléfono */}
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

      {/* Nombre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={shippingAddress.firstName}
            onChange={(e) =>
              onShippingAddressChange({ firstName: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
              errors.shippingAddress?.firstName
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="John"
          />
          {errors.shippingAddress?.firstName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.shippingAddress.firstName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={shippingAddress.lastName}
            onChange={(e) =>
              onShippingAddressChange({ lastName: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
              errors.shippingAddress?.lastName
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Doe"
          />
          {errors.shippingAddress?.lastName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.shippingAddress.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Dirección */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Address *
        </label>
        <input
          type="text"
          id="address"
          value={shippingAddress.address}
          onChange={(e) => onShippingAddressChange({ address: e.target.value })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
            errors.shippingAddress?.address
              ? "border-red-500"
              : "border-gray-300"
          }`}
          placeholder="123 Main Street"
        />
        {errors.shippingAddress?.address && (
          <p className="mt-1 text-sm text-red-500">
            {errors.shippingAddress.address}
          </p>
        )}
      </div>

      {/* Apartamento (opcional) */}
      <div>
        <label
          htmlFor="apartment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          id="apartment"
          value={shippingAddress.apartment || ""}
          onChange={(e) =>
            onShippingAddressChange({ apartment: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent"
          placeholder="Apt 4B"
        />
      </div>

      {/* Ciudad, Estado y ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            City *
          </label>
          <input
            type="text"
            id="city"
            value={shippingAddress.city}
            onChange={(e) => onShippingAddressChange({ city: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
              errors.shippingAddress?.city
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="New York"
          />
          {errors.shippingAddress?.city && (
            <p className="mt-1 text-sm text-red-500">
              {errors.shippingAddress.city}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            State *
          </label>
          <input
            type="text"
            id="state"
            value={shippingAddress.state}
            onChange={(e) => onShippingAddressChange({ state: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
              errors.shippingAddress?.state
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="NY"
          />
          {errors.shippingAddress?.state && (
            <p className="mt-1 text-sm text-red-500">
              {errors.shippingAddress.state}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="zipCode"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            ZIP Code *
          </label>
          <input
            type="text"
            id="zipCode"
            value={shippingAddress.zipCode}
            onChange={(e) =>
              onShippingAddressChange({ zipCode: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
              errors.shippingAddress?.zipCode
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="10001"
          />
          {errors.shippingAddress?.zipCode && (
            <p className="mt-1 text-sm text-red-500">
              {errors.shippingAddress.zipCode}
            </p>
          )}
        </div>
      </div>

      {/* País */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Country *
        </label>
        <select
          id="country"
          value={shippingAddress.country}
          onChange={(e) => onShippingAddressChange({ country: e.target.value })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent ${
            errors.shippingAddress?.country
              ? "border-red-500"
              : "border-gray-300"
          }`}
        >
          <option value="US">United States</option>
          <option value="MX">Mexico</option>
          <option value="CA">Canada</option>
        </select>
        {errors.shippingAddress?.country && (
          <p className="mt-1 text-sm text-red-500">
            {errors.shippingAddress.country}
          </p>
        )}
      </div>

      {/* Métodos de envío */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-negro mb-4">
          Shipping Method
        </h3>
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
                    <div className="font-medium text-negro">{method.name}</div>
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

