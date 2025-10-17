import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/presentacion/components/ui/MainLayout.jsx';
import { DynamicModal, MODAL_TYPES } from '@/presentacion/components/ui/index.js';
import { useServiceWorker } from '@/negocio/utils/serviceWorker.js';
import { FacturacionProvider, useFacturacionContext } from '@/negocio/context/FacturacionContext.jsx';
import { codigosCupsApiService } from '@/data/services/pacientesApiService.js';
import Swal from 'sweetalert2';
import { PencilIcon, PlusIcon, FunnelIcon, CalendarDaysIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Componente principal de Facturación
const FacturacionPage = () => {
  const { isRegistered, isOnline, clearCache, getCacheStatus } = useServiceWorker();

  // Usar el hook personalizado de facturación
  const {
    // Estados de citas
    citasAtendidas,
    citasAtendidasFiltradas,
    loadingCitas,
    filtrosCitas,
    setFiltrosCitas,
    citasSeleccionadas,
    toggleSeleccionCita,
    seleccionarTodasCitas,
    deseleccionarTodasCitas,
    aplicarFiltrosCitas,
    limpiarFiltrosCitas,
    totalFacturado,

    // Estados de filtros de citas (UI)
    showFiltrosFecha,
    setShowFiltrosFecha,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    filtroDocumentoPaciente,
    setFiltroDocumentoPaciente,
    filtroMedico,
    setFiltroMedico,
    filtroProcedimiento,
    setFiltroProcedimiento,

    // Estados de facturas
    facturas,
    loadingFacturas,
    showFiltrosFactura,
    setShowFiltrosFactura,
    filtroNumeroFactura,
    setFiltroNumeroFactura,
    filtroFechaFacturaInicio,
    setFiltroFechaFacturaInicio,
    filtroFechaFacturaFin,
    setFiltroFechaFacturaFin,
    limpiarFiltrosFactura,

    // Estados de códigos CUPS
    codigosCups,
    loadingCups,
    terminoBusquedaCups,
    setTerminoBusquedaCups,
    paginaCups,
    setPaginaCups,
    cargarCodigosCups,

    // Estados de modales
    mostrarModalFactura,
    setMostrarModalFactura,
    datosFactura,
    setDatosFactura,

    // Estados de modales de facturas (mantenidos por compatibilidad)
    isFacturaModalOpen,
    setIsFacturaModalOpen,
    facturaPreview,
    setFacturaPreview,
    isVerFacturaModalOpen,
    setIsVerFacturaModalOpen,
    facturaSeleccionada,
    setFacturaSeleccionada,

    // Funciones
    crearFactura,
    handleVerFactura,
    handleProcesarFactura,
    generarFacturaPDFFactura,
    exportarExcel,
    guardarFactura,
    handleCloseFacturaModal,
    handleCloseVerFacturaModal,
    aplicarFiltrosFactura
  } = useFacturacionContext();

  // Estados para el modal de valor (CUPS)
  const [isValorModalOpen, setIsValorModalOpen] = useState(false);
  const [selectedCodigoCups, setSelectedCodigoCups] = useState(null);
  const [valorInput, setValorInput] = useState('');

  // Estados para modales dinámicos
  const [currentModal, setCurrentModal] = useState({
    isOpen: false,
    type: null,
    data: {}
  });


  // Estados para códigos CUPS (consolidados en el hook)
  const [codigosCupsLocal, setCodigosCupsLocal] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);

  // Efecto inicial para códigos CUPS
  useEffect(() => {
    loadCodigosCups();
  }, []);

  // Función para cargar códigos CUPS (mantener por simplicidad, pero usar hook para lógica principal)
  const loadCodigosCups = async (page = 0, search = '') => {
    try {
      setLoadingLocal(true);
      console.log('loadCodigosCups called with page:', page, 'search:', search);
      let response;

      if (search.trim()) {
        console.log('Performing general search for:', search);
        // Búsqueda general
        response = await codigosCupsApiService.searchGeneral(search, {
          page,
          size: pageSize
        });
        console.log('Search response:', response);
      } else {
        console.log('Loading all CUPS codes');
        // Obtener todos
        response = await codigosCupsApiService.getCodigosCups({
          page,
          size: pageSize
        });
        console.log('Get all response:', response);
      }

      // Verificar si la respuesta tiene la estructura correcta
      if (response && response.content !== undefined) {
        console.log('Direct backend response format detected');
        // Respuesta directa del backend (sin wrapper de success)
        setCodigosCupsLocal(response.content || []);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(page);
        console.log('Set', response.content?.length || 0, 'CUPS codes');
      } else if (response && response.success) {
        console.log('Success wrapper response format detected');
        // Respuesta con wrapper de success
        setCodigosCupsLocal(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(page);
        console.log('Set', response.data.content?.length || 0, 'CUPS codes');
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (error) {
      console.error('Error loading CUPS codes:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los códigos CUPS',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoadingLocal(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Iniciando búsqueda con término:', searchTerm);
    loadCodigosCups(0, searchTerm);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    loadCodigosCups(page, searchTerm);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      let date;

      // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateString) && dateString.length >= 6) {
        // LocalDateTime comes as [2024, 12, 15, 10, 30, 0, 0]
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3], dateString[4], dateString[5]);
      } else if (typeof dateString === 'string') {
        // Try different parsing strategies
        if (dateString.includes('T')) {
          // ISO format with time: "2024-12-15T10:30:00.000+00:00" or "2024-12-15T10:30"
          date = new Date(dateString);
        } else if (dateString.includes('-') && dateString.length === 10) {
          // Date only format: "2024-12-15"
          date = new Date(dateString + 'T00:00:00');
        } else {
          // Other string formats
          date = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
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

  // Funciones para el modal de valor
  const handleOpenValorModal = (codigoCups) => {
    console.log('=== ABRIENDO MODAL DE VALOR ===');
    console.log('Código CUPS recibido:', codigoCups);
    console.log('datosJson:', codigoCups.datosJson);
    
    setSelectedCodigoCups(codigoCups);
    // Extraer valor actual del JSON si existe
    try {
      const datosJson = JSON.parse(codigoCups.datosJson || '{}');
      console.log('datosJson parseado:', datosJson);
      console.log('Valor encontrado:', datosJson.valor);
      setValorInput(datosJson.valor || '');
    } catch (error) {
      console.error('Error parseando datosJson:', error);
      setValorInput('');
    }
    setIsValorModalOpen(true);
  };

  const handleCloseValorModal = () => {
    setIsValorModalOpen(false);
    setSelectedCodigoCups(null);
    setValorInput('');
  };

  const handleSaveValor = async () => {
    if (!selectedCodigoCups) return;

    try {
      // Parsear el JSON actual
      let datosJson = {};
      try {
        datosJson = JSON.parse(selectedCodigoCups.datosJson || '{}');
      } catch (error) {
        datosJson = {};
      }

      // Actualizar el campo valor
      datosJson.valor = parseFloat(valorInput) || 0;

      // Preparar el objeto para actualizar
      const updateData = {
        codigoCup: selectedCodigoCups.codigoCup,
        nombreCup: selectedCodigoCups.nombreCup,
        datosJson: JSON.stringify(datosJson)
      };

      // Llamar al servicio de actualización
      await codigosCupsApiService.updateCodigoCups(selectedCodigoCups.id, updateData);

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Valor Actualizado!',
        text: `El valor del código CUPS ${selectedCodigoCups.codigoCup} ha sido actualizado exitosamente.`,
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // Recargar los datos
      loadCodigosCups(currentPage, searchTerm);

      // Cerrar modal
      handleCloseValorModal();

    } catch (error) {
      console.error('Error updating CUPS value:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Actualizar',
        text: 'No se pudo actualizar el valor del código CUPS. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Funciones para modales dinámicos
  const openDynamicModal = (type, data = {}) => {
    setCurrentModal({
      isOpen: true,
      type,
      data
    });
  };

  const closeDynamicModal = () => {
    setCurrentModal({
      isOpen: false,
      type: null,
      data: {}
    });
  };


  // Función para crear el contenido HTML de la factura (similar a createPrintContent)
  const createFacturaContent = (cita) => {
    let html = `
      <html>
        <head>
          <title>Factura Médica - ${cita.nombrePaciente}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
              .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
              .institution-info { background: #f0f9ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
              .factura-info { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 2px solid #e5e7eb; }
              .patient-info { background: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
              .service-detail { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
              .section { margin-bottom: 10px; }
              .section-title { font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; font-size: 12px; }
              .field { margin-bottom: 5px; }
              .field-label { font-weight: bold; display: inline-block; min-width: 120px; color: #6b7280; }
              .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 9px; color: #6b7280; }
              .signature { margin-top: 40px; text-align: center; }
              .signature-line { border-top: 1px solid #000; width: 200px; margin: 0 auto; margin-top: 40px; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
              .important-note { background: #fee2e2; border: 1px solid #fecaca; padding: 8px; border-radius: 3px; margin: 5px 0; }
              @page { margin: 1.5cm; size: A4; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .total-row { background-color: #f0f9ff; font-weight: bold; }
              .total-amount { color: #2563eb; font-size: 14px; }
            }
          </style>
        </head>
        <body>
          <!-- Institutional Header -->
          <div class="header">
            <div class="institution-info">
              <h1 style="color: #2563eb; margin: 0; font-size: 20px; font-weight: bold;">GESTIÓN IPS</h1>
              <p style="margin: 5px 0; color: #374151; font-size: 14px;">Institución Prestadora de Servicios de Salud</p>
              <p style="margin: 2px 0; color: #6b7280;">NIT: 901.234.567-8 • Dirección: Calle 123 # 45-67, Bogotá D.C.</p>
              <p style="margin: 2px 0; color: #6b7280;">Teléfonos: (601) 123-4567 • Email: info@ips.com.co</p>
            </div>
            <h2 style="margin: 10px 0; color: #1f2937; font-size: 16px;">FACTURA DE SERVICIOS MÉDICOS</h2>
            <p style="margin: 5px 0; color: #6b7280; font-weight: bold;">Factura No: FM-${cita.id}</p>
            <p style="margin: 2px 0; color: #6b7280;">Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</p>
          </div>

          <!-- Patient Information -->
          <div class="patient-info">
            <h3 style="margin-top: 0; color: #92400e; font-size: 14px; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">INFORMACIÓN DEL PACIENTE</h3>
            <div class="grid-2">
              <div><strong>Nombre Completo:</strong> ${cita.nombrePaciente}</div>
              <div><strong>Tipo y Número de Documento:</strong> ${cita.documentoPaciente}</div>
            </div>
          </div>

          <!-- Service Information -->
          <div class="factura-info">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">INFORMACIÓN DEL SERVICIO MÉDICO</h3>
            <div class="grid-3">
              <div><strong>Fecha del Servicio:</strong> ${formatDate(cita.fechaAtencion)}</div>
              <div><strong>Médico Tratante:</strong> ${cita.nombreMedico}</div>
              <div><strong>Código CUPS:</strong> ${cita.codigoCups}</div>
            </div>
          </div>

          <!-- Service Detail -->
          <div class="service-detail">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">DETALLE DE SERVICIOS PRESTADOS</h3>

            <table>
              <thead>
                <tr>
                  <th>Código CUPS</th>
                  <th>Descripción del Servicio</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Valor Unitario</th>
                  <th style="text-align: right;">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${cita.codigoCups}</td>
                  <td>${cita.nombreProcedimiento}</td>
                  <td style="text-align: center;">1</td>
                  <td style="text-align: right;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cita.valorCita)}</td>
                  <td style="text-align: right; font-weight: bold;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cita.valorCita)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="4" style="text-align: right; font-weight: bold;">TOTAL:</td>
                  <td style="text-align: right;" class="total-amount">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cita.valorCita)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Legal Information -->
          <div class="important-note">
            <h4 style="margin: 0 0 10px 0; color: #dc2626; font-size: 12px;">💰 INFORMACIÓN DE PAGO</h4>
            <p style="margin: 5px 0; font-size: 10px;">
              • Esta factura tiene una vigencia de 30 días calendario para su cancelación.<br>
              • Los pagos deben realizarse en las cuentas autorizadas por Gestión IPS.<br>
              • Para consultas sobre esta factura, contactar al teléfono (601) 123-4567.
            </p>
          </div>

          <!-- Footer Legal -->
          <div class="footer">
            <div style="border-top: 2px solid #2563eb; padding-top: 10px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 11px; text-align: center;">INFORMACIÓN LEGAL Y NORMATIVA</h4>
            </div>

            <div style="background: #f0f9ff; padding: 8px; border-radius: 3px; margin-bottom: 10px; border: 1px solid #bae6fd;">
              <h5 style="margin: 0 0 5px 0; color: #0369a1; font-size: 10px;">🏥 SERVICIOS PRESTADOS</h5>
              <p style="margin: 0; font-size: 8px; line-height: 1.2;">
                Los servicios médicos facturados cumplen con las normas técnicas y científicas establecidas por el Ministerio de Salud y Protección Social de Colombia.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <p style="margin: 0; font-size: 9px;"><strong>Documento generado por:</strong></p>
                <p style="margin: 2px 0; font-size: 9px;">Sistema de Gestión Médica IPS</p>
                <p style="margin: 2px 0; font-size: 9px;">Versión 2.1.0</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 9px;"><strong>Fecha y hora de generación:</strong></p>
                <p style="margin: 2px 0; font-size: 9px;">${new Date().toLocaleString('es-ES')}</p>
                <p style="margin: 2px 0; font-size: 9px;">Usuario: Sistema Automatizado</p>
              </div>
            </div>

            <div style="background: #fefce8; padding: 8px; border-radius: 3px; border: 1px solid #fde68a;">
              <h5 style="margin: 0 0 5px 0; color: #92400e; font-size: 10px;">⚖️ NORMATIVA APLICABLE</h5>
              <p style="margin: 0; font-size: 8px; line-height: 1.2;">
                <strong>Ley 100 de 1993:</strong> Sistema General de Seguridad Social en Salud<br>
                <strong>Ley 1122 de 2007:</strong> Régimen de Compensación<br>
                <strong>Decreto 4747 de 2007:</strong> Manual de Tarifas SOAT<br>
                <strong>Resolución 3047 de 2008:</strong> Clasificación CUPS
              </p>
            </div>

            <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 8px; color: #9ca3af;">
                Este documento tiene carácter oficial y cumple con todas las normativas colombianas aplicables a facturación de servicios de salud.
                Cualquier reclamación debe presentarse por escrito dentro de los 30 días siguientes a la fecha de emisión.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return html;
  };

  // Función para imprimir la factura (similar a printDocument)
  const printFactura = (content) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  // Función para crear contenido HTML de factura desde datos de factura guardada
  const createFacturaContentFromFactura = (facturaData) => {
    let html = `
      <html>
        <head>
          <title>Factura Médica - ${facturaData.numeroFactura}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
              .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
              .institution-info { background: #f0f9ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
              .factura-info { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 2px solid #e5e7eb; }
              .patient-info { background: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
              .service-detail { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
              .section { margin-bottom: 10px; }
              .section-title { font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; font-size: 12px; }
              .field { margin-bottom: 5px; }
              .field-label { font-weight: bold; display: inline-block; min-width: 120px; color: #6b7280; }
              .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 9px; color: #6b7280; }
              .signature { margin-top: 40px; text-align: center; }
              .signature-line { border-top: 1px solid #000; width: 200px; margin: 0 auto; margin-top: 40px; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
              .important-note { background: #fee2e2; border: 1px solid #fecaca; padding: 8px; border-radius: 3px; margin: 5px 0; }
              @page { margin: 1.5cm; size: A4; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .total-row { background-color: #f0f9ff; font-weight: bold; }
              .total-amount { color: #2563eb; font-size: 14px; }
            }
          </style>
        </head>
        <body>
          <!-- Institutional Header -->
          <div class="header">
            <div class="institution-info">
              <h1 style="color: #2563eb; margin: 0; font-size: 20px; font-weight: bold;">GESTIÓN IPS</h1>
              <p style="margin: 5px 0; color: #374151; font-size: 14px;">Institución Prestadora de Servicios de Salud</p>
              <p style="margin: 2px 0; color: #6b7280;">NIT: 901.234.567-8 • Dirección: Calle 123 # 45-67, Bogotá D.C.</p>
              <p style="margin: 2px 0; color: #6b7280;">Teléfonos: (601) 123-4567 • Email: info@ips.com.co</p>
            </div>
            <h2 style="margin: 10px 0; color: #1f2937; font-size: 16px;">FACTURA DE SERVICIOS MÉDICOS</h2>
            <p style="margin: 5px 0; color: #6b7280; font-weight: bold;">Factura No: ${facturaData.numeroFactura}</p>
            <p style="margin: 2px 0; color: #6b7280;">Fecha de Emisión: ${formatDate(facturaData.fechaEmision)}</p>
          </div>

          <!-- Estado de la Factura -->
          <div class="factura-info">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">ESTADO DE LA FACTURA</h3>
            <div class="grid-2">
              <div><strong>Estado:</strong> <span style="color: ${facturaData.estado === 'PAGADA' ? '#10B981' : '#F59E0B'}; font-weight: bold;">${facturaData.estado}</span></div>
              <div><strong>Total:</strong> <span style="color: #2563eb; font-weight: bold; font-size: 14px;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(facturaData.total)}</span></div>
            </div>
          </div>

          <!-- Service Detail -->
          <div class="service-detail">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">DETALLE DE SERVICIOS PRESTADOS</h3>

            <table>
              <thead>
                <tr>
                  <th style="font-size: 10px;">Paciente</th>
                  <th style="font-size: 10px;">Médico</th>
                  <th style="font-size: 10px;">Procedimiento</th>
                  <th style="font-size: 10px;">Código CUPS</th>
                  <th style="font-size: 10px;">Fecha Atención</th>
                  <th style="text-align: right; font-size: 10px;">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${facturaData.citas.map(cita => `
                  <tr>
                    <td style="font-size: 10px;">${cita.paciente.nombre}<br><small style="color: #6b7280; font-size: 9px;">Doc: ${cita.paciente.documento}</small></td>
                    <td style="font-size: 10px;">${cita.medico.nombre}</td>
                    <td style="font-size: 10px;">${cita.procedimiento}</td>
                    <td style="font-size: 10px; font-family: monospace;">${cita.codigoCups}</td>
                    <td style="font-size: 10px;">${formatDate(cita.fechaAtencion)}</td>
                    <td style="text-align: right; font-size: 10px;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cita.valor)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="5" style="text-align: right; font-weight: bold; font-size: 11px;">TOTAL:</td>
                  <td style="text-align: right; font-size: 11px;" class="total-amount">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(facturaData.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Legal Information -->
          <div class="important-note">
            <h4 style="margin: 0 0 10px 0; color: #dc2626; font-size: 12px;">💰 INFORMACIÓN DE PAGO</h4>
            <p style="margin: 5px 0; font-size: 10px;">
              • Esta factura tiene una vigencia de 30 días calendario para su cancelación.<br>
              • Los pagos deben realizarse en las cuentas autorizadas por Gestión IPS.<br>
              • Para consultas sobre esta factura, contactar al teléfono (601) 123-4567.
            </p>
          </div>

          <!-- Footer Legal -->
          <div class="footer">
            <div style="border-top: 2px solid #2563eb; padding-top: 10px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 11px; text-align: center;">INFORMACIÓN LEGAL Y NORMATIVA</h4>
            </div>

            <div style="background: #f0f9ff; padding: 8px; border-radius: 3px; margin-bottom: 10px; border: 1px solid #bae6fd;">
              <h5 style="margin: 0 0 5px 0; color: #0369a1; font-size: 10px;">🏥 SERVICIOS PRESTADOS</h5>
              <p style="margin: 0; font-size: 8px; line-height: 1.2;">
                Los servicios médicos facturados cumplen con las normas técnicas y científicas establecidas por el Ministerio de Salud y Protección Social de Colombia.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <p style="margin: 0; font-size: 9px;"><strong>Documento generado por:</strong></p>
                <p style="margin: 2px 0; font-size: 9px;">Sistema de Gestión Médica IPS</p>
                <p style="margin: 2px 0; font-size: 9px;">Versión 2.1.0</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 9px;"><strong>Fecha y hora de generación:</strong></p>
                <p style="margin: 2px 0; font-size: 9px;">${new Date().toLocaleString('es-ES')}</p>
                <p style="margin: 2px 0; font-size: 9px;">Usuario: Sistema Automatizado</p>
              </div>
            </div>

            <div style="background: #fefce8; padding: 8px; border-radius: 3px; border: 1px solid #fde68a;">
              <h5 style="margin: 0 0 5px 0; color: #92400e; font-size: 10px;">⚖️ NORMATIVA APLICABLE</h5>
              <p style="margin: 0; font-size: 8px; line-height: 1.2;">
                <strong>Ley 100 de 1993:</strong> Sistema General de Seguridad Social en Salud<br>
                <strong>Ley 1122 de 2007:</strong> Régimen de Compensación<br>
                <strong>Decreto 4747 de 2007:</strong> Manual de Tarifas SOAT<br>
                <strong>Resolución 3047 de 2008:</strong> Clasificación CUPS
              </p>
            </div>

            <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 8px; color: #9ca3af;">
                Este documento tiene carácter oficial y cumple con todas las normativas colombianas aplicables a facturación de servicios de salud.
                Cualquier reclamación debe presentarse por escrito dentro de los 30 días siguientes a la fecha de emisión.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return html;
  };



  return (
    <MainLayout
      title="Módulo de Facturación"
      subtitle={`Gestión de códigos CUPS y facturación médica ${!isOnline ? '(Modo Offline)' : ''}`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Indicador de Service Worker */}
        {isRegistered && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-blue-800">
                {isOnline ? 'Conectado' : 'Modo Offline'} - Cache activo
              </span>
            </div>
            <button
              onClick={async () => {
                const status = await getCacheStatus();
                Swal.fire({
                  title: 'Estado del Cache',
                  html: `
                    <div class="text-left">
                      <p><strong>Caches activos:</strong> ${status.totalCaches}</p>
                      ${status.caches.map(cache => `
                        <p><strong>${cache.name}:</strong> ${cache.size} elementos</p>
                      `).join('')}
                    </div>
                  `,
                  confirmButtonText: 'Cerrar'
                });
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Ver estado
            </button>
          </div>
        )}

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda: Citas Atendidas */}
          <div className="space-y-6">
            {/* Tabla de Citas Atendidas */}
            <div>
              <div className="sm:flex sm:items-center justify-between mb-4">
                <div className="sm:flex-auto">
                  <h2 className="text-xl font-semibold text-gray-900">Citas Atendidas</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Historial de procedimientos médicos realizados con sus valores de facturación
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button
                    onClick={() => setShowFiltrosFecha(!showFiltrosFecha)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filtros
                    <CalendarDaysIcon className="h-4 w-4 ml-2" />
                  </button>
                  <button
                    onClick={crearFactura}
                    disabled={citasSeleccionadas.size === 0}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Crear factura con citas seleccionadas"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Crear Factura ({citasSeleccionadas.size})
                  </button>
                  <button
                    onClick={exportarExcel}
                    disabled={citasAtendidasFiltradas.length === 0}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Exportar datos filtrados a Excel"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </button>
                </div>
              </div>

              {/* Filtros de fecha */}
              {showFiltrosFecha && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        id="fechaInicio"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        id="fechaFin"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setFechaInicio('');
                          setFechaFin('');
                          setFiltroDocumentoPaciente('');
                          setFiltroMedico('');
                          setFiltroProcedimiento('');
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Limpiar Filtros
                      </button>
                    </div>
                  </div>

                  {/* Filtros adicionales para citas médicas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label htmlFor="documentoPaciente" className="block text-sm font-medium text-gray-700 mb-1">
                        Documento Paciente
                      </label>
                      <input
                        type="text"
                        id="documentoPaciente"
                        placeholder="Buscar por documento..."
                        value={filtroDocumentoPaciente}
                        onChange={(e) => setFiltroDocumentoPaciente(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="medico" className="block text-sm font-medium text-gray-700 mb-1">
                        Médico
                      </label>
                      <input
                        type="text"
                        id="medico"
                        placeholder="Buscar por médico..."
                        value={filtroMedico}
                        onChange={(e) => setFiltroMedico(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="procedimiento" className="block text-sm font-medium text-gray-700 mb-1">
                        Procedimiento
                      </label>
                      <input
                        type="text"
                        id="procedimiento"
                        placeholder="Buscar por procedimiento..."
                        value={filtroProcedimiento}
                        onChange={(e) => setFiltroProcedimiento(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
              </div>
            )}

            {/* Indicador de filtros activos */}
              {(fechaInicio || fechaFin || filtroDocumentoPaciente || filtroMedico || filtroProcedimiento) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Filtros activos:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {fechaInicio && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Desde: {new Date(fechaInicio).toLocaleDateString('es-ES')}
                        </span>
                      )}
                      {fechaFin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Hasta: {new Date(fechaFin).toLocaleDateString('es-ES')}
                        </span>
                      )}
                      {filtroDocumentoPaciente && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Doc. Paciente: {filtroDocumentoPaciente}
                        </span>
                      )}
                      {filtroMedico && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          Médico: {filtroMedico}
                        </span>
                      )}
                      {filtroProcedimiento && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          Procedimiento: {filtroProcedimiento}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                          <input
                            type="checkbox"
                            checked={citasSeleccionadas.size === citasAtendidasFiltradas.length && citasAtendidasFiltradas.length > 0}
                            onChange={seleccionarTodasCitas}
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:left-6"
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paciente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento Paciente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Médico
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Procedimiento
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código CUPS
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingCitas ? (
                        <tr>
                          <td colSpan="9" className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-sm text-gray-500">Cargando citas atendidas...</span>
                            </div>
                          </td>
                        </tr>
                      ) : citasAtendidas.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="px-6 py-8 text-center text-sm text-gray-500">
                            No hay citas atendidas para mostrar
                          </td>
                        </tr>
                      ) : (
                        citasAtendidasFiltradas.slice(0, 10).map((cita) => (
                          <tr key={cita.id} className="hover:bg-gray-50">
                            <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                              <input
                                type="checkbox"
                                checked={citasSeleccionadas.has(cita.id)}
                                onChange={() => toggleSeleccionCita(cita.id)}
                                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 sm:left-6"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(cita.fechaAtencion)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {cita.nombrePaciente}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {cita.documentoPaciente}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {cita.nombreMedico}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {cita.nombreProcedimiento}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {cita.codigoCups}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                minimumFractionDigits: 0
                              }).format(cita.valorCita)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {/* Botón removido - funcionalidad movida a facturas */}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total de citas atendidas */}
                {!loadingCitas && citasAtendidas.length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        Mostrando las últimas 10 citas de {citasAtendidasFiltradas.length} filtradas
                        {citasAtendidasFiltradas.length !== citasAtendidas.length && (
                          <span className="text-blue-600"> (de {citasAtendidas.length} totales)</span>
                        )}
                      </span>
                      <div className="text-sm font-medium text-gray-900">
                        Total facturado: {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0
                        }).format(citasAtendidasFiltradas.reduce((total, cita) => total + cita.valorCita, 0))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Facturas Creadas */}
          <div className="space-y-6">
            <div>
              <div className="sm:flex sm:items-center justify-between mb-4">
                <div className="sm:flex-auto">
                  <h2 className="text-xl font-semibold text-gray-900">Facturas Creadas</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Historial de facturas generadas
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button
                    onClick={() => setShowFiltrosFactura(!showFiltrosFactura)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filtros
                    <CalendarDaysIcon className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>

              {/* Filtros de facturas */}
              {showFiltrosFactura && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="numeroFactura" className="block text-sm font-medium text-gray-700 mb-1">
                        Número Factura
                      </label>
                      <input
                        type="text"
                        id="numeroFactura"
                        placeholder="Buscar por número..."
                        value={filtroNumeroFactura}
                        onChange={(e) => setFiltroNumeroFactura(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="fechaFacturaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        id="fechaFacturaInicio"
                        value={filtroFechaFacturaInicio}
                        onChange={(e) => setFiltroFechaFacturaInicio(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="fechaFacturaFin" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        id="fechaFacturaFin"
                        value={filtroFechaFacturaFin}
                        onChange={(e) => setFiltroFechaFacturaFin(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={limpiarFiltrosFactura}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Indicador de filtros activos de facturas */}
              {(filtroNumeroFactura || filtroFechaFacturaInicio || filtroFechaFacturaFin) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Filtros activos:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {filtroNumeroFactura && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Número: {filtroNumeroFactura}
                        </span>
                      )}
                      {filtroFechaFacturaInicio && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Desde: {new Date(filtroFechaFacturaInicio).toLocaleDateString('es-ES')}
                        </span>
                      )}
                      {filtroFechaFacturaFin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          Hasta: {new Date(filtroFechaFacturaFin).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número Factura
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Emisión
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingFacturas ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-sm text-gray-500">Cargando facturas...</span>
                            </div>
                          </td>
                        </tr>
                      ) : facturas.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                            No hay facturas creadas
                          </td>
                        </tr>
                      ) : (
                        facturas.slice(0, 10).map((factura) => {
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

                          return (
                            <tr key={factura.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {facturaData.numeroFactura || `FM-${factura.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {facturaData.fechaEmision ? formatDate(facturaData.fechaEmision) : formatDate(factura.fechaCreacion)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {new Intl.NumberFormat('es-CO', {
                                  style: 'currency',
                                  currency: 'COP',
                                  minimumFractionDigits: 0
                                }).format(facturaData.total || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  facturaData.estado === 'PENDIENTE'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : facturaData.estado === 'PAGADA'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {facturaData.estado || 'PENDIENTE'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                  onClick={() => {
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
                                      console.error('Error parseando datos de factura para modal:', error);
                                      facturaData = {};
                                    }

                                    openDynamicModal(MODAL_TYPES.FACTURA_VIEW, {
                                      facturaSeleccionada: {
                                        id: factura.id,
                                        numeroFactura: facturaData.numeroFactura || `FM-${factura.id}`,
                                        fechaEmision: facturaData.fechaEmision || null,
                                        fechaCreacion: factura.fechaCreacion || null,
                                        fechaActualizacion: factura.fechaActualizacion || null,
                                        estado: facturaData.estado || 'PENDIENTE',
                                        total: facturaData.total || 0,
                                        citas: facturaData.citas || []
                                      },
                                      handleProcesarFactura
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Ver detalles de la factura"
                                >
                                  Ver
                                </button>
                                <button
                                  onClick={() => generarFacturaPDFFactura(factura)}
                                  className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                                  title="Generar PDF de la factura"
                                >
                                  <PrinterIcon className="h-4 w-4" />
                                </button>
                                {facturaData.estado === 'PENDIENTE' && (
                                  <button
                                    onClick={() => handleProcesarFactura(factura)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Marcar como pagada"
                                  >
                                    Procesar
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total de facturas */}
                {!loadingFacturas && facturas.length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        Mostrando las últimas 10 facturas de {facturas.length} filtradas
                      </span>
                      <div className="text-sm font-medium text-gray-900">
                        Total facturado: {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0
                        }).format(facturas.reduce((total, factura) => {
                          const facturaData = JSON.parse(factura.jsonData || '{}');
                          return total + (facturaData.total || 0);
                        }, 0))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Códigos CUPS</h1>
              <p className="mt-2 text-sm text-gray-700">
                Lista de códigos CUPS disponibles para facturación médica
              </p>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Tabla */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Código CUPS
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Nombre
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Valor
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Fecha Creación
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Fecha Actualización
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loadingLocal ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-500">Cargando códigos CUPS...</span>
                          </div>
                        </td>
                      </tr>
                    ) : codigosCupsLocal.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-sm text-gray-500">
                          No se encontraron códigos CUPS
                        </td>
                      </tr>
                    ) : (
                      codigosCupsLocal.map((codigo) => (
                        <tr key={codigo.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {codigo.codigoCup}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {codigo.nombreCup}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {(() => {
                              try {
                                const datosJson = JSON.parse(codigo.datosJson || '{}');
                                const valor = datosJson.valor;
                                if (valor !== undefined && valor !== null) {
                                  return new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0
                                  }).format(valor);
                                }
                                return 'No definido';
                              } catch (error) {
                                return 'No definido';
                              }
                            })()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(codigo.fechaCreacion)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(codigo.fechaActualizacion)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => {
                                // Extraer el valor actual del CUPS antes de abrir el modal
                                let valorActual = '';
                                try {
                                  const datosJson = JSON.parse(codigo.datosJson || '{}');
                                  valorActual = datosJson.valor || '';
                                  console.log('Abriendo modal con valor:', valorActual);
                                } catch (error) {
                                  console.error('Error parseando datosJson:', error);
                                  valorActual = '';
                                }
                                
                                // Establecer el valor en el estado antes de abrir el modal
                                setValorInput(valorActual);
                                
                                openDynamicModal(MODAL_TYPES.VALOR_CUPS, {
                                  selectedCodigoCups: codigo,
                                  valorInput: valorActual, // Pasar el valor actual directamente
                                  handleSaveValor: async (nuevoValor) => {
                                    if (!codigo) return;
                                    try {
                                      console.log('Guardando nuevo valor:', nuevoValor);
                                      let datosJson = {};
                                      try {
                                        datosJson = JSON.parse(codigo.datosJson || '{}');
                                      } catch (error) {
                                        datosJson = {};
                                      }
                                      datosJson.valor = parseFloat(nuevoValor) || 0;
                                      const updateData = {
                                        codigoCup: codigo.codigoCup,
                                        nombreCup: codigo.nombreCup,
                                        datosJson: JSON.stringify(datosJson)
                                      };
                                      await codigosCupsApiService.updateCodigoCups(codigo.id, updateData);
                                      await Swal.fire({
                                        icon: 'success',
                                        title: '¡Valor Actualizado!',
                                        text: `El valor del código CUPS ${codigo.codigoCup} ha sido actualizado exitosamente.`,
                                        confirmButtonColor: '#10B981',
                                        timer: 3000,
                                        timerProgressBar: true,
                                        showConfirmButton: false
                                      });
                                      loadCodigosCups(currentPage, searchTerm);
                                      closeDynamicModal();
                                    } catch (error) {
                                      console.error('Error updating CUPS value:', error);
                                      await Swal.fire({
                                        icon: 'error',
                                        title: 'Error al Actualizar',
                                        text: 'No se pudo actualizar el valor del código CUPS. Inténtelo nuevamente.',
                                        confirmButtonColor: '#EF4444'
                                      });
                                    }
                                  }
                                });
                              }}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                              title="Editar valor"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="ml-1">Editar Valor</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Paginación */}
        {!loadingLocal && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage + 1} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Modal para previsualizar factura */}
        {isFacturaModalOpen && facturaPreview && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseFacturaModal}></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-4xl">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Previsualización de Factura - {facturaPreview.numeroFactura}
                  </h3>
                  <button
                    onClick={handleCloseFacturaModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Información general de la factura */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Información de la Factura</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <strong>Número de Factura:</strong> {facturaPreview.numeroFactura}
                        </div>
                        <div>
                          <strong>Fecha de Emisión:</strong> {formatDate(facturaPreview.fechaEmision)}
                        </div>
                        <div>
                          <strong>Total:</strong>
                          <span className="text-lg font-bold text-green-600 ml-2">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(facturaPreview.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tabla de servicios */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Servicios Facturados</h4>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Paciente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                  Médico
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Procedimiento
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                  Código CUPS
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Fecha Atención
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                  Valor
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {facturaPreview.citas.map((cita, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-xs text-gray-900">
                                    <div className="font-medium text-xs leading-tight">{cita.paciente.nombre}</div>
                                    <div className="text-xs text-gray-500 leading-tight">Doc: {cita.paciente.documento}</div>
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-900">
                                    <div className="break-words max-w-[160px] text-xs leading-tight">{cita.medico.nombre}</div>
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-500">
                                    <div className="break-words max-w-[180px] text-xs leading-tight">{cita.procedimiento}</div>
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-500 font-mono">
                                    {cita.codigoCups}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-500">
                                    {formatDate(cita.fechaAtencion)}
                                  </td>
                                  <td className="px-3 py-2 text-xs font-medium text-green-600 text-right">
                                    {new Intl.NumberFormat('es-CO', {
                                      style: 'currency',
                                      currency: 'COP',
                                      minimumFractionDigits: 0
                                    }).format(cita.valor)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-50">
                                <td colSpan="5" className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                                  TOTAL:
                                </td>
                                <td className="px-4 py-4 text-sm font-bold text-green-600 text-right">
                                  {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0
                                  }).format(facturaPreview.total)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Información Importante</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Esta factura incluye {facturaPreview.citas.length} servicio(s) médico(s)</li>
                        <li>• Una vez guardada la factura, las citas seleccionadas ya no aparecerán en la lista de citas atendidas</li>
                        <li>• La factura tendrá estado "PENDIENTE" hasta que sea procesada</li>
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={handleCloseFacturaModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarFactura}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Factura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver factura */}
        {isVerFacturaModalOpen && facturaSeleccionada && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseVerFacturaModal}></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-4xl">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Detalles de Factura - {facturaSeleccionada.numeroFactura}
                  </h3>
                  <button
                    onClick={handleCloseVerFacturaModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Información general de la factura */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Información de la Factura</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <strong>Número de Factura:</strong><br />
                          {facturaSeleccionada.numeroFactura}
                        </div>
                        <div>
                          <strong>Fecha de Emisión:</strong><br />
                          {formatDate(facturaSeleccionada.fechaEmision)}
                        </div>
                        <div>
                          <strong>Estado:</strong><br />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            facturaSeleccionada.estado === 'PAGADA'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {facturaSeleccionada.estado}
                          </span>
                        </div>
                        <div>
                          <strong>Total:</strong><br />
                          <span className="text-lg font-bold text-green-600">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(facturaSeleccionada.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tabla de servicios */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Servicios Facturados</h4>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Paciente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                                  Médico
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                  Procedimiento
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                  Código CUPS
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                  Fecha Atención
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                  Valor
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {facturaSeleccionada.citas && facturaSeleccionada.citas.map((cita, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="font-medium">{cita.paciente.nombre}</div>
                                    <div className="text-xs text-gray-500">Doc: {cita.paciente.documento}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="break-words max-w-[180px]">{cita.medico.nombre}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-500">
                                    <div className="break-words max-w-[200px]">{cita.procedimiento}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                                    {cita.codigoCups}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-500">
                                    {formatDate(cita.fechaAtencion)}
                                  </td>
                                  <td className="px-4 py-4 text-sm font-medium text-green-600 text-right">
                                    {new Intl.NumberFormat('es-CO', {
                                      style: 'currency',
                                      currency: 'COP',
                                      minimumFractionDigits: 0
                                    }).format(cita.valor)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-50">
                                <td colSpan="5" className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                                  TOTAL:
                                </td>
                                <td className="px-4 py-4 text-sm font-bold text-green-600 text-right">
                                  {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0
                                  }).format(facturaSeleccionada.total)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Información del Registro</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                        <div>
                          <strong>ID de Registro:</strong> {facturaSeleccionada.id}
                        </div>
                        <div>
                          <strong>Fecha de Creación:</strong> {formatDate(facturaSeleccionada.fechaCreacion)}
                        </div>
                        <div>
                          <strong>Última Actualización:</strong> {formatDate(facturaSeleccionada.fechaActualizacion)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={handleCloseVerFacturaModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cerrar
                    </button>
                    {facturaSeleccionada.estado === 'PENDIENTE' && (
                      <button
                        onClick={() => {
                          handleCloseVerFacturaModal();
                          handleProcesarFactura({
                            id: facturaSeleccionada.id,
                            jsonData: JSON.stringify({
                              numeroFactura: facturaSeleccionada.numeroFactura,
                              fechaEmision: facturaSeleccionada.fechaEmision,
                              citas: facturaSeleccionada.citas,
                              total: facturaSeleccionada.total,
                              estado: facturaSeleccionada.estado
                            })
                          });
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Procesar Factura
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dinámico */}
        <DynamicModal
          isOpen={currentModal.isOpen}
          onClose={closeDynamicModal}
          type={currentModal.type}
          data={currentModal.data}
        />

        {/* Modal para editar valor (mantener por compatibilidad) */}
        {isValorModalOpen && selectedCodigoCups && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseValorModal}></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-md">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Editar Valor - {selectedCodigoCups.codigoCup}
                  </h3>
                  <button
                    onClick={handleCloseValorModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Información del código CUPS */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Código CUPS</h4>
                      <p className="text-sm text-gray-600">{selectedCodigoCups.nombreCup}</p>
                    </div>

                    {/* Campo de valor */}
                    <div>
                      <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-2">
                        Valor (COP)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          id="valor"
                          value={valorInput}
                          onChange={(e) => setValorInput(e.target.value)}
                          placeholder="0"
                          min="0"
                          step="1000"
                          className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Ingrese el valor en pesos colombianos sin puntos ni comas
                      </p>
                    </div>

                    {/* Vista previa del valor formateado */}
                    {valorInput && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <strong>Vista previa:</strong> {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0
                          }).format(parseFloat(valorInput) || 0)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={handleCloseValorModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveValor}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Valor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// Componente wrapper con el provider
const FacturacionPageWithProvider = () => {
  return (
    <FacturacionProvider>
      <FacturacionPage />
    </FacturacionProvider>
  );
};

export default FacturacionPageWithProvider;
