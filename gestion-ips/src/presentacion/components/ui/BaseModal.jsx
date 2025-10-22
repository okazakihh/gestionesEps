import React from 'react';

/**
 * Componente base reutilizable para modales
 * Proporciona la estructura básica de overlay y contenedor
 */
const BaseModal = ({
  isOpen,
  onClose,
  children,
  size = 'md', // sm, md, lg, xl, full
  showCloseButton = true,
  closeOnBackdrop = true,
  className = ''
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '4xl': 'max-w-5xl',
    '5xl': 'max-w-6xl',
    '80vw': '',
    full: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={closeOnBackdrop ? onClose : undefined}
        />

        {/* Modal */}
        <div className={`
          inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all
          ${sizeClasses[size]} ${className}
        `} style={{ maxHeight: '90vh', overflow: 'auto', width: size === '80vw' ? '80vw' : 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;