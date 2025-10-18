import React from 'react';
import { Modal, Stack, Button, Group } from '@mantine/core';
import { 
  parseEmpleadoData, 
  getNombreCompleto,
  getTipoPersonalLabel,
  getTipoMedicoLabel
} from '../../../negocio/utils/empleadoUtils';

/**
 * Modal para visualizar detalles del empleado
 */
const EmpleadoViewModal = ({ opened, onClose, empleado }) => {
  if (!empleado) return null;

  const {
    numeroDocumento,
    tipoDocumento,
    informacionPersonal,
    informacionContacto,
    informacionLaboral
  } = parseEmpleadoData(empleado.jsonData);

  const nombreCompleto = getNombreCompleto(informacionPersonal);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Información del Empleado"
      size="xl"
      centered
    >
      <Stack gap="lg">
        {/* Información Personal */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Documento:</span>
              <p className="text-sm text-gray-900">{numeroDocumento} ({tipoDocumento})</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Nombre Completo:</span>
              <p className="text-sm text-gray-900">{nombreCompleto || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha de Nacimiento:</span>
              <p className="text-sm text-gray-900">{informacionPersonal.fechaNacimiento || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Género:</span>
              <p className="text-sm text-gray-900">{informacionPersonal.genero || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Teléfono:</span>
              <p className="text-sm text-gray-900">{informacionContacto.telefono || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <p className="text-sm text-gray-900">{informacionContacto.email || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">Dirección:</span>
              <p className="text-sm text-gray-900">{informacionContacto.direccion || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Ciudad:</span>
              <p className="text-sm text-gray-900">{informacionContacto.ciudad || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Departamento:</span>
              <p className="text-sm text-gray-900">{informacionContacto.departamento || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Información Laboral */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">Información Laboral</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Tipo de Personal:</span>
              <p className="text-sm text-gray-900">{getTipoPersonalLabel(informacionLaboral.tipoPersonal)}</p>
            </div>
            {informacionLaboral.tipoPersonal === 'MEDICO' && (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-600">Tipo de Médico:</span>
                  <p className="text-sm text-gray-900">{getTipoMedicoLabel(informacionLaboral.tipoMedico)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Especialidad:</span>
                  <p className="text-sm text-gray-900">{informacionLaboral.especialidad || 'N/A'}</p>
                </div>
              </>
            )}
            {informacionLaboral.tipoPersonal === 'ADMINISTRATIVO' && (
              <div>
                <span className="text-sm font-medium text-gray-600">Dependencia:</span>
                <p className="text-sm text-gray-900">{informacionLaboral.dependencia || 'N/A'}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-600">Cargo:</span>
              <p className="text-sm text-gray-900">{informacionLaboral.cargo || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Salario:</span>
              <p className="text-sm text-gray-900">{informacionLaboral.salario ? `$${informacionLaboral.salario}` : 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha de Contratación:</span>
              <p className="text-sm text-gray-900">{informacionLaboral.fechaContratacion || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Tipo de Contrato:</span>
              <p className="text-sm text-gray-900">{informacionLaboral.tipoContrato || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Estado del Empleado */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado del Empleado</h3>
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Estado:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                empleado.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {empleado.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha de Registro:</span>
              <span className="text-sm text-gray-900 ml-2">{empleado.fechaCreacion || 'N/A'}</span>
            </div>
          </div>
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EmpleadoViewModal;
