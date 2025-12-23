import { useState, useEffect, useCallback } from 'react';
import { clientesFacturacionApiService } from '../../../data/services/pacientesApiService.js';
import Swal from 'sweetalert2';

/**
 * Hook personalizado para gestión de clientes de facturación
 * Capa de negocio - maneja lógica de clientes
 */
export const useClientesFacturacion = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);

  /**
   * Cargar todos los clientes
   */
  const cargarClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientesFacturacionApiService.getClientes();
      
      // Parsear jsonData de cada cliente
      const clientesParsed = response.map(cliente => ({
        ...cliente,
        datos: JSON.parse(cliente.jsonData)
      }));
      
      setClientes(clientesParsed);
      setFilteredClientes(clientesParsed);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los clientes',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo cliente
   */
  const crearCliente = useCallback(async (datosCliente) => {
    setLoading(true);
    setError(null);
    try {
      // Asegurar que el cliente tenga la estructura correcta
      const clienteData = {
        ...datosCliente,
        activo: true
      };

      const jsonData = JSON.stringify(clienteData);
      const response = await clientesFacturacionApiService.createCliente(jsonData);
      
      await Swal.fire({
        icon: 'success',
        title: 'Cliente creado',
        text: 'El cliente se ha creado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      // Recargar lista de clientes
      await cargarClientes();
      
      return response;
    } catch (err) {
      console.error('Error creando cliente:', err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo crear el cliente',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarClientes]);

  /**
   * Actualizar cliente existente
   */
  const actualizarCliente = useCallback(async (id, datosCliente) => {
    setLoading(true);
    setError(null);
    try {
      const jsonData = JSON.stringify(datosCliente);
      const response = await clientesFacturacionApiService.updateCliente(id, jsonData);
      
      await Swal.fire({
        icon: 'success',
        title: 'Cliente actualizado',
        text: 'Los datos del cliente se han actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      // Recargar lista de clientes
      await cargarClientes();
      
      return response;
    } catch (err) {
      console.error('Error actualizando cliente:', err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo actualizar el cliente',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarClientes]);

  /**
   * Desactivar cliente (soft delete)
   */
  const desactivarCliente = useCallback(async (id) => {
    const result = await Swal.fire({
      title: '¿Desactivar cliente?',
      text: 'El cliente quedará inactivo pero se conservarán sus datos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setError(null);
    try {
      await clientesFacturacionApiService.deactivateCliente(id);
      
      await Swal.fire({
        icon: 'success',
        title: 'Cliente desactivado',
        text: 'El cliente ha sido desactivado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      // Recargar lista de clientes
      await cargarClientes();
    } catch (err) {
      console.error('Error desactivando cliente:', err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo desactivar el cliente',
      });
    } finally {
      setLoading(false);
    }
  }, [cargarClientes]);

  /**
   * Reactivar cliente
   */
  const reactivarCliente = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await clientesFacturacionApiService.reactivateCliente(id);
      
      await Swal.fire({
        icon: 'success',
        title: 'Cliente reactivado',
        text: 'El cliente ha sido reactivado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      // Recargar lista de clientes
      await cargarClientes();
    } catch (err) {
      console.error('Error reactivando cliente:', err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo reactivar el cliente',
      });
    } finally {
      setLoading(false);
    }
  }, [cargarClientes]);

  /**
   * Buscar cliente por documento
   */
  const buscarPorDocumento = useCallback(async (numeroDocumento) => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientesFacturacionApiService.buscarPorDocumento(numeroDocumento);
      if (response) {
        return {
          ...response,
          datos: JSON.parse(response.jsonData)
        };
      }
      return null;
    } catch (err) {
      console.error('Error buscando cliente por documento:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar clientes por nombre (filtrado local)
   */
  const buscarClientes = useCallback((termino) => {
    setSearchTerm(termino);
    
    if (!termino.trim()) {
      setFilteredClientes(clientes);
      return;
    }

    const terminoLower = termino.toLowerCase();
    const filtered = clientes.filter(cliente => {
      const datos = cliente.datos;
      return (
        datos.nombreCompleto?.toLowerCase().includes(terminoLower) ||
        datos.razonSocial?.toLowerCase().includes(terminoLower) ||
        datos.numeroDocumento?.toLowerCase().includes(terminoLower) ||
        datos.email?.toLowerCase().includes(terminoLower)
      );
    });

    setFilteredClientes(filtered);
  }, [clientes]);

  /**
   * Seleccionar cliente
   */
  const seleccionarCliente = useCallback((cliente) => {
    setSelectedCliente(cliente);
  }, []);

  /**
   * Limpiar selección
   */
  const limpiarSeleccion = useCallback(() => {
    setSelectedCliente(null);
  }, []);

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  return {
    // Estado
    clientes: filteredClientes,
    clientesOriginales: clientes,
    loading,
    error,
    searchTerm,
    selectedCliente,

    // Acciones
    cargarClientes,
    crearCliente,
    actualizarCliente,
    desactivarCliente,
    reactivarCliente,
    buscarPorDocumento,
    buscarClientes,
    seleccionarCliente,
    limpiarSeleccion,
  };
};
