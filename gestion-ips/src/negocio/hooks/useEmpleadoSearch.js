import { useState, useEffect } from 'react';
import { filterEmpleados as filterEmpleadosUtil } from '../utils/empleadoUtils';

/**
 * Hook para búsqueda y filtrado de empleados
 */
export const useEmpleadoSearch = (empleados) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);

  useEffect(() => {
    setFilteredEmpleados(filterEmpleadosUtil(empleados, searchTerm));
  }, [empleados, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

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
