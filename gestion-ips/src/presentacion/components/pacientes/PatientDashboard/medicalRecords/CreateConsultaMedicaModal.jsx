import React, { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Grid, Tabs, Paper, Text, Box, Group, Stack, ScrollArea, Select } from '@mantine/core';
import { IconFileText, IconStethoscope, IconClipboard, IconCalendar, IconDeviceFloppy } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { historiasClinicasApiService } from '../../../../../data/services/pacientesApiService.js';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';
import SignosVitalesForm from './components/SignosVitalesForm.jsx';
import DiagnosticosTable from './components/DiagnosticosTable.jsx';
import MedicamentosTable from './components/MedicamentosTable.jsx';
import ExamenFisicoPorDependencia from './components/ExamenFisicoPorDependencia.jsx';
import { DEPENDENCIA_MEDICA_OPTIONS, REQUIERE_SIGNOS_VITALES } from '../../../../../negocio/utils/listHelps.js';

const CreateConsultaMedicaModal = ({ isOpen, onClose, onConsultaCreated, historiaClinicaId, citaData, patientData }) => {
  const { tema } = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('consulta');

  // Parse patient data si viene como JSON string
  const parsedPatientData = React.useMemo(() => {
    if (!patientData) return null;
    
    // Si ya tiene informacionPersonal parseado, usarlo
    if (patientData.informacionPersonal) {
      return patientData;
    }
    
    // Si tiene datosJson como string, parsearlo
    if (patientData.datosJson && typeof patientData.datosJson === 'string') {
      try {
        const datosJson = JSON.parse(patientData.datosJson);
        const informacionPersonal = datosJson.informacionPersonalJson 
          ? JSON.parse(datosJson.informacionPersonalJson) 
          : null;
        
        return {
          ...patientData,
          informacionPersonal
        };
      } catch (e) {
        console.error('Error parsing patient data:', e);
        return patientData;
      }
    }
    
    return patientData;
  }, [patientData]);

  const [formData, setFormData] = useState({
    historiaClinicaId: historiaClinicaId || '',
    
    // Detalle de consulta
    detalleConsulta: {
      medicoTratante: citaData?.medicoAsignado || '',
      especialidad: citaData?.especialidad || '',
      fechaConsulta: new Date().toISOString().slice(0, 16),
      tipoConsulta: 'control',
      proximaCita: ''
    },
    
    // Información de consulta
    informacionConsulta: {
      motivoConsulta: citaData?.motivo || '',
      enfermedadActual: '',
      observaciones: citaData?.notas || ''
    },
    
    // Examen físico
    examenFisico: {
      dependenciaMedica: '',
      signosVitales: {
        presionArterial: '',
        frecuenciaCardiaca: '',
        frecuenciaRespiratoria: '',
        temperatura: '',
        peso: '',
        talla: '',
        imc: '',
        spo2: ''
      },
      estadoGeneral: '',
      hallazgos: '',
      camposEspecificos: {}
    },
    
    // Diagnóstico y tratamiento
    diagnosticoTratamiento: {
      diagnosticos: [],
      planTratamiento: '',
      medicamentos: [],
      procedimientos: ''
    },
    // Incapacidad
    incapacidad: {
      aplica: false,
      tipo: '',
      fechaInicio: '',
      fechaFin: '',
      dias: '',
      motivo: ''
    },
    
    // Seguimiento
    seguimientoConsulta: {
      evolucion: '',
      complicaciones: 'ninguna',
      recomendaciones: ''
    },
    
    // Firma
    firmaDigital: {
      nombreMedico: citaData?.medicoAsignado || '',
      numeroCedula: '',
      especialidad: citaData?.especialidad || '',
      fechaFirma: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.informacionConsulta.motivoConsulta) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo de Consulta Requerido',
        text: 'Debe ingresar el motivo de la consulta',
        confirmButtonColor: '#EF4444'
      });
      setActiveTab('consulta');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const datosJson = JSON.stringify({
        detalleConsulta: formData.detalleConsulta,
        informacionConsulta: formData.informacionConsulta,
        examenFisico: formData.examenFisico,
        diagnosticoTratamiento: formData.diagnosticoTratamiento,
        incapacidad: formData.incapacidad,
        seguimientoConsulta: formData.seguimientoConsulta,
        firmaDigital: formData.firmaDigital
      });

      console.log('🩺 Enviando Consulta Médica:', JSON.stringify({ historiaClinicaId: formData.historiaClinicaId, datosJson }, null, 2));

      const result = await historiasClinicasApiService.crearConsulta(formData.historiaClinicaId, datosJson);

      await Swal.fire({
        icon: 'success',
        title: '✅ Consulta Médica Creada',
        text: 'La consulta ha sido registrada exitosamente.',
        confirmButtonColor: '#8B5CF6',
        timer: 2500,
        timerProgressBar: true
      });

      onConsultaCreated && onConsultaCreated(result);
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar consulta médica:', err);

      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Consulta',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error al guardar la consulta médica.',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar consulta médica');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconStethoscope size={24} style={{ color: tema.primaryColor }} />
          <Text size="lg" fw={700}>Nueva Consulta Médica</Text>
        </Group>
      }
      size="xl"
      centered
          overlayColor={tema.primaryColor}
          styles={{
            content: { maxHeight: '90vh' },
            body: { padding: 0 },
            header: { backgroundColor: `${tema.primaryColor} !important`, padding: '10px 16px' },
            title: { color: 'white !important' },
            close: { color: 'white !important' }
          }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={0}>
          {/* Info del Paciente */}
          <Paper p="md" m="md" mb={0} style={{ backgroundColor: `${tema.primaryColor}15`, border: `1px solid ${tema.primaryColor}40` }}>
            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed" fw={500}>Paciente</Text>
                <Text size="sm" fw={600}>
                  {parsedPatientData?.informacionPersonal?.primerNombre || citaData?.nombre || 'N/A'} {parsedPatientData?.informacionPersonal?.primerApellido || ''}
                </Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="xs" c="dimmed" fw={500}>Documento</Text>
                <Text size="sm" fw={600}>{parsedPatientData?.numeroDocumento || citaData?.documento || 'N/A'}</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="xs" c="dimmed" fw={500}>HC #</Text>
                <Text size="sm" fw={600} style={{ color: tema.primaryColor }}>{historiaClinicaId || 'N/A'}</Text>
              </Grid.Col>
            </Grid>
          </Paper>

          {error && (
            <Paper p="md" m="md" mb={0} withBorder style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
              <Text c="red" size="sm" fw={500}>{error}</Text>
            </Paper>
          )}

          {/* Tabs */}
          <Box px="md" pt="md">
            <Tabs value={activeTab} onChange={setActiveTab} color={tema.mantineColor} variant="pills">
              <Tabs.List>
                <Tabs.Tab value="consulta" leftSection={<IconFileText size={14} />}>
                  Información
                </Tabs.Tab>
                <Tabs.Tab value="examen" leftSection={<IconStethoscope size={14} />}>
                  Examen Físico
                </Tabs.Tab>
                <Tabs.Tab value="diagnostico" leftSection={<IconClipboard size={14} />}>
                  Diagnóstico
                </Tabs.Tab>
                <Tabs.Tab value="seguimiento" leftSection={<IconCalendar size={14} />}>
                  Seguimiento
                </Tabs.Tab>
              </Tabs.List>

              <ScrollArea h="calc(90vh - 300px)" mt="md">
                <Box p="md">
                  {/* TAB 1: Información de Consulta */}
                  <Tabs.Panel value="consulta">
                    <Paper p="md" withBorder>
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Tipo de Consulta</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Select
                            label="Tipo de Consulta"
                            placeholder="Seleccione el tipo"
                            value={formData.detalleConsulta?.tipoConsulta}
                            onChange={(value) => setFormData(prev => ({
                              ...prev,
                              detalleConsulta: { ...prev.detalleConsulta, tipoConsulta: value }
                            }))}
                            data={[
                              { value: 'primera_vez', label: 'Primera Vez' },
                              { value: 'control', label: 'Control' },
                              { value: 'urgencia', label: 'Urgencia' }
                            ]}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Motivo y Anamnesis</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Motivo de Consulta"
                            placeholder="Describa el motivo de la consulta..."
                            value={formData.informacionConsulta?.motivoConsulta}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              informacionConsulta: { ...prev.informacionConsulta, motivoConsulta: e.target.value }
                            }))}
                            minRows={3}
                            required
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Enfermedad Actual"
                            placeholder="Historia de la enfermedad actual..."
                            value={formData.informacionConsulta?.enfermedadActual}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              informacionConsulta: { ...prev.informacionConsulta, enfermedadActual: e.target.value }
                            }))}
                            minRows={4}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Observaciones Adicionales"
                            placeholder="Información adicional relevante..."
                            value={formData.informacionConsulta?.observaciones}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              informacionConsulta: { ...prev.informacionConsulta, observaciones: e.target.value }
                            }))}
                            minRows={2}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Tabs.Panel>

                  {/* TAB 2: Examen Físico */}
                  <Tabs.Panel value="examen">
                    <Paper p="md" withBorder>
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Dependencia Médica</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Select
                            label="Seleccione la Dependencia Médica"
                            placeholder="Ej: Otorrinolaringología, Optometría, etc."
                            data={DEPENDENCIA_MEDICA_OPTIONS}
                            value={formData.examenFisico?.dependenciaMedica}
                            onChange={(value) => setFormData(prev => ({
                              ...prev,
                              examenFisico: { 
                                ...prev.examenFisico, 
                                dependenciaMedica: value,
                                camposEspecificos: {} // Reset campos al cambiar dependencia
                              }
                            }))}
                            required
                            size="sm"
                            searchable
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    {/* Signos Vitales - Solo si la dependencia lo requiere */}
                    {formData.examenFisico?.dependenciaMedica && 
                     REQUIERE_SIGNOS_VITALES[formData.examenFisico.dependenciaMedica] && (
                      <Paper p="md" withBorder mt="md">
                        <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Signos Vitales</Text>
                        <SignosVitalesForm
                          values={formData.examenFisico?.signosVitales || {}}
                          onChange={(signosVitales) => setFormData(prev => ({
                            ...prev,
                            examenFisico: { ...prev.examenFisico, signosVitales }
                          }))}
                        />
                      </Paper>
                    )}

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Estado General y Hallazgos</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Estado General"
                            placeholder="Descripción del estado general del paciente..."
                            value={formData.examenFisico?.estadoGeneral}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              examenFisico: { ...prev.examenFisico, estadoGeneral: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Hallazgos Generales"
                            placeholder="Hallazgos relevantes del examen físico general..."
                            value={formData.examenFisico?.hallazgos}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              examenFisico: { ...prev.examenFisico, hallazgos: e.target.value }
                            }))}
                            minRows={4}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    {/* Campos específicos por dependencia */}
                    {formData.examenFisico?.dependenciaMedica && (
                      <Box mt="md">
                        <ExamenFisicoPorDependencia
                          dependencia={formData.examenFisico.dependenciaMedica}
                          valores={formData.examenFisico?.camposEspecificos || {}}
                          onChange={(camposEspecificos) => setFormData(prev => ({
                            ...prev,
                            examenFisico: { ...prev.examenFisico, camposEspecificos }
                          }))}
                        />
                      </Box>
                    )}
                  </Tabs.Panel>

                  {/* TAB 3: Diagnóstico y Tratamiento */}
                  <Tabs.Panel value="diagnostico">
                    <Paper p="md" withBorder>
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Diagnósticos CIE-10</Text>
                      <DiagnosticosTable
                        diagnosticos={formData.diagnosticoTratamiento?.diagnosticos || []}
                        onChange={(diagnosticos) => setFormData(prev => ({
                          ...prev,
                          diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, diagnosticos }
                        }))}
                      />
                    </Paper>

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Plan de Tratamiento</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Plan de Tratamiento"
                            placeholder="Descripción del plan de tratamiento..."
                            value={formData.diagnosticoTratamiento?.planTratamiento}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, planTratamiento: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Medicamentos Formulados</Text>
                      <MedicamentosTable
                        medicamentos={formData.diagnosticoTratamiento?.medicamentos || []}
                        onChange={(medicamentos) => setFormData(prev => ({
                          ...prev,
                          diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, medicamentos }
                        }))}
                      />
                    </Paper>

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Procedimientos</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Procedimientos Realizados"
                            placeholder="Describa los procedimientos realizados..."
                            value={formData.diagnosticoTratamiento?.procedimientos}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, procedimientos: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    {/* Incapacidad */}
                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Incapacidad</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Group>
                            <Text size="xs">Emitir incapacidad</Text>
                            <input
                              type="checkbox"
                              checked={formData.incapacidad.aplica}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                incapacidad: { ...prev.incapacidad, aplica: e.currentTarget.checked }
                              }))}
                            />
                          </Group>
                        </Grid.Col>

                        {formData.incapacidad.aplica && (
                          <>
                            <Grid.Col span={6}>
                              <TextInput
                                label="Tipo de Incapacidad"
                                placeholder="Ej: Laboral"
                                value={formData.incapacidad.tipo}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, tipo: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <TextInput
                                label="Fecha Inicio"
                                type="date"
                                value={formData.incapacidad.fechaInicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, fechaInicio: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <TextInput
                                label="Fecha Fin"
                                type="date"
                                value={formData.incapacidad.fechaFin}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, fechaFin: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                            <Grid.Col span={4}>
                              <TextInput
                                label="Días"
                                type="number"
                                value={formData.incapacidad.dias}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, dias: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                            <Grid.Col span={8}>
                              <TextInput
                                label="Motivo"
                                placeholder="Motivo de la incapacidad"
                                value={formData.incapacidad.motivo}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, motivo: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                          </>
                        )}
                      </Grid>
                    </Paper>
                  </Tabs.Panel>

                  {/* TAB 4: Seguimiento */}
                  <Tabs.Panel value="seguimiento">
                    <Paper p="md" withBorder>
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Evolución y Seguimiento</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Evolución del Paciente"
                            placeholder="Evolución del paciente durante la consulta..."
                            value={formData.seguimientoConsulta?.evolucion}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              seguimientoConsulta: { ...prev.seguimientoConsulta, evolucion: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Complicaciones"
                            placeholder="Complicaciones presentadas (si aplica)..."
                            value={formData.seguimientoConsulta?.complicaciones}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              seguimientoConsulta: { ...prev.seguimientoConsulta, complicaciones: e.target.value }
                            }))}
                            minRows={2}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Recomendaciones"
                            placeholder="Recomendaciones médicas para el paciente..."
                            value={formData.seguimientoConsulta?.recomendaciones}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              seguimientoConsulta: { ...prev.seguimientoConsulta, recomendaciones: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <TextInput
                            label="Próxima Cita (Opcional)"
                            type="date"
                            value={formData.seguimientoConsulta?.proximaCita}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              seguimientoConsulta: { ...prev.seguimientoConsulta, proximaCita: e.target.value }
                            }))}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Tabs.Panel>
                </Box>
              </ScrollArea>
            </Tabs>
          </Box>
        </Stack>

        {/* Footer con botones */}
        <Paper p="md" shadow="sm" style={{ borderTop: '1px solid #E5E7EB' }}>
          <Group justify="space-between">
            <Button
              variant="subtle"
              onClick={onClose}
              color="gray"
            >
              Cancelar
            </Button>
            <Group>
              {activeTab !== 'consulta' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const tabs = ['consulta', 'examen', 'diagnostico', 'seguimiento'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  color={tema.mantineColor}
                >
                  Anterior
                </Button>
              )}
              {activeTab !== 'seguimiento' ? (
                <Button
                  onClick={() => {
                    const tabs = ['consulta', 'examen', 'diagnostico', 'seguimiento'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  color={tema.mantineColor}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={saving}
                  leftSection={<IconDeviceFloppy size={16} />}
                  color={tema.mantineColor}
                >
                  Guardar Consulta
                </Button>
              )}
            </Group>
          </Group>
        </Paper>
      </form>
    </Modal>
  );
};

export default CreateConsultaMedicaModal;