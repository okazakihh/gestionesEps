import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PacienteDTO, PacienteSearchParams } from '../../types/pacientes';
import { pacientesApiService } from '../../services/pacientesApiService';
import ServiceAlert from '../ui/ServiceAlert';
import { Modal, Button, TextInput, Group, Text, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';

const GestionPacientesComponent: React.FC = () => {
  const [pacientes, setPacientes] = useState<PacienteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<PacienteSearchParams>({
    page: 0,
    size: 10
  });

  // Estados para el modal de creación de paciente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pacienteToEdit, setPacienteToEdit] = useState<PacienteDTO | null>(null);

  // Estados para el formulario de paciente
  const [formData, setFormData] = useState({
    numeroDocumento: '',
    tipoDocumento: 'CC',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    genero: 'M',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    alergias: '',
    medicamentosActuales: '',
    observacionesMedicas: '',
    nombreContactoEmergencia: '',
    telefonoContactoEmergencia: ''
  });

  useEffect(() => {
    loadPacientes();
  }, [searchParams]);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await pacientesApiService.getPacientes(searchParams);
      setPacientes(response.content || []);
    } catch (err) {
      const error = err as any;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de pacientes. Verifique que el servidor esté ejecutándose.');
      } else if (error.name === 'JWT_CONFIG_ERROR') {
        setConnectionError(true);
        setError('Error de configuración del servicio. Los tokens JWT no son válidos. Contacte al administrador del sistema.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      search: value || undefined
    }));
  };

  const handleRetry = () => {
    loadPacientes();
  };

  const handleOpenCreateModal = () => {
    setFormData({
      numeroDocumento: '',
      tipoDocumento: 'CC',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      fechaNacimiento: '',
      genero: 'M',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      alergias: '',
      medicamentosActuales: '',
      observacionesMedicas: '',
      nombreContactoEmergencia: '',
      telefonoContactoEmergencia: ''
    });
    setIsEditMode(false);
    setPacienteToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setPacienteToEdit(null);
  };

  const handleCreatePaciente = async () => {
    try {
      setLoading(true);

      const pacienteData = {
        numeroDocumento: formData.numeroDocumento,
        tipoDocumento: formData.tipoDocumento,
        informacionPersonal: {
          primerNombre: formData.primerNombre,
          segundoNombre: formData.segundoNombre,
          primerApellido: formData.primerApellido,
          segundoApellido: formData.segundoApellido,
          fechaNacimiento: formData.fechaNacimiento,
          genero: formData.genero,
          estadoCivil: 'SOLTERO'
        },
        informacionContacto: {
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          departamento: formData.departamento
        },
        informacionMedica: {
          alergias: formData.alergias,
          medicamentosActuales: formData.medicamentosActuales,
          observacionesMedicas: formData.observacionesMedicas
        },
        contactoEmergencia: {
          nombreContacto: formData.nombreContactoEmergencia,
          telefonoContacto: formData.telefonoContactoEmergencia,
          relacion: 'FAMILIAR'
        },
        activo: true
      };

      await pacientesApiService.createPaciente(pacienteData);

      notifications.show({
        title: '¡Paciente creado!',
        message: 'El paciente ha sido registrado correctamente',
        color: 'green',
        autoClose: 5000,
      });

      setIsModalOpen(false);
      await loadPacientes();

    } catch (error: any) {
      console.error('Error al crear paciente:', error);
      notifications.show({
        title: 'Error al crear paciente',
        message: error.message || 'Ha ocurrido un error inesperado',
        color: 'red',
        autoClose: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h2>
          <p className="mt-1 text-sm text-gray-600">Administra la información de los pacientes del sistema</p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nuevo Paciente
        </Button>
      </div>

      {/* Service Alert */}
      {connectionError && (
        <ServiceAlert
          type="error"
          title="Error de Conexión"
          message={error || "No se pudo conectar con el servicio de pacientes. Verifique que el servidor esté ejecutándose en el puerto 8082."}
          onRetry={handleRetry}
          retryLabel="Reintentar Conexión"
        />
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por número de documento..."
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando pacientes...</p>
            </div>
          ) : (
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
                      Edad
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
                  {pacientes.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {paciente.numeroDocumento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paciente.informacionPersonal?.primerNombre} {paciente.informacionPersonal?.primerApellido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {paciente.edad || 'N/A'} años
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {paciente.informacionContacto?.telefono || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          paciente.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {paciente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/pacientes/${paciente.id}/editar`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </Link>
                        <button className="text-gray-600 hover:text-gray-900">
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pacientes.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron pacientes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Creación de Paciente */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title="Registrar Nuevo Paciente"
        size="xl"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Número de Documento"
            placeholder="Ingrese el número de documento"
            value={formData.numeroDocumento}
            onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
            required
          />

          <Group grow>
            <TextInput
              label="Primer Nombre"
              placeholder="Primer nombre"
              value={formData.primerNombre}
              onChange={(e) => setFormData({...formData, primerNombre: e.target.value})}
              required
            />
            <TextInput
              label="Segundo Nombre"
              placeholder="Segundo nombre (opcional)"
              value={formData.segundoNombre}
              onChange={(e) => setFormData({...formData, segundoNombre: e.target.value})}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Primer Apellido"
              placeholder="Primer apellido"
              value={formData.primerApellido}
              onChange={(e) => setFormData({...formData, primerApellido: e.target.value})}
              required
            />
            <TextInput
              label="Segundo Apellido"
              placeholder="Segundo apellido (opcional)"
              value={formData.segundoApellido}
              onChange={(e) => setFormData({...formData, segundoApellido: e.target.value})}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
              required
            />
            <TextInput
              label="Teléfono"
              placeholder="Número de teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              required
            />
          </Group>

          <TextInput
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <Group grow>
            <TextInput
              label="Dirección"
              placeholder="Dirección completa"
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
            />
            <TextInput
              label="Ciudad"
              placeholder="Ciudad"
              value={formData.ciudad}
              onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
            />
          </Group>

          <TextInput
            label="Departamento"
            placeholder="Departamento"
            value={formData.departamento}
            onChange={(e) => setFormData({...formData, departamento: e.target.value})}
          />

          <TextInput
            label="Alergias"
            placeholder="Alergias conocidas (opcional)"
            value={formData.alergias}
            onChange={(e) => setFormData({...formData, alergias: e.target.value})}
          />

          <TextInput
            label="Medicamentos Actuales"
            placeholder="Medicamentos que toma actualmente (opcional)"
            value={formData.medicamentosActuales}
            onChange={(e) => setFormData({...formData, medicamentosActuales: e.target.value})}
          />

          <TextInput
            label="Observaciones Médicas"
            placeholder="Observaciones médicas adicionales (opcional)"
            value={formData.observacionesMedicas}
            onChange={(e) => setFormData({...formData, observacionesMedicas: e.target.value})}
          />

          <Group grow>
            <TextInput
              label="Nombre Contacto de Emergencia"
              placeholder="Nombre del contacto"
              value={formData.nombreContactoEmergencia}
              onChange={(e) => setFormData({...formData, nombreContactoEmergencia: e.target.value})}
            />
            <TextInput
              label="Teléfono Contacto de Emergencia"
              placeholder="Teléfono del contacto"
              value={formData.telefonoContactoEmergencia}
              onChange={(e) => setFormData({...formData, telefonoContactoEmergencia: e.target.value})}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              color="blue"
              onClick={handleCreatePaciente}
              loading={loading}
              disabled={!formData.numeroDocumento || !formData.primerNombre || !formData.primerApellido || !formData.fechaNacimiento || !formData.telefono}
            >
              Crear Paciente
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default GestionPacientesComponent;