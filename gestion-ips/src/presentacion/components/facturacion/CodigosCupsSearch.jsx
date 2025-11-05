import React from 'react';
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

/**
 * CodigosCupsSearch.jsx
 * 
 * Componente de barra de búsqueda para códigos CUPS
 * La búsqueda es automática y filtra en el frontend
 * 
 * Props:
 * - searchTerm: valor actual del término de búsqueda
 * - onSearchChange: función para cambiar el término de búsqueda
 * - totalCount: total de códigos disponibles
 * - filteredCount: total de códigos después de filtrar
 * 
 * Capa: Presentación
 */

const CodigosCupsSearch = ({
  searchTerm = '',
  onSearchChange,
  totalCount = 0,
  filteredCount = 0
}) => {
  return (
    <div>
      <TextInput
        placeholder="Buscar por código o nombre..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        size="md"
        description={`Mostrando ${filteredCount} de ${totalCount} códigos CUPS`}
      />
    </div>
  );
};

export default CodigosCupsSearch;
