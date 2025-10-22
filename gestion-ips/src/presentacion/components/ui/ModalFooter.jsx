import React from 'react';

/**
 * Componente de footer reutilizable para modales
 * Maneja la disposición de botones de acción
 */
const ModalFooter = ({
  children,
  align = 'end', // start, center, end, between
  className = ''
}) => {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 flex ${alignClasses[align]} space-x-3 ${className}`}>
      {children}
    </div>
  );
};

export default ModalFooter;