import React from 'react';
import { Paper, Stack, Text, Badge, Group, Loader, Button } from '@mantine/core';
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
  updatingStatus
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
        <Stack gap="sm" style={{ maxHeight: '320px', overflowY: 'auto' }}>
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
                let appointmentData;
                try {
                  appointmentData = JSON.parse(appointment.datosJson || '{}');
                } catch (error) {
                  appointmentData = {};
                }

                const currentStatus = appointmentData.estado || 'PROGRAMADO';
                const pacienteNombre = appointmentData.pacienteNombre || 'Paciente';
                const duracion = appointmentData.duracion || 30;
                const informacionCups = appointmentData.informacionCups || {};
                const tipo = informacionCups.tipo || 'REVISION PERIODICA';

                const transitions = {
                  'PROGRAMADO': ['EN_SALA', 'NO_SE_PRESENTO', 'CANCELADA'],
                  'EN_SALA': ['ATENDIDO'],
                  'ATENDIDO': [],
                  'NO_SE_PRESENTO': [],
                  'CANCELADA': []
                };

                const availableTransitions = transitions[currentStatus] || [];

                return (
                  <Paper
                    key={appointment.id}
                    p="md"
                    radius="md"
                    withBorder
                    style={{ cursor: 'default' }}
                    className="hover:bg-gray-50"
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Group gap="sm" wrap="wrap">
                          <Text size="sm" fw={500}>{pacienteNombre}</Text>
                          <Badge color={getStatusColor(currentStatus)} variant="light" size="sm">
                            {getStatusLabel(currentStatus)}
                          </Badge>
                        </Group>
                        <Stack gap={4}>
                          <Group gap="xs">
                            <Text size="xs" c="dimmed" fw={500}>Tipo:</Text>
                            <Text size="xs" c="dimmed">{tipo}</Text>
                          </Group>
                          <Group gap="xs">
                            <IconClock size={12} color="gray" />
                            <Text size="xs" c="dimmed" fw={500}>Duración:</Text>
                            <Text size="xs" c="dimmed">{duracion} min</Text>
                          </Group>
                          <Group gap="xs">
                            <IconUser size={12} color="gray" />
                            <Text size="xs" c="dimmed" fw={500}>Doctor:</Text>
                            <Text size="xs" c="dimmed">{doctorData.doctorName}</Text>
                          </Group>
                        </Stack>
                      </Stack>

                      {/* Estado change buttons */}
                      <Stack gap="xs" style={{ minWidth: '140px' }}>
                        {availableTransitions.map(newStatus => (
                          <Button
                            key={newStatus}
                            size="compact-xs"
                            color={getButtonColor(newStatus)}
                            variant="light"
                            onClick={async () => {
                              await updateAppointmentStatus(appointment.id, newStatus);
                            }}
                            loading={updatingStatus[appointment.id]}
                            disabled={updatingStatus[appointment.id]}
                          >
                            {getButtonLabel(newStatus)}
                          </Button>
                        ))}
                      </Stack>
                    </Group>
                  </Paper>
                );
              })
          )}
        </Stack>
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
