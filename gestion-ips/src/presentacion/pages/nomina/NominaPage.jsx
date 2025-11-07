import { Paper, Button, Group, Pagination, LoadingOverlay, Alert, Box, Title, Text, Badge, Divider, Stack, SimpleGrid } from '@mantine/core';
import { IconPlus, IconAlertCircle, IconCheck, IconUser, IconCalendar, IconCash, IconReceipt, IconPrinter } from '@tabler/icons-react';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import { useNominaManagement } from '../../../negocio/hooks/nomina/useNominaManagement';
import { useNominaFilters } from '../../../negocio/hooks/nomina/useNominaFilters';
import { NominaTable } from '../../components/nomina/NominaTable';
import { NominaFilters } from '../../components/nomina/NominaFilters';
import { NominaForm } from '../../components/nomina/NominaForm';
import { generarDesprendibleHTML } from '../../components/nomina/DesprendiblePagoHTML';

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

  // NOTA: Las nóminas NO se pueden editar una vez creadas
  // Solo se pueden ver, desactivar o eliminar
  
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
      // Solo se permite crear nóminas, no editar
      await createNomina(nominaData.empleadoId, nominaData);
      
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
   * Abre ventana para imprimir desprendible
   */
  const handlePrintDesprendible = (nomina) => {
    // Configuración de empresa (puede venir de un store global)
    const empresaInfo = {
      nombre: 'GESTIÓN IPS',
      nit: '900.123.456-7',
      direccion: 'Calle 123 #45-67, Bogotá D.C.'
    };

    // Generar HTML del desprendible
    const htmlContent = generarDesprendibleHTML(nomina, empresaInfo);
    
    // Abrir ventana nueva con el desprendible
    const ventana = window.open('', '_blank', 'width=800,height=1000');
    
    if (ventana) {
      ventana.document.write(htmlContent);
      ventana.document.close();
    } else {
      alert('Por favor, permita las ventanas emergentes para imprimir el desprendible.');
    }
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
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0);
    };

    modals.open({
      title: (
        <Group>
          <IconReceipt size={24} color="#228BE6" />
          <Title order={3}>Detalle de Nómina</Title>
        </Group>
      ),
      size: 'lg',
      children: (
        <Stack gap="md">
          {/* Información del Empleado */}
          <Paper p="md" withBorder radius="md" bg="blue.0">
            <Group mb="xs">
              <IconUser size={20} color="#228BE6" />
              <Title order={5} c="blue.7">Información del Empleado</Title>
            </Group>
            <SimpleGrid cols={2} spacing="xs">
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Nombre Completo</Text>
                <Text size="sm" fw={600}>{nomina.empleadoNombre || '-'}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Documento</Text>
                <Text size="sm" fw={600}>{nomina.empleadoDocumento || '-'}</Text>
              </Box>
            </SimpleGrid>
          </Paper>

          {/* Información del Periodo */}
          <Paper p="md" withBorder radius="md">
            <Group mb="xs">
              <IconCalendar size={20} color="#228BE6" />
              <Title order={5} c="blue.7">Periodo y Pago</Title>
            </Group>
            <SimpleGrid cols={3} spacing="md">
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Periodo</Text>
                <Text size="sm" fw={600}>{nomina.periodo || '-'}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Fecha de Pago</Text>
                <Text size="sm" fw={600}>{nomina.fechaPago || '-'}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={500}>Estado</Text>
                <Badge color={nomina.activo ? 'green' : 'red'} variant="light">
                  {nomina.activo ? 'Activa' : 'Inactiva'}
                </Badge>
              </Box>
            </SimpleGrid>
          </Paper>

          {/* Resumen Financiero */}
          <SimpleGrid cols={2} spacing="md">
            {/* Devengados */}
            <Paper p="md" withBorder radius="md" bg="green.0">
              <Group mb="sm">
                <IconCash size={18} color="#37B24D" />
                <Title order={6} c="green.7">Devengados</Title>
              </Group>
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Salario Base</Text>
                  <Text size="xs" fw={600}>{formatCurrency(nomina.salarioBase)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Aux. Transporte</Text>
                  <Text size="xs" fw={600}>{formatCurrency(nomina.auxilioTransporte || 0)}</Text>
                </Group>
                {(nomina.bonificaciones > 0 || nomina.comisiones > 0 || nomina.otrosIngresos > 0) && (
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Otros</Text>
                    <Text size="xs" fw={600}>{formatCurrency((nomina.bonificaciones || 0) + (nomina.comisiones || 0) + (nomina.otrosIngresos || 0))}</Text>
                  </Group>
                )}
              </Stack>
              <Divider my="xs" variant="dashed" />
              <Group justify="space-between">
                <Text fw={700} size="sm" c="green.7">Total</Text>
                <Text size="md" fw={700} c="green.7">{formatCurrency(nomina.totalDevengado)}</Text>
              </Group>
            </Paper>

            {/* Deducciones */}
            <Paper p="md" withBorder radius="md" bg="red.0">
              <Group mb="sm">
                <IconReceipt size={18} color="#F03E3E" />
                <Title order={6} c="red.7">Deducciones</Title>
              </Group>
              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Salud</Text>
                  <Text size="xs" fw={600}>{formatCurrency(nomina.deduccionSalud || 0)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Pensión</Text>
                  <Text size="xs" fw={600}>{formatCurrency(nomina.deduccionPension || 0)}</Text>
                </Group>
                {(nomina.prestamos > 0 || nomina.embargos > 0 || nomina.otrasDeducciones > 0) && (
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Otros</Text>
                    <Text size="xs" fw={600}>{formatCurrency((nomina.prestamos || 0) + (nomina.embargos || 0) + (nomina.otrasDeducciones || 0))}</Text>
                  </Group>
                )}
              </Stack>
              <Divider my="xs" variant="dashed" />
              <Group justify="space-between">
                <Text fw={700} size="sm" c="red.7">Total</Text>
                <Text size="md" fw={700} c="red.7">{formatCurrency(nomina.totalDeducciones)}</Text>
              </Group>
            </Paper>
          </SimpleGrid>

          {/* Total Neto a Pagar */}
          <Paper p="sm" withBorder radius="md" bg="blue.6">
            <Group justify="space-between" align="center">
              <Text size="sm" c="white" fw={600}>NETO A PAGAR</Text>
              <Text size="xl" fw={900} c="white">
                {formatCurrency(nomina.netoPagar || nomina.totalPagar)}
              </Text>
            </Group>
          </Paper>

          {/* Observaciones */}
          {nomina.observaciones && (
            <Paper p="sm" withBorder radius="md" bg="gray.0">
              <Text size="xs" fw={600} mb={4} c="gray.7">Observaciones</Text>
              <Text size="xs" c="dimmed">{nomina.observaciones}</Text>
            </Paper>
          )}

          {/* Botón para imprimir desprendible */}
          <Button
            fullWidth
            leftSection={<IconPrinter size={16} />}
            variant="light"
            onClick={() => {
              modals.closeAll();
              handlePrintDesprendible(nomina);
            }}
          >
            Imprimir Desprendible de Pago
          </Button>
        </Stack>
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
