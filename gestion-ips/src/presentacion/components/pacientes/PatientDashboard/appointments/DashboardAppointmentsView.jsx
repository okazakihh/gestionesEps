import React, { useMemo } from 'react';
import { Paper, Table, Group, ActionIcon, Text } from '@mantine/core';
import { UserIcon } from '@heroicons/react/24/outline';
import AgendaStatusBadge from '../agendaModal/AgendaStatusBadge.jsx';

/**
 * Presentational table for the Dashboard that mimics the Agenda look.
 * This is a visual-only change: it reuses existing handlers passed as props
 * and does not modify agenda logic or data sources.
 */
const DashboardAppointmentsView = ({
  allDoctorAppointments = {},
  getAppointmentInfo,
  onPatientClick,
  handleViewAppointmentDetail,
  updatingStatus = {}
}) => {
  // Flatten appointments grouped by doctor into a single array
  const flatAppointments = useMemo(() => {
    return Object.entries(allDoctorAppointments).flatMap(([doctorId, doctorData]) => {
      const doctorName = doctorData.doctorName;
      const appointments = doctorData.appointments || [];
      return appointments.map(a => ({ ...a, _doctorName: doctorName, _doctorId: doctorId }));
    });
  }, [allDoctorAppointments]);

  if (!flatAppointments.length) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Text size="sm" c="dimmed" ta="center">No hay citas para mostrar</Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder>
      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID Cita</Table.Th>
              <Table.Th>Paciente</Table.Th>
              <Table.Th>Fecha/Hora</Table.Th>
              <Table.Th>Médico</Table.Th>
              <Table.Th>Motivo</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {flatAppointments.map((cita) => {
              const citaInfo = getAppointmentInfo ? getAppointmentInfo(cita) : {};

              return (
                <Table.Tr key={cita.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>#{cita.id}</Text>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text size="sm" fw={500}>{citaInfo.nombrePaciente || cita.patient || 'Paciente'}</Text>
                      <Text size="xs" c="dimmed">{citaInfo.documentoPaciente || ''}</Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{citaInfo.fechaHoraCita ? new Date(citaInfo.fechaHoraCita).toLocaleString('es-ES') : 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{cita._doctorName || citaInfo.nombreMedico || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{citaInfo.motivo || citaInfo.motivoConsulta || ''}</Text>
                  </Table.Td>
                  <Table.Td>
                    <AgendaStatusBadge status={citaInfo.estado} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="gray"
                        size="sm"
                        onClick={() => onPatientClick && onPatientClick(cita.pacienteId)}
                        title="Ver paciente"
                      >
                        <UserIcon className="w-4 h-4" />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        size="sm"
                        onClick={() => handleViewAppointmentDetail && handleViewAppointmentDetail(cita)}
                        title="Detalle de la cita"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};

export default DashboardAppointmentsView;
