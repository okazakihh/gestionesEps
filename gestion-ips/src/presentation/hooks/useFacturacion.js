/**
 * Hook personalizado para la gestión de facturación
 * Presentation Layer - Hooks
 */
import { useState, useEffect, useCallback } from 'react';

export const useFacturacion = () => {
  // Estados para citas atendidas
  const [citasAtendidas, setCitasAtendidas] = useState([]);
  const [citasAtendidasFiltradas, setCitasAtendidasFiltradas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  // Estados para filtros de citas
  const [filtrosCitas, setFiltrosCitas] = useState({
    fechaInicio: '',
    fechaFin: '',
    documentoPaciente: '',
    medico: '',
    procedimiento: ''
  });

  // Estados para filtros de citas (UI)
  const [showFiltrosFecha, setShowFiltrosFecha] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroDocumentoPaciente, setFiltroDocumentoPaciente] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroProcedimiento, setFiltroProcedimiento] = useState('');

  // Estados para selección de citas
  const [citasSeleccionadas, setCitasSeleccionadas] = useState(new Set());

  // Estados para facturas
  const [facturas, setFacturas] = useState([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);

  // Estados para filtros de facturas
  const [showFiltrosFactura, setShowFiltrosFactura] = useState(false);
  const [filtroNumeroFactura, setFiltroNumeroFactura] = useState('');
  const [filtroFechaFacturaInicio, setFiltroFechaFacturaInicio] = useState('');
  const [filtroFechaFacturaFin, setFiltroFechaFacturaFin] = useState('');

  // Estados para creación de facturas
  const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
  const [datosFactura, setDatosFactura] = useState({
    notas: ''
  });

  // Estados para modales de facturas
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [facturaPreview, setFacturaPreview] = useState(null);
  const [isVerFacturaModalOpen, setIsVerFacturaModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  // Estados para códigos CUPS
  const [codigosCups, setCodigosCups] = useState([]);
  const [loadingCups, setLoadingCups] = useState(false);
  const [terminoBusquedaCups, setTerminoBusquedaCups] = useState('');
  const [paginaCups, setPaginaCups] = useState(0);

  // Cargar citas atendidas
  const cargarCitasAtendidas = useCallback(async () => {
    try {
      setLoadingCitas(true);
      const { dependencyContainer } = await import('../../infrastructure/di/DependencyContainer.js');
      const obtenerCitasAtendidas = dependencyContainer.getUseCase('obtenerCitasAtendidasUseCase');
      const citas = await obtenerCitasAtendidas.execute(filtrosCitas);
      setCitasAtendidas(citas);
      setCitasAtendidasFiltradas(citas);
    } catch (error) {
      console.error('Error cargando citas atendidas:', error);
      // Aquí se podría mostrar un toast de error
    } finally {
      setLoadingCitas(false);
    }
  }, [filtrosCitas]);

  // Cargar facturas
  const cargarFacturas = useCallback(async (limite = 10) => {
    try {
      setLoadingFacturas(true);
      const { dependencyContainer } = await import('../../infrastructure/di/DependencyContainer.js');
      const obtenerFacturas = dependencyContainer.getUseCase('obtenerFacturasUseCase');
      const facturasData = await obtenerFacturas.execute({ limite });
      setFacturas(facturasData);
    } catch (error) {
      console.error('Error cargando facturas:', error);
      // Aquí se podría mostrar un toast de error
    } finally {
      setLoadingFacturas(false);
    }
  }, []);

  // Aplicar filtros a citas
  const aplicarFiltrosCitas = useCallback(() => {
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

    // Filtro por médico
    if (filtroMedico.trim()) {
      citasFiltradas = citasFiltradas.filter(cita =>
        cita.nombreMedico &&
        cita.nombreMedico.toLowerCase().includes(filtroMedico.toLowerCase())
      );
    }

    // Filtro por procedimiento
    if (filtroProcedimiento.trim()) {
      citasFiltradas = citasFiltradas.filter(cita => {
        const matchesNombre = cita.nombreProcedimiento &&
          cita.nombreProcedimiento.toLowerCase().includes(filtroProcedimiento.toLowerCase());
        const matchesCodigo = cita.codigoCups &&
          cita.codigoCups.toLowerCase().includes(filtroProcedimiento.toLowerCase());
        return matchesNombre || matchesCodigo;
      });
    }

    setCitasAtendidasFiltradas(citasFiltradas);
  }, [citasAtendidas, fechaInicio, fechaFin, filtroDocumentoPaciente, filtroMedico, filtroProcedimiento]);

  // Limpiar filtros
  const limpiarFiltrosCitas = useCallback(() => {
    setFiltrosCitas({
      fechaInicio: '',
      fechaFin: '',
      documentoPaciente: '',
      medico: '',
      procedimiento: ''
    });
  }, []);

  // Limpiar filtros de facturas
  const limpiarFiltrosFactura = useCallback(() => {
    setFiltroNumeroFactura('');
    setFiltroFechaFacturaInicio('');
    setFiltroFechaFacturaFin('');
  }, []);

  // Aplicar filtros a facturas
  const aplicarFiltrosFactura = useCallback(async () => {
    try {
      setLoadingFacturas(true);
      const { dependencyContainer } = await import('../../infrastructure/di/DependencyContainer.js');
      const obtenerFacturas = dependencyContainer.getUseCase('obtenerFacturasUseCase');

      const filtros = {
        limite: 1000, // Obtener todas para filtrar en frontend
        ...(filtroNumeroFactura && { numeroFactura: filtroNumeroFactura }),
        ...(filtroFechaFacturaInicio && { fechaInicio: filtroFechaFacturaInicio }),
        ...(filtroFechaFacturaFin && { fechaFin: filtroFechaFacturaFin })
      };

      const facturasData = await obtenerFacturas.execute(filtros);
      setFacturas(facturasData);
    } catch (error) {
      console.error('Error aplicando filtros a facturas:', error);
    } finally {
      setLoadingFacturas(false);
    }
  }, [filtroNumeroFactura, filtroFechaFacturaInicio, filtroFechaFacturaFin]);

  // Seleccionar/deseleccionar cita
  const toggleSeleccionCita = useCallback((citaId) => {
    const nuevasSeleccionadas = new Set(citasSeleccionadas);
    if (nuevasSeleccionadas.has(citaId)) {
      nuevasSeleccionadas.delete(citaId);
    } else {
      nuevasSeleccionadas.add(citaId);
    }
    setCitasSeleccionadas(nuevasSeleccionadas);
  }, [citasSeleccionadas]);

  // Seleccionar todas las citas visibles
  const seleccionarTodasCitas = useCallback(() => {
    const todasIds = new Set(citasAtendidasFiltradas.map(cita => cita.id));
    setCitasSeleccionadas(todasIds);
  }, [citasAtendidasFiltradas]);

  // Deseleccionar todas las citas
  const deseleccionarTodasCitas = useCallback(() => {
    setCitasSeleccionadas(new Set());
  }, []);

  // Crear factura (previsualización)
  const crearFactura = useCallback(async () => {
    try {
      const citasIds = Array.from(citasSeleccionadas);
      const { dependencyContainer } = await import('../../infrastructure/di/DependencyContainer.js');
      const crearFacturaUseCase = dependencyContainer.getUseCase('crearFacturaUseCase');

      // Crear datos de previsualización sin guardar
      const citasDetalladas = [];
      for (const citaId of citasIds) {
        const cita = citasAtendidasFiltradas.find(c => c.id === citaId);
        if (cita) {
          citasDetalladas.push({
            id: cita.id,
            paciente: { nombre: cita.nombrePaciente, documento: cita.documentoPaciente },
            medico: { nombre: cita.nombreMedico },
            procedimiento: cita.nombreProcedimiento,
            codigoCups: cita.codigoCups,
            fechaAtencion: cita.fechaAtencion,
            valor: cita.valorCita
          });
        }
      }

      const total = citasDetalladas.reduce((sum, cita) => sum + (cita.valor || 0), 0);
      const numeroFactura = `FM-${Date.now().toString().slice(-6)}`;

      const facturaPreview = {
        numeroFactura,
        fechaEmision: new Date().toISOString(),
        citas: citasDetalladas,
        total,
        estado: 'PENDIENTE'
      };

      setFacturaPreview(facturaPreview);
      setIsFacturaModalOpen(true);

      return facturaPreview;
    } catch (error) {
      console.error('Error creando previsualización de factura:', error);
      throw error;
    }
  }, [citasSeleccionadas, citasAtendidasFiltradas]);

  // Cargar códigos CUPS
  const cargarCodigosCups = useCallback(async (pagina = 0, busqueda = '') => {
    try {
      setLoadingCups(true);
      const params = {
        page: pagina,
        size: 20,
        ...(busqueda && { termino: busqueda })
      };

      // TODO: Implementar caso de uso específico para CUPS
      // Por ahora, usar el servicio directamente
      const { codigosCupsApiService } = await import('../../services/pacientesApiService.js');
      const response = await codigosCupsApiService.getCodigosCups(params);
      // Nota: Este método debería estar en un caso de uso específico para CUPS
      // Por ahora, usar el repositorio directamente
      setCodigosCups(response?.content || []);
    } catch (error) {
      console.error('Error cargando códigos CUPS:', error);
    } finally {
      setLoadingCups(false);
    }
  }, []);

  // Funciones para manejar modales de facturas
  const handleVerFactura = useCallback((factura) => {
    // Parsear el jsonData correctamente - puede estar doblemente anidado
    let facturaData = {};
    try {
      const parsed = JSON.parse(factura.jsonData || '{}');
      // Verificar si está doblemente anidado (jsonData dentro de jsonData)
      if (parsed.jsonData) {
        facturaData = JSON.parse(parsed.jsonData);
      } else {
        facturaData = parsed;
      }
    } catch (error) {
      console.error('Error parseando datos de factura:', error);
      facturaData = {};
    }

    // Calcular el total desde las citas si no está definido
    let totalFactura = facturaData.total || 0;
    if (totalFactura === 0 && facturaData.citas && Array.isArray(facturaData.citas)) {
      totalFactura = facturaData.citas.reduce((sum, cita) => sum + (cita.valor || 0), 0);
    }

    setFacturaSeleccionada({
      id: factura.id,
      numeroFactura: facturaData.numeroFactura || `FM-${factura.id}`,
      fechaEmision: facturaData.fechaEmision || null,
      fechaCreacion: factura.fechaCreacion || null,
      fechaActualizacion: factura.fechaActualizacion || null,
      estado: facturaData.estado || 'PENDIENTE',
      total: totalFactura,
      citas: facturaData.citas || []
    });
    setIsVerFacturaModalOpen(true);
  }, []);

  const handleProcesarFactura = useCallback(async (factura) => {
    try {
      // Parsear el jsonData correctamente - puede estar doblemente anidado
      let facturaData = {};
      try {
        const parsed = JSON.parse(factura.jsonData || '{}');
        // Verificar si está doblemente anidado (jsonData dentro de jsonData)
        if (parsed.jsonData) {
          facturaData = JSON.parse(parsed.jsonData);
        } else {
          facturaData = parsed;
        }
      } catch (error) {
        console.error('Error parseando datos de factura para procesar:', error);
        facturaData = {};
      }

      // Calcular el total desde las citas si no está definido
      let totalFactura = facturaData.total || 0;
      if (totalFactura === 0 && facturaData.citas && Array.isArray(facturaData.citas)) {
        totalFactura = facturaData.citas.reduce((sum, cita) => sum + (cita.valor || 0), 0);
      }

      // Mostrar confirmación antes de procesar
      const { default: Swal } = await import('sweetalert2');
      const result = await Swal.fire({
        title: '¿Procesar Factura?',
        text: `¿Está seguro de marcar la factura ${facturaData.numeroFactura || `FM-${factura.id}`} como PAGADA?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, procesar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        // Actualizar el estado de la factura a PAGADA y asegurar que el total esté correcto
        facturaData.estado = 'PAGADA';
        facturaData.total = totalFactura; // Asegurar que el total esté guardado correctamente

        // Preparar el jsonData correctamente (doble anidamiento)
        const jsonDataToSave = JSON.stringify({
          jsonData: JSON.stringify(facturaData)
        });

        // Usar el repositorio para actualizar la factura en el backend
        const { dependencyContainer } = await import('../../infrastructure/di/DependencyContainer.js');
        const facturaRepository = dependencyContainer.getRepository('facturaRepository');

        // Actualizar la factura en el backend
        await facturaRepository.updateFactura(factura.id, {
          jsonData: jsonDataToSave
        });

        // Recargar facturas para reflejar los cambios
        await cargarFacturas();

        // Mostrar mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Factura Procesada!',
          text: `La factura ${facturaData.numeroFactura || `FM-${factura.id}`} ha sido marcada como PAGADA.`,
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error procesando factura:', error);

      // Mostrar mensaje de error
      const { default: Swal } = await import('sweetalert2');
      await Swal.fire({
        icon: 'error',
        title: 'Error al Procesar Factura',
        text: 'No se pudo procesar la factura. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  }, [cargarFacturas]);

  const generarFacturaPDFFactura = useCallback(async (factura) => {
    try {
      // Parsear el jsonData correctamente - puede estar doblemente anidado
      let facturaData = {};
      try {
        const parsed = JSON.parse(factura.jsonData || '{}');
        // Verificar si está doblemente anidado (jsonData dentro de jsonData)
        if (parsed.jsonData) {
          facturaData = JSON.parse(parsed.jsonData);
        } else {
          facturaData = parsed;
        }
      } catch (error) {
        console.error('Error parseando datos de factura para PDF:', error);
        facturaData = {};
      }

      // Calcular el total desde las citas si no está definido
      let totalFactura = facturaData.total || 0;
      if (totalFactura === 0 && facturaData.citas && Array.isArray(facturaData.citas)) {
        totalFactura = facturaData.citas.reduce((sum, cita) => sum + (cita.valor || 0), 0);
        facturaData.total = totalFactura; // Actualizar el total en los datos
      }

      // Usar el componente FacturaPDFGenerator
      const { default: FacturaPDFGenerator } = await import('../components/facturacion/FacturaPDFGenerator.jsx');

      // Crear instancia del generador y generar PDF
      const generator = new FacturaPDFGenerator();
      await generator.generatePDF(facturaData);
    } catch (error) {
      console.error('Error generando PDF de factura:', error);
    }
  }, []);

  const exportarExcel = useCallback(async () => {
    try {
      // Crear datos para Excel
      const datosExcel = citasAtendidasFiltradas.map(cita => ({
        'Fecha Atención': formatDate(cita.fechaAtencion),
        'Paciente': cita.nombrePaciente,
        'Documento': cita.documentoPaciente,
        'Médico': cita.nombreMedico,
        'Procedimiento': cita.nombreProcedimiento,
        'Código CUPS': cita.codigoCups,
        'Valor': cita.valorCita
      }));

      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Citas Atendidas');

      // Descargar archivo
      XLSX.writeFile(wb, `citas_atendidas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exportando Excel:', error);
    }
  }, [citasAtendidasFiltradas]);

  const guardarFactura = useCallback(async () => {
    try {
      if (!facturaPreview) return;

      // Crear la factura usando el caso de uso
      const citasIds = Array.from(citasSeleccionadas);
      const { dependencyContainer } = await import('../../infrastructure/di/DependencyContainer.js');
      const crearFacturaUseCase = dependencyContainer.getUseCase('crearFacturaUseCase');
      const facturaCreada = await crearFacturaUseCase.execute(datosFactura, citasIds);

      // Recargar facturas y citas
      await cargarFacturas();
      await cargarCitasAtendidas();

      // Limpiar selección y cerrar modal
      setCitasSeleccionadas(new Set());
      setMostrarModalFactura(false);
      setDatosFactura({ notas: '' });
      setIsFacturaModalOpen(false);
      setFacturaPreview(null);

      // Mostrar mensaje de éxito
      const { default: Swal } = await import('sweetalert2');
      await Swal.fire({
        icon: 'success',
        title: '¡Factura Creada!',
        text: `La factura ${facturaPreview.numeroFactura} ha sido creada exitosamente.`,
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      return facturaCreada;
    } catch (error) {
      console.error('Error guardando factura:', error);

      // Mostrar mensaje de error
      const { default: Swal } = await import('sweetalert2');
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Factura',
        text: 'No se pudo crear la factura. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });

      throw error;
    }
  }, [facturaPreview, citasSeleccionadas, datosFactura, cargarFacturas, cargarCitasAtendidas]);

  const handleCloseFacturaModal = useCallback(() => {
    setIsFacturaModalOpen(false);
    setFacturaPreview(null);
  }, []);

  const handleCloseVerFacturaModal = useCallback(() => {
    setIsVerFacturaModalOpen(false);
    setFacturaSeleccionada(null);
  }, []);

  // Funciones auxiliares
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      let date;

      // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateString) && dateString.length >= 6) {
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3], dateString[4], dateString[5]);
      } else if (typeof dateString === 'string') {
        if (dateString.includes('T')) {
          date = new Date(dateString);
        } else if (dateString.includes('-') && dateString.length === 10) {
          date = new Date(dateString + 'T00:00:00');
        } else {
          date = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error en fecha';
    }
  };


  // Efectos
  useEffect(() => {
    cargarCitasAtendidas();
  }, [cargarCitasAtendidas]);

  useEffect(() => {
    aplicarFiltrosCitas();
  }, [aplicarFiltrosCitas]);

  useEffect(() => {
    cargarFacturas();
  }, [cargarFacturas]);

  // Efecto para aplicar filtros de facturas automáticamente
  useEffect(() => {
    aplicarFiltrosFactura();
  }, [filtroNumeroFactura, filtroFechaFacturaInicio, filtroFechaFacturaFin, aplicarFiltrosFactura]);

  // Efecto para aplicar filtros de citas automáticamente
  useEffect(() => {
    aplicarFiltrosCitas();
  }, [fechaInicio, fechaFin, filtroDocumentoPaciente, filtroMedico, filtroProcedimiento, aplicarFiltrosCitas]);

  // Calcular total facturado
  const totalFacturado = citasAtendidasFiltradas.reduce((total, cita) => total + (cita.valorCita || 0), 0);

  // Verificar si hay citas seleccionadas
  const hayCitasSeleccionadas = citasSeleccionadas.size > 0;

  // Obtener citas seleccionadas para previsualización
  const citasSeleccionadasData = citasAtendidasFiltradas.filter(cita =>
    citasSeleccionadas.has(cita.id)
  );

  return {
    // Estados
    citasAtendidas,
    citasAtendidasFiltradas,
    loadingCitas,
    filtrosCitas,
    citasSeleccionadas,
    facturas,
    loadingFacturas,
    mostrarModalFactura,
    datosFactura,
    codigosCups,
    loadingCups,
    terminoBusquedaCups,
    paginaCups,
    totalFacturado,
    hayCitasSeleccionadas,
    citasSeleccionadasData,

    // Estados de filtros de citas (UI)
    showFiltrosFecha,
    fechaInicio,
    fechaFin,
    filtroDocumentoPaciente,
    filtroMedico,
    filtroProcedimiento,

    // Estados de filtros de facturas
    showFiltrosFactura,
    filtroNumeroFactura,
    filtroFechaFacturaInicio,
    filtroFechaFacturaFin,

    // Estados de modales de facturas
    isFacturaModalOpen,
    facturaPreview,
    isVerFacturaModalOpen,
    facturaSeleccionada,

    // Acciones
    setFiltrosCitas,
    setMostrarModalFactura,
    setDatosFactura,
    setTerminoBusquedaCups,
    setPaginaCups,

    // Acciones de filtros de citas (UI)
    setShowFiltrosFecha,
    setFechaInicio,
    setFechaFin,
    setFiltroDocumentoPaciente,
    setFiltroMedico,
    setFiltroProcedimiento,

    // Acciones de filtros de facturas
    setShowFiltrosFactura,
    setFiltroNumeroFactura,
    setFiltroFechaFacturaInicio,
    setFiltroFechaFacturaFin,

    // Funciones
    cargarCitasAtendidas,
    aplicarFiltrosCitas,
    limpiarFiltrosCitas,
    toggleSeleccionCita,
    seleccionarTodasCitas,
    deseleccionarTodasCitas,
    crearFactura,
    cargarFacturas,
    cargarCodigosCups,

    // Funciones de facturas
    handleVerFactura,
    handleProcesarFactura,
    generarFacturaPDFFactura,
    exportarExcel,
    guardarFactura,
    handleCloseFacturaModal,
    handleCloseVerFacturaModal,
    aplicarFiltrosFactura,
    limpiarFiltrosFactura
  };
};