/**
 * Hook especializado para manejar la configuración de la IPS
 * Capa de negocio - No contiene JSX
 * 
 * Este hook proporciona acceso rápido a la configuración institucional
 * de la IPS, que se usa en facturas, historias clínicas y documentos oficiales.
 */

import { useState, useEffect, useCallback } from 'react';
import { configuracionApiService } from '../../../data/services/configuracionApiService.js';

const IPS_CONFIG_KEY = 'IPS_INFO';

export const useIpsConfig = () => {
  const [ipsConfig, setIpsConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar configuración de la IPS desde el backend
   */
  const loadIpsConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await configuracionApiService.getConfiguracionByClave(IPS_CONFIG_KEY);
      
      // Parsear jsonData si viene como string
      const configData = typeof response.jsonData === 'string' 
        ? JSON.parse(response.jsonData) 
        : response.jsonData;
      
      setIpsConfig(configData);
      
      return configData;
    } catch (err) {
      console.error('Error al cargar configuración de la IPS:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar configuración de la IPS');
      
      // Retornar configuración por defecto si falla la carga
      const defaultConfig = getDefaultIpsConfig();
      setIpsConfig(defaultConfig);
      return defaultConfig;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar configuración de la IPS
   */
  const updateIpsConfig = useCallback(async (newConfigData) => {
    try {
      setLoading(true);
      setError(null);
      
      const jsonData = JSON.stringify(newConfigData);
      await configuracionApiService.updateConfiguracionByClave(IPS_CONFIG_KEY, jsonData);
      
      setIpsConfig(newConfigData);
      
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar configuración de la IPS:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración de la IPS');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener configuración por defecto si no existe en el backend
   */
  const getDefaultIpsConfig = () => ({
    nombre: "IPS SALUD TOTAL",
    descripcion: "Institución Prestadora de Servicios de Salud",
    nit: "900.123.456-7",
    direccion: "Calle 123 # 45-67",
    ciudad: "Bucaramanga",
    departamento: "Santander",
    pais: "Colombia",
    codigoPostal: "110111",
    telefono: "+57 (601) 234 5678",
    celular: "+57 300 123 4567",
    email: "contacto@ipssaludtotal.com.co",
    sitioWeb: "www.ipssaludtotal.com.co",
    codigoHabilitacion: "11000012345678",
    resolucionHabilitacion: "Resolución 1234 de 2020",
    nivelAtencion: "II Nivel",
    tipoIPS: "Privada",
    horarioAtencion: "Lunes a Viernes: 7:00 AM - 6:00 PM",
    horarioUrgencias: "24 horas / 7 días",
    regimenTributario: "Régimen Común",
    responsabilidadFiscal: "No responsable de IVA",
    actividadEconomica: "8610 - Actividades de hospitales y clínicas con internación",
    datosBancarios: {
      banco: "Bancolombia",
      tipoCuenta: "Cuenta Corriente",
      numeroCuenta: "123-456789-01",
      nequi: "300 123 4567",
      daviplata: "301 234 5678"
    },
    representanteLegal: {
      nombre: "Dr. Juan Carlos Pérez González",
      cargo: "Director General",
      cedula: "12345678",
      tarjetaProfesional: "12345"
    },
    colores: {
      primario: "#2563eb",
      secundario: "#10b981",
      acento: "#f59e0b",
      texto: "#1f2937",
      textoClaro: "#6b7280"
    },
    // Configuración de Siigo - Modo de operación
    siigoMode: "DEV" // DEV = Mock (sin costo) | PROD = API Real
  });

  // Cargar configuración al montar
  useEffect(() => {
    loadIpsConfig();
  }, [loadIpsConfig]);

  return {
    ipsConfig,
    loading,
    error,
    loadIpsConfig,
    updateIpsConfig,
    getDefaultIpsConfig
  };
};

export default useIpsConfig;
