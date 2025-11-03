import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Stack, Group, Text, Title, Grid } from '@mantine/core';
import { IconPhone, IconMail, IconMapPin } from '@tabler/icons-react';

/**
 * Componente para mostrar la información de contacto del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientContactInfo = ({ patientData }) => {
  return (
    <Stack gap="lg">
      <Title order={4} size="h5">Información de Contacto</Title>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <Paper p="md" radius="md" withBorder>
              <Group gap="md" align="flex-start">
                <IconPhone size={24} color="var(--mantine-color-blue-6)" />
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Teléfono Principal</Text>
                  <Text size="sm" fw={500}>{patientData.informacionContacto?.telefono || 'N/A'}</Text>
                </Stack>
              </Group>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Group gap="md" align="flex-start">
                <IconPhone size={24} color="var(--mantine-color-green-6)" />
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Teléfono Móvil</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.telefonoMovil || 'N/A'}</Text>
                </Stack>
              </Group>
            </Paper>
            <Paper p="md" radius="md" withBorder>
              <Group gap="md" align="flex-start">
                <IconMail size={24} color="var(--mantine-color-blue-6)" />
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Email</Text>
                  <Text size="sm" fw={500}>{patientData.informacionContacto?.email || 'N/A'}</Text>
                </Stack>
              </Group>
            </Paper>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Group gap="md" align="flex-start">
              <IconMapPin size={24} color="var(--mantine-color-blue-6)" style={{ marginTop: 2 }} />
              <Stack gap={4} style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" fw={500}>Dirección</Text>
                <Text size="sm" fw={500}>{patientData.informacionContacto?.direccion || 'N/A'}</Text>
                <Text size="sm" c="dimmed">
                  {patientData.informacionContacto?.ciudad}, {patientData.informacionContacto?.departamento}
                </Text>
                <Text size="sm" c="dimmed">
                  {patientData.informacionContacto?.pais}
                </Text>
              </Stack>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

PatientContactInfo.propTypes = {
  patientData: PropTypes.object
};


export default PatientContactInfo;