import React from 'react';
import { Paper, Stack, Group, Title, Button, Text, Badge, Avatar } from '@mantine/core';
import { IconFileText, IconCalendar } from '@tabler/icons-react';
import { formatDate } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

/**
 * Componente para la pestaña de historia clínica del paciente
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.historiaClinica - Historia clínica del paciente
 * @param {Array} props.consultas - Lista de consultas
 * @param {Function} props.setActiveTab - Función para cambiar pestaña
 * @returns {JSX.Element} Contenido de la pestaña de historia clínica
 */
const PatientClinicalHistoryTab = ({ historiaClinica, consultas, setActiveTab }) => {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={4} size="h5">Historia Clínica</Title>
        {historiaClinica && (
          <Button
            leftSection={<IconFileText size={16} />}
            onClick={() => setActiveTab('clinica_completa')}
            variant="light"
            color="blue"
          >
            Ver Historia Clínica Completa
          </Button>
        )}
      </Group>

      {!historiaClinica ? (
        <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Stack gap="sm" align="center" py="lg">
            <IconFileText size={48} color="var(--mantine-color-gray-5)" />
            <Title order={5} size="h6" c="dimmed">No hay historia clínica</Title>
            <Text size="sm" c="dimmed" ta="center">
              Este paciente aún no tiene una historia clínica registrada.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="lg">
          {/* Información de la Historia */}
          <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
            <Stack gap="md">
              <Text size="md" fw={600} c="blue.9">Información General</Text>
              <Group grow align="flex-start">
                <Stack gap={4}>
                  <Text size="xs" c="blue.7" fw={500}>Número de Historia:</Text>
                  <Text size="sm" c="blue.9" fw={500}>{historiaClinica.numeroHistoria}</Text>
                </Stack>
                <Stack gap={4}>
                  <Text size="xs" c="blue.7" fw={500}>Fecha de Apertura:</Text>
                  <Text size="sm" c="blue.9" fw={500}>{formatDate(historiaClinica.fechaApertura)}</Text>
                </Stack>
                <Stack gap={4}>
                  <Text size="xs" c="blue.7" fw={500}>Estado:</Text>
                  <Badge color={historiaClinica.activa ? 'green' : 'gray'} variant="light">
                    {historiaClinica.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </Stack>
              </Group>
            </Stack>
          </Paper>

          {/* Consultas Médicas */}
          <Stack gap="md">
            <Title order={5} size="h6">Consultas Médicas ({consultas.length})</Title>

            {consultas.length === 0 ? (
              <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <Stack gap="sm" align="center">
                  <IconCalendar size={32} color="var(--mantine-color-gray-5)" />
                  <Text size="sm" c="dimmed" ta="center">No hay consultas registradas</Text>
                </Stack>
              </Paper>
            ) : (
              <Stack gap="sm">
                {consultas.map((consulta, index) => (
                  <Paper key={consulta.id} p="md" radius="md" withBorder>
                    <Group justify="space-between" align="flex-start">
                      <Group gap="md">
                        <Avatar color="blue" radius="xl" size="md">
                          {index + 1}
                        </Avatar>
                        <Stack gap={4}>
                          <Text size="sm" fw={500}>Consulta #{consulta.id}</Text>
                          <Text size="xs" c="dimmed">
                            {formatDate(consulta.fechaCreacion)}
                          </Text>
                        </Stack>
                      </Group>
                      <Stack gap={2} align="flex-end">
                        <Text size="xs" c="dimmed">Creada</Text>
                        <Text size="xs" fw={500}>{formatDate(consulta.fechaCreacion)}</Text>
                      </Stack>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default PatientClinicalHistoryTab;