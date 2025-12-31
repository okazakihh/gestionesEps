import React from 'react';
import { Group, ThemeIcon, Stack, Text, Loader } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';

const ScheduleAppointmentHeader = ({ patientName, loading }) => {
  return (
    <Group gap="md">
      <ThemeIcon size={60} radius="xl" variant="light" color="blue">
        <IconCalendar size={32} />
      </ThemeIcon>
      <Stack gap={4}>
        <Group gap="sm">
          <Text size="lg" fw={600}>
            Agendar Cita Médica
          </Text>
          {loading && (
            <Group gap="xs">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">Agendando...</Text>
            </Group>
          )}
        </Group>
        <Text size="sm" c="dimmed">
          Paciente: {patientName}
        </Text>
      </Stack>
    </Group>
  );
};

export default ScheduleAppointmentHeader;
