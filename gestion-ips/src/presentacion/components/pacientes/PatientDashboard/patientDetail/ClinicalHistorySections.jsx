import React from 'react';
import { Box, Grid, Paper, Stack, Text, Badge, Group } from '@mantine/core';
import { IconUser, IconFileText, IconHeart, IconStethoscope, IconClipboard, IconActivity } from '@tabler/icons-react';
import SectionTitle from '../../../ui/SectionTitle';
import InfoField from '../../../ui/InfoField';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext';

// --- Helper ---
const hasValue = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (['No registrado', 'N/A', 'Sin notas', 'Ninguno', 'ninguno'].includes(value)) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};

// --- Secciones Individuales ---

export const ProcedureDataSection = ({ data }) => {
  if (!data) return null;
  return (
    <Box>
      <SectionTitle icon={IconUser} title="Datos del Procedimiento" />
      <Grid gutter="xs">
        <InfoField label="Médico Responsable" value={data.medicoResponsable} span={6} />
        <InfoField label="Registro Médico" value={data.registroMedico} span={6} />
        <InfoField label="Especialidad" value={data.especialidad} span={6} />
        <InfoField label="Entidad Prestadora" value={data.entidadPrestadora} span={6} />
        <InfoField label="Ámbito" value={data.ambito} span={6} />
        <InfoField label="Finalidad" value={data.finalidad} span={6} />
      </Grid>
    </Box>
  );
};

export const AnamnesisSection = ({ data }) => {
  if (!data) return null;
  return (
    <Box>
      <SectionTitle icon={IconFileText} title="Motivo y Anamnesis" />
      <Grid gutter="xs">
        {hasValue(data.motivoConsulta) && <InfoField label="Motivo de Consulta" value={data.motivoConsulta} span={12} />}
        {hasValue(data.enfermedadActual) && <InfoField label="Enfermedad Actual" value={data.enfermedadActual} span={12} />}
        {hasValue(data.tiempoEvolucion) && <InfoField label="Tiempo de Evolución" value={data.tiempoEvolucion} span={6} />}
        {hasValue(data.revisionSistemas) && <InfoField label="Revisión de Sistemas" value={data.revisionSistemas} span={12} />}
        {hasValue(data.medicamentosActuales) && <InfoField label="Medicamentos Actuales" value={data.medicamentosActuales} span={12} />}
      </Grid>
    </Box>
  );
};

export const AntecedentesSection = ({ data }) => {
  if (!data) return null;
  return (
    <Box>
      <SectionTitle icon={IconHeart} title="Antecedentes" />
      <Grid gutter="xs">
        {data.patologicos?.selected?.length > 0 && !data.patologicos.selected.includes('ninguno') && (
          <InfoField label="Patológicos" value={`${data.patologicos.selected.join(', ')}${data.patologicos.detalles ? ` - ${data.patologicos.detalles}` : ''}`} span={12} />
        )}
        {data.familiares?.selected?.length > 0 && !data.familiares.selected.includes('ninguno') && (
          <InfoField label="Familiares" value={`${data.familiares.selected.join(', ')}${data.familiares.detalles ? ` - ${data.familiares.detalles}` : ''}`} span={12} />
        )}
        {hasValue(data.quirurgicos) && <InfoField label="Quirúrgicos" value={data.quirurgicos} span={12} />}
        {data.alergicos && !data.alergicos.ninguno && (
          <>
            {hasValue(data.alergicos.medicamentos) && <InfoField label="Alergias - Medicamentos" value={data.alergicos.medicamentos} span={12} />}
            {hasValue(data.alergicos.alimentos) && <InfoField label="Alergias - Alimentos" value={data.alergicos.alimentos} span={12} />}
            {hasValue(data.alergicos.otros) && <InfoField label="Alergias - Otros" value={data.alergicos.otros} span={12} />}
          </>
        )}
        {hasValue(data.habitos?.alcohol) && data.habitos.alcohol !== 'no' && <InfoField label="Alcohol" value={data.habitos.alcohol} span={6} />}
        {hasValue(data.habitos?.tabaco) && data.habitos.tabaco !== 'no' && (
          <InfoField label="Tabaco" value={`${data.habitos.tabaco}${data.habitos.tabacoCantidad ? ` - ${data.habitos.tabacoCantidad}` : ''}`} span={6} />
        )}
        {hasValue(data.habitos?.actividadFisica) && <InfoField label="Actividad Física" value={data.habitos.actividadFisica} span={6} />}
      </Grid>
    </Box>
  );
};

