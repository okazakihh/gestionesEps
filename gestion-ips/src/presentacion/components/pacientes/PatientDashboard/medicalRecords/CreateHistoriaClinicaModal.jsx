import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Paper, Text, Box, Group, Stack, ScrollArea, Grid } from '@mantine/core';
import { IconUser, IconFileText, IconHeart, IconStethoscope, IconClipboard, IconSignature, IconDeviceFloppy } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { historiasClinicasApiService, pacientesApiService } from '../../../../../data/services/pacientesApiService.js';
import { empleadosApiService } from '../../../../../data/services/empleadosApiService.js';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';
import { useAuth } from '../../../../../data/context/AuthContext.jsx';
import { useIpsConfig } from '../../../../../negocio/hooks/configuracion/useIpsConfig.js';
import { calculateAge } from '../../../../../negocio/utils/pacientes/patientModalUtils.js';

// Importar tabs
import DatosProcedimientoTab from './tabs/DatosProcedimientoTab.jsx';
import MotivoAnamnesisTab from './tabs/MotivoAnamnesisTab.jsx';
import AntecedentesTab from './tabs/AntecedentesTab.jsx';
import ExamenFisicoTab from './tabs/ExamenFisicoTab.jsx';
import DiagnosticoPlanTab from './tabs/DiagnosticoPlanTab.jsx';
import FirmaDigitalTab from './tabs/FirmaDigitalTab.jsx';

