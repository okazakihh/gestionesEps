import React from 'react';
import EmpleadoTableRow from './EmpleadoTableRow.jsx';

/**
 * Componente de tabla de empleados
 * Capa de presentación
 */
const EmpleadosTable = ({ 
  empleados, 
  loading,
  userCheckCache,
  checkingUsers,
  onView, 
  onEdit, 
  onCreateUser, 
  onDeactivate,
  searchTerm 
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Cargando empleados...</p>
      </div>
    );
  }

  if (empleados.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {searchTerm ? `No se encontraron empleados que coincidan con "${searchTerm}"` : 'No hay empleados registrados'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cargo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {empleados.map((empleado) => (
            <EmpleadoTableRow
              key={empleado.id}
              empleado={empleado}
              userCheckCache={userCheckCache}
              checkingUsers={checkingUsers}
              onView={onView}
              onEdit={onEdit}
              onCreateUser={onCreateUser}
              onDeactivate={onDeactivate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmpleadosTable;