export const PhysicalExamSection = ({ data }) => {
  if (!data) return null;
  const formatCamelCase = (key) => key.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

  return (
    <Box>
      <SectionTitle icon={IconStethoscope} title="Examen Físico" />
      <Grid gutter="xs">
        {hasValue(data.dependenciaMedica) && <InfoField label="Dependencia Médica" value={data.dependenciaMedica} span={6} />}
        {hasValue(data.estadoGeneral) && <InfoField label="Estado General" value={data.estadoGeneral} span={12} />}
        
        {hasValue(data.signosVitales?.presionArterial) && <InfoField label="Presión Arterial" value={data.signosVitales.presionArterial} span={3} />}
        {hasValue(data.signosVitales?.frecuenciaCardiaca) && <InfoField label="Frecuencia Cardíaca" value={data.signosVitales.frecuenciaCardiaca} span={3} />}
        {hasValue(data.signosVitales?.frecuenciaRespiratoria) && <InfoField label="Frecuencia Respiratoria" value={data.signosVitales.frecuenciaRespiratoria} span={3} />}
        {hasValue(data.signosVitales?.temperatura) && <InfoField label="Temperatura" value={data.signosVitales.temperatura} span={3} />}
        {hasValue(data.signosVitales?.saturacionO2) && <InfoField label="Saturación O2" value={data.signosVitales.saturacionO2} span={3} />}
        {hasValue(data.signosVitales?.peso) && <InfoField label="Peso" value={data.signosVitales.peso} span={3} />}
        {hasValue(data.signosVitales?.talla) && <InfoField label="Talla" value={data.signosVitales.talla} span={3} />}
        {hasValue(data.signosVitales?.imc) && <InfoField label="IMC" value={data.signosVitales.imc} span={3} />}

        {hasValue(data.sistemas?.cardiovascular) && <InfoField label="Cardiovascular" value={data.sistemas.cardiovascular} span={12} />}
        {hasValue(data.sistemas?.respiratorio) && <InfoField label="Respiratorio" value={data.sistemas.respiratorio} span={12} />}
        {hasValue(data.sistemas?.gastrointestinal) && <InfoField label="Gastrointestinal" value={data.sistemas.gastrointestinal} span={12} />}
        {hasValue(data.sistemas?.neurologico) && <InfoField label="Neurológico" value={data.sistemas.neurologico} span={12} />}
        {hasValue(data.sistemas?.musculoesqueletico) && <InfoField label="Musculoesquelético" value={data.sistemas.musculoesqueletico} span={12} />}

        {data.camposEspecificos && Object.entries(data.camposEspecificos).map(([key, value]) => (
          hasValue(value) && <InfoField key={key} label={formatCamelCase(key)} value={value} span={6} />
        ))}
      </Grid>
    </Box>
  );
};

