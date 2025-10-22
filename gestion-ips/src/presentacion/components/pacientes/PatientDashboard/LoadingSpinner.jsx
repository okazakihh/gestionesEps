import React from 'react';

/**
 * Componente reutilizable para mostrar un indicador de carga
 * @param {Object} props - Propiedades del componente
 * @param {string} props.size - Tamaño del spinner ('sm', 'md', 'lg')
 * @param {string} props.color - Color del spinner (clase Tailwind)
 * @param {string} props.message - Mensaje opcional a mostrar
 * @returns {JSX.Element} Componente de carga
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'border-blue-600',
  message = null
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`animate-spin rounded-full border-b-2 ${color} ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;