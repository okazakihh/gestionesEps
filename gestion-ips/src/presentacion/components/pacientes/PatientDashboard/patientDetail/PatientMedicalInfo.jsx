import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Stack, Group, Text, Title, Grid } from '@mantine/core';
import { IconBuilding, IconHeart, IconDroplet } from '@tabler/icons-react';

/**
 * Componente para mostrar la información médica del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientMedicalInfo = ({ patientData }) => {
  return (
    <Stack gap="lg">
      <Title order={4} size="h5">Información Médica</Title>
      <Stack gap="lg">
        {/* Información básica médica */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" radius="md" withBorder>
              <Group gap="md" align="flex-start">
                <IconBuilding size={20} color="var(--mantine-color-gray-6)" />
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>EPS</Text>
                  <Text size="sm" fw={500}>{patientData.informacionMedica?.eps || 'N/A'}</Text>
                </Stack>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" radius="md" withBorder>
              <Group gap="md" align="flex-start">
                <IconHeart size={20} color="var(--mantine-color-gray-6)" />
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Régimen de Afiliación</Text>
                  <Text size="sm" fw={500}>{patientData.informacionMedica?.regimenAfiliacion || 'N/A'}</Text>
                </Stack>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" radius="md" withBorder>
              <Group gap="md" align="flex-start">
                <IconDroplet size={20} color="var(--mantine-color-red-6)" />
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Tipo de Sangre</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.tipoSangre || 'N/A'}</Text>
                </Stack>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Antecedentes médicos */}
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Stack gap="md">
            <Title order={5} size="h6">Antecedentes Médicos</Title>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Antecedentes Personales</Text>
                  <Paper p="sm" radius="md" withBorder bg="white" mih={80}>
                    <Text size="sm" fw={500}>{patientData.informacionMedica?.antecedentesPersonales || 'No registrados'}</Text>
                  </Paper>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Antecedentes Familiares</Text>
                  <Paper p="sm" radius="md" withBorder bg="white" mih={80}>
                    <Text size="sm" fw={500}>{patientData.informacionMedica?.antecedentesFamiliares || 'No registrados'}</Text>
                  </Paper>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Enfermedades Crónicas</Text>
                  <Paper p="sm" radius="md" withBorder bg="white" mih={60}>
                    <Text size="sm" fw={500}>{patientData.informacionMedica?.enfermedadesCronicas || 'Ninguna registrada'}</Text>
                  </Paper>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Vacunas e Inmunizaciones</Text>
                  <Paper p="sm" radius="md" withBorder bg="white" mih={60}>
                    <Text size="sm" fw={500}>{patientData.informacionMedica?.vacunas || 'No registradas'}</Text>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>

        {/* Información actual */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" fw={500}>Alergias</Text>
              <Paper p="sm" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-yellow-0)' }}>
                <Text size="sm" fw={500}>{patientData.informacionMedica?.alergias || 'Ninguna registrada'}</Text>
              </Paper>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" fw={500}>Medicamentos Actuales</Text>
              <Paper p="sm" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                <Text size="sm" fw={500}>{patientData.informacionMedica?.medicamentosActuales || 'Ninguno registrado'}</Text>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>

        <Stack gap={4}>
          <Text size="xs" c="dimmed" fw={500}>Observaciones Médicas Adicionales</Text>
          <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }} mih={100}>
            <Text size="sm" fw={500}>{patientData.informacionMedica?.observacionesMedicas || 'Sin observaciones registradas'}</Text>
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  );
};

PatientMedicalInfo.propTypes = {
  patientData: PropTypes.shape({
    informacionMedica: PropTypes.shape({
      eps: PropTypes.string,
      regimenAfiliacion: PropTypes.string,
      antecedentesPersonales: PropTypes.string,
      antecedentesFamiliares: PropTypes.string,
      enfermedadesCronicas: PropTypes.string,
      vacunas: PropTypes.string,
      alergias: PropTypes.string,
      medicamentosActuales: PropTypes.string,
      observacionesMedicas: PropTypes.string,
    }),
    informacionPersonal: PropTypes.shape({
      tipoSangre: PropTypes.string,
    }),
  }),
};

export default PatientMedicalInfo;