import React from 'react';
import { Paper, Stack, Group, Text, Grid, Badge } from '@mantine/core';

const PatientInfoPreserved = ({ parsedPatientData = {}, parsedData = {}, historiaClinica = {}, tema = {} }) => {
  return (
    <Paper p="sm" style={{ 
      backgroundColor: '#f8f9fa',
      borderLeft: `3px solid ${tema.primaryColor}`,
      borderRight: `3px solid ${tema.primaryColor}`,
      borderRadius: 0
    }}>
      <Grid gutter={8}>
        {/* Columna 1 */}
        <Grid.Col span={4}>
          <Stack gap={4}>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Nombres:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.primerNombre || ''} {parsedPatientData?.informacionPersonal?.segundoNombre || ''}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Tipo Doc:</Text>
              <Text size="xs">{parsedPatientData?.tipoDocumento || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>FN:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.fechaNacimiento || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Sexo:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.genero || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Dirección:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.direccion || 'N/A'}</Text>
            </Group>
          </Stack>
        </Grid.Col>

        {/* Columna 2 */}
        <Grid.Col span={4}>
          <Stack gap={4}>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Apellidos:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.primerApellido || ''} {parsedPatientData?.informacionPersonal?.segundoApellido || ''}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}># Doc:</Text>
              <Text size="xs">{parsedPatientData?.numeroDocumento || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Edad:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.fechaNacimiento ? (() => {
                const hoy = new Date();
                const nacimiento = new Date(parsedPatientData.informacionPersonal.fechaNacimiento);
                let edad = hoy.getFullYear() - nacimiento.getFullYear();
                const mes = hoy.getMonth() - nacimiento.getMonth();
                if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
                return edad + ' años';
              })() : 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>E.Civil:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.estadoCivil || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Ocupación:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.ocupacion || 'N/A'}</Text>
            </Group>
          </Stack>
        </Grid.Col>

        {/* Columna 3 */}
        <Grid.Col span={4}>
          <Stack gap={4}>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Ciudad:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.ciudad || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>RH:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.tipoSangre || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Teléfono:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.telefono || parsedPatientData?.informacionPersonal?.telefonoMovil || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Entidad:</Text>
              <Text size="xs">{parsedPatientData?.informacionPersonal?.eps || parsedData?.procedimiento?.entidadPrestadora || 'N/A'}</Text>
            </Group>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Estado:</Text>
              <Badge color={historiaClinica?.activa ? 'green' : 'gray'} variant="light" size="xs">
                {historiaClinica?.activa ? 'ACTIVA' : 'INACTIVA'}
              </Badge>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

export default PatientInfoPreserved;
