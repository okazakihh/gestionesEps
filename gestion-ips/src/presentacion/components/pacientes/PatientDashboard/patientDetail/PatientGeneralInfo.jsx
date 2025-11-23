import React from 'react';
import { Paper, Stack, Group, Text, Title, Grid, Badge } from '@mantine/core';
import {
  IconUser,
  IconCalendar,
  IconGenderBigender,
  IconDroplet,
  IconRuler,
  IconScale,
  IconPhone,
  IconMail,
  IconMapPin,
  IconId,
  IconFileText,
  IconAlertCircle,
  IconBuildingCommunity,
  IconMedicalCross,
  IconStairs
} from '@tabler/icons-react';
import { calculateAge } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

/**
 * Componente unificado para mostrar información general del paciente
 * Incluye: Datos Personales, Contacto y Contacto de Emergencia
 */
const PatientGeneralInfo = ({ patientData, patient }) => {
  const InfoRow = ({ label, value, icon: Icon }) => (
    <Group gap="md" wrap="nowrap">
      <Group gap="xs" style={{ minWidth: '200px' }}>
        {Icon && <Icon size={16} color="var(--mantine-color-gray-6)" />}
        <Text size="sm" c="dimmed" fw={500}>{label}:</Text>
      </Group>
      <Text size="sm" fw={500}>{value || 'N/A'}</Text>
    </Group>
  );

  return (
    <Stack gap="md">
      {/* Sección: Datos Personales */}
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="md">
          <Group gap="sm" mb="md">
            <IconUser size={22} color="var(--mantine-color-blue-6)" />
            <Title order={4} c="blue.9">Datos Personales</Title>
          </Group>

          <Grid gutter="xl">
            <Grid.Col span={6}>
              <Stack gap="md">
                <InfoRow
                  label="Nombre Completo"
                  value={`${patientData.informacionPersonal?.primerNombre || ''} ${patientData.informacionPersonal?.segundoNombre || ''} ${patientData.informacionPersonal?.primerApellido || ''} ${patientData.informacionPersonal?.segundoApellido || ''}`}
                  icon={IconUser}
                />
                <InfoRow
                  label="Tipo Documento"
                  value={patient?.tipoDocumento}
                  icon={IconId}
                />
                <InfoRow
                  label="Número Documento"
                  value={patient?.numeroDocumento}
                  icon={IconFileText}
                />
                <InfoRow
                  label="Fecha Nacimiento"
                  value={patientData.informacionPersonal?.fechaNacimiento}
                  icon={IconCalendar}
                />
                <InfoRow
                  label="Edad"
                  value={calculateAge(patientData.informacionPersonal?.fechaNacimiento)}
                />
                <InfoRow
                  label="Género"
                  value={patientData.informacionPersonal?.genero}
                  icon={IconGenderBigender}
                />
                <InfoRow
                  label="Estado Civil"
                  value={patientData.informacionPersonal?.estadoCivil}
                />
              </Stack>
            </Grid.Col>

            <Grid.Col span={6}>
              <Stack gap="md">
                <InfoRow
                  label="Tipo de Sangre"
                  value={patientData.informacionPersonal?.tipoSangre}
                  icon={IconDroplet}
                />
                <InfoRow
                  label="Estatura"
                  value={patientData.informacionPersonal?.estatura ? `${patientData.informacionPersonal.estatura} cm` : null}
                  icon={IconRuler}
                />
                <InfoRow
                  label="Peso"
                  value={patientData.informacionPersonal?.peso ? `${patientData.informacionPersonal.peso} kg` : null}
                  icon={IconScale}
                />
                <InfoRow
                  label="Ocupación"
                  value={patientData.informacionPersonal?.ocupacion}
                />
                <InfoRow
                  label="Nivel Educativo"
                  value={patientData.informacionPersonal?.nivelEducativo}
                />
                <InfoRow
                  label="Estrato Socioeconómico"
                  value={patientData.informacionPersonal?.estratoSocioeconomico}
                  icon={IconStairs}
                />
                <InfoRow
                  label="EPS/Aseguradora"
                  value={patientData.informacionMedica?.eps}
                  icon={IconMedicalCross}
                />
                <InfoRow
                  label="Régimen Afiliación"
                  value={patientData.informacionMedica?.regimenAfiliacion}
                  icon={IconBuildingCommunity}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>

      {/* Sección: Información de Contacto */}
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="md">
          <Group gap="sm" mb="md">
            <IconPhone size={22} color="var(--mantine-color-green-6)" />
            <Title order={4} c="green.9">Información de Contacto</Title>
          </Group>

          <Grid gutter="xl">
            <Grid.Col span={6}>
              <Stack gap="md">
                <InfoRow
                  label="Teléfono"
                  value={patientData.informacionContacto?.telefono}
                  icon={IconPhone}
                />
                <InfoRow
                  label="Correo Electrónico"
                  value={patientData.informacionContacto?.email}
                  icon={IconMail}
                />
              </Stack>
            </Grid.Col>

            <Grid.Col span={6}>
              <Stack gap="md">
                <InfoRow
                  label="Dirección"
                  value={patientData.informacionContacto?.direccion}
                  icon={IconMapPin}
                />
                <InfoRow
                  label="Ciudad"
                  value={patientData.informacionContacto?.ciudad}
                />
                <InfoRow
                  label="Departamento"
                  value={patientData.informacionContacto?.departamento}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>

      {/* Sección: Contacto de Emergencia */}
      <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-red-0)', borderColor: 'var(--mantine-color-red-3)' }}>
        <Stack gap="md">
          <Group gap="sm" mb="md">
            <IconAlertCircle size={22} color="var(--mantine-color-red-7)" />
            <Title order={4} c="red.9">Contacto de Emergencia</Title>
          </Group>

          <Grid gutter="xl">
            <Grid.Col span={6}>
              <Stack gap="md">
                <InfoRow
                  label="Nombre Completo"
                  value={patientData.contactoEmergencia?.nombreContacto}
                  icon={IconUser}
                />
                <InfoRow
                  label="Relación"
                  value={patientData.contactoEmergencia?.relacion}
                />
              </Stack>
            </Grid.Col>

            <Grid.Col span={6}>
              <Stack gap="md">
                <InfoRow
                  label="Teléfono Principal"
                  value={patientData.contactoEmergencia?.telefonoContacto}
                  icon={IconPhone}
                />
                <InfoRow
                  label="Teléfono Secundario"
                  value={patientData.contactoEmergencia?.telefonoContactoSecundario}
                  icon={IconPhone}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default PatientGeneralInfo;
