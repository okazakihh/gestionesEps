// hooks/facturacion/useFacturaFilters.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para gestionar filtros de citas y facturas
 * Maneja filtros por fecha, paciente, médico, procedimiento, código CUPS y número de factura
 */
export const useFacturaFilters = () => {
  // Estados para filtros de citas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroDocumentoPaciente, setFiltroDocumentoPaciente] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroProcedimiento, setFiltroProcedimiento] = useState('');
  const [filtroCodigoCups, setFiltroCodigoCups] = useState('');
  const [showFiltrosFecha, setShowFiltrosFecha] = useState(false);
  
  // Estados para citas filtradas
  const [citasAtendidasFiltradas, setCitasAtendidasFiltradas] = useState([]);
  
  // Estados para filtros de facturas
  const [filtroNumeroFactura, setFiltroNumeroFactura] = useState('');
  const [filtroFechaFacturaInicio, setFiltroFechaFacturaInicio] = useState('');
  const [filtroFechaFacturaFin, setFiltroFechaFacturaFin] = useState('');
  const [showFiltrosFactura, setShowFiltrosFactura] = useState(false);

  /**
   * Aplica filtros a las citas
   */
  const aplicarFiltrosCitas = useCallback((citasAtendidas) => {
    let citasFiltradas = [...citasAtendidas];

    // Filtro por fecha inicio
    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio + 'T00:00:00');
      citasFiltradas = citasFiltradas.filter(cita => {
        try {
          const fechaCita = new Date(cita.fechaAtencion);
          return fechaCita >= fechaInicioDate;
        } catch (error) {
          return false;
        }
      });
    }

    // Filtro por fecha fin
    if (fechaFin) {
      const fechaFinDate = new Date(fechaFin + 'T23:59:59');
      citasFiltradas = citasFiltradas.filter(cita => {
        try {
          const fechaCita = new Date(cita.fechaAtencion);
          return fechaCita <= fechaFinDate;
        } catch (error) {
          return false;
        }
      });
    }

    // Filtro por documento de paciente
    if (filtroDocumentoPaciente.trim()) {
      citasFiltradas = citasFiltradas.filter(cita =>
        cita.documentoPaciente &&
        cita.documentoPaciente.toLowerCase().includes(filtroDocumentoPaciente.toLowerCase())
      );
    }

    // Filtro por código CUPS
    if (filtroCodigoCups.trim()) {
      citasFiltradas = citasFiltradas.filter(cita =>
        cita.codigoCups &&
        cita.codigoCups.toLowerCase().includes(filtroCodigoCups.toLowerCase())
      );
    }

    // Filtro por médico
    if (filtroMedico.trim()) {
      citasFiltradas = citasFiltradas.filter(cita =>
        cita.nombreMedico &&
        cita.nombreMedico.toLowerCase().includes(filtroMedico.toLowerCase())
      );
    }

    // Filtro por procedimiento
    if (filtroProcedimiento.trim()) {
      citasFiltradas = citasFiltradas.filter(cita =>
        cita.nombreProcedimiento &&
        cita.nombreProcedimiento.toLowerCase().includes(filtroProcedimiento.toLowerCase())
      );
    }

    return citasFiltradas;
  }, [fechaInicio, fechaFin, filtroDocumentoPaciente, filtroCodigoCups, filtroMedico, filtroProcedimiento]);

  /**
   * Aplica filtros a las facturas
   */
  const aplicarFiltrosFacturas = useCallback((facturas) => {
    let facturasFiltradas = [...facturas];

    // Filtro por número de factura
    if (filtroNumeroFactura.trim()) {
      facturasFiltradas = facturasFiltradas.filter(factura => {
        try {
          const facturaData = JSON.parse(factura.jsonData || '{}');
          const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;
          return numeroFactura.toLowerCase().includes(filtroNumeroFactura.toLowerCase());
        } catch (error) {
          return false;
        }
      });
    }

    // Filtro por fecha inicio
    if (filtroFechaFacturaInicio) {
      const fechaInicioDate = new Date(filtroFechaFacturaInicio + 'T00:00:00');
      facturasFiltradas = facturasFiltradas.filter(factura => {
        try {
          const facturaData = JSON.parse(factura.jsonData || '{}');
          const fechaFactura = new Date(facturaData.fechaEmision || factura.fechaCreacion);
          return fechaFactura >= fechaInicioDate;
        } catch (error) {
          return false;
        }
      });
    }

    // Filtro por fecha fin
    if (filtroFechaFacturaFin) {
      const fechaFinDate = new Date(filtroFechaFacturaFin + 'T23:59:59');
      facturasFiltradas = facturasFiltradas.filter(factura => {
        try {
          const facturaData = JSON.parse(factura.jsonData || '{}');
          const fechaFactura = new Date(facturaData.fechaEmision || factura.fechaCreacion);
          return fechaFactura <= fechaFinDate;
        } catch (error) {
          return false;
        }
      });
    }

    return facturasFiltradas;
  }, [filtroNumeroFactura, filtroFechaFacturaInicio, filtroFechaFacturaFin]);

  /**
   * Limpia todos los filtros de citas
   */
  const limpiarFiltrosCitas = useCallback(() => {
    setFechaInicio('');
    setFechaFin('');
    setFiltroDocumentoPaciente('');
    setFiltroCodigoCups('');
    setFiltroMedico('');
    setFiltroProcedimiento('');
  }, []);

  /**
   * Limpia todos los filtros de facturas
   */
  const limpiarFiltrosFacturas = useCallback(() => {
    setFiltroNumeroFactura('');
    setFiltroFechaFacturaInicio('');
    setFiltroFechaFacturaFin('');
  }, []);

  /**
   * Toggle para mostrar/ocultar filtros de citas
   */
  const toggleFiltrosCitas = useCallback(() => {
    setShowFiltrosFecha(prev => !prev);
  }, []);

  /**
   * Toggle para mostrar/ocultar filtros de facturas
   */
  const toggleFiltrosFacturas = useCallback(() => {
    setShowFiltrosFactura(prev => !prev);
  }, []);

  return {
    // Estados de filtros de citas
    fechaInicio,
    fechaFin,
    filtroDocumentoPaciente,
    filtroCodigoCups,
    filtroMedico,
    filtroProcedimiento,
    showFiltrosFecha,
    citasAtendidasFiltradas,
    
    // Estados de filtros de facturas
    filtroNumeroFactura,
    filtroFechaFacturaInicio,
    filtroFechaFacturaFin,
    showFiltrosFactura,
    
    // Setters de filtros de citas
    setFechaInicio,
    setFechaFin,
    setFiltroDocumentoPaciente,
    setFiltroCodigoCups,
    setFiltroMedico,
    setFiltroProcedimiento,
    setCitasAtendidasFiltradas,
    
    // Setters de filtros de facturas
    setFiltroNumeroFactura,
    setFiltroFechaFacturaInicio,
    setFiltroFechaFacturaFin,
    
    // Funciones
    aplicarFiltrosCitas,
    aplicarFiltrosFacturas,
    limpiarFiltrosCitas,
    limpiarFiltrosFacturas,
    toggleFiltrosCitas,
    toggleFiltrosFacturas
  };
};

export default useFacturaFilters;
