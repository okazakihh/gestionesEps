// hooks/facturacion/useFacturacionManagement.js
import { useState, useEffect, useCallback } from 'react';
import { 
  pacientesApiService, 
  codigosCupsApiService, 
  facturacionApiService 
} from '../../../data/services/pacientesApiService.js';
import { empleadosApiService } from '../../../data/services/empleadosApiService.js';
import Swal from 'sweetalert2';

/**
 * Custom hook para gestionar la lógica de facturación
 * Maneja citas, facturas, cache de datos y selección de citas
 */
export const useFacturacionManagement = () => {
  // Estados para citas
  const [citasAtendidas, setCitasAtendidas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  
  // Estados para facturas
  const [facturas, setFacturas] = useState([]);
  const [loadingFacturas, setLoadingFacturas] = useState(true);
  
  // Estados para selección de citas
  const [selectedCitas, setSelectedCitas] = useState(new Set());
  
  // Estados para cache optimizado
  const [cachePacientes, setCachePacientes] = useState(new Map());
  const [cacheCups, setCacheCups] = useState(new Map());
  const [cacheMedicos, setCacheMedicos] = useState(new Map());
  const [cacheLoaded, setCacheLoaded] = useState(false);

  /**
   * Obtiene información de un paciente usando cache
   */
  const getPacienteConCache = useCallback(async (pacienteId) => {
    if (cachePacientes.has(pacienteId)) {
      return cachePacientes.get(pacienteId);
    }

    try {
      const pacienteInfo = await pacientesApiService.getPacienteById(pacienteId);
      setCachePacientes(prev => {
        const newCache = new Map(prev);
        newCache.set(pacienteId, pacienteInfo);
        return newCache;
      });
      return pacienteInfo;
    } catch (error) {
      console.warn(`Error cargando paciente ${pacienteId}:`, error);
      return null;
    }
  }, [cachePacientes]);

  /**
   * Obtiene información de un código CUPS usando cache
   */
  const getCupsConCache = useCallback(async (codigoCups) => {
    if (cacheCups.has(codigoCups)) {
      return cacheCups.get(codigoCups);
    }

    try {
      const cupsInfo = await codigosCupsApiService.getCodigoCupsByCodigo(codigoCups);
      setCacheCups(prev => {
        const newCache = new Map(prev);
        newCache.set(codigoCups, cupsInfo);
        return newCache;
      });
      return cupsInfo;
    } catch (error) {
      console.warn(`Error cargando CUPS ${codigoCups}:`, error);
      return null;
    }
  }, [cacheCups]);

  /**
   * Carga el cache de médicos una sola vez
   */
  const loadMedicosCache = useCallback(async () => {
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

            if (nombreCompleto) {
              medicosMap.set(nombreCompleto, {
                nombre: nombreCompleto,
                documento: datosCompletos.numeroDocumento || empleado.numeroDocumento
              });
            }
          }
        } catch (error) {
          console.error('Error parsing empleado data:', empleado.id, error);
        }
      });

      setCacheMedicos(medicosMap);
      setCacheLoaded(true);
    } catch (error) {
      console.error('Error loading medicos cache:', error);
    }
  }, [cacheLoaded]);

  /**
   * Carga las citas con todos los estados y sus valores
   * Excluye automáticamente las citas que ya han sido facturadas
   * @param {Array} facturasActualizadas - Facturas actualizadas (opcional, usa el estado si no se proporciona)
   */
  const loadCitasAtendidas = useCallback(async (facturasActualizadas = null) => {
    try {
      setLoadingCitas(true);

      // Asegurar que los médicos estén cargados
      await loadMedicosCache();

      // Obtener todas las citas
      const citasResponse = await pacientesApiService.getCitas({ size: 1000 });

      if (citasResponse && citasResponse.content) {
        // Filtrar todas las citas (PROGRAMADA, ATENDIDO, CANCELADO, NO_SE_PRESENTO)
        const citasAtendidasFiltradas = citasResponse.content.filter(cita => {
          try {
            const datosJson = JSON.parse(cita.datosJson || '{}');
            return datosJson.estado && ['PROGRAMADA', 'ATENDIDO', 'CANCELADO', 'NO_SE_PRESENTO'].includes(datosJson.estado);
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

        // IMPORTANTE: Filtrar citas que no han sido facturadas aún para evitar doble facturación
        // Usar las facturas proporcionadas o las del estado
        const facturasParaFiltrar = facturasActualizadas || facturas;
        
        console.log(`📊 Total facturas disponibles: ${facturasParaFiltrar.length}`);
        
        const citasIdsFacturadas = new Set();
        facturasParaFiltrar.forEach((factura, index) => {
          try {
            const facturaData = JSON.parse(factura.jsonData || '{}');
            console.log(`📄 Factura ${index + 1} (${facturaData.numeroFactura}):`, {
              tieneCitas: facturaData.citas && Array.isArray(facturaData.citas),
              cantidadCitas: facturaData.citas?.length || 0,
              citasIds: facturaData.citas?.map(c => c.id) || []
            });
            
            if (facturaData.citas && Array.isArray(facturaData.citas)) {
              facturaData.citas.forEach(citaFactura => {
                if (citaFactura.id) {
                  citasIdsFacturadas.add(citaFactura.id);
                }
              });
            }
          } catch (error) {
            console.error('Error parsing factura data:', error);
          }
        });

        console.log(`🚫 Citas ya facturadas (IDs): [${Array.from(citasIdsFacturadas).join(', ')}]`);
        console.log(`📋 Citas antes de filtrar: ${citasAtendidasFiltradas.length}`);
        
        const citasNoFacturadas = citasAtendidasFiltradas.filter(cita => !citasIdsFacturadas.has(cita.id));
        
        console.log(`✅ Citas disponibles después de filtrar: ${citasNoFacturadas.length}`);

        // Procesar citas usando cache optimizado
        const citasConValor = await Promise.all(
          citasNoFacturadas.map(async (cita) => {
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

              // Obtener información del médico desde cache
              let nombreMedico = datosJson.medicoAsignado || 'Médico no asignado';
              let documentoMedico = 'N/A';

              if (datosJson.medicoAsignado && cacheMedicos.has(datosJson.medicoAsignado)) {
                const medicoInfo = cacheMedicos.get(datosJson.medicoAsignado);
                nombreMedico = medicoInfo.nombre;
                documentoMedico = medicoInfo.documento;
              }

              const citaProcessed = {
                ...cita,
                nombrePaciente,
                documentoPaciente,
                nombreMedico,
                documentoMedico,
                nombreProcedimiento,
                valorCita,
                codigoCups: codigoCups || 'N/A',
                fechaAtencion: datosJson.fechaHoraCita,
                estadoCita: datosJson.estado
              };
              
              return citaProcessed;
            } catch (error) {
              console.error('Error procesando cita:', cita.id, error);
              return null;
            }
          })
        );

        // Filtrar citas válidas
        const citasValidas = citasConValor.filter(cita => cita !== null);

        setCitasAtendidas(citasValidas);

        // Limpiar selección si alguna cita seleccionada ya no está disponible
        setSelectedCitas(prev => {
          const citasIdsDisponibles = new Set(citasValidas.map(cita => cita.id));
          const nuevaSeleccion = new Set([...prev].filter(id => citasIdsDisponibles.has(id)));
          return nuevaSeleccion;
        });
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
  }, [loadMedicosCache, getCupsConCache, getPacienteConCache, cacheMedicos, facturas]);

  /**
   * Carga las facturas del sistema
   */
  const loadFacturas = useCallback(async () => {
    try {
      setLoadingFacturas(true);
      const facturasResponse = await facturacionApiService.getFacturaciones({ size: 100 });
      if (facturasResponse && facturasResponse.content) {
        setFacturas(facturasResponse.content);
        return facturasResponse.content; // Retornar las facturas cargadas
      }
      return [];
    } catch (error) {
      console.error('Error loading facturas:', error);
      return [];
    } finally {
      setLoadingFacturas(false);
    }
  }, []);

  /**
   * Maneja la selección/deselección de una cita
   */
  const handleSelectCita = useCallback((citaId) => {
    setSelectedCitas(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(citaId)) {
        newSelected.delete(citaId);
      } else {
        newSelected.add(citaId);
      }
      return newSelected;
    });
  }, []);

  /**
   * Maneja la selección/deselección de todas las citas
   */
  const handleSelectAllCitas = useCallback((citas) => {
    setSelectedCitas(prev => {
      if (prev.size === citas.length) {
        return new Set();
      } else {
        return new Set(citas.map(cita => cita.id));
      }
    });
  }, []);

  /**
   * Crea una nueva factura con las citas seleccionadas
   */
  const crearFactura = useCallback(async (citasSeleccionadas) => {
    if (citasSeleccionadas.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selección requerida',
        text: 'Debe seleccionar al menos una cita para crear la factura',
        confirmButtonColor: '#F59E0B'
      });
      return null;
    }

    try {
      // Calcular total
      const totalFactura = citasSeleccionadas.reduce((total, cita) => total + cita.valorCita, 0);

      // Crear objeto de factura
      const facturaData = {
        numeroFactura: `FM-${Date.now()}`,
        fechaEmision: new Date().toISOString(),
        total: totalFactura,
        estado: 'PENDIENTE',
        citas: citasSeleccionadas.map(cita => ({
          id: cita.id,
          paciente: cita.nombrePaciente,
          documentoPaciente: cita.documentoPaciente,
          procedimiento: cita.nombreProcedimiento,
          codigoCups: cita.codigoCups,
          medico: cita.nombreMedico,
          documentoMedico: cita.documentoMedico,
          fechaAtencion: cita.fechaAtencion,
          valor: cita.valorCita
        }))
      };

      console.log('💾 Guardando factura con estas citas (IDs):', facturaData.citas.map(c => c.id));
      console.log('💾 JSON que se enviará al backend:', JSON.stringify(facturaData, null, 2));

      // Guardar factura
      const response = await facturacionApiService.createFacturacion({
        jsonData: JSON.stringify(facturaData),
        estado: 'ACTIVO'
      });

      await Swal.fire({
        icon: 'success',
        title: 'Factura Creada',
        text: `Factura ${facturaData.numeroFactura} creada exitosamente con ${citasSeleccionadas.length} cita(s)`,
        confirmButtonColor: '#10B981',
        timer: 3000
      });

      console.log('🆕 Factura creada con IDs de citas:', facturaData.citas.map(c => c.id));

      // Limpiar selección inmediatamente
      setSelectedCitas(new Set());

      // Recargar facturas primero y pasar las facturas actualizadas a loadCitasAtendidas
      // Esto asegura que las citas recién facturadas no aparezcan más en la lista
      console.log('🔄 Recargando facturas...');
      const facturasActualizadas = await loadFacturas();
      console.log('🔄 Recargando citas atendidas con facturas actualizadas...');
      await loadCitasAtendidas(facturasActualizadas);

      console.log('✅ Factura creada y listas actualizadas correctamente');

      return response;
    } catch (error) {
      console.error('Error creando factura:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la factura',
        confirmButtonColor: '#EF4444'
      });
      return null;
    }
  }, [loadFacturas, loadCitasAtendidas]);

  // Cargar datos iniciales solo una vez al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      // Primero cargar facturas
      await loadFacturas();
      // Luego cargar citas (que dependen de facturas para el filtro)
      await loadCitasAtendidas();
    };
    
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar el componente

  return {
    // Estados
    citasAtendidas,
    loadingCitas,
    facturas,
    loadingFacturas,
    selectedCitas,
    cacheMedicos,
    
    // Funciones de cache
    getPacienteConCache,
    getCupsConCache,
    loadMedicosCache,
    
    // Funciones de carga
    loadCitasAtendidas,
    loadFacturas,
    
    // Funciones de selección
    handleSelectCita,
    handleSelectAllCitas,
    
    // Funciones de facturación
    crearFactura
  };
};

export default useFacturacionManagement;
