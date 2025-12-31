import React, { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Grid, Tabs, Paper, Text, Divider, Box, Group } from '@mantine/core';
import Swal from 'sweetalert2';
import { historiasClinicasApiService } from '../../../../../data/services/pacientesApiService.js';

const CreateConsultaMedicaModal = ({ isOpen, onClose, onConsultaCreated, historiaClinicaId, citaData }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    historiaClinicaId: historiaClinicaId || '',
    detalleConsulta: {
      medicoTratante: citaData?.medicoAsignado || '',
      especialidad: citaData?.especialidad || '',
      fechaConsulta: new Date().toISOString().slice(0, 16), // Formato datetime-local
      proximaCita: ''
    },
    informacionMedico: {
      registroMedico: '',
      especialidad: citaData?.especialidad || ''
    },
    informacionConsulta: {
      motivoConsulta: citaData?.motivo || '',
      enfermedadActual: '',
      revisionSistemas: '',
      medicamentosActuales: '',
      observaciones: citaData?.notas || ''
    },
    examenClinico: {
      examenFisico: '',
      signosVitales: ''
    },
    diagnosticoTratamiento: {
      diagnosticos: '',
      planTratamiento: ''
    },
    seguimientoConsulta: {
      evolucion: '',
      complicaciones: '',
      recomendaciones: ''
    },
    firmaDigital: {
      nombreMedico: citaData?.medicoAsignado || '',
      numeroCedula: '',
      especialidad: citaData?.especialidad || '',
      fechaFirma: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Convert form data to JSON string for datosJson
      const datosJson = JSON.stringify({
        detalleConsulta: formData.detalleConsulta,
        informacionMedico: formData.informacionMedico,
        informacionConsulta: formData.informacionConsulta,
        examenClinico: formData.examenClinico,
        diagnosticoTratamiento: formData.diagnosticoTratamiento,
        seguimientoConsulta: formData.seguimientoConsulta,
        firmaDigital: formData.firmaDigital
      });

      const submitData = {
        historiaClinicaId: formData.historiaClinicaId,
        datosJson: datosJson
      };


      const result = await historiasClinicasApiService.crearConsulta(formData.historiaClinicaId, submitData.datosJson);


      // Mostrar SweetAlert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Consulta Médica Creada!',
        text: `La consulta médica ha sido registrada exitosamente.`,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8B5CF6',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      onConsultaCreated && onConsultaCreated(result);
      onClose();
    } catch (err) {
      console.error('Error al guardar consulta médica:', err);

      // Mostrar SweetAlert de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Consulta Médica',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error al guardar la consulta médica. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar consulta médica');
    } finally {
      setSaving(false);
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section]),
        [field]: value
      }
    }));
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Nueva Consulta Médica"
      size="xl"
      centered
      styles={{
        title: { fontSize: '1.125rem', fontWeight: 600, color: '#7C3AED' }
      }}
    >
      {/* Información del Paciente */}
      <Paper p="md" mb="md" style={{ backgroundColor: '#F3E8FF', border: '1px solid #C084FC' }}>
        <Group position="apart">
          <div>
            <Text size="sm" weight={600} style={{ color: '#581C87' }}>
              Paciente
            </Text>
            <Text size="xs" style={{ color: '#7C3AED', marginTop: 4 }}>
              {citaData?.nombre || 'No disponible'}
            </Text>
          </div>
        </Group>
      </Paper>

      {error && (
        <Paper p="sm" mb="md" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          <Text size="xs" style={{ color: '#991B1B' }}>{error}</Text>
        </Paper>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="detalle" variant="pills">
          <Tabs.List>
            <Tabs.Tab value="detalle">Detalle de Consulta</Tabs.Tab>
            <Tabs.Tab value="clinico">Examen Clínico</Tabs.Tab>
            <Tabs.Tab value="diagnostico">Diagnóstico</Tabs.Tab>
            <Tabs.Tab value="firma">Firma Digital</Tabs.Tab>
          </Tabs.List>

          {/* Tab: Detalle de Consulta */}
          <Tabs.Panel value="detalle" pt="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="ID Historia Clínica"
                  value={formData.historiaClinicaId}
                  readOnly
                  styles={{ input: { backgroundColor: '#F9FAFB' } }}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Médico Tratante"
                  value={formData.detalleConsulta?.medicoTratante}
                  onChange={(e) => handleNestedInputChange('detalleConsulta', 'medicoTratante', e.target.value)}
                  required
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Especialidad"
                  value={formData.detalleConsulta?.especialidad}
                  onChange={(e) => handleNestedInputChange('detalleConsulta', 'especialidad', e.target.value)}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Fecha de Consulta"
                  type="datetime-local"
                  value={formData.detalleConsulta?.fechaConsulta}
                  onChange={(e) => handleNestedInputChange('detalleConsulta', 'fechaConsulta', e.target.value)}
                  required
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Próxima Cita"
                  type="datetime-local"
                  value={formData.detalleConsulta?.proximaCita}
                  onChange={(e) => handleNestedInputChange('detalleConsulta', 'proximaCita', e.target.value)}
                  size="sm"
                />
              </Grid.Col>
            </Grid>

            <Divider my="md" label="Información de Consulta" labelPosition="center" />

            <Grid>
              <Grid.Col span={6}>
                <Textarea
                  label="Motivo de Consulta"
                  value={formData.informacionConsulta?.motivoConsulta}
                  onChange={(e) => handleNestedInputChange('informacionConsulta', 'motivoConsulta', e.target.value)}
                  placeholder="Describa el motivo..."
                  minRows={3}
                  required
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Textarea
                  label="Enfermedad Actual"
                  value={formData.informacionConsulta?.enfermedadActual}
                  onChange={(e) => handleNestedInputChange('informacionConsulta', 'enfermedadActual', e.target.value)}
                  placeholder="Describa la enfermedad..."
                  minRows={3}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Observaciones"
                  value={formData.informacionConsulta?.observaciones}
                  onChange={(e) => handleNestedInputChange('informacionConsulta', 'observaciones', e.target.value)}
                  placeholder="Observaciones adicionales..."
                  minRows={2}
                  size="sm"
                />
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Tab: Examen Clínico */}
          <Tabs.Panel value="clinico" pt="md">
            <Grid>
              <Grid.Col span={6}>
                <Textarea
                  label="Examen Físico"
                  value={formData.examenClinico?.examenFisico}
                  onChange={(e) => handleNestedInputChange('examenClinico', 'examenFisico', e.target.value)}
                  placeholder="Resultados del examen..."
                  minRows={4}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Textarea
                  label="Signos Vitales"
                  value={formData.examenClinico?.signosVitales}
                  onChange={(e) => handleNestedInputChange('examenClinico', 'signosVitales', e.target.value)}
                  placeholder="Signos vitales..."
                  minRows={4}
                  size="sm"
                />
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Tab: Diagnóstico y Tratamiento */}
          <Tabs.Panel value="diagnostico" pt="md">
            <Grid>
              <Grid.Col span={12}>
                <Textarea
                  label="Diagnósticos"
                  value={formData.diagnosticoTratamiento?.diagnosticos}
                  onChange={(e) => handleNestedInputChange('diagnosticoTratamiento', 'diagnosticos', e.target.value)}
                  placeholder="Diagnósticos realizados..."
                  minRows={3}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Plan de Tratamiento"
                  value={formData.diagnosticoTratamiento?.planTratamiento}
                  onChange={(e) => handleNestedInputChange('diagnosticoTratamiento', 'planTratamiento', e.target.value)}
                  placeholder="Plan de tratamiento..."
                  minRows={3}
                  size="sm"
                />
              </Grid.Col>
            </Grid>

            <Divider my="md" label="Seguimiento de Consulta" labelPosition="center" />

            <Grid>
              <Grid.Col span={12}>
                <Textarea
                  label="Evolución"
                  value={formData.seguimientoConsulta?.evolucion}
                  onChange={(e) => handleNestedInputChange('seguimientoConsulta', 'evolucion', e.target.value)}
                  placeholder="Evolución del paciente..."
                  minRows={2}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Recomendaciones"
                  value={formData.seguimientoConsulta?.recomendaciones}
                  onChange={(e) => handleNestedInputChange('seguimientoConsulta', 'recomendaciones', e.target.value)}
                  placeholder="Recomendaciones médicas..."
                  minRows={2}
                  size="sm"
                />
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Tab: Firma Digital */}
          <Tabs.Panel value="firma" pt="md">
            <Grid>
              <Grid.Col span={4}>
                <TextInput
                  label="Nombre del Médico"
                  value={formData.firmaDigital?.nombreMedico}
                  onChange={(e) => handleNestedInputChange('firmaDigital', 'nombreMedico', e.target.value)}
                  required
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Número de Cédula"
                  value={formData.firmaDigital?.numeroCedula}
                  onChange={(e) => handleNestedInputChange('firmaDigital', 'numeroCedula', e.target.value)}
                  required
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Especialidad"
                  value={formData.firmaDigital?.especialidad}
                  onChange={(e) => handleNestedInputChange('firmaDigital', 'especialidad', e.target.value)}
                  required
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Fecha de Firma"
                  type="date"
                  value={formData.firmaDigital?.fechaFirma}
                  onChange={(e) => handleNestedInputChange('firmaDigital', 'fechaFirma', e.target.value)}
                  required
                  size="sm"
                />
              </Grid.Col>
            </Grid>

            <Box mt="xl">
              <Paper p="lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <Text size="sm" weight={500} mb="md" align="center">Vista Previa de la Firma Digital</Text>
                <div style={{ textAlign: 'center' }}>
                  <Text size="lg" weight={700} style={{ color: '#1F2937' }}>
                    {formData.firmaDigital?.nombreMedico || 'Nombre del Médico'}
                  </Text>
                  <Text size="sm" style={{ color: '#6B7280', marginTop: 4 }}>
                    Cédula: {formData.firmaDigital?.numeroCedula || 'Número de Cédula'}
                  </Text>
                  <Text size="sm" style={{ color: '#6B7280' }}>
                    Especialidad: {formData.firmaDigital?.especialidad || 'Especialidad'}
                  </Text>
                  <Text size="xs" style={{ color: '#9CA3AF', marginTop: 8 }}>
                    Fecha: {formData.firmaDigital?.fechaFirma ? new Date(formData.firmaDigital.fechaFirma).toLocaleDateString('es-CO') : 'Fecha de Firma'}
                  </Text>
                  <Divider my="sm" />
                  <Text size="xs" italic style={{ color: '#9CA3AF' }}>
                    Firma Digital Autorizada
                  </Text>
                </div>
              </Paper>
            </Box>
          </Tabs.Panel>
        </Tabs>

        <Group position="right" mt="xl">
          <Button variant="subtle" onClick={onClose} color="gray">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            loading={saving}
            style={{ backgroundColor: '#7C3AED' }}
          >
            {saving ? 'Guardando...' : 'Crear Consulta'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateConsultaMedicaModal;
