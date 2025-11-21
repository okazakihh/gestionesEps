import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';

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
  const { tema } = useTheme();

  const variantStyles = {
    default: { backgroundColor: tema.primaryColor },
    success: { backgroundColor: '#16a34a' },
    warning: { backgroundColor: '#ca8a04' },
    error: { backgroundColor: '#dc2626' }
  };

  return (
    <div 
      className="px-6 py-4 flex items-center justify-between"
      style={variantStyles[variant]}
    >
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