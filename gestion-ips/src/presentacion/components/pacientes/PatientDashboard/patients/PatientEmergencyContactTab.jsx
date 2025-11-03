import React from 'react';
import { Paper, Stack, Group, Text, Title, Grid, Divider } from '@mantine/core';
import { IconId, IconPhone } from '@tabler/icons-react';

/**
 * Componente para la pestaña de contacto de emergencia del paciente
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.patientData - Datos parseados del paciente
 * @returns {JSX.Element} Contenido de la pestaña de emergencia
 */
const PatientEmergencyContactTab = ({ patientData }) => {
  return (
    <Stack gap="lg">
      <Group gap="sm">
        <Title order={4} size="h5">Contacto de Emergencia</Title>
      </Group>
      <Divider />
      <Paper p="lg" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-red-0)' }}>
        <Stack gap="lg">
          <Group gap="sm">
            <IconId size={20} color="var(--mantine-color-red-6)" />
            <Title order={5} size="h6" c="red.9">Información de Emergencia</Title>
          </Group>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" radius="md" withBorder bg="white">
                <Stack gap="md">
                  <Stack gap={4}>
                    <Text size="xs" c="red.7" fw={500}>Nombre Completo</Text>
                    <Text size="lg" fw={600} c="red.9">{patientData.contactoEmergencia?.nombreContacto || 'N/A'}</Text>
                  </Stack>
                  <Stack gap={4}>
                    <Text size="xs" c="red.7" fw={500}>Relación</Text>
                    <Text size="sm" fw={500} c="red.8">{patientData.contactoEmergencia?.relacion || 'N/A'}</Text>
                  </Stack>
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" radius="md" withBorder bg="white">
                <Stack gap="md">
                  <Group gap="md" align="flex-start">
                    <IconPhone size={20} color="var(--mantine-color-red-6)" />
                    <Stack gap={4}>
                      <Text size="xs" c="red.7" fw={500}>Teléfono Principal</Text>
                      <Text size="sm" fw={600} c="red.9">{patientData.contactoEmergencia?.telefonoContacto || 'N/A'}</Text>
                    </Stack>
                  </Group>
                  <Group gap="md" align="flex-start">
                    <IconPhone size={20} color="var(--mantine-color-orange-6)" />
                    <Stack gap={4}>
                      <Text size="xs" c="red.7" fw={500}>Teléfono Secundario</Text>
                      <Text size="sm" fw={500} c="red.8">{patientData.contactoEmergencia?.telefonoContactoSecundario || 'N/A'}</Text>
                    </Stack>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default PatientEmergencyContactTab;