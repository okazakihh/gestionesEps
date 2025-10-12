import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PacienteDTO, PacienteSearchParams } from '../../types/pacientes.js';
import { pacientesApiService } from '../../services/pacientesApiService.js';
import { useClinicalHistory } from '../../context/ClinicalHistoryContext.jsx';
import ServiceAlert from '../ui/ServiceAlert.jsx';
import { Modal, Button, TextInput, Select, Group, Text, Stack, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Swal from 'sweetalert2';

const GestionPacientesComponent = () => {
  const navigate = useNavigate();
  const { loadPatientData } = useClinicalHistory();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });

  // Estados para los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pacienteToView, setPacienteToView] = useState(null);
  const [pacienteToEdit, setPacienteToEdit] = useState(null);

  // Estados para el formulario de paciente
  const [formData, setFormData] = useState({
    numeroDocumento: '',
    tipoDocumento: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    pais: '',
    eps: '',
    tipoSeguro: '',
    alergias: '',
    medicamentosActuales: '',
    observacionesMedicas: '',
    nombreContactoEmergencia: '',
    telefonoContactoEmergencia: '',
    relacionContactoEmergencia: 'FAMILIAR'
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
      const error = err;
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

  const handleSearch = (value) => {
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
      genero: 'MASCULINO',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      pais: 'Colombia',
      eps: '',
      tipoSeguro: 'CONTRIBUTIVO',
      alergias: '',
      medicamentosActuales: '',
      observacionesMedicas: '',
      nombreContactoEmergencia: '',
      telefonoContactoEmergencia: '',
      relacionContactoEmergencia: 'FAMILIAR'
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenViewModal = async (paciente) => {
    try {
      setLoading(true);
      const pacienteData = await pacientesApiService.getPacienteById(paciente.id);
      setPacienteToView(pacienteData);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error al cargar paciente para ver:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Cargar Paciente',
        text: 'No se pudo cargar la información del paciente.',
        confirmButtonColor: '#EF4444',
        footer: 'Verifica que el paciente exista y que tengas permisos para editarlo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = async (paciente) => {
    try {
      setLoading(true);
      const pacienteData = await pacientesApiService.getPacienteById(paciente.id);

      console.log('📝 Edit Modal - Datos del paciente:', pacienteData);

      // Parsear el JSON crudo del paciente
      let datosCompletos = {};
      let informacionPersonal = {};
      let informacionContacto = {};
      let informacionMedica = {};
      let contactoEmergencia = {};

      try {
        // Parsear el JSON crudo de la BD
        datosCompletos = JSON.parse(pacienteData.datosJson || '{}');
        console.log('📝 Edit Modal - Datos completos:', datosCompletos);

        // Extraer el JSON interno que contiene la información real
        if (datosCompletos.datosJson) {
          const datosInternos = JSON.parse(datosCompletos.datosJson);
          informacionPersonal = datosInternos.informacionPersonal || {};
          informacionContacto = datosInternos.informacionContacto || {};
          informacionMedica = datosInternos.informacionMedica || {};
          contactoEmergencia = datosInternos.contactoEmergencia || {};
        }
      } catch (error) {
        console.error('Error parsing paciente datosJson for edit:', error);
      }

      console.log('🔍 Edit Modal - Parsed data:');
      console.log('  - informacionPersonal:', informacionPersonal);
      console.log('  - informacionContacto:', informacionContacto);
      console.log('  - informacionMedica:', informacionMedica);
      console.log('  - contactoEmergencia:', contactoEmergencia);

      // Convertir los datos anidados a formato plano para el formulario
      setFormData({
        numeroDocumento: pacienteData.numeroDocumento,
        tipoDocumento: pacienteData.tipoDocumento,
        primerNombre: informacionPersonal.primerNombre || '',
        segundoNombre: informacionPersonal.segundoNombre || '',
        primerApellido: informacionPersonal.primerApellido || '',
        segundoApellido: informacionPersonal.segundoApellido || '',
        fechaNacimiento: informacionPersonal.fechaNacimiento || '',
        genero: informacionPersonal.genero || 'MASCULINO',
        telefono: informacionContacto.telefono || '',
        email: informacionContacto.email || '',
        direccion: informacionContacto.direccion || '',
        ciudad: informacionContacto.ciudad || '',
        departamento: informacionContacto.departamento || '',
        pais: informacionContacto.pais || 'Colombia',
        eps: informacionMedica.eps || '',
        tipoSeguro: informacionMedica.tipoSeguro || 'CONTRIBUTIVO',
        alergias: informacionMedica.alergias || '',
        medicamentosActuales: informacionMedica.medicamentosActuales || '',
        observacionesMedicas: informacionMedica.observacionesMedicas || '',
        nombreContactoEmergencia: contactoEmergencia.nombreContacto || '',
        telefonoContactoEmergencia: contactoEmergencia.telefonoContacto || '',
        relacionContactoEmergencia: contactoEmergencia.relacion || 'FAMILIAR'
      });
      setPacienteToEdit(pacienteData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error al cargar paciente para editar:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Cargar Paciente',
        text: 'No se pudo cargar la información del paciente.',
        confirmButtonColor: '#EF4444',
        footer: 'Verifica que el paciente exista y que tengas permisos para verlo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setPacienteToView(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setPacienteToEdit(null);
  };

  const handleOpenHistoriaClinica = async (paciente) => {
    try {
      setLoading(true);
      // Cargar datos del paciente en el contexto
      await loadPatientData(paciente.id);
      // Navegar al submodulo de historias clínicas con el ID del paciente
      navigate(`/pacientes/historias?pacienteId=${paciente.id}`);
    } catch (error) {
      console.error('Error cargando datos del paciente:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Cargar Historia Clínica',
        text: 'No se pudo cargar la información del paciente para la historia clínica.',
        confirmButtonColor: '#EF4444',
        footer: 'Verifica que el paciente tenga una historia clínica activa.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaciente = async () => {
    try {
      setLoading(true);

      // Crear JSON interno con la información del paciente
      const datosInternosJson = JSON.stringify({
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
          departamento: formData.departamento,
          pais: formData.pais
        },
        informacionMedica: {
          eps: formData.eps,
          tipoSeguro: formData.tipoSeguro,
          alergias: formData.alergias,
          medicamentosActuales: formData.medicamentosActuales,
          observacionesMedicas: formData.observacionesMedicas
        },
        contactoEmergencia: {
          nombreContacto: formData.nombreContactoEmergencia,
          telefonoContacto: formData.telefonoContactoEmergencia,
          relacion: formData.relacionContactoEmergencia
        }
      });

      // Crear el JSON completo que espera el backend
      const datosCompletosJson = JSON.stringify({
        numeroDocumento: formData.numeroDocumento,
        tipoDocumento: formData.tipoDocumento,
        datosJson: datosInternosJson,
        activo: true
      });

      console.log('📤 Enviando datosJson completo para creación:', datosCompletosJson);

      await pacientesApiService.createPaciente(datosCompletosJson);

      await Swal.fire({
        icon: 'success',
        title: '¡Paciente Creado!',
        text: 'El paciente ha sido registrado correctamente.',
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      setIsCreateModalOpen(false);
      await loadPacientes();

    } catch (error) {
      console.error('Error al crear paciente:', error);
      console.error('Detalles del error:', error.response?.data);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Paciente',
        text: error.message || error.response?.data?.error || 'Ha ocurrido un error inesperado.',
        confirmButtonColor: '#EF4444',
        footer: 'Verifica que todos los campos requeridos estén completos y que el documento no esté duplicado.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaciente = async () => {
    try {
      setLoading(true);

      // Parsear datos JSON existentes para mantener estadoCivil
      let existingData = {};
      try {
        const datosCompletos = JSON.parse(pacienteToEdit.datosJson || '{}');
        if (datosCompletos.datosJson) {
          existingData = JSON.parse(datosCompletos.datosJson);
        }
      } catch (error) {
        console.error('Error parsing existing paciente JSON:', error);
      }

      // Crear JSON interno con la información del paciente
      const datosInternosJson = JSON.stringify({
        informacionPersonal: {
          primerNombre: formData.primerNombre,
          segundoNombre: formData.segundoNombre,
          primerApellido: formData.primerApellido,
          segundoApellido: formData.segundoApellido,
          fechaNacimiento: formData.fechaNacimiento,
          genero: formData.genero,
          estadoCivil: existingData.informacionPersonal?.estadoCivil || 'SOLTERO'
        },
        informacionContacto: {
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          departamento: formData.departamento,
          pais: formData.pais
        },
        informacionMedica: {
          eps: formData.eps,
          tipoSeguro: formData.tipoSeguro,
          alergias: formData.alergias,
          medicamentosActuales: formData.medicamentosActuales,
          observacionesMedicas: formData.observacionesMedicas
        },
        contactoEmergencia: {
          nombreContacto: formData.nombreContactoEmergencia,
          telefonoContacto: formData.telefonoContactoEmergencia,
          relacion: formData.relacionContactoEmergencia
        }
      });

      // Crear el JSON completo que espera el backend
      const datosCompletosJson = JSON.stringify({
        numeroDocumento: formData.numeroDocumento,
        tipoDocumento: formData.tipoDocumento,
        datosJson: datosInternosJson,
        activo: pacienteToEdit?.activo ?? true
      });

      console.log('📤 Enviando datosJson completo para actualización:', datosCompletosJson);

      await pacientesApiService.updatePaciente(pacienteToEdit.id, {
        numeroDocumento: formData.numeroDocumento,
        tipoDocumento: formData.tipoDocumento,
        datosJson: datosCompletosJson,
        activo: pacienteToEdit?.activo ?? true
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Paciente Actualizado!',
        text: 'Los datos del paciente han sido actualizados correctamente.',
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      setIsEditModalOpen(false);
      setPacienteToEdit(null);
      await loadPacientes();

    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      console.error('Detalles del error:', error.response?.data);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Actualizar Paciente',
        text: error.message || error.response?.data?.error || 'Ha ocurrido un error inesperado.',
        confirmButtonColor: '#EF4444',
        footer: 'Verifica que todos los campos requeridos estén completos.'
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
          leftSection={<span>+</span>}
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
                  {pacientes.map((paciente) => {
                     // Parsear el JSON crudo del paciente
                     let informacionPersonal = {};
                     let informacionContacto = {};
                     let edad = 'N/A';
                     try {
                       const datosCompletos = JSON.parse(paciente.datosJson || '{}');
                       if (datosCompletos.datosJson) {
                         const datosInternos = JSON.parse(datosCompletos.datosJson);
                         informacionPersonal = datosInternos.informacionPersonal || {};
                         informacionContacto = datosInternos.informacionContacto || {};

                         // Calcular edad
                         if (informacionPersonal.fechaNacimiento) {
                           const fechaNacimiento = new Date(informacionPersonal.fechaNacimiento);
                           const hoy = new Date();
                           let edadCalculada = hoy.getFullYear() - fechaNacimiento.getFullYear();
                           const mesDiff = hoy.getMonth() - fechaNacimiento.getMonth();
                           if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                             edadCalculada--;
                           }
                           edad = `${edadCalculada} años`;
                         }
                       }
                     } catch (error) {
                       console.error('Error parsing paciente datosJson for table:', error);
                     }

                    return (
                      <tr key={paciente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {paciente.numeroDocumento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {informacionPersonal.primerNombre || ''} {informacionPersonal.primerApellido || ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {edad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {informacionContacto.telefono || 'N/A'}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="gray"
                              size="sm"
                              onClick={() => handleOpenViewModal(paciente)}
                              title="Ver paciente"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() => handleOpenEditModal(paciente)}
                              title="Editar paciente"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="green"
                              size="sm"
                              onClick={() => handleOpenHistoriaClinica(paciente)}
                              title="Historia clínica"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </ActionIcon>
                          </Group>
                        </td>
                      </tr>
                    );
                  })}
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
        opened={isCreateModalOpen}
        onClose={handleCloseCreateModal}
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
            <Select
              label="Género"
              data={[
                { value: 'MASCULINO', label: 'Masculino' },
                { value: 'FEMENINO', label: 'Femenino' },
                { value: 'OTRO', label: 'Otro' }
              ]}
              value={formData.genero}
              onChange={(value) => setFormData({...formData, genero: value})}
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

          <Group grow>
            <TextInput
              label="Departamento"
              placeholder="Departamento"
              value={formData.departamento}
              onChange={(e) => setFormData({...formData, departamento: e.target.value})}
            />
            <TextInput
              label="País"
              placeholder="País"
              value={formData.pais}
              onChange={(e) => setFormData({...formData, pais: e.target.value})}
            />
          </Group>

          <Group grow>
            <TextInput
              label="EPS"
              placeholder="Nombre de la EPS"
              value={formData.eps}
              onChange={(e) => setFormData({...formData, eps: e.target.value})}
            />
            <Select
              label="Tipo de Seguro"
              data={[
                { value: 'CONTRIBUTIVO', label: 'Contributivo' },
                { value: 'SUBSIDIADO', label: 'Subsidiado' },
                { value: 'PARTICULAR', label: 'Particular' },
                { value: 'OTRO', label: 'Otro' }
              ]}
              value={formData.tipoSeguro}
              onChange={(value) => setFormData({...formData, tipoSeguro: value})}
            />
          </Group>

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
            <Select
              label="Relación"
              placeholder="Seleccione la relación"
              data={[
                { value: 'FAMILIAR', label: 'Familiar' },
                { value: 'AMIGO', label: 'Amigo' },
                { value: 'VECINO', label: 'Vecino' },
                { value: 'OTRO', label: 'Otro' }
              ]}
              value={formData.relacionContactoEmergencia}
              onChange={(value) => setFormData({...formData, relacionContactoEmergencia: value})}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseCreateModal}>
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

      {/* Modal de Visualización de Paciente */}
      <Modal
        opened={isViewModalOpen}
        onClose={handleCloseViewModal}
        title={`Información del Paciente - ${(() => {
          try {
            const datosCompletos = JSON.parse(pacienteToView?.datosJson || '{}');
            if (datosCompletos.datosJson) {
              const datosInternos = JSON.parse(datosCompletos.datosJson);
              const infoPersonal = datosInternos.informacionPersonal || {};
              const primerNombre = infoPersonal.primerNombre || '';
              const segundoNombre = infoPersonal.segundoNombre || '';
              const primerApellido = infoPersonal.primerApellido || '';
              const segundoApellido = infoPersonal.segundoApellido || '';
              return `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
            }
          } catch (error) {
            console.error('Error calculando nombre para header:', error);
          }
          return 'N/A';
        })()}`}
        size="xl"
        centered
      >
        <Stack gap="lg">
          {pacienteToView && (() => {
            console.log('📋 Modal View - Datos del paciente:', pacienteToView);

            // Parsear el JSON crudo del paciente
            let datosCompletos = {};
            let informacionPersonal = {};
            let informacionContacto = {};
            let informacionMedica = {};
            let contactoEmergencia = {};

            try {
              // Parsear el JSON crudo de la BD
              datosCompletos = JSON.parse(pacienteToView.datosJson || '{}');
              console.log('📋 Modal View - Datos completos:', datosCompletos);

              // Extraer el JSON interno que contiene la información real
              if (datosCompletos.datosJson) {
                const datosInternos = JSON.parse(datosCompletos.datosJson);
                informacionPersonal = datosInternos.informacionPersonal || {};
                informacionContacto = datosInternos.informacionContacto || {};
                informacionMedica = datosInternos.informacionMedica || {};
                contactoEmergencia = datosInternos.contactoEmergencia || {};
              }
            } catch (error) {
              console.error('Error parsing paciente datosJson:', error);
            }

            console.log('🔍 Parsed data:');
            console.log('  - informacionPersonal:', informacionPersonal);
            console.log('  - informacionContacto:', informacionContacto);
            console.log('  - informacionMedica:', informacionMedica);
            console.log('  - contactoEmergencia:', contactoEmergencia);

            // Calcular nombre completo y edad desde informacionPersonal
            const nombreCompleto = `${informacionPersonal.primerNombre || ''} ${informacionPersonal.segundoNombre || ''} ${informacionPersonal.primerApellido || ''} ${informacionPersonal.segundoApellido || ''}`.trim();

            let edad = 'N/A';
            if (informacionPersonal.fechaNacimiento) {
              try {
                const fechaNacimiento = new Date(informacionPersonal.fechaNacimiento);
                const hoy = new Date();
                edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const mesDiff = hoy.getMonth() - fechaNacimiento.getMonth();
                if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                  edad--;
                }
                edad = `${edad} años`;
              } catch (error) {
                console.error('Error calculando edad:', error);
                edad = 'N/A';
              }
            }

            return (
              <>
                {/* Información Básica */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    Información Básica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Documento:</span>
                      <p className="text-sm text-gray-900">{pacienteToView.numeroDocumento} ({pacienteToView.tipoDocumento})</p>
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
                      <span className="text-sm font-medium text-gray-600">Edad:</span>
                      <p className="text-sm text-gray-900">{edad}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Género:</span>
                      <p className="text-sm text-gray-900">{informacionPersonal.genero || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Estado Civil:</span>
                      <p className="text-sm text-gray-900">{informacionPersonal.estadoCivil || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                    <span className="mr-2">📞</span>
                    Información de Contacto
                  </h3>
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
                    <div>
                      <span className="text-sm font-medium text-gray-600">País:</span>
                      <p className="text-sm text-gray-900">{informacionContacto.pais || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Información Médica */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                    <span className="mr-2">🏥</span>
                    Información Médica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">EPS:</span>
                      <span className="text-sm text-gray-900 ml-2">{informacionMedica.eps || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Tipo de Seguro:</span>
                      <span className="text-sm text-gray-900 ml-2">{informacionMedica.tipoSeguro || 'N/A'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Alergias:</span>
                      <span className="text-sm text-gray-900 ml-2">{informacionMedica.alergias || 'Ninguna'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Medicamentos Actuales:</span>
                      <span className="text-sm text-gray-900 ml-2">{informacionMedica.medicamentosActuales || 'Ninguno'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Observaciones Médicas:</span>
                      <span className="text-sm text-gray-900 ml-2">{informacionMedica.observacionesMedicas || 'Ninguna'}</span>
                    </div>
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                    <span className="mr-2">🚨</span>
                    Contacto de Emergencia
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Nombre:</span>
                      <p className="text-sm text-gray-900">{contactoEmergencia.nombreContacto || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Teléfono:</span>
                      <p className="text-sm text-gray-900">{contactoEmergencia.telefonoContacto || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Relación:</span>
                      <p className="text-sm text-gray-900">{contactoEmergencia.relacion || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Estado del Paciente */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📊</span>
                    Estado del Paciente
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Estado:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        pacienteToView.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pacienteToView.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Fecha de Registro:</span>
                      <span className="text-sm text-gray-900 ml-2">
                        {pacienteToView.fechaCreacion ?
                          (Array.isArray(pacienteToView.fechaCreacion) ?
                            new Date(...pacienteToView.fechaCreacion.slice(0, 6)).toLocaleDateString('es-ES') :
                            new Date(pacienteToView.fechaCreacion).toLocaleDateString('es-ES')
                          ) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </Stack>
      </Modal>

      {/* Modal de Edición de Paciente */}
      <Modal
        opened={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Editar Paciente"
        size="xl"
        centered
      >
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Número de Documento"
              value={formData.numeroDocumento}
              onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
              required
            />
            <Select
              label="Tipo de Documento"
              data={[
                { value: 'CC', label: 'Cédula de Ciudadanía' },
                { value: 'CE', label: 'Cédula de Extranjería' },
                { value: 'PA', label: 'Pasaporte' },
                { value: 'TI', label: 'Tarjeta de Identidad' }
              ]}
              value={formData.tipoDocumento}
              onChange={(value) => setFormData({...formData, tipoDocumento: value})}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Primer Nombre"
              value={formData.primerNombre}
              onChange={(e) => setFormData({...formData, primerNombre: e.target.value})}
              required
            />
            <TextInput
              label="Segundo Nombre"
              value={formData.segundoNombre}
              onChange={(e) => setFormData({...formData, segundoNombre: e.target.value})}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Primer Apellido"
              value={formData.primerApellido}
              onChange={(e) => setFormData({...formData, primerApellido: e.target.value})}
              required
            />
            <TextInput
              label="Segundo Apellido"
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
            <Select
              label="Género"
              data={[
                { value: 'MASCULINO', label: 'Masculino' },
                { value: 'FEMENINO', label: 'Femenino' },
                { value: 'OTRO', label: 'Otro' }
              ]}
              value={formData.genero}
              onChange={(value) => setFormData({...formData, genero: value})}
              required
            />
          </Group>

          <Group grow>
            <TextInput
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              required
            />
            <TextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </Group>

          <TextInput
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
          />

          <Group grow>
            <TextInput
              label="Ciudad"
              value={formData.ciudad}
              onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
            />
            <TextInput
              label="Departamento"
              value={formData.departamento}
              onChange={(e) => setFormData({...formData, departamento: e.target.value})}
            />
          </Group>

          <TextInput
            label="País"
            value={formData.pais}
            onChange={(e) => setFormData({...formData, pais: e.target.value})}
          />

          <Group grow>
            <TextInput
              label="EPS"
              placeholder="Nombre de la EPS"
              value={formData.eps}
              onChange={(e) => setFormData({...formData, eps: e.target.value})}
            />
            <Select
              label="Tipo de Seguro"
              data={[
                { value: 'CONTRIBUTIVO', label: 'Contributivo' },
                { value: 'SUBSIDIADO', label: 'Subsidiado' },
                { value: 'PARTICULAR', label: 'Particular' },
                { value: 'OTRO', label: 'Otro' }
              ]}
              value={formData.tipoSeguro}
              onChange={(value) => setFormData({...formData, tipoSeguro: value})}
            />
          </Group>

          <TextInput
            label="Alergias"
            value={formData.alergias}
            onChange={(e) => setFormData({...formData, alergias: e.target.value})}
          />

          <TextInput
            label="Medicamentos Actuales"
            value={formData.medicamentosActuales}
            onChange={(e) => setFormData({...formData, medicamentosActuales: e.target.value})}
          />

          <TextInput
            label="Observaciones Médicas"
            value={formData.observacionesMedicas}
            onChange={(e) => setFormData({...formData, observacionesMedicas: e.target.value})}
          />

          <Group grow>
            <TextInput
              label="Nombre Contacto de Emergencia"
              value={formData.nombreContactoEmergencia}
              onChange={(e) => setFormData({...formData, nombreContactoEmergencia: e.target.value})}
            />
            <TextInput
              label="Teléfono Contacto de Emergencia"
              value={formData.telefonoContactoEmergencia}
              onChange={(e) => setFormData({...formData, telefonoContactoEmergencia: e.target.value})}
            />
            <Select
              label="Relación"
              placeholder="Seleccione la relación"
              data={[
                { value: 'FAMILIAR', label: 'Familiar' },
                { value: 'AMIGO', label: 'Amigo' },
                { value: 'VECINO', label: 'Vecino' },
                { value: 'OTRO', label: 'Otro' }
              ]}
              value={formData.relacionContactoEmergencia}
              onChange={(value) => setFormData({...formData, relacionContactoEmergencia: value})}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button
              color="blue"
              onClick={handleUpdatePaciente}
              loading={loading}
              disabled={!formData.numeroDocumento || !formData.primerNombre || !formData.primerApellido || !formData.fechaNacimiento || !formData.telefono}
            >
              Actualizar Paciente
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default GestionPacientesComponent;