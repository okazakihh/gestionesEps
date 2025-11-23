import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Paper, Stack, Group, Text, Title, TextInput, Button, Badge, ScrollArea, Loader, Alert, Avatar, ThemeIcon } from '@mantine/core';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';
import { IconX, IconSearch, IconUser, IconCalendar, IconCheck, IconUserPlus } from '@tabler/icons-react';
import { pacientesApiService } from '../../../../../data/services/pacientesApiService.js';
import { usePatientParser } from '../../../../../negocio/hooks/pacientes/usePatientParser.js';

// Función de utilidad movida fuera del componente para reutilización y rendimiento.
const parsePatientDataForDisplay = (patient) => {
  if (!patient?.datosJson) {
    return { nombreCompleto: patient?.nombreCompleto || 'N/A', telefono: 'N/A', email: 'N/A' };
  }
  try {
    const datosJson = typeof patient.datosJson === 'string' ? JSON.parse(patient.datosJson) : patient.datosJson;
    
    const getJsonField = (field) => {
      if (!datosJson[field]) return {};
      return typeof datosJson[field] === 'string' ? JSON.parse(datosJson[field]) : datosJson[field];
    };

    const infoPersonal = getJsonField('informacionPersonalJson');
    const infoContacto = getJsonField('informacionContactoJson');
    const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();
    return { nombreCompleto: nombreCompleto || 'N/A', telefono: infoContacto.telefono || 'N/A', email: infoContacto.email || 'N/A' };
  } catch (error) {
    return { nombreCompleto: 'Error en datos', telefono: 'N/A', email: 'N/A' };
  }
};

const PatientSearchModal = ({ isOpen, onClose, onPatientSelected, selectedSlot, selectedDoctor, onCreatePatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState(null);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const { tema } = useTheme();

  // Load all patients when modal opens
  const loadAllPatients = async () => {
    try {
      setLoadingPatients(true);
      setError(null);
      const response = await pacientesApiService.getPacientes({ size: 1000 }); // Load all patients
      if (response && response.content) {
        setAllPatients(response.content);
        setFilteredPatients(response.content);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Error al cargar la lista de pacientes');
    } finally {
      setLoadingPatients(false);
    }
  };

  // Filter patients based on search term
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(allPatients);
      setSelectedPatient(null);
      return;
    }

    const filtered = allPatients.filter(patient => {
      const patientData = parsePatientDataForDisplay(patient);
      const documentNumber = `${patient.tipoDocumento || ''} ${patient.numeroDocumento || ''}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return documentNumber.includes(searchLower) ||
             patient.numeroDocumento?.toLowerCase().includes(searchLower) ||
             patientData.nombreCompleto?.toLowerCase().includes(searchLower) ||
             patientData.telefono?.toLowerCase().includes(searchLower);
    });

    setFilteredPatients(filtered);
    setSelectedPatient(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Load patients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllPatients();
      setSearchTerm('');
      setSelectedPatient(null);
      setFilteredPatients([]);
    }
  }, [isOpen]);

  // Auto-filter when search term changes
  useEffect(() => {
    handleSearch();
    // Show create patient button if search term is 8+ digits
    setShowCreatePatient(searchTerm.length >= 8 && /^\d+$/.test(searchTerm));
  }, [searchTerm, allPatients]);

  const handleCreateAppointment = () => {
    if (selectedPatient && onPatientSelected) {
      const patientData = parsePatientDataForDisplay(selectedPatient);
      const patientName = patientData.nombreCompleto !== 'N/A' ? patientData.nombreCompleto : `Paciente ${selectedPatient.id}`;

      onPatientSelected(selectedPatient, patientName);
      onClose();
    }
  };

  const resetSearch = () => {
    setSearchTerm('');
    setFilteredPatients([]);
    setSelectedPatient(null);
    setError(null);
  };

  const handleClose = () => {
    resetSearch();
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      size="xl"
      title={
        <Group gap="md">
          <Avatar size="lg" color="blue">
            <IconUser size={24} />
          </Avatar>
          <Stack gap={4}>
            <Title order={3} size="h4">Buscar Paciente</Title>
            {selectedSlot && (
              <Text size="sm" c="dimmed">Horario: {selectedSlot.label}</Text>
            )}
          </Stack>
        </Group>
      }
      padding="lg"
      closeButtonProps={{ icon: <IconX size={20} /> }}
      overlayColor={tema.primaryColor}
      styles={{ header: { backgroundColor: `${tema.primaryColor} !important`, padding: '10px 16px' }, title: { color: 'white !important' }, close: { color: 'white !important' } }}
    >
      <Stack gap="lg">
        {/* Search Section */}
        <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Stack gap="md">
            <Group gap="sm">
              <IconSearch size={20} color="var(--mantine-color-gray-6)" />
              <Title order={5} size="h6">Buscar por Documento</Title>
            </Group>

            <Group gap="sm" align="flex-start" grow={false} style={{ flexWrap: 'nowrap' }}>
              <TextInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar por documento, nombre o teléfono..."
                disabled={loadingPatients}
                style={{ flex: 1 }}
                leftSection={<IconSearch size={16} />}
              />
              {showCreatePatient && (
                <Button
                  onClick={() => onCreatePatient && onCreatePatient(searchTerm)}
                  color="green"
                  leftSection={<IconUserPlus size={16} />}
                  style={{ flexShrink: 0 }}
                >
                  Crear Paciente
                </Button>
              )}
            </Group>

            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Patients List Section */}
        <Paper withBorder radius="md">
          <Group p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <IconUser size={20} color="var(--mantine-color-gray-6)" />
            <Title order={5} size="h6">
              Pacientes {filteredPatients.length > 0 && `(${filteredPatients.length})`}
            </Title>
          </Group>

          <ScrollArea h={384}>
            {loadingPatients ? (
              <Stack align="center" justify="center" py="xl">
                <Loader color="blue" size="lg" />
                <Text size="sm" c="dimmed">Cargando pacientes...</Text>
              </Stack>
            ) : filteredPatients.length > 0 ? (
              <Stack gap={0}>
                {filteredPatients.map((patient) => {
                  const patientData = parsePatientDataForDisplay(patient);
                  const isSelected = selectedPatient?.id === patient.id;
                  
                  return (
                    <Paper
                      key={patient.id}
                      p="md"
                      radius={0}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--mantine-color-gray-2)',
                        borderLeft: isSelected ? '4px solid var(--mantine-color-blue-6)' : 'none',
                        backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : 'transparent'
                      }}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
                          <Avatar size="md" color="blue">
                            <IconUser size={20} />
                          </Avatar>
                          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                            <Group gap="sm" wrap="nowrap">
                              <Text size="sm" fw={500} lineClamp={1}>
                                {patientData.nombreCompleto !== 'N/A' ? patientData.nombreCompleto : `Paciente ${patient.id}`}
                              </Text>
                              <Badge
                                color={patient.activo ? 'green' : 'red'}
                                variant="light"
                                size="sm"
                              >
                                {patient.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </Group>
                            <Group gap="md">
                              <Text size="xs" c="dimmed">📄 {patient.tipoDocumento} {patient.numeroDocumento}</Text>
                              <Text size="xs" c="dimmed">📞 {patientData.telefono !== 'N/A' ? patientData.telefono : 'Sin teléfono'}</Text>
                            </Group>
                          </Stack>
                        </Group>
                        {isSelected && (
                          <ThemeIcon color="blue" variant="light" size="md" radius="xl">
                            <IconCheck size={18} />
                          </ThemeIcon>
                        )}
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            ) : (
              <Stack align="center" justify="center" py="xl">
                <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                  <IconUser size={32} />
                </ThemeIcon>
                <Text size="sm" c="dimmed" ta="center">
                  {searchTerm ? 'No se encontraron pacientes que coincidan con la búsqueda' : 'No hay pacientes disponibles'}
                </Text>
              </Stack>
            )}
          </ScrollArea>
        </Paper>

        {/* Selected Patient Action */}
        {selectedPatient && (
          <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
            <Stack gap="md">
              <Group gap="sm">
                <IconCheck size={20} color="var(--mantine-color-green-7)" />
                <Title order={5} size="h6" c="green.9">Paciente Seleccionado</Title>
              </Group>

              <Paper p="md" radius="md" withBorder bg="white" style={{ borderColor: 'var(--mantine-color-green-3)' }}>
                <Group gap="md">
                  <Avatar size="lg" color="green">
                    <IconUser size={24} />
                  </Avatar>
                  <Stack gap={4}>
                    <Text fw={500}>
                      {parsePatientDataForDisplay(selectedPatient).nombreCompleto !== 'N/A' ? parsePatientDataForDisplay(selectedPatient).nombreCompleto : `Paciente ${selectedPatient.id}`}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {selectedPatient.tipoDocumento} {selectedPatient.numeroDocumento}
                    </Text>
                  </Stack>
                </Group>
              </Paper>

              <Group justify="flex-end">
                <Button
                  onClick={handleCreateAppointment}
                  color="green"
                  leftSection={<IconCalendar size={16} />}
                >
                  Crear Cita para este Paciente
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Appointment Info */}
        {selectedSlot && (
          <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
            <Stack gap="sm">
              <Title order={5} size="h6" c="blue.9">Información de la Cita</Title>
              <Stack gap={4}>
                <Text size="sm" c="blue.9">
                  <Text component="span" fw={500}>Fecha:</Text> {selectedSlot.date ? selectedSlot.date.toLocaleDateString('es-ES') : 'N/A'}
                </Text>
                <Text size="sm" c="blue.9">
                  <Text component="span" fw={500}>Horario:</Text> {selectedSlot.label}
                </Text>
                {selectedDoctor && (
                  <Text size="sm" c="blue.9">
                    <Text component="span" fw={500}>Médico:</Text> {selectedDoctor.nombreCompleto || ''}
                  </Text>
                )}
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Footer */}
        <Group justify="flex-end">
          <Button onClick={handleClose} variant="default">
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
};

PatientSearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPatientSelected: PropTypes.func,
  selectedSlot: PropTypes.object,
  selectedDoctor: PropTypes.object,
  onCreatePatient: PropTypes.func
};


export default PatientSearchModal;