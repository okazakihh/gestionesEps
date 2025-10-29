import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceAlert from '../ui/ServiceAlert.jsx';
import { Button } from '@mantine/core';
import Swal from 'sweetalert2';
import useEmpleadosManagement from '../../../negocio/hooks/empleados/useEmpleadosManagement';
import useEmpleadoForm from '../../../negocio/hooks/empleados/useEmpleadoForm';
import useEmpleadoSearch from '../../../negocio/hooks/empleados/useEmpleadoSearch';
import useEmpleadoUserCheck from '../../../negocio/hooks/empleados/useEmpleadoUserCheck';
import EmpleadosSearchBar from './search/EmpleadosSearchBar';
import EmpleadosTable from './table/EmpleadosTable';
import CreateEmpleadoModal from './modals/CreateEmpleadoModal';
import ViewEmpleadoModal from './modals/ViewEmpleadoModal';
import EditEmpleadoModal from './modals/EditEmpleadoModal';
import { validateEmpleadoForm, isFormComplete, mapEmpleadoToUserData } from '../../../negocio/utils/empleados/empleadoValidator';
import { parseEmpleadoData } from '../../../negocio/utils/empleados/empleadoParser';

const GestionEmpleadosComponent = () => {
  const navigate = useNavigate();
  const hooks = useEmpleadosManagement();
  const empleados = hooks.empleados;
  const loading = hooks.loading;
  const error = hooks.error;
  const connectionError = hooks.connectionError;
  const loadEmpleados = hooks.loadEmpleados;
  const getEmpleadoById = hooks.getEmpleadoById;
  const createEmpleado = hooks.createEmpleado;
  const updateEmpleado = hooks.updateEmpleado;
  const deactivateEmpleado = hooks.deactivateEmpleado;
  const formHooks = useEmpleadoForm();
  const formData = formHooks.formData;
  const resetForm = formHooks.resetForm;
  const updateField = formHooks.updateField;
  const loadEmpleadoData = formHooks.loadEmpleadoData;
  const searchHooks = useEmpleadoSearch(empleados);
  const searchTerm = searchHooks.searchTerm;
  const filteredEmpleados = searchHooks.filteredEmpleados;
  const handleSearchChange = searchHooks.handleSearch;
  const clearSearch = searchHooks.clearSearch;
  const userCheckHooks = useEmpleadoUserCheck(empleados);
  const userCheckCache = userCheckHooks.userCheckCache;
  const checkingUsers = userCheckHooks.checkingUsers;
  const checkEmployeeHasUser = userCheckHooks.checkEmployeeHasUser;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(null);

  const handleOpenCreateModal = () => { resetForm(); setIsCreateModalOpen(true); };
  const handleCloseCreateModal = () => { setIsCreateModalOpen(false); resetForm(); };

  const handleCreateEmpleado = async () => {
    const validationError = validateEmpleadoForm(formData);
    if (validationError) {
      Swal.fire({ title: 'Error de Validación', text: validationError, icon: 'error' });
      return;
    }
    try {
      await createEmpleado(formData);
      Swal.fire({ title: 'Éxito!', text: 'Empleado creado correctamente', icon: 'success' });
      handleCloseCreateModal();
      loadEmpleados();
    } catch (error) {
      console.error('Error al crear empleado:', error);
      Swal.fire({ title: 'Error', text: 'No se pudo crear el empleado', icon: 'error' });
    }
  };

  const handleOpenViewModal = async (empleado) => {
    try {
      const empleadoData = await getEmpleadoById(empleado.id);
      loadEmpleadoData(empleadoData);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error al cargar empleado para ver:', error);
      Swal.fire({ title: 'Error', text: 'No se pudo cargar la información del empleado', icon: 'error' });
    }
  };

  const handleCloseViewModal = () => { setIsViewModalOpen(false); resetForm(); };

  const handleOpenEditModal = async (empleado) => {
    try {
      const empleadoData = await getEmpleadoById(empleado.id);
      loadEmpleadoData(empleadoData);
      setSelectedEmpleadoId(empleado.id);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error al cargar empleado para editar:', error);
      Swal.fire({ title: 'Error', text: 'No se pudo cargar la información del empleado', icon: 'error' });
    }
  };

  const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedEmpleadoId(null); resetForm(); };

  const handleUpdateEmpleado = async () => {
    const validationError = validateEmpleadoForm(formData);
    if (validationError) {
      Swal.fire({ title: 'Error de Validación', text: validationError, icon: 'error' });
      return;
    }
    try {
      await updateEmpleado(selectedEmpleadoId, formData);
      Swal.fire({ title: 'Éxito!', text: 'Empleado actualizado correctamente', icon: 'success' });
      handleCloseEditModal();
      loadEmpleados();
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      Swal.fire({ title: 'Error', text: 'No se pudo actualizar el empleado', icon: 'error' });
    }
  };

  const handleDeactivateEmpleado = async (empleado) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?', text: `Desea desactivar al empleado ${empleado.id}?`, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar', cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await deactivateEmpleado(empleado.id);
        Swal.fire({ title: 'Éxito!', text: 'Empleado desactivado correctamente', icon: 'success' });
        loadEmpleados();
      } catch (error) {
        console.error('Error al desactivar empleado:', error);
        Swal.fire({ title: 'Error', text: 'No se pudo desactivar el empleado', icon: 'error' });
      }
    }
  };

  const handleCreateUser = async (empleado) => {
    try {
      const hasUser = await checkEmployeeHasUser(empleado);
      if (hasUser) {
        Swal.fire({ title: 'Usuario Existente', text: 'Este empleado ya tiene una cuenta de usuario', icon: 'info' });
        return;
      }
      const parsedData = parseEmpleadoData(empleado);
      const userData = mapEmpleadoToUserData(empleado, parsedData);
      navigate('/usuarios', { 
        state: { 
          createUserFromEmployee: true,
          employeeData: userData 
        } 
      });
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      Swal.fire({ title: 'Error', text: 'No se pudo verificar si el empleado tiene usuario', icon: 'error' });
    }
  };

  const handleRetry = () => { loadEmpleados(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
          <p className="mt-1 text-sm text-gray-600">Administra la información de los empleados del sistema</p>
        </div>
        <Button onClick={handleOpenCreateModal} className="bg-blue-600 hover:bg-blue-700">
          + Nuevo Empleado
        </Button>
      </div>
      {connectionError && (<ServiceAlert type="error" title="Error de Conexión" message={error || "No se pudo conectar con el servicio de empleados."} onRetry={handleRetry} retryLabel="Reintentar Conexión" />)}
      <EmpleadosSearchBar searchTerm={searchTerm} onSearch={handleSearchChange} onClear={clearSearch} totalEmpleados={empleados.length} filteredCount={filteredEmpleados.length} />
      <EmpleadosTable 
        empleados={filteredEmpleados} 
        loading={loading} 
        userCheckCache={userCheckCache}
        checkingUsers={checkingUsers}
        onView={handleOpenViewModal} 
        onEdit={handleOpenEditModal} 
        onCreateUser={handleCreateUser} 
        onDeactivate={handleDeactivateEmpleado} 
      />
      <CreateEmpleadoModal 
        opened={isCreateModalOpen} 
        onClose={handleCloseCreateModal} 
        formData={formData} 
        onFieldChange={updateField} 
        onSubmit={handleCreateEmpleado} 
        loading={loading}
        isFormValid={isFormComplete(formData)}
      />
      <ViewEmpleadoModal 
        opened={isViewModalOpen} 
        onClose={handleCloseViewModal} 
        formData={formData} 
      />
      <EditEmpleadoModal 
        opened={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        formData={formData} 
        onFieldChange={updateField} 
        onSubmit={handleUpdateEmpleado} 
        loading={loading}
        isFormValid={isFormComplete(formData)}
      />
    </div>
  );
};

export default GestionEmpleadosComponent;