export const DiagnosisAndTreatmentSection = ({ data }) => {
  const { tema } = useTheme();
  if (!data || (!data.diagnostico && !data.diagnosticoTratamiento && !data.diagnosticoPlan)) return null;

  const diagnosticos = data.diagnostico?.diagnosticos || data.diagnosticoTratamiento?.diagnosticos || data.diagnosticoPlan?.diagnosticos;
  const medicamentos = data.diagnostico?.medicamentos || data.diagnosticoTratamiento?.medicamentos || data.diagnosticoPlan?.medicamentos;

  return (
    <Box>
      <SectionTitle icon={IconClipboard} title="Diagnóstico y Tratamiento" />
      
      {diagnosticos && (
        <>
          <Text size="xs" fw={600} mb="xs" style={{ color: tema.primaryColor }}>Diagnósticos</Text>
          {Array.isArray(diagnosticos) ? (
            <Stack gap="xs" mb="sm">
              {diagnosticos.map((dx, i) => (
                <Paper key={i} p="xs" withBorder style={{ backgroundColor: `${tema.primaryColor}05` }}>
                  <Group gap="xs"><Badge color={tema.mantineColor} size="sm">{dx.tipo || 'Principal'}</Badge><Text size="xs">{dx.codigo} - {dx.descripcion || dx.nombre}</Text></Group>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Paper p="xs" mb="sm" withBorder style={{ backgroundColor: `${tema.primaryColor}05` }}>
              <Group gap="xs"><Badge color={tema.mantineColor} size="sm">PRINCIPAL</Badge><Text size="xs">{diagnosticos}</Text></Group>
            </Paper>
          )}
        </>
      )}

      <Grid gutter="xs">
        {hasValue(data.diagnostico?.plan?.conducta || data.diagnosticoTratamiento?.planTratamiento || data.diagnosticoPlan?.planTratamiento) && (
          <InfoField label="Plan de Tratamiento" value={data.diagnostico?.plan?.conducta || data.diagnosticoTratamiento?.planTratamiento || data.diagnosticoPlan?.planTratamiento} span={12} />
        )}
        {hasValue(data.diagnostico?.plan?.recomendaciones || data.diagnosticoPlan?.recomendaciones) && (
          <InfoField label="Recomendaciones" value={data.diagnostico?.plan?.recomendaciones || data.diagnosticoPlan?.recomendaciones} span={12} />
        )}
        {hasValue(data.diagnosticoTratamiento?.procedimientos) && <InfoField label="Procedimientos" value={data.diagnosticoTratamiento.procedimientos} span={12} />}
        {hasValue(data.diagnosticoPlan?.ayudasDiagnosticas) && <InfoField label="Ayudas Diagnósticas" value={data.diagnosticoPlan.ayudasDiagnosticas} span={12} />}
      </Grid>

      {medicamentos && Array.isArray(medicamentos) && medicamentos.length > 0 && (
        <>
          <Text size="xs" fw={600} mt="sm" mb="xs" style={{ color: tema.primaryColor }}>Medicamentos Formulados</Text>
          <Stack gap="xs">
            {medicamentos.map((med, i) => {
              const nombre = med.nombre || med.medicamento || 'N/A';
              const detalles = [med.dosis, med.duracion, med.frecuencia].filter(Boolean).join(' | ');
              return (
                <Paper key={i} p="xs" withBorder style={{ backgroundColor: `${tema.primaryColor}05` }}>
                  <Text size="xs"><strong>{nombre}</strong>{detalles && ` - ${detalles}`}</Text>
                </Paper>
              );
            })}
          </Stack>
        </>
      )}
    </Box>
  );
};

export const DigitalSignatureSection = ({ data }) => {
  const { tema } = useTheme();
  if (!data) return null;
  return (
    <Box>
      <SectionTitle icon={IconClipboard} title="Firma Digital" />
      <Paper p="sm" withBorder style={{ backgroundColor: `${tema.primaryColor}05` }}>
        <Grid>
          <InfoField label="Nombre Médico" value={data.nombreMedico} span={6} />
          <InfoField label="Cédula" value={data.numeroCedula} span={6} />
          <InfoField label="Especialidad" value={data.especialidad} span={6} />
          <InfoField label="Fecha Firma" value={data.fechaFirma} span={6} />
        </Grid>
      </Paper>
    </Box>
  );
};

export const IncapacitySection = ({ data }) => {
  const { tema } = useTheme();
  if (!hasValue(data)) return null;
  return (
    <Box>
      <SectionTitle icon={IconActivity} title="Incapacidad" />
      <Paper p="sm" withBorder style={{ backgroundColor: `${tema.primaryColor}05` }}>
        <Grid>
          <InfoField label="Tipo" value={data.tipo} span={6} />
          <InfoField label="Fecha Inicio" value={data.fechaInicio} span={3} />
          <InfoField label="Fecha Fin" value={data.fechaFin} span={3} />
          <InfoField label="Días" value={data.dias} span={3} />
          <InfoField label="Motivo" value={data.motivo} span={9} />
        </Grid>
      </Paper>
    </Box>
  );
};