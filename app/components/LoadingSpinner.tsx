"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = '#212121',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Spinner principal */}
        <div 
          className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200`}
          style={{ borderTopColor: color }}
        >
        </div>
        
        {/* Spinner interno para efecto más dinámico */}
        <div 
          className={`absolute inset-1 ${sizeClasses[size]} animate-spin rounded-full border border-gray-100`}
          style={{ 
            borderRightColor: color,
            animationDirection: 'reverse',
            animationDuration: '0.75s'
          }}
        >
        </div>
      </div>
      
      {text && (
        <p className={`mt-3 ${textSizeClasses[size]} text-gray-600 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;