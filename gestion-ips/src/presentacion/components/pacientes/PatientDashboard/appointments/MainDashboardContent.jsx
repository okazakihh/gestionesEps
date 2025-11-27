import React from 'react';
import { Paper, Stack, Text, Title, Group, Loader } from '@mantine/core';
import { ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import AppointmentAvailabilitySection from './AppointmentAvailabilitySection.jsx';
import DashboardAppointmentsView from './DashboardAppointmentsView.jsx';

/**
 * Componente contenedor para el contenido principal del dashboard.
 * Muestra la agenda médica para el día seleccionado.
 */
const MainDashboardContent = ({
  selectedDate,
  onSlotClick,
  onViewAppointmentDetail,
  onStatusChange,
  onPatientClick,
  allDoctorAppointments,
  loadingAppointments,
  user,
  calculateAvailableSlots,
  getDoctorInitials,
  getAppointmentInfo,
  updatingStatus
}) => {
  // Si no hay fecha seleccionada, muestra un placeholder.
  if (!selectedDate) {
    return (
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack align="center" gap="md" py="xl">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400" />
          <Title order={4} c="dark">Selecciona un día</Title>
          <Text size="sm" c="dimmed">Haz click en un día del calendario para ver la disponibilidad de citas.</Text>
        </Stack>
      </Paper>
    );
  }

  // Verifica si la fecha seleccionada es pasada
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateOnly = new Date(selectedDate);
  selectedDateOnly.setHours(0, 0, 0, 0);
  const isPastDate = selectedDateOnly < today;

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Group mb="md" gap="xs">
        <ClockIcon className="h-5 w-5" />
        <Title order={4}>
          Agenda Médica - {selectedDate.toLocaleDateString('es-ES')}
        </Title>
        {user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO') && (
          <Text size="sm" c="blue">(Vista Personal)</Text>
        )}
      </Group>

      <Stack gap="xl">
        {/* Sección de Horarios Disponibles (solo para hoy y futuro) */}
        {!isPastDate && (
          <AppointmentAvailabilitySection
            allDoctorAppointments={allDoctorAppointments}
            loadingAppointments={loadingAppointments}
            calculateAvailableSlots={calculateAvailableSlots}
            handleSlotClick={onSlotClick}
            getDoctorInitials={getDoctorInitials}
            selectedDate={selectedDate}
          />
        )}

        {/* Sección de Citas Programadas */}
        {loadingAppointments ? (
          <Stack align="center" gap="xs" py="lg">
            <Loader size="md" />
            <Text size="sm" c="dimmed">Cargando citas...</Text>
          </Stack>
        ) : (
          <DashboardAppointmentsView
            allDoctorAppointments={allDoctorAppointments}
            selectedDate={selectedDate}
            user={user}
            handleViewAppointmentDetail={onViewAppointmentDetail}
            updateAppointmentStatus={onStatusChange}
            getDoctorInitials={getDoctorInitials}
            onPatientClick={onPatientClick}
            updatingStatus={updatingStatus}
            getAppointmentInfo={getAppointmentInfo}
          />
        )}
      </Stack>
    </Paper>
  );
};

export default MainDashboardContent;