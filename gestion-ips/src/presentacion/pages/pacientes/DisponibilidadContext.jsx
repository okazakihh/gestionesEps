import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { disponibilidadApiService } from '../../../data/services/disponibilidadApiService.js';

// 1. Crear el Contexto
const DisponibilidadContext = createContext();

// 2. Crear el Hook para consumir el contexto fácilmente
export const useDisponibilidadContext = () => {
  const context = useContext(DisponibilidadContext);
  if (!context) {
    throw new Error('useDisponibilidadContext debe ser usado dentro de un DisponibilidadProvider');
  }
  return context;
};

// 3. Crear el Provider que manejará el estado
export const DisponibilidadProvider = ({ children }) => {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDisponibilidades = useCallback(async () => {
    try {
      setLoading(true);
      const response = await disponibilidadApiService.getAllDisponibilidades();
      // Log para inspeccionar el objeto de respuesta completo
      console.log('[DisponibilidadContext] 🔍 Objeto de respuesta completo recibido de la API:', response);
      
      setDisponibilidades(response || []); // Usamos la respuesta directa
      console.log('[DisponibilidadContext] ✅ Disponibilidades cargadas y almacenadas en el contexto:', response);
    } catch (error) {
      console.error('[DisponibilidadContext] ❌ Error cargando disponibilidades:', error);
      setDisponibilidades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisponibilidades();
  }, [loadDisponibilidades]);

  const value = { disponibilidades, loading, refreshDisponibilidades: loadDisponibilidades };

  return <DisponibilidadContext.Provider value={value}>{children}</DisponibilidadContext.Provider>;
};