import React from 'react';
import { Paper, Stack, Text, Badge, Group, Loader, Button, ActionIcon, Grid } from '@mantine/core';
import { IconClock, IconUser } from '@tabler/icons-react';

/**
 * Componente que muestra la lista de citas programadas del día
 */
const DailyAppointmentsList = ({
  selectedDate,
  user,
  loadingAppointments,
  allDoctorAppointments,
  getAppointmentInfo,
  updateAppointmentStatus,
  updatingStatus,
  onPatientClick,
  handleViewAppointmentDetail,
}) => {
  if (!selectedDate) return null;

  const isDoctor = user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO');

  // Verificar si hay citas no atendidas
  const hasUnattendedAppointments = Object.values(allDoctorAppointments).some(doctorData =>
    doctorData.appointments.some(appointment => {
      try {
        const appointmentData = JSON.parse(appointment.datosJson || '{}');
        return appointmentData.estado !== 'ATENDIDO';
      } catch (error) {
        return true;
      }
    })
  );

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

  const getButtonColor = (status) => {
    const colors = {
      'EN_SALA': 'yellow',
      'ATENDIDO': 'green',
      'NO_SE_PRESENTO': 'red',
      'CANCELADA': 'gray'
    };
    return colors[status] || 'blue';
  };

  const getButtonLabel = (status) => {
    const labels = {
      'EN_SALA': 'Marcar En Sala',
      'ATENDIDO': 'Marcar Atendido',
      'NO_SE_PRESENTO': 'No se Presentó',
      'CANCELADA': 'Cancelar'
    };
    return labels[status] || status;
  };

  // Ajustar el diseño para mostrar las citas en dos columnas
  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        {isDoctor
          ? `Mis Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
          : `Todas las Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
        }
      </Text>

      {loadingAppointments ? (
        <Paper p="md" radius="md" withBorder>
          <Group justify="center" gap="sm">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">Cargando citas...</Text>
          </Group>
        </Paper>
      ) : hasUnattendedAppointments ? (
        <Grid gutter="md" columns={2} style={{ maxHeight: '320px', overflowY: 'auto' }}>
          {Object.entries(allDoctorAppointments).map(([doctorId, doctorData]) =>
            doctorData.appointments
              .filter(appointment => {
                try {
                  const appointmentData = JSON.parse(appointment.datosJson || '{}');
                  return appointmentData.estado !== 'ATENDIDO';
                } catch (error) {
                  return true;
                }
              })
              .map((appointment) => {
                const appointmentInfo = getAppointmentInfo(appointment);

                return (
                  <Grid.Col span={1} key={appointment.id}>
                    <Paper
                      p="md"
                      radius="md"
                      withBorder
                      style={{ cursor: 'default' }}
                      className="hover:bg-gray-50"
                    >
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Group gap="sm" wrap="wrap">
                            <Text size="sm" fw={500}>{appointment.patient || 'Paciente'}</Text>
                            <Badge color={getStatusColor(appointmentInfo.estado)} variant="light" size="sm">
                              {getStatusLabel(appointmentInfo.estado)}
                            </Badge>
                          </Group>
                          <Stack gap={4}>
                            <Group gap="xs">
                              <Text size="xs" c="dimmed" fw={500}>Tipo:</Text>
                              <Text size="xs" c="dimmed">{appointmentInfo.tipoCita}</Text>
                            </Group>
                            <Group gap="xs">
                              <IconClock size={12} color="gray" />
                              <Text size="xs" c="dimmed" fw={500}>Duración:</Text>
                              <Text size="xs" c="dimmed">{appointmentInfo.duracion} min</Text>
                            </Group>
                            <Group gap="xs">
                              <IconUser size={12} color="gray" />
                              <Text size="xs" c="dimmed" fw={500}>Doctor:</Text>
                              <Text size="xs" c="dimmed">{doctorData.doctorName}</Text>
                            </Group>
                          </Stack>
                        </Stack>

                        {/* Estado change buttons */}
                          <Group gap="xs" style={{ minWidth: '140px' }}>
                          <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            onClick={() => onPatientClick(appointment.pacienteId)}
                            title="Ver paciente"
                          >
                            <IconUser size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewAppointmentDetail(appointment)}
                            title="Detalle de la cita"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  </Grid.Col>
                );
              })
          )}
        </Grid>
      ) : (
        <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Text size="sm" c="dimmed" ta="center">
            No hay citas programadas para esta fecha
          </Text>
        </Paper>
      )}
    </Stack>
  );
};

export default DailyAppointmentsList;
