import React from 'react';
import { TextInput, Button } from '@mantine/core';

/**
 * Componente de barra de búsqueda para empleados
 * Capa de presentación
 */
const EmpleadosSearchBar = ({ searchTerm, onSearch, onClear, totalEmpleados, filteredCount }) => {
  return (
    <div className="mb-6">
      <div className="max-w-md">
        <TextInput
          placeholder="Buscar por documento, nombres, cargo, teléfono o email..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          leftSection={
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          rightSection={
            searchTerm && (
              <Button
                variant="subtle"
                size="xs"
                onClick={onClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )
          }
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {filteredCount} de {totalEmpleados} empleado{totalEmpleados !== 1 ? 's' : ''} {searchTerm ? 'encontrado' : 'mostrado'}{filteredCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default EmpleadosSearchBar;
