import { Paper, Button, Group, Pagination, LoadingOverlay, Alert, Box } from '@mantine/core';
import { IconPlus, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import { useNominaManagement } from '../../../negocio/hooks/nomina/useNominaManagement';
import { useNominaFilters } from '../../../negocio/hooks/nomina/useNominaFilters';
import { NominaTable } from '../../components/nomina/NominaTable';
import { NominaFilters } from '../../components/nomina/NominaFilters';
import { NominaForm } from '../../components/nomina/NominaForm';

/**
 * Página principal del módulo de Nómina
 */
export const NominaPage = () => {
  // Hook de gestión de nóminas
  const {
    nominas,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    operationLoading,
    operationError,
    operationSuccess,
    loadNominas,
    createNomina,
    updateNomina,
    deactivateNomina,
    deleteNomina,
    handlePageChange,
    handlePageSizeChange,
    clearOperationMessages
  } = useNominaManagement();

  // Hook de filtros
  const {
    filteredNominas,
    searchTerm,
    empleadoFilter,
    periodoFilter,
    fechaDesde,
    fechaHasta,
    estadoFilter,
    setSearchTerm,
    setEmpleadoFilter,
    setPeriodoFilter,
    setFechaDesde,
    setFechaHasta,
    setEstadoFilter,
    clearFilters,
    hasActiveFilters,
    statistics,
    totalFiltered
  } = useNominaFilters(nominas);

  // Estado local
  const [formOpened, setFormOpened] = useState(false);
  const [nominaToEdit, setNominaToEdit] = useState(null);

  /**
   * Abre modal para crear nueva nómina
   */
  const handleOpenCreate = () => {
    setNominaToEdit(null);
    setFormOpened(true);
  };

  /**
   * Abre modal para editar nómina
   */
  const handleOpenEdit = (nomina) => {
    setNominaToEdit(nomina);
    setFormOpened(true);
  };

  /**
   * Cierra el modal de formulario
   */
  const handleCloseForm = () => {
    setFormOpened(false);
    setNominaToEdit(null);
    clearOperationMessages();
  };

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = async (nominaData) => {
    try {
      if (nominaToEdit) {
        // Actualizar
        await updateNomina(nominaToEdit.id, nominaData);
      } else {
        // Crear
        await createNomina(nominaData.empleadoId, nominaData);
      }
      
      handleCloseForm();
    } catch (err) {
      console.error('Error en submit:', err);
    }
  };

  /**
   * Confirma desactivación de nómina
   */
  const handleConfirmDeactivate = (nomina) => {
    modals.openConfirmModal({
      title: 'Desactivar Nómina',
      children: `¿Está seguro que desea desactivar la nómina del periodo ${nomina.periodo}?`,
      labels: { confirm: 'Desactivar', cancel: 'Cancelar' },
      confirmProps: { color: 'yellow' },
      onConfirm: async () => {
        try {
          await deactivateNomina(nomina.id);
        } catch (err) {
          console.error('Error desactivando:', err);
        }
      }
    });
  };

  /**
   * Confirma eliminación de nómina
   */
  const handleConfirmDelete = (nomina) => {
    modals.openConfirmModal({
      title: 'Eliminar Nómina',
      children: `¿Está seguro que desea eliminar permanentemente la nómina del periodo ${nomina.periodo}? Esta acción no se puede deshacer.`,
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteNomina(nomina.id);
        } catch (err) {
          console.error('Error eliminando:', err);
        }
      }
    });
  };

  /**
   * Ver detalles de nómina
   */
  const handleView = (nomina) => {
    modals.open({
      title: 'Detalles de Nómina',
      size: 'lg',
      children: (
        <Box>
          <Paper p="md" withBorder mb="sm">
            <Title order={6} mb="xs">Información del Empleado</Title>
            <div>
              <strong>Nombre:</strong> {nomina.empleadoNombre || nomina.empleado?.nombre || '-'}
            </div>
            <div>
              <strong>Documento:</strong> {nomina.empleadoDocumento || nomina.empleado?.documento || '-'}
            </div>
          </Paper>

          <Paper p="md" withBorder mb="sm">
            <Title order={6} mb="xs">Información de la Nómina</Title>
            <div>
              <strong>Periodo:</strong> {nomina.periodo || '-'}
            </div>
            <div>
              <strong>Fecha de Pago:</strong> {nomina.fechaPago || nomina.fecha || '-'}
            </div>
            <div>
              <strong>Estado:</strong> {nomina.activo ? 'Activa' : 'Inactiva'}
            </div>
          </Paper>

          <Paper p="md" withBorder mb="sm">
            <Title order={6} mb="xs">Devengados</Title>
            <div>
              <strong>Salario Base:</strong> ${Number(nomina.salarioBase || 0).toLocaleString('es-CO')}
            </div>
            <div>
              <strong>Horas Extras:</strong> ${Number(nomina.horasExtras || 0).toLocaleString('es-CO')}
            </div>
            <div>
              <strong>Bonificaciones:</strong> ${Number(nomina.bonificaciones || 0).toLocaleString('es-CO')}
            </div>
            <div>
              <strong>Total Devengado:</strong> ${Number(nomina.totalDevengado || 0).toLocaleString('es-CO')}
            </div>
          </Paper>

          <Paper p="md" withBorder mb="sm">
            <Title order={6} mb="xs">Deducciones</Title>
            <div>
              <strong>Deducciones:</strong> ${Number(nomina.deducciones || 0).toLocaleString('es-CO')}
            </div>
          </Paper>

          <Paper p="md" withBorder bg="blue.0">
            <Title order={5} c="blue">
              Total a Pagar: ${Number(nomina.totalPagar || 0).toLocaleString('es-CO')}
            </Title>
          </Paper>

          {nomina.observaciones && (
            <Paper p="md" withBorder mt="sm">
              <Title order={6} mb="xs">Observaciones</Title>
              <div>{nomina.observaciones}</div>
            </Paper>
          )}
        </Box>
      )
    });
  };

  return (
    <MainLayout
      title="Gestión de Nómina"
      subtitle="Administración de nóminas y pagos de empleados"
    >
      <div className="p-6">
        {/* Encabezado con botón de acción */}
        <Group justify="flex-end" mb="xl">
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleOpenCreate}
            disabled={loading || operationLoading}
          >
            Nueva Nómina
          </Button>
        </Group>

        {/* Mensajes de operación */}
        {operationSuccess && (
          <Alert
            icon={<IconCheck size={16} />}
            color="green"
            title="Éxito"
            mb="md"
            withCloseButton
            onClose={clearOperationMessages}
          >
            {operationSuccess}
          </Alert>
        )}

        {operationError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            title="Error"
            mb="md"
            withCloseButton
            onClose={clearOperationMessages}
          >
            {operationError}
          </Alert>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            title="Error de carga"
            mb="md"
          >
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <NominaFilters
          searchTerm={searchTerm}
          empleadoFilter={empleadoFilter}
          periodoFilter={periodoFilter}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          estadoFilter={estadoFilter}
          onSearchChange={setSearchTerm}
          onEmpleadoFilterChange={setEmpleadoFilter}
          onPeriodoFilterChange={setPeriodoFilter}
          onFechaDesdeChange={setFechaDesde}
          onFechaHastaChange={setFechaHasta}
          onEstadoFilterChange={setEstadoFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          totalFiltered={totalFiltered}
          totalOriginal={nominas.length}
          statistics={statistics}
        />

        {/* Tabla */}
        <Paper shadow="xs" p="md" mt="md" withBorder pos="relative">
          <LoadingOverlay visible={loading || operationLoading} />
          
          <NominaTable
            nominas={filteredNominas}
            loading={loading}
            onEdit={handleOpenEdit}
            onDelete={handleConfirmDelete}
            onDeactivate={handleConfirmDeactivate}
            onView={handleView}
          />

          {/* Paginación */}
          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                total={totalPages}
                value={currentPage + 1}
                onChange={(page) => handlePageChange(page - 1)}
                disabled={loading || operationLoading}
              />
            </Group>
          )}
        </Paper>

        {/* Modal de formulario */}
        <NominaForm
          opened={formOpened}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          nominaToEdit={nominaToEdit}
          loading={operationLoading}
        />
      </div>
    </MainLayout>
  );
};
