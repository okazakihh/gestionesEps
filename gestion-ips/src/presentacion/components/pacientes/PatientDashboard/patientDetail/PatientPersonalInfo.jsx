import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Stack, Group, Text, Title, Grid, Badge } from '@mantine/core';
import { formatDate, calculateAge } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

/**
 * Componente para mostrar la información personal del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientPersonalInfo = ({ patientData, patient }) => {
  return (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Stack gap="lg">
          <Title order={4} size="h5">Datos Personales</Title>
          <Paper p="md" radius="md" withBorder>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Primer Nombre:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.primerNombre || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Segundo Nombre:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.segundoNombre || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Primer Apellido:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.primerApellido || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Segundo Apellido:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.segundoApellido || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Fecha de Nacimiento:</Text>
                  <Text size="sm" fw={500}>{formatDate(patientData.informacionPersonal?.fechaNacimiento)}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Edad:</Text>
                  <Text size="sm" fw={500}>{calculateAge(patientData.informacionPersonal?.fechaNacimiento)}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Género:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.genero || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Estado Civil:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.estadoCivil || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Tipo de Sangre:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.tipoSangre || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Nacionalidad:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.nacionalidad || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Estrato Socioeconómico:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.estratoSocioeconomico || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Grupo Étnico:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.grupoEtnico || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Discapacidad:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.discapacidad || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Ocupación:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.ocupacion || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Nivel Educativo:</Text>
                  <Text size="sm" fw={500}>{patientData.informacionPersonal?.nivelEducativo || 'N/A'}</Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </Paper>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 4 }}>
        <Stack gap="lg">
          <Title order={4} size="h5" c="blue.7">Información del Sistema</Title>
          <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
            <Stack gap="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={500}>ID del Paciente:</Text>
                <Text size="sm" fw={500}>{patient?.id}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={500}>Tipo Documento:</Text>
                <Text size="sm" fw={500}>{patient?.tipoDocumento}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={500}>Número Documento:</Text>
                <Text size="sm" fw={500}>{patient?.numeroDocumento}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={500}>Estado:</Text>
                <Badge color={patient?.activo ? 'green' : 'red'} variant="filled">
                  {patient?.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={500}>Fecha Registro:</Text>
                <Text size="sm" fw={500}>{formatDate(patient?.fechaCreacion)}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={500}>Última Actualización:</Text>
                <Text size="sm" fw={500}>{formatDate(patient?.fechaActualizacion)}</Text>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
PatientPersonalInfo.propTypes = {
  patientData: PropTypes.shape({
    informacionPersonal: PropTypes.object,
  }),
  patient: PropTypes.object,
};

export default PatientPersonalInfo;
