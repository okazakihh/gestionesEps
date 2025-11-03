import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Stack, Group, Title, Button, Text, Badge, Avatar, Divider } from '@mantine/core';
import { IconFileText, IconCalendar } from '@tabler/icons-react';

/**
 * Componente para mostrar la historia clínica resumida del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientClinicalHistory = ({ historiaClinica, consultas, setActiveTab, formatDate }) => {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={4} size="h5">Historia Clínica</Title>
        {historiaClinica && (
          <Button
            leftSection={<IconFileText size={16} />}
            onClick={() => setActiveTab('clinica_completa')}
            variant="light"
          >
            Ver Historia Clínica Completa
          </Button>
        )}
      </Group>

      {historiaClinica ? (
        <Stack gap="lg">
          {/* Información de la Historia */}
          <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
            <Stack gap="md">
              <Text size="md" fw={600} c="blue.9">Información General</Text>
              <Group grow align="flex-start">
                <Stack gap={4}>
                  <Text size="xs" c="blue.7" fw={500}>Número de Historia:</Text>
                  <Text size="sm" c="blue.9">{historiaClinica.numeroHistoria}</Text>
                </Stack>
                <Stack gap={4}>
                  <Text size="xs" c="blue.7" fw={500}>Fecha de Apertura:</Text>
                  <Text size="sm" c="blue.9">{formatDate(historiaClinica.fechaApertura)}</Text>
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
                  <IconCalendar size={48} color="var(--mantine-color-gray-5)" />
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
      ) : (
        <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Stack gap="sm" align="center">
            <IconFileText size={64} color="var(--mantine-color-gray-5)" />
            <Title order={5} size="h6" c="dimmed">No hay historia clínica</Title>
            <Text size="sm" c="dimmed" ta="center">
              Este paciente aún no tiene una historia clínica registrada.
            </Text>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
};

PatientClinicalHistory.propTypes = {
  historiaClinica: PropTypes.shape({
    numeroHistoria: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fechaApertura: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    activa: PropTypes.bool,
  }),
  consultas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fechaCreacion: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    })
  ).isRequired,
  setActiveTab: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};


export default PatientClinicalHistory;