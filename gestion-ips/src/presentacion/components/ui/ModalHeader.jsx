import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Componente de header reutilizable para modales
 * Incluye título, subtítulo opcional, icono y botón de cerrar
 */
const ModalHeader = ({
  title,
  subtitle,
  onClose,
  showCloseButton = true,
  icon: Icon,
  variant = 'default' // default, success, warning, error
}) => {
  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  return (
    <div className={`${variantClasses[variant]} px-6 py-4 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="h-6 w-6 text-white" />}
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-white opacity-90">{subtitle}</p>}
        </div>
      </div>
      {showCloseButton && (
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ModalHeader;