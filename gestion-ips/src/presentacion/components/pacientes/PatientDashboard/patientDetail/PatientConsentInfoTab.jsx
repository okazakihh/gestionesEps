import React from 'react';
import { Paper, Stack, Group, Text, Title, Badge, Grid, Alert, Divider } from '@mantine/core';
import { IconFileText, IconAlertTriangle, IconCheck, IconX, IconCircle } from '@tabler/icons-react';
import { formatDate } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

/**
 * Componente para la pestaña de consentimiento informado del paciente
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.patientData - Datos parseados del paciente
 * @returns {JSX.Element} Contenido de la pestaña de consentimiento
 */
const PatientConsentInfoTab = ({ patientData }) => {
  return (
    <Stack gap="lg">
      <Group gap="sm">
        <Title order={4} size="h5">Consentimiento Informado</Title>
      </Group>
      <Divider />

      <Paper p="lg" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
        <Stack gap="lg">
          <Group gap="sm">
            <IconFileText size={24} color="var(--mantine-color-blue-6)" />
            <Title order={5} size="h6" c="blue.9">Consentimiento para Tratamiento Médico</Title>
          </Group>

          <Stack gap="md">
            <Paper p="md" radius="md" withBorder bg="white">
              <Stack gap="md">
                <Title order={6} size="h6">Consentimientos Otorgados</Title>
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="sm">Tratamiento Médico:</Text>
                    <Badge
                      color={patientData.consentimientoInformado?.aceptaTratamiento ? 'green' : 'red'}
                      variant="filled"
                      leftSection={patientData.consentimientoInformado?.aceptaTratamiento ? <IconCheck size={14} /> : <IconX size={14} />}
                    >
                      {patientData.consentimientoInformado?.aceptaTratamiento ? 'Aceptado' : 'No aceptado'}
                    </Badge>
                  </Group>
                  <Group justify="space-between" align="center">
                    <Text size="sm">Privacidad de Datos (Ley 1581):</Text>
                    <Badge
                      color={patientData.consentimientoInformado?.aceptaPrivacidad ? 'green' : 'red'}
                      variant="filled"
                      leftSection={patientData.consentimientoInformado?.aceptaPrivacidad ? <IconCheck size={14} /> : <IconX size={14} />}
                    >
                      {patientData.consentimientoInformado?.aceptaPrivacidad ? 'Aceptado' : 'No aceptado'}
                    </Badge>
                  </Group>
                  <Group justify="space-between" align="center">
                    <Text size="sm">Tratamiento Datos Sensibles:</Text>
                    <Badge
                      color={patientData.consentimientoInformado?.aceptaDatosPersonales ? 'green' : 'red'}
                      variant="filled"
                      leftSection={patientData.consentimientoInformado?.aceptaDatosPersonales ? <IconCheck size={14} /> : <IconX size={14} />}
                    >
                      {patientData.consentimientoInformado?.aceptaDatosPersonales ? 'Aceptado' : 'No aceptado'}
                    </Badge>
                  </Group>
                  <Group justify="space-between" align="center">
                    <Text size="sm">Uso de Imágenes:</Text>
                    <Badge
                      color={patientData.consentimientoInformado?.aceptaImagenes ? 'green' : 'gray'}
                      variant="filled"
                      leftSection={patientData.consentimientoInformado?.aceptaImagenes ? <IconCheck size={14} /> : <IconCircle size={14} />}
                    >
                      {patientData.consentimientoInformado?.aceptaImagenes ? 'Aceptado' : 'Opcional'}
                    </Badge>
                  </Group>
                </Stack>
              </Stack>
            </Paper>

            <Paper p="md" radius="md" withBorder bg="white">
              <Stack gap="md">
                <Title order={6} size="h6">Información Legal</Title>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed" fw={500}>Fecha de Consentimiento:</Text>
                      <Text size="sm" fw={500}>{formatDate(patientData.consentimientoInformado?.fechaConsentimiento) || 'N/A'}</Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed" fw={500}>Testigo:</Text>
                      <Text size="sm" fw={500}>{patientData.consentimientoInformado?.testigoConsentimiento || 'N/A'}</Text>
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>

            <Alert
              icon={<IconAlertTriangle size={20} />}
              title="Información Legal Importante"
              color="yellow"
              variant="light"
            >
              <Stack gap="xs">
                <Text size="sm">• Este consentimiento cumple con la <strong>Ley 1581 de 2012</strong> (Protección de Datos Personales)</Text>
                <Text size="sm">• El paciente ha sido informado sobre sus derechos y deberes según la <strong>Ley 1751 de 2015</strong></Text>
                <Text size="sm">• Los datos médicos sensibles están protegidos por la normatividad colombiana</Text>
                <Text size="sm">• El paciente puede revocar este consentimiento en cualquier momento</Text>
              </Stack>
            </Alert>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default PatientConsentInfoTab;