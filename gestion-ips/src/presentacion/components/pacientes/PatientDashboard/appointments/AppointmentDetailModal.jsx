import React from 'react';
import { Modal, Badge, Group, Text, Stack, Paper, Grid, Loader, Button, Divider, Code } from '@mantine/core';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';
import { IconUser, IconCalendar, IconClock, IconFileText } from '@tabler/icons-react';
import { appointmentService } from '../../../../../negocio/services/appointmentService.js';

const AppointmentDetailModal = ({
  isOpen,
  onClose,
  selectedAppointment,
  appointmentDetailPatientInfo,
  loadingAppointmentDetailPatient,
  getAppointmentInfo,
  getAppointmentPatientInfo,
  getAvailableStatusTransitions,
  updateAppointmentStatus,
  user,
  onAtendidoClick
}) => {
  const { tema } = useTheme();
  if (!isOpen || !selectedAppointment) return null;

  const { formatDate } = appointmentService;
  const appointmentInfo = getAppointmentInfo(selectedAppointment);

  const getStatusColor = (status) => {
    const colors = {
      'PROGRAMADO': 'blue',
      'EN_SALA': 'yellow',
      'ATENDIDO': 'green',
      'CANCELADA': 'gray',
      'NO_SE_PRESENTO': 'red'
    };
    return colors[status] || 'blue';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PROGRAMADO': 'Programado',
      'EN_SALA': 'En Sala',
      'ATENDIDO': 'Atendido',
      'NO_SE_PRESENTO': 'No se Presentó',
      'CANCELADA': 'Cancelada'
    };
    return labels[status] || status;
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Detalle de la Cita #${selectedAppointment.id}`}
      size="xl"
      centered
      overlayProps={{ color: tema.primaryColor, opacity: 0.55, blur: 3 }}
      styles={{ header: { backgroundColor: `${tema.primaryColor} !important`, padding: '10px 16px' }, title: { color: 'white !important' }, close: { color: 'white !important' } }}
    >
      <Stack gap="lg">
        {/* Estado y Fecha */}
        <Group justify="space-between">
          <Group gap="md">
            <Badge color={getStatusColor(appointmentInfo.estado)} size="lg" variant="light">
              {getStatusLabel(appointmentInfo.estado)}
            </Badge>
            <Group gap="xs">
              <IconClock size={16} color="gray" />
              <Text size="sm" c="dimmed">
                {appointmentInfo.fechaHoraCita ? formatDate(appointmentInfo.fechaHoraCita) : 'Fecha no disponible'}
              </Text>
            </Group>
          </Group>
          <Text size="xs" c="dimmed">
            Creada: {formatDate(selectedAppointment.fechaCreacion)}
          </Text>
        </Group>

        <Divider />

        {/* Información del Paciente */}
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Group mb="sm" gap="xs">
            <IconUser size={20} />
            <Text size="lg" fw={600}>Información del Paciente</Text>
          </Group>
          {loadingAppointmentDetailPatient ? (
            <Group justify="center" py="md">
              <Loader size="md" />
              <Text size="sm" c="dimmed">Cargando información del paciente...</Text>
            </Group>
          ) : appointmentDetailPatientInfo ? (
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={4}>
                  <Text size="sm" fw={500}>Nombre Completo</Text>
                  <Text size="sm" c="dimmed">{appointmentDetailPatientInfo.nombre}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={4}>
                  <Text size="sm" fw={500}>Documento</Text>
                  <Text size="sm" c="dimmed">{appointmentDetailPatientInfo.documento}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={4}>
                  <Text size="sm" fw={500}>Teléfono</Text>
                  <Text size="sm" c="dimmed">{appointmentDetailPatientInfo.telefono}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={4}>
                  <Text size="sm" fw={500}>Estado</Text>
                  <Badge color={appointmentDetailPatientInfo.estado === 'Activo' ? 'green' : 'red'} variant="light">
                    {appointmentDetailPatientInfo.estado}
                  </Badge>
                </Stack>
              </Grid.Col>
            </Grid>
          ) : (
            <Text size="sm" c="dimmed">No se pudo cargar la información del paciente</Text>
          )}
        </Paper>

        {/* Información de la Cita */}
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
          <Group mb="sm" gap="xs">
            <IconCalendar size={20} color="var(--mantine-color-blue-6)" />
            <Text size="lg" fw={600} c="blue">Información de la Cita</Text>
          </Group>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap={4}>
                <Text size="sm" fw={500} c="blue.9">Especialidad</Text>
                <Text size="sm" c="blue.7">{appointmentInfo.especialidad}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap={4}>
                <Text size="sm" fw={500} c="blue.9">Médico Asignado</Text>
                <Text size="sm" c="blue.7">{appointmentInfo.medicoAsignado}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap={4}>
                <Text size="sm" fw={500} c="blue.9">Tipo de Cita</Text>
                <Text size="sm" c="blue.7">{appointmentInfo.tipoCita}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap={4}>
                <Text size="sm" fw={500} c="blue.9">Motivo</Text>
                <Text size="sm" c="blue.7">{appointmentInfo.motivo}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap={4}>
                <Text size="sm" fw={500} c="blue.9">Duración</Text>
                <Text size="sm" c="blue.7">{appointmentInfo.duracion} minutos</Text>
              </Stack>
            </Grid.Col>
          </Grid>

          {/* Notas adicionales */}
          {appointmentInfo.notas && appointmentInfo.notas !== 'Sin notas' && (
            <Stack gap="xs" mt="md">
              <Text size="sm" fw={500} c="blue.9">Notas Adicionales</Text>
              <Paper p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-1)', borderLeft: '4px solid var(--mantine-color-blue-5)' }}>
                <Text size="sm" c="blue.7">{appointmentInfo.notas}</Text>
              </Paper>
            </Stack>
          )}
        </Paper>

        {/* Información CUPS */}
        {appointmentInfo.codigoCups && (
          <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
            <Group mb="sm" gap="xs">
              <IconFileText size={20} color="var(--mantine-color-green-6)" />
              <Text size="lg" fw={600} c="green">Código CUPS</Text>
            </Group>
            <Group mb="sm">
              <Text size="sm" fw={500} c="green.9">Código:</Text>
              <Code color="green">{appointmentInfo.codigoCups}</Code>
            </Group>
            {appointmentInfo.informacionCups && (
              <Grid gutter="sm">
                {appointmentInfo.informacionCups.categoria && (
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Text size="xs" c="green.8">
                      <Text component="span" fw={500}>Categoría:</Text> {appointmentInfo.informacionCups.categoria}
                    </Text>
                  </Grid.Col>
                )}
                {appointmentInfo.informacionCups.tipo && (
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Text size="xs" c="green.8">
                      <Text component="span" fw={500}>Tipo:</Text> {appointmentInfo.informacionCups.tipo}
                    </Text>
                  </Grid.Col>
                )}
                {appointmentInfo.informacionCups.ambito && (
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Text size="xs" c="green.8">
                      <Text component="span" fw={500}>Ámbito:</Text> {appointmentInfo.informacionCups.ambito}
                    </Text>
                  </Grid.Col>
                )}
                {appointmentInfo.informacionCups.equipo_requerido && (
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Text size="xs" c="green.8">
                      <Text component="span" fw={500}>Equipo Requerido:</Text> {appointmentInfo.informacionCups.equipo_requerido}
                    </Text>
                  </Grid.Col>
                )}
              </Grid>
            )}
          </Paper>
        )}

        {/* Acciones disponibles */}
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Text size="lg" fw={600} mb="md">Acciones Disponibles</Text>
          <Group gap="sm">
            {getAvailableStatusTransitions(appointmentInfo.estado)
              .filter(newStatus => {
                // Solo mostrar ATENDIDO si el usuario tiene permisos (ADMIN o DOCTOR)
                if (newStatus === 'ATENDIDO') {
                  return user && (user.rol === 'ADMIN' || user.rol === 'DOCTOR');
                }
                return true;
              })
              .map((newStatus) => (
              <Button
                key={newStatus}
                color={getStatusColor(newStatus)}
                variant="filled"
                onClick={() => {
                  if (newStatus === 'ATENDIDO') {
                    onAtendidoClick(selectedAppointment);
                  } else {
                    updateAppointmentStatus(selectedAppointment.id, newStatus);
                  }
                  onClose();
                }}
              >
                {newStatus === 'CANCELADA' ? 'Cancelar Cita' : getStatusLabel(newStatus)}
              </Button>
            ))}
          </Group>
        </Paper>

        {/* Footer */}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AppointmentDetailModal;
