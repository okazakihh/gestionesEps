import React, { useState, useEffect } from 'react';
import { Container, Paper, Stack, Title, Text, Button, Group, Tabs, Divider, Modal } from '@mantine/core';
import {
  IconFileInvoice, 
  IconFilter, 
  IconFileDownload, 
  IconPlus,
  IconFileText,
  IconCode,
  IconBuildingBank,
  IconReportMoney,
  IconFileDescription,
  IconUsers
} from '@tabler/icons-react';
import Swal from 'sweetalert2';

// Layout
import { MainLayout } from '../../components/ui/MainLayout.jsx';

// Hooks personalizados
import { useFacturacionManagement } from '../../../negocio/hooks/facturacion/useFacturacionManagement';
import { useCodigosCupsManagement } from '../../../negocio/hooks/facturacion/useCodigosCupsManagement';
import { useFacturaFilters } from '../../../negocio/hooks/facturacion/useFacturaFilters';
import { useIpsConfig } from '../../../negocio/hooks/configuracion/useIpsConfig';
import { useSiigoIntegration } from '../../../negocio/hooks/facturacion/useSiigoIntegration';
import { useClientesFacturacion } from '../../../negocio/hooks/facturacion/useClientesFacturacion';

// Servicios
import { 
  exportarExcel, 
  generarFacturaPDFFactura,
  generarFacturaPreview
  // enviarFacturaExistenteADian, // Deprecado - Solo Siigo
  // consultarEstadoFacturaDian // Deprecado - Solo Siigo
} from '../../../negocio/services/facturacionService';
import {
  agruparCitasPorCliente,
  agruparCitasPorEntidad,
  agruparCitasPorPeriodo,
  formatearGrupoParaFactura
} from '../../../negocio/services/batchFacturacionService';

// Componentes - Direct imports para evitar cache de barrel exports
import CitasTable from '../../components/facturacion/CitasTable';
import FacturasTable from '../../components/facturacion/FacturasTable';
import CodigosCupsTable from '../../components/facturacion/CodigosCupsTable';
import CitasFilters from '../../components/facturacion/CitasFilters';
import FacturasFilters from '../../components/facturacion/FacturasFilters';
import CodigosCupsSearch from '../../components/facturacion/CodigosCupsSearch';
import ValorCupsModal from '../../components/facturacion/ValorCupsModal';
import FacturaPreviewModal from '../../components/facturacion/FacturaPreviewModal';
import VerFacturaModal from '../../components/facturacion/VerFacturaModal';
import XMLViewerModal from '../../components/facturacion/XMLViewerModal';
import VistaGruposFacturacionModal from '../../components/facturacion/VistaGruposFacturacionModal';
import CrearFacturaElectronicaModal from '../../components/facturacion/CrearFacturaElectronicaModal';
import CrearNotaContableModal from '../../components/facturacion/CrearNotaContableModal';
import NotasContablesTable from '../../components/facturacion/NotasContablesTable';
import VerDetalleNotaModal from '../../components/facturacion/VerDetalleNotaModal';
import ClienteFacturacionForm from '../../components/facturacion/ClienteFacturacionForm';
import ClientesFacturacionTable from '../../components/facturacion/ClientesFacturacionTable';
import ClienteFacturacionDetalle from '../../components/facturacion/ClienteFacturacionDetalle';
import ModoFacturacionSelector from '../../components/facturacion/ModoFacturacionSelector';
import { FacturaPrintPreviewModal } from '../../components/facturacion/FacturaPrintPreviewModal';
import { useFacturaPreviewModal } from '../../../negocio/hooks/useFacturaPreviewModal';
import { generarFacturaHTML } from '../../components/facturacion/FacturaHTML';

// Componentes de Contabilidad Siigo
import {
  ContabilidadSiigoTab,
  ReportesSiigoTab
} from '../../components/contabilidad';

// Service Worker
import { useServiceWorker } from '../../../serviceWorker.js';
import { facturacionApiService } from '../../../data/services/pacientesApiService.js';
import { notasContabilidadService } from '../../../negocio/services/contabilidadService.js';

/**
 * FacturacionPage.jsx - REFACTORIZADO
 * 
 * Página principal de facturación médica con arquitectura en capas:
 * - Presentación: Componentes UI reutilizables (tablas, filtros, modales)
 * - Negocio: Hooks personalizados y servicios
 * - Datos: API services
 * 
 * Reducido de 2454 líneas a ~550 líneas mediante composición de componentes
 * 
 * Funcionalidades:
 * - Gestión de citas atendidas con selección múltiple
 * - Creación y gestión de facturas
 * - Filtros avanzados (fechas, paciente, médico, procedimiento)
 * - Exportación a Excel
 * - Generación de PDF para facturas
 * - Gestión de códigos CUPS con paginación
 * - Edición de valores de códigos CUPS
 * - Cache optimizado para rendimiento
 */

const FacturacionPage = () => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  // Service Worker para modo offline
  const { isRegistered, isOnline } = useServiceWorker();

  // Hook de gestión de facturación (citas, facturas, selección, cache)
  const {
    citasAtendidas,
    facturas,
    selectedCitas,
    loadingCitas,
    loadingFacturas,
    handleSelectCita,
    handleSelectAllCitas,
    crearFactura: crearFacturaBase,
    loadFacturas,
    loadCitasAtendidas
  } = useFacturacionManagement();

  // Hook de gestión de códigos CUPS
  const {
    codigosCups,
    loading: loadingCups,
    searchTerm,
    updateSearchTerm: setSearchTerm,
    currentPage,
    totalPages,
    totalCodigosCups,
    filteredCount,
    handlePageChange,
    isValorModalOpen,
    selectedCodigoCups,
    handleOpenValorModal,
    handleCloseValorModal,
    handleSaveValor
  } = useCodigosCupsManagement();

  // Hook de configuración de IPS
  const { ipsConfig: ipsData } = useIpsConfig();

  // Hook de integración con Siigo
  const {
    isConnected: siigoConnected,
    isLoading: siigoLoading,
    createInvoice: createSiigoInvoice,
    getInvoiceStatus: getSiigoInvoiceStatus,
    downloadInvoicePDF: downloadSiigoPDF,
    sendInvoiceByEmail: sendSiigoEmail
  } = useSiigoIntegration();

  // Hook de gestión de clientes
  const {
    clientes,
    loading: loadingClientes,
    searchTerm: clienteSearchTerm,
    selectedCliente,
    cargarClientes,
    crearCliente,
    actualizarCliente,
    desactivarCliente,
    reactivarCliente,
    buscarClientes,
    seleccionarCliente,
    limpiarSeleccion
  } = useClientesFacturacion();

  // Hook de filtros (citas y facturas)
  const {
    // Estados de filtros de citas
    fechaInicio,
    fechaFin,
    filtroDocumentoPaciente,
    filtroCodigoCups,
    filtroMedico,
    filtroProcedimiento,
    setFechaInicio,
    setFechaFin,
    setFiltroDocumentoPaciente,
    setFiltroCodigoCups,
    setFiltroMedico,
    setFiltroProcedimiento,
    // Estados de filtros de facturas
    filtroNumeroFactura,
    filtroFechaFacturaInicio,
    filtroFechaFacturaFin,
    setFiltroNumeroFactura,
    setFiltroFechaFacturaInicio,
    setFiltroFechaFacturaFin,
    // UI states
    showFiltrosFecha,
    showFiltrosFactura,
    toggleFiltrosCitas: toggleFiltrosFecha,
    toggleFiltrosFacturas: toggleFiltrosFactura,
    // Funciones de filtrado
    aplicarFiltrosCitas,
    aplicarFiltrosFacturas,
    limpiarFiltrosCitas,
    limpiarFiltrosFacturas
  } = useFacturaFilters();

  // ============================================================================
  // ESTADOS LOCALES
  // ============================================================================
  
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [facturaPreview, setFacturaPreview] = useState(null);
  const [isVerFacturaModalOpen, setIsVerFacturaModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  // const [isDianPreviewModalOpen, setIsDianPreviewModalOpen] = useState(false); // Deprecado
  // const [facturaParaDian, setFacturaParaDian] = useState(null); // Deprecado
  const [loadingSiigoAction, setLoadingSiigoAction] = useState(false);
  
  // Estados de notas contables
  const [isNotaContableModalOpen, setIsNotaContableModalOpen] = useState(false);
  const [facturaParaNota, setFacturaParaNota] = useState(null);
  const [notasContables, setNotasContables] = useState([]);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [isVerDetalleNotaModalOpen, setIsVerDetalleNotaModalOpen] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);

  // Estados de clientes
  const [clienteFormOpen, setClienteFormOpen] = useState(false);
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);
  const [clienteDetalleOpen, setClienteDetalleOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  
  // Estados de batch facturación
  const [isModoSelectorOpen, setIsModoSelectorOpen] = useState(false);
  const [isVistaGruposOpen, setIsVistaGruposOpen] = useState(false);
  const [modoFacturacion, setModoFacturacion] = useState('individual');
  const [criterioAgrupacion, setCriterioAgrupacion] = useState('cliente');
  const [gruposFacturacion, setGruposFacturacion] = useState({});
  const [grupoActual, setGrupoActual] = useState(null);
  const [colaGrupos, setColaGrupos] = useState([]);
  
  // Hook para modal de preview de impresión
  const { previewOpen, previewHTML, previewTitle, openPreview, closePreview, handlePrint } = useFacturaPreviewModal();

  // ============================================================================
  // EFECTOS
  // ============================================================================

  /**
   * Cargar notas contables al montar el componente
   */
  useEffect(() => {
    cargarNotasContables();
  }, []);

  /**
   * Cargar notas contables desde backend
   */
  const cargarNotasContables = async () => {
    try {
      setLoadingNotas(true);
      const notas = await notasContabilidadService.obtenerTodasLasNotas();
      setNotasContables(notas);
    } catch (error) {
      console.error('Error cargando notas contables:', error);
    } finally {
      setLoadingNotas(false);
    }
  };

  // ============================================================================
  // FUNCIONES DE MANEJO DE CLIENTES
  // ============================================================================

  /**
   * Abrir formulario para nuevo cliente
   */
  const handleNuevoCliente = () => {
    setClienteEnEdicion(null);
    limpiarSeleccion();
    setClienteFormOpen(true);
  };

  /**
   * Abrir formulario para editar cliente
   */
  const handleEditarCliente = (cliente) => {
    setClienteEnEdicion(cliente);
    seleccionarCliente(cliente);
    setClienteFormOpen(true);
  };

  /**
   * Guardar cliente (crear o actualizar)
   */
  const handleGuardarCliente = async (datosCliente) => {
    try {
      if (clienteEnEdicion) {
        await actualizarCliente(clienteEnEdicion.id, datosCliente);
      } else {
        await crearCliente(datosCliente);
      }
      setClienteFormOpen(false);
      setClienteEnEdicion(null);
      limpiarSeleccion();
    } catch (error) {
      console.error('Error guardando cliente:', error);
      // El error ya se muestra en el hook
    }
  };

  /**
   * Cerrar formulario de cliente
   */
  const handleCerrarFormCliente = () => {
    setClienteFormOpen(false);
    setClienteEnEdicion(null);
    limpiarSeleccion();
  };

  /**
   * Abrir modal de detalle de cliente
   */
  const handleVerDetalleCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setClienteDetalleOpen(true);
  };

  /**
   * Cerrar modal de detalle de cliente
   */
  const handleCerrarDetalleCliente = () => {
    setClienteDetalleOpen(false);
    setClienteSeleccionado(null);
  };

  // ============================================================================
  // DATOS FILTRADOS
  // ============================================================================
  
  const citasAtendidasFiltradas = aplicarFiltrosCitas(citasAtendidas);
  const facturasFiltradas = aplicarFiltrosFacturas(facturas);

  // ============================================================================
  // FUNCIONES DE MANEJO DE FACTURACI�"N
  // ============================================================================

  /**
   * Crear factura: abre el selector de modo (individual o batch)
   */
  const handleCrearFactura = async () => {
    if (selectedCitas.size === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selección requerida',
        text: 'Debe seleccionar al menos una cita para crear la factura',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    try {
      const citasSeleccionadas = citasAtendidasFiltradas.filter(cita => selectedCitas.has(cita.id));
      setFacturaPreview(citasSeleccionadas);
      
      // Si solo hay 1 cita, ir directo a facturación individual
      if (citasSeleccionadas.length === 1) {
        setModoFacturacion('individual');
        setIsFacturaModalOpen(true);
      } else {
        // Abrir selector de modo para múltiples citas
        setIsModoSelectorOpen(true);
      }
    } catch (error) {
      console.error('Error abriendo formulario de factura:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo abrir el formulario de factura. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Manejar selección de modo de facturación
   */
  const handleSeleccionarModo = async (modo, criterio) => {
    setModoFacturacion(modo);
    setCriterioAgrupacion(criterio);
    setIsModoSelectorOpen(false);

    if (modo === 'individual') {
      // Facturación individual - abrir modal directamente
      setIsFacturaModalOpen(true);
    } else {
      // Facturación batch - agrupar y mostrar vista de grupos
      const citasSeleccionadas = facturaPreview || [];
      let grupos = {};

      switch (criterio) {
        case 'cliente':
          grupos = agruparCitasPorCliente(citasSeleccionadas);
          break;
        case 'entidad':
          grupos = agruparCitasPorEntidad(citasSeleccionadas);
          break;
        case 'periodo':
          grupos = agruparCitasPorPeriodo(citasSeleccionadas, 'mes');
          break;
        default:
          grupos = agruparCitasPorCliente(citasSeleccionadas);
      }

      setGruposFacturacion(grupos);
      setIsVistaGruposOpen(true);
    }
  };

  /**
   * Facturar grupos seleccionados
   */
  const handleFacturarGrupos = async (gruposSeleccionados, tipoAgrupacion) => {
    try {
      setIsVistaGruposOpen(false);
      
      // Preparar cola de grupos para facturar
      setColaGrupos(gruposSeleccionados);
      
      // Comenzar con el primer grupo
      if (gruposSeleccionados.length > 0) {
        const primerGrupo = gruposSeleccionados[0];
        const grupoFormateado = formatearGrupoParaFactura(primerGrupo, tipoAgrupacion);
        setGrupoActual({ ...grupoFormateado, index: 0, total: gruposSeleccionados.length });
        setFacturaPreview(primerGrupo.citas);
        setIsFacturaModalOpen(true);
      }
    } catch (error) {
      console.error('Error preparando grupos para facturación:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron preparar los grupos para facturación',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Continuar con el siguiente grupo
   */
  const handleSiguienteGrupo = async () => {
    if (colaGrupos.length > 0 && grupoActual && grupoActual.index < grupoActual.total - 1) {
      const siguienteIndex = grupoActual.index + 1;
      const siguienteGrupo = colaGrupos[siguienteIndex];
      const grupoFormateado = formatearGrupoParaFactura(siguienteGrupo, criterioAgrupacion);
      setGrupoActual({ ...grupoFormateado, index: siguienteIndex, total: grupoActual.total });
      setFacturaPreview(siguienteGrupo.citas);
      setIsFacturaModalOpen(true);
    } else {
      // Terminamos de facturar todos los grupos
      await Swal.fire({
        icon: 'success',
        title: '¡Facturación Completada!',
        text: `Se han creado ${grupoActual?.total || 0} facturas exitosamente`,
        confirmButtonColor: '#10B981',
        timer: 3000
      });
      
      // Limpiar estados
      setColaGrupos([]);
      setGrupoActual(null);
      setGruposFacturacion({});
      setFacturaPreview(null);
      setModoFacturacion('individual');
    }
  };

  /**
   * Guardar factura: envía al backend y actualiza listas
   * @param {Object} facturaCompleta - Factura con datos completos del cliente y DIAN
   */
  const handleGuardarFactura = async (facturaCompleta) => {
    try {
      // Usar facturaCompleta si se proporciona, sino usar facturaPreview
      const datosFactura = facturaCompleta || facturaPreview;
      
      const jsonDataCrudo = JSON.stringify(datosFactura);
      const response = await facturacionApiService.createFacturacion(jsonDataCrudo);

      if (response && (response.success || response.id)) {
        // Si estamos en modo batch y hay más grupos, continuar con el siguiente
        if (modoFacturacion === 'batch' && grupoActual && grupoActual.index < grupoActual.total - 1) {
          await Swal.fire({
            icon: 'success',
            title: '¡Factura Creada!',
            text: `Factura ${grupoActual.index + 1} de ${grupoActual.total} creada. Continuando con el siguiente grupo...`,
            confirmButtonColor: '#10B981',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });

          // Recargar datos
          const facturasActualizadas = await loadFacturas();
          await loadCitasAtendidas(facturasActualizadas);

          // Continuar con el siguiente grupo
          await handleSiguienteGrupo();
        } else {
          // Facturación individual o último grupo del batch
          const mensajeExito = modoFacturacion === 'batch' 
            ? `¡Facturación masiva completada! Se crearon ${grupoActual?.total || 1} facturas exitosamente.`
            : `La factura ${datosFactura.numeroFactura} ha sido creada exitosamente.`;

          await Swal.fire({
            icon: 'success',
            title: '¡Factura Creada!',
            text: mensajeExito,
            confirmButtonColor: '#10B981',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });

          // Limpiar selección y estados
          selectedCitas.clear();
          setIsFacturaModalOpen(false);
          setFacturaPreview(null);
          
          // Limpiar estados de batch si aplica
          if (modoFacturacion === 'batch') {
            setColaGrupos([]);
            setGrupoActual(null);
            setGruposFacturacion({});
            setModoFacturacion('individual');
          }
          
          // Recargar facturas primero y luego citas
          const facturasActualizadas = await loadFacturas();
          await loadCitasAtendidas(facturasActualizadas);
        }
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error guardando factura:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: 'No se pudo guardar la factura. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Ver detalles de una factura existente
   */
  const handleVerFactura = (factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      setFacturaSeleccionada({
        ...factura,
        ...facturaData
      });
      setIsVerFacturaModalOpen(true);
    } catch (error) {
      console.error('Error parsing factura data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información de la factura',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Generar PDF con vista previa para impresión
   */
  const handleGenerarPDFConPreview = (factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;
      
      // Preparar información de la empresa desde la configuración real
      const empresaInfo = ipsData ? {
        nombre: ipsData.nombre || 'IPS',
        nit: ipsData.nit || 'N/A',
        direccion: `${ipsData.direccion || ''}, ${ipsData.ciudad || ''}`,
        telefono: ipsData.telefono || '',
        email: ipsData.email || '',
        datosBancarios: ipsData.datosBancarios || {}
      } : null;
      
      // Generar HTML de la factura con configuración real (si está disponible, sino usa default)
      const htmlContent = generarFacturaHTML(factura, facturaData, empresaInfo);
      
      // Abrir modal de preview con botón de imprimir
      openPreview(htmlContent, `Vista Previa - Factura ${numeroFactura}`);
    } catch (error) {
      console.error('Error generando preview de factura:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar la vista previa de la factura',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Procesar factura: cambiar estado a PAGADA
   */
  const handleProcesarFactura = async (factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;

      const result = await Swal.fire({
        title: '¿Procesar Factura?',
        text: `¿Estás seguro de marcar la factura ${numeroFactura} como PAGADA?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, procesar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        facturaData.estado = 'PAGADA';
        const response = await facturacionApiService.updateFacturacion(
          factura.id, 
          JSON.stringify(facturaData)
        );

        if (response && (response.success || response.id)) {
          await Swal.fire({
            icon: 'success',
            title: '¡Factura Procesada!',
            text: 'La factura ha sido marcada como PAGADA.',
            confirmButtonColor: '#10B981',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });

          // Cerrar modal si está abierto y recargar
          setIsVerFacturaModalOpen(false);
          setFacturaSeleccionada(null);
          loadFacturas();
        } else {
          throw new Error('Error al actualizar la factura');
        }
      }
    } catch (error) {
      console.error('Error procesando factura:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar la factura. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Abrir modal para crear nota contable (crédito o débito)
   */
  const handleCrearNota = (factura) => {
    setFacturaParaNota(factura);
    setIsNotaContableModalOpen(true);
  };

  /**
   * Callback después de crear una nota contable
   */
  const handleNotaCreada = async () => {
    setIsNotaContableModalOpen(false);
    setFacturaParaNota(null);
    
    // Recargar facturas, citas y notas
    await Swal.fire({
      icon: 'success',
      title: 'Nota Creada',
      text: 'La nota contable se ha creado exitosamente en Siigo',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
    
    const facturasActualizadas = await loadFacturas();
    await loadCitasAtendidas(facturasActualizadas);
    await cargarNotasContables(); // Recargar notas
  };

  /**
   * Exportar citas filtradas a Excel
   */
  const handleExportarExcel = () => {
    const filtros = {
      fechaInicio,
      fechaFin,
      filtroDocumentoPaciente,
      filtroMedico,
      filtroProcedimiento
    };
    exportarExcel(citasAtendidasFiltradas, filtros);
  };

  // ============================================================================
  // FUNCIONES DE DIAN
  // ============================================================================

  /**
   * Enviar factura (deprecado - ahora se usa Siigo directamente)
   * @deprecated Use handleEnviarASiigo
   */
  const handleEnviarDian = async (factura) => {
    console.warn('⚠️ handleEnviarDian está deprecado. Use handleEnviarASiigo');
    await Swal.fire({
      icon: 'info',
      title: 'Función Deprecada',
      text: 'Ahora se usa la integración directa con Siigo. Por favor use "Enviar a Siigo".',
      confirmButtonColor: '#3B82F6'
    });
  };

  /**
   * Confirmar envío (deprecado)
   * @deprecated
   */
  const handleConfirmarEnvioDian = async () => {
    try {
      // Mostrar loading
      Swal.fire({
        title: 'Enviando...',
        text: 'Generando XML y comunicando con DIAN',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Enviar a DIAN (el servicio ya maneja los Swal de éxito/error)
      await enviarFacturaExistenteADian(facturaParaDian);

      // Recargar facturas para mostrar CUFE actualizado
      await loadFacturas();
    } catch (error) {
      console.error('Error confirmando envío DIAN:', error);
    }
  };

  /**
   * Consultar estado de factura en DIAN
   */
  const handleConsultarEstadoDian = async (factura, facturaData) => {
    try {
      if (!facturaData.cufe) {
        await Swal.fire({
          icon: 'warning',
          title: 'Sin CUFE',
          text: 'Esta factura no tiene CUFE. Primero debe enviarla a DIAN.',
          confirmButtonColor: '#F59E0B'
        });
        return;
      }

      // El servicio ya maneja la consulta y muestra el resultado con Swal
      await consultarEstadoFacturaDian(facturaData.cufe);
    } catch (error) {
      console.error('Error consultando estado DIAN:', error);
    }
  };

  /**
   * Ver XML de factura electrónica
   */
  const handleVerXML = async (factura, facturaData) => {
    try {
      // Si ya tiene XML guardado, mostrarlo
      if (facturaData.xmlFactura) {
        setXmlContent(facturaData.xmlFactura);
        setIsXmlModalOpen(true);
        return;
      }

      // Si no tiene XML guardado, generarlo
      Swal.fire({
        title: 'Generando XML...',
        text: 'Creando XML UBL 2.1',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // El XML ahora se genera automáticamente por Siigo al enviar la factura
      Swal.close();
      
      await Swal.fire({
        icon: 'info',
        title: 'XML Automático',
        html: '<p>El XML se genera automáticamente al enviar la factura a Siigo/DIAN.</p><p>Después del envío, podrás descargarlo desde el botón de detalles de la factura.</p>',
        confirmButtonColor: '#3B82F6'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error inesperado.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // ============================================================================
  // FUNCIONES DE SIIGO
  // ============================================================================

  /**
   * Enviar factura a Siigo para facturación electrónica
   */
  const handleEnviarASiigo = async (factura) => {
    if (!siigoConnected) {
      await Swal.fire({
        icon: 'warning',
        title: 'Siigo no conectado',
        text: 'Debe configurar y conectar Siigo en la sección de Configuración antes de enviar facturas.',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;

      const result = await Swal.fire({
        title: '¿Enviar a Siigo?',
        html: `<p>¿Desea enviar la factura <strong>${numeroFactura}</strong> a Siigo para facturación electrónica?</p>
               <p class="text-sm text-gray-600">Esta acción generará el documento electrónico y lo reportará a la DIAN.</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        setLoadingSiigoAction(true);
        
        Swal.fire({
          title: 'Enviando a Siigo...',
          text: 'Por favor espere mientras se procesa la factura electrónica',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Usar el nuevo servicio de facturación electrónica
        const { facturacionElectronicaService } = await import('../../../negocio/services/contabilidadService.js');
        
        const resultados = await facturacionElectronicaService.enviarFacturasSiigo([facturaData]);

        if (resultados.exitosas && resultados.exitosas.length > 0) {
          const facturaEnviada = resultados.exitosas[0];
          
          // Actualizar factura con datos de Siigo
          facturaData.siigoId = facturaEnviada.siigoId;
          facturaData.numeroSiigo = facturaEnviada.numeroSiigo;
          facturaData.cufe = facturaEnviada.cufe;
          facturaData.estadoDian = facturaEnviada.estadoDian;
          facturaData.fechaEnvioSiigo = new Date().toISOString();
          facturaData.clienteSiigoId = facturaEnviada.clienteSiigoId;

          // Guardar en la base de datos
          await facturacionApiService.updateFacturacion(
            factura.id,
            JSON.stringify(facturaData)
          );

          Swal.close();
          await Swal.fire({
            icon: 'success',
            title: '¡Enviado a Siigo!',
            html: `
              <p><strong>La factura se envió correctamente a Siigo</strong></p>
              <p>Número Siigo: <strong>${facturaEnviada.numeroSiigo || 'Procesando'}</strong></p>
              <p>Estado DIAN: <strong>${facturaEnviada.estadoDian || 'Procesando'}</strong></p>
              ${facturaEnviada.cufe ? `<p style="font-size: 11px; margin-top: 10px;">CUFE: <code>${facturaEnviada.cufe}</code></p>` : '<p class="text-sm text-gray-600">El CUFE se generará en breve</p>'}
            `,
            confirmButtonColor: '#10B981'
          });

          // Recargar facturas
          await loadFacturas();
          
          // Cerrar modal si está abierto
          if (isVerFacturaModalOpen) {
            setIsVerFacturaModalOpen(false);
            setFacturaSeleccionada(null);
          }
        } else if (resultados.fallidas && resultados.fallidas.length > 0) {
          throw new Error(resultados.fallidas[0].error || 'Error al enviar a Siigo');
        } else {
          throw new Error('No se recibió respuesta válida de Siigo');
        }
      }
    } catch (error) {
      console.error('Error enviando a Siigo:', error);
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        html: `
          <p><strong>No se pudo enviar la factura a Siigo</strong></p>
          <p class="text-sm">${error.message}</p>
          <p class="text-xs text-gray-500 mt-2">Verifique su conexión y credenciales de Siigo</p>
        `,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoadingSiigoAction(false);
    }
  };

  /**
   * Consultar estado de factura en Siigo
   */
  const handleConsultarEstadoSiigo = async (factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      
      if (!facturaData.siigoId) {
        await Swal.fire({
          icon: 'warning',
          title: 'No enviada',
          text: 'Esta factura aún no ha sido enviada a Siigo.',
          confirmButtonColor: '#F59E0B'
        });
        return;
      }

      setLoadingSiigoAction(true);
      
      Swal.fire({
        title: 'Consultando estado...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const status = await getSiigoInvoiceStatus(facturaData.siigoId);

      Swal.close();
      
      await Swal.fire({
        icon: status.status === 'Aceptado' ? 'success' : 'info',
        title: 'Estado en Siigo',
        html: `
          <div style="text-align: left;">
            <p><strong>Estado DIAN:</strong> ${status.status || 'Procesando'}</p>
            <p><strong>CUFE:</strong> ${status.cufe || 'N/A'}</p>
            <p><strong>Fecha envío:</strong> ${status.fecha ? new Date(status.fecha).toLocaleString() : 'N/A'}</p>
            ${status.observaciones ? `<p><strong>Observaciones:</strong> ${status.observaciones}</p>` : ''}
          </div>
        `,
        confirmButtonColor: '#3B82F6'
      });

      // Actualizar datos locales si hay cambios
      if (status.status !== facturaData.estadoDian) {
        facturaData.estadoDian = status.status;
        await facturacionApiService.updateFacturacion(
          factura.id,
          JSON.stringify(facturaData)
        );
        loadFacturas();
      }
    } catch (error) {
      console.error('Error consultando estado:', error);
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo consultar el estado en Siigo.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoadingSiigoAction(false);
    }
  };

  /**
   * Descargar PDF de factura desde Siigo
   */
  const handleDescargarPDFSiigo = async (factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      
      if (!facturaData.siigoId) {
        await Swal.fire({
          icon: 'warning',
          title: 'No disponible',
          text: 'Esta factura no ha sido enviada a Siigo.',
          confirmButtonColor: '#F59E0B'
        });
        return;
      }

      setLoadingSiigoAction(true);
      
      Swal.fire({
        title: 'Descargando PDF...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;
      await downloadSiigoPDF(facturaData.siigoId, `Factura_${numeroFactura}.pdf`);

      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: 'Descarga completa',
        text: 'El PDF se ha descargado correctamente.',
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error descargando PDF:', error);
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar el PDF desde Siigo.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoadingSiigoAction(false);
    }
  };

  /**
   * Enviar factura por email desde Siigo
   */
  const handleEnviarEmailSiigo = async (factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      
      if (!facturaData.siigoId) {
        await Swal.fire({
          icon: 'warning',
          title: 'No disponible',
          text: 'Esta factura no ha sido enviada a Siigo.',
          confirmButtonColor: '#F59E0B'
        });
        return;
      }

      // Obtener email del cliente
      const emailCliente = facturaData.cliente?.email || '';

      const result = await Swal.fire({
        title: 'Enviar por email',
        html: `
          <input id="swal-input-email" class="swal2-input" placeholder="Email del destinatario" value="${emailCliente}">
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const email = document.getElementById('swal-input-email').value;
          if (!email) {
            Swal.showValidationMessage('Debe ingresar un email');
            return false;
          }
          return email;
        }
      });

      if (result.isConfirmed) {
        setLoadingSiigoAction(true);
        
        Swal.fire({
          title: 'Enviando email...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await sendSiigoEmail(facturaData.siigoId, [result.value]);

        Swal.close();
        await Swal.fire({
          icon: 'success',
          title: 'Email enviado',
          text: `La factura se envió correctamente a ${result.value}`,
          confirmButtonColor: '#10B981'
        });
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar el email desde Siigo.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoadingSiigoAction(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <MainLayout
      title="Facturación y Contabilidad"
      subtitle={`Gestión de facturación médica y contabilidad con Siigo ${!isOnline ? '(Modo Offline)' : ''}`}
      icon={<IconFileInvoice size={28} />}
    >
      <Container size="100%" px={{ base: "sm", sm: "md", lg: "xl" }} py={{ base: "sm", sm: "md" }} style={{ maxWidth: '100%' }}>
        <Stack gap="xl">
          
          {/* ============================================================
              TABS PRINCIPALES
              ============================================================ */}
          
          <Tabs defaultValue="facturacion" variant="outline">
            
            {/* ========== TAB 1: FACTURACI�"N ========== */}
            <Tabs.List>
              <Tabs.Tab value="facturacion" leftSection={<IconFileInvoice size={18} />}>
                Facturación
              </Tabs.Tab>
              <Tabs.Tab value="notas" leftSection={<IconFileDescription size={18} />}>
                Notas Contables
              </Tabs.Tab>
              <Tabs.Tab value="clientes" leftSection={<IconUsers size={18} />}>
                Clientes
              </Tabs.Tab>
              <Tabs.Tab value="cups" leftSection={<IconCode size={18} />}>
                Códigos CUPS
              </Tabs.Tab>
              <Tabs.Tab value="contabilidad" leftSection={<IconBuildingBank size={18} />}>
                Contabilidad
              </Tabs.Tab>
              <Tabs.Tab value="reportes" leftSection={<IconReportMoney size={18} />}>
                Reportes
              </Tabs.Tab>
            </Tabs.List>

            {/* ========== PANEL: FACTURACI�"N ========== */}
            <Tabs.Panel value="facturacion" pt={{ base: "md", sm: "xl" }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', 
                gap: '1rem'
              }}>
                
                {/* ===== COLUMNA IZQUIERDA: CITAS ATENDIDAS ===== */}
                <Stack gap="md">
                  {/* Header */}
                  <Paper p="md" withBorder>
                    <Group justify="space-between" wrap="wrap">
                      <div>
                        <Title order={2} size="h3">
                          Citas Atendidas
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                          Seleccione las citas para crear una factura
                        </Text>
                      </div>
                      <Group gap="sm">
                        <Button
                          variant="light"
                          leftSection={<IconFilter size={18} />}
                          onClick={toggleFiltrosFecha}
                        >
                          Filtros
                        </Button>
                        <Button
                          variant="light"
                          color="green"
                          leftSection={<IconFileDownload size={18} />}
                          onClick={handleExportarExcel}
                          disabled={citasAtendidasFiltradas.length === 0}
                        >
                          Exportar Excel
                        </Button>
                      </Group>
                    </Group>
                  </Paper>

                  {/* Filtros de citas */}
                  <CitasFilters
                    opened={showFiltrosFecha}
                    fechaInicio={fechaInicio}
                    fechaFin={fechaFin}
                    filtroDocumentoPaciente={filtroDocumentoPaciente}
                    filtroCodigoCups={filtroCodigoCups}
                    filtroMedico={filtroMedico}
                    filtroProcedimiento={filtroProcedimiento}
                    onFechaInicioChange={setFechaInicio}
                    onFechaFinChange={setFechaFin}
                    onDocumentoChange={setFiltroDocumentoPaciente}
                    onCodigoCupsChange={setFiltroCodigoCups}
                    onMedicoChange={setFiltroMedico}
                    onProcedimientoChange={setFiltroProcedimiento}
                    onLimpiar={limpiarFiltrosCitas}
                  />

                  {/* Mensaje informativo sobre citas ya facturadas */}
                  {facturas.length > 0 && (
                    <Paper p="sm" withBorder style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}>
                      <Group justify="space-between">
                        <Group gap="xs">
                          <Text size="xs" c="orange" fw={500}>
                            ℹ️ Nota: Mostrando citas de los últimos 30 días. Las citas ya facturadas no se muestran.
                          </Text>
                        </Group>
                        <Button
                          size="xs"
                          variant="light"
                          color="orange"
                          onClick={() => {
                            // Cargar 30 días más
                            Swal.fire({
                              title: 'Cargando más citas...',
                              text: 'Extendiendo búsqueda a 60 días',
                              allowOutsideClick: false,
                              didOpen: () => Swal.showLoading()
                            });
                            loadCitasAtendidas(facturas, 60).finally(() => Swal.close());
                          }}
                        >
                          Cargar más citas
                        </Button>
                      </Group>
                    </Paper>
                  )}

                  {/* Tabla de citas */}
                  <CitasTable
                    citas={citasAtendidasFiltradas}
                    selectedCitas={selectedCitas}
                    onSelectCita={handleSelectCita}
                    onSelectAll={handleSelectAllCitas}
                    loading={loadingCitas}
                    totalCitas={citasAtendidas.length}
                    limit={10}
                  />

                  {/* Botón crear factura */}
                  {selectedCitas.size > 0 && (
                    <Paper p="md" withBorder style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                      <Group justify="space-between">
                        <div>
                          <Text size="sm" fw={600} c="green">
                            {selectedCitas.size} {selectedCitas.size === 1 ? 'cita seleccionada' : 'citas seleccionadas'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {selectedCitas.size === 1 
                              ? 'Haga clic en "Crear Factura" para continuar'
                              : 'Puede crear una factura única o agrupar por cliente/entidad/período'
                            }
                          </Text>
                        </div>
                        <Button
                          size="md"
                          color="green"
                          leftSection={<IconPlus size={20} />}
                          onClick={handleCrearFactura}
                        >
                          {selectedCitas.size === 1 ? 'Crear Factura' : 'Opciones de Facturación'}
                        </Button>
                      </Group>
                    </Paper>
                  )}
                </Stack>

                {/* ===== COLUMNA DERECHA: FACTURAS CREADAS ===== */}
                <Stack gap="md">
                  {/* Header */}
                  <Paper p="md" withBorder>
                    <Group justify="space-between" wrap="wrap">
                      <div>
                        <Title order={2} size="h3">
                          Facturas Creadas
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                          Historial de facturas generadas
                        </Text>
                      </div>
                      <Button
                        variant="light"
                        leftSection={<IconFilter size={18} />}
                        onClick={toggleFiltrosFactura}
                      >
                        Filtros
                      </Button>
                    </Group>
                  </Paper>

                  {/* Filtros de facturas */}
                  <FacturasFilters
                    opened={showFiltrosFactura}
                    filtroNumeroFactura={filtroNumeroFactura}
                    filtroFechaFacturaInicio={filtroFechaFacturaInicio}
                    filtroFechaFacturaFin={filtroFechaFacturaFin}
                    onNumeroFacturaChange={setFiltroNumeroFactura}
                    onFechaInicioChange={setFiltroFechaFacturaInicio}
                    onFechaFinChange={setFiltroFechaFacturaFin}
                    onLimpiar={limpiarFiltrosFacturas}
                  />

                  {/* Tabla de facturas */}
                  <FacturasTable
                    facturas={facturas}
                    facturasFiltered={facturasFiltradas}
                    onVerFactura={handleVerFactura}
                    onGenerarPDF={handleGenerarPDFConPreview}
                    onProcesarFactura={handleProcesarFactura}
                    onEnviarDian={handleEnviarDian}
                    onConsultarEstadoDian={handleConsultarEstadoDian}
                    onVerXML={handleVerXML}
                    onEnviarASiigo={handleEnviarASiigo}
                    onConsultarEstadoSiigo={handleConsultarEstadoSiigo}
                    onDescargarPDFSiigo={handleDescargarPDFSiigo}
                    onEnviarEmailSiigo={handleEnviarEmailSiigo}
                    onCrearNota={handleCrearNota}
                    siigoConnected={siigoConnected}
                    loading={loadingFacturas}
                    limit={10}
                  />
                </Stack>
              </div>
            </Tabs.Panel>

            {/* ========== PANEL: NOTAS CONTABLES ========== */}
            <Tabs.Panel value="notas" pt={{ base: "md", sm: "xl" }}>
              <Stack gap="md">
                {/* Header */}
                <Paper p="md" withBorder>
                  <Group justify="space-between" wrap="wrap">
                    <div>
                      <Title order={2} size="h3">
                        Notas Crédito y Débito
                      </Title>
                      <Text size="sm" c="dimmed" mt={4}>
                        Gestión de notas contables asociadas a facturas
                      </Text>
                    </div>
                  </Group>
                </Paper>

                {/* Tabla de notas contables */}
                <NotasContablesTable
                  notas={notasContables}
                  loading={loadingNotas}
                  onVerNota={(nota) => {
                    setNotaSeleccionada(nota);
                    setIsVerDetalleNotaModalOpen(true);
                  }}
                  onDescargarPDF={async (nota) => {
                    try {
                      if (!nota.siigoId) {
                        await Swal.fire({
                          icon: 'warning',
                          title: 'No disponible',
                          text: 'Esta nota no tiene PDF en Siigo.',
                          confirmButtonColor: '#F59E0B'
                        });
                        return;
                      }
                      
                      Swal.fire({
                        title: 'Descargando PDF...',
                        text: 'Por favor espere',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading()
                      });

                      // TODO: Implementar descarga de PDF de nota desde Siigo
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      
                      Swal.close();
                      await Swal.fire({
                        icon: 'info',
                        title: 'En desarrollo',
                        text: 'La descarga de PDF de notas estará disponible próximamente.',
                        confirmButtonColor: '#3B82F6'
                      });
                    } catch (error) {
                      console.error('Error descargando PDF:', error);
                      Swal.close();
                      await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo descargar el PDF de la nota.',
                        confirmButtonColor: '#EF4444'
                      });
                    }
                  }}
                  onEnviarEmail={async (nota) => {
                    try {
                      if (!nota.siigoId) {
                        await Swal.fire({
                          icon: 'warning',
                          title: 'No disponible',
                          text: 'Esta nota no está en Siigo.',
                          confirmButtonColor: '#F59E0B'
                        });
                        return;
                      }

                      const { value: email } = await Swal.fire({
                        title: 'Enviar nota por email',
                        input: 'email',
                        inputLabel: 'Correo electrónico del destinatario',
                        inputPlaceholder: 'ejemplo@correo.com',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar',
                        confirmButtonText: 'Enviar',
                        confirmButtonColor: '#10B981',
                        inputValidator: (value) => {
                          if (!value) {
                            return 'Debe ingresar un correo electrónico';
                          }
                          if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
                            return 'Correo electrónico inválido';
                          }
                        }
                      });

                      if (email) {
                        Swal.fire({
                          title: 'Enviando email...',
                          text: 'Por favor espere',
                          allowOutsideClick: false,
                          didOpen: () => Swal.showLoading()
                        });

                        // TODO: Implementar envío de email desde Siigo
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        Swal.close();
                        await Swal.fire({
                          icon: 'info',
                          title: 'En desarrollo',
                          text: 'El envío de notas por email estará disponible próximamente.',
                          confirmButtonColor: '#3B82F6'
                        });
                      }
                    } catch (error) {
                      console.error('Error enviando email:', error);
                      Swal.close();
                      await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo enviar el email.',
                        confirmButtonColor: '#EF4444'
                      });
                    }
                  }}
                  onActualizar={async () => {
                    await cargarNotasContables();
                  }}
                />
              </Stack>
            </Tabs.Panel>

            {/* ========== PANEL: CLIENTES ========== */}
            <Tabs.Panel value="clientes" pt={{ base: "md", sm: "xl" }}>
              <Stack gap="md">
                <ClientesFacturacionTable
                  clientes={clientes}
                  loading={loadingClientes}
                  onEditar={handleEditarCliente}
                  onDesactivar={desactivarCliente}
                  onReactivar={reactivarCliente}
                  onNuevo={handleNuevoCliente}
                  onVerDetalle={handleVerDetalleCliente}
                  searchTerm={clienteSearchTerm}
                  onSearch={buscarClientes}
                />
              </Stack>
            </Tabs.Panel>

            {/* ========== PANEL: C�"DIGOS CUPS ========== */}
            <Tabs.Panel value="cups" pt={{ base: "md", sm: "xl" }}>
              <Stack gap="md">
                {/* Header */}
                <Paper p="md" withBorder>
                  <div>
                    <Title order={2} size="h3">
                      Códigos CUPS
                    </Title>
                    <Text size="sm" c="dimmed" mt={4}>
                      Lista de códigos CUPS disponibles para facturación médica
                    </Text>
                  </div>
                </Paper>

                {/* Barra de búsqueda */}
                <CodigosCupsSearch
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  totalCount={totalCodigosCups}
                  filteredCount={filteredCount}
                />

                {/* Tabla de códigos CUPS */}
                <CodigosCupsTable
                  codigosCups={codigosCups}
                  onEditarValor={handleOpenValorModal}
                  loading={loadingCups}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </Stack>
            </Tabs.Panel>

            {/* ========== PANEL: CONTABILIDAD ========== */}
            <Tabs.Panel value="contabilidad" pt={{ base: "md", sm: "xl" }}>
              <ContabilidadSiigoTab />
            </Tabs.Panel>

            {/* ========== PANEL: REPORTES ========== */}
            <Tabs.Panel value="reportes" pt={{ base: "md", sm: "xl" }}>
              <ReportesSiigoTab />
            </Tabs.Panel>
          </Tabs>

          {/* ============================================================
              MODALES
              ============================================================ */}

          {/* Modal: Editar valor de código CUPS */}
          <ValorCupsModal
            opened={isValorModalOpen}
            onClose={handleCloseValorModal}
            codigoCups={selectedCodigoCups}
            onSave={handleSaveValor}
          />

          {/* Modal: Selector de modo de facturación */}
          <Modal
            opened={isModoSelectorOpen}
            onClose={() => setIsModoSelectorOpen(false)}
            title="Modo de Facturación"
            size="lg"
            centered
          >
            <ModoFacturacionSelector
              citasSeleccionadas={facturaPreview || []}
              modoActual={modoFacturacion}
              onCambiarModo={(modo, criterio) => {
                setModoFacturacion(modo);
                setCriterioAgrupacion(criterio);
              }}
              onContinuar={handleSeleccionarModo}
            />
          </Modal>

          {/* Modal: Vista de grupos para facturación batch */}
          <VistaGruposFacturacionModal
            opened={isVistaGruposOpen}
            onClose={() => {
              setIsVistaGruposOpen(false);
              setGruposFacturacion({});
            }}
            grupos={gruposFacturacion}
            tipoAgrupacion={criterioAgrupacion}
            onFacturarGrupos={handleFacturarGrupos}
          />

          {/* Modal: Crear factura electrónica */}
          <CrearFacturaElectronicaModal
            opened={isFacturaModalOpen}
            onClose={() => {
              setIsFacturaModalOpen(false);
              if (modoFacturacion !== 'batch') {
                setFacturaPreview(null);
              }
            }}
            citasSeleccionadas={facturaPreview || []}
            onFacturaCreada={handleGuardarFactura}
            grupoBatch={grupoActual}
            clientesDisponibles={clientes}
            onCrearCliente={crearCliente}
            loadingClientes={loadingClientes}
          />

          {/* Modal: Ver detalles de factura guardada */}
          <VerFacturaModal
            opened={isVerFacturaModalOpen}
            onClose={() => {
              setIsVerFacturaModalOpen(false);
              setFacturaSeleccionada(null);
            }}
            factura={facturaSeleccionada}
            onProcesar={handleProcesarFactura}
            onCrearNota={handleCrearNota}
          />

          {/* Modal: Ver XML de factura electr\u00f3nica */}
          <XMLViewerModal
            opened={isXmlModalOpen}
            onClose={() => {
              setIsXmlModalOpen(false);
              setXmlContent('');
            }}
            xmlContent={xmlContent}
          />

          {/* Modal: Crear nota contable (cr\u00e9dito o d\u00e9bito) */}
          <CrearNotaContableModal
            opened={isNotaContableModalOpen}
            onClose={() => {
              setIsNotaContableModalOpen(false);
              setFacturaParaNota(null);
            }}
            factura={facturaParaNota}
            onNotaCreada={handleNotaCreada}
          />

          {/* Modal: Preview antes de enviar (DEPRECADO - ahora solo Siigo) 
          <DianPreviewModal
            opened={isDianPreviewModalOpen}
            onClose={() => {
              setIsDianPreviewModalOpen(false);
              setFacturaParaDian(null);
            }}
            factura={facturaParaDian}
            onConfirm={handleConfirmarEnvioDian}
          />
          */}

          {/* Modal: Vista previa de impresión de factura */}
          <FacturaPrintPreviewModal
            opened={previewOpen}
            onClose={closePreview}
            htmlContent={previewHTML}
            title={previewTitle}
            onPrint={handlePrint}
          />

          {/* Modal: Formulario de clientes */}
          <ClienteFacturacionForm
            opened={clienteFormOpen}
            onClose={handleCerrarFormCliente}
            onSubmit={handleGuardarCliente}
            clienteInicial={clienteEnEdicion}
            loading={loadingClientes}
          />

          {/* Modal: Detalle de cliente */}
          <ClienteFacturacionDetalle
            cliente={clienteSeleccionado}
            opened={clienteDetalleOpen}
            onClose={handleCerrarDetalleCliente}
          />

          {/* Modal: Ver detalle de nota contable */}
          <VerDetalleNotaModal
            nota={notaSeleccionada}
            opened={isVerDetalleNotaModalOpen}
            onClose={() => {
              setIsVerDetalleNotaModalOpen(false);
              setNotaSeleccionada(null);
            }}
          />

        </Stack>
      </Container>
    </MainLayout>
  );
};

export default FacturacionPage;
