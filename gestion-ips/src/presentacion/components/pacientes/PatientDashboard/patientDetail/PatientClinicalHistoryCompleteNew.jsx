import React, { useMemo } from 'react';
import { Paper, Stack, Group, Title, Button, Text, Grid, Badge, ScrollArea, Divider, Timeline, Box } from '@mantine/core';
import {
  IconFileText,
  IconUser,
  IconHeart,
  IconStethoscope,
  IconClipboard,
  IconArrowLeft,
  IconPrinter,
  IconCalendar,
  IconPill,
  IconActivity
} from '@tabler/icons-react';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';
import { formatDate } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';
import { printHistoriaClinica, printConsulta } from '../../../../../negocio/utils/pacientes/printUtils.js';

/**
 * Componente rediseñado para mostrar la historia clínica completa
 * con toda la información visible en formato scroll con Timeline de consultas
 */
const PatientClinicalHistoryCompleteNew = ({
  historiaClinica,
  consultas,
  setActiveTab,
  patient,
  patientData
}) => {
  const { tema } = useTheme();

  // Parse de datos del paciente
  const parsedPatientData = useMemo(() => {
    // Si patientData ya tiene informacionPersonal parseado, úsalo directamente
    if (patientData?.informacionPersonal && typeof patientData.informacionPersonal === 'object') {
      return {
        ...patientData,
        tipoDocumento: patient?.tipoDocumento || patientData.tipoDocumento,
        numeroDocumento: patient?.numeroDocumento || patientData.numeroDocumento
      };
    }
    
    // Si no, intentar parsear desde patient.datosJson
    if (patient?.datosJson) {
      try {
        // Primer nivel de parseo
        const datosJson = typeof patient.datosJson === 'string' 
          ? JSON.parse(patient.datosJson) 
          : patient.datosJson;
        
        // Segundo nivel: parsear informacionPersonalJson
        let informacionPersonal = null;
        if (datosJson.informacionPersonalJson) {
          informacionPersonal = typeof datosJson.informacionPersonalJson === 'string'
            ? JSON.parse(datosJson.informacionPersonalJson)
            : datosJson.informacionPersonalJson;
        }
        
        // Parsear informacionContactoJson
        let informacionContacto = null;
        if (datosJson.informacionContactoJson) {
          informacionContacto = typeof datosJson.informacionContactoJson === 'string'
            ? JSON.parse(datosJson.informacionContactoJson)
            : datosJson.informacionContactoJson;
        }
        
        // Parsear informacionMedicaJson
        let informacionMedica = null;
        if (datosJson.informacionMedicaJson) {
          informacionMedica = typeof datosJson.informacionMedicaJson === 'string'
            ? JSON.parse(datosJson.informacionMedicaJson)
            : datosJson.informacionMedicaJson;
        }
        
        // Combinar toda la información
        const combinedInfo = {
          ...informacionPersonal,
          ...informacionContacto,
          // Agregar datos médicos relevantes
          eps: informacionMedica?.eps,
          tipoSeguro: informacionMedica?.tipoSeguro,
          regimenAfiliacion: informacionMedica?.regimenAfiliacion
        };
        
        return {
          tipoDocumento: patient.tipoDocumento,
          numeroDocumento: patient.numeroDocumento,
          informacionPersonal: combinedInfo
        };
      } catch (e) {
        console.error('Error parsing patient datosJson:', e);
      }
    }
    
    // Fallback
    return {
      tipoDocumento: patient?.tipoDocumento || 'N/A',
      numeroDocumento: patient?.numeroDocumento || 'N/A',
      informacionPersonal: patientData?.informacionPersonal || {}
    };
  }, [patientData, patient]);

  // Parse de datos JSON de Historia Clínica
  const parsedData = useMemo(() => {
    if (!historiaClinica?.datosJson) return null;
    
    try {
      const parsed = JSON.parse(historiaClinica.datosJson);
      return parsed.datosJson ? JSON.parse(parsed.datosJson) : parsed;
    } catch (e) {
      console.error('Error parsing historia clínica:', e);
      return null;
    }
  }, [historiaClinica]);

  // Componente para mostrar información
  const InfoField = ({ label, value, span = 6 }) => (
    <Grid.Col span={span}>
      <Group gap={8} wrap="nowrap" align="flex-start" style={{ textAlign: 'left', marginBottom: '8px' }}>
        <Text size="xs" fw={700} style={{ minWidth: 'fit-content', textAlign: 'left' }}>{label}:</Text>
        <Text size="xs" style={{ flex: 1, textAlign: 'left' }}>{value || 'No registrado'}</Text>
      </Group>
    </Grid.Col>
  );

  const SectionTitle = ({ icon: Icon, title, color }) => (
    <div style={{ 
      backgroundColor: color || tema.primaryColor, 
      padding: '4px 8px', 
      marginBottom: '8px',
      borderRadius: '2px'
    }}>
      <Group gap="xs">
        <Icon size={14} style={{ color: 'white' }} />
        <Text size="xs" fw={700} style={{ color: 'white', textTransform: 'uppercase' }}>
          {title}
        </Text>
      </Group>
    </div>
  );

  // Función para verificar si un valor tiene datos registrados
  const hasValue = (value) => {
    if (value === null || value === undefined || value === '') return false;
    if (value === 'No registrado' || value === 'N/A' || value === 'Sin notas') return false;
    if (value === 'Ninguno' || value === 'ninguno') return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  };

  // Función para verificar si un objeto de signos vitales tiene datos
  const hasSignosVitales = (signos) => {
    if (!signos) return false;
    return hasValue(signos.presionArterial) || 
           hasValue(signos.frecuenciaCardiaca) || 
           hasValue(signos.frecuenciaRespiratoria) || 
           hasValue(signos.temperatura) || 
           hasValue(signos.saturacionO2) || 
           hasValue(signos.peso) || 
           hasValue(signos.talla) || 
           hasValue(signos.imc);
  };

  // Función para verificar si un objeto de sistemas tiene datos
  const hasSistemasData = (sistemas) => {
    if (!sistemas) return false;
    return Object.values(sistemas).some(value => hasValue(value));
  };

  return (
    <Stack gap={0}>
      {/* Header estilo documento */}
      <Paper p="lg" style={{ 
        backgroundColor: 'white',
        borderBottom: `3px solid ${tema.primaryColor}`,
        borderRadius: '8px 8px 0 0'
      }}>
        <Stack gap="xs">
          <Title order={3} style={{ color: tema.primaryColor, textAlign: 'center', margin: 0 }}>
            HISTORIA CLÍNICA
          </Title>
          <Text size="xs" c="dimmed" ta="center">
            HC # {historiaClinica?.numeroHistoria || 'N/A'}
          </Text>
        </Stack>
      </Paper>

      {/* Información del Paciente - Estilo tabla 3 columnas */}
      <Paper p="sm" style={{ 
        backgroundColor: '#f8f9fa',
        borderLeft: `3px solid ${tema.primaryColor}`,
        borderRight: `3px solid ${tema.primaryColor}`,
        borderRadius: 0
      }}>
        <Grid gutter={8}>
          {/* Columna 1 */}
          <Grid.Col span={4}>
            <Stack gap={4}>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Nombres:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.primerNombre || ''} {parsedPatientData?.informacionPersonal?.segundoNombre || ''}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Tipo Doc:</Text>
                <Text size="xs">{parsedPatientData?.tipoDocumento || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>FN:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.fechaNacimiento || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Sexo:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.genero || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Dirección:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.direccion || 'N/A'}</Text>
              </Group>
            </Stack>
          </Grid.Col>

          {/* Columna 2 */}
          <Grid.Col span={4}>
            <Stack gap={4}>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Apellidos:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.primerApellido || ''} {parsedPatientData?.informacionPersonal?.segundoApellido || ''}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}># Doc:</Text>
                <Text size="xs">{parsedPatientData?.numeroDocumento || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Edad:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.fechaNacimiento ? (() => {
                  const hoy = new Date();
                  const nacimiento = new Date(parsedPatientData.informacionPersonal.fechaNacimiento);
                  let edad = hoy.getFullYear() - nacimiento.getFullYear();
                  const mes = hoy.getMonth() - nacimiento.getMonth();
                  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
                  return edad + ' años';
                })() : 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>E.Civil:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.estadoCivil || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Ocupación:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.ocupacion || 'N/A'}</Text>
              </Group>
            </Stack>
          </Grid.Col>

          {/* Columna 3 */}
          <Grid.Col span={4}>
            <Stack gap={4}>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Ciudad:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.ciudad || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>RH:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.tipoSangre || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Teléfono:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.telefono || parsedPatientData?.informacionPersonal?.telefonoMovil || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Entidad:</Text>
                <Text size="xs">{parsedPatientData?.informacionPersonal?.eps || parsedData?.procedimiento?.entidadPrestadora || 'N/A'}</Text>
              </Group>
              <Group gap={4} wrap="nowrap">
                <Text size="xs" fw={700} style={{ minWidth: '70px' }}>Estado:</Text>
                <Badge color={historiaClinica?.activa ? 'green' : 'gray'} variant="light" size="xs">
                  {historiaClinica?.activa ? 'ACTIVA' : 'INACTIVA'}
                </Badge>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Botones de acción */}
      <Paper p="sm" style={{ 
        backgroundColor: 'white',
        borderLeft: `3px solid ${tema.primaryColor}`,
        borderRight: `3px solid ${tema.primaryColor}`,
        borderRadius: 0
      }}>
        <Group justify="flex-end" gap="xs">
          <Button
            leftSection={<IconPrinter size={14} />}
            onClick={() => printHistoriaClinica(consultas, historiaClinica, patient, patientData)}
            variant="light"
            color={tema.mantineColor}
            size="xs"
          >
            Imprimir HC Completa
          </Button>
          <Button
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => setActiveTab('clinica')}
            variant="default"
            size="xs"
          >
            Volver
          </Button>
        </Group>
      </Paper>

      {/* Contenido en formato scroll */}
      <ScrollArea h="calc(90vh - 320px)" style={{ 
        borderLeft: `3px solid ${tema.primaryColor}`,
        borderRight: `3px solid ${tema.primaryColor}`,
        borderBottom: `3px solid ${tema.primaryColor}`,
        borderRadius: '0 0 8px 8px',
        backgroundColor: 'white'
      }}>
        <Stack gap="md" p="md">
          
          {/* Sección 1: Datos del Procedimiento */}
          {parsedData?.procedimiento && (
            <Box>
              <SectionTitle icon={IconUser} title="Datos del Procedimiento" />
              <Grid gutter="xs">
                <InfoField label="Médico Responsable" value={parsedData.procedimiento.medicoResponsable} span={6} />
                <InfoField label="Registro Médico" value={parsedData.procedimiento.registroMedico} span={6} />
                <InfoField label="Especialidad" value={parsedData.procedimiento.especialidad} span={6} />
                <InfoField label="Entidad Prestadora" value={parsedData.procedimiento.entidadPrestadora} span={6} />
                <InfoField label="Ámbito" value={parsedData.procedimiento.ambito} span={6} />
                <InfoField label="Finalidad" value={parsedData.procedimiento.finalidad} span={6} />
              </Grid>
            </Box>
          )}

          {/* Sección 2: Consulta Inicial - Solo mostrar si hay datos */}
          {parsedData?.consultaInicial && (
            <Box>
              <SectionTitle icon={IconFileText} title="Motivo y Anamnesis" />
              <Grid gutter="xs">
                {hasValue(parsedData.consultaInicial.motivoConsulta) && (
                  <InfoField label="Motivo de Consulta" value={parsedData.consultaInicial.motivoConsulta} span={12} />
                )}
                {hasValue(parsedData.consultaInicial.enfermedadActual) && (
                  <InfoField label="Enfermedad Actual" value={parsedData.consultaInicial.enfermedadActual} span={12} />
                )}
                {hasValue(parsedData.consultaInicial.tiempoEvolucion) && (
                  <InfoField label="Tiempo de Evolución" value={parsedData.consultaInicial.tiempoEvolucion} span={6} />
                )}
                {hasValue(parsedData.consultaInicial.revisionSistemas) && (
                  <InfoField label="Revisión de Sistemas" value={parsedData.consultaInicial.revisionSistemas} span={12} />
                )}
                {hasValue(parsedData.consultaInicial.medicamentosActuales) && (
                  <InfoField label="Medicamentos Actuales" value={parsedData.consultaInicial.medicamentosActuales} span={12} />
                )}
              </Grid>
            </Box>
          )}

          {/* Sección 3: Antecedentes */}
          {parsedData?.antecedentes && (
            <Box>
              <SectionTitle icon={IconHeart} title="Antecedentes" />
              <Grid gutter="xs">
                {/* Antecedentes Patológicos */}
                {parsedData.antecedentes.patologicos?.selected?.length > 0 && 
                 !parsedData.antecedentes.patologicos.selected.includes('ninguno') && (
                  <InfoField 
                    label="Antecedentes Patológicos" 
                    value={`${parsedData.antecedentes.patologicos.selected.join(', ')}${parsedData.antecedentes.patologicos.detalles ? ' - ' + parsedData.antecedentes.patologicos.detalles : ''}`}
                    span={12} 
                  />
                )}

                {/* Antecedentes Familiares */}
                {parsedData.antecedentes.familiares?.selected?.length > 0 && 
                 !parsedData.antecedentes.familiares.selected.includes('ninguno') && (
                  <InfoField 
                    label="Antecedentes Familiares" 
                    value={`${parsedData.antecedentes.familiares.selected.join(', ')}${parsedData.antecedentes.familiares.detalles ? ' - ' + parsedData.antecedentes.familiares.detalles : ''}`}
                    span={12} 
                  />
                )}

                {/* Antecedentes Quirúrgicos */}
                {hasValue(parsedData.antecedentes.quirurgicos) && (
                  <InfoField label="Antecedentes Quirúrgicos" value={parsedData.antecedentes.quirurgicos} span={12} />
                )}

                {/* Antecedentes Alérgicos */}
                {parsedData.antecedentes.alergicos && !parsedData.antecedentes.alergicos.ninguno && (
                  <>
                    {hasValue(parsedData.antecedentes.alergicos.medicamentos) && (
                      <InfoField label="Alergias - Medicamentos" value={parsedData.antecedentes.alergicos.medicamentos} span={12} />
                    )}
                    {hasValue(parsedData.antecedentes.alergicos.alimentos) && (
                      <InfoField label="Alergias - Alimentos" value={parsedData.antecedentes.alergicos.alimentos} span={12} />
                    )}
                    {hasValue(parsedData.antecedentes.alergicos.otros) && (
                      <InfoField label="Alergias - Otros" value={parsedData.antecedentes.alergicos.otros} span={12} />
                    )}
                  </>
                )}

                {/* Hábitos */}
                {hasValue(parsedData.antecedentes.habitos?.alcohol) && parsedData.antecedentes.habitos.alcohol !== 'no' && (
                  <InfoField label="Alcohol" value={parsedData.antecedentes.habitos.alcohol} span={6} />
                )}
                {hasValue(parsedData.antecedentes.habitos?.tabaco) && parsedData.antecedentes.habitos.tabaco !== 'no' && (
                  <InfoField 
                    label="Tabaco" 
                    value={`${parsedData.antecedentes.habitos.tabaco}${parsedData.antecedentes.habitos.tabacoCantidad ? ' - ' + parsedData.antecedentes.habitos.tabacoCantidad : ''}`} 
                    span={6} 
                  />
                )}
                {hasValue(parsedData.antecedentes.habitos?.actividadFisica) && (
                  <InfoField label="Actividad Física" value={parsedData.antecedentes.habitos.actividadFisica} span={6} />
                )}
              </Grid>
            </Box>
          )}

          {/* Sección 4: Examen Físico */}
          {parsedData?.examenFisico && (
            <Box>
              <SectionTitle icon={IconStethoscope} title="Examen Físico" />
              <Grid gutter="xs">
                {/* Datos Generales */}
                {hasValue(parsedData.examenFisico.dependenciaMedica) && (
                  <InfoField label="Dependencia Médica" value={parsedData.examenFisico.dependenciaMedica} span={6} />
                )}
                {hasValue(parsedData.examenFisico.estadoGeneral) && (
                  <InfoField label="Estado General" value={parsedData.examenFisico.estadoGeneral} span={12} />
                )}

                {/* Signos Vitales */}
                {hasValue(parsedData.examenFisico.signosVitales?.presionArterial) && (
                  <InfoField label="Presión Arterial" value={parsedData.examenFisico.signosVitales.presionArterial} span={3} />
                )}
                {hasValue(parsedData.examenFisico.signosVitales?.frecuenciaCardiaca) && (
                  <InfoField label="Frecuencia Cardíaca" value={parsedData.examenFisico.signosVitales.frecuenciaCardiaca} span={3} />
                )}
                {hasValue(parsedData.examenFisico.signosVitales?.frecuenciaRespiratoria) && (
                  <InfoField label="Frecuencia Respiratoria" value={parsedData.examenFisico.signosVitales.frecuenciaRespiratoria} span={3} />
                )}
                {hasValue(parsedData.examenFisico.signosVitales?.temperatura) && (
                  <InfoField label="Temperatura" value={parsedData.examenFisico.signosVitales.temperatura} span={3} />
                )}
                {hasValue(parsedData.examenFisico.signosVitales?.saturacionO2) && (
                  <InfoField label="Saturación O2" value={parsedData.examenFisico.signosVitales.saturacionO2} span={3} />
                )}
                {hasValue(parsedData.examenFisico.signosVitales?.peso) && (
                  <InfoField label="Peso" value={parsedData.examenFisico.signosVitales.peso} span={3} />
                )}
                {hasValue(parsedData.examenFisico.signosVitales?.talla) && (
                  <InfoField label="Talla" value={parsedData.examenFisico.signosVitales.talla} span={3} />
                )}
                {hasValue(parsedData.examenFisico.signosVitales?.imc) && (
                  <InfoField label="IMC" value={parsedData.examenFisico.signosVitales.imc} span={3} />
                )}

                {/* Examen por Sistemas */}
                {hasValue(parsedData.examenFisico.sistemas?.cardiovascular) && (
                  <InfoField label="Cardiovascular" value={parsedData.examenFisico.sistemas.cardiovascular} span={12} />
                )}
                {hasValue(parsedData.examenFisico.sistemas?.respiratorio) && (
                  <InfoField label="Respiratorio" value={parsedData.examenFisico.sistemas.respiratorio} span={12} />
                )}
                {hasValue(parsedData.examenFisico.sistemas?.gastrointestinal) && (
                  <InfoField label="Gastrointestinal" value={parsedData.examenFisico.sistemas.gastrointestinal} span={12} />
                )}
                {hasValue(parsedData.examenFisico.sistemas?.neurologico) && (
                  <InfoField label="Neurológico" value={parsedData.examenFisico.sistemas.neurologico} span={12} />
                )}
                {hasValue(parsedData.examenFisico.sistemas?.musculoesqueletico) && (
                  <InfoField label="Musculoesquelético" value={parsedData.examenFisico.sistemas.musculoesqueletico} span={12} />
                )}

                {/* Examen Específico */}
                {parsedData.examenFisico.camposEspecificos && Object.entries(parsedData.examenFisico.camposEspecificos).map(([key, value]) => {
                  // Formatear el nombre del campo: camelCase -> Título
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                  
                  return hasValue(value) && <InfoField key={key} label={label} value={value} span={6} />
                })}
              </Grid>
            </Box>
          )}

          {/* Sección 5: Diagnóstico y Plan */}
          {parsedData?.diagnostico && (
            <Stack gap="md">
              <Title order={5} size="h6" style={{ color: tema.primaryColor }}>
                <Group gap="xs">
                  <IconClipboard size={18} />
                  Diagnóstico y Plan
                </Group>
              </Title>

              {/* Diagnósticos */}
              {parsedData.diagnostico.diagnosticos && Array.isArray(parsedData.diagnostico.diagnosticos) && parsedData.diagnostico.diagnosticos.length > 0 && (
                <Paper p="md" withBorder>
                  <Text size="sm" fw={600} mb="sm">Diagnósticos</Text>
                  <Stack gap="xs">
                    {parsedData.diagnostico.diagnosticos.map((dx, index) => (
                      <Group key={index}>
                        <Badge color={tema.mantineColor} size="sm">{dx.tipo || 'Principal'}</Badge>
                        <Text size="sm">{dx.codigo} - {dx.nombre}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              )}

              {/* Plan de Tratamiento */}
              {parsedData.diagnostico.plan && (
                <Paper p="md" withBorder>
                  <Text size="sm" fw={600} mb="sm">Plan de Tratamiento</Text>
                  <Grid>
                    <InfoField label="Conducta" value={parsedData.diagnostico.plan.conducta} span={12} />
                    <InfoField label="Recomendaciones" value={parsedData.diagnostico.plan.recomendaciones} span={12} />
                    <InfoField label="Seguimiento" value={parsedData.diagnostico.plan.seguimiento} span={12} />
                  </Grid>
                </Paper>
              )}

              {/* Medicamentos */}
              {parsedData.diagnostico.medicamentos && Array.isArray(parsedData.diagnostico.medicamentos) && parsedData.diagnostico.medicamentos.length > 0 && (
                <Paper p="md" withBorder>
                  <SectionTitle icon={IconPill} title="Medicamentos Formulados" />
                  <Stack gap="sm">
                    {parsedData.diagnostico.medicamentos.map((med, index) => (
                      <Paper key={index} p="sm" withBorder style={{ backgroundColor: `${tema.primaryColor}05` }}>
                        <Grid>
                          <Grid.Col span={6}>
                            <Text size="sm" fw={600}>{med.nombre}</Text>
                            <Text size="xs" c="dimmed">{med.presentacion}</Text>
                          </Grid.Col>
                          <Grid.Col span={3}>
                            <Text size="xs" c="dimmed">Dosis</Text>
                            <Text size="sm">{med.dosis}</Text>
                          </Grid.Col>
                          <Grid.Col span={3}>
                            <Text size="xs" c="dimmed">Duración</Text>
                            <Text size="sm">{med.duracion}</Text>
                          </Grid.Col>
                          {med.indicaciones && (
                            <Grid.Col span={12}>
                              <Text size="xs" c="dimmed">Indicaciones</Text>
                              <Text size="sm">{med.indicaciones}</Text>
                            </Grid.Col>
                          )}
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          )}

          {/* Sección 6: Consultas Médicas Detalladas */}
          <Stack gap="md">
            <Title order={5} size="h6" style={{ color: tema.primaryColor }}>
              <Group gap="xs">
                <IconCalendar size={18} />
                Consultas Médicas ({consultas?.length || 0})
              </Group>
            </Title>

            {consultas && consultas.length > 0 ? (
              consultas.map((consulta, index) => {
                let parsedConsulta = null;
                try {
                  parsedConsulta = consulta.datosJson ? JSON.parse(consulta.datosJson) : null;
                } catch (e) {
                  console.error('Error parsing consulta data:', e);
                }

                return (
                  <Paper key={consulta.id} p="md" withBorder style={{ backgroundColor: `${tema.primaryColor}08` }}>
                    {/* Header de Consulta */}
                    <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: `2px solid ${tema.primaryColor}30` }}>
                      <Group gap="md">
                        <Badge size="xl" circle color={tema.mantineColor} variant="filled">
                          {index + 1}
                        </Badge>
                        <Stack gap={2}>
                          <Text size="sm" fw={700}>Consulta #{consulta.id}</Text>
                          <Group gap="xs">
                            <IconCalendar size={14} style={{ color: tema.primaryColor }} />
                            <Text size="xs" c="dimmed">
                              {parsedConsulta?.detalleConsulta?.fechaConsulta 
                                ? formatDate(parsedConsulta.detalleConsulta.fechaConsulta)
                                : formatDate(consulta.fechaCreacion)}
                            </Text>
                          </Group>
                        </Stack>
                      </Group>
                      <Group gap="sm">
                        <Button
                          leftSection={<IconPrinter size={16} />}
                          onClick={() => printConsulta(consulta, historiaClinica, patient, patientData)}
                          variant="light"
                          color={tema.mantineColor}
                          size="sm"
                        >
                          Imprimir
                        </Button>
                        <Stack gap={2} align="flex-end">
                          <Text size="xs" c="dimmed">Creado</Text>
                          <Text size="xs" fw={500}>{formatDate(consulta.fechaCreacion)}</Text>
                        </Stack>
                      </Group>
                    </Group>

                    {/* Contenido de la Consulta */}
                    {parsedConsulta && (
                      <Stack gap="md">
                        {/* Detalle de Consulta */}
                        {parsedConsulta.detalleConsulta && (
                          <Paper p="sm" withBorder>
                            <SectionTitle icon={IconUser} title="Detalle de la Consulta" />
                            <Grid>
                              {hasValue(parsedConsulta.detalleConsulta.medicoTratante) && (
                                <InfoField label="Médico Tratante" value={parsedConsulta.detalleConsulta.medicoTratante} span={6} />
                              )}
                              {hasValue(parsedConsulta.detalleConsulta.especialidad) && (
                                <InfoField label="Especialidad" value={parsedConsulta.detalleConsulta.especialidad} span={6} />
                              )}
                              {hasValue(parsedConsulta.detalleConsulta.tipoConsulta) && (
                                <InfoField label="Tipo de Consulta" value={parsedConsulta.detalleConsulta.tipoConsulta} span={6} />
                              )}
                              {hasValue(parsedConsulta.detalleConsulta.proximaCita) && (
                                <InfoField label="Próxima Cita" value={parsedConsulta.detalleConsulta.proximaCita} span={6} />
                              )}
                            </Grid>
                          </Paper>
                        )}

                        {/* Información de Consulta */}
                        {parsedConsulta.informacionConsulta && (
                          <Paper p="sm" withBorder>
                            <SectionTitle icon={IconFileText} title="Información de Consulta" />
                            <Grid>
                              {hasValue(parsedConsulta.informacionConsulta.motivoConsulta) && (
                                <InfoField label="Motivo de Consulta" value={parsedConsulta.informacionConsulta.motivoConsulta} span={12} />
                              )}
                              {hasValue(parsedConsulta.informacionConsulta.enfermedadActual) && (
                                <InfoField label="Enfermedad Actual" value={parsedConsulta.informacionConsulta.enfermedadActual} span={12} />
                              )}
                              {hasValue(parsedConsulta.informacionConsulta.observaciones) && (
                                <InfoField label="Observaciones" value={parsedConsulta.informacionConsulta.observaciones} span={12} />
                              )}
                            </Grid>
                          </Paper>
                        )}

                        {/* Examen Físico */}
                        {parsedConsulta.examenFisico && (
                          <Paper p="sm" withBorder>
                            <SectionTitle icon={IconStethoscope} title="Examen Físico" />
                            
                            {/* Signos Vitales - Solo mostrar si hay datos registrados */}
                            {parsedConsulta.examenFisico.signosVitales && hasSignosVitales(parsedConsulta.examenFisico.signosVitales) && (
                              <>
                                <Text size="xs" fw={600} mb="xs" style={{ color: tema.primaryColor }}>Signos Vitales</Text>
                                <Grid mb="sm">
                                  {hasValue(parsedConsulta.examenFisico.signosVitales.presionArterial) && (
                                    <InfoField label="Presión Arterial" value={parsedConsulta.examenFisico.signosVitales.presionArterial} span={3} />
                                  )}
                                  {hasValue(parsedConsulta.examenFisico.signosVitales.frecuenciaCardiaca) && (
                                    <InfoField label="FC" value={parsedConsulta.examenFisico.signosVitales.frecuenciaCardiaca} span={3} />
                                  )}
                                  {hasValue(parsedConsulta.examenFisico.signosVitales.frecuenciaRespiratoria) && (
                                    <InfoField label="FR" value={parsedConsulta.examenFisico.signosVitales.frecuenciaRespiratoria} span={3} />
                                  )}
                                  {hasValue(parsedConsulta.examenFisico.signosVitales.temperatura) && (
                                    <InfoField label="Temperatura" value={parsedConsulta.examenFisico.signosVitales.temperatura} span={3} />
                                  )}
                                  {hasValue(parsedConsulta.examenFisico.signosVitales.peso) && (
                                    <InfoField label="Peso" value={parsedConsulta.examenFisico.signosVitales.peso} span={3} />
                                  )}
                                  {hasValue(parsedConsulta.examenFisico.signosVitales.talla) && (
                                    <InfoField label="Talla" value={parsedConsulta.examenFisico.signosVitales.talla} span={3} />
                                  )}
                                  {hasValue(parsedConsulta.examenFisico.signosVitales.imc) && (
                                    <InfoField label="IMC" value={parsedConsulta.examenFisico.signosVitales.imc} span={3} />
                                  )}
                                  {hasValue(parsedConsulta.examenFisico.signosVitales.spo2) && (
                                    <InfoField label="SpO2" value={parsedConsulta.examenFisico.signosVitales.spo2} span={3} />
                                  )}
                                </Grid>
                              </>
                            )}

                            <Grid>
                              {hasValue(parsedConsulta.examenFisico.dependenciaMedica) && (
                                <InfoField label="Dependencia Médica" value={parsedConsulta.examenFisico.dependenciaMedica} span={6} />
                              )}
                              {hasValue(parsedConsulta.examenFisico.estadoGeneral) && (
                                <InfoField label="Estado General" value={parsedConsulta.examenFisico.estadoGeneral} span={12} />
                              )}
                              {hasValue(parsedConsulta.examenFisico.hallazgos) && (
                                <InfoField label="Hallazgos" value={parsedConsulta.examenFisico.hallazgos} span={12} />
                              )}
                            </Grid>

                            {/* Campos Específicos por Dependencia */}
                            {parsedConsulta.examenFisico.camposEspecificos && Object.keys(parsedConsulta.examenFisico.camposEspecificos).length > 0 && (
                              <>
                                <Text size="xs" fw={600} mt="sm" mb="xs" style={{ color: tema.primaryColor }}>Examen Específico</Text>
                                <Grid gutter="xs">
                                  {Object.entries(parsedConsulta.examenFisico.camposEspecificos).map(([key, value]) => {
                                    // Formatear el nombre del campo: camelCase -> Título
                                    const label = key
                                      .replace(/([A-Z])/g, ' $1')
                                      .trim()
                                      .split(' ')
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                      .join(' ');
                                    
                                    return hasValue(value) && <InfoField key={key} label={label} value={value} span={6} />
                                  })}
                                </Grid>
                              </>
                            )}
                          </Paper>
                        )}

                        {/* Diagnóstico y Tratamiento */}
                        {parsedConsulta.diagnosticoTratamiento && (
                          <Paper p="sm" withBorder>
                            <SectionTitle icon={IconClipboard} title="Diagnóstico y Tratamiento" />
                            
                            {/* Diagnósticos */}
                            {parsedConsulta.diagnosticoTratamiento.diagnosticos && Array.isArray(parsedConsulta.diagnosticoTratamiento.diagnosticos) && parsedConsulta.diagnosticoTratamiento.diagnosticos.length > 0 && (
                              <>
                                <Text size="xs" fw={600} mb="xs" style={{ color: tema.primaryColor }}>Diagnósticos</Text>
                                <Stack gap="xs" mb="sm">
                                  {parsedConsulta.diagnosticoTratamiento.diagnosticos.map((dx, dxIndex) => (
                                    <Group key={dxIndex} gap="xs">
                                      <Badge color={tema.mantineColor} size="sm">{dx.tipo || 'Principal'}</Badge>
                                      <Text size="xs">{dx.codigo} - {dx.nombre}</Text>
                                    </Group>
                                  ))}
                                </Stack>
                              </>
                            )}

                            <Grid>
                              {hasValue(parsedConsulta.diagnosticoTratamiento.planTratamiento) && (
                                <InfoField label="Plan de Tratamiento" value={parsedConsulta.diagnosticoTratamiento.planTratamiento} span={12} />
                              )}
                              {hasValue(parsedConsulta.diagnosticoTratamiento.procedimientos) && (
                                <InfoField label="Procedimientos" value={parsedConsulta.diagnosticoTratamiento.procedimientos} span={12} />
                              )}
                            </Grid>

                            {/* Medicamentos */}
                            {parsedConsulta.diagnosticoTratamiento.medicamentos && Array.isArray(parsedConsulta.diagnosticoTratamiento.medicamentos) && parsedConsulta.diagnosticoTratamiento.medicamentos.length > 0 && (
                              <>
                                <Text size="xs" fw={600} mt="sm" mb="xs" style={{ color: tema.primaryColor }}>Medicamentos Formulados</Text>
                                <Stack gap="xs">
                                  {parsedConsulta.diagnosticoTratamiento.medicamentos.map((med, medIndex) => (
                                    <Paper key={medIndex} p="xs" withBorder style={{ backgroundColor: `${tema.primaryColor}05` }}>
                                      <Grid>
                                        <Grid.Col span={6}>
                                          <Text size="xs" fw={600}>{med.nombre}</Text>
                                          <Text size="xs" c="dimmed">{med.presentacion}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={3}>
                                          <Text size="xs" c="dimmed">Dosis</Text>
                                          <Text size="xs">{med.dosis}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={3}>
                                          <Text size="xs" c="dimmed">Duración</Text>
                                          <Text size="xs">{med.duracion}</Text>
                                        </Grid.Col>
                                        {med.indicaciones && (
                                          <Grid.Col span={12}>
                                            <Text size="xs" c="dimmed">Indicaciones: {med.indicaciones}</Text>
                                          </Grid.Col>
                                        )}
                                      </Grid>
                                    </Paper>
                                  ))}
                                </Stack>
                              </>
                            )}
                          </Paper>
                        )}

                        {/* Seguimiento */}
                        {parsedConsulta.seguimientoConsulta && (
                          <Paper p="sm" withBorder>
                            <SectionTitle icon={IconCalendar} title="Seguimiento" />
                            <Grid>
                              {parsedConsulta.seguimientoConsulta.evolucion && (
                                <InfoField label="Evolución" value={parsedConsulta.seguimientoConsulta.evolucion} span={12} />
                              )}
                              {parsedConsulta.seguimientoConsulta.complicaciones && (
                                <InfoField label="Complicaciones" value={parsedConsulta.seguimientoConsulta.complicaciones} span={6} />
                              )}
                              {parsedConsulta.seguimientoConsulta.recomendaciones && (
                                <InfoField label="Recomendaciones" value={parsedConsulta.seguimientoConsulta.recomendaciones} span={12} />
                              )}
                            </Grid>
                          </Paper>
                        )}

                        {/* Firma Digital */}
                        {parsedConsulta.firmaDigital && (
                          <Paper p="sm" withBorder style={{ backgroundColor: `${tema.primaryColor}05` }}>
                            <Grid>
                              <InfoField label="Nombre Médico" value={parsedConsulta.firmaDigital.nombreMedico} span={6} />
                              <InfoField label="Cédula" value={parsedConsulta.firmaDigital.numeroCedula} span={6} />
                              <InfoField label="Especialidad" value={parsedConsulta.firmaDigital.especialidad} span={6} />
                              <InfoField label="Fecha Firma" value={parsedConsulta.firmaDigital.fechaFirma} span={6} />
                            </Grid>
                          </Paper>
                        )}
                      </Stack>
                    )}
                  </Paper>
                );
              })
            ) : (
              <Paper p="xl" withBorder>
                <Text size="sm" c="dimmed" ta="center">
                  No hay consultas registradas
                </Text>
              </Paper>
            )}
          </Stack>

        </Stack>
      </ScrollArea>
    </Stack>
  );
};

export default PatientClinicalHistoryCompleteNew;
