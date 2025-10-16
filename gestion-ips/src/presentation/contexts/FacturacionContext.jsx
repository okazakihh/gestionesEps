/**
 * Contexto de React para la gestión de facturación
 * Presentation Layer - Contexts
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useFacturacion } from '../hooks/useFacturacion.js';
import { dependencyContainer } from '../../infrastructure/di/index.js';

// Crear el contexto
const FacturacionContext = createContext();

// Hook personalizado para usar el contexto
export const useFacturacionContext = () => {
  const context = useContext(FacturacionContext);
  if (!context) {
    throw new Error('useFacturacionContext debe ser usado dentro de un FacturacionProvider');
  }
  return context;
};

// Provider del contexto
export const FacturacionProvider = ({ children }) => {
  // Inicializar el contenedor de dependencias al montar el provider
  useEffect(() => {
    if (!dependencyContainer.isInitialized()) {
      dependencyContainer.initialize();
    }
  }, []);

  // Usar el hook personalizado
  const facturacionState = useFacturacion();

  // Valor del contexto
  const value = {
    // Estados
    ...facturacionState,

    // Funciones adicionales del contexto
    // Aquí se pueden agregar funciones específicas del contexto
    // que no estén en el hook personalizado
  };

  return (
    <FacturacionContext.Provider value={value}>
      {children}
    </FacturacionContext.Provider>
  );
};

// Export por defecto
export default FacturacionContext;