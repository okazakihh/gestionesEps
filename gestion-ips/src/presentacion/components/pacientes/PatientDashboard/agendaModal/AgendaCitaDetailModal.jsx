import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Paper, Text, Grid, Badge, Group, Button, Stack, Divider } from '@mantine/core';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';
import { UserIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import AgendaStatusBadge from './AgendaStatusBadge.jsx';
import Swal from 'sweetalert2';

/**
 * Componente para el modal de detalle de cita
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.cita - Datos de la cita
 * @param {Object} props.citaInfo - Información parseada de la cita
 * @param {Object} props.pacienteInfo - Información del paciente
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.formatDate - Función para formatear fechas
 * @param {Array} props.availableStatusTransitions - Transiciones de estado disponibles
 * @param {Function} props.onStatusChange - Función para cambiar estado
 * @param {Object} props.updatingStatus - Estados de carga de actualización
 * @returns {JSX.Element} Modal de detalle de cita
 */
const AgendaCitaDetailModal = ({
  cita,
  citaInfo,
  pacienteInfo,
  onClose,
  formatDate,
  availableStatusTransitions,
  onStatusChange,
  updatingStatus
}) => {
  const { tema } = useTheme();
  return (
    <Modal
      opened={true}
      onClose={onClose}
      title={`Detalle de la Cita #${cita.id}`}
      size="xl"
      centered
      overlayProps={{ color: tema.overlayColor, backgroundOpacity: 0.55, blur: 3 }}
      styles={{
        title: { fontSize: '1.25rem', fontWeight: 600, color: 'white !important' },
        header: { backgroundColor: `${tema.primaryColor} !important`, padding: '10px 16px' },
        close: { color: 'white !important' }
      }}
    >
      <Stack gap="md">
        {/* Estado y Fecha */}
        <Group justify="space-between">
          <Group gap="md">
            <AgendaStatusBadge status={citaInfo.estado} />
            <Group gap="xs">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <Text size="sm" c="dimmed">
                {citaInfo.fechaHoraCita ? formatDate(citaInfo.fechaHoraCita) : 'Fecha no disponible'}
              </Text>
            </Group>
          </Group>
          <Text size="xs" c="dimmed">
            Creada: {formatDate(cita.fechaCreacion)}
          </Text>
        </Group>

        <Divider />

        {/* Información del Paciente */}
        <Paper p="md" withBorder style={{ backgroundColor: '#f9fafb' }}>
          <Group mb="md">
            <UserIcon className="h-5 w-5 text-gray-600" />
            <Text size="lg" fw={600}>Información del Paciente</Text>
          </Group>
          <Grid gutter="md">
            <Grid.Col span={6}>
              <Text size="sm" fw={500} mb={4}>Nombre Completo</Text>
              <Text size="sm" c="dimmed">{pacienteInfo.nombre}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500} mb={4}>Documento</Text>
              <Text size="sm" c="dimmed">{pacienteInfo.documento}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500} mb={4}>Teléfono</Text>
              <Text size="sm" c="dimmed">{pacienteInfo.telefono}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500} mb={4}>Estado</Text>
              <Badge color={cita.activo ? 'green' : 'red'} variant="light">
                {cita.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Información de la Cita */}
        <Paper p="md" withBorder style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <Group mb="md">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
            <Text size="lg" fw={600} c="blue.9">Información de la Cita</Text>
          </Group>
          <Grid gutter="md">
            <Grid.Col span={6}>
              <Text size="sm" fw={500} c="blue.9" mb={4}>Especialidad</Text>
              <Text size="sm" c="blue.7">{citaInfo.especialidad}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500} c="blue.9" mb={4}>Médico Asignado</Text>
              <Text size="sm" c="blue.7">{citaInfo.medicoAsignado}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500} c="blue.9" mb={4}>Tipo de Cita</Text>
              <Text size="sm" c="blue.7">{citaInfo.tipoCita}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={500} c="blue.9" mb={4}>Motivo</Text>
              <Text size="sm" c="blue.7">{citaInfo.motivo}</Text>
            </Grid.Col>
          </Grid>

          {/* Notas adicionales */}
          {citaInfo.notas && citaInfo.notas !== 'Sin notas' && (
            <div style={{ marginTop: '1rem' }}>
              <Text size="sm" fw={500} c="blue.9" mb="xs">Notas Adicionales</Text>
              <Paper p="sm" style={{ backgroundColor: '#dbeafe', borderLeft: '4px solid #3b82f6' }}>
                <Text size="sm" c="blue.7">{citaInfo.notas}</Text>
              </Paper>
            </div>
          )}
        </Paper>

        {/* Información CUPS */}
        {citaInfo.codigoCups && (
          <Paper p="md" withBorder style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <Group mb="md">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <Text size="lg" fw={600} c="green.9">Código CUPS</Text>
            </Group>
            <Group mb="sm">
              <Text size="sm" fw={500} c="green.9">Código:</Text>
              <Badge variant="light" color="green" size="lg" style={{ fontFamily: 'monospace' }}>
                {citaInfo.codigoCups}
              </Badge>
            </Group>
            {citaInfo.informacionCups && (
              <Grid gutter="xs">
                {citaInfo.informacionCups.categoria && (
                  <Grid.Col span={6}>
                    <Text size="xs" fw={500} c="green.8" span>Categoría: </Text>
                    <Text size="xs" c="green.7" span>{citaInfo.informacionCups.categoria}</Text>
                  </Grid.Col>
                )}
                {citaInfo.informacionCups.tipo && (
                  <Grid.Col span={6}>
                    <Text size="xs" fw={500} c="green.8" span>Tipo: </Text>
                    <Text size="xs" c="green.7" span>{citaInfo.informacionCups.tipo}</Text>
                  </Grid.Col>
                )}
                {citaInfo.informacionCups.ambito && (
                  <Grid.Col span={6}>
                    <Text size="xs" fw={500} c="green.8" span>Ámbito: </Text>
                    <Text size="xs" c="green.7" span>{citaInfo.informacionCups.ambito}</Text>
                  </Grid.Col>
                )}
                {citaInfo.informacionCups.equipo_requerido && (
                  <Grid.Col span={6}>
                    <Text size="xs" fw={500} c="green.8" span>Equipo Requerido: </Text>
                    <Text size="xs" c="green.7" span>{citaInfo.informacionCups.equipo_requerido}</Text>
                  </Grid.Col>
                )}
              </Grid>
            )}
          </Paper>
        )}

        {/* Acciones disponibles */}
        <Paper p="md" withBorder style={{ backgroundColor: '#f9fafb' }}>
          <Text size="lg" fw={600} mb="md">Acciones Disponibles</Text>
          <Group gap="sm">
            {availableStatusTransitions.map((newStatus) => (
              <Button
                key={newStatus}
                onClick={async () => {
                  // Confirmación para acciones críticas
                  if (newStatus === 'ATENDIDO') {
                    const result = await Swal.fire({
                      title: '¿Marcar cita como atendida?',
                      text: 'Esta acción creará automáticamente la historia clínica y consulta médica si no existen. ¿Desea continuar?',
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonColor: '#10B981',
                      cancelButtonColor: '#6B7280',
                      confirmButtonText: 'Sí, marcar como atendida',
                      cancelButtonText: 'Cancelar'
                    });

                    if (result.isConfirmed) {
                      try {
                        await onStatusChange(cita.id, newStatus);
                        Swal.fire({
                          title: '¡Éxito!',
                          text: 'La cita ha sido marcada como atendida.',
                          icon: 'success',
                          timer: 2000,
                          showConfirmButton: false
                        });
                      } catch (error) {
                        console.error('Error updating appointment status:', error);
                        Swal.fire({
                          title: 'Error',
                          text: error.message || 'No se pudo actualizar el estado de la cita.',
                          icon: 'error'
                        });
                      }
                    }
                  } else if (newStatus === 'CANCELADO') {
                    const result = await Swal.fire({
                      title: '¿Cancelar Cita?',
                      text: 'Esta acción liberará el espacio en el calendario y la cita ya no podrá ser modificada. ¿Estás seguro?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#EF4444',
                      cancelButtonColor: '#6B7280',
                      confirmButtonText: 'Sí, cancelar cita',
                      cancelButtonText: 'No, mantener cita'
                    });

                    if (result.isConfirmed) {
                      try {
                        await onStatusChange(cita.id, newStatus);
                        Swal.fire({
                          title: 'Cita Cancelada',
                          text: 'La cita ha sido cancelada exitosamente.',
                          icon: 'success',
                          timer: 2000,
                          showConfirmButton: false
                        });
                      } catch (error) {
                        console.error('Error updating appointment status:', error);
                        Swal.fire({
                          title: 'Error',
                          text: error.message || 'No se pudo cancelar la cita.',
                          icon: 'error'
                        });
                      }
                    }
                  } else {
                    const statusLabels = {
                      'EN_SALA': 'En Sala',
                      'NO_SE_PRESENTO': 'No se Presentó'
                    };

                    const result = await Swal.fire({
                      title: `¿Cambiar estado a "${statusLabels[newStatus] || newStatus}"?`,
                      text: '¿Está seguro de que desea cambiar el estado de esta cita?',
                      icon: 'question',
                      showCancelButton: true,
                      confirmButtonColor: '#3B82F6',
                      cancelButtonColor: '#6B7280',
                      confirmButtonText: 'Sí, cambiar estado',
                      cancelButtonText: 'Cancelar'
                    });

                    if (result.isConfirmed) {
                      try {
                        await onStatusChange(cita.id, newStatus);
                        Swal.fire({
                          title: '¡Éxito!',
                          text: `El estado de la cita ha sido cambiado a "${statusLabels[newStatus] || newStatus}".`,
                          icon: 'success',
                          timer: 2000,
                          showConfirmButton: false
                        });
                      } catch (error) {
                        console.error('Error updating appointment status:', error);
                        Swal.fire({
                          title: 'Error',
                          text: error.message || 'No se pudo actualizar el estado de la cita.',
                          icon: 'error'
                        });
                      }
                    }
                  }
                }}
                disabled={updatingStatus[cita.id]}
                loading={updatingStatus[cita.id]}
                color={
                  newStatus === 'EN_SALA' ? 'yellow' :
                  newStatus === 'ATENDIDO' ? 'green' :
                  newStatus === 'NO_SE_PRESENTO' ? 'red' :
                  newStatus === 'CANCELADO' ? 'gray' : 'blue'
                }
              >
                {getStatusLabel(newStatus)}
              </Button>
            ))}
          </Group>
        </Paper>

        <Divider />

        {/* Footer */}
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
// Helper function for status labels
const getStatusLabel = (status) => {
  const labels = {
    'PROGRAMADO': 'Programado',
    'EN_SALA': 'En Sala',
    'ATENDIDO': 'Atendido',
    'NO_SE_PRESENTO': 'No se Presentó',
    'CANCELADO': 'Cancelado'
  };
  return labels[status] || status;
};

AgendaCitaDetailModal.propTypes = {
  cita: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    fechaCreacion: PropTypes.string,
    activo: PropTypes.bool
  }).isRequired,
  citaInfo: PropTypes.shape({
    estado: PropTypes.string,
    fechaHoraCita: PropTypes.string,
    especialidad: PropTypes.string,
    medicoAsignado: PropTypes.string,
    tipoCita: PropTypes.string,
    motivo: PropTypes.string,
    notas: PropTypes.string,
    codigoCups: PropTypes.string,
    informacionCups: PropTypes.object
  }).isRequired,
  pacienteInfo: PropTypes.shape({
    nombre: PropTypes.string,
    documento: PropTypes.string,
    telefono: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  availableStatusTransitions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  updatingStatus: PropTypes.object.isRequired
};


export default AgendaCitaDetailModal;