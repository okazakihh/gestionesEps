import React from 'react';

/**
 * Componente contenedor de contenido para modales
 * Maneja el padding y espaciado interno del modal
 */
const ModalContent = ({
  children,
  padding = 'normal', // none, small, normal, large
  className = ''
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8'
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default ModalContent;