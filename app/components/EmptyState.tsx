"use client";

import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No hay productos disponibles",
  description = "No se encontraron productos que coincidan con tus criterios de búsqueda.",
  icon,
  actionLabel,
  actionHref,
  onAction,
  className = ''
}) => {
  const defaultIcon = (
    <svg 
      className="w-16 h-16 text-gray-300" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21V9l3-3 3 3v12" 
      />
    </svg>
  );

  const ActionButton = () => {
    if (!actionLabel) return null;

    const buttonClasses = "inline-flex items-center px-4 py-2 bg-negro text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors duration-200";

    if (actionHref) {
      return (
        <Link href={actionHref} className={buttonClasses}>
          {actionLabel}
        </Link>
      );
    }

    if (onAction) {
      return (
        <button onClick={onAction} className={buttonClasses}>
          {actionLabel}
        </button>
      );
    }

    return null;
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icono */}
      <div className="mb-6">
        {icon || defaultIcon}
      </div>

      {/* Título */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>

      {/* Descripción */}
      <p className="text-gray-500 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {/* Acción */}
      <ActionButton />
    </div>
  );
};

// Componentes predefinidos para casos comunes
export const NoProductsFound: React.FC<{ onClearFilters?: () => void }> = ({ onClearFilters }) => (
  <EmptyState
    title="No se encontraron productos"
    description="No hay productos que coincidan con los filtros aplicados. Intenta ajustar tus criterios de búsqueda."
    actionLabel={onClearFilters ? "Limpiar filtros" : undefined}
    onAction={onClearFilters}
    icon={
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
  />
);

export const NoFavorites: React.FC = () => (
  <EmptyState
    title="No tienes favoritos"
    description="Guarda tus productos favoritos para encontrarlos fácilmente más tarde."
    actionLabel="Explorar productos"
    actionHref="/market"
    icon={
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    }
  />
);

export const EmptyCart: React.FC = () => (
  <EmptyState
    title="Tu carrito está vacío"
    description="Agrega algunos productos a tu carrito para continuar con la compra."
    actionLabel="Continuar comprando"
    actionHref="/market"
    icon={
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
      </svg>
    }
  />
);

export const ServerError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    title="Error del servidor"
    description="Hubo un problema al cargar los productos. Por favor, inténtalo de nuevo."
    actionLabel={onRetry ? "Reintentar" : undefined}
    onAction={onRetry}
    icon={
      <svg className="w-16 h-16 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    }
  />
);

export default EmptyState;