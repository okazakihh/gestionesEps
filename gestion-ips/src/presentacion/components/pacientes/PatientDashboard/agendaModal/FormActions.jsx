import React from 'react';
import { Group, Paper, Text, Button, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

const FormActions = ({ patientName, loading, onClose }) => {
  return (
    <Group justify="space-between" align="flex-start" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
      <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)', flex: 1 }}>
        <Stack gap={4}>
          <Text size="sm">
            <strong>Paciente:</strong> {patientName}
          </Text>
          <Text size="sm">
            <strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO')}
          </Text>
        </Stack>
      </Paper>

      <Group gap="sm">
        <Button
          variant="default"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          leftSection={!loading && <IconCheck size={16} />}
          loading={loading}
          loaderProps={{ type: 'dots' }}
        >
          {loading ? 'Agendando...' : 'Agendar Cita'}
        </Button>
      </Group>
    </Group>
  );
};

export default FormActions;