import { useState, useEffect } from 'react';
import { getEmpleadoSearchableData } from '../../utils/empleados/empleadoParser.js';

/**
 * Hook para manejar búsqueda y filtrado de empleados
 * Capa de negocio - No contiene JSX
 */
export const useEmpleadoSearch = (empleados) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);

  // Filtrar empleados cuando cambia el término de búsqueda o la lista
  useEffect(() => {
    if (!empleados || empleados.length === 0) {
      setFilteredEmpleados([]);
      return;
    }
    
    if (!searchTerm.trim()) {
      setFilteredEmpleados(empleados);
    } else {
      const filtered = empleados.filter(empleado => {
        const searchData = getEmpleadoSearchableData(empleado);
        const searchLower = searchTerm.toLowerCase();
        
        return (
          searchData.numeroDocumento.toLowerCase().includes(searchLower) ||
          searchData.primerNombre.toLowerCase().includes(searchLower) ||
          searchData.primerApellido.toLowerCase().includes(searchLower) ||
          searchData.cargo.toLowerCase().includes(searchLower) ||
          searchData.telefono.toLowerCase().includes(searchLower) ||
          searchData.email.toLowerCase().includes(searchLower)
        );
      });
      setFilteredEmpleados(filtered);
    }
  }, [empleados, searchTerm]);

  // Manejar cambio de búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    filteredEmpleados,
    handleSearch,
    clearSearch
  };
};

export default useEmpleadoSearch;
