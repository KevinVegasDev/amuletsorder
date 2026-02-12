"use client";

import React, { useMemo } from "react";
import { ALLOWED_SHIPPING_COUNTRY_CODES } from "../../lib/shipping-countries";
import { ShippingAddress, ShippingMethod } from "../../types/checkout";
import { CheckoutValidationErrors } from "../../types/checkout";

interface ShippingFormStripeProps {
  shippingAddress: ShippingAddress;
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod | null;
  errors: CheckoutValidationErrors;
  onShippingAddressChange: (address: Partial<ShippingAddress>) => void;
  onShippingMethodChange: (methodId: ShippingMethod["id"]) => void;
  /** Mientras se obtienen tarifas según la dirección */
  loading?: boolean;
  /** true = tarifas desde API (WooCommerce o Printful); false = son las por defecto estáticas */
  ratesFromApi?: boolean;
  /** true cuando Printful devolvió "State code is missing" (ej. US/CA requieren estado para ver opciones) */
  stateRequiredForRates?: boolean;
}

const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
function getCountryName(code: string): string {
  try {
    return countryDisplayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Formulario de envío: nombre/apellido, email, teléfono, dirección (sin Stripe Address Element
 * para evitar el campo "Full name" y mostrar solo First name / Last name y dirección por campos).
 */
export const ShippingFormStripe: React.FC<ShippingFormStripeProps> = ({
  shippingAddress,
  shippingMethods,
  selectedShippingMethod,
  errors,
  onShippingAddressChange,
  onShippingMethodChange,
  loading = false,
  ratesFromApi = false,
  stateRequiredForRates = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const countryOptions = useMemo(
    () =>
      [...ALLOWED_SHIPPING_COUNTRY_CODES].sort((a, b) =>
        getCountryName(a).localeCompare(getCountryName(b))
      ),
    []
  );

  const inputBase =
    "w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-negro focus:border-transparent transition-colors";
  const inputError = "border-red-500";
  const inputNormal = "border-gray-300";

  return (
    <div className="space-y-8">
      {/* Encabezado estándar: título + subtítulo */}
      <header>
        <h2 className="text-xl font-bold text-negro">Shipping Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          We need your contact and address to ship your order and send tracking updates.
        </p>
      </header>

      {/* Sección 1: Contact (Personal Information) — estándar en checkouts */}
      <section aria-labelledby="contact-heading">
        <h3 id="contact-heading" className="text-sm font-semibold text-gray-800 mb-4">
          Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping-first-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              First name            </label>
            <input
              type="text"
              id="shipping-first-name"
              value={shippingAddress.firstName}
              onChange={(e) => onShippingAddressChange({ firstName: e.target.value })}
              className={`${inputBase} ${errors.shippingAddress?.firstName ? inputError : inputNormal}`}
              placeholder="John"
              autoComplete="given-name"
            />
            {errors.shippingAddress?.firstName && (
              <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="shipping-last-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Last name            </label>
            <input
              type="text"
              id="shipping-last-name"
              value={shippingAddress.lastName}
              onChange={(e) => onShippingAddressChange({ lastName: e.target.value })}
              className={`${inputBase} ${errors.shippingAddress?.lastName ? inputError : inputNormal}`}
              placeholder="Doe"
              autoComplete="family-name"
            />
            {errors.shippingAddress?.lastName && (
              <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.lastName}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address            </label>
            <input
              type="email"
              id="email"
              value={shippingAddress.email}
              onChange={(e) => onShippingAddressChange({ email: e.target.value })}
              className={`${inputBase} ${errors.shippingAddress?.email ? inputError : inputNormal}`}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.shippingAddress?.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number            </label>
            <input
              type="tel"
              id="phone"
              value={shippingAddress.phone}
              onChange={(e) => onShippingAddressChange({ phone: e.target.value })}
              className={`${inputBase} ${errors.shippingAddress?.phone ? inputError : inputNormal}`}
              placeholder="(123) 456-7890"
              autoComplete="tel"
            />
            {errors.shippingAddress?.phone && (
              <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.phone}</p>
            )}
          </div>
        </div>
      </section>

      {/* Sección 2: Shipping Address — estándar en checkouts */}
      <section aria-labelledby="address-heading" className="pt-6 border-t border-gray-200">
        <h3 id="address-heading" className="text-sm font-semibold text-gray-800 mb-1">
          Shipping Address        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {shippingAddress.country
            ? "Complete your address (including city) to see shipping options."
            : "Select your country first, then complete your address to see shipping options."}
        </p>
        <div className="space-y-4">
          {/* País primero; el resto de campos solo se muestran cuando hay país seleccionado */}
          <div>
            <label htmlFor="shipping-country" className="block text-sm font-medium text-gray-700 mb-1.5">
              Country            </label>
            <select
              id="shipping-country"
              value={shippingAddress.country}
              onChange={(e) => onShippingAddressChange({ country: e.target.value })}
              className={`${inputBase} ${errors.shippingAddress?.country ? inputError : inputNormal}`}
              autoComplete="country"
            >
              <option value="">Select country</option>
              {countryOptions.map((code) => (
                <option key={code} value={code}>
                  {getCountryName(code)}
                </option>
              ))}
            </select>
            {errors.shippingAddress?.country && (
              <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.country}</p>
            )}
          </div>
          {shippingAddress.country && (
            <>
              <div>
                <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address line 1                </label>
                <input
                  type="text"
                  id="shipping-address"
                  value={shippingAddress.address}
                  onChange={(e) => onShippingAddressChange({ address: e.target.value })}
                  className={`${inputBase} ${errors.shippingAddress?.address ? inputError : inputNormal}`}
                  placeholder="123 Main Street"
                  autoComplete="address-line1"
                />
                {errors.shippingAddress?.address && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.address}</p>
                )}
              </div>
              <div>
                <label htmlFor="shipping-apartment" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Apt., suite, unit, etc. <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="shipping-apartment"
                  value={shippingAddress.apartment || ""}
                  onChange={(e) => onShippingAddressChange({ apartment: e.target.value })}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="Apt 4B"
                  autoComplete="address-line2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700 mb-1.5">
                    City                  </label>
                  <input
                    type="text"
                    id="shipping-city"
                    value={shippingAddress.city}
                    onChange={(e) => onShippingAddressChange({ city: e.target.value })}
                    className={`${inputBase} ${errors.shippingAddress?.city ? inputError : inputNormal}`}
                    placeholder="Toronto"
                    autoComplete="address-level2"
                  />
                  {errors.shippingAddress?.city && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="shipping-state" className="block text-sm font-medium text-gray-700 mb-1.5">
                    State / Province                  </label>
                  <input
                    type="text"
                    id="shipping-state"
                    value={shippingAddress.state}
                    onChange={(e) => onShippingAddressChange({ state: e.target.value })}
                    className={`${inputBase} ${errors.shippingAddress?.state ? inputError : inputNormal}`}
                    placeholder="Ontario"
                    autoComplete="address-level1"
                  />
                  {errors.shippingAddress?.state && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.state}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="shipping-zip" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Postal code                  </label>
                  <input
                    type="text"
                    id="shipping-zip"
                    value={shippingAddress.zipCode}
                    onChange={(e) => onShippingAddressChange({ zipCode: e.target.value })}
                    className={`${inputBase} ${errors.shippingAddress?.zipCode ? inputError : inputNormal}`}
                    placeholder="M4P 1A6"
                    autoComplete="postal-code"
                  />
                  {errors.shippingAddress?.zipCode && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.shippingAddress.zipCode}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Resumen de errores de dirección (burbuja como antes) */}
        {(() => {
          if (!errors.shippingAddress) return null;
          const addrErrors = [
            errors.shippingAddress.firstName && { field: "First name", msg: errors.shippingAddress.firstName },
            errors.shippingAddress.lastName && { field: "Last name", msg: errors.shippingAddress.lastName },
            errors.shippingAddress.address && { field: "Address line 1", msg: errors.shippingAddress.address },
            errors.shippingAddress.city && { field: "City", msg: errors.shippingAddress.city },
            errors.shippingAddress.state && { field: "State", msg: errors.shippingAddress.state },
            errors.shippingAddress.zipCode && { field: "Postal code", msg: errors.shippingAddress.zipCode },
            errors.shippingAddress.country && { field: "Country", msg: errors.shippingAddress.country },
          ].filter((e): e is { field: string; msg: string } => Boolean(e));
          if (addrErrors.length === 0) return null;
          const byField = new Map<string, string[]>();
          addrErrors.forEach((e) => {
            const list = byField.get(e.field) ?? [];
            if (!list.includes(e.msg)) list.push(e.msg);
            byField.set(e.field, list);
          });
          const uniqueErrors = Array.from(byField.entries()).map(([field, msgs]) => ({
            field,
            msg: msgs[0],
          }));
          return (
            <div className="mt-3 flex items-start gap-3 rounded-2xl bg-red-50/90 px-4 py-3 shadow-sm ring-1 ring-red-100/80 backdrop-blur-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600" aria-hidden>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-800">
                  Complete these fields in Shipping Address
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {uniqueErrors.map((e) => (
                    <span
                      key={e.field}
                      className="inline-flex items-center rounded-lg bg-white/70 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200/60"
                    >
                      {e.field}
                    </span>
                  ))}
                </div>
                <ul className="mt-2 space-y-1 text-xs text-red-700">
                  {uniqueErrors.map((e) => (
                    <li key={e.field}>
                      <strong>{e.field}:</strong> {e.msg}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Métodos de envío: solo se muestran cuando hay ciudad (y país) para no pedir tarifas antes de tiempo */}
      <div className="pt-4 border-t border-gray-200">
        {stateRequiredForRates && !shippingAddress.state?.trim() ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            State / province is required to see shipping options for this country. Please complete the state field in the address above.
          </p>
        ) : !shippingAddress.city?.trim() || !shippingAddress.country ? (
          <p className="text-sm text-gray-500">
            Complete your address (including city) to see shipping options.
          </p>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-negro mb-1">
              Shipping Method
            </h3>
            {loading ? (
              <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg text-gray-500">
                <svg className="animate-spin h-5 w-5 text-negro" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm">Getting rates for your address...</span>
              </div>
            ) : shippingMethods.length === 0 ? (
              <p className="text-sm text-gray-500">
                No shipping options available for this address.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {ratesFromApi ? "Shipping options for your address." : "Choose a shipping option."}
                </p>
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${selectedShippingMethod?.id === method.id
                        ? "border-negro bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={selectedShippingMethod?.id === method.id}
                        onChange={() => onShippingMethodChange(method.id)}
                        className="mt-1 mr-3 h-4 w-4 text-negro focus:ring-negro"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-negro flex items-center gap-2">
                              {method.name}
                              {shippingMethods.length > 0 && shippingMethods[0].id === method.id && (
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
