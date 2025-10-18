import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Group } from '@mantine/core';
import Swal from 'sweetalert2';
import ServiceAlert from '../ui/ServiceAlert.jsx';

// Custom Hooks
import { useEmpleados } from '../../../negocio/hooks/useEmpleados';
import { useEmpleadoSearch } from '../../../negocio/hooks/useEmpleadoSearch';
import { useEmpleadoUserValidation } from '../../../negocio/hooks/useEmpleadoUserValidation';

// Utilities
import {
  parseEmpleadoData,
  empleadoToUserData,
  formatEmpleadoForAPI,
  parseEmpleadoToFormData,
  getEmptyFormData,
  validateEmpleadoForm
} from '../../../negocio/utils/empleadoUtils';

// Components
import EmpleadoForm from './EmpleadoForm';
import EmpleadoTable from './EmpleadoTable';
import EmpleadoViewModal from './EmpleadoViewModal';
import EmpleadoSearchBar from './EmpleadoSearchBar';

const GestionEmpleadosComponent = () => {
  const navigate = useNavigate();
  const [searchParams] = useState({});

  // Custom Hooks
  const {
    empleados,
    loading,
    error,
    connectionError,
    loadEmpleados,
    createEmpleado,
    updateEmpleado,
    deactivateEmpleado,
    getEmpleadoById
  } = useEmpleados(searchParams);

  const { searchTerm, filteredEmpleados, handleSearch, clearSearch } = useEmpleadoSearch(empleados);
  const { userCheckCache, checkingUsers } = useEmpleadoUserValidation(empleados);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Data States
  const [empleadoToView, setEmpleadoToView] = useState(null);
  const [empleadoToEdit, setEmpleadoToEdit] = useState(null);
  const [formData, setFormData] = useState(getEmptyFormData());

  // ============================================
  // Handlers para modales
  // ============================================

  const handleOpenCreateModal = () => {
    setFormData(getEmptyFormData());
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleOpenViewModal = async (empleado) => {
    const result = await getEmpleadoById(empleado.id);
    if (result.success) {
      setEmpleadoToView(result.data);
      setIsViewModalOpen(true);
    } else {
      Swal.fire({
        title: 'Error',
        text: result.error,
        icon: 'error'
      });
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setEmpleadoToView(null);
  };

  const handleOpenEditModal = async (empleado) => {
    const result = await getEmpleadoById(empleado.id);
    if (result.success) {
      const empleadoData = result.data;
      const parsedData = parseEmpleadoData(empleadoData.jsonData);
      const formDataToSet = parseEmpleadoToFormData(parsedData);
      
      console.log('📝 Datos parseados del empleado:', parsedData);
      console.log('📋 FormData a establecer:', formDataToSet);
      
      setFormData(formDataToSet);
      setEmpleadoToEdit(empleadoData);
      setIsEditModalOpen(true);
    } else {
      Swal.fire({
        title: 'Error',
        text: result.error,
        icon: 'error'
      });
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEmpleadoToEdit(null);
  };

  // ============================================
  // Handlers para CRUD
  // ============================================

  const handleCreateEmpleado = async () => {
    if (!validateEmpleadoForm(formData)) {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor complete todos los campos requeridos',
        icon: 'warning'
      });
      return;
    }

    const jsonData = formatEmpleadoForAPI(formData);
    const result = await createEmpleado(jsonData);

    if (result.success) {
      Swal.fire({
        title: '¡Empleado creado!',
        text: 'El empleado ha sido registrado correctamente',
        icon: 'success',
        timer: 5000,
        showConfirmButton: false
      });
      setIsCreateModalOpen(false);
    } else {
      Swal.fire({
        title: 'Error al crear empleado',
        text: result.error,
        icon: 'error'
      });
    }
  };

  const handleUpdateEmpleado = async () => {
    if (!validateEmpleadoForm(formData)) {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'Por favor complete todos los campos requeridos',
        icon: 'warning'
      });
      return;
    }

    const jsonData = formatEmpleadoForAPI(formData, empleadoToEdit?.activo ?? true);
    const result = await updateEmpleado(empleadoToEdit.id, jsonData);

    if (result.success) {
      Swal.fire({
        title: '¡Empleado actualizado!',
        text: 'Los datos del empleado han sido actualizados correctamente',
        icon: 'success',
        timer: 5000,
        showConfirmButton: false
      });
      setIsEditModalOpen(false);
      setEmpleadoToEdit(null);
    } else {
      Swal.fire({
        title: 'Error al actualizar empleado',
        text: result.error,
        icon: 'error'
      });
    }
  };

  const handleDeactivateEmpleado = async (empleado) => {
    const { numeroDocumento } = parseEmpleadoData(empleado.jsonData);

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

    if (!result.isConfirmed) return;

    const deactivateResult = await deactivateEmpleado(empleado.id);

    if (deactivateResult.success) {
      Swal.fire({
        title: 'Empleado desactivado',
        text: 'El empleado ha sido desactivado correctamente',
        icon: 'warning',
        timer: 5000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: deactivateResult.error,
        icon: 'error'
      });
    }
  };

  // ============================================
  // Handler para crear usuario
  // ============================================

  const handleCreateUserFromEmployee = (empleado) => {
    const empleadoData = parseEmpleadoData(empleado.jsonData);
    const userData = empleadoToUserData(empleadoData);

    console.log('🚀 Navegando a usuarios con datos del empleado:', userData);
    navigate('/usuarios', {
      state: {
        createUserFromEmployee: true,
        employeeData: userData
      }
    });
  };

  // ============================================
  // Render
  // ============================================

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
          onRetry={loadEmpleados}
          retryLabel="Reintentar Conexión"
        />
      )}

      {/* Search Bar */}
      <EmpleadoSearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onClear={clearSearch}
        resultCount={filteredEmpleados.length}
        totalCount={empleados.length}
      />

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <EmpleadoTable
            empleados={filteredEmpleados}
            loading={loading}
            userCheckCache={userCheckCache}
            checkingUsers={checkingUsers}
            onView={handleOpenViewModal}
            onEdit={handleOpenEditModal}
            onCreateUser={handleCreateUserFromEmployee}
            onDeactivate={handleDeactivateEmpleado}
          />

          {filteredEmpleados.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? `No se encontraron empleados que coincidan con "${searchTerm}"` : 'No hay empleados registrados'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Creación */}
      <Modal
        opened={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Registrar Nuevo Empleado"
        size="xl"
        centered
      >
        <EmpleadoForm
          formData={formData}
          setFormData={setFormData}
          mode="create"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleCloseCreateModal}>
            Cancelar
          </Button>
          <Button
            color="blue"
            onClick={handleCreateEmpleado}
            loading={loading}
            disabled={!validateEmpleadoForm(formData)}
          >
            Crear Empleado
          </Button>
        </Group>
      </Modal>

      {/* Modal de Visualización */}
      <EmpleadoViewModal
        opened={isViewModalOpen}
        onClose={handleCloseViewModal}
        empleado={empleadoToView}
      />

      {/* Modal de Edición */}
      <Modal
        opened={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Editar Empleado"
        size="xl"
        centered
      >
        <EmpleadoForm
          formData={formData}
          setFormData={setFormData}
          mode="edit"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleCloseEditModal}>
            Cancelar
          </Button>
          <Button
            color="blue"
            onClick={handleUpdateEmpleado}
            loading={loading}
            disabled={!validateEmpleadoForm(formData)}
          >
            Actualizar Empleado
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default GestionEmpleadosComponent;
