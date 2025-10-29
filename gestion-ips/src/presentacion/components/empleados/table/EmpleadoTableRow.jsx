import React from 'react';
import { parseEmpleadoData } from '../../../../negocio/utils/empleados/empleadoParser.js';
import EmpleadosTableActions from './EmpleadosTableActions.jsx';

/**
 * Componente de fila de la tabla de empleados
 * Capa de presentación
 */
const EmpleadoTableRow = ({ 
  empleado, 
  userCheckCache, 
  checkingUsers,
  onView, 
  onEdit, 
  onCreateUser, 
  onDeactivate 
}) => {
  const parsed = parseEmpleadoData(empleado);
  const { numeroDocumento, tipoDocumento, informacionPersonal, informacionContacto, informacionLaboral } = parsed;

  const hasUser = userCheckCache[empleado.id];
  const isChecking = checkingUsers.has(empleado.id);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {numeroDocumento || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {informacionPersonal.primerNombre || ''} {informacionPersonal.primerApellido || ''}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {informacionLaboral.cargo || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {informacionContacto.telefono || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          empleado.activo
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {empleado.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <EmpleadosTableActions
          empleado={empleado}
          hasUser={hasUser}
          isChecking={isChecking}
          onView={onView}
          onEdit={onEdit}
          onCreateUser={onCreateUser}
          onDeactivate={onDeactivate}
        />
      </td>
    </tr>
  );
};

export default EmpleadoTableRow;
