import React from 'react';
import { Paper, Stack, Group, Text, Avatar, Grid, UnstyledButton } from '@mantine/core';

/**
 * Componente para mostrar la tarjeta de horarios de un doctor
 */
const DoctorScheduleCard = ({ 
  doctorId, 
  doctorName, 
  appointments, 
  availableSlots,
  onSlotClick,
  getDoctorInitials
}) => {
  return (
    <Paper p="sm" radius="md" withBorder style={{ minWidth: 288, flexShrink: 0 }}>
      <Stack gap="sm">
        <Group gap="xs">
          <Avatar size="sm" color="blue" radius="xl">
            {getDoctorInitials(doctorName)}
          </Avatar>
          <Stack gap={0}>
            <Text size="xs" fw={500}>{doctorName}</Text>
            <Text size="xs" c="dimmed">{appointments.length} citas</Text>
          </Stack>
        </Group>

        <Grid gutter={4}>
          {availableSlots.map((slot) => (
            <Grid.Col key={`${doctorId}-${slot.time}`} span={2}>
              <UnstyledButton
                onClick={() => slot.available && onSlotClick(slot, doctorId)}
                style={{
                  width: '100%',
                  padding: '2px',
                  textAlign: 'center',
                  fontSize: '10px',
                  borderRadius: '4px',
                  border: slot.available 
                    ? '1px solid var(--mantine-color-green-3)' 
                    : '1px solid var(--mantine-color-red-3)',
                  backgroundColor: slot.available 
                    ? 'var(--mantine-color-green-0)' 
                    : 'var(--mantine-color-red-0)',
                  color: slot.available 
                    ? 'var(--mantine-color-green-7)' 
                    : 'var(--mantine-color-red-7)',
                  cursor: slot.available ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (slot.available) {
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-green-1)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (slot.available) {
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-green-0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                title={slot.available ? `Click para agendar cita con ${doctorName}` : 'Horario ocupado'}
              >
                {slot.label}
              </UnstyledButton>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
};

export default DoctorScheduleCard;
