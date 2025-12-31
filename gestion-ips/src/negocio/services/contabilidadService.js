/**
 * contabilidadService.js
 * 
 * Servicio de contabilidad que integra datos de la aplicación con Siigo
 * Gestiona clientes, productos, facturación, notas contables y reportes contables
 * 
 * Capa: Negocio
 */

import { pacientesApiService } from '../../data/services/pacientesApiService.js';
import siigoApiService from '../../data/services/siigoApiService.js';
import * as siigoAdapters from '../adapters/siigoAdapters.js';
import { 
  crearNotaCredito as crearNotaCreditoBase, 
  crearNotaDebito as crearNotaDebitoBase
  // MOTIVOS_CREDITO_DIAN,
  // MOTIVOS_DEBITO_DIAN
} from './notasContablesService.js';
import { notasContablesApiService } from '../../data/services/pacientesApiService.js';

/**
 * Servicio de gestión de clientes (Pacientes �' Siigo)
 */
export const clientesContabilidadService = {
  /**
   * Obtener todos los clientes únicos de las facturas
   * Incluye tanto entidades (EPS, ARL) como pacientes particulares
   */
  async obtenerClientes() {
    try {
      // Obtener todas las facturas para extraer clientes únicos
      const facturas = await pacientesApiService.getFacturas({ page: 0, size: 10000 });
      
      const clientesMap = new Map();
      
      facturas.content.forEach(factura => {
        try {
          const facturaData = JSON.parse(factura.jsonData || '{}');
          const cliente = facturaData.cliente;
          
          if (cliente && cliente.numeroDocumento) {
            const key = cliente.numeroDocumento;
            
            if (!clientesMap.has(key)) {
              clientesMap.set(key, {
                id: key,
                tipoDestinatario: facturaData.tipoDestinatario || 'PACIENTE',
                tipoDocumento: cliente.tipoDocumento || 'CC',
                numeroDocumento: cliente.numeroDocumento,
                digitoVerificacion: cliente.digitoVerificacion,
                // Para ENTIDAD
                razonSocial: cliente.razonSocial,
                nombreContacto: cliente.nombreContacto,
                cargoContacto: cliente.cargoContacto,
                // Para PACIENTE
                nombreCompleto: cliente.nombreCompleto,
                nombres: cliente.nombres,
                apellidos: cliente.apellidos,
                // Comunes
                direccion: cliente.direccion,
                ciudad: cliente.ciudad,
                departamento: cliente.departamento,
                telefono: cliente.telefono,
                email: cliente.email,
                // Estado de sincronización
                siigoId: facturaData.clienteSiigoId,
                sincronizado: facturaData.clienteSiigoId ? true : false,
                estadoSiigo: facturaData.clienteSiigoId ? 'Sincronizado' : 'Pendiente',
                // Estadísticas
                primeraFactura: factura.fechaCreacion,
                ultimaFactura: factura.fechaCreacion,
                cantidadFacturas: 1,
                totalFacturado: facturaData.total || 0
              });
            } else {
              // Actualizar estadísticas
              const clienteExistente = clientesMap.get(key);
              clienteExistente.cantidadFacturas++;
              clienteExistente.totalFacturado += (facturaData.total || 0);
              
              if (new Date(factura.fechaCreacion) > new Date(clienteExistente.ultimaFactura)) {
                clienteExistente.ultimaFactura = factura.fechaCreacion;
              }
              if (new Date(factura.fechaCreacion) < new Date(clienteExistente.primeraFactura)) {
                clienteExistente.primeraFactura = factura.fechaCreacion;
              }
            }
          }
        } catch (error) {
          console.error('Error procesando factura:', error);
        }
      });
      
      return Array.from(clientesMap.values())
        .sort((a, b) => b.totalFacturado - a.totalFacturado);
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      throw error;
    }
  },

  /**
   * Sincronizar un cliente con Siigo
   */
  async sincronizarCliente(clienteData, ipsConfig) {
    try {
      // Adaptar cliente a formato Siigo
      const clienteSiigo = {
        type: 'Customer',
        person_type: clienteData.tipoDestinatario === 'ENTIDAD' ? 'Company' : 'Person',
        id_type: clienteData.tipoDocumento,
        identification: clienteData.numeroDocumento,
        check_digit: clienteData.digitoVerificacion,
        name: clienteData.tipoDestinatario === 'ENTIDAD' 
          ? [clienteData.razonSocial || clienteData.nombreCompleto]
          : [clienteData.nombres || '', clienteData.apellidos || ''],
        commercial_name: clienteData.razonSocial,
        branch_office: 0,
        active: true,
        vat_responsible: false,
        fiscal_responsibilities: [{ code: 'R-99-PN' }],
        address: {
          address: clienteData.direccion || '',
          city: { country_code: 'Co', state_code: '05', city_code: '001' },
          postal_code: '050001'
        },
        phones: clienteData.telefono ? [{
          indicative: '57',
          number: clienteData.telefono,
          extension: ''
        }] : [],
        contacts: clienteData.email ? [{
          first_name: clienteData.nombreContacto || clienteData.nombres || '',
          last_name: clienteData.apellidos || '',
          email: clienteData.email,
          phone: {
            indicative: '57',
            number: clienteData.telefono || '',
            extension: ''
          }
        }] : []
      };
      
      // Enviar a Siigo
      const response = await siigoApiService.customers.createCustomer(clienteSiigo);
      
      // Actualizar todas las facturas de este cliente con el ID de Siigo
      if (response && response.id) {
        await this.actualizarClienteEnFacturas(clienteData.numeroDocumento, response.id);
      }
      
      return response;
    } catch (error) {
      console.error('Error sincronizando cliente:', error);
      throw error;
    }
  },

  /**
   * Actualizar el siigoId del cliente en todas sus facturas
   */
  async actualizarClienteEnFacturas(numeroDocumento, siigoId) {
    try {
      const facturas = await pacientesApiService.getFacturas({ page: 0, size: 10000 });
      
      const promesas = facturas.content
        .filter(factura => {
          try {
            const data = JSON.parse(factura.jsonData || '{}');
            return data.cliente?.numeroDocumento === numeroDocumento;
          } catch {
            return false;
          }
        })
        .map(async (factura) => {
          try {
            const data = JSON.parse(factura.jsonData);
            data.clienteSiigoId = siigoId;
            await pacientesApiService.updateFacturacion(factura.id, JSON.stringify(data));
          } catch (error) {
            console.error(`Error actualizando factura ${factura.id}:`, error);
          }
        });
      
      await Promise.all(promesas);
    } catch (error) {
      console.error('Error actualizando cliente en facturas:', error);
    }
  },

  /**
   * Sincronización masiva de clientes
   */
  async sincronizarMasivo(clientesData, ipsConfig) {
    const resultados = {
      exitosos: [],
      fallidos: []
    };

    for (const cliente of clientesData) {
      try {
        const resultado = await this.sincronizarCliente(cliente, ipsConfig);
        resultados.exitosos.push({ id: cliente.id, resultado });
      } catch (error) {
        resultados.fallidos.push({ 
          id: cliente.id, 
          nombre: cliente.razonSocial || cliente.nombreCompleto,
          error: error.message 
        });
      }
    }

    return resultados;
  },

  /**
   * Buscar clientes
   */
  async buscarClientes(termino) {
    try {
      const todosLosClientes = await this.obtenerClientes();
      
      if (!termino || termino.trim() === '') {
        return todosLosClientes;
      }
      
      const terminoLower = termino.toLowerCase();
      
      return todosLosClientes.filter(cliente => 
        cliente.razonSocial?.toLowerCase().includes(terminoLower) ||
        cliente.nombreCompleto?.toLowerCase().includes(terminoLower) ||
        cliente.numeroDocumento?.toLowerCase().includes(terminoLower) ||
        cliente.email?.toLowerCase().includes(terminoLower)
      );
    } catch (error) {
      console.error('Error buscando clientes:', error);
      throw error;
    }
  }
};

