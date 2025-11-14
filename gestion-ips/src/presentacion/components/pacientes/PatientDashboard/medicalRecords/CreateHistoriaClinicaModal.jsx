import React, { useState } from 'react';
import { Modal, Button, Tabs, Paper, Text, Box, Group, Stack, ScrollArea } from '@mantine/core';
import { IconUser, IconFileText, IconHeart, IconStethoscope, IconClipboard, IconSignature, IconDeviceFloppy } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { historiasClinicasApiService, pacientesApiService } from '../../../../../data/services/pacientesApiService.js';

// Importar tabs
import DatosProcedimientoTab from './tabs/DatosProcedimientoTab.jsx';
import MotivoAnamnesisTab from './tabs/MotivoAnamnesisTab.jsx';
import AntecedentesTab from './tabs/AntecedentesTab.jsx';
import ExamenFisicoTab from './tabs/ExamenFisicoTab.jsx';
import DiagnosticoPlanTab from './tabs/DiagnosticoPlanTab.jsx';
import FirmaDigitalTab from './tabs/FirmaDigitalTab.jsx';

const CreateHistoriaClinicaModal = ({ isOpen, onClose, onHistoriaCreated, pacienteId, citaId, citaData, patientData }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('datos');

  const [formData, setFormData] = useState({
    pacienteId: pacienteId || '',
    fechaApertura: new Date().toISOString().split('T')[0],
    horaApertura: new Date().toISOString().split('T')[1].slice(0, 5),
    
    // Datos del procedimiento
    procedimiento: {
      medicoResponsable: citaData?.medicoAsignado || '',
      registroMedico: '',
      especialidad: citaData?.especialidad || '',
      entidadPrestadora: 'INTEGRA SALUD SAS',
      ambito: 'ambulatorio',
      finalidad: 'diagnostico'
    },
    
    // Motivo y anamnesis
    consultaInicial: {
      motivoConsulta: citaData?.motivo || '',
      enfermedadActual: '',
      tiempoEvolucion: '',
      revisionSistemas: '',
      medicamentosActuales: ''
    },
    
    // Antecedentes
    antecedentes: {
      patologicos: { selected: [], detalles: '' },
      familiares: { selected: [], detalles: '' },
      quirurgicos: '',
      alergicos: { ninguno: false, medicamentos: '', alimentos: '', otros: '' },
      habitos: {
        alcohol: 'no',
        tabaco: 'no',
        tabacoCantidad: '',
        actividadFisica: 'sedentario'
      }
    },
    
    // Examen físico
    examenFisico: {
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
      sistemasRevisados: {
        cabezaCuello: { normal: true, hallazgos: '' },
        toraxPulmones: { normal: true, hallazgos: '' },
        cardiovascular: { normal: true, hallazgos: '' },
        abdomen: { normal: true, hallazgos: '' },
        extremidades: { normal: true, hallazgos: '' },
        neurologico: { normal: true, hallazgos: '' },
        pielFaneras: { normal: true, hallazgos: '' }
      }
    },
    
    // Diagnóstico y plan
    diagnosticoPlan: {
      diagnosticos: [],
      ayudasDiagnosticas: '',
      planTratamiento: '',
      medicamentos: [],
      recomendaciones: '',
      seguimiento: {
        requiere: false,
        tipo: '',
        fechaProxima: ''
      }
    },
    
    // Firma digital
    firmaDigital: {
      nombreMedico: citaData?.medicoAsignado || '',
      numeroCedula: '',
      especialidad: citaData?.especialidad || '',
      fechaFirma: new Date().toISOString().split('T')[0],
      certificacion: false
    },
    
    activa: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.firmaDigital.certificacion) {
      Swal.fire({
        icon: 'warning',
        title: 'Certificación Requerida',
        text: 'Debe certificar que la información es verídica antes de guardar',
        confirmButtonColor: '#EF4444'
      });
      setActiveTab('firma');
      return;
    }

    if (!formData.procedimiento.medicoResponsable || !formData.procedimiento.registroMedico) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Requeridos',
        text: 'Complete los datos del médico responsable',
        confirmButtonColor: '#EF4444'
      });
      setActiveTab('datos');
      return;
    }

    if (!formData.consultaInicial.motivoConsulta) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo de Consulta Requerido',
        text: 'Debe ingresar el motivo de consulta',
        confirmButtonColor: '#EF4444'
      });
      setActiveTab('motivo');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Construir datosJson con toda la información
      const datosJson = JSON.stringify({
        procedimiento: formData.procedimiento,
        consultaInicial: formData.consultaInicial,
        antecedentes: formData.antecedentes,
        examenFisico: formData.examenFisico,
        diagnosticoPlan: formData.diagnosticoPlan,
        firmaDigital: formData.firmaDigital
      });

      const submitData = {
        fechaApertura: `${formData.fechaApertura}T${formData.horaApertura}:00`,
        datosJson: datosJson,
        activa: formData.activa
      };

      console.log('📋 Enviando Historia Clínica:', JSON.stringify(submitData, null, 2));

      const result = await historiasClinicasApiService.createHistoriaClinica(formData.pacienteId, submitData);

      // Actualizar estado de cita si existe
      if (citaId) {
        try {
          await pacientesApiService.actualizarEstadoCita(citaId, 'ATENDIDO');
        } catch (citaError) {
          console.error('⚠️ Error al actualizar estado de cita:', citaError);
        }
      }

      await Swal.fire({
        icon: 'success',
        title: '✅ Historia Clínica Creada',
        text: 'La historia clínica ha sido registrada exitosamente.',
        confirmButtonColor: '#10B981',
        timer: 2500,
        timerProgressBar: true
      });

      onHistoriaCreated && onHistoriaCreated(result);
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar historia clínica:', err);

      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Historia Clínica',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error al guardar la historia clínica.',
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
      title={
        <Group gap="xs">
          <IconFileText size={24} color="var(--mantine-color-green-6)" />
          <Text size="lg" fw={700}>Nueva Historia Clínica</Text>
        </Group>
      }
      size="xl"
      centered
      styles={{
        content: { maxHeight: '90vh' },
        body: { padding: 0 }
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={0}>
          {/* Error Banner */}
          {error && (
            <Paper p="md" m="md" withBorder style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
              <Text c="red" size="sm" fw={500}>{error}</Text>
            </Paper>
          )}

          {/* Tabs Navigation */}
          <Box px="md" pt="md">
            <Tabs value={activeTab} onChange={setActiveTab} color="green" variant="pills">
              <Tabs.List>
                <Tabs.Tab value="datos" leftSection={<IconUser size={14} />}>
                  Datos
                </Tabs.Tab>
                <Tabs.Tab value="motivo" leftSection={<IconFileText size={14} />}>
                  Motivo
                </Tabs.Tab>
                <Tabs.Tab value="antecedentes" leftSection={<IconHeart size={14} />}>
                  Antecedentes
                </Tabs.Tab>
                <Tabs.Tab value="examen" leftSection={<IconStethoscope size={14} />}>
                  Examen
                </Tabs.Tab>
                <Tabs.Tab value="diagnostico" leftSection={<IconClipboard size={14} />}>
                  Diagnóstico
                </Tabs.Tab>
                <Tabs.Tab value="firma" leftSection={<IconSignature size={14} />}>
                  Firma
                </Tabs.Tab>
              </Tabs.List>

              {/* Tab Panels */}
              <ScrollArea h="calc(90vh - 250px)" mt="md">
                <Box p="md">
                  <Tabs.Panel value="datos">
                    <DatosProcedimientoTab 
                      formData={formData} 
                      setFormData={setFormData} 
                      patientData={patientData}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="motivo">
                    <MotivoAnamnesisTab 
                      formData={formData} 
                      setFormData={setFormData} 
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="antecedentes">
                    <AntecedentesTab 
                      formData={formData} 
                      setFormData={setFormData} 
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="examen">
                    <ExamenFisicoTab 
                      formData={formData} 
                      setFormData={setFormData} 
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="diagnostico">
                    <DiagnosticoPlanTab 
                      formData={formData} 
                      setFormData={setFormData} 
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="firma">
                    <FirmaDigitalTab 
                      formData={formData} 
                      setFormData={setFormData} 
                    />
                  </Tabs.Panel>
                </Box>
              </ScrollArea>
            </Tabs>
          </Box>

          {/* Footer con botones */}
          <Paper p="md" shadow="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <Group justify="space-between">
              <Button
                variant="subtle"
                color="gray"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              
              <Group gap="sm">
                {activeTab !== 'datos' && (
                  <Button
                    variant="light"
                    onClick={() => {
                      const tabs = ['datos', 'motivo', 'antecedentes', 'examen', 'diagnostico', 'firma'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                    }}
                  >
                    Anterior
                  </Button>
                )}
                
                {activeTab !== 'firma' ? (
                  <Button
                    onClick={() => {
                      const tabs = ['datos', 'motivo', 'antecedentes', 'examen', 'diagnostico', 'firma'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                    }}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    leftSection={<IconDeviceFloppy size={16} />}
                    loading={saving}
                    color="green"
                  >
                    Guardar Historia Clínica
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateHistoriaClinicaModal;
