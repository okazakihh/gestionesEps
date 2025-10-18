import { useState, useEffect } from 'react';
import { filterCitas as filterCitasUtil } from '../utils/citaUtils';

/**
 * Hook para filtrado de citas
 */
export const useCitasFilters = (citas, initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [filteredCitas, setFilteredCitas] = useState([]);

  useEffect(() => {
    const filtered = filterCitasUtil(citas, filters);
    setFilteredCitas(filtered);
  }, [citas, filters]);

  const updateFilter = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    filteredCitas,
    updateFilter,
    setFilters,
    resetFilters
  };
};
