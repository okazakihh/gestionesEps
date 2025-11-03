import React from 'react';
import { Paper, Stack, Text, Title, Group, Avatar, Badge, Button, Loader, ActionIcon, ScrollArea, Grid } from '@mantine/core';
import { IconClock, IconUser, IconFileText, IconCheck, IconX, IconClockCancel } from '@tabler/icons-react';

const AppointmentAvailabilitySection = ({
  selectedDate,
  user,
  allDoctorAppointments,
  loadingAppointments,
  calculateAvailableSlots,
  handleSlotClick,
  getDoctorInitials,
  handleViewAppointmentDetail,
  // getFilteredTransitions, // Removed as it's not available in the hook
  handleStatusChange,
  updatingStatus
}) => {
  if (!selectedDate) {
    return (
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack align="center" gap="md" py="xl">
          <IconClock size={48} color="gray" />
          <Title order={4} c="dark">Selecciona un día</Title>
          <Text size="sm" c="dimmed">Haz click en un día del calendario para ver la disponibilidad de citas</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Group mb="md" gap="xs">
        <IconClock size={20} />
        <Title order={4}>
          Agenda Médica - {selectedDate.toLocaleDateString('es-ES')}
        </Title>
        {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO') && (
          <Badge color="blue" variant="light" size="sm">Vista Personal</Badge>
        )}
      </Group>

      <Stack gap="xl">
        {/* Time slots for all doctors */}
        <div>
          <Title order={5} mb="md">
            {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO')
              ? 'Mis Horarios Disponibles'
              : 'Horarios Disponibles por Doctor'
            }
          </Title>

          {loadingAppointments ? (
            <Stack align="center" gap="xs" py="lg">
              <Loader size="md" />
              <Text size="sm" c="dimmed">Cargando horarios...</Text>
            </Stack>
          ) : (
            <ScrollArea h={400}>
              <Group gap="md" align="flex-start" wrap="nowrap" pb="md">
                {Object.entries(allDoctorAppointments).map(([doctorId, doctorData]) => {
                  const { doctor, doctorName, appointments: doctorAppointments } = doctorData;
                  const availableSlots = calculateAvailableSlots(doctorAppointments, selectedDate);

                  return (
                    <Paper key={doctorId} p="md" radius="md" withBorder style={{ minWidth: 288, flexShrink: 0 }}>
                      <Group gap="sm" mb="sm">
                        <Avatar color="blue" radius="xl" size="sm">
                          {getDoctorInitials(doctorName)}
                        </Avatar>
                        <div>
                          <Text size="xs" fw={500}>{doctorName}</Text>
                          <Text size="xs" c="dimmed">{doctorAppointments.length} citas</Text>
                        </div>
                      </Group>

                      <Grid gutter={4}>
                        {availableSlots.map((slot) => (
                          <Grid.Col key={`${doctorId}-${slot.time}`} span={2}>
                            <Button
                              variant={slot.available ? "light" : "filled"}
                              color={slot.available ? "green" : "red"}
                              size="compact-xs"
                              fullWidth
                              onClick={() => {
                                console.log('Slot clicked:', { slot, selectedDate, doctorId });
                                if (slot.available) {
                                  handleSlotClick({
                                    ...slot,
                                    date: selectedDate,
                                    doctorId: doctorId
                                  });
                                }
                              }}
                              disabled={!slot.available}
                              title={slot.available ? `Click para agendar cita con ${doctorName}` : 'Horario ocupado'}
                              styles={{
                                root: {
                                  padding: '2px',
                                  height: 'auto',
                                  fontSize: '10px'
                                }
                              }}
                            >
                              {slot.label}
                            </Button>
                          </Grid.Col>
                        ))}
                      </Grid>
                    </Paper>
                  );
                })}
              </Group>
            </ScrollArea>
          )}
        </div>

        {/* Appointments for all doctors */}
        <div>
          <Title order={5} mb="md">
            {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO')
              ? `Mis Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
              : `Todas las Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
            }
          </Title>

          {loadingAppointments ? (
            <Stack align="center" gap="xs" py="lg">
              <Loader size="md" />
              <Text size="sm" c="dimmed">Cargando citas...</Text>
            </Stack>
          ) : Object.values(allDoctorAppointments).some(doctorData =>
              doctorData.appointments.some(appointment => {
                try {
                  const appointmentData = JSON.parse(appointment.datosJson || '{}');
                  return appointmentData.estado !== 'ATENDIDO';
                } catch (error) {
                  return true;
                }
              })
            ) ? (
            <ScrollArea h={320}>
              <Stack gap="xs">
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
                      console.log('Rendering appointment:', appointment.id, 'patient:', appointment.patient);
                      return (
                        <Paper key={appointment.id} p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap="sm">
                              <Avatar color="blue" radius="xl" size="sm">
                                {getDoctorInitials(doctorData.doctorName)}
                              </Avatar>
                              <IconClock size={16} color="gray" />
                              <div>
                                <Text size="sm" fw={500}>{appointment.time} - {appointment.patient || 'Paciente'}</Text>
                                <Text size="xs" c="dimmed">
                                  {(() => {
                                    try {
                                      const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                      const informacionCups = appointmentData.informacionCups;
                                      if (informacionCups && informacionCups.tipo) {
                                        return `Tipo: ${informacionCups.tipo}`;
                                      }
                                      return appointmentData.motivo || 'REVISION PERIODICA';
                                    } catch (error) {
                                      return 'REVISION PERIODICA';
                                    }
                                  })()}
                                  {(() => {
                                    try {
                                      const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                      const duracion = appointmentData.duracion || 30;
                                      return ` (${duracion} min)`;
                                    } catch (error) {
                                      return ' (30 min)';
                                    }
                                  })()}
                                </Text>
                              </div>
                            </Group>
                            <Group gap="xs">
                              <Badge
                                color={(() => {
                                  try {
                                    const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                    const status = appointmentData.estado || 'PROGRAMADO';
                                    return status === 'PROGRAMADO' ? 'blue' :
                                          status === 'EN_SALA' ? 'yellow' :
                                          status === 'ATENDIDO' ? 'green' :
                                          status === 'CANCELADA' ? 'gray' :
                                          'red';
                                  } catch (error) {
                                    return 'blue';
                                  }
                                })()}
                                variant="light"
                                size="sm"
                              >
                                {(() => {
                                  try {
                                    const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                    const status = appointmentData.estado || 'PROGRAMADO';
                                    return status === 'PROGRAMADO' ? 'Programado' :
                                          status === 'EN_SALA' ? 'En Sala' :
                                          status === 'ATENDIDO' ? 'Atendido' :
                                          status === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                                          status === 'CANCELADA' ? 'Cancelada' :
                                          status;
                                  } catch (error) {
                                    return 'Programado';
                                  }
                                })()}
                              </Badge>
                              <Group gap={4}>
                                <ActionIcon
                                  variant="light"
                                  color="gray"
                                  size="sm"
                                  onClick={() => handlePatientClick(appointment.pacienteId)}
                                  title="Ver paciente"
                                >
                                  <IconUser size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="light"
                                  color="blue"
                                  size="sm"
                                  onClick={() => handleViewAppointmentDetail(appointment)}
                                  title="Detalle de la cita"
                                >
                                  <IconFileText size={16} />
                                </ActionIcon>
                                {/* Status Change Buttons */}
                                {(() => {
                                  try {
                                    const appointmentData = JSON.parse(appointment.datosJson || '{}');
                                    const currentStatus = appointmentData.estado || 'PROGRAMADO';
                                    const availableTransitions = (() => {
                                      if (currentStatus === 'PROGRAMADO') return ['EN_SALA', 'NO_SE_PRESENTO', 'CANCELADA'];
                                      if (currentStatus === 'EN_SALA') return ['ATENDIDO'];
                                      return [];
                                    })().filter(newStatus => newStatus !== 'ATENDIDO');

                                    return availableTransitions.map((newStatus) => (
                                      <ActionIcon
                                        key={newStatus}
                                        variant="light"
                                        color={
                                          newStatus === 'EN_SALA' ? 'yellow' :
                                          newStatus === 'ATENDIDO' ? 'green' :
                                          newStatus === 'NO_SE_PRESENTO' ? 'red' :
                                          newStatus === 'CANCELADA' ? 'gray' : 'blue'
                                        }
                                        size="sm"
                                        onClick={() => handleStatusChange(appointment.id, newStatus)}
                                        disabled={updatingStatus[appointment.id]}
                                        title={newStatus === 'EN_SALA' ? 'En Sala' :
                                              newStatus === 'ATENDIDO' ? 'Atendido' :
                                              newStatus === 'NO_SE_PRESENTO' ? 'No se Presentó' :
                                              newStatus === 'CANCELADA' ? 'Cancelar Cita' :
                                              newStatus}
                                        loading={updatingStatus[appointment.id]}
                                      >
                                        {newStatus === 'EN_SALA' && <IconClock size={16} />}
                                        {newStatus === 'ATENDIDO' && <IconCheck size={16} />}
                                        {newStatus === 'NO_SE_PRESENTO' && <IconX size={16} />}
                                        {newStatus === 'CANCELADA' && <IconX size={16} />}
                                      </ActionIcon>
                                    ));
                                  } catch (error) {
                                    return null;
                                  }
                                })()}
                              </Group>
                            </Group>
                          </Group>
                        </Paper>
                      );
                    })
                )}
              </Stack>
            </ScrollArea>
          ) : (
            <Text size="sm" c="dimmed" ta="center" py="lg">
              No hay citas programadas para este día
            </Text>
          )}
        </div>
      </Stack>
    </Paper>
  );
};

export default AppointmentAvailabilitySection;