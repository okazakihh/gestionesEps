import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';

/**
 * Hook para buscar y gestionar clientes en facturación
 * Ahora usa los clientes ya cargados en lugar de hacer peticiones
 * Capa: Negocio
 */
export const useBusquedaCliente = (clientesDisponibles = [], crearClienteFn, loadingClientes = false) => {
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);

  /**
   * Buscar cliente por número de documento en la lista ya cargada
   */
  const buscarCliente = useCallback(async (numeroDocumento) => {
    if (!numeroDocumento.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Documento requerido',
        text: 'Ingrese un número de documento para buscar',
        timer: 2000
      });
      return null;
    }

    setBuscandoCliente(true);
    
    // Simular búsqueda asíncrona para mantener UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Buscar en la lista de clientes ya cargados
      // Limpiar el documento ingresado (quitar guiones, espacios)
      const docIngresado = numeroDocumento.trim().replace(/[-\s]/g, '');
      
      console.log('🔍 Buscando cliente...');
      console.log('Documento ingresado:', numeroDocumento);
      console.log('Documento limpio:', docIngresado);
      console.log('Total clientes disponibles:', clientesDisponibles.length);
      
      const cliente = clientesDisponibles.find(c => {
        const docOriginal = c.datos?.numeroDocumento || '';
        const dvCliente = c.datos?.digitoVerificacion || '';
        
        // Si el documento tiene guión, separar número y DV
        let docCliente, docDV;
        if (docOriginal.includes('-')) {
          const partes = docOriginal.split('-');
          docCliente = partes[0].replace(/\s/g, '');
          docDV = partes[1] ? partes[1].replace(/\s/g, '') : '';
        } else {
          // Si no tiene guión, usar el documento completo y el DV del campo separado
          docCliente = docOriginal.replace(/[-\s]/g, '');
          docDV = dvCliente.replace(/[-\s]/g, '');
        }
        
        console.log('Comparando con cliente:', {
          id: c.id,
          docOriginal: docOriginal,
          docLimpio: docCliente,
          dv: docDV,
          nombre: c.datos?.nombreCompleto || c.datos?.razonSocial
        });
        
        // Coincidencia exacta con número de documento (sin DV)
        if (docCliente === docIngresado) {
          console.log('✅ Encontrado por coincidencia exacta (sin DV)');
          return true;
        }
        
        // Coincidencia con número + DV
        const docCompleto = docDV ? docCliente + docDV : docCliente;
        if (docCompleto === docIngresado) {
          console.log('✅ Encontrado con DV concatenado');
          return true;
        }
        
        return false;
      });
      
      console.log('Resultado búsqueda:', cliente ? 'ENCONTRADO ✅' : 'NO ENCONTRADO ❌');
      
      if (cliente) {
        setClienteEncontrado(cliente);
        
        Swal.fire({
          icon: 'success',
          title: 'Cliente encontrado',
          text: `Datos cargados: ${cliente.datos?.nombreCompleto || cliente.datos?.razonSocial}`,
          timer: 2000,
          showConfirmButton: false
        });
        
        return cliente;
      } else {
        const result = await Swal.fire({
          icon: 'question',
          title: 'Cliente no encontrado',
          text: '¿Desea crear un nuevo cliente con este documento?',
          showCancelButton: true,
          confirmButtonText: 'Sí, crear cliente',
          cancelButtonText: 'No, llenar manualmente',
          confirmButtonColor: '#228BE6'
        });
        
        if (result.isConfirmed) {
          setModalNuevoCliente(true);
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error buscando cliente:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo buscar el cliente. Intente nuevamente.'
      });
      return null;
    } finally {
      setBuscandoCliente(false);
    }
  }, [clientesDisponibles]);

  /**
   * Crear nuevo cliente
   */
  const crearNuevoCliente = useCallback(async (datosCliente) => {
    if (!crearClienteFn) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede crear el cliente en este momento'
      });
      return;
    }
    
    try {
      const clienteCreado = await crearClienteFn(datosCliente);
      setClienteEncontrado(clienteCreado);
      setModalNuevoCliente(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Cliente creado',
        text: 'El cliente se ha creado y sus datos han sido cargados',
        timer: 2000,
        showConfirmButton: false
      });
      
      return clienteCreado;
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  }, [crearClienteFn]);

  /**
   * Limpiar cliente encontrado
   */
  const limpiarCliente = useCallback(() => {
    setClienteEncontrado(null);
  }, []);

  /**
   * Cerrar modal de nuevo cliente
   */
  const cerrarModalNuevoCliente = useCallback(() => {
    setModalNuevoCliente(false);
  }, []);

  return {
    clienteEncontrado,
    buscandoCliente,
    modalNuevoCliente,
    buscarCliente,
    crearNuevoCliente,
    limpiarCliente,
    cerrarModalNuevoCliente,
    loading: loadingClientes
  };
};
