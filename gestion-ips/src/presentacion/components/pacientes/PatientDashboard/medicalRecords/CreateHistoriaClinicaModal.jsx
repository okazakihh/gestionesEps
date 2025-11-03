import React, { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Grid, Tabs, Paper, Text, Divider, Box, Group } from '@mantine/core';
import Swal from 'sweetalert2';
import { historiasClinicasApiService, pacientesApiService } from '../../../../../data/services/pacientesApiService.js';

const CreateHistoriaClinicaModal = ({ isOpen, onClose, onHistoriaCreated, pacienteId, citaId, citaData }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    pacienteId: pacienteId || '',
    fechaApertura: new Date().toISOString().split('T')[0],
    informacionMedico: {
      medicoResponsable: citaData?.medicoAsignado || '',
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
    antecedentesClinico: {
      antecedentesPersonales: '',
      antecedentesFamiliares: '',
      antecedentesQuirurgicos: '',
      antecedentesAlergicos: ''
    },
    examenClinico: {
      examenFisico: '',
      signosVitales: ''
    },
    diagnosticoTratamiento: {
      diagnosticos: '',
      planTratamiento: ''
    },
    firmaDigital: {
      nombreMedico: citaData?.medicoAsignado || '',
      numeroCedula: '',
      especialidad: citaData?.especialidad || '',
      fechaFirma: new Date().toISOString().split('T')[0]
    },
    activa: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Convert form data to JSON string for datosJson
      const datosJson = JSON.stringify({
        informacionMedico: formData.informacionMedico,
        informacionConsulta: formData.informacionConsulta,
        antecedentesClinico: formData.antecedentesClinico,
        examenClinico: formData.examenClinico,
        diagnosticoTratamiento: formData.diagnosticoTratamiento,
        firmaDigital: formData.firmaDigital
      });

      const submitData = {
        fechaApertura: formData.fechaApertura,
        datosJson: datosJson,
        activa: formData.activa
      };

      console.log('Enviando datos de historia clínica:', JSON.stringify(submitData, null, 2));

      const result = await historiasClinicasApiService.createHistoriaClinica(formData.pacienteId, submitData);

      console.log('Respuesta del backend:', result);

      // Actualizar el estado de la cita a ATENDIDO justo después de guardar la historia clínica
      if (citaId) {
        try {
          console.log('Actualizando estado de cita', citaId, 'a ATENDIDO');
          await pacientesApiService.actualizarEstadoCita(citaId, 'ATENDIDO');
          console.log('Estado de cita actualizado exitosamente');
        } catch (citaError) {
          console.error('Error al actualizar estado de cita:', citaError);
          // No fallar la creación de la historia si falla la actualización de cita
        }
      }

      // Mostrar SweetAlert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Historia Clínica Creadaaaaa!',
        text: `La historia clínica ha sido creada exitosamente para el paciente.`,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      onHistoriaCreated && onHistoriaCreated(result);
      onClose();
    } catch (err) {
      console.error('Error al guardar historia clínica:', err);

      // Mostrar SweetAlert de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Historia Clínica',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error al guardar la historia clínica. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar historia clínica');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Crear Historia Clínica"
      size="xl"
      centered
      styles={{
        title: { fontSize: '1.25rem', fontWeight: 600 }
      }}
    >
      <Box>
        {error && (
          <Paper p="md" mb="md" withBorder style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
            <Text c="red" size="sm">{error}</Text>
          </Paper>
        )}

        <Tabs defaultValue="basica" color="green" variant="pills">
          <Tabs.List mb="md">
            <Tabs.Tab value="basica">Información Básica</Tabs.Tab>
            <Tabs.Tab value="medico">Información Médica</Tabs.Tab>
            <Tabs.Tab value="consulta">Información de Consulta</Tabs.Tab>
            <Tabs.Tab value="antecedentes">Antecedentes</Tabs.Tab>
            <Tabs.Tab value="examen">Examen Clínico</Tabs.Tab>
            <Tabs.Tab value="diagnostico">Diagnóstico</Tabs.Tab>
            <Tabs.Tab value="firma">Firma Digital</Tabs.Tab>
          </Tabs.List>

          {/* Información Básica */}
          <Tabs.Panel value="basica">
            <Paper p="md" withBorder>
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <TextInput
                    label="ID del Paciente"
                    value={formData.pacienteId}
                    onChange={(e) => setFormData({...formData, pacienteId: e.target.value})}
                    disabled
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Fecha de Apertura"
                    type="date"
                    value={formData.fechaApertura}
                    onChange={(e) => setFormData({...formData, fechaApertura: e.target.value})}
                    required
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* Información Médica */}
          <Tabs.Panel value="medico">
            <Paper p="md" withBorder>
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <TextInput
                    label="Médico Responsable"
                    value={formData.informacionMedico.medicoResponsable}
                    onChange={(e) => setFormData({
                      ...formData,
                      informacionMedico: { ...formData.informacionMedico, medicoResponsable: e.target.value }
                    })}
                    placeholder="Nombre del médico responsable"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Registro Médico"
                    value={formData.informacionMedico.registroMedico}
                    onChange={(e) => setFormData({
                      ...formData,
                      informacionMedico: { ...formData.informacionMedico, registroMedico: e.target.value }
                    })}
                    placeholder="Número de registro médico"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Especialidad"
                    value={formData.informacionMedico.especialidad}
                    onChange={(e) => setFormData({
                      ...formData,
                      informacionMedico: { ...formData.informacionMedico, especialidad: e.target.value }
                    })}
                    placeholder="Especialidad médica"
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* Información de Consulta */}
          <Tabs.Panel value="consulta">
            <Paper p="md" withBorder>
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Textarea
                    label="Motivo de Consulta"
                    value={formData.informacionConsulta.motivoConsulta}
                    onChange={(e) => setFormData({
                      ...formData,
                      informacionConsulta: { ...formData.informacionConsulta, motivoConsulta: e.target.value }
                    })}
                    placeholder="Describa el motivo de la consulta"
                    minRows={3}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Enfermedad Actual"
                    value={formData.informacionConsulta.enfermedadActual}
                    onChange={(e) => setFormData({
                      ...formData,
                      informacionConsulta: { ...formData.informacionConsulta, enfermedadActual: e.target.value }
                    })}
                    placeholder="Describa la enfermedad actual"
                    minRows={3}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Revisión de Sistemas"
                    value={formData.informacionConsulta.revisionSistemas}
                    onChange={(e) => setFormData({
                      ...formData,
                      informacionConsulta: { ...formData.informacionConsulta, revisionSistemas: e.target.value }
                    })}
                    placeholder="Revisión por sistemas"
                    minRows={3}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Medicamentos Actuales"
                    value={formData.informacionConsulta.medicamentosActuales}
                    onChange={(e) => setFormData({
                      ...formData,
                      informacionConsulta: { ...formData.informacionConsulta, medicamentosActuales: e.target.value }
                    })}
                    placeholder="Lista de medicamentos que está tomando actualmente"
                    minRows={2}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Observaciones"
                    value={formData.informacionConsulta.observaciones}
                    onChange={(e) => setFormData({
                      ...formData,
                      informacionConsulta: { ...formData.informacionConsulta, observaciones: e.target.value }
                    })}
                    placeholder="Observaciones adicionales"
                    minRows={2}
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* Antecedentes Clínicos */}
          <Tabs.Panel value="antecedentes">
            <Paper p="md" withBorder>
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Textarea
                    label="Antecedentes Personales"
                    value={formData.antecedentesClinico.antecedentesPersonales}
                    onChange={(e) => setFormData({
                      ...formData,
                      antecedentesClinico: { ...formData.antecedentesClinico, antecedentesPersonales: e.target.value }
                    })}
                    placeholder="Enfermedades previas, cirugías, etc."
                    minRows={3}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Antecedentes Familiares"
                    value={formData.antecedentesClinico.antecedentesFamiliares}
                    onChange={(e) => setFormData({
                      ...formData,
                      antecedentesClinico: { ...formData.antecedentesClinico, antecedentesFamiliares: e.target.value }
                    })}
                    placeholder="Enfermedades familiares relevantes"
                    minRows={3}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Antecedentes Quirúrgicos"
                    value={formData.antecedentesClinico.antecedentesQuirurgicos}
                    onChange={(e) => setFormData({
                      ...formData,
                      antecedentesClinico: { ...formData.antecedentesClinico, antecedentesQuirurgicos: e.target.value }
                    })}
                    placeholder="Cirugías previas"
                    minRows={2}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Antecedentes Alérgicos"
                    value={formData.antecedentesClinico.antecedentesAlergicos}
                    onChange={(e) => setFormData({
                      ...formData,
                      antecedentesClinico: { ...formData.antecedentesClinico, antecedentesAlergicos: e.target.value }
                    })}
                    placeholder="Alergias conocidas"
                    minRows={2}
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* Examen Clínico */}
          <Tabs.Panel value="examen">
            <Paper p="md" withBorder>
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Textarea
                    label="Examen Físico"
                    value={formData.examenClinico.examenFisico}
                    onChange={(e) => setFormData({
                      ...formData,
                      examenClinico: { ...formData.examenClinico, examenFisico: e.target.value }
                    })}
                    placeholder="Hallazgos del examen físico"
                    minRows={4}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Signos Vitales"
                    value={formData.examenClinico.signosVitales}
                    onChange={(e) => setFormData({
                      ...formData,
                      examenClinico: { ...formData.examenClinico, signosVitales: e.target.value }
                    })}
                    placeholder="Presión arterial, frecuencia cardíaca, temperatura, etc."
                    minRows={3}
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* Diagnóstico y Tratamiento */}
          <Tabs.Panel value="diagnostico">
            <Paper p="md" withBorder>
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Textarea
                    label="Diagnósticos"
                    value={formData.diagnosticoTratamiento.diagnosticos}
                    onChange={(e) => setFormData({
                      ...formData,
                      diagnosticoTratamiento: { ...formData.diagnosticoTratamiento, diagnosticos: e.target.value }
                    })}
                    placeholder="Lista de diagnósticos"
                    minRows={4}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Plan de Tratamiento"
                    value={formData.diagnosticoTratamiento.planTratamiento}
                    onChange={(e) => setFormData({
                      ...formData,
                      diagnosticoTratamiento: { ...formData.diagnosticoTratamiento, planTratamiento: e.target.value }
                    })}
                    placeholder="Plan terapéutico, medicamentos, procedimientos, etc."
                    minRows={4}
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>

          {/* Firma Digital */}
          <Tabs.Panel value="firma">
            <Paper p="md" withBorder>
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <TextInput
                    label="Nombre del Médico"
                    value={formData.firmaDigital.nombreMedico}
                    onChange={(e) => setFormData({
                      ...formData,
                      firmaDigital: { ...formData.firmaDigital, nombreMedico: e.target.value }
                    })}
                    placeholder="Nombre completo del médico"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Número de Cédula"
                    value={formData.firmaDigital.numeroCedula}
                    onChange={(e) => setFormData({
                      ...formData,
                      firmaDigital: { ...formData.firmaDigital, numeroCedula: e.target.value }
                    })}
                    placeholder="Cédula profesional"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Especialidad"
                    value={formData.firmaDigital.especialidad}
                    onChange={(e) => setFormData({
                      ...formData,
                      firmaDigital: { ...formData.firmaDigital, especialidad: e.target.value }
                    })}
                    placeholder="Especialidad médica"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Fecha de Firma"
                    type="date"
                    value={formData.firmaDigital.fechaFirma}
                    onChange={(e) => setFormData({
                      ...formData,
                      firmaDigital: { ...formData.firmaDigital, fechaFirma: e.target.value }
                    })}
                    required
                  />
                </Grid.Col>

                <Grid.Col span={12}>
                  <Divider my="sm" label="Vista Previa de Firma Digital" labelPosition="center" />
                  <Paper p="md" withBorder style={{ backgroundColor: '#f9fafb' }}>
                    <Text size="sm" fw={600}>Firma Digital</Text>
                    <Text size="sm" mt="xs">Dr(a). {formData.firmaDigital.nombreMedico}</Text>
                    <Text size="sm">Cédula Profesional: {formData.firmaDigital.numeroCedula}</Text>
                    <Text size="sm">{formData.firmaDigital.especialidad}</Text>
                    <Text size="sm" c="dimmed">Fecha: {formData.firmaDigital.fechaFirma}</Text>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Paper>
          </Tabs.Panel>
        </Tabs>

        <Divider my="lg" />

        <Group justify="flex-end">
          <Button
            variant="subtle"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            color="green"
          >
            Crear Historia Clínica
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default CreateHistoriaClinicaModal;