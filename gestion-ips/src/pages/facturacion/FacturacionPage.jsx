import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import { codigosCupsApiService, pacientesApiService } from '../../services/pacientesApiService.js';
import { empleadosApiService } from '../../services/empleadosApiService.js';
import { useServiceWorker } from '../../utils/serviceWorker.js';
import Swal from 'sweetalert2';
import { PencilIcon, PlusIcon, FunnelIcon, CalendarDaysIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FacturacionPage = () => {
  // Hook del Service Worker
  const { isRegistered, isOnline, clearCache, getCacheStatus } = useServiceWorker();

  const [codigosCups, setCodigosCups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);

  // Estados para el modal de valor
  const [isValorModalOpen, setIsValorModalOpen] = useState(false);
  const [selectedCodigoCups, setSelectedCodigoCups] = useState(null);
  const [valorInput, setValorInput] = useState('');

  // Estados para citas médicas
  const [citasAtendidas, setCitasAtendidas] = useState([]);
  const [citasAtendidasFiltradas, setCitasAtendidasFiltradas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  // Estados para filtros de fecha
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [showFiltrosFecha, setShowFiltrosFecha] = useState(false);

  // Estados para filtros adicionales
  const [filtroDocumentoPaciente, setFiltroDocumentoPaciente] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroProcedimiento, setFiltroProcedimiento] = useState('');

  // Estados para cache de optimización
  const [cachePacientes, setCachePacientes] = useState(new Map());
  const [cacheCups, setCacheCups] = useState(new Map());
  const [cacheMedicos, setCacheMedicos] = useState(new Map());
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Funciones de cache optimizado
  const getPacienteConCache = async (pacienteId) => {
    if (cachePacientes.has(pacienteId)) {
      return cachePacientes.get(pacienteId);
    }

    try {
      const pacienteInfo = await pacientesApiService.getPacienteById(pacienteId);
      cachePacientes.set(pacienteId, pacienteInfo);
      setCachePacientes(new Map(cachePacientes));
      return pacienteInfo;
    } catch (error) {
      console.warn(`Error cargando paciente ${pacienteId}:`, error);
      return null;
    }
  };

  const getCupsConCache = async (codigoCups) => {
    if (cacheCups.has(codigoCups)) {
      return cacheCups.get(codigoCups);
    }

    try {
      const cupsInfo = await codigosCupsApiService.getCodigoCupsByCodigo(codigoCups);
      cacheCups.set(codigoCups, cupsInfo);
      setCacheCups(new Map(cacheCups));
      return cupsInfo;
    } catch (error) {
      console.warn(`Error cargando CUPS ${codigoCups}:`, error);
      return null;
    }
  };

  // Cargar médicos una sola vez
  const loadMedicosCache = async () => {
    if (cacheLoaded) return;

    try {
      const empleadosResponse = await empleadosApiService.getEmpleados({ size: 1000 });
      const empleados = empleadosResponse.content || [];
      const medicosMap = new Map();

      empleados.forEach(empleado => {
        try {
          const datosCompletos = JSON.parse(empleado.jsonData || '{}');
          if (datosCompletos.jsonData) {
            const datosInternos = JSON.parse(datosCompletos.jsonData);
            const informacionPersonal = datosInternos.informacionPersonal || {};
            const informacionLaboral = datosInternos.informacionLaboral || {};

            const nombreBase = `${informacionPersonal.primerNombre || ''} ${informacionPersonal.segundoNombre || ''} ${informacionPersonal.primerApellido || ''}`.trim();
            const especialidad = informacionLaboral.especialidad;
            const nombreCompleto = especialidad ? `${nombreBase} - ${especialidad}` : nombreBase;

            // Indexar por nombre completo
            medicosMap.set(nombreCompleto, {
              nombre: nombreCompleto,
              documento: datosCompletos.numeroDocumento || 'N/A'
            });

            // Indexar por documento
            if (datosCompletos.numeroDocumento) {
              medicosMap.set(datosCompletos.numeroDocumento, {
                nombre: nombreCompleto,
                documento: datosCompletos.numeroDocumento
              });
            }

            // Indexar por nombre sin especialidad
            if (especialidad && nombreBase) {
              medicosMap.set(nombreBase, {
                nombre: nombreCompleto,
                documento: datosCompletos.numeroDocumento || 'N/A'
              });
            }
          }
        } catch (error) {
          console.warn('Error procesando empleado:', error);
        }
      });

      setCacheMedicos(medicosMap);
      setCacheLoaded(true);
    } catch (error) {
      console.warn('Error cargando médicos:', error);
    }
  };

  // Cargar citas atendidas con cache optimizado
  const loadCitasAtendidas = async () => {
    try {
      setLoadingCitas(true);

      // Asegurar que los médicos estén cargados
      await loadMedicosCache();

      // Obtener todas las citas
      const citasResponse = await pacientesApiService.getCitas({ size: 1000 });

      if (citasResponse && citasResponse.content) {
        // Filtrar solo citas atendidas
        const citasAtendidasFiltradas = citasResponse.content.filter(cita => {
          try {
            const datosJson = JSON.parse(cita.datosJson || '{}');
            return datosJson.estado === 'ATENDIDO';
          } catch (error) {
            return false;
          }
        });

        // Ordenar por fecha descendente
        citasAtendidasFiltradas.sort((a, b) => {
          try {
            const fechaA = new Date(JSON.parse(a.datosJson || '{}').fechaHoraCita);
            const fechaB = new Date(JSON.parse(b.datosJson || '{}').fechaHoraCita);
            return fechaB - fechaA;
          } catch (error) {
            return 0;
          }
        });

        // Procesar citas usando cache optimizado
        const citasConValor = await Promise.all(
          citasAtendidasFiltradas.map(async (cita) => {
            try {
              const datosJson = JSON.parse(cita.datosJson || '{}');
              const codigoCups = datosJson.codigoCups;

              let valorCita = 0;
              let nombreProcedimiento = datosJson.motivo || 'Procedimiento médico';

              // Obtener valor del CUPS usando cache
              if (codigoCups) {
                const cupsInfo = await getCupsConCache(codigoCups);
                if (cupsInfo && cupsInfo.datosJson) {
                  const cupsDatos = JSON.parse(cupsInfo.datosJson);
                  valorCita = cupsDatos.valor || 0;
                  nombreProcedimiento = cupsInfo.nombreCup || nombreProcedimiento;
                }
              }

              // Obtener información del paciente usando cache
              let nombrePaciente = 'Paciente';
              let documentoPaciente = 'N/A';
              if (cita.pacienteId) {
                const pacienteInfo = await getPacienteConCache(cita.pacienteId);
                if (pacienteInfo && pacienteInfo.datosJson) {
                  const datosPaciente = JSON.parse(pacienteInfo.datosJson);
                  documentoPaciente = pacienteInfo.numeroDocumento || pacienteInfo.documento || 'N/A';

                  if (datosPaciente.informacionPersonalJson) {
                    const infoPersonal = JSON.parse(datosPaciente.informacionPersonalJson);
                    nombrePaciente = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || `Paciente ${cita.pacienteId}`;
                  }
                }
              }

              // Obtener información del médico desde cache (ya cargado)
              let nombreMedico = datosJson.medicoAsignado || 'Médico no asignado';
              let documentoMedico = 'N/A';

              if (datosJson.medicoAsignado && cacheMedicos.has(datosJson.medicoAsignado)) {
                const medicoInfo = cacheMedicos.get(datosJson.medicoAsignado);
                nombreMedico = medicoInfo.nombre;
                documentoMedico = medicoInfo.documento;
              }

              return {
                ...cita,
                nombrePaciente,
                documentoPaciente,
                nombreMedico,
                documentoMedico,
                nombreProcedimiento,
                valorCita,
                codigoCups: codigoCups || 'N/A',
                fechaAtencion: datosJson.fechaHoraCita
              };
            } catch (error) {
              console.error('Error procesando cita:', cita.id, error);
              return null;
            }
          })
        );

        // Filtrar citas válidas
        const citasValidas = citasConValor.filter(cita => cita !== null);

        setCitasAtendidas(citasValidas);
        setCitasAtendidasFiltradas(citasValidas);
      }
    } catch (error) {
      console.error('Error loading citas atendidas:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las citas atendidas',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoadingCitas(false);
    }
  };

  // Cargar códigos CUPS
  const loadCodigosCups = async (page = 0, search = '') => {
    try {
      setLoading(true);
      let response;

      if (search.trim()) {
        // Búsqueda general
        response = await codigosCupsApiService.searchGeneral(search, {
          page,
          size: pageSize
        });
      } else {
        // Obtener todos
        response = await codigosCupsApiService.getCodigosCups({
          page,
          size: pageSize
        });
      }

      // Verificar si la respuesta tiene la estructura correcta
      if (response && response.content !== undefined) {
        // Respuesta directa del backend (sin wrapper de success)
        setCodigosCups(response.content || []);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(page);
      } else if (response && response.success) {
        // Respuesta con wrapper de success
        setCodigosCups(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(page);
      } else {
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
      setLoading(false);
    }
  };


  // Efecto inicial
  useEffect(() => {
    loadCodigosCups();
    loadCitasAtendidas();
  }, []);

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
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
    setSelectedCodigoCups(codigoCups);
    // Extraer valor actual del JSON si existe
    try {
      const datosJson = JSON.parse(codigoCups.datosJson || '{}');
      setValorInput(datosJson.valor || '');
    } catch (error) {
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

  // Función para obtener el valor formateado
  const getValorFormateado = (codigoCups) => {
    try {
      const datosJson = JSON.parse(codigoCups.datosJson || '{}');
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
  };

  // Función para aplicar filtros de fecha
  const aplicarFiltrosFecha = () => {
    let citasFiltradas = [...citasAtendidas];

    // Filtro por fecha inicio
    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio + 'T00:00:00');
      citasFiltradas = citasFiltradas.filter(cita => {
        try {
          const fechaCita = new Date(cita.fechaAtencion);
          return fechaCita >= fechaInicioDate;
        } catch (error) {
          console.warn('Error filtrando cita por fecha inicio:', cita.id, error);
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
          console.warn('Error filtrando cita por fecha fin:', cita.id, error);
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

    // Filtro por procedimiento (busca por código CUPS o nombre)
    if (filtroProcedimiento.trim()) {
      citasFiltradas = citasFiltradas.filter(cita =>
        (cita.nombreProcedimiento &&
         cita.nombreProcedimiento.toLowerCase().includes(filtroProcedimiento.toLowerCase())) ||
        (cita.codigoCups &&
         cita.codigoCups.toLowerCase().includes(filtroProcedimiento.toLowerCase()))
      );
    }

    setCitasAtendidasFiltradas(citasFiltradas);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setFiltroDocumentoPaciente('');
    setFiltroMedico('');
    setFiltroProcedimiento('');
  };

  // Función para generar factura PDF
  const generarFacturaPDF = async (cita) => {
    // Crear contenido HTML para la factura
    const contenidoHTML = createFacturaContent(cita);

    // Usar la misma función de impresión que la historia clínica
    printFactura(contenidoHTML);
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
                  <td colspan="4" style="text-align: right; font-weight: bold;">TOTAL A PAGAR:</td>
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

  // Función para exportar a Excel
  const exportarExcel = () => {
    try {
      // Preparar datos para Excel
      const datosExcel = citasAtendidasFiltradas.map(cita => ({
        'Fecha': formatDate(cita.fechaAtencion),
        'Paciente': cita.nombrePaciente,
        'Documento Paciente': cita.documentoPaciente,
        'Médico': cita.nombreMedico,
        'Procedimiento': cita.nombreProcedimiento,
        'Código CUPS': cita.codigoCups,
        'Valor': cita.valorCita
      }));

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();

      // Crear hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(datosExcel);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 12 }, // Fecha
        { wch: 25 }, // Paciente
        { wch: 18 }, // Documento Paciente
        { wch: 30 }, // Médico
        { wch: 40 }, // Procedimiento
        { wch: 12 }, // Código CUPS
        { wch: 15 }  // Valor
      ];
      ws['!cols'] = colWidths;

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Citas Atendidas');

      // Crear hoja de resumen
      const resumenData = [
        { 'Concepto': 'Total Citas', 'Valor': citasAtendidasFiltradas.length },
        { 'Concepto': 'Total Facturado', 'Valor': citasAtendidasFiltradas.reduce((total, cita) => total + cita.valorCita, 0) }
      ];

      const wsResumen = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Generar nombre del archivo con fecha
      const fechaActual = new Date().toISOString().split('T')[0];
      const filtrosActivos = [];
      if (fechaInicio) filtrosActivos.push(`desde_${fechaInicio.replace(/-/g, '')}`);
      if (fechaFin) filtrosActivos.push(`hasta_${fechaFin.replace(/-/g, '')}`);
      if (filtroDocumentoPaciente) filtrosActivos.push('filtrado_paciente');
      if (filtroMedico) filtrosActivos.push('filtrado_medico');
      if (filtroProcedimiento) filtrosActivos.push('filtrado_procedimiento');

      const sufijoFiltros = filtrosActivos.length > 0 ? `_${filtrosActivos.join('_')}` : '';
      const nombreArchivo = `reporte_facturacion_${fechaActual}${sufijoFiltros}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Exportación Exitosa!',
        text: `El archivo Excel "${nombreArchivo}" ha sido generado y descargado.`,
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error exportando Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en Exportación',
        text: 'No se pudo generar el archivo Excel. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Efecto para aplicar filtros cuando cambian las fechas o filtros adicionales
  useEffect(() => {
    aplicarFiltrosFecha();
  }, [fechaInicio, fechaFin, filtroDocumentoPaciente, filtroMedico, filtroProcedimiento, citasAtendidas]);

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
        {/* Tabla de Citas Atendidas */}
        <div className="mb-8">
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
                      <td colSpan="8" className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Cargando citas atendidas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : citasAtendidas.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-sm text-gray-500">
                        No hay citas atendidas para mostrar
                      </td>
                    </tr>
                  ) : (
                    citasAtendidasFiltradas.slice(0, 10).map((cita) => (
                      <tr key={cita.id} className="hover:bg-gray-50">
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
                          <button
                            onClick={() => generarFacturaPDF(cita)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                            title="Imprimir Factura"
                          >
                            <PrinterIcon className="h-4 w-4" />
                            <span className="ml-1">Factura</span>
                          </button>
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
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-500">Cargando códigos CUPS...</span>
                          </div>
                        </td>
                      </tr>
                    ) : codigosCups.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-sm text-gray-500">
                          No se encontraron códigos CUPS
                        </td>
                      </tr>
                    ) : (
                      codigosCups.map((codigo) => (
                        <tr key={codigo.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {codigo.codigoCup}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {codigo.nombreCup}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {getValorFormateado(codigo)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(codigo.fechaCreacion)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(codigo.fechaActualizacion)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleOpenValorModal(codigo)}
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
        {!loading && totalPages > 1 && (
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

        {/* Modal para editar valor */}
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

export default FacturacionPage;