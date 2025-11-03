import React from 'react';
import { Paper, Stack, Group, Text, Title, Grid, Loader } from '@mantine/core';
import { IconPhone, IconId, IconFileText } from '@tabler/icons-react';

// Importar utilidades
import { formatDate } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

// Importar componentes extraídos para clean code
import PatientPersonalInfo from './PatientPersonalInfo.jsx';
import PatientContactInfo from './PatientContactInfo.jsx';
import PatientMedicalInfo from './PatientMedicalInfo.jsx';
import PatientConsentInfo from './PatientConsentInfo.jsx';
import PatientClinicalHistory from './PatientClinicalHistory.jsx';
import PatientClinicalHistoryComplete from './PatientClinicalHistoryComplete.jsx';

/**
 * Componente que maneja el contenido de cada pestaña del modal de detalles del paciente
 * @param {Object} props - Propiedades del componente
 * @param {string} props.activeTab - Pestaña activa actual
 * @param {Object} props.patient - Datos del paciente
 * @param {Object} props.patientData - Datos parseados del paciente
 * @param {Object} props.historiaClinica - Historia clínica del paciente
 * @param {Array} props.consultas - Lista de consultas
 * @param {boolean} props.loading - Estado de carga
 * @param {Function} props.setActiveTab - Función para cambiar pestaña
 * @returns {JSX.Element} Contenido de la pestaña activa
 */
const PatientModalContent = ({
  activeTab,
  patient,
  patientData,
  historiaClinica,
  consultas,
  loading,
  setActiveTab
}) => {
  if (loading) {
    return (
      <Stack align="center" justify="center" h={256}>
        <Loader color="blue" size="xl" />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Información Personal */}
      {activeTab === 'personal' && (
        <PatientPersonalInfo
          patientData={patientData}
          patient={patient}
        />
      )}

      {/* Información de Contacto */}
      {activeTab === 'contacto' && (
        <PatientContactInfo patientData={patientData} />
      )}

      {/* Información Médica */}
      {activeTab === 'medica' && (
        <PatientMedicalInfo patientData={patientData} />
      )}

      {/* Contacto de Emergencia */}
      {activeTab === 'emergencia' && (
        <Stack gap="lg">
          <Title order={4} size="h5">Contacto de Emergencia</Title>
          <Paper p="lg" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-red-0)' }}>
            <Stack gap="lg">
              <Group gap="sm">
                <IconId size={20} color="var(--mantine-color-red-6)" />
                <Title order={5} size="h6" c="red.9">Información de Emergencia</Title>
              </Group>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" radius="md" withBorder bg="white">
                    <Stack gap="md">
                      <Stack gap={4}>
                        <Text size="xs" c="dimmed" fw={500}>Nombre Completo</Text>
                        <Text size="sm" fw={500}>{patientData.contactoEmergencia?.nombreContacto || 'N/A'}</Text>
                      </Stack>
                      <Stack gap={4}>
                        <Text size="xs" c="dimmed" fw={500}>Relación</Text>
                        <Text size="sm" fw={500} c="red.8">{patientData.contactoEmergencia?.relacion || 'N/A'}</Text>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" radius="md" withBorder bg="white">
                    <Stack gap="md">
                      <Group gap="md" align="flex-start">
                        <IconPhone size={20} color="var(--mantine-color-red-6)" />
                        <Stack gap={4}>
                          <Text size="xs" c="dimmed" fw={500}>Teléfono Principal</Text>
                          <Text size="sm" fw={500}>{patientData.contactoEmergencia?.telefonoContacto || 'N/A'}</Text>
                        </Stack>
                      </Group>
                      <Group gap="md" align="flex-start">
                        <IconPhone size={20} color="var(--mantine-color-orange-6)" />
                        <Stack gap={4}>
                          <Text size="xs" c="dimmed" fw={500}>Teléfono Secundario</Text>
                          <Text size="sm" fw={500} c="red.8">{patientData.contactoEmergencia?.telefonoContactoSecundario || 'N/A'}</Text>
                        </Stack>
                      </Group>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* Consentimiento Informado */}
      {activeTab === 'consentimiento' && (
        <PatientConsentInfo patientData={patientData} formatDate={formatDate} />
      )}

      {/* Historia Clínica */}
      {activeTab === 'clinica' && (
        <PatientClinicalHistory
          historiaClinica={historiaClinica}
          consultas={consultas}
          setActiveTab={setActiveTab}
          formatDate={formatDate}
        />
      )}

      {/* Historia Clínica Completa */}
      {activeTab === 'clinica_completa' && historiaClinica && (
        <PatientClinicalHistoryComplete
          historiaClinica={historiaClinica}
          consultas={consultas}
          setActiveTab={setActiveTab}
          patient={patient}
          patientData={patientData}
        />
      )}
    </Stack>
  );
};

export default PatientModalContent;