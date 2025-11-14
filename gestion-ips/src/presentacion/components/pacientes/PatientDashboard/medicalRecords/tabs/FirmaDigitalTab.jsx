import React from 'react';
import { Grid, TextInput, Paper, Stack, Group, Text, Checkbox } from '@mantine/core';
import { IconSignature, IconShieldCheck, IconCalendar } from '@tabler/icons-react';

/**
 * Tab 6: Firma Digital y Validación
 */
const FirmaDigitalTab = ({ formData, setFormData }) => {
  return (
    <Stack gap="md">
      <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
        <Group gap="xs" mb="md">
          <IconSignature size={18} color="var(--mantine-color-blue-6)" />
          <Text size="sm" fw={600}>Firma Digital del Médico</Text>
        </Group>
        
        <Grid gutter="md">
          <Grid.Col span={12}>
            <TextInput
              label="Nombre Completo del Médico"
              placeholder="Nombre completo"
              value={formData.firmaDigital.nombreMedico}
              onChange={(e) => setFormData({
                ...formData,
                firmaDigital: { ...formData.firmaDigital, nombreMedico: e.target.value }
              })}
              required
              size="sm"
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <TextInput
              label="Número de Cédula / Registro Médico"
              placeholder="CC o RM"
              value={formData.firmaDigital.numeroCedula}
              onChange={(e) => setFormData({
                ...formData,
                firmaDigital: { ...formData.firmaDigital, numeroCedula: e.target.value }
              })}
              required
              size="sm"
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <TextInput
              label="Especialidad"
              placeholder="Especialidad médica"
              value={formData.firmaDigital.especialidad}
              onChange={(e) => setFormData({
                ...formData,
                firmaDigital: { ...formData.firmaDigital, especialidad: e.target.value }
              })}
              required
              size="sm"
            />
          </Grid.Col>
          
          <Grid.Col span={12}>
            <TextInput
              label="Fecha y Hora de Firma"
              value={`${formData.firmaDigital.fechaFirma} ${new Date().toLocaleTimeString('es-CO')}`}
              readOnly
              leftSection={<IconCalendar size={16} />}
              styles={{
                input: {
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