const CreateHistoriaClinicaModal = ({ isOpen, onClose, onHistoriaCreated, pacienteId, citaId, citaData, patientData }) => {
  const { tema } = useTheme();
  const { user } = useAuth();
  const { ipsConfig } = useIpsConfig();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('datos');

  // Parse patient data si viene como JSON string
  const parsedPatientData = React.useMemo(() => {
    if (!patientData) return null;
    
    // Si ya tiene informacionPersonal parseado, usarlo
    if (patientData.informacionPersonal) {
      return patientData;
    }
    
    // Si tiene datosJson como string, parsearlo
    if (patientData.datosJson) {
      try {
        const firstLevel = typeof patientData.datosJson === 'string' 
          ? JSON.parse(patientData.datosJson) 
          : patientData.datosJson;
        
        // Try nested format first (existing patients)
        if (firstLevel.datosJson) {
          const secondLevel = typeof firstLevel.datosJson === 'string' 
            ? JSON.parse(firstLevel.datosJson) 
            : firstLevel.datosJson;
          
          return {
            ...patientData,
            informacionPersonal: secondLevel.informacionPersonal || {},
            informacionContacto: secondLevel.informacionContacto || {},
            numeroDocumento: patientData.numeroDocumento,
            tipoDocumento: patientData.tipoDocumento
          };
        }
        
        // Try flat format (newly created patients)
        if (firstLevel.informacionPersonalJson || firstLevel.informacionContactoJson) {
          const informacionPersonal = firstLevel.informacionPersonalJson 
            ? JSON.parse(firstLevel.informacionPersonalJson) 
            : {};
          const informacionContacto = firstLevel.informacionContactoJson 
            ? JSON.parse(firstLevel.informacionContactoJson) 
            : {};
          
          return {
            ...patientData,
            informacionPersonal,
            informacionContacto,
            numeroDocumento: patientData.numeroDocumento,
            tipoDocumento: patientData.tipoDocumento
          };
        }
      } catch (e) {
        console.error('❌ Error parsing patient data:', e);
        return patientData;
      }
    }
    
    return patientData;
  }, [patientData]);

  const [formData, setFormData] = useState({
    pacienteId: pacienteId || '',
    fechaApertura: new Date().toISOString().split('T')[0],
    horaApertura: new Date().toISOString().split('T')[1].slice(0, 5),
    
    // Datos del procedimiento
    procedimiento: {
      medicoResponsable: citaData?.medicoAsignado || '',
      registroMedico: '',
      especialidad: citaData?.especialidad || '',
      entidadPrestadora: ipsConfig?.nombre || 'IPS',
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
      sistemasRevisados: {
        cabezaCuello: { normal: false, hallazgos: '' },
        toraxPulmones: { normal: false, hallazgos: '' },
        cardiovascular: { normal: false, hallazgos: '' },
        abdomen: { normal: false, hallazgos: '' },
        extremidades: { normal: false, hallazgos: '' },
        neurologico: { normal: false, hallazgos: '' },
        pielFaneras: { normal: false, hallazgos: '' }
      },
      camposEspecificos: {}
    },
    
    // Diagnóstico y plan
    diagnosticoPlan: {
      diagnosticos: [],
      examenes: [],
      ayudasDiagnosticas: '',
      planTratamiento: '',
      medicamentos: [],
      recomendaciones: '',
      seguimiento: {
        requiere: false,
        tipo: '',
        fechaProxima: ''
      }
      ,
      // Incapacidad
      incapacidad: {
        aplica: false,
        tipo: '',
        fechaInicio: '',
        fechaFin: '',
        dias: '',
        motivo: ''
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

  // Actualizar entidad prestadora cuando se cargue la configuración
  useEffect(() => {
    if (ipsConfig?.nombre) {
      setFormData(prev => ({
        ...prev,
        procedimiento: {
          ...prev.procedimiento,
          entidadPrestadora: ipsConfig.nombre
        }
      }));
    }
  }, [ipsConfig]);

  // Cargar datos del médico desde citaData y buscar licencia si no viene en citaData
  useEffect(() => {
    if (isOpen && citaData) {
      const medicoAsignado = citaData.medicoAsignado || '';
      const nombreMedico = medicoAsignado.split(' - ')[0] || '';
      const licenciaMedicaCita = citaData.licenciaMedica || '';
      const especialidad = citaData.especialidad || '';
      const medicoId = citaData.medicoId || null;
      
      console.log('🔍 Buscando licencia - medicoId:', medicoId, 'licencia en cita:', licenciaMedicaCita);
      
      // Actualizar formData con la información del médico de la cita
      setFormData(prev => ({
        ...prev,
        procedimiento: {
          ...prev.procedimiento,
          medicoResponsable: nombreMedico,
          registroMedico: licenciaMedicaCita,
          especialidad: especialidad
        }
      }));
      
      // Si no viene licenciaMedica en citaData, buscarla en el servicio de empleados
      if (!licenciaMedicaCita) {
        (async () => {
          try {
            // Si tenemos medicoId, buscar por ID; si no, buscar por nombre
            let empleadoResp = null;
            
            if (medicoId) {
              empleadoResp = await empleadosApiService.getEmpleadoById(medicoId);
            } else if (nombreMedico) {
              // Buscar por nombre en la lista de empleados
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
              
              // Intentar extraer licencia del jsonData del empleado
              if (empleadoResp.jsonData) {
                try {
                  const datosEmpleado = typeof empleadoResp.jsonData === 'string' 
                    ? JSON.parse(empleadoResp.jsonData) 
                    : empleadoResp.jsonData;
                  
                  // Buscar en nivel anidado
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
                console.log('✅ Licencia encontrada:', licencia);
                setFormData(prev => ({
                  ...prev,
                  procedimiento: {
                    ...prev.procedimiento,
                    registroMedico: licencia
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

          let matched = null;

          const tryParse = (s) => {
            if (!s || typeof s !== 'string') return null;
            try { return JSON.parse(s); } catch { return null; }
          };

          const parseEmployeeRecord = (emp) => {
            let parsed = null;
            const raw = emp?.jsonData || emp?.datosJson || emp?.json || null;
            if (raw) {
              const first = tryParse(raw) || raw;
              if (first && typeof first === 'object' && (first.jsonData || first.datosJson)) {
                const nestedRaw = first.jsonData || first.datosJson;
                const second = tryParse(nestedRaw) || nestedRaw;
                parsed = (second && typeof second === 'object') ? second : first;
              } else {
                parsed = (first && typeof first === 'object') ? first : first;
              }
            }
            if (!parsed) parsed = emp;
            return parsed;
          };

          for (const emp of list) {
            try {
              const parsed = parseEmployeeRecord(emp) || {};

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
              if (parsed?.nombre) nombreEmpleadoCandidates.push(parsed.nombre);
              if (emp?.nombre) nombreEmpleadoCandidates.push(emp.nombre);
              if (emp?.jsonData && typeof emp.jsonData === 'string') {
                const j = (() => { try { return JSON.parse(emp.jsonData); } catch { return null; } })();
                if (j && j.informacionPersonal) {
                  const ip2 = j.informacionPersonal;
                  nombreEmpleadoCandidates.push(`${ip2.primerNombre || ''} ${ip2.primerApellido || ''}`.trim());
                }
              }

              const nombreEmpleado = (nombreEmpleadoCandidates.find(Boolean) || '').trim();

              if (licenciaMedicaCita && numeroLic && String(numeroLic).trim() === String(licenciaMedicaCita).trim()) {
                console.log('🎯 Match por licencia:', numeroLic);
                matched = { parsed, raw: emp };
                break;
              }

              if (nombreMedico && nombreEmpleado && nombreEmpleado.toLowerCase().includes(nombreMedico.split(' ')[0].toLowerCase())) {
                console.log('🎯 Match por nombre:', nombreEmpleado, 'buscando:', nombreMedico);
                matched = { parsed, raw: emp };
                break;
              }
            } catch (e) {
              // ignore parse errors
            }
          }

          if (matched) {
            const parsedMatched = matched.parsed || matched;
            const rawMatched = matched.raw || parsedMatched;

            let signature = null;

            // prefer signature stored directly in parsedMatched or nested raw json
            if (typeof parsedMatched === 'string') signature = parsedMatched;
            if (!signature && parsedMatched.firmaDigital) {
              if (typeof parsedMatched.firmaDigital === 'string') signature = parsedMatched.firmaDigital;
              else if (parsedMatched.firmaDigital.imagen) signature = parsedMatched.firmaDigital.imagen;
            }

            // try raw object first-level jsonData
            const safeParse = (s) => { try { return typeof s === 'string' ? JSON.parse(s) : s; } catch { return null; } };
            const firstLevel = safeParse(rawMatched?.jsonData) || safeParse(rawMatched?.datosJson) || null;
            if (!signature && firstLevel && firstLevel.firmaDigital) {
              if (typeof firstLevel.firmaDigital === 'string') signature = firstLevel.firmaDigital;
              else if (firstLevel.firmaDigital.imagen) signature = firstLevel.firmaDigital.imagen;
            }

            // last resort: scan nested objects for common keys
            if (!signature) {
              const searchObj = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                const keys = ['imagen', 'image', 'firma', 'firmaDigital', 'signature'];
                for (const k of keys) if (obj[k]) return obj[k];
                for (const v of Object.values(obj)) {
                  if (typeof v === 'object') {
                    const found = searchObj(v);
                    if (found) return found;
                  }
                }
                return null;
              };
              signature = searchObj(parsedMatched) || searchObj(rawMatched);
            }

            if (signature) {
              console.log('✅ Firma encontrada y cargada');
              const foundNumeroLic = parsedMatched?.informacionLaboral?.numeroLicencia || parsedMatched?.numeroLicencia || rawMatched?.numeroLicencia || rawMatched?.informacionLaboral?.numeroLicencia || '';
              setFormData(prev => ({
                ...prev,
                firmaDigital: {
                  ...prev.firmaDigital,
                  imagen: signature,
                  numeroCedula: prev.firmaDigital?.numeroCedula || foundNumeroLic || ''
                }
              }));
            } else {
              console.log('❌ No se encontró firma para el empleado');
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
        text: 'Complete el médico responsable y la licencia médica',
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
          <IconFileText size={24} style={{ color: tema.primaryColor }} />
          <Text size="lg" fw={700}>Nueva Historia Clínica</Text>
        </Group>
      }
      size="xl"
      centered
      overlayColor={tema.primaryColor}
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
            <Grid>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed" fw={500}>Paciente</Text>
                <Text size="sm" fw={600}>
                  {parsedPatientData?.informacionPersonal 
                    ? `${parsedPatientData.informacionPersonal.primerNombre || ''} ${parsedPatientData.informacionPersonal.segundoNombre || ''} ${parsedPatientData.informacionPersonal.primerApellido || ''} ${parsedPatientData.informacionPersonal.segundoApellido || ''}`.trim()
                    : citaData?.nombre || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="xs" c="dimmed" fw={500}>Documento</Text>
                <Text size="sm" fw={600}>
                  {parsedPatientData?.tipoDocumento && parsedPatientData?.numeroDocumento
                    ? `${parsedPatientData.tipoDocumento} ${parsedPatientData.numeroDocumento}`
                    : citaData?.documento || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text size="xs" c="dimmed" fw={500}>Edad</Text>
                <Text size="sm" fw={600}>{calculateAge(parsedPatientData?.informacionPersonal?.fechaNacimiento)}</Text>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Error Banner */}
          {error && (
            <Paper p="md" m="md" mb={0} withBorder style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
              <Text c="red" size="sm" fw={500}>{error}</Text>
            </Paper>
          )}

          {/* Tabs Navigation */}
          <Box px="md" pt="md">
            <Tabs value={activeTab} onChange={setActiveTab} color={tema.mantineColor} variant="pills">
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
                      patientData={parsedPatientData}
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
