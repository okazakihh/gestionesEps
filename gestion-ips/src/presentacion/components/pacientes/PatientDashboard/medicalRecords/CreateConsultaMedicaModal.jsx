import React, { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Grid, Tabs, Paper, Text, Box, Group, Stack, ScrollArea, Select } from '@mantine/core';
import { IconFileText, IconStethoscope, IconClipboard, IconCalendar, IconDeviceFloppy } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { historiasClinicasApiService } from '../../../../../data/services/pacientesApiService.js';
import { empleadosApiService } from '../../../../../data/services/empleadosApiService.js';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';
import SignosVitalesForm from './components/SignosVitalesForm.jsx';
import DiagnosticosTable from './components/DiagnosticosTable.jsx';
import MedicamentosTable from './components/MedicamentosTable.jsx';
import ExamenesTable from './components/ExamenesTable.jsx';
import ExamenFisicoPorDependencia from './components/ExamenFisicoPorDependencia.jsx';
import { DEPENDENCIA_MEDICA_OPTIONS, REQUIERE_SIGNOS_VITALES } from '../../../../../negocio/utils/listHelps.js';
import FirmaDigitalTab from './tabs/FirmaDigitalTab.jsx';

const CreateConsultaMedicaModal = ({ isOpen, onClose, onConsultaCreated, historiaClinicaId, citaData, patientData }) => {
  const { tema } = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('consulta');

  // Parse patient data si viene como JSON string
  const parsedPatientData = React.useMemo(() => {
    if (!patientData) return null;
    
    // Si ya tiene informacionPersonal parseado, usarlo
    if (patientData.informacionPersonal) {
      return patientData;
    }
    
    // Si tiene datosJson como string, parsearlo
    if (patientData.datosJson && typeof patientData.datosJson === 'string') {
      try {
        const datosJson = JSON.parse(patientData.datosJson);
        const informacionPersonal = datosJson.informacionPersonalJson 
          ? JSON.parse(datosJson.informacionPersonalJson) 
          : null;
        
        return {
          ...patientData,
          informacionPersonal
        };
      } catch (e) {
        console.error('Error parsing patient data:', e);
        return patientData;
      }
    }
    
    return patientData;
  }, [patientData]);

  const [formData, setFormData] = useState({
    historiaClinicaId: historiaClinicaId || '',
    
    // Detalle de consulta
    detalleConsulta: {
      medicoTratante: citaData?.medicoAsignado || '',
      especialidad: citaData?.especialidad || '',
      fechaConsulta: new Date().toISOString().slice(0, 16),
      tipoConsulta: 'control',
      proximaCita: ''
    },
    
    // Información de consulta
    informacionConsulta: {
      motivoConsulta: citaData?.motivo || '',
      enfermedadActual: '',
      observaciones: citaData?.notas || ''
    },
    
    // Examen físico
    examenFisico: {
      dependenciaMedica: '',
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
      hallazgos: '',
      camposEspecificos: {}
    },
    
    // Diagnóstico y tratamiento
    diagnosticoTratamiento: {
      diagnosticos: [],
      examenes: [],
      planTratamiento: '',
      medicamentos: [],
      procedimientos: ''
    },
    // Incapacidad
    incapacidad: {
      aplica: false,
      tipo: '',
      fechaInicio: '',
      fechaFin: '',
      dias: '',
      motivo: ''
    },
    
    // Seguimiento
    seguimientoConsulta: {
      evolucion: '',
      complicaciones: 'ninguna',
      recomendaciones: ''
    },
    
    // Firma
    firmaDigital: {
      nombreMedico: citaData?.medicoAsignado || '',
      numeroCedula: '',
      especialidad: citaData?.especialidad || '',
      fechaFirma: new Date().toISOString().split('T')[0]
    }
  });

  // Cargar datos del médico desde citaData y buscar licencia si no viene en citaData
  React.useEffect(() => {
    if (isOpen && citaData) {
      const medicoAsignado = citaData.medicoAsignado || '';
      const nombreMedico = medicoAsignado.split(' - ')[0] || '';
      const licenciaMedicaCita = citaData.licenciaMedica || '';
      const especialidad = citaData.especialidad || '';
      const medicoId = citaData.medicoId || null;
      
      // Actualizar formData con la información del médico de la cita
      setFormData(prev => ({
        ...prev,
        detalleConsulta: {
          ...prev.detalleConsulta,
          medicoTratante: nombreMedico,
          especialidad: especialidad,
          registroMedico: licenciaMedicaCita
        },
        firmaDigital: {
          ...prev.firmaDigital,
          nombreMedico: nombreMedico,
          especialidad: especialidad,
          numeroCedula: licenciaMedicaCita
        }
      }));
      
      // Si no viene licenciaMedica en citaData, buscarla en el servicio de empleados
      if (!licenciaMedicaCita) {
        (async () => {
          try {
            let empleadoResp = null;
            
            if (medicoId) {
              empleadoResp = await empleadosApiService.getEmpleadoById(medicoId);
            } else if (nombreMedico) {
              const resp = await empleadosApiService.getEmpleados({ size: 1000 });
              const empleados = Array.isArray(resp?.content) ? resp.content : resp || [];
              
              empleadoResp = empleados.find(emp => {
                try {
                  const datosEmpleado = typeof emp.jsonData === 'string' 
                    ? JSON.parse(emp.jsonData) 
                    : emp.jsonData;
                  
                  let datosNivel2 = datosEmpleado;
                  if (datosEmpleado.jsonData) {
                    datosNivel2 = typeof datosEmpleado.jsonData === 'string'
                      ? JSON.parse(datosEmpleado.jsonData)
                      : datosEmpleado.jsonData;
                  }
                  
                  const infoPersonal = datosNivel2.informacionPersonal || {};
                  const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();
                  
                  return nombreCompleto.toUpperCase().includes(nombreMedico.toUpperCase());
                } catch (e) {
                  return false;
                }
              });
            }
            
            if (empleadoResp) {
              let licencia = '';
              
              if (empleadoResp.jsonData) {
                try {
                  const datosEmpleado = typeof empleadoResp.jsonData === 'string' 
                    ? JSON.parse(empleadoResp.jsonData) 
                    : empleadoResp.jsonData;
                  
                  if (datosEmpleado.jsonData) {
                    const datosNivel2 = typeof datosEmpleado.jsonData === 'string'
                      ? JSON.parse(datosEmpleado.jsonData)
                      : datosEmpleado.jsonData;
                    
                    licencia = datosNivel2.informacionLaboral?.numeroLicencia 
                      || datosNivel2.informacionLaboral?.registroMedico 
                      || '';
                  } else {
                    licencia = datosEmpleado.informacionLaboral?.numeroLicencia
                      || datosEmpleado.informacionLaboral?.registroMedico
                      || '';
                  }
                } catch (e) {
                  console.error('Error parsing empleado data:', e);
                }
              }
              
              if (licencia) {
                setFormData(prev => ({
                  ...prev,
                  detalleConsulta: {
                    ...prev.detalleConsulta,
                    registroMedico: licencia
                  },
                  firmaDigital: {
                    ...prev.firmaDigital,
                    numeroCedula: licencia
                  }
                }));
              }
            }
          } catch (err) {
            console.error('Error cargando licencia del empleado:', err);
          }
        })();
      }

      // Intentar cargar la firma del empleado desde el servicio de empleados (solo frontend)
      (async () => {
        if (!isOpen) return;
        try {
          const resp = await empleadosApiService.getEmpleados({ size: 1000 });
          const list = Array.isArray(resp?.content) ? resp.content : resp || [];
          // empleados list obtained

          let matched = null;
          const parseEmployeeRecord = (emp) => {
            // Try multiple known properties and nested json fields
            let parsed = null;
            const tryParse = (str) => {
              if (!str || typeof str !== 'string') return null;
              try {
                return JSON.parse(str);
              } catch (e) {
                return null;
              }
            };

            // Common raw payload fields in this project: jsonData, datosJson
            const raw = emp?.jsonData || emp?.datosJson || emp?.json || null;
            if (raw) {
              const first = tryParse(raw) || raw;
              // if it contains nested json in property 'jsonData' or 'datosJson', parse again
              if (first && typeof first === 'object' && (first.jsonData || first.datosJson)) {
                const nestedRaw = first.jsonData || first.datosJson;
                const second = tryParse(nestedRaw) || nestedRaw;
                parsed = (second && typeof second === 'object') ? second : first;
              } else {
                parsed = (first && typeof first === 'object') ? first : first;
              }
            }

            // If still null, maybe emp itself already contains the structure
            if (!parsed) {
              parsed = emp;
            }

            return parsed;
          };

              for (const emp of list) {
            try {
              const parsed = parseEmployeeRecord(emp) || {};

              // Try to extract license and name from several possible locations (including raw jsonData)
              const safeParse = (s) => { try { return typeof s === 'string' ? JSON.parse(s) : s; } catch { return null; } };
              const firstLevelRaw = safeParse(emp?.jsonData) || safeParse(emp?.datosJson) || null;
              const nestedRaw = firstLevelRaw ? (safeParse(firstLevelRaw.jsonData) || safeParse(firstLevelRaw.datosJson) || null) : null;

              const numeroLic = parsed?.informacionLaboral?.numeroLicencia
                || parsed?.numeroLicencia
                || parsed?.informacionLaboral?.licencia
                || parsed?.registroMedico
                || emp?.registroMedico
                || emp?.numeroLicencia
                || (firstLevelRaw && (firstLevelRaw.informacionLaboral?.numeroLicencia || firstLevelRaw.numeroLicencia))
                || (nestedRaw && (nestedRaw.informacionLaboral?.numeroLicencia || nestedRaw.numeroLicencia))
                || '';
              const nombreEmpleadoCandidates = [];
              if (parsed?.informacionPersonal) {
                const ip = parsed.informacionPersonal;
                nombreEmpleadoCandidates.push(`${ip.primerNombre || ''} ${ip.segundoNombre || ''} ${ip.primerApellido || ''} ${ip.segundoApellido || ''}`.trim());
                nombreEmpleadoCandidates.push(`${ip.primerNombre || ''} ${ip.primerApellido || ''}`.trim());
              }
              // also check top-level names
              if (parsed?.nombre) nombreEmpleadoCandidates.push(parsed.nombre);
              if (emp?.nombre) nombreEmpleadoCandidates.push(emp.nombre);
              if (emp?.jsonData && typeof emp.jsonData === 'string') {
                const j = (() => { try { return JSON.parse(emp.jsonData); } catch { return null; } })();
                if (j && j.informacionPersonal) {
                  const ip2 = j.informacionPersonal;
                  nombreEmpleadoCandidates.push(`${ip2.primerNombre || ''} ${ip2.primerApellido || ''}`.trim());
                }
                // also check numeroLicencia in raw jsonData
                if (!numeroLic) {
                  const maybeNum = j?.informacionLaboral?.numeroLicencia || j?.numeroLicencia || null;
                  if (maybeNum) {
                    // prefer this for matching
                  }
                }
              }

              const nombreEmpleado = (nombreEmpleadoCandidates.find(Boolean) || '').trim();

              // comparing employee candidates

              if (licenciaMedicaCita && numeroLic && String(numeroLic).trim() === String(licenciaMedicaCita).trim()) {
                matched = { parsed, raw: emp };
                // matched by license
                break;
              }

              if (nombreMedico && nombreEmpleado && nombreEmpleado.toLowerCase().includes(nombreMedico.split(' ')[0].toLowerCase())) {
                matched = { parsed, raw: emp };
                // matched by name
                break;
              }
            } catch (e) {
              console.error('❌ Error parsing employee data during matching:', e);
            }
          }

          if (matched) {
            // matched is an object: { parsed, raw }
            const parsedMatched = matched.parsed || matched;
            const rawMatched = matched.raw || parsedMatched;

            // Try multiple places where a signature might be stored
            let signature = null;

            // Helper to safely parse JSON strings
            const safeParse = (s) => {
              if (!s || typeof s !== 'string') return null;
              try { return JSON.parse(s); } catch (e) { return null; }
            };
            try {
              const firstLevel = safeParse(rawMatched?.jsonData) || safeParse(rawMatched?.datosJson) || null;
              if (firstLevel) {
                // parsed first-level raw employee payload
                if (firstLevel.firmaDigital) {
                  if (typeof firstLevel.firmaDigital === 'string') signature = firstLevel.firmaDigital;
                  else if (firstLevel.firmaDigital.imagen) signature = firstLevel.firmaDigital.imagen;
                }

                // If firstLevel contains nested jsonData as string, parse and prefer inner signature
                const nested = safeParse(firstLevel.jsonData) || safeParse(firstLevel.datosJson) || null;
                if (nested) {
                  if (!signature && nested.firmaDigital) {
                    if (typeof nested.firmaDigital === 'string') signature = nested.firmaDigital;
                    else if (nested.firmaDigital.imagen) signature = nested.firmaDigital.imagen;
                  }
                }
              }
            } catch (e) {
              console.error('❌ Error parsing rawMatched jsonData for signature:', e);
            }

            // If the parsed matched object itself is a string
            if (typeof parsedMatched === 'string') {
              signature = parsedMatched;
            }

            // Common structured field on parsed object
            if (!signature && parsedMatched.firmaDigital) {
              if (typeof parsedMatched.firmaDigital === 'string' && parsedMatched.firmaDigital) signature = parsedMatched.firmaDigital;
              else if (parsedMatched.firmaDigital.imagen) signature = parsedMatched.firmaDigital.imagen;
              else if (parsedMatched.firmaDigital.image) signature = parsedMatched.firmaDigital.image;
              else if (parsedMatched.firmaDigital.firma) signature = parsedMatched.firmaDigital.firma;
            }

            // Check common top-level props on the raw employee record (original API shape)
            if (!signature && rawMatched && (rawMatched.firmaDigital || rawMatched.imagen || rawMatched.image || rawMatched.firma)) {
              signature = rawMatched.firmaDigital || rawMatched.imagen || rawMatched.image || rawMatched.firma;
            }

            // Check nested parsed structures (informacionPersonal)
            if (!signature && parsedMatched.informacionPersonal) {
              const ip = parsedMatched.informacionPersonal;
              if (typeof ip === 'string') {
                signature = ip;
              } else if (ip) {
                if (ip.firmaDigital && typeof ip.firmaDigital === 'string') signature = ip.firmaDigital;
                else if (ip.firma && typeof ip.firma === 'string') signature = ip.firma;
                else if (ip.firmaDigital && ip.firmaDigital.imagen) signature = ip.firmaDigital.imagen;
              }
            }

            // Last resort: check any nested object values for common keys
            if (!signature) {
              const searchObj = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                const keys = ['imagen', 'image', 'firma', 'firmaDigital', 'signature'];
                for (const k of keys) {
                  if (obj[k]) return obj[k];
                }
                for (const v of Object.values(obj)) {
                  if (typeof v === 'object') {
                    const found = searchObj(v);
                    if (found) return found;
                  }
                }
                return null;
              };
              const found = searchObj(parsedMatched) || (rawMatched && searchObj(rawMatched));
              if (found) signature = found;
            }

            // extracted signature candidate

            if (signature) {
              // also try to set the license/registro if available
              const foundNumeroLic = parsedMatched?.informacionLaboral?.numeroLicencia
                || parsedMatched?.numeroLicencia
                || rawMatched?.numeroLicencia
                || rawMatched?.informacionLaboral?.numeroLicencia
                || '';

              setFormData(prev => ({
                ...prev,
                firmaDigital: {
                  ...prev.firmaDigital,
                  imagen: signature,
                  numeroCedula: prev.firmaDigital?.numeroCedula || foundNumeroLic || prev.firmaDigital?.numeroCedula || ''
                }
              }));
              // formData.firmaDigital.imagen updated
            } 
          } 
        } catch (err) {
          console.error('❌ Error loading empleado signature:', err);
        }
      })();
    }
  }, [isOpen, citaData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.informacionConsulta.motivoConsulta) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo de Consulta Requerido',
        text: 'Debe ingresar el motivo de la consulta',
        confirmButtonColor: '#EF4444'
      });
      setActiveTab('consulta');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const datosJson = JSON.stringify({
        detalleConsulta: formData.detalleConsulta,
        informacionConsulta: formData.informacionConsulta,
        examenFisico: formData.examenFisico,
        diagnosticoTratamiento: formData.diagnosticoTratamiento,
        incapacidad: formData.incapacidad,
        seguimientoConsulta: formData.seguimientoConsulta,
        firmaDigital: formData.firmaDigital
      });

      // sending consulta medica

      const result = await historiasClinicasApiService.crearConsulta(formData.historiaClinicaId, datosJson);

      await Swal.fire({
        icon: 'success',
        title: 'Consulta Médica Creada',
        text: 'La consulta ha sido registrada exitosamente.',
        confirmButtonColor: '#8B5CF6',
        timer: 2500,
        timerProgressBar: true
      });

      onConsultaCreated && onConsultaCreated(result);
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar consulta médica:', err);

      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Consulta',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error al guardar la consulta médica.',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar consulta médica');
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
          <IconStethoscope size={24} style={{ color: tema.primaryColor }} />
          <Text size="lg" fw={700}>Nueva Consulta Médica</Text>
        </Group>
      }
      size="xl"
      centered
          overlayProps={{ color: tema.primaryColor, backgroundOpacity: 0.55, blur: 3 }}
          styles={{
            content: { maxHeight: '90vh' },
            body: { padding: 0 },
            header: { backgroundColor: `${tema.primaryColor} !important`, padding: '10px 16px' },
            title: { color: 'white !important' },
            close: { color: 'white !important' }
          }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={0}>
          {/* Info del Paciente */}
          <Paper p="md" m="md" mb={0} style={{ backgroundColor: `${tema.primaryColor}15`, border: `1px solid ${tema.primaryColor}40` }}>
            <Grid gutter="xs">
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed" fw={500}>Paciente</Text>
                <Text size="sm" fw={600}>
                  {parsedPatientData?.informacionPersonal?.primerNombre || citaData?.nombre || 'N/A'} {parsedPatientData?.informacionPersonal?.primerApellido || ''}
                </Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="xs" c="dimmed" fw={500}>Documento</Text>
                <Text size="sm" fw={600}>{parsedPatientData?.numeroDocumento || citaData?.documento || 'N/A'}</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="xs" c="dimmed" fw={500}>HC #</Text>
                <Text size="sm" fw={600} style={{ color: tema.primaryColor }}>{historiaClinicaId || 'N/A'}</Text>
              </Grid.Col>
            </Grid>
          </Paper>

          {error && (
            <Paper p="md" m="md" mb={0} withBorder style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
              <Text c="red" size="sm" fw={500}>{error}</Text>
            </Paper>
          )}

          {/* Tabs */}
          <Box px="md" pt="md">
            <Tabs value={activeTab} onChange={setActiveTab} color={tema.mantineColor} variant="pills">
              <Tabs.List>
                <Tabs.Tab value="consulta" leftSection={<IconFileText size={14} />}>
                  Información
                </Tabs.Tab>
                <Tabs.Tab value="examen" leftSection={<IconStethoscope size={14} />}>
                  Examen Físico
                </Tabs.Tab>
                <Tabs.Tab value="diagnostico" leftSection={<IconClipboard size={14} />}>
                  Diagnóstico
                </Tabs.Tab>
                <Tabs.Tab value="seguimiento" leftSection={<IconCalendar size={14} />}>
                  Seguimiento
                </Tabs.Tab>
                <Tabs.Tab value="firma" leftSection={<IconStethoscope size={14} />}>
                  Firma
                </Tabs.Tab>
              </Tabs.List>

              <ScrollArea h="calc(90vh - 300px)" mt="md">
                <Box p="md">
                  {/* TAB 1: Información de Consulta */}
                  <Tabs.Panel value="consulta">
                    <Paper p="md" withBorder>
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Tipo de Consulta</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Select
                            label="Tipo de Consulta"
                            placeholder="Seleccione el tipo"
                            value={formData.detalleConsulta?.tipoConsulta}
                            onChange={(value) => setFormData(prev => ({
                              ...prev,
                              detalleConsulta: { ...prev.detalleConsulta, tipoConsulta: value }
                            }))}
                            data={[
                              { value: 'primera_vez', label: 'Primera Vez' },
                              { value: 'control', label: 'Control' },
                              { value: 'urgencia', label: 'Urgencia' }
                            ]}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Motivo y Anamnesis</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Motivo de Consulta"
                            placeholder="Describa el motivo de la consulta..."
                            value={formData.informacionConsulta?.motivoConsulta}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              informacionConsulta: { ...prev.informacionConsulta, motivoConsulta: e.target.value }
                            }))}
                            minRows={3}
                            required
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Enfermedad Actual"
                            placeholder="Historia de la enfermedad actual..."
                            value={formData.informacionConsulta?.enfermedadActual}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              informacionConsulta: { ...prev.informacionConsulta, enfermedadActual: e.target.value }
                            }))}
                            minRows={4}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Observaciones Adicionales"
                            placeholder="Información adicional relevante..."
                            value={formData.informacionConsulta?.observaciones}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              informacionConsulta: { ...prev.informacionConsulta, observaciones: e.target.value }
                            }))}
                            minRows={2}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Tabs.Panel>

                  {/* TAB 2: Examen Físico */}
                  <Tabs.Panel value="examen">
                    <Paper p="md" withBorder>
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Dependencia Médica</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Select
                            label="Seleccione la Dependencia Médica"
                            placeholder="Ej: Otorrinolaringología, Optometría, etc."
                            data={DEPENDENCIA_MEDICA_OPTIONS}
                            value={formData.examenFisico?.dependenciaMedica}
                            onChange={(value) => setFormData(prev => ({
                              ...prev,
                              examenFisico: { 
                                ...prev.examenFisico, 
                                dependenciaMedica: value,
                                camposEspecificos: {} // Reset campos al cambiar dependencia
                              }
                            }))}
                            required
                            size="sm"
                            searchable
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    {/* Signos Vitales - Solo si la dependencia lo requiere */}
                    {formData.examenFisico?.dependenciaMedica && 
                     REQUIERE_SIGNOS_VITALES[formData.examenFisico.dependenciaMedica] && (
                      <Paper p="md" withBorder mt="md">
                        <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Signos Vitales</Text>
                        <SignosVitalesForm
                          values={formData.examenFisico?.signosVitales || {}}
                          onChange={(signosVitales) => setFormData(prev => ({
                            ...prev,
                            examenFisico: { ...prev.examenFisico, signosVitales }
                          }))}
                        />
                      </Paper>
                    )}

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Estado General y Hallazgos</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Estado General"
                            placeholder="Descripción del estado general del paciente..."
                            value={formData.examenFisico?.estadoGeneral}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              examenFisico: { ...prev.examenFisico, estadoGeneral: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Hallazgos Generales"
                            placeholder="Hallazgos relevantes del examen físico general..."
                            value={formData.examenFisico?.hallazgos}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              examenFisico: { ...prev.examenFisico, hallazgos: e.target.value }
                            }))}
                            minRows={4}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    {/* Campos específicos por dependencia */}
                    {formData.examenFisico?.dependenciaMedica && (
                      <Box mt="md">
                        <ExamenFisicoPorDependencia
                          dependencia={formData.examenFisico.dependenciaMedica}
                          valores={formData.examenFisico?.camposEspecificos || {}}
                          onChange={(camposEspecificos) => setFormData(prev => ({
                            ...prev,
                            examenFisico: { ...prev.examenFisico, camposEspecificos }
                          }))}
                        />
                      </Box>
                    )}
                  </Tabs.Panel>

                  {/* TAB 3: Diagnóstico y Tratamiento */}
                  <Tabs.Panel value="diagnostico">
                    <Paper p="md" withBorder>
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Diagnósticos CIE-10</Text>
                      <DiagnosticosTable
                        diagnosticos={formData.diagnosticoTratamiento?.diagnosticos || []}
                        onChange={(diagnosticos) => setFormData(prev => ({
                          ...prev,
                          diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, diagnosticos }
                        }))}
                      />
                    </Paper>

                    <Box mt="md">
                      <ExamenesTable
                        examenes={formData.diagnosticoTratamiento?.examenes || []}
                        onChange={(examenes) => setFormData(prev => ({
                          ...prev,
                          diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, examenes }
                        }))}
                      />
                    </Box>

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Plan de Tratamiento</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Plan de Tratamiento"
                            placeholder="Descripción del plan de tratamiento..."
                            value={formData.diagnosticoTratamiento?.planTratamiento}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, planTratamiento: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Medicamentos Formulados</Text>
                      <MedicamentosTable
                        medicamentos={formData.diagnosticoTratamiento?.medicamentos || []}
                        onChange={(medicamentos) => setFormData(prev => ({
                          ...prev,
                          diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, medicamentos }
                        }))}
                      />
                    </Paper>

                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Procedimientos</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Procedimientos Realizados"
                            placeholder="Describa los procedimientos realizados..."
                            value={formData.diagnosticoTratamiento?.procedimientos}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              diagnosticoTratamiento: { ...prev.diagnosticoTratamiento, procedimientos: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    {/* Incapacidad */}
                    <Paper p="md" withBorder mt="md">
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Incapacidad</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Group>
                            <Text size="xs">Emitir incapacidad</Text>
                            <input
                              type="checkbox"
                              checked={formData.incapacidad.aplica}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                incapacidad: { ...prev.incapacidad, aplica: e.currentTarget.checked }
                              }))}
                            />
                          </Group>
                        </Grid.Col>

                        {formData.incapacidad.aplica && (
                          <>
                            <Grid.Col span={6}>
                              <TextInput
                                label="Tipo de Incapacidad"
                                placeholder="Ej: Laboral"
                                value={formData.incapacidad.tipo}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, tipo: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <TextInput
                                label="Fecha Inicio"
                                type="date"
                                value={formData.incapacidad.fechaInicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, fechaInicio: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <TextInput
                                label="Fecha Fin"
                                type="date"
                                value={formData.incapacidad.fechaFin}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, fechaFin: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                            <Grid.Col span={4}>
                              <TextInput
                                label="Días"
                                type="number"
                                value={formData.incapacidad.dias}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, dias: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                            <Grid.Col span={8}>
                              <TextInput
                                label="Motivo"
                                placeholder="Motivo de la incapacidad"
                                value={formData.incapacidad.motivo}
                                onChange={(e) => setFormData(prev => ({ ...prev, incapacidad: { ...prev.incapacidad, motivo: e.target.value } }))}
                                size="sm"
                              />
                            </Grid.Col>
                          </>
                        )}
                      </Grid>
                    </Paper>
                  </Tabs.Panel>

                  {/* TAB 4: Seguimiento */}
                  <Tabs.Panel value="seguimiento">
                    <Paper p="md" withBorder>
                      <Text size="sm" fw={600} mb="md" style={{ color: tema.primaryColor }}>Evolución y Seguimiento</Text>
                      <Grid>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Evolución del Paciente"
                            placeholder="Evolución del paciente durante la consulta..."
                            value={formData.seguimientoConsulta?.evolucion}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              seguimientoConsulta: { ...prev.seguimientoConsulta, evolucion: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Complicaciones"
                            placeholder="Complicaciones presentadas (si aplica)..."
                            value={formData.seguimientoConsulta?.complicaciones}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              seguimientoConsulta: { ...prev.seguimientoConsulta, complicaciones: e.target.value }
                            }))}
                            minRows={2}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Textarea
                            label="Recomendaciones"
                            placeholder="Recomendaciones médicas para el paciente..."
                            value={formData.seguimientoConsulta?.recomendaciones}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              seguimientoConsulta: { ...prev.seguimientoConsulta, recomendaciones: e.target.value }
                            }))}
                            minRows={3}
                            size="sm"
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <TextInput
                            label="Próxima Cita (Opcional)"
                            type="date"
                            value={formData.seguimientoConsulta?.proximaCita}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              seguimientoConsulta: { ...prev.seguimientoConsulta, proximaCita: e.target.value }
                            }))}
                            size="sm"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Tabs.Panel>

                  {/* TAB 5: Firma */}
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
        </Stack>

        {/* Footer con botones */}
        <Paper p="md" shadow="sm" style={{ borderTop: '1px solid #E5E7EB' }}>
          <Group justify="space-between">
            <Button
              variant="subtle"
              onClick={onClose}
              color="gray"
            >
              Cancelar
            </Button>
            <Group>
              {activeTab !== 'consulta' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const tabs = ['consulta', 'examen', 'diagnostico', 'seguimiento', 'firma'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  color={tema.mantineColor}
                >
                  Anterior
                </Button>
              )}
              {activeTab !== 'firma' ? (
                <Button
                  onClick={() => {
                    const tabs = ['consulta', 'examen', 'diagnostico', 'seguimiento', 'firma'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  color={tema.mantineColor}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={saving}
                  leftSection={<IconDeviceFloppy size={16} />}
                  color={tema.mantineColor}
                >
                  Guardar Consulta
                </Button>
              )}
            </Group>
          </Group>
        </Paper>
      </form>
    </Modal>
  );
};

export default CreateConsultaMedicaModal;