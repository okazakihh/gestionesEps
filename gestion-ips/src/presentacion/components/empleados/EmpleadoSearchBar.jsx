import React from 'react';
import { TextInput, Button, Group } from '@mantine/core';

/**
 * Barra de búsqueda para empleados
 */
const EmpleadoSearchBar = ({ searchTerm, onSearch, onClear, resultCount, totalCount }) => {
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
        {resultCount} de {totalCount} empleado{totalCount !== 1 ? 's' : ''} {searchTerm ? 'encontrado' : 'mostrado'}{resultCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default EmpleadoSearchBar;
