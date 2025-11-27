import React, { useState } from 'react';
import { Grid, TextInput, Paper, Stack, Group, Text, Checkbox, Image, Button, FileInput } from '@mantine/core';
import { IconSignature, IconShieldCheck, IconCalendar, IconCheck, IconTrash, IconRefresh } from '@tabler/icons-react';
import { empleadosApiService } from '../../../../../../data/services/empleadosApiService.js';

/**
 * Tab 6: Firma Digital y Validación
 */
const FirmaDigitalTab = ({ formData, setFormData }) => {
  const [uploading, setUploading] = useState(false);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const removeSignature = () => {
    setFormData({ ...formData, firmaDigital: { ...formData.firmaDigital, imagen: null } });
  };

  const updateSignatureFromProfile = async () => {
      try {
      setUploading(true);
      const licencia = formData.firmaDigital?.numeroCedula || formData.detalleConsulta?.registroMedico || '';
      const nombreMedico = formData.firmaDigital?.nombreMedico || formData.detalleConsulta?.medicoTratante || '';
      const resp = await empleadosApiService.getEmpleados({ size: 1000 });
      const list = Array.isArray(resp?.content) ? resp.content : resp || [];
      let matched = null;
      for (const emp of list) {
        try {
          const safeParse = (s) => { try { return typeof s === 'string' ? JSON.parse(s) : s; } catch { return null; } };
          const parsed = safeParse(emp.datosJson) || safeParse(emp.jsonData) || emp.datosJson || emp.jsonData || emp;

          // if parsed contains nested jsonData as a string, parse it too
          const firstLevel = safeParse(emp.jsonData) || safeParse(emp.datosJson) || null;
          const nested = firstLevel ? (safeParse(firstLevel.jsonData) || safeParse(firstLevel.datosJson) || null) : null;

          const numeroLic = parsed?.informacionLaboral?.numeroLicencia
            || parsed?.numeroLicencia
            || parsed?.informacionLaboral?.licencia
            || (firstLevel && (firstLevel.informacionLaboral?.numeroLicencia || firstLevel.numeroLicencia))
            || (nested && (nested.informacionLaboral?.numeroLicencia || nested.numeroLicencia))
            || '';
          if (licencia && numeroLic && String(numeroLic).trim() === String(licencia).trim()) {
            matched = parsed;
            break;
          }
          const nombreEmpleado = `${parsed?.informacionPersonal?.primerNombre || ''} ${parsed?.informacionPersonal?.primerApellido || ''}`.trim();
          if (nombreMedico && nombreEmpleado && nombreEmpleado.toLowerCase().includes(nombreMedico.split(' ')[0].toLowerCase())) {
            matched = parsed;
            break;
          }
        } catch (e) {
          // ignore
        }
      }
      if (matched) {
        let signature = null;
        if (typeof matched.firmaDigital === 'string') signature = matched.firmaDigital;
        else if (matched.firmaDigital && (matched.firmaDigital.imagen || matched.firmaDigital.image || matched.firmaDigital.firma)) {
          signature = matched.firmaDigital.imagen || matched.firmaDigital.image || matched.firmaDigital.firma;
        } else if (matched.informacionPersonal && (matched.informacionPersonal.firmaDigital || matched.informacionPersonal.firma)) {
          const f = matched.informacionPersonal.firmaDigital || matched.informacionPersonal.firma;
          if (typeof f === 'string') signature = f;
          else if (f.imagen || f.image || f.firma) signature = f.imagen || f.image || f.firma;
        }

        // set also the license / registro medico if we detected it
        const foundNumeroLic = numeroLic || (matched?.informacionLaboral?.numeroLicencia) || (matched?.numeroLicencia) || '';

        if (signature) {
          setFormData({ ...formData, firmaDigital: { ...formData.firmaDigital, imagen: signature, numeroCedula: formData.firmaDigital?.numeroCedula || foundNumeroLic || '' } });
        }
      }
    } catch (err) {
      console.error('Error updating signature from profile', err);
    } finally {
      setUploading(false);
    }
  };

  const handleManualUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const dataUrl = await fileToBase64(file);
      setFormData({ ...formData, firmaDigital: { ...formData.firmaDigital, imagen: dataUrl } });
    } catch (err) {
      console.error('Error converting file to base64', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
        <Group gap="xs" mb="md">
          <IconSignature size={18} color="var(--mantine-color-blue-6)" />
          <Text size="sm" fw={600}>Firma Digital del Médico</Text>
        </Group>
        
        <Grid gutter="md">
          <Grid.Col span={12}>
            <Text size="sm">Nombre Completo del Médico:</Text>
            <Text fw={700}>{formData.firmaDigital.nombreMedico || 'N/A'}</Text>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text size="sm">Número de Registro Médico:</Text>
            <Text fw={700}>{formData.firmaDigital?.numeroCedula || formData.detalleConsulta?.registroMedico || 'N/A'}</Text>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text size="sm">Especialidad:</Text>
            <Text fw={700}>{formData.firmaDigital.especialidad || 'N/A'}</Text>
          </Grid.Col>

          {formData.firmaDigital.imagen ? (
            <Grid.Col span={12}>
              <Text size="sm" mb="xs">Firma del Médico (desde perfil)</Text>
              <Paper withBorder p="xs" style={{ maxWidth: 200, margin: 'auto', textAlign: 'center' }}>
                <Image
                  src={formData.firmaDigital.imagen}
                  alt="Firma del médico"
                  style={{ width: 160, height: 'auto', objectFit: 'contain' }}
                />
                <Group position="center" mt="sm">
                  <Button leftIcon={<IconTrash size={14} />} color="red" variant="outline" size="xs" onClick={removeSignature}>Quitar</Button>
                  <Button leftIcon={<IconRefresh size={14} />} variant="light" size="xs" onClick={updateSignatureFromProfile} loading={uploading}>Actualizar</Button>
                </Group>
              </Paper>
            </Grid.Col>
          ) : (
            <Grid.Col span={12}>
              <Text size="sm" mb="xs">Firma no encontrada en el perfil del médico.</Text>
              <Group position="center">
                <FileInput
                  label="Cargar firma (imagen)"
                  placeholder="Seleccione una imagen..."
                  accept="image/*"
                  onChange={handleManualUpload}
                  size="sm"
                />
                <Button onClick={updateSignatureFromProfile} loading={uploading} size="sm">Usar firma del perfil</Button>
              </Group>
            </Grid.Col>
          )}
          
          <Grid.Col span={12}>
            <TextInput
              label="Fecha y Hora de Firma"
              value={`${formData.firmaDigital.fechaFirma} ${new Date().toLocaleTimeString('es-CO')}`}
              readOnly
              leftSection={<IconCalendar size={16} />}
              leftSectionWidth={45}
              styles={{
                input: {
                  paddingLeft: '50px',
                  backgroundColor: 'var(--mantine-color-gray-1)',
                  fontWeight: 600
                }
              }}
              size="sm"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Certificación */}
      <Paper p="lg" withBorder style={{ backgroundColor: 'var(--mantine-color-yellow-0)', borderColor: 'var(--mantine-color-yellow-3)' }}>
        <Stack gap="md">
          <Group gap="xs">
            <IconShieldCheck size={20} color="var(--mantine-color-yellow-7)" />
            <Text size="sm" fw={700} c="yellow.9">Certificación de Veracidad</Text>
          </Group>
          
          <Text size="sm" c="dimmed">
            Al marcar esta casilla, certifico que toda la información contenida en esta historia clínica 
            es verídica y ha sido registrada de acuerdo con los hallazgos clínicos encontrados durante 
            la atención del paciente. Esta información se encuentra protegida bajo las normas de confidencialidad 
            médica y cumple con los estándares legales vigentes.
          </Text>
          
          <Checkbox
            label={
              <Text fw={600} c={formData.firmaDigital.certificacion ? 'green' : 'red'}>
                Certifico que la información registrada es verídica y cumple con las normas éticas y legales
              </Text>
            }
            checked={formData.firmaDigital.certificacion}
            icon={IconCheck}
            onChange={(e) => setFormData({
              ...formData,
              firmaDigital: { ...formData.firmaDigital, certificacion: e.currentTarget.checked }
            })}
            required
            size="md"
            color={formData.firmaDigital.certificacion ? 'green' : 'red'}
          />
          
          {!formData.firmaDigital.certificacion && (
            <Text size="xs" c="red" fw={500}>
              * Debe certificar la información antes de guardar la historia clínica
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Información adicional */}
      <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Text size="xs" c="dimmed" ta="center">
          Este documento será firmado electrónicamente y quedará registrado en el sistema con fecha y hora. 
          La información será almacenada de forma segura y cumplirá con las normas de historia clínica digital 
          establecidas por la legislación vigente.
        </Text>
      </Paper>
    </Stack>
  );
};

export default FirmaDigitalTab;
