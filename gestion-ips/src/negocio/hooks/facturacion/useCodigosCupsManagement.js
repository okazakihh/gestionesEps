// hooks/facturacion/useCodigosCupsManagement.js
import { useState, useEffect, useCallback } from 'react';
import { codigosCupsApiService } from '../../../data/services/pacientesApiService.js';
import Swal from 'sweetalert2';

/**
 * Custom hook para gestionar códigos CUPS
 * Maneja búsqueda, paginación y actualización de valores
 */
export const useCodigosCupsManagement = () => {
  // Estados para códigos CUPS
  const [codigosCups, setCodigosCups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  // Estados para modal de valor
  const [isValorModalOpen, setIsValorModalOpen] = useState(false);
  const [selectedCodigoCups, setSelectedCodigoCups] = useState(null);
  const [valorInput, setValorInput] = useState('');

  /**
   * Carga los códigos CUPS con paginación y búsqueda
   */
  const loadCodigosCups = useCallback(async (page = 0, search = '') => {
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

      // Verificar formato de respuesta
      if (response && response.content !== undefined) {
        // Respuesta directa del backend
        setCodigosCups(response.content || []);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(page);
      } else if (response && response.success) {
        // Respuesta con wrapper de success
        setCodigosCups(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(page);
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
      setLoading(false);
    }
  }, []);

  /**
   * Maneja la búsqueda de códigos CUPS
   */
  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();
    loadCodigosCups(0, searchTerm);
  }, [searchTerm, loadCodigosCups]);

  /**
   * Maneja el cambio de página
   */
  const handlePageChange = useCallback((page) => {
    loadCodigosCups(page, searchTerm);
  }, [searchTerm, loadCodigosCups]);

  /**
   * Actualiza el término de búsqueda
   */
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  /**
   * Abre el modal para editar el valor de un código CUPS
   */
  const handleOpenValorModal = useCallback((codigoCups) => {
    setSelectedCodigoCups(codigoCups);
    
    // Extraer valor actual del JSON si existe
    try {
      const datosJson = JSON.parse(codigoCups.datosJson || '{}');
      setValorInput(datosJson.valor || '');
    } catch (error) {
      setValorInput('');
    }
    setIsValorModalOpen(true);
  }, []);

  /**
   * Cierra el modal de valor
   */
  const handleCloseValorModal = useCallback(() => {
    setIsValorModalOpen(false);
    setSelectedCodigoCups(null);
    setValorInput('');
  }, []);

  /**
   * Actualiza el valor de entrada
   */
  const updateValorInput = useCallback((value) => {
    setValorInput(value);
  }, []);

  /**
   * Guarda el nuevo valor del código CUPS
   */
  const handleSaveValor = useCallback(async () => {
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
        text: 'No se pudo actualizar el valor del código CUPS. Por favor, inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  }, [selectedCodigoCups, valorInput, currentPage, searchTerm, loadCodigosCups, handleCloseValorModal]);

  // Cargar códigos CUPS al montar el componente
  useEffect(() => {
    loadCodigosCups();
  }, [loadCodigosCups]);

  return {
    // Estados
    codigosCups,
    loading,
    searchTerm,
    currentPage,
    totalPages,
    pageSize,
    
    // Estados del modal
    isValorModalOpen,
    selectedCodigoCups,
    valorInput,
    
    // Funciones
    loadCodigosCups,
    handleSearch,
    handlePageChange,
    updateSearchTerm,
    handleOpenValorModal,
    handleCloseValorModal,
    updateValorInput,
    handleSaveValor
  };
};

export default useCodigosCupsManagement;
