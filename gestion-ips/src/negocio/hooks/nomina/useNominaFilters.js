import { useState, useMemo, useCallback } from 'react';

/**
 * Hook para filtrado de nóminas
 * Gestiona búsqueda y filtros múltiples
 */
export const useNominaFilters = (nominas = []) => {
  // Estado de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [empleadoFilter, setEmpleadoFilter] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [estadoFilter, setEstadoFilter] = useState(''); // 'activo' | 'inactivo' | ''

  /**
   * Normaliza texto para comparaciones
   */
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase().trim();
  };

  /**
   * Aplica filtros a las nóminas
   */
  const filteredNominas = useMemo(() => {
    let filtered = [...nominas];

    // Filtro por término de búsqueda (busca en múltiples campos)
    if (searchTerm) {
      const searchLower = normalizeText(searchTerm);
      filtered = filtered.filter((nomina) => {
        const empleadoNombre = normalizeText(nomina.empleadoNombre || nomina.empleado?.nombre);
        const empleadoDocumento = normalizeText(nomina.empleadoDocumento || nomina.empleado?.documento);
        const periodo = normalizeText(nomina.periodo);
        const salario = normalizeText(nomina.salarioBase || nomina.salario);

        return (
          empleadoNombre.includes(searchLower) ||
          empleadoDocumento.includes(searchLower) ||
          periodo.includes(searchLower) ||
          salario.includes(searchLower)
        );
      });
    }

    // Filtro por empleado específico
    if (empleadoFilter) {
      const empleadoLower = normalizeText(empleadoFilter);
      filtered = filtered.filter((nomina) => {
        const empleadoNombre = normalizeText(nomina.empleadoNombre || nomina.empleado?.nombre);
        const empleadoDocumento = normalizeText(nomina.empleadoDocumento || nomina.empleado?.documento);
        
        return (
          empleadoNombre.includes(empleadoLower) ||
          empleadoDocumento.includes(empleadoLower)
        );
      });
    }

    // Filtro por periodo
    if (periodoFilter) {
      const periodoLower = normalizeText(periodoFilter);
      filtered = filtered.filter((nomina) => {
        const periodo = normalizeText(nomina.periodo);
        return periodo.includes(periodoLower);
      });
    }

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      filtered = filtered.filter((nomina) => {
        const fechaNomina = new Date(nomina.fechaPago || nomina.fecha);
        
        if (fechaDesde && fechaHasta) {
          const desde = new Date(fechaDesde);
          const hasta = new Date(fechaHasta);
          return fechaNomina >= desde && fechaNomina <= hasta;
        }
        
        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          return fechaNomina >= desde;
        }
        
        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          return fechaNomina <= hasta;
        }
        
        return true;
      });
    }

    // Filtro por estado (activo/inactivo)
    if (estadoFilter) {
      filtered = filtered.filter((nomina) => {
        if (estadoFilter === 'activo') {
          return nomina.activo === true || nomina.estado === 'ACTIVO';
        } else if (estadoFilter === 'inactivo') {
          return nomina.activo === false || nomina.estado === 'INACTIVO';
        }
        return true;
      });
    }

    console.log(`🔍 Filtros aplicados: ${filtered.length} de ${nominas.length} nóminas`);
    return filtered;
  }, [nominas, searchTerm, empleadoFilter, periodoFilter, fechaDesde, fechaHasta, estadoFilter]);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setEmpleadoFilter('');
    setPeriodoFilter('');
    setFechaDesde('');
    setFechaHasta('');
    setEstadoFilter('');
  }, []);

  /**
   * Verifica si hay filtros activos
   */
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      empleadoFilter ||
      periodoFilter ||
      fechaDesde ||
      fechaHasta ||
      estadoFilter
    );
  }, [searchTerm, empleadoFilter, periodoFilter, fechaDesde, fechaHasta, estadoFilter]);

  /**
   * Obtiene estadísticas de las nóminas filtradas
   */
  const statistics = useMemo(() => {
    const totalNominas = filteredNominas.length;
    const totalPagado = filteredNominas.reduce((sum, nomina) => {
      const total = nomina.totalPagar || nomina.total || 0;
      return sum + Number(total);
    }, 0);

    const activas = filteredNominas.filter(n => n.activo === true || n.estado === 'ACTIVO').length;
    const inactivas = filteredNominas.filter(n => n.activo === false || n.estado === 'INACTIVO').length;

    return {
      totalNominas,
      totalPagado,
      activas,
      inactivas
    };
  }, [filteredNominas]);

  return {
    // Nóminas filtradas
    filteredNominas,
    
    // Estado de filtros
    searchTerm,
    empleadoFilter,
    periodoFilter,
    fechaDesde,
    fechaHasta,
    estadoFilter,
    
    // Setters
    setSearchTerm,
    setEmpleadoFilter,
    setPeriodoFilter,
    setFechaDesde,
    setFechaHasta,
    setEstadoFilter,
    
    // Utilidades
    clearFilters,
    hasActiveFilters,
    
    // Estadísticas
    statistics,
    
    // Contadores
    totalOriginal: nominas.length,
    totalFiltered: filteredNominas.length
  };
};
