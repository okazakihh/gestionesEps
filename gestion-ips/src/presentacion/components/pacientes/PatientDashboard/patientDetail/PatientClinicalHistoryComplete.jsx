import React from 'react';
import { Paper, Stack, Group, Title, Button, Text, Grid, Badge, Avatar, Divider, Code } from '@mantine/core';
import {
  IconFileText,
  IconUser,
  IconHeart,
  IconId,
  IconCalendar,
  IconClock,
  IconPrinter,
  IconArrowLeft
} from '@tabler/icons-react';

// Importar utilidades
import { formatDate } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';
import { printHistoriaClinica, printConsulta } from '../../../../../negocio/utils/pacientes/printUtils.js';

/**
 * Componente para mostrar la historia clínica completa del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientClinicalHistoryComplete = ({
  historiaClinica,
  consultas,
  setActiveTab,
  patient,
  patientData
}) => {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={4} size="h5">Historia Clínica Completa</Title>
        <Group gap="sm">
          <Button
            leftSection={<IconPrinter size={16} />}
            onClick={() => printHistoriaClinica(consultas, historiaClinica, patient, patientData)}
            variant="light"
            color="blue"
          >
            Imprimir HC
          </Button>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => setActiveTab('clinica')}
            variant="default"
          >
            Volver
          </Button>
        </Group>
      </Group>

  <Stack gap="md">
        {/* Información Completa de la Historia */}
          <Paper p="sm" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Stack gap="md">
            <Group>
              <Title order={5} size="h6" style={{ borderBottom: '2px solid var(--mantine-color-gray-3)', paddingBottom: '8px', width: '100%' }}>
                Información General de la Historia Clínica
              </Title>
            </Group>

            {/* Header con información básica */}
            <Grid gutter="sm">
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" fw={500}>Número de Historia:</Text>
                  <Text size="md" fw={700}>{historiaClinica.numeroHistoria}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" fw={500}>Fecha de Apertura:</Text>
                  <Text size="xs" fw={500}>{formatDate(historiaClinica.fechaApertura)}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" fw={500}>Estado:</Text>
                  <Badge color={historiaClinica.activa ? 'green' : 'gray'} variant="light" size="sm">
                    {historiaClinica.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" fw={500}>Total Consultas:</Text>
                  <Text size="sm" fw={500}>{consultas.length}</Text>
                </Stack>
              </Grid.Col>
            </Grid>

            {/* Datos Detallados de la Historia Clínica */}
            {historiaClinica.datosJson && (
              <Stack gap="md">
                {(() => {
                  try {
                    const parsed = JSON.parse(historiaClinica.datosJson);
                    const datosHistoria = parsed.datosJson ? JSON.parse(parsed.datosJson) : {};

                    return (
                      <Stack gap="md">
                        {/* Información del Médico e Información de Consulta en una fila */}
                        <Grid gutter="md">
                          {/* Información del Médico */}
                          {(datosHistoria.informacionMedico || datosHistoria.detalleConsulta) && (
                            <Grid.Col span={{ base: 12, lg: 6 }}>
                              <Paper p="sm" radius="md" withBorder>
                                <Stack gap="sm">
                                  <Group gap="xs">
                                    <IconUser size={16} color="var(--mantine-color-blue-6)" />
                                    <Text size="sm" fw={600} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', paddingBottom: '4px', width: '100%' }}>
                                      Médico Responsable
                                    </Text>
                                  </Group>
                                  <Stack gap="xs">
                                    <Group justify="space-between">
                                      <Text size="xs" c="dimmed">Nombre:</Text>
                                      <Text size="xs" fw={500}>{(datosHistoria.informacionMedico?.medicoResponsable || datosHistoria.detalleConsulta?.medicoTratante) || 'N/A'}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                      <Text size="xs" c="dimmed">Registro:</Text>
                                      <Text size="xs" fw={500}>{(datosHistoria.informacionMedico?.registroMedico) || 'N/A'}</Text>
                                    </Group>
                                    <Group justify="space-between">
                                      <Text size="xs" c="dimmed">Especialidad:</Text>
                                      <Text size="xs" fw={500}>{(datosHistoria.informacionMedico?.especialidad || datosHistoria.detalleConsulta?.especialidad) || 'N/A'}</Text>
                                    </Group>
                                  </Stack>
                                </Stack>
                              </Paper>
                            </Grid.Col>
                          )}

                          {/* Información de la Consulta */}
                          {datosHistoria.informacionConsulta && (
                            <Grid.Col span={{ base: 12, lg: 6 }}>
                              <Paper p="sm" radius="md" withBorder>
                                <Stack gap="sm">
                                  <Group gap="xs">
                                    <IconFileText size={16} color="var(--mantine-color-green-6)" />
                                    <Text size="sm" fw={600} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', paddingBottom: '4px', width: '100%' }}>
                                      Consulta Inicial
                                    </Text>
                                  </Group>
                                  <Stack gap="sm">
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Motivo:</Text>
                                      <Text size="xs">{datosHistoria.informacionConsulta.motivoConsulta || 'Apertura de historia clínica'}</Text>
                                    </Stack>
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Enfermedad Actual:</Text>
                                      <Text size="xs">{datosHistoria.informacionConsulta.enfermedadActual || 'N/A'}</Text>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Paper>
                            </Grid.Col>
                          )}
                        </Grid>

                        {/* Antecedentes Clínicos */}
                        {datosHistoria.antecedentesClinico && (
                          <Paper p="sm" radius="md" withBorder>
                            <Stack gap="sm">
                              <Group gap="xs">
                                <IconHeart size={16} color="var(--mantine-color-red-6)" />
                                <Text size="sm" fw={600} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', paddingBottom: '4px', width: '100%' }}>
                                  Antecedentes Clínicos
                                </Text>
                              </Group>
                              <Grid gutter="sm">
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                  <Stack gap={2}>
                                    <Text size="xs" c="dimmed" fw={500}>Personales:</Text>
                                    <Text size="xs">{datosHistoria.antecedentesClinico.antecedentesPersonales || 'N/A'}</Text>
                                  </Stack>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                  <Stack gap={4}>
                                    <Text size="xs" c="dimmed" fw={500}>Familiares:</Text>
                                    <Text size="xs">{datosHistoria.antecedentesClinico.antecedentesFamiliares || 'N/A'}</Text>
                                  </Stack>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                  <Stack gap={4}>
                                    <Text size="xs" c="dimmed" fw={500}>Quirúrgicos:</Text>
                                    <Text size="xs">{datosHistoria.antecedentesClinico.antecedentesQuirurgicos || 'N/A'}</Text>
                                  </Stack>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                  <Stack gap={4}>
                                    <Text size="xs" c="dimmed" fw={500}>Alérgicos:</Text>
                                    <Text size="xs">{datosHistoria.antecedentesClinico.antecedentesAlergicos || 'N/A'}</Text>
                                  </Stack>
                                </Grid.Col>
                              </Grid>
                            </Stack>
                          </Paper>
                        )}

                        {/* Examen Clínico y Diagnóstico/Tratamiento en una fila */}
                        <Grid gutter="md">
                          {/* Examen Clínico */}
                          {datosHistoria.examenClinico && (
                            <Grid.Col span={{ base: 12, lg: 6 }}>
                              <Paper p="sm" radius="md" withBorder>
                                <Stack gap="sm">
                                  <Group gap="xs">
                                    <IconId size={16} color="var(--mantine-color-violet-6)" />
                                    <Text size="sm" fw={600} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', paddingBottom: '4px', width: '100%' }}>
                                      Examen Clínico
                                    </Text>
                                  </Group>
                                  <Stack gap="sm">
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Examen Físico:</Text>
                                      <Text size="xs">{datosHistoria.examenClinico.examenFisico || 'N/A'}</Text>
                                    </Stack>
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Signos Vitales:</Text>
                                      <Text size="xs">{datosHistoria.examenClinico.signosVitales || 'N/A'}</Text>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Paper>
                            </Grid.Col>
                          )}

                          {/* Diagnóstico y Tratamiento */}
                          {datosHistoria.diagnosticoTratamiento && (
                            <Grid.Col span={{ base: 12, lg: 6 }}>
                              <Paper p="sm" radius="md" withBorder>
                                <Stack gap="sm">
                                  <Group gap="xs">
                                    <IconFileText size={16} color="var(--mantine-color-orange-6)" />
                                    <Text size="sm" fw={600} style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', paddingBottom: '4px', width: '100%' }}>
                                      Diagnóstico y Tratamiento
                                    </Text>
                                  </Group>
                                  <Stack gap="sm">
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Diagnósticos:</Text>
                                      <Text size="xs">{datosHistoria.diagnosticoTratamiento.diagnosticos || 'N/A'}</Text>
                                    </Stack>
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Plan de Tratamiento:</Text>
                                      <Text size="xs">{datosHistoria.diagnosticoTratamiento.planTratamiento || 'N/A'}</Text>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Paper>
                            </Grid.Col>
                          )}
                        </Grid>

                        {/* Información adicional de consulta si existe */}
                        {datosHistoria.informacionConsulta && (datosHistoria.informacionConsulta.revisionSistemas || datosHistoria.informacionConsulta.medicamentosActuales || datosHistoria.informacionConsulta.observaciones) && (
                          <Paper p="md" radius="md" withBorder>
                            <Stack gap="md">
                              <Text size="sm" fw={600}>Información Adicional de la Consulta</Text>
                              <Grid gutter="md">
                                {datosHistoria.informacionConsulta.revisionSistemas && (
                                  <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Revisión de Sistemas:</Text>
                                      <Text size="xs">{datosHistoria.informacionConsulta.revisionSistemas}</Text>
                                    </Stack>
                                  </Grid.Col>
                                )}
                                {datosHistoria.informacionConsulta.medicamentosActuales && (
                                  <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Medicamentos:</Text>
                                      <Text size="xs">{datosHistoria.informacionConsulta.medicamentosActuales}</Text>
                                    </Stack>
                                  </Grid.Col>
                                )}
                                {datosHistoria.informacionConsulta.observaciones && (
                                  <Grid.Col span={12}>
                                    <Stack gap={4}>
                                      <Text size="xs" c="dimmed" fw={500}>Observaciones:</Text>
                                      <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}>
                                        <Text size="xs">{datosHistoria.informacionConsulta.observaciones}</Text>
                                      </Paper>
                                    </Stack>
                                  </Grid.Col>
                                )}
                              </Grid>
                            </Stack>
                          </Paper>
                        )}
                      </Stack>
                    );
                  } catch (e) {
                    return (
                      <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}>
                        <Stack gap="sm">
                          <Text size="sm" fw={500}>Datos Adicionales (JSON Crudo):</Text>
                          <Code block style={{ maxHeight: '160px', overflowY: 'auto' }}>
                            {historiaClinica.datosJson}
                          </Code>
                        </Stack>
                      </Paper>
                    );
                  }
                })()}
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Detalle Completo de Consultas Médicas */}
        <Stack gap="md">
          <Title order={5} size="h6">Consultas Médicas Detalladas ({consultas.length})</Title>

          {consultas.length === 0 ? (
            <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
              <Stack gap="sm" align="center">
                <IconCalendar size={32} color="var(--mantine-color-gray-5)" />
                <Text size="sm" c="dimmed" ta="center">No hay consultas registradas</Text>
              </Stack>
            </Paper>
          ) : (
            <Stack gap="md">
              {consultas.map((consulta, index) => (
                <Paper key={consulta.id} p="md" radius="md" withBorder shadow="sm">
                  {/* Header de la consulta */}
                  <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                    <Group gap="md">
                      <Avatar color="blue" radius="xl" size="lg">
                        {index + 1}
                      </Avatar>
                      <Stack gap={2}>
                        <Title order={6} size="h6">Consulta #{consulta.id}</Title>
                        <Group gap="xs">
                          <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
                          <Text size="sm" c="dimmed">{formatDate(consulta.fechaCreacion)}</Text>
                        </Group>
                      </Stack>
                    </Group>
                    <Group gap="md">
                      <Button
                        leftSection={<IconPrinter size={16} />}
                        onClick={() => printConsulta(consulta, historiaClinica, patient, patientData)}
                        variant="light"
                        color="blue"
                        size="sm"
                      >
                        Imprimir
                      </Button>
                      <Stack gap={2} align="flex-end">
                        <Text size="xs" c="dimmed">Historia Clínica</Text>
                        <Text size="sm" fw={600} c="blue">{historiaClinica.numeroHistoria}</Text>
                      </Stack>
                    </Group>
                  </Group>

                  {/* Información Detallada de la Consulta */}
                  {consulta.datosJson && (
                    <Stack gap="md">
                      {(() => {
                        try {
                          const parsed = JSON.parse(consulta.datosJson);

                          return (
                            <Stack gap="md">
                              {/* Primera fila: Detalle de consulta e Información médica */}
                              <Grid gutter="md">
                                {/* Detalle de la Consulta */}
                                {parsed.detalleConsulta && (
                                  <Grid.Col span={{ base: 12, lg: 6 }}>
                                    <Paper p="sm" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                      <Stack gap="sm">
                                        <Group gap="xs">
                                          <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
                                          <Text size="sm" fw={600}>Detalle de la Consulta</Text>
                                        </Group>
                                        <Stack gap="xs">
                                          <Group justify="space-between">
                                            <Text size="xs" c="dimmed">Médico Tratante:</Text>
                                            <Text size="xs" fw={500}>{parsed.detalleConsulta.medicoTratante || 'N/A'}</Text>
                                          </Group>
                                          <Group justify="space-between">
                                            <Text size="xs" c="dimmed">Especialidad:</Text>
                                            <Text size="xs" fw={500}>{parsed.detalleConsulta.especialidad || 'N/A'}</Text>
                                          </Group>
                                          <Group justify="space-between">
                                            <Text size="xs" c="dimmed">Fecha Consulta:</Text>
                                            <Text size="xs" fw={500}>{parsed.detalleConsulta.fechaConsulta ? formatDate(parsed.detalleConsulta.fechaConsulta) : 'N/A'}</Text>
                                          </Group>
                                          {parsed.detalleConsulta.proximaCita && (
                                            <Group justify="space-between">
                                              <Text size="xs" c="dimmed">Próxima Cita:</Text>
                                              <Text size="xs" fw={500}>{parsed.detalleConsulta.proximaCita}</Text>
                                            </Group>
                                          )}
                                        </Stack>
                                      </Stack>
                                    </Paper>
                                  </Grid.Col>
                                )}

                                {/* Información médica adicional */}
                                {parsed.informacionMedico && (
                                  <Grid.Col span={{ base: 12, lg: 6 }}>
                                    <Paper p="sm" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                      <Stack gap="sm">
                                        <Group gap="xs">
                                          <IconUser size={16} color="var(--mantine-color-green-6)" />
                                          <Text size="sm" fw={600}>Información Médica</Text>
                                        </Group>
                                        <Stack gap="xs">
                                          <Group justify="space-between">
                                            <Text size="xs" c="dimmed">Registro Médico:</Text>
                                            <Text size="xs" fw={500}>{parsed.informacionMedico.registroMedico || 'N/A'}</Text>
                                          </Group>
                                          <Group justify="space-between">
                                            <Text size="xs" c="dimmed">Especialidad:</Text>
                                            <Text size="xs" fw={500}>{parsed.informacionMedico.especialidad || 'N/A'}</Text>
                                          </Group>
                                        </Stack>
                                      </Stack>
                                    </Paper>
                                  </Grid.Col>
                                )}
                              </Grid>

                              {/* Información de la Consulta */}
                              {parsed.informacionConsulta && (
                                <Paper p="md" radius="md" withBorder>
                                  <Stack gap="md">
                                    <Group gap="xs">
                                      <IconFileText size={16} color="var(--mantine-color-green-6)" />
                                      <Text size="sm" fw={600}>Información de la Consulta</Text>
                                    </Group>
                                    <Grid gutter="md">
                                      <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Stack gap={4}>
                                          <Text size="xs" c="dimmed" fw={500}>Motivo de Consulta:</Text>
                                          <Text size="xs" fw={500}>{parsed.informacionConsulta.motivoConsulta || 'N/A'}</Text>
                                        </Stack>
                                      </Grid.Col>
                                      <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Stack gap={4}>
                                          <Text size="xs" c="dimmed" fw={500}>Enfermedad Actual:</Text>
                                          <Text size="xs" fw={500}>{parsed.informacionConsulta.enfermedadActual || 'N/A'}</Text>
                                        </Stack>
                                      </Grid.Col>
                                      {parsed.informacionConsulta.revisionSistemas && (
                                        <Grid.Col span={{ base: 12, md: 6 }}>
                                          <Stack gap={4}>
                                            <Text size="xs" c="dimmed" fw={500}>Revisión de Sistemas:</Text>
                                            <Text size="xs">{parsed.informacionConsulta.revisionSistemas}</Text>
                                          </Stack>
                                        </Grid.Col>
                                      )}
                                      {parsed.informacionConsulta.medicamentosActuales && (
                                        <Grid.Col span={{ base: 12, md: 6 }}>
                                          <Stack gap={4}>
                                            <Text size="xs" c="dimmed" fw={500}>Medicamentos Actuales:</Text>
                                            <Text size="xs">{parsed.informacionConsulta.medicamentosActuales}</Text>
                                          </Stack>
                                        </Grid.Col>
                                      )}
                                      {parsed.informacionConsulta.observaciones && (
                                        <Grid.Col span={12}>
                                          <Stack gap={4}>
                                            <Text size="xs" c="dimmed" fw={500}>Observaciones:</Text>
                                            <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}>
                                              <Text size="xs">{parsed.informacionConsulta.observaciones}</Text>
                                            </Paper>
                                          </Stack>
                                        </Grid.Col>
                                      )}
                                    </Grid>
                                  </Stack>
                                </Paper>
                              )}

                              {/* Examen Clínico y Diagnóstico/Tratamiento en una fila */}
                              <Grid gutter="lg">
                                {/* Examen Clínico */}
                                {parsed.examenClinico && (
                                  <Grid.Col span={{ base: 12, lg: 6 }}>
                                    <Paper p="md" radius="md" withBorder>
                                      <Stack gap="md">
                                        <Group gap="xs">
                                          <IconId size={16} color="var(--mantine-color-violet-6)" />
                                          <Text size="sm" fw={600}>Examen Clínico</Text>
                                        </Group>
                                        <Stack gap="sm">
                                          <Stack gap={4}>
                                            <Text size="xs" c="dimmed" fw={500}>Examen Físico:</Text>
                                            <Text size="xs">{parsed.examenClinico.examenFisico || 'N/A'}</Text>
                                          </Stack>
                                          <Stack gap={4}>
                                            <Text size="xs" c="dimmed" fw={500}>Signos Vitales:</Text>
                                            <Text size="xs">{parsed.examenClinico.signosVitales || 'N/A'}</Text>
                                          </Stack>
                                        </Stack>
                                      </Stack>
                                    </Paper>
                                  </Grid.Col>
                                )}

                                {/* Diagnóstico y Tratamiento */}
                                {parsed.diagnosticoTratamiento && (
                                  <Grid.Col span={{ base: 12, lg: 6 }}>
                                    <Paper p="md" radius="md" withBorder>
                                      <Stack gap="md">
                                        <Group gap="xs">
                                          <IconHeart size={16} color="var(--mantine-color-red-6)" />
                                          <Text size="sm" fw={600}>Diagnóstico y Tratamiento</Text>
                                        </Group>
                                        <Stack gap="sm">
                                          <Stack gap={4}>
                                            <Text size="xs" c="dimmed" fw={500}>Diagnósticos:</Text>
                                            <Text size="xs">{parsed.diagnosticoTratamiento.diagnosticos || 'N/A'}</Text>
                                          </Stack>
                                          <Stack gap={4}>
                                            <Text size="xs" c="dimmed" fw={500}>Plan de Tratamiento:</Text>
                                            <Text size="xs">{parsed.diagnosticoTratamiento.planTratamiento || 'N/A'}</Text>
                                          </Stack>
                                        </Stack>
                                      </Stack>
                                    </Paper>
                                  </Grid.Col>
                                )}
                              </Grid>

                              {/* Seguimiento de la Consulta */}
                              {parsed.seguimientoConsulta && (
                                <Paper p="md" radius="md" withBorder>
                                  <Stack gap="md">
                                    <Group gap="xs">
                                      <IconClock size={16} color="var(--mantine-color-orange-6)" />
                                      <Text size="sm" fw={600}>Seguimiento de la Consulta</Text>
                                    </Group>
                                    <Grid gutter="md">
                                      <Grid.Col span={{ base: 12, md: 4 }}>
                                        <Stack gap={4}>
                                          <Text size="xs" c="dimmed" fw={500}>Evolución:</Text>
                                          <Text size="xs">{parsed.seguimientoConsulta.evolucion || 'N/A'}</Text>
                                        </Stack>
                                      </Grid.Col>
                                      <Grid.Col span={{ base: 12, md: 4 }}>
                                        <Stack gap={4}>
                                          <Text size="xs" c="dimmed" fw={500}>Complicaciones:</Text>
                                          <Text size="xs">{parsed.seguimientoConsulta.complicaciones || 'N/A'}</Text>
                                        </Stack>
                                      </Grid.Col>
                                      <Grid.Col span={{ base: 12, md: 4 }}>
                                        <Stack gap={4}>
                                          <Text size="xs" c="dimmed" fw={500}>Recomendaciones:</Text>
                                          <Text size="xs">{parsed.seguimientoConsulta.recomendaciones || 'N/A'}</Text>
                                        </Stack>
                                      </Grid.Col>
                                    </Grid>
                                  </Stack>
                                </Paper>
                              )}
                            </Stack>
                          );
                        } catch (e) {
                          return (
                            <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}>
                              <Stack gap="sm">
                                <Text size="sm" fw={500}>Información Detallada (JSON Crudo):</Text>
                                <Code block style={{ maxHeight: '160px', overflowY: 'auto' }}>
                                  {consulta.datosJson}
                                </Code>
                              </Stack>
                            </Paper>
                          );
                        }
                      })()}
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default PatientClinicalHistoryComplete;