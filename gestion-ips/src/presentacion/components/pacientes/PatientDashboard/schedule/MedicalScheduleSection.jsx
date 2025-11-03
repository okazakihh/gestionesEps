import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Stack, Group, Text, Title, Badge, Grid, ScrollArea, Loader } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import DoctorScheduleCard from './DoctorScheduleCard.jsx';
import DailyAppointmentsList from '../appointments/DailyAppointmentsList.jsx';

/**
 * Componente que muestra la agenda médica con los horarios de todos los doctores
 * y las citas programadas del día
 */
const MedicalScheduleSection = ({
  selectedDate,
  user,
  loadingAppointments,
  allDoctorAppointments,
  calculateAvailableSlots,
  handleSlotClick,
  getDoctorInitials,
  getAppointmentInfo,
  updateAppointmentStatus,
  updatingStatus
}) => {
  if (!selectedDate) return null;

  const isDoctor = user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO');

  return (
    <Paper p="lg" radius="md" shadow="sm" withBorder>
      <Stack gap="lg">
        <Group gap="sm">
          <IconClock size={20} />
          <Title order={3} size="h5">
            Agenda Médica - {selectedDate.toLocaleDateString('es-ES')}
          </Title>
          {isDoctor && (
            <Badge color="blue" variant="light">(Vista Personal)</Badge>
          )}
        </Group>

        {/* Multi-Doctor Schedule Display */}
        <Stack gap="lg">
          {/* Time slots for all doctors */}
          <Stack gap="md">
            <Title order={4} size="h6">
              {isDoctor
                ? 'Mis Horarios Disponibles'
                : 'Horarios Disponibles por Doctor'
              }
            </Title>

            {loadingAppointments ? (
              <Stack align="center" py="md">
                <Loader color="blue" size="md" />
                <Text size="xs" c="dimmed">Cargando horarios...</Text>
              </Stack>
            ) : (
              <ScrollArea h={384}>
                <Grid gutter="md" style={{ minWidth: 'max-content' }}>
                  {Object.entries(allDoctorAppointments).map(([doctorId, doctorData]) => {
                    const { doctorName, appointments: doctorAppointments } = doctorData;
                    const availableSlots = calculateAvailableSlots(doctorAppointments, selectedDate);

                    return (
                      <Grid.Col key={doctorId} span={{ base: 12, xs: 6, sm: 4, md: 3, lg: 2.4 }}>
                        <DoctorScheduleCard
                          doctorId={doctorId}
                          doctorName={doctorName}
                          appointments={doctorAppointments}
                          availableSlots={availableSlots}
                          onSlotClick={handleSlotClick}
                          getDoctorInitials={getDoctorInitials}
                        />
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </ScrollArea>
            )}
          </Stack>

          {/* Citas programadas del día */}
          <DailyAppointmentsList
            selectedDate={selectedDate}
            user={user}
            loadingAppointments={loadingAppointments}
            allDoctorAppointments={allDoctorAppointments}
            getAppointmentInfo={getAppointmentInfo}
            updateAppointmentStatus={updateAppointmentStatus}
            updatingStatus={updatingStatus}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
MedicalScheduleSection.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  user: PropTypes.shape({
    rol: PropTypes.string.isRequired,
  }).isRequired,
  loadingAppointments: PropTypes.bool.isRequired,
  allDoctorAppointments: PropTypes.objectOf(
    PropTypes.shape({
      doctorName: PropTypes.string.isRequired,
      appointments: PropTypes.array.isRequired,
    })
  ).isRequired,
  calculateAvailableSlots: PropTypes.func.isRequired,
  handleSlotClick: PropTypes.func.isRequired,
  getDoctorInitials: PropTypes.func.isRequired,
  getAppointmentInfo: PropTypes.func.isRequired,
  updateAppointmentStatus: PropTypes.func.isRequired,
  updatingStatus: PropTypes.bool.isRequired,
};


export default MedicalScheduleSection;
