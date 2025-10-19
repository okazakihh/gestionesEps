import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { empleadosApiService } from '../../../data/services/empleadosApiService.js';
import ServiceAlert from '../ui/ServiceAlert.jsx';
import { Modal, Button, TextInput, Select, Group, Text, Stack, ActionIcon } from '@mantine/core';
import Swal from 'sweetalert2';

const GestionEmpleadosComponent = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [userCheckCache, setUserCheckCache] = useState({});
  const [checkingUsers, setCheckingUsers] = useState(new Set());

  // Estados para los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [empleadoToView, setEmpleadoToView] = useState(null);
  const [empleadoToEdit, setEmpleadoToEdit] = useState(null);

  // Estados para el formulario de empleado
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
    pais: 'Colombia',
    tipoPersonal: '', // 'MEDICO' o 'ADMINISTRATIVO'
    tipoMedico: '', // 'DOCTOR' o 'AUXILIAR' (solo si es MEDICO)
    especialidad: '', // solo si es MEDICO
    dependencia: '', // solo si es ADMINISTRATIVO
    cargo: '',
    salario: '',
    fechaContratacion: '',
    tipoContrato: 'INDEFINIDO'
  });

  useEffect(() => {
    loadEmpleados();
  }, [searchParams]);

  // Effect to filter employees based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmpleados(empleados);
    } else {
      const filtered = empleados.filter(empleado => {
        // Extraer información del empleado para búsqueda
        let numeroDocumento = '';
        let primerNombre = '';
        let primerApellido = '';
        let cargo = '';
        let telefono = '';
        let email = '';

        try {
          const datosCompletos = JSON.parse(empleado.jsonData || '{}');
          numeroDocumento = datosCompletos.numeroDocumento || '';

          if (datosCompletos.jsonData) {
            const datosInternos = JSON.parse(datosCompletos.jsonData);
            const informacionPersonal = datosInternos.informacionPersonal || {};
            const informacionContacto = datosInternos.informacionContacto || {};
            const informacionLaboral = datosInternos.informacionLaboral || {};

            primerNombre = informacionPersonal.primerNombre || '';
            primerApellido = informacionPersonal.primerApellido || '';
            cargo = informacionLaboral.cargo || '';
            telefono = informacionContacto.telefono || '';
            email = informacionContacto.email || '';
          }
        } catch (error) {
          console.error('Error parsing empleado data for search:', error);
        }

        const searchLower = searchTerm.toLowerCase();
        return (
          numeroDocumento.toLowerCase().includes(searchLower) ||
          primerNombre.toLowerCase().includes(searchLower) ||
          primerApellido.toLowerCase().includes(searchLower) ||
          cargo.toLowerCase().includes(searchLower) ||
          telefono.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        );
      });
      setFilteredEmpleados(filtered);
    }
  }, [empleados, searchTerm]);

  // Effect to check user accounts for all employees
  useEffect(() => {
    empleados.forEach(empleado => {
      if (userCheckCache[empleado.id] === undefined && !checkingUsers.has(empleado.id)) {
        checkEmployeeHasUser(empleado);
      }
    });
  }, [empleados]);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await empleadosApiService.getEmpleados(searchParams);
      setEmpleados(response.content || []);
    } catch (err) {
      const error = err;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de empleados. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar empleados');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Function to check if employee already has a user account
  const checkEmployeeHasUser = async (empleado) => {
    const empleadoId = empleado.id;

    // Check cache first
    if (userCheckCache[empleadoId] !== undefined) {
      return userCheckCache[empleadoId];
    }

    // Mark as checking
    setCheckingUsers(prev => new Set(prev).add(empleadoId));

    try {
      // Extract employee email and document number
      let email = '';
      let numeroDocumento = '';

      try {
        const datosCompletos = JSON.parse(empleado.jsonData || '{}');
        numeroDocumento = datosCompletos.numeroDocumento || '';
        if (datosCompletos.jsonData) {
          const datosInternos = JSON.parse(datosCompletos.jsonData);
          email = datosInternos.informacionContacto?.email || '';
        }
      } catch (error) {
        console.error('Error parsing empleado data for user check:', error);
      }

      // If no email or document, assume no user
      if (!email && !numeroDocumento) {
        setUserCheckCache(prev => ({ ...prev, [empleadoId]: false }));
        setCheckingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(empleadoId);
          return newSet;
        });
        return false;
      }

      // Import user service dynamically
      const { usuarioApiService } = await import('../../../data/services/usuarioApiService.js');
      const response = await usuarioApiService.getAllUsuarios();

      if (response.success && response.data) {
        // Check if any user has matching email or document
        const hasUser = response.data.some(user =>
          (email && user.email === email) ||
          (numeroDocumento && user.personalInfo?.documento === numeroDocumento)
        );

        // Cache the result
        setUserCheckCache(prev => ({ ...prev, [empleadoId]: hasUser }));
        setCheckingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(empleadoId);
          return newSet;
        });
        return hasUser;
      }

      setUserCheckCache(prev => ({ ...prev, [empleadoId]: false }));
      setCheckingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(empleadoId);
        return newSet;
      });
      return false;
    } catch (error) {
      console.error('Error checking if employee has user:', error);
      setUserCheckCache(prev => ({ ...prev, [empleadoId]: false }));
      setCheckingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(empleadoId);
        return newSet;
      });
      return false;
    }
  };

  const handleRetry = () => {
    loadEmpleados();
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
      tipoPersonal: '',
      tipoMedico: '',
      especialidad: '',
      dependencia: '',
      cargo: '',
      salario: '',
      fechaContratacion: '',
      tipoContrato: 'INDEFINIDO'
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenViewModal = async (empleado) => {
    try {
      setLoading(true);
      const empleadoData = await empleadosApiService.getEmpleadoById(empleado.id);
      setEmpleadoToView(empleadoData);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error al cargar empleado para ver:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la información del empleado',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = async (empleado) => {
    try {
      setLoading(true);
      const empleadoData = await empleadosApiService.getEmpleadoById(empleado.id);

        // Parsear el JSON crudo del empleado
        let datosCompletos = {};
        let informacionPersonal = {};
        let informacionContacto = {};
        let informacionLaboral = {};

        try {
          datosCompletos = JSON.parse(empleadoData.jsonData || '{}');
          if (datosCompletos.jsonData) {
            const datosInternos = JSON.parse(datosCompletos.jsonData);
            informacionPersonal = datosInternos.informacionPersonal || {};
            informacionContacto = datosInternos.informacionContacto || {};
            informacionLaboral = datosInternos.informacionLaboral || {};
          }
        } catch (error) {
          console.error('Error parsing empleado datosJson for edit:', error);
        }

        setFormData({
          numeroDocumento: datosCompletos.numeroDocumento || '',
          tipoDocumento: datosCompletos.tipoDocumento || 'CC',
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
          tipoPersonal: informacionLaboral.tipoPersonal || '',
          tipoMedico: informacionLaboral.tipoMedico || '',
          especialidad: informacionLaboral.especialidad || '',
          dependencia: informacionLaboral.dependencia || '',
          cargo: informacionLaboral.cargo || '',
          salario: informacionLaboral.salario || '',
          fechaContratacion: informacionLaboral.fechaContratacion || '',
          tipoContrato: informacionLaboral.tipoContrato || 'INDEFINIDO'
        });
        setEmpleadoToEdit(empleadoData);
        setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error al cargar empleado para editar:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la información del empleado',
        icon: 'error'
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
    setEmpleadoToView(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEmpleadoToEdit(null);
  };

  const handleCreateEmpleado = async () => {
    try {
      setLoading(true);

      const datosInternosJson = JSON.stringify({
        informacionPersonal: {
          primerNombre: formData.primerNombre,
          segundoNombre: formData.segundoNombre,
          primerApellido: formData.primerApellido,
          segundoApellido: formData.segundoApellido,
          fechaNacimiento: formData.fechaNacimiento,
          genero: formData.genero
        },
        informacionContacto: {
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          departamento: formData.departamento,
          pais: formData.pais
        },
        informacionLaboral: {
          tipoPersonal: formData.tipoPersonal,
          tipoMedico: formData.tipoPersonal === 'MEDICO' ? formData.tipoMedico : null,
          especialidad: formData.tipoPersonal === 'MEDICO' ? formData.especialidad : null,
          dependencia: formData.tipoPersonal === 'ADMINISTRATIVO' ? formData.dependencia : null,
          cargo: formData.cargo,
          salario: formData.salario,
          fechaContratacion: formData.fechaContratacion,
          tipoContrato: formData.tipoContrato
        }
      });

      const datosCompletosJson = JSON.stringify({
        numeroDocumento: formData.numeroDocumento,
        tipoDocumento: formData.tipoDocumento,
        jsonData: datosInternosJson,
        activo: true
      });

      console.log('🔍 DEBUG - JSON interno que se va a enviar:', datosInternosJson);
      console.log('🔍 DEBUG - JSON completo que se va a enviar:', datosCompletosJson);

      await empleadosApiService.createEmpleado(datosCompletosJson);

      Swal.fire({
        title: '¡Empleado creado!',
        text: 'El empleado ha sido registrado correctamente',
        icon: 'success',
        timer: 5000,
        showConfirmButton: false
      });

      setIsCreateModalOpen(false);
      await loadEmpleados();

    } catch (error) {
      console.error('Error al crear empleado:', error);
      Swal.fire({
        title: 'Error al crear empleado',
        text: error.message || 'Ha ocurrido un error inesperado',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmpleado = async () => {
    try {
      setLoading(true);

      const datosInternosJson = JSON.stringify({
        informacionPersonal: {
          primerNombre: formData.primerNombre,
          segundoNombre: formData.segundoNombre,
          primerApellido: formData.primerApellido,
          segundoApellido: formData.segundoApellido,
          fechaNacimiento: formData.fechaNacimiento,
          genero: formData.genero
        },
        informacionContacto: {
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          departamento: formData.departamento,
          pais: formData.pais
        },
        informacionLaboral: {
          tipoPersonal: formData.tipoPersonal,
          tipoMedico: formData.tipoPersonal === 'MEDICO' ? formData.tipoMedico : null,
          especialidad: formData.tipoPersonal === 'MEDICO' ? formData.especialidad : null,
          dependencia: formData.tipoPersonal === 'ADMINISTRATIVO' ? formData.dependencia : null,
          cargo: formData.cargo,
          salario: formData.salario,
          fechaContratacion: formData.fechaContratacion,
          tipoContrato: formData.tipoContrato
        }
      });

      const datosCompletosJson = JSON.stringify({
        numeroDocumento: formData.numeroDocumento,
        tipoDocumento: formData.tipoDocumento,
        jsonData: datosInternosJson,
        activo: empleadoToEdit?.activo ?? true
      });

      await empleadosApiService.updateEmpleado(empleadoToEdit.id, datosCompletosJson);

      Swal.fire({
        title: '¡Empleado actualizado!',
        text: 'Los datos del empleado han sido actualizados correctamente',
        icon: 'success',
        timer: 5000,
        showConfirmButton: false
      });

      setIsEditModalOpen(false);
      setEmpleadoToEdit(null);
      await loadEmpleados();

    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      Swal.fire({
        title: 'Error al actualizar empleado',
        text: error.message || 'Ha ocurrido un error inesperado',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserFromEmployee = (empleado) => {
    // Extract employee data for user creation
    let datosCompletos = {};
    let informacionPersonal = {};
    let informacionContacto = {};
    let informacionLaboral = {};

    try {
      datosCompletos = JSON.parse(empleado.jsonData || '{}');
      if (datosCompletos.jsonData) {
        const datosInternos = JSON.parse(datosCompletos.jsonData);
        informacionPersonal = datosInternos.informacionPersonal || {};
        informacionContacto = datosInternos.informacionContacto || {};
        informacionLaboral = datosInternos.informacionLaboral || {};
      }
    } catch (error) {
      console.error('Error parsing empleado data for user creation:', error);
    }

    // Map employee data to user format
    const userData = {
      nombres: informacionPersonal.primerNombre || '',
      apellidos: `${informacionPersonal.primerApellido || ''} ${informacionPersonal.segundoApellido || ''}`.trim(),
      documento: datosCompletos.numeroDocumento || '',
      tipoDocumento: datosCompletos.tipoDocumento || 'CC',
      fechaNacimiento: informacionPersonal.fechaNacimiento || '',
      genero: informacionPersonal.genero === 'MASCULINO' ? 'M' : informacionPersonal.genero === 'FEMENINO' ? 'F' : 'O',
      telefono: informacionContacto.telefono || '',
      email: informacionContacto.email || '',
      direccion: informacionContacto.direccion || '',
      ciudad: informacionContacto.ciudad || '',
      departamento: informacionContacto.departamento || '',
      pais: informacionContacto.pais || 'COLOMBIA',
      // Set default role based on employee type
      rol: informacionLaboral.tipoPersonal === 'MEDICO' ? 'DOCTOR' :
           informacionLaboral.tipoPersonal === 'ADMINISTRATIVO' ? 'ADMINISTRATIVO' : 'ADMINISTRATIVO'
    };

    // Navigate to users page with employee data
    console.log('🔄 Navegando a usuarios con datos del empleado:', userData);
    navigate('/usuarios', {
      state: {
        createUserFromEmployee: true,
        employeeData: userData
      }
    });
  };

  const handleDeactivateEmpleado = async (empleado) => {
    let numeroDocumento = 'N/A';
    try {
      const datosCompletos = JSON.parse(empleado.jsonData || '{}');
      numeroDocumento = datosCompletos.numeroDocumento || 'N/A';
    } catch (error) {
      console.error('Error parsing empleado jsonData for deactivate:', error);
    }

    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea desactivar al empleado ${numeroDocumento}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoading(true);
      await empleadosApiService.deactivateEmpleado(empleado.id);

      Swal.fire({
        title: 'Empleado desactivado',
        text: 'El empleado ha sido desactivado correctamente',
        icon: 'warning',
        timer: 5000,
        showConfirmButton: false
      });

      await loadEmpleados();
    } catch (error) {
      console.error('Error al desactivar empleado:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo desactivar el empleado',
        icon: 'error'
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
          <p className="mt-1 text-sm text-gray-600">Administra la información de los empleados del sistema</p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          leftSection={<span>+</span>}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nuevo Empleado
        </Button>
      </div>

      {/* Service Alert */}
      {connectionError && (
        <ServiceAlert
          type="error"
          title="Error de Conexión"
          message={error || "No se pudo conectar con el servicio de empleados. Verifique que el servidor esté ejecutándose en el puerto 8084."}
          onRetry={handleRetry}
          retryLabel="Reintentar Conexión"
        />
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="max-w-md">
          <TextInput
            placeholder="Buscar por documento, nombres, cargo, teléfono o email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
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
                  onClick={() => handleSearch('')}
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
          {filteredEmpleados.length} de {empleados.length} empleado{empleados.length !== 1 ? 's' : ''} {searchTerm ? 'encontrado' : 'mostrado'}{filteredEmpleados.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando empleados...</p>
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
                  {filteredEmpleados.map((empleado) => {
                    let informacionPersonal = {};
                    let informacionContacto = {};
                    let informacionLaboral = {};
                    let numeroDocumento = 'N/A';
                    let tipoDocumento = '';
                    try {
                      const datosCompletos = JSON.parse(empleado.jsonData || '{}');
                      numeroDocumento = datosCompletos.numeroDocumento || 'N/A';
                      tipoDocumento = datosCompletos.tipoDocumento || '';
                      if (datosCompletos.jsonData) {
                        const datosInternos = JSON.parse(datosCompletos.jsonData);
                        informacionPersonal = datosInternos.informacionPersonal || {};
                        informacionContacto = datosInternos.informacionContacto || {};
                        informacionLaboral = datosInternos.informacionLaboral || {};
                      }
                    } catch (error) {
                      console.error('Error parsing empleado datosJson for table:', error);
                    }

                    // Check if employee has user account
                    const hasUser = userCheckCache[empleado.id];
                    const isChecking = checkingUsers.has(empleado.id);

                    return (
                      <tr key={empleado.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {numeroDocumento}
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
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="gray"
                              size="sm"
                              onClick={() => handleOpenViewModal(empleado)}
                              title="Ver empleado"
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
                              onClick={() => handleOpenEditModal(empleado)}
                              title="Editar empleado"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </ActionIcon>
                            {/* Only show Create User button if employee doesn't have a user account */}
                            {hasUser === false && (
                              <ActionIcon
                                variant="light"
                                color="green"
                                size="sm"
                                onClick={() => handleCreateUserFromEmployee(empleado)}
                                title="Crear usuario"
                                loading={isChecking}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                              </ActionIcon>
                            )}
                            {/* Show user indicator if employee has a user */}
                            {hasUser === true && (
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="sm"
                                title="Ya tiene usuario creado"
                                disabled
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </ActionIcon>
                            )}
                            {empleado.activo && (
                              <ActionIcon
                                variant="light"
                                color="orange"
                                size="sm"
                                onClick={() => handleDeactivateEmpleado(empleado)}
                                title="Desactivar empleado"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </ActionIcon>
                            )}
                          </Group>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredEmpleados.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? `No se encontraron empleados que coincidan con "${searchTerm}"` : 'No hay empleados registrados'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Creación de Empleado */}
      <Modal
        opened={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Registrar Nuevo Empleado"
        size="xl"
        centered
      >
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Número de Documento"
              placeholder="Ingrese el número de documento"
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
          </Group>

          <Group grow>
            <TextInput
              label="Teléfono"
              placeholder="Número de teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              required
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </Group>

          <TextInput
            label="Dirección"
            placeholder="Dirección completa"
            value={formData.direccion}
            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
          />

          <Group grow>
            <TextInput
              label="Ciudad"
              placeholder="Ciudad"
              value={formData.ciudad}
              onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
            />
            <TextInput
              label="Departamento"
              placeholder="Departamento"
              value={formData.departamento}
              onChange={(e) => setFormData({...formData, departamento: e.target.value})}
            />
          </Group>

          {/* Tipo de Personal */}
          <Select
            label="Tipo de Personal"
            placeholder="Seleccione el tipo de personal"
            data={[
              { value: 'MEDICO', label: 'Personal Médico' },
              { value: 'ADMINISTRATIVO', label: 'Personal Administrativo' }
            ]}
            value={formData.tipoPersonal}
            onChange={(value) => setFormData({...formData, tipoPersonal: value, tipoMedico: '', especialidad: '', dependencia: ''})}
            required
          />

          {/* Campos condicionales para Personal Médico */}
          {formData.tipoPersonal === 'MEDICO' && (
            <>
              <Group grow>
                <Select
                  label="Tipo de Médico"
                  placeholder="Seleccione el tipo"
                  data={[
                    { value: 'DOCTOR', label: 'Doctor' },
                    { value: 'AUXILIAR', label: 'Auxiliar' }
                  ]}
                  value={formData.tipoMedico}
                  onChange={(value) => setFormData({...formData, tipoMedico: value})}
                  required
                />
                <TextInput
                  label="Especialidad"
                  placeholder="Especialidad médica"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                  required
                />
              </Group>
            </>
          )}

          {/* Campo condicional para Personal Administrativo */}
          {formData.tipoPersonal === 'ADMINISTRATIVO' && (
            <TextInput
              label="Dependencia"
              placeholder="Dependencia administrativa"
              value={formData.dependencia}
              onChange={(e) => setFormData({...formData, dependencia: e.target.value})}
              required
            />
          )}

          <Group grow>
            <TextInput
              label="Cargo"
              placeholder="Cargo del empleado"
              value={formData.cargo}
              onChange={(e) => setFormData({...formData, cargo: e.target.value})}
            />
            <TextInput
              label="Salario"
              type="number"
              placeholder="Salario mensual"
              value={formData.salario}
              onChange={(e) => setFormData({...formData, salario: e.target.value})}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Fecha de Contratación"
              type="date"
              value={formData.fechaContratacion}
              onChange={(e) => setFormData({...formData, fechaContratacion: e.target.value})}
            />
            <Select
              label="Tipo de Contrato"
              data={[
                { value: 'INDEFINIDO', label: 'Indefinido' },
                { value: 'FIJO', label: 'Término fijo' },
                { value: 'OBRA', label: 'Por obra o labor' },
                { value: 'PRESTACION', label: 'Prestación de servicios' }
              ]}
              value={formData.tipoContrato}
              onChange={(value) => setFormData({...formData, tipoContrato: value})}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseCreateModal}>
              Cancelar
            </Button>
            <Button
              color="blue"
              onClick={handleCreateEmpleado}
              loading={loading}
              disabled={!formData.numeroDocumento || !formData.primerNombre || !formData.primerApellido || !formData.fechaNacimiento || !formData.telefono || !formData.tipoPersonal || (formData.tipoPersonal === 'MEDICO' && (!formData.tipoMedico || !formData.especialidad)) || (formData.tipoPersonal === 'ADMINISTRATIVO' && !formData.dependencia)}
            >
              Crear Empleado
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Visualización de Empleado */}
      <Modal
        opened={isViewModalOpen}
        onClose={handleCloseViewModal}
        title={`Información del Empleado`}
        size="xl"
        centered
      >
        <Stack gap="lg">
          {empleadoToView && (() => {
            let datosCompletos = {};
            let informacionPersonal = {};
            let informacionContacto = {};
            let informacionLaboral = {};
            let numeroDocumento = 'N/A';
            let tipoDocumento = '';

            try {
              datosCompletos = JSON.parse(empleadoToView.jsonData || '{}');
              numeroDocumento = datosCompletos.numeroDocumento || 'N/A';
              tipoDocumento = datosCompletos.tipoDocumento || '';
              if (datosCompletos.jsonData) {
                const datosInternos = JSON.parse(datosCompletos.jsonData);
                informacionPersonal = datosInternos.informacionPersonal || {};
                informacionContacto = datosInternos.informacionContacto || {};
                informacionLaboral = datosInternos.informacionLaboral || {};
              }
            } catch (error) {
              console.error('Error parsing empleado datosJson:', error);
            }

            const nombreCompleto = `${informacionPersonal.primerNombre || ''} ${informacionPersonal.segundoNombre || ''} ${informacionPersonal.primerApellido || ''} ${informacionPersonal.segundoApellido || ''}`.trim();

            return (
              <>
                {/* Información Personal */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="text-sm font-medium text-gray-600">Documento:</span><p className="text-sm text-gray-900">{numeroDocumento} ({tipoDocumento})</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Nombre Completo:</span><p className="text-sm text-gray-900">{nombreCompleto || 'N/A'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Fecha de Nacimiento:</span><p className="text-sm text-gray-900">{informacionPersonal.fechaNacimiento || 'N/A'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Género:</span><p className="text-sm text-gray-900">{informacionPersonal.genero || 'N/A'}</p></div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="text-sm font-medium text-gray-600">Teléfono:</span><p className="text-sm text-gray-900">{informacionContacto.telefono || 'N/A'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Email:</span><p className="text-sm text-gray-900">{informacionContacto.email || 'N/A'}</p></div>
                    <div className="md:col-span-2"><span className="text-sm font-medium text-gray-600">Dirección:</span><p className="text-sm text-gray-900">{informacionContacto.direccion || 'N/A'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Ciudad:</span><p className="text-sm text-gray-900">{informacionContacto.ciudad || 'N/A'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Departamento:</span><p className="text-sm text-gray-900">{informacionContacto.departamento || 'N/A'}</p></div>
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Información Laboral</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="text-sm font-medium text-gray-600">Tipo de Personal:</span><p className="text-sm text-gray-900">{informacionLaboral.tipoPersonal === 'MEDICO' ? 'Personal Médico' : informacionLaboral.tipoPersonal === 'ADMINISTRATIVO' ? 'Personal Administrativo' : 'N/A'}</p></div>
                    {informacionLaboral.tipoPersonal === 'MEDICO' && (
                      <>
                        <div><span className="text-sm font-medium text-gray-600">Tipo de Médico:</span><p className="text-sm text-gray-900">{informacionLaboral.tipoMedico === 'DOCTOR' ? 'Doctor' : informacionLaboral.tipoMedico === 'AUXILIAR' ? 'Auxiliar' : 'N/A'}</p></div>
                        <div><span className="text-sm font-medium text-gray-600">Especialidad:</span><p className="text-sm text-gray-900">{informacionLaboral.especialidad || 'N/A'}</p></div>
                      </>
                    )}
                    {informacionLaboral.tipoPersonal === 'ADMINISTRATIVO' && (
                      <div><span className="text-sm font-medium text-gray-600">Dependencia:</span><p className="text-sm text-gray-900">{informacionLaboral.dependencia || 'N/A'}</p></div>
                    )}
                    <div><span className="text-sm font-medium text-gray-600">Cargo:</span><p className="text-sm text-gray-900">{informacionLaboral.cargo || 'N/A'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Salario:</span><p className="text-sm text-gray-900">{informacionLaboral.salario ? `$${informacionLaboral.salario}` : 'N/A'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Fecha de Contratación:</span><p className="text-sm text-gray-900">{informacionLaboral.fechaContratacion || 'N/A'}</p></div>
                    <div><span className="text-sm font-medium text-gray-600">Tipo de Contrato:</span><p className="text-sm text-gray-900">{informacionLaboral.tipoContrato || 'N/A'}</p></div>
                  </div>
                </div>

                {/* Estado del Empleado */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado del Empleado</h3>
                  <div className="flex items-center space-x-4">
                    <div><span className="text-sm font-medium text-gray-600">Estado:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${empleadoToView.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {empleadoToView.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div><span className="text-sm font-medium text-gray-600">Fecha de Registro:</span><span className="text-sm text-gray-900 ml-2">{empleadoToView.fechaCreacion || 'N/A'}</span></div>
                  </div>
                </div>
              </>
            );
          })()}
        </Stack>
      </Modal>

      {/* Modal de Edición de Empleado */}
      <Modal
        opened={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Editar Empleado"
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

          {/* Tipo de Personal */}
          <Select
            label="Tipo de Personal"
            placeholder="Seleccione el tipo de personal"
            data={[
              { value: 'MEDICO', label: 'Personal Médico' },
              { value: 'ADMINISTRATIVO', label: 'Personal Administrativo' }
            ]}
            value={formData.tipoPersonal}
            onChange={(value) => setFormData({...formData, tipoPersonal: value, tipoMedico: '', especialidad: '', dependencia: ''})}
            required
          />

          {/* Campos condicionales para Personal Médico */}
          {formData.tipoPersonal === 'MEDICO' && (
            <>
              <Group grow>
                <Select
                  label="Tipo de Médico"
                  placeholder="Seleccione el tipo"
                  data={[
                    { value: 'DOCTOR', label: 'Doctor' },
                    { value: 'AUXILIAR', label: 'Auxiliar' }
                  ]}
                  value={formData.tipoMedico}
                  onChange={(value) => setFormData({...formData, tipoMedico: value})}
                  required
                />
                <TextInput
                  label="Especialidad"
                  placeholder="Especialidad médica"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                  required
                />
              </Group>
            </>
          )}

          {/* Campo condicional para Personal Administrativo */}
          {formData.tipoPersonal === 'ADMINISTRATIVO' && (
            <TextInput
              label="Dependencia"
              placeholder="Dependencia administrativa"
              value={formData.dependencia}
              onChange={(e) => setFormData({...formData, dependencia: e.target.value})}
              required
            />
          )}

          <Group grow>
            <TextInput
              label="Cargo"
              placeholder="Cargo del empleado"
              value={formData.cargo}
              onChange={(e) => setFormData({...formData, cargo: e.target.value})}
            />
            <TextInput
              label="Salario"
              type="number"
              placeholder="Salario mensual"
              value={formData.salario}
              onChange={(e) => setFormData({...formData, salario: e.target.value})}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Fecha de Contratación"
              type="date"
              value={formData.fechaContratacion}
              onChange={(e) => setFormData({...formData, fechaContratacion: e.target.value})}
            />
            <Select
              label="Tipo de Contrato"
              data={[
                { value: 'INDEFINIDO', label: 'Indefinido' },
                { value: 'FIJO', label: 'Término fijo' },
                { value: 'OBRA', label: 'Por obra o labor' },
                { value: 'PRESTACION', label: 'Prestación de servicios' }
              ]}
              value={formData.tipoContrato}
              onChange={(value) => setFormData({...formData, tipoContrato: value})}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button
              color="blue"
              onClick={handleUpdateEmpleado}
              loading={loading}
              disabled={!formData.numeroDocumento || !formData.primerNombre || !formData.primerApellido || !formData.fechaNacimiento || !formData.telefono || !formData.tipoPersonal || (formData.tipoPersonal === 'MEDICO' && (!formData.tipoMedico || !formData.especialidad)) || (formData.tipoPersonal === 'ADMINISTRATIVO' && !formData.dependencia)}
            >
              Actualizar Empleado
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default GestionEmpleadosComponent;