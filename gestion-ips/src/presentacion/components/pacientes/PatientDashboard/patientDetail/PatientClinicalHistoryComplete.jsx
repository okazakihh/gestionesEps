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
  // Componente reutilizable para mostrar información en formato label:value
  const InfoRow = ({ label, value, icon: Icon }) => (
    <Group gap="md" wrap="nowrap">
      <Group gap="xs" style={{ minWidth: '180px' }}>
        {Icon && <Icon size={14} color="var(--mantine-color-gray-6)" />}
        <Text size="sm" c="dimmed" fw={500}>{label}:</Text>
      </Group>
      <Text size="sm" fw={500}>{value || 'N/A'}</Text>
    </Group>
  );
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
                                    <InfoRow 
                                      label="Nombre" 
                                      value={datosHistoria.informacionMedico?.medicoResponsable || datosHistoria.detalleConsulta?.medicoTratante}
                                      icon={IconUser}
                                    />
                                    <InfoRow 
                                      label="Registro" 
                                      value={datosHistoria.informacionMedico?.registroMedico}
                                      icon={IconId}
                                    />
                                    <InfoRow 
                                      label="Especialidad" 
                                      value={datosHistoria.informacionMedico?.especialidad || datosHistoria.detalleConsulta?.especialidad}
                                      icon={IconHeart}
                                    />
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
                                  <Stack gap="xs">
                                    <InfoRow 
                                      label="Motivo" 
                                      value={datosHistoria.informacionConsulta.motivoConsulta || 'Apertura de historia clínica'}
                                      icon={IconFileText}
                                    />
                                    <InfoRow 
                                      label="Enfermedad Actual" 
                                      value={datosHistoria.informacionConsulta.enfermedadActual}
                                      icon={IconHeart}
                                    />
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
                              <Grid gutter="xs">
                                <Grid.Col span={6}>
                                  <InfoRow 
                                    label="Personales" 
                                    value={datosHistoria.antecedentesClinico.antecedentesPersonales}
                                    icon={IconUser}
                                  />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                  <InfoRow 
                                    label="Familiares" 
                                    value={datosHistoria.antecedentesClinico.antecedentesFamiliares}
                                    icon={IconHeart}
                                  />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                  <InfoRow 
                                    label="Quirúrgicos" 
                                    value={datosHistoria.antecedentesClinico.antecedentesQuirurgicos}
                                    icon={IconFileText}
                                  />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                  <InfoRow 
                                    label="Alérgicos" 
                                    value={datosHistoria.antecedentesClinico.antecedentesAlergicos}
                                    icon={IconHeart}
                                  />
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
                                  <Stack gap="xs">
                                    <InfoRow 
                                      label="Examen Físico" 
                                      value={datosHistoria.examenClinico.examenFisico}
                                      icon={IconUser}
                                    />
                                    <InfoRow 
                                      label="Signos Vitales" 
                                      value={datosHistoria.examenClinico.signosVitales}
                                      icon={IconHeart}
                                    />
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
                                  <Stack gap="xs">
                                    <InfoRow 
                                      label="Diagnósticos" 
                                      value={datosHistoria.diagnosticoTratamiento.diagnosticos}
                                      icon={IconFileText}
                                    />
                                    <InfoRow 
                                      label="Plan de Tratamiento" 
                                      value={datosHistoria.diagnosticoTratamiento.planTratamiento}
                                      icon={IconHeart}
                                    />
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
                              <Group gap="xs">
                                <IconFileText size={16} color="var(--mantine-color-blue-6)" />
                                <Text size="sm" fw={600}>Información Adicional de la Consulta</Text>
                              </Group>
                              <Grid gutter="xs">
                                {datosHistoria.informacionConsulta.revisionSistemas && (
                                  <Grid.Col span={6}>
                                    <InfoRow 
                                      label="Revisión de Sistemas" 
                                      value={datosHistoria.informacionConsulta.revisionSistemas}
                                      icon={IconFileText}
                                    />
                                  </Grid.Col>
                                )}
                                {datosHistoria.informacionConsulta.medicamentosActuales && (
                                  <Grid.Col span={6}>
                                    <InfoRow 
                                      label="Medicamentos" 
                                      value={datosHistoria.informacionConsulta.medicamentosActuales}
                                      icon={IconHeart}
                                    />
                                  </Grid.Col>
                                )}
                                {datosHistoria.informacionConsulta.observaciones && (
                                  <Grid.Col span={12}>
                                    <InfoRow 
                                      label="Observaciones" 
                                      value={datosHistoria.informacionConsulta.observaciones}
                                      icon={IconFileText}
                                    />
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
                                          <InfoRow 
                                            label="Médico Tratante" 
                                            value={parsed.detalleConsulta.medicoTratante}
                                            icon={IconUser}
                                          />
                                          <InfoRow 
                                            label="Especialidad" 
                                            value={parsed.detalleConsulta.especialidad}
                                            icon={IconHeart}
                                          />
                                          <InfoRow 
                                            label="Fecha Consulta" 
                                            value={parsed.detalleConsulta.fechaConsulta ? formatDate(parsed.detalleConsulta.fechaConsulta) : null}
                                            icon={IconCalendar}
                                          />
                                          {parsed.detalleConsulta.proximaCita && (
                                            <InfoRow 
                                              label="Próxima Cita" 
                                              value={parsed.detalleConsulta.proximaCita}
                                              icon={IconClock}
                                            />
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
                                          <InfoRow 
                                            label="Registro Médico" 
                                            value={parsed.informacionMedico.registroMedico}
                                            icon={IconId}
                                          />
                                          <InfoRow 
                                            label="Especialidad" 
                                            value={parsed.informacionMedico.especialidad}
                                            icon={IconHeart}
                                          />
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
                                    <Grid gutter="xs">
                                      <Grid.Col span={6}>
                                        <InfoRow 
                                          label="Motivo de Consulta" 
                                          value={parsed.informacionConsulta.motivoConsulta}
                                          icon={IconFileText}
                                        />
                                      </Grid.Col>
                                      <Grid.Col span={6}>
                                        <InfoRow 
                                          label="Enfermedad Actual" 
                                          value={parsed.informacionConsulta.enfermedadActual}
                                          icon={IconHeart}
                                        />
                                      </Grid.Col>
                                      {parsed.informacionConsulta.revisionSistemas && (
                                        <Grid.Col span={6}>
                                          <InfoRow 
                                            label="Revisión de Sistemas" 
                                            value={parsed.informacionConsulta.revisionSistemas}
                                            icon={IconFileText}
                                          />
                                        </Grid.Col>
                                      )}
                                      {parsed.informacionConsulta.medicamentosActuales && (
                                        <Grid.Col span={6}>
                                          <InfoRow 
                                            label="Medicamentos Actuales" 
                                            value={parsed.informacionConsulta.medicamentosActuales}
                                            icon={IconHeart}
                                          />
                                        </Grid.Col>
                                      )}
                                      {parsed.informacionConsulta.observaciones && (
                                        <Grid.Col span={12}>
                                          <InfoRow 
                                            label="Observaciones" 
                                            value={parsed.informacionConsulta.observaciones}
                                            icon={IconFileText}
                                          />
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
                                        <Stack gap="xs">
                                          <InfoRow 
                                            label="Examen Físico" 
                                            value={parsed.examenClinico.examenFisico}
                                            icon={IconUser}
                                          />
                                          <InfoRow 
                                            label="Signos Vitales" 
                                            value={parsed.examenClinico.signosVitales}
                                            icon={IconHeart}
                                          />
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
                                        <Stack gap="xs">
                                          <InfoRow 
                                            label="Diagnósticos" 
                                            value={parsed.diagnosticoTratamiento.diagnosticos}
                                            icon={IconFileText}
                                          />
                                          <InfoRow 
                                            label="Plan de Tratamiento" 
                                            value={parsed.diagnosticoTratamiento.planTratamiento}
                                            icon={IconHeart}
                                          />
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
                                    <Grid gutter="xs">
                                      <Grid.Col span={6}>
                                        <InfoRow 
                                          label="Evolución" 
                                          value={parsed.seguimientoConsulta.evolucion}
                                          icon={IconClock}
                                        />
                                      </Grid.Col>
                                      <Grid.Col span={6}>
                                        <InfoRow 
                                          label="Complicaciones" 
                                          value={parsed.seguimientoConsulta.complicaciones}
                                          icon={IconHeart}
                                        />
                                      </Grid.Col>
                                      <Grid.Col span={12}>
                                        <InfoRow 
                                          label="Recomendaciones" 
                                          value={parsed.seguimientoConsulta.recomendaciones}
                                          icon={IconFileText}
                                        />
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