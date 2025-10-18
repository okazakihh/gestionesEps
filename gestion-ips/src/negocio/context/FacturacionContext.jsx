import React, { createContext, useContext, useState, useEffect } from 'react';
import { dependencyContainer } from '@/negocio/utils/di/DependencyContainer.js';

const FacturacionContext = createContext();

export const useFacturacionContext = () => {
  const context = useContext(FacturacionContext);
  if (!context) {
    throw new Error('useFacturacionContext debe ser usado dentro de un FacturacionProvider');
  }
  return context;
};

export const FacturacionProvider = ({ children }) => {
  // Estados de citas
  const [citasAtendidas, setCitasAtendidas] = useState([]);
  const [citasAtendidasFiltradas, setCitasAtendidasFiltradas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [filtrosCitas, setFiltrosCitas] = useState({});
  const [citasSeleccionadas, setCitasSeleccionadas] = useState(new Set());
  const [totalFacturado, setTotalFacturado] = useState(0);

  // Estados de filtros de citas (UI)
  const [showFiltrosFecha, setShowFiltrosFecha] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroDocumentoPaciente, setFiltroDocumentoPaciente] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroProcedimiento, setFiltroProcedimiento] = useState('');

  // Estados de facturas
  const [facturas, setFacturas] = useState([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [showFiltrosFactura, setShowFiltrosFactura] = useState(false);
  const [filtroNumeroFactura, setFiltroNumeroFactura] = useState('');
  const [filtroFechaFacturaInicio, setFiltroFechaFacturaInicio] = useState('');
  const [filtroFechaFacturaFin, setFiltroFechaFacturaFin] = useState('');

  // Estados de códigos CUPS
  const [codigosCups, setCodigosCups] = useState([]);
  const [loadingCups, setLoadingCups] = useState(false);
  const [terminoBusquedaCups, setTerminoBusquedaCups] = useState('');
  const [paginaCups, setPaginaCups] = useState(0);

  // Estados de modales
  const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
  const [datosFactura, setDatosFactura] = useState(null);
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [facturaPreview, setFacturaPreview] = useState(null);
  const [isVerFacturaModalOpen, setIsVerFacturaModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [isPrevisualizacionModalOpen, setIsPrevisualizacionModalOpen] = useState(false);
  const [facturaPrevisualizacion, setFacturaPrevisualizacion] = useState(null);

  // Funciones
  const toggleSeleccionCita = (citaId) => {
    setCitasSeleccionadas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(citaId)) {
        newSet.delete(citaId);
      } else {
        newSet.add(citaId);
      }
      return newSet;
    });
  };

  const seleccionarTodasCitas = () => {
    setCitasSeleccionadas(new Set(citasAtendidasFiltradas.map(cita => cita.id)));
  };

  const deseleccionarTodasCitas = () => {
    setCitasSeleccionadas(new Set());
  };

  // Función de aplicar filtros de citas (ahora se llama automáticamente por useEffect)
  const aplicarFiltrosCitas = () => {
    // Esta función se mantiene por compatibilidad pero los filtros se aplican automáticamente
    console.log('Los filtros de citas se aplican automáticamente');
  };

  const limpiarFiltrosCitas = () => {
    setFechaInicio('');
    setFechaFin('');
    setFiltroDocumentoPaciente('');
    setFiltroMedico('');
    setFiltroProcedimiento('');
    // El useEffect se encargará de actualizar citasAtendidasFiltradas automáticamente
  };

  const limpiarFiltrosFactura = () => {
    setFiltroNumeroFactura('');
    setFiltroFechaFacturaInicio('');
    setFiltroFechaFacturaFin('');
    // El useEffect se encargará de recargar las facturas automáticamente
  };

  // Cargar citas atendidas inicial
  const cargarCitasAtendidas = async () => {
    try {
      setLoadingCitas(true);
      console.log('Cargando citas atendidas...');
      
      if (!dependencyContainer.isInitialized()) {
        dependencyContainer.initialize();
      }
      
      const { obtenerCitasAtendidasUseCase } = dependencyContainer.getAllUseCases();
      
      const citas = await obtenerCitasAtendidasUseCase.execute();
      console.log('Citas atendidas cargadas:', citas.length);
      
      setCitasAtendidas(citas);
      setCitasAtendidasFiltradas(citas);
    } catch (error) {
      console.error('Error al cargar citas atendidas:', error);
    } finally {
      setLoadingCitas(false);
    }
  };

  // Cargar facturas inicial
  const cargarFacturas = async (filtros = {}) => {
    try {
      setLoadingFacturas(true);
      console.log('Cargando facturas con filtros:', filtros);
      
      if (!dependencyContainer.isInitialized()) {
        dependencyContainer.initialize();
      }
      
      const { obtenerFacturasUseCase } = dependencyContainer.getAllUseCases();
      
      // Preparar filtros para el use case
      const filtrosUseCase = {
        numeroFactura: filtros.numeroFactura || filtroNumeroFactura,
        fechaInicio: filtros.fechaInicio || filtroFechaFacturaInicio,
        fechaFin: filtros.fechaFin || filtroFechaFacturaFin,
        limite: 50 // Aumentar límite para mostrar más facturas
      };

      // Solo enviar filtros que tengan valor
      const filtrosLimpios = Object.keys(filtrosUseCase).reduce((acc, key) => {
        if (filtrosUseCase[key]) {
          acc[key] = filtrosUseCase[key];
        }
        return acc;
      }, {});
      
      const facturasData = await obtenerFacturasUseCase.execute(filtrosLimpios);
      console.log('Facturas cargadas:', facturasData.length);
      if (facturasData.length > 0) {
        console.log('Primera factura (ejemplo):', JSON.stringify(facturasData[0], null, 2));
      }
      
      setFacturas(facturasData);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setFacturas([]);
    } finally {
      setLoadingFacturas(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    cargarCitasAtendidas();
    cargarFacturas();
  }, []);

  // Efecto para aplicar filtros de citas automáticamente
  useEffect(() => {
    if (citasAtendidas.length > 0) {
      let filtered = [...citasAtendidas];
      
      // Filtro por rango de fechas
      if (fechaInicio) {
        filtered = filtered.filter(cita => {
          const fechaCita = new Date(cita.fecha || cita.fechaAtencion);
          const fechaInicioFilter = new Date(fechaInicio);
          return fechaCita >= fechaInicioFilter;
        });
      }
      if (fechaFin) {
        filtered = filtered.filter(cita => {
          const fechaCita = new Date(cita.fecha || cita.fechaAtencion);
          const fechaFinFilter = new Date(fechaFin);
          return fechaCita <= fechaFinFilter;
        });
      }
      
      // Filtro por documento de paciente
      if (filtroDocumentoPaciente) {
        filtered = filtered.filter(cita => {
          const documento = cita.documentoPaciente || cita.paciente?.documento || '';
          return documento.toLowerCase().includes(filtroDocumentoPaciente.toLowerCase());
        });
      }
      
      // Filtro por médico
      if (filtroMedico) {
        filtered = filtered.filter(cita => {
          const nombreMedico = cita.nombreMedico || cita.medico?.nombre || '';
          return nombreMedico.toLowerCase().includes(filtroMedico.toLowerCase());
        });
      }
      
      // Filtro por procedimiento
      if (filtroProcedimiento) {
        filtered = filtered.filter(cita => {
          const procedimiento = cita.nombreProcedimiento || cita.procedimiento || '';
          return procedimiento.toLowerCase().includes(filtroProcedimiento.toLowerCase());
        });
      }

      setCitasAtendidasFiltradas(filtered);
    }
  }, [citasAtendidas, fechaInicio, fechaFin, filtroDocumentoPaciente, filtroMedico, filtroProcedimiento]);

  // Efecto para aplicar filtros de facturas automáticamente
  useEffect(() => {
    // Solo aplicar si hay al menos un filtro con valor
    if (filtroNumeroFactura || filtroFechaFacturaInicio || filtroFechaFacturaFin) {
      const timeoutId = setTimeout(() => {
        cargarFacturas({
          numeroFactura: filtroNumeroFactura,
          fechaInicio: filtroFechaFacturaInicio,
          fechaFin: filtroFechaFacturaFin
        });
      }, 500); // Debounce de 500ms para evitar muchas peticiones

      return () => clearTimeout(timeoutId);
    } else {
      // Si no hay filtros, cargar todas las facturas
      cargarFacturas({});
    }
  }, [filtroNumeroFactura, filtroFechaFacturaInicio, filtroFechaFacturaFin]);

  // Función de aplicar filtros de facturas (ahora se llama automáticamente por useEffect)
  const aplicarFiltrosFactura = () => {
    // Esta función se mantiene por compatibilidad pero los filtros se aplican automáticamente
    console.log('Los filtros de facturas se aplican automáticamente');
  };

  const cargarCodigosCups = async (termino = '', pagina = 0) => {
    setLoadingCups(true);
    try {
      // Implementar carga de códigos CUPS
      console.log('Cargando códigos CUPS:', termino, pagina);
    } catch (error) {
      console.error('Error cargando códigos CUPS:', error);
    } finally {
      setLoadingCups(false);
    }
  };

  const crearFactura = async () => {
    try {
      // Validar que haya citas seleccionadas
      if (citasSeleccionadas.size === 0) {
        const { default: Swal } = await import('sweetalert2');
        Swal.fire({
          icon: 'warning',
          title: 'No hay citas seleccionadas',
          text: 'Por favor selecciona al menos una cita para crear la factura.',
          confirmButtonColor: '#3b82f6'
        });
        return { success: false };
      }

      // Obtener las citas seleccionadas completas para la previsualización
      const citasSeleccionadasArray = citasAtendidas.filter(cita => 
        citasSeleccionadas.has(cita.id)
      );

      // Calcular el total de la factura
      const totalFactura = citasSeleccionadasArray.reduce((sum, cita) => {
        const valor = cita.datosJson?.valor || 0;
        return sum + Number(valor);
      }, 0);

      // Crear objeto de previsualización de factura (simulando estructura de factura real)
      const facturaPreview = {
        numeroFactura: 'PREVIEW-' + Date.now(),
        fechaEmision: new Date().toISOString(),
        estado: 'BORRADOR',
        total: totalFactura,
        citas: citasSeleccionadasArray.map(cita => ({
          id: cita.id,
          codigoCups: cita.codigoCups || cita.datosJson?.codigoCUPS || 'N/A',
          procedimiento: cita.nombreProcedimiento || cita.datosJson?.descripcion || 'Sin descripción',
          valor: cita.valorCita || cita.datosJson?.valor || 0,
          fechaAtencion: cita.fechaAtencion || cita.fecha,
          paciente: {
            nombre: cita.nombrePaciente || 'Paciente no identificado',
            documento: cita.documentoPaciente || 'N/A'
          },
          medico: {
            nombre: cita.nombreMedico || 'Médico no asignado',
            documento: cita.documentoMedico || 'N/A'
          }
        })),
        paciente: {
          nombre: citasSeleccionadasArray[0]?.nombrePaciente || 'Paciente no identificado',
          documento: citasSeleccionadasArray[0]?.documentoPaciente || 'N/A'
        },
        isPrevisualizacion: true // Flag para indicar que es previsualización
      };

      // Mostrar el modal de previsualización
      setFacturaPrevisualizacion(facturaPreview);
      setIsPrevisualizacionModalOpen(true);

      return { success: false }; // No creamos aún, solo previsualizamos

    } catch (error) {
      console.error('Error en previsualización de factura:', error);
      
      const { default: Swal } = await import('sweetalert2');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al generar la previsualización.',
        confirmButtonColor: '#3b82f6'
      });

      return { success: false, error };
    }
  };

  // Nueva función para confirmar y crear la factura desde la previsualización
  const confirmarCrearFactura = async () => {
    try {
      // Cerrar modal de previsualización
      setIsPrevisualizacionModalOpen(false);

      // Mostrar loading
      const { default: Swal } = await import('sweetalert2');
      Swal.fire({
        title: 'Creando factura...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Convertir Set a Array para el use case
      const citasIds = Array.from(citasSeleccionadas);

      // Obtener el use case del contenedor de dependencias
      const crearFacturaUseCase = dependencyContainer.getUseCase('crearFacturaUseCase');

      // Crear la factura
      const facturaCreada = await crearFacturaUseCase.execute({}, citasIds);

      console.log('Factura creada exitosamente:', facturaCreada);

      // Cerrar el loading y mostrar éxito
      Swal.fire({
        icon: 'success',
        title: 'Factura creada',
        text: `Factura ${facturaCreada.numeroFactura} creada exitosamente.`,
        confirmButtonColor: '#3b82f6'
      });

      // Limpiar selección
      setCitasSeleccionadas(new Set());

      // Recargar facturas
      await cargarFacturas();

      return { success: true, factura: facturaCreada };

    } catch (error) {
      console.error('Error creando factura:', error);
      
      const { default: Swal } = await import('sweetalert2');
      Swal.fire({
        icon: 'error',
        title: 'Error al crear factura',
        text: error.message || 'Ocurrió un error al crear la factura. Por favor intenta de nuevo.',
        confirmButtonColor: '#3b82f6'
      });

      return { success: false, error };
    }
  };

  const cancelarPrevisualizacion = () => {
    setIsPrevisualizacionModalOpen(false);
    setFacturaPrevisualizacion(null);
  };

  const handleVerFactura = (factura) => {
    setFacturaSeleccionada(factura);
    setIsVerFacturaModalOpen(true);
  };

  const handleProcesarFactura = async () => {
    try {
      console.log('Procesando factura');
      // Implementar lógica de procesamiento
    } catch (error) {
      console.error('Error procesando factura:', error);
    }
  };

  const generarFacturaPDFFactura = async (factura) => {
    try {
      console.log('=== GENERANDO PDF DE FACTURA ===');
      console.log('Datos completos de la factura:', JSON.stringify(factura, null, 2));
      console.log('Estructura de factura:', {
        numeroFactura: factura.numeroFactura,
        fechaEmision: factura.fechaEmision,
        estado: factura.estado,
        total: factura.total,
        tieneCitas: !!factura.citas,
        cantidadCitas: factura.citas?.length || 0,
        primeraCita: factura.citas?.[0]
      });
      
      // Crear el contenido HTML de la factura
      const html = createFacturaContentFromFactura(factura);
      
      // Imprimir la factura (abre ventana de impresión del navegador)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      } else {
        console.error('No se pudo abrir la ventana de impresión. Verifica los bloqueadores de popup.');
        alert('No se pudo abrir la ventana de impresión. Por favor, permite las ventanas emergentes para este sitio.');
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF de la factura: ' + error.message);
    }
  };

  // Función auxiliar para crear el contenido HTML de la factura
  const createFacturaContentFromFactura = (facturaData) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    };

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
                ${facturaData.citas && facturaData.citas.length > 0 ? facturaData.citas.map(cita => `
                  <tr>
                    <td style="font-size: 10px;">${cita.paciente?.nombre || 'N/A'}<br><small style="color: #6b7280; font-size: 9px;">Doc: ${cita.paciente?.documento || 'N/A'}</small></td>
                    <td style="font-size: 10px;">${cita.medico?.nombre || 'N/A'}</td>
                    <td style="font-size: 10px;">${cita.procedimiento || 'N/A'}</td>
                    <td style="font-size: 10px; font-family: monospace;">${cita.codigoCups || 'N/A'}</td>
                    <td style="font-size: 10px;">${formatDate(cita.fechaAtencion)}</td>
                    <td style="text-align: right; font-size: 10px;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cita.valor || 0)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="6" style="text-align: center;">No hay citas asociadas</td></tr>'}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="5" style="text-align: right; font-weight: bold; font-size: 11px;">TOTAL:</td>
                  <td style="text-align: right; font-size: 11px;" class="total-amount">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(facturaData.total || 0)}</td>
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

  const exportarExcel = async () => {
    try {
      console.log('Exportando a Excel');
      // Implementar lógica de exportación
    } catch (error) {
      console.error('Error exportando a Excel:', error);
    }
  };

  const guardarFactura = async (datos) => {
    try {
      console.log('Guardando factura:', datos);
      // Implementar lógica de guardado
      return { success: true };
    } catch (error) {
      console.error('Error guardando factura:', error);
      return { success: false, error };
    }
  };

  const handleCloseFacturaModal = () => {
    setIsFacturaModalOpen(false);
    setFacturaPreview(null);
  };

  const handleCloseVerFacturaModal = () => {
    setIsVerFacturaModalOpen(false);
    setFacturaSeleccionada(null);
  };

  const value = {
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
    isFacturaModalOpen,
    setIsFacturaModalOpen,
    facturaPreview,
    setFacturaPreview,
    isVerFacturaModalOpen,
    setIsVerFacturaModalOpen,
    facturaSeleccionada,
    setFacturaSeleccionada,
    isPrevisualizacionModalOpen,
    setIsPrevisualizacionModalOpen,
    facturaPrevisualizacion,
    setFacturaPrevisualizacion,

    // Funciones
    crearFactura,
    confirmarCrearFactura,
    cancelarPrevisualizacion,
    handleVerFactura,
    handleProcesarFactura,
    generarFacturaPDFFactura,
    exportarExcel,
    guardarFactura,
    handleCloseFacturaModal,
    handleCloseVerFacturaModal,
    aplicarFiltrosFactura
  };

  return (
    <FacturacionContext.Provider value={value}>
      {children}
    </FacturacionContext.Provider>
  );
};
