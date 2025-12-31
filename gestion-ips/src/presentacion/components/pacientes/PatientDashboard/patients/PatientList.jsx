import React, { useState, useEffect } from 'react';
import { Paper, Stack, Group, Text, Title, Badge, Table, ScrollArea, Loader, Button, ActionIcon, ThemeIcon } from '@mantine/core';
import { IconSearch, IconUser, IconPhone, IconMail, IconMapPin, IconCalendar, IconEye, IconClock, IconPencil } from '@tabler/icons-react';
import { pacientesApiService } from '../../../../../data/services/pacientesApiService.js';

const PatientList = ({ searchTerm, filterStatus, onPatientClick, onScheduleAppointment, onEditPatient, onNewPatient, refreshTrigger }) => {
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, allPatients]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      // Cargar TODOS los pacientes sin filtros para filtrado frontend
      const params = {
        page: 0,
        size: 1000 // Cargar muchos pacientes para filtrado local
      };

      const response = await pacientesApiService.getPacientes(params);

      // Debug: Ver qué fechas llegan del backend

      // Guardar todos los pacientes
      setAllPatients(response.content || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setAllPatients([]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allPatients];

    // Aplicar filtro de búsqueda por nombre, documento o teléfono
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => {
        const patientData = parsePatientData(patient);
        return (
          patientData.nombreCompleto?.toLowerCase().includes(searchLower) ||
          patient.numeroDocumento?.toLowerCase().includes(searchLower) ||
          patientData.telefono?.toLowerCase().includes(searchLower) ||
          patientData.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Aplicar filtro de estado
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(patient => patient.activo === isActive);
    }

    setFilteredPatients(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {

      let date;

      // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateString) && dateString.length >= 6) {
        // LocalDateTime comes as [2024, 12, 15, 10, 30, 0, 0]
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3], dateString[4], dateString[5]);
      } else if (typeof dateString === 'string') {
        // Try different parsing strategies
        if (dateString.includes('T')) {
          // ISO format with time: "2024-12-15T10:30:00.000+00:00"
          date = new Date(dateString);
        } else if (dateString.includes('-')) {
          // Date only format: "2024-12-15"
          date = new Date(dateString + 'T00:00:00');
        } else {
          // Other string formats
          date = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date parsed:', dateString, '->', date);
        return 'Fecha inválida';
      }

      const formatted = date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      return formatted;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error en fecha';
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return `${age} años`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Función para extraer información del JSON del paciente
  const parsePatientData = (patient) => {
    try {
      if (patient.datosJson) {
        // Parsear el primer nivel del JSON
        const firstLevel = typeof patient.datosJson === 'string' ? JSON.parse(patient.datosJson) : patient.datosJson;

        // El campo datosJson contiene otro JSON string anidado
        if (firstLevel.datosJson) {
          const secondLevel = typeof firstLevel.datosJson === 'string' ? JSON.parse(firstLevel.datosJson) : firstLevel.datosJson;

          // Extraer información personal
          const infoPersonal = secondLevel.informacionPersonal || {};
          const infoContacto = secondLevel.informacionContacto || {};
          const infoMedica = secondLevel.informacionMedica || {};

          const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();

          return {
            nombreCompleto: nombreCompleto || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            email: infoContacto.email || 'N/A',
            ciudad: infoContacto.ciudad || 'N/A',
            eps: infoMedica.eps || 'N/A',
            fechaNacimiento: infoPersonal.fechaNacimiento || null,
            genero: infoPersonal.genero || 'N/A',
            estadoCivil: infoPersonal.estadoCivil || 'N/A'
          };
        }

        // Si no hay datosJson anidado, intentar parsear directamente (formato de API de creación)
        if (firstLevel.informacionPersonalJson || firstLevel.informacionContactoJson) {
          const infoPersonal = firstLevel.informacionPersonalJson ? JSON.parse(firstLevel.informacionPersonalJson) : {};
          const infoContacto = firstLevel.informacionContactoJson ? JSON.parse(firstLevel.informacionContactoJson) : {};
          const infoMedica = firstLevel.informacionMedicaJson ? JSON.parse(firstLevel.informacionMedicaJson) : {};

          const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();

          return {
            nombreCompleto: nombreCompleto || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            email: infoContacto.email || 'N/A',
            ciudad: infoContacto.ciudad || 'N/A',
            eps: infoMedica.eps || 'N/A',
            fechaNacimiento: infoPersonal.fechaNacimiento || null,
            genero: infoPersonal.genero || 'N/A',
            estadoCivil: infoPersonal.estadoCivil || 'N/A'
          };
        }
      }
    } catch (error) {
      console.error('Error parsing patient data:', error, patient);
    }

    return {
      nombreCompleto: patient.nombreCompleto || 'N/A',
      telefono: 'N/A',
      email: 'N/A',
      ciudad: 'N/A',
      eps: 'N/A',
      fechaNacimiento: null,
      genero: 'N/A',
      estadoCivil: 'N/A'
    };
  };

  const getStatusBadge = (patient) => {
    if (!patient.activo) {
      return <Badge color="gray" variant="filled">Inactivo</Badge>;
    }

    // TODO: Una vez implementada la API de citas, agregar lógica de citas próximas
    return <Badge color="green" variant="filled">Activo</Badge>;
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" p="xl">
        <Loader color="blue" size="xl" />
        <Text size="sm" c="dimmed">Cargando pacientes...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" p="lg">

      {filteredPatients.length === 0 ? (
        <Stack align="center" justify="center" py="xl">
          <ThemeIcon size={64} radius="xl" variant="light" color="gray">
            <IconUser size={32} />
          </ThemeIcon>
          <Title order={5} size="h6" c="dimmed">No se encontraron pacientes</Title>
          <Text size="sm" c="dimmed">
            Intenta ajustar los filtros de búsqueda.
          </Text>
        </Stack>
      ) : (
        <>
          {/* Header con botón de crear */}
          <Group justify="space-between">
            <Title order={4} size="h5">
              Lista de Pacientes ({filteredPatients.length})
            </Title>
            <Button
              onClick={onNewPatient}
              leftSection={<span>+</span>}
              color="blue"
            >
              Nuevo Paciente
            </Button>
          </Group>

          {/* Table */}
          <Paper withBorder radius="md" shadow="sm">
            <ScrollArea h={480}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Documento</Table.Th>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Edad</Table.Th>
                    <Table.Th>Teléfono</Table.Th>
                    <Table.Th>Ciudad</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredPatients.map((patient) => {
                    const patientData = parsePatientData(patient);
                    return (
                      <Table.Tr key={patient.id}>
                        <Table.Td>
                          <Text size="sm" fw={500}>{patient.numeroDocumento}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patientData.nombreCompleto}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{calculateAge(patientData.fechaNacimiento)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{patientData.telefono}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{patientData.ciudad}</Text>
                        </Table.Td>
                        <Table.Td>
                          {getStatusBadge(patient)}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() => onScheduleAppointment(patient.id, patientData.nombreCompleto)}
                              title="Agendar cita"
                            >
                              <IconClock size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="green"
                              size="sm"
                              onClick={() => onEditPatient && onEditPatient(patient)}
                              title="Editar paciente"
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="gray"
                              size="sm"
                              onClick={() => onPatientClick(patient.id)}
                              title="Ver detalles"
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>

              {filteredPatients.length === 0 && !loading && (
                <Stack align="center" justify="center" py="xl">
                  <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                    <IconUser size={32} />
                  </ThemeIcon>
                  <Title order={5} size="h6" c="dimmed">No se encontraron pacientes</Title>
                  <Text size="sm" c="dimmed">
                    Intenta ajustar los filtros de búsqueda.
                  </Text>
                </Stack>
              )}
            </ScrollArea>
          </Paper>

        </>
      )}
    </Stack>
  );
};

export default PatientList;
