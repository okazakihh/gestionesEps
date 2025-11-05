// hooks/facturacion/useCodigosCupsManagement.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { codigosCupsApiService } from '../../../data/services/pacientesApiService.js';
import Swal from 'sweetalert2';

/**
 * Custom hook para gestionar códigos CUPS
 * Carga todos los códigos al inicio y filtra en el frontend
 */
export const useCodigosCupsManagement = () => {
  // Estados para códigos CUPS
  const [allCodigosCups, setAllCodigosCups] = useState([]); // Todos los códigos cargados
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // Estados para modal de valor
  const [isValorModalOpen, setIsValorModalOpen] = useState(false);
  const [selectedCodigoCups, setSelectedCodigoCups] = useState(null);
  const [valorInput, setValorInput] = useState('');

  /**
   * Carga TODOS los códigos CUPS una sola vez
   */
  const loadAllCodigosCups = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar todos los códigos sin paginación
      const response = await codigosCupsApiService.getCodigosCups({
        page: 0,
        size: 10000 // Número suficientemente grande para obtener todos
      });

      console.log('Response completa:', response);

      // Verificar formato de respuesta
      if (response && response.content !== undefined) {
        console.log('Códigos CUPS cargados:', response.content);
        console.log('Primer código ejemplo:', response.content[0]);
        setAllCodigosCups(response.content || []);
      } else if (response && response.success) {
        console.log('Códigos CUPS cargados (con success):', response.data.content);
        console.log('Primer código ejemplo:', response.data.content[0]);
        setAllCodigosCups(response.data.content || []);
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
      setAllCodigosCups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filtra los códigos CUPS en el frontend basándose en el término de búsqueda
   */
  const filteredCodigosCups = useMemo(() => {
    console.log('Filtrando códigos. Total:', allCodigosCups.length, 'Término:', searchTerm);
    
    if (!searchTerm.trim()) {
      return allCodigosCups;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    
    const filtered = allCodigosCups.filter(codigo => {
      // Buscar en código (soportando ambos nombres de campo)
      const codigoField = codigo.codigo || codigo.codigoCup || codigo.cup || '';
      const codigoMatch = codigoField.toLowerCase().includes(searchLower);
      
      // Buscar en nombre (soportando ambos nombres de campo)
      const nombreField = codigo.nombre || codigo.nombreCup || codigo.descripcion || '';
      const nombreMatch = nombreField.toLowerCase().includes(searchLower);
      
      return codigoMatch || nombreMatch;
    });
    
    console.log('Códigos filtrados:', filtered.length);
    return filtered;
  }, [allCodigosCups, searchTerm]);

  /**
   * Códigos CUPS paginados para mostrar
   */
  const paginatedCodigosCups = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCodigosCups.slice(startIndex, endIndex);
  }, [filteredCodigosCups, currentPage, pageSize]);

  /**
   * Calcula el número total de páginas
   */
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCodigosCups.length / pageSize);
  }, [filteredCodigosCups.length, pageSize]);

  /**
   * Maneja la búsqueda (ya no hace petición al backend)
   */
  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();
    // Resetear a la primera página cuando se busca
    setCurrentPage(0);
  }, []);

  /**
   * Maneja el cambio de página
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  /**
   * Actualiza el término de búsqueda
   */
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
    // Resetear a la primera página cuando cambia el término
    setCurrentPage(0);
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

      // Recargar todos los códigos para reflejar el cambio
      await loadAllCodigosCups();

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
  }, [selectedCodigoCups, valorInput, loadAllCodigosCups, handleCloseValorModal]);

  // Cargar todos los códigos CUPS al montar el componente
  useEffect(() => {
    loadAllCodigosCups();
  }, [loadAllCodigosCups]);

  return {
    // Estados
    codigosCups: paginatedCodigosCups, // Códigos paginados para mostrar
    loading,
    searchTerm,
    currentPage,
    totalPages,
    pageSize,
    
    // Información adicional
    totalCodigosCups: allCodigosCups.length,
    filteredCount: filteredCodigosCups.length,
    
    // Estados del modal
    isValorModalOpen,
    selectedCodigoCups,
    valorInput,
    
    // Funciones
    handleSearch,
    handlePageChange,
    updateSearchTerm,
    handleOpenValorModal,
    handleCloseValorModal,
    updateValorInput,
    handleSaveValor,
    reloadCodigosCups: loadAllCodigosCups
  };
};

export default useCodigosCupsManagement;
