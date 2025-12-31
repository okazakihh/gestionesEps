import React from 'react';
import { Paper, Stack, Text, Title, Group, Avatar, Button, Loader, ScrollArea, Grid } from '@mantine/core';
import { useAuth } from '../../../../../data/context/AuthContext';

/**
 * Muestra la sección de horarios disponibles por doctor para un día seleccionado.
 */
const AppointmentAvailabilitySection = ({
  allDoctorAppointments,
  loadingAppointments,
  calculateAvailableSlots,
  handleSlotClick,
  getDoctorInitials,
  selectedDate
}) => {
  const { user } = useAuth();

  if (loadingAppointments) {
    return (
      <Stack align="center" gap="xs" py="lg">
        <Loader size="md" />
        <Text size="sm" c="dimmed">Cargando horarios...</Text>
      </Stack>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title order={4} mb="lg" align="left" style={{ fontSize: '18px', color: '#2c3e50' }}>
        {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO')
          ? 'Mis Horarios Disponibles'
          : 'Horarios Disponibles por Doctor'
        }
      </Title>
      <ScrollArea h={400}>
        <Group gap="lg" align="flex-start" wrap="wrap" style={{ justifyContent: 'flex-start' }}>
          {Object.entries(allDoctorAppointments).map(([doctorId, doctorData]) => {
            const { doctor, doctorName, appointments: doctorAppointments, disponibilidades } = doctorData;
            const availableSlots = calculateAvailableSlots(disponibilidades || [], doctorAppointments, selectedDate);

            return (
              <Paper
                key={doctorId}
                p="md"
                radius="md"
                withBorder
                style={{ minWidth: 280, maxWidth: 300, flexShrink: 0, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
              >
                <Group gap="sm" mb="sm" style={{ alignItems: 'center' }}>
                  <Avatar color="blue" radius="xl" size="md">
                    {getDoctorInitials(doctorName)}
                  </Avatar>
                  <div>
                    <Text size="sm" fw={600} style={{ color: '#34495e' }}>{doctorName}</Text>
                    <Text size="xs" c="dimmed">{doctorAppointments.length} citas</Text>
                  </div>
                </Group>

                <Grid gutter={8} style={{ marginTop: '20px' }}>
                  {availableSlots.map((slot) => (
                    <Grid.Col key={`${doctorId}-${slot.time}`} span={1} style={{ maxWidth: '80px' }}>
                      <Button
                        variant={slot.available ? "light" : "filled"}
                        color={slot.available ? "green" : "red"}
                        size="md"
                        fullWidth
                        onClick={() => slot.available && handleSlotClick(slot, doctorId)}
                        disabled={!slot.available}
                        title={slot.available ? `Click para agendar cita con ${doctorName}` : 'Horario ocupado'}
                        styles={{ root: { padding: '4px', height: 'auto', fontSize: '10px', borderRadius: '4px' } }}
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
    </div>
  );
};

export default AppointmentAvailabilitySection;