/**
 * Servicio de gestión de productos/servicios (CUPS �' Siigo)
 */
export const productosContabilidadService = {
  /**
   * Obtener todos los códigos CUPS con precios
   */
  async obtenerProductos() {
    try {
      const cups = await pacientesApiService.getCodigosCups({ page: 0, size: 1000 });
      
      return cups.content.map(codigo => ({
        id: codigo.id,
        codigo: codigo.codigoCups,
        nombre: codigo.procedimiento,
        descripcion: codigo.procedimiento,
        precio: codigo.valor || 0,
        tipo: 'Servicio',
        categoria: 'Servicios Médicos',
        sincronizado: codigo.siigoId ? true : false,
        estadoSiigo: codigo.siigoId ? 'Sincronizado' : 'Pendiente'
      }));
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  },

  /**
   * Sincronizar un servicio CUPS con Siigo
   */
  async sincronizarProducto(codigoCupsId, accountGroupId) {
    try {
      // Obtener código CUPS
      const cups = await pacientesApiService.getCodigoCupsById(codigoCupsId);
      
      // Adaptar a formato Siigo
      const productoSiigo = siigoAdapters.adaptServicioToSiigoProduct({
        codigo: cups.codigoCups,
        nombre: cups.procedimiento,
        precio: cups.valor || 0
      }, accountGroupId);
      
      // Enviar a Siigo
      const response = await siigoApiService.products.createProduct(productoSiigo);
      
      // Actualizar CUPS con ID de Siigo
      if (response && response.id) {
        await pacientesApiService.updateCodigoCups(codigoCupsId, {
          ...cups,
          siigoId: response.id
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error sincronizando producto:', error);
      throw error;
    }
  },

  /**
   * Buscar productos
   */
  async buscarProductos(termino) {
    try {
      const cups = await pacientesApiService.getCodigosCups({
        search: termino,
        page: 0,
        size: 50
      });
      
      return cups.content.map(codigo => ({
        id: codigo.id,
        codigo: codigo.codigoCups,
        nombre: codigo.procedimiento,
        precio: codigo.valor || 0
      }));
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  }
};

/**
 * Servicio de reportes contables
 */
export const reportesContabilidadService = {
  /**
   * Obtener resumen de facturación del período
   */
  async obtenerResumenFacturacion(fechaInicio, fechaFin) {
    try {
      const facturas = await pacientesApiService.getFacturas({
        fechaInicio,
        fechaFin,
        page: 0,
        size: 10000
      });

      const facturasProcesadas = facturas.content.map(f => {
        try {
          return {
            ...f,
            datos: JSON.parse(f.jsonData || '{}')
          };
        } catch {
          return { ...f, datos: {} };
        }
      });

      // Calcular estadísticas
      const totalFacturado = facturasProcesadas.reduce((sum, f) => 
        sum + (f.datos.total || 0), 0
      );

      const facturasPagadas = facturasProcesadas.filter(f => 
        f.datos.estado === 'PAGADA'
      );

      const totalPagado = facturasPagadas.reduce((sum, f) => 
        sum + (f.datos.total || 0), 0
      );

      const facturasEnviadas = facturasProcesadas.filter(f => 
        f.datos.siigoId
      );

      return {
        totalFacturas: facturas.content.length,
        totalFacturado,
        totalPagado,
        totalPendiente: totalFacturado - totalPagado,
        facturasPagadas: facturasPagadas.length,
        facturasPendientes: facturas.content.length - facturasPagadas.length,
        facturasEnviadasSiigo: facturasEnviadas.length,
        porcentajeEnvioSiigo: (facturasEnviadas.length / facturas.content.length) * 100 || 0,
        facturas: facturasProcesadas
      };
    } catch (error) {
      console.error('Error obteniendo resumen de facturación:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas por médico
   */
  async obtenerEstadisticasPorMedico(fechaInicio, fechaFin) {
    try {
      const citas = await pacientesApiService.getCitasAtendidas({
        fechaInicio,
        fechaFin
      });

      const estadisticasPorMedico = {};

      citas.forEach(cita => {
        const medicoNombre = cita.medico?.nombre || 'Sin asignar';
        
        if (!estadisticasPorMedico[medicoNombre]) {
          estadisticasPorMedico[medicoNombre] = {
            nombre: medicoNombre,
            totalCitas: 0,
            totalFacturado: 0,
            servicios: []
          };
        }

        estadisticasPorMedico[medicoNombre].totalCitas++;
        estadisticasPorMedico[medicoNombre].totalFacturado += (cita.total || 0);
        estadisticasPorMedico[medicoNombre].servicios.push(cita.procedimiento);
      });

      return Object.values(estadisticasPorMedico);
    } catch (error) {
      console.error('Error obteniendo estadísticas por médico:', error);
      throw error;
    }
  },

  /**
   * Obtener servicios más facturados
   */
  async obtenerServiciosMasFacturados(fechaInicio, fechaFin, limite = 10) {
    try {
      const citas = await pacientesApiService.getCitasAtendidas({
        fechaInicio,
        fechaFin
      });

      const servicios = {};

      citas.forEach(cita => {
        const codigoCups = cita.codigo_cups || 'Sin código';
        const procedimiento = cita.procedimiento || 'Sin nombre';
        const key = `${codigoCups}-${procedimiento}`;

        if (!servicios[key]) {
          servicios[key] = {
            codigoCups,
            procedimiento,
            cantidad: 0,
            totalFacturado: 0
          };
        }

        servicios[key].cantidad++;
        servicios[key].totalFacturado += (cita.total || 0);
      });

      return Object.values(servicios)
        .sort((a, b) => b.totalFacturado - a.totalFacturado)
        .slice(0, limite);
    } catch (error) {
      console.error('Error obteniendo servicios más facturados:', error);
      throw error;
    }
  },

  /**
   * Exportar reporte a formato estructurado
   */
  async exportarReporte(tipo, fechaInicio, fechaFin) {
    try {
      let datos;

      switch (tipo) {
        case 'facturacion':
          datos = await this.obtenerResumenFacturacion(fechaInicio, fechaFin);
          break;
        case 'medicos':
          datos = await this.obtenerEstadisticasPorMedico(fechaInicio, fechaFin);
          break;
        case 'servicios':
          datos = await this.obtenerServiciosMasFacturados(fechaInicio, fechaFin, 50);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      return {
        tipo,
        fechaInicio,
        fechaFin,
        fechaGeneracion: new Date().toISOString(),
        datos
      };
    } catch (error) {
      console.error('Error exportando reporte:', error);
      throw error;
    }
  }
};

/**
 * Servicio de catálogos contables
 */
export const catalogosContabilidadService = {
  /**
   * Obtener todos los catálogos de Siigo
   */
  async obtenerCatalogos() {
    try {
      const [documentTypes, paymentTypes, taxes, costCenters, warehouses] = await Promise.all([
        siigoApiService.catalogs.getDocumentTypes().catch(() => []),
        siigoApiService.catalogs.getPaymentTypes().catch(() => []),
        siigoApiService.catalogs.getTaxes().catch(() => []),
        siigoApiService.catalogs.getCostCenters().catch(() => []),
        siigoApiService.catalogs.getWarehouses().catch(() => [])
      ]);

      return {
        documentTypes,
        paymentTypes,
        taxes,
        costCenters,
        warehouses
      };
    } catch (error) {
      console.error('Error obteniendo catálogos:', error);
      throw error;
    }
  },

  /**
   * Actualizar caché de catálogos
   */
  async actualizarCatalogos() {
    try {
      const catalogos = await this.obtenerCatalogos();
      
      // Guardar en localStorage para acceso rápido
      localStorage.setItem('siigo_catalogos', JSON.stringify(catalogos));
      localStorage.setItem('siigo_catalogos_fecha', new Date().toISOString());
      
      return catalogos;
    } catch (error) {
      console.error('Error actualizando catálogos:', error);
      throw error;
    }
  },

  /**
   * Obtener catálogos desde caché o actualizar
   */
  async obtenerCatalogosConCache(forzarActualizacion = false) {
    try {
      if (!forzarActualizacion) {
        const cached = localStorage.getItem('siigo_catalogos');
        const fechaCache = localStorage.getItem('siigo_catalogos_fecha');
        
        if (cached && fechaCache) {
          const fecha = new Date(fechaCache);
          const ahora = new Date();
          const diferencia = ahora - fecha;
          
          // Cache válido por 24 horas
          if (diferencia < 24 * 60 * 60 * 1000) {
            return JSON.parse(cached);
          }
        }
      }
      
      return await this.actualizarCatalogos();
    } catch (error) {
      console.error('Error obteniendo catálogos con cache:', error);
      throw error;
    }
  }
};

/**
 * Servicio de facturación electrónica (Envío a Siigo)
 */
export const facturacionElectronicaService = {
  /**
   * Enviar facturas a Siigo para facturación electrónica
   * @param {Array} facturas - Array de facturas a enviar
   * @returns {Object} - Resultado con facturas exitosas y fallidas
   */
  async enviarFacturasSiigo(facturas) {
    const resultados = {
      exitosas: [],
      fallidas: []
    };

    for (const factura of facturas) {
      try {
        // 1. Sincronizar cliente primero si no existe en Siigo
        let clienteSiigoId = factura.clienteSiigoId;
        
        if (!clienteSiigoId) {
          // Preparar datos del cliente/paciente
          const clienteData = {
            tipoDocumento: factura.cliente.tipoDocumento,
            numeroDocumento: factura.cliente.numeroDocumento,
            digitoVerificacion: factura.cliente.digitoVerificacion,
            nombres: factura.cliente.nombres,
            apellidos: factura.cliente.apellidos,
            nombreCompleto: factura.cliente.nombreCompleto,
            email: factura.cliente.email,
            telefono: factura.cliente.telefono,
            direccion: factura.cliente.direccion
          };

          const ipsConfig = {
            razonSocial: 'IPS Demo',
            nit: '900000000',
            pais: 'CO',
            departamento: '11',
            ciudad: '11001'
          };

          const clienteSiigo = siigoAdapters.adaptPacienteToSiigoCustomer(clienteData, ipsConfig);
          const clienteResponse = await siigoApiService.customers.createCustomer(clienteSiigo);
          clienteSiigoId = clienteResponse.id;
        }

        // 2. Obtener servicios (puede venir como servicios o citas)
        const servicios = factura.servicios || factura.citas || [];
        
        if (!Array.isArray(servicios) || servicios.length === 0) {
          throw new Error('La factura no tiene servicios/citas válidos');
        }

        // 3. Preparar datos de la factura para Siigo
        const facturaData = {
          document: {
            id: 24834 // ID del tipo de documento de factura en Siigo
          },
          date: new Date().toISOString().split('T')[0],
          customer: {
            identification: factura.cliente.numeroDocumento,
            branch_office: 0
          },
          cost_center: 235, // Centro de costos por defecto
          seller: 629, // Vendedor por defecto
          observations: factura.observaciones || '',
          items: servicios.map(servicio => ({
            code: servicio.codigoCups || servicio.codigo_cups || 'S001',
            description: servicio.descripcion || servicio.procedimiento || servicio.nombreProcedimiento || 'Servicio médico',
            quantity: servicio.cantidad || 1,
            price: servicio.valorUnitario || servicio.valorCita || servicio.valor || 0,
            discount: servicio.descuento || 0,
            taxes: [
              {
                id: 13156 // IVA 0% por defecto para servicios de salud
              }
            ]
          })),
          payments: [
            {
              id: parseInt(factura.formaPago) || 1,
              value: factura.total,
              due_date: new Date().toISOString().split('T')[0]
            }
          ]
        };

        // 4. Crear factura en Siigo
        const facturaResponse = await siigoApiService.invoices.createInvoice(facturaData);
        
        resultados.exitosas.push({
          facturaId: factura.id,
          numeroFactura: factura.numeroFactura,
          numeroSiigo: facturaResponse.number || facturaResponse.id,
          siigoId: facturaResponse.id,
          cufe: facturaResponse.stamp?.cufe || null,
          estadoSiigo: facturaResponse.stamp?.status || 'PROCESANDO',
          clienteSiigoId
        });

      } catch (error) {
        console.error('Error enviando factura a Siigo:', error);
        resultados.fallidas.push({
          facturaId: factura.id,
          numeroFactura: factura.numeroFactura,
          error: error.message || 'Error desconocido al enviar a Siigo'
        });
      }
    }

    return resultados;
  }
};

/**
 * Servicio de notas contables (Crédito y Débito)
 */
export const notasContabilidadService = {
  /**
   * Crear nota crédito y enviarla a Siigo
   * @param {Object} notaData - Datos de la nota crédito
   * @param {Object} facturaOriginal - Factura sobre la cual se hace la nota
   * @returns {Object} - Resultado con datos de Siigo
   */
  async crearNotaCredito(notaData, facturaOriginal) {
    try {

      // Validar que la factura tenga siigoId
      const facturaData = typeof facturaOriginal.jsonData === 'string' 
        ? JSON.parse(facturaOriginal.jsonData) 
        : facturaOriginal.jsonData;

      if (!facturaData.siigoId) {
        throw new Error('La factura original debe estar sincronizada con Siigo antes de crear una nota crédito');
      }

      // Llamar al servicio base que ya maneja la creación
      const resultado = await crearNotaCreditoBase(notaData, facturaOriginal);

      
      // Guardar en BD local para consultas rápidas
      try {
        const notaParaBD = {
          tipoNota: 'CREDITO',
          numeroNota: resultado.siigoResponse?.number || resultado.nota?.numeroNota,
          facturaId: facturaOriginal.id,
          numeroFacturaRelacionada: facturaData.numeroFactura || facturaData.numero,
          siigoId: resultado.siigoResponse?.id || resultado.nota?.siigoId,
          motivoDian: notaData.motivoDian,
          motivo: notaData.motivo,
          observaciones: notaData.observaciones || '',
          subtotal: notaData.subtotal,
          total: notaData.total,
          serviciosAfectados: notaData.serviciosAfectados || [],
          estadoSiigo: resultado.siigoResponse?.status || resultado.siigoResponse?.stamp?.status || 'ACEPTADA',
          cufe: resultado.siigoResponse?.stamp?.electronic_document?.cufe,
          fechaCreacion: new Date().toISOString(),
          cliente: facturaData.cliente
        };

        const notaGuardada = await notasContablesApiService.createNotaContable(
          JSON.stringify(notaParaBD)
        );
        
      } catch (errorBD) {
        console.warn('⚠️ No se pudo guardar en BD local, pero la nota sí se creó en Siigo:', errorBD);
      }
      
      return resultado;

    } catch (error) {
      console.error('❌ Error creando nota crédito:', error);
      throw error;
    }
  },

  /**
   * Crear nota débito y enviarla a Siigo
   * @param {Object} notaData - Datos de la nota débito
   * @param {Object} facturaOriginal - Factura sobre la cual se hace la nota
   * @returns {Object} - Resultado con datos de Siigo
   */
  async crearNotaDebito(notaData, facturaOriginal) {
    try {

      // Validar que la factura tenga siigoId
      const facturaData = typeof facturaOriginal.jsonData === 'string' 
        ? JSON.parse(facturaOriginal.jsonData) 
        : facturaOriginal.jsonData;

      if (!facturaData.siigoId) {
        throw new Error('La factura original debe estar sincronizada con Siigo antes de crear una nota débito');
      }

      // Llamar al servicio base que ya maneja la creación
      const resultado = await crearNotaDebitoBase(notaData, facturaOriginal);

      
      // Guardar en BD local para consultas rápidas
      try {
        const notaParaBD = {
          tipoNota: 'DEBITO',
          numeroNota: resultado.siigoResponse?.number || resultado.nota?.numeroNota,
          facturaId: facturaOriginal.id,
          numeroFacturaRelacionada: facturaData.numeroFactura || facturaData.numero,
          siigoId: resultado.siigoResponse?.id || resultado.nota?.siigoId,
          motivoDian: notaData.motivoDian,
          motivo: notaData.motivo,
          observaciones: notaData.observaciones || '',
          subtotal: notaData.subtotal,
          total: notaData.total,
          serviciosAfectados: notaData.serviciosAfectados || [],
          estadoSiigo: resultado.siigoResponse?.status || resultado.siigoResponse?.stamp?.status || 'ACEPTADA',
          cufe: resultado.siigoResponse?.stamp?.electronic_document?.cufe,
          fechaCreacion: new Date().toISOString(),
          cliente: facturaData.cliente
        };

        const notaGuardada = await notasContablesApiService.createNotaContable(
          JSON.stringify(notaParaBD)
        );
        
      } catch (errorBD) {
        console.warn('⚠️ No se pudo guardar en BD local, pero la nota sí se creó en Siigo:', errorBD);
      }
      
      return resultado;

    } catch (error) {
      console.error('❌ Error creando nota débito:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las notas contables del sistema
   * @returns {Array} - Array de todas las notas crédito y débito parseadas
   */
  async obtenerTodasLasNotas() {
    try {
      
      // Consultar endpoint del backend
      const response = await notasContablesApiService.getNotasContables();
      
      // Si la respuesta es un array directamente
      const notasDTO = Array.isArray(response) ? response : response.data || [];
      
      // Parsear el jsonData de cada nota
      const notasParseadas = notasDTO.map(notaDTO => {
        try {
          const jsonData = typeof notaDTO.jsonData === 'string' 
            ? JSON.parse(notaDTO.jsonData) 
            : notaDTO.jsonData;
          
          return {
            id: notaDTO.id,
            ...jsonData,
            activo: notaDTO.activo,
            fechaCreacionDB: notaDTO.fechaCreacion,
            fechaActualizacionDB: notaDTO.fechaActualizacion
          };
        } catch (parseError) {
          console.error('Error parseando nota:', parseError, notaDTO);
          return null;
        }
      }).filter(nota => nota !== null);
      
      return notasParseadas;

    } catch (error) {
      console.error('Error obteniendo todas las notas:', error);
      // En caso de error, retornar array vacío para no romper la UI
      return [];
    }
  },

  /**
   * Obtener todas las notas contables del sistema
   * @returns {Array} - Array de todas las notas crédito y débito
   */
  async obtenerTodasLasNotas() {
    try {
      
      const notasResponse = await notasContablesApiService.getNotasContables();
      
      // Parsear jsonData de cada nota
      const notasParseadas = notasResponse.map(notaDTO => {
        try {
          const notaData = JSON.parse(notaDTO.jsonData);
          return {
            ...notaData,
            id: notaDTO.id,
            fechaCreacionBD: notaDTO.fechaCreacion,
            fechaActualizacionBD: notaDTO.fechaActualizacion,
            activo: notaDTO.activo
          };
        } catch (error) {
          console.error('Error parseando nota:', error);
          return null;
        }
      }).filter(nota => nota !== null);

      return notasParseadas;

    } catch (error) {
      console.error('Error obteniendo todas las notas:', error);
      return [];
    }
  },
   /* @param {Number} facturaId - ID de la factura
   * @returns {Array} - Array de notas (crédito y débito)
   */
  async obtenerNotasDeFactura(facturaId) {
    try {
      // TODO: Implementar cuando exista tabla de notas en backend
      
      // Por ahora retornamos array vacío
      return [];

    } catch (error) {
      console.error('Error obteniendo notas:', error);
      return [];
    }
  },

  /**
   * Calcular saldo ajustado de una factura
   * @param {Object} factura - Factura original
   * @param {Array} notas - Array de notas aplicadas
   * @returns {Object} - Saldo con desglose
   */
  calcularSaldoConNotas(factura, notas = []) {
    const facturaData = typeof factura.jsonData === 'string' 
      ? JSON.parse(factura.jsonData) 
      : factura.jsonData;

    const totalOriginal = facturaData.total || 0;
    
    const notasCredito = notas.filter(n => n.tipoNota === 'CREDITO');
    const notasDebito = notas.filter(n => n.tipoNota === 'DEBITO');

    const totalNotasCredito = notasCredito.reduce((sum, nota) => sum + (nota.total || 0), 0);
    const totalNotasDebito = notasDebito.reduce((sum, nota) => sum + (nota.total || 0), 0);

    const saldoActual = totalOriginal - totalNotasCredito + totalNotasDebito;

    return {
      totalOriginal,
      totalNotasCredito,
      totalNotasDebito,
      cantidadNotasCredito: notasCredito.length,
      cantidadNotasDebito: notasDebito.length,
      saldoActual,
      ajustado: notasCredito.length > 0 || notasDebito.length > 0
    };
  },

  /**
   * Obtener motivos disponibles para notas (ahora desde Siigo)
   */
  getMotivosCredito() {
    // Los motivos ahora se obtienen desde catálogos de Siigo
    return [];
  },

  getMotivoDebito() {
    // Los motivos ahora se obtienen desde catálogos de Siigo
    return [];
  }
};

export default {
  clientes: clientesContabilidadService,
  productos: productosContabilidadService,
  reportes: reportesContabilidadService,
  catalogos: catalogosContabilidadService,
  facturacionElectronica: facturacionElectronicaService,
  notas: notasContabilidadService
};
