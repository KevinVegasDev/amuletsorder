"use client";

import React from "react";
import { CheckoutStep } from "../../types/checkout";

interface CheckoutHeaderProps {
  steps: CheckoutStep[];
}

/**
 * Header del checkout con indicador de pasos
 */
export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ steps }) => {
  return (
    <div className="w-full py-6 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-negro mb-6">
          Checkout
        </h1>

        {/* Pasos del checkout */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Círculo del paso */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-200 ${
                      step.current
                        ? "bg-negro text-white"
                        : step.completed
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.completed ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  {/* Etiqueta del paso */}
                  <span
                    className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      step.current
                        ? "text-negro"
                        : step.completed
                        ? "text-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>

              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-colors duration-200 ${
                    step.completed ? "bg-gray-800" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

