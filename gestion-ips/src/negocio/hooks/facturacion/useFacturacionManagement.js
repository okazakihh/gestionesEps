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
   * @param {number} diasAtras - Número de días hacia atrás para cargar (default: 30)
   */
  const loadCitasAtendidas = useCallback(async (facturasActualizadas = null, diasAtras = 30) => {
    try {
      setLoadingCitas(true);

      // Asegurar que los médicos estén cargados (en paralelo con citas)
      const loadMedicosPromise = loadMedicosCache();

      // Calcular fecha límite (últimos N días)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasAtras);
      
      // Obtener citas recientes (optimizado con límite de tamaño)
      const citasResponse = await pacientesApiService.getCitas({ size: 500 });
      
      // Esperar a que médicos terminen de cargar
      await loadMedicosPromise;

      if (citasResponse && citasResponse.content) {
        
        // Calcular fecha límite para logs
        
        // Filtrar citas por estado y fecha
        const citasAtendidasFiltradas = citasResponse.content.filter(cita => {
          try {
            const datosJson = JSON.parse(cita.datosJson || '{}');
            
            // Filtrar por estado
            if (!datosJson.estado || !['PROGRAMADA', 'ATENDIDO', 'CANCELADO', 'NO_SE_PRESENTO'].includes(datosJson.estado)) {
              return false;
            }
            
            // Filtrar por fecha (últimos N días) - DESHABILITADO TEMPORALMENTE PARA DEBUG
            // const fechaCita = new Date(datosJson.fechaHoraCita);
            // if (fechaCita < fechaLimite) {
            //   return false;
            // }
            
            return true;
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

        // IMPORTANTE: Filtrar citas que no han sido facturadas aún
        const facturasParaFiltrar = facturasActualizadas || facturas;
        
        if (!Array.isArray(facturasParaFiltrar)) {
          console.warn('⚠️ facturasParaFiltrar no es un array');
          setCitasAtendidas(citasAtendidasFiltradas);
          return;
        }
        
        // Crear Set de IDs de citas facturadas (optimizado)
        const citasIdsFacturadas = new Set();
        facturasParaFiltrar.forEach(factura => {
          try {
            const facturaData = JSON.parse(factura.jsonData || '{}');
            // Buscar en servicios o citas
            const items = facturaData.servicios || facturaData.citas || [];
            items.forEach(item => {
              if (item.citaId) citasIdsFacturadas.add(item.citaId);
              if (item.id) citasIdsFacturadas.add(item.id);
            });
          } catch (error) {
            // Silenciar error
          }
        });
        
        const citasNoFacturadas = citasAtendidasFiltradas.filter(cita => !citasIdsFacturadas.has(cita.id));
        

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
  }, [loadMedicosCache, getCupsConCache, getPacienteConCache, cacheMedicos]);
  // Nota: NO incluir 'facturas' en dependencias porque se pasa como parámetro

  /**
   * Carga más citas extendiendo el rango de fechas
   * Útil para cargar historial más antiguo bajo demanda
   */
  const loadMasCitas = useCallback(async (diasAdicionales = 30) => {
    const diasActuales = 30; // Asumimos que la carga inicial fue de 30 días
    const nuevoRango = diasActuales + diasAdicionales;
    await loadCitasAtendidas(facturas, nuevoRango);
  }, [facturas, loadCitasAtendidas]);

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
      
      setFacturas([]);
      return [];
    } catch (error) {
      console.error('❌ Error loading facturas:', error);
      setFacturas([]);
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


      // Limpiar selección inmediatamente
      setSelectedCitas(new Set());

      // Recargar facturas primero y pasar las facturas actualizadas a loadCitasAtendidas
      // Esto asegura que las citas recién facturadas no aparezcan más en la lista
      const facturasActualizadas = await loadFacturas();
      await loadCitasAtendidas(facturasActualizadas);


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
      
      // Primero cargar facturas y obtener el resultado
      const facturasIniciales = await loadFacturas();
      
      // Luego cargar citas pasando las facturas recién cargadas
      await loadCitasAtendidas(facturasIniciales);
      
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
    loadMasCitas, // Nueva función para cargar más citas
    
    // Funciones de selección
    handleSelectCita,
    handleSelectAllCitas,
    
    // Funciones de facturación
    crearFactura
  };
};

export default useFacturacionManagement;
