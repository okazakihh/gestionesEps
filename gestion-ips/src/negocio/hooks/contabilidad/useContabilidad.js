/**
 * useContabilidad.js
 * 
 * Hook personalizado para el módulo de contabilidad
 * Integra datos de la aplicación con Siigo
 * 
 * Capa: Negocio
 */

import { useState, useEffect, useCallback } from 'react';
import contabilidadService from '../../services/contabilidadService.js';
import { useSiigoIntegration } from '../facturacion/useSiigoIntegration.js';
import { useIpsConfig } from '../configuracion/useIpsConfig.js';

export const useContabilidad = () => {
  // Estados
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [catalogos, setCatalogos] = useState({});
  const [estadisticas, setEstadisticas] = useState(null);
  
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);

  // Hooks de dependencias
  const { isConnected, isLoading: siigoLoading } = useSiigoIntegration();
  const { ipsConfig } = useIpsConfig();

  /**
   * Cargar clientes (pacientes) con estado de sincronización
   */
  const cargarClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const data = await contabilidadService.clientes.obtenerClientes();
      setClientes(data);
      return data;
    } catch (error) {
      console.error('Error cargando clientes:', error);
      throw error;
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  /**
   * Sincronizar cliente con Siigo
   */
  const sincronizarCliente = useCallback(async (clienteData) => {
    if (!isConnected) {
      throw new Error('Siigo no está conectado');
    }

    try {
      const resultado = await contabilidadService.clientes.sincronizarCliente(
        clienteData,
        ipsConfig
      );
      
      // Recargar clientes
      await cargarClientes();
      
      return resultado;
    } catch (error) {
      console.error('Error sincronizando cliente:', error);
      throw error;
    }
  }, [isConnected, ipsConfig, cargarClientes]);

  /**
   * Sincronización masiva de clientes
   */
  const sincronizarClientesMasivo = useCallback(async (clientesData) => {
    if (!isConnected) {
      throw new Error('Siigo no está conectado');
    }

    try {
      const resultados = await contabilidadService.clientes.sincronizarMasivo(
        clientesData,
        ipsConfig
      );
      
      // Recargar clientes
      await cargarClientes();
      
      return resultados;
    } catch (error) {
      console.error('Error en sincronización masiva:', error);
      throw error;
    }
  }, [isConnected, ipsConfig, cargarClientes]);

  /**
   * Buscar clientes
   */
  const buscarClientes = useCallback(async (termino) => {
    try {
      const resultados = await contabilidadService.clientes.buscarClientes(termino);
      return resultados;
    } catch (error) {
      console.error('Error buscando clientes:', error);
      throw error;
    }
  }, []);

  /**
   * Cargar productos (códigos CUPS) con estado de sincronización
   */
  const cargarProductos = useCallback(async () => {
    setLoadingProductos(true);
    try {
      const data = await contabilidadService.productos.obtenerProductos();
      setProductos(data);
      return data;
    } catch (error) {
      console.error('Error cargando productos:', error);
      throw error;
    } finally {
      setLoadingProductos(false);
    }
  }, []);

  /**
   * Sincronizar producto con Siigo
   */
  const sincronizarProducto = useCallback(async (codigoCupsId, accountGroupId) => {
    if (!isConnected) {
      throw new Error('Siigo no está conectado');
    }

    try {
      const resultado = await contabilidadService.productos.sincronizarProducto(
        codigoCupsId,
        accountGroupId
      );
      
      // Recargar productos
      await cargarProductos();
      
      return resultado;
    } catch (error) {
      console.error('Error sincronizando producto:', error);
      throw error;
    }
  }, [isConnected, cargarProductos]);

  /**
   * Buscar productos
   */
  const buscarProductos = useCallback(async (termino) => {
    try {
      const resultados = await contabilidadService.productos.buscarProductos(termino);
      return resultados;
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  }, []);

  /**
   * Cargar catálogos de Siigo
   */
  const cargarCatalogos = useCallback(async (forzar = false) => {
    setLoadingCatalogos(true);
    try {
      const data = await contabilidadService.catalogos.obtenerCatalogosConCache(forzar);
      setCatalogos(data);
      return data;
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      throw error;
    } finally {
      setLoadingCatalogos(false);
    }
  }, []);

  /**
   * Obtener estadísticas de facturación
   */
  const obtenerEstadisticas = useCallback(async (fechaInicio, fechaFin) => {
    setLoadingEstadisticas(true);
    try {
      const resumen = await contabilidadService.reportes.obtenerResumenFacturacion(
        fechaInicio,
        fechaFin
      );
      
      const porMedico = await contabilidadService.reportes.obtenerEstadisticasPorMedico(
        fechaInicio,
        fechaFin
      );
      
      const servicios = await contabilidadService.reportes.obtenerServiciosMasFacturados(
        fechaInicio,
        fechaFin,
        10
      );

      const estadisticasCompletas = {
        resumen,
        porMedico,
        serviciosMasFacturados: servicios
      };

      setEstadisticas(estadisticasCompletas);
      return estadisticasCompletas;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    } finally {
      setLoadingEstadisticas(false);
    }
  }, []);

  /**
   * Exportar reporte
   */
  const exportarReporte = useCallback(async (tipo, fechaInicio, fechaFin) => {
    try {
      const reporte = await contabilidadService.reportes.exportarReporte(
        tipo,
        fechaInicio,
        fechaFin
      );
      return reporte;
    } catch (error) {
      console.error('Error exportando reporte:', error);
      throw error;
    }
  }, []);

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    if (isConnected) {
      cargarCatalogos();
    }
  }, [isConnected, cargarCatalogos]);

  return {
    // Estados
    clientes,
    productos,
    catalogos,
    estadisticas,
    
    // Estados de carga
    loadingClientes,
    loadingProductos,
    loadingCatalogos,
    loadingEstadisticas,
    
    // Estado de Siigo
    siigoConnected: isConnected,
    siigoLoading,
    
    // Funciones de clientes
    cargarClientes,
    sincronizarCliente,
    sincronizarClientesMasivo,
    buscarClientes,
    
    // Funciones de productos
    cargarProductos,
    sincronizarProducto,
    buscarProductos,
    
    // Funciones de catálogos
    cargarCatalogos,
    
    // Funciones de reportes
    obtenerEstadisticas,
    exportarReporte
  };
};
