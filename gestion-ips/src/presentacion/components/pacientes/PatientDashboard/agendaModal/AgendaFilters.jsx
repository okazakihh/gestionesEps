import React from 'react';
import { ESTADO_CITA_OPTIONS } from '/src/negocio/utils/listHelps.js';

/**
 * Componente para los filtros de la agenda
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Estado de los filtros
 * @param {Function} props.setFilters - Función para actualizar filtros
 * @param {Function} props.clearFilters - Función para limpiar filtros
 * @returns {JSX.Element} Sección de filtros
 */
const AgendaFilters = ({ filters, setFilters, clearFilters }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Desde
          </label>
          <input
            type="date"
            id="fechaInicio"
            value={filters.fechaInicio}
            onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Hasta
          </label>
          <input
            type="date"
            id="fechaFin"
            value={filters.fechaFin}
            onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="estado"
            value={filters.estado}
            onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            {ESTADO_CITA_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="paciente" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Paciente
          </label>
          <input
            type="text"
            id="paciente"
            value={filters.paciente}
            onChange={(e) => setFilters(prev => ({ ...prev, paciente: e.target.value }))}
            placeholder="Nombre, documento o teléfono..."
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1 flex items-end">
          <button
            onClick={clearFilters}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgendaFilters;