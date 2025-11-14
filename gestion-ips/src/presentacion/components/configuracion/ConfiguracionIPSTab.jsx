/**
 * Componente Tab para configuración de información de la IPS
 * Capa de presentación - Componentes
 * 
 * Permite editar la información institucional que se usa en:
 * - Facturas médicas
 * - Historias clínicas
 * - Desprendibles de nómina
 * - Documentos oficiales
 */

import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  TextInput, 
  Textarea, 
  Button, 
  Group, 
  Grid,
  Title,
  Text,
  Loader,
  Alert,
  Paper,
  Divider
} from '@mantine/core';
import { IconDeviceFloppy, IconAlertCircle, IconBuilding } from '@tabler/icons-react';
import { useConfiguracionManagement } from '../../../negocio/hooks/configuracion/useConfiguracionManagement.js';
import Swal from 'sweetalert2';

export const ConfiguracionIPSTab = () => {
  const { getConfiguracionByClave, updateConfiguracionByClave } = useConfiguracionManagement();
  
  // Estado local del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    nit: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    pais: '',
    codigoPostal: '',
    telefono: '',
    celular: '',
    email: '',
    sitioWeb: '',
    codigoHabilitacion: '',
    resolucionHabilitacion: '',
    nivelAtencion: '',
    tipoIPS: '',
    horarioAtencion: '',
    horarioUrgencias: '',
    regimenTributario: '',
    responsabilidadFiscal: '',
    actividadEconomica: '',
    representanteLegal: {
      nombre: '',
      cargo: '',
      cedula: '',
      tarjetaProfesional: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configOriginal, setConfigOriginal] = useState(null);

  // Cargar configuración al montar el componente
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    setLoading(true);
    try {
      const config = await getConfiguracionByClave('IPS_INFO');
      
      console.log('🔍 Configuración recibida (IPS):', config);
      
      if (config && config.jsonData) {
        console.log('📦 JSON Data (IPS):', config.jsonData);
        // Guardar configuración original completa
        setConfigOriginal(config.jsonData);
        
        const newFormData = {
          nombre: config.jsonData.nombre || '',
          descripcion: config.jsonData.descripcion || '',
          nit: config.jsonData.nit || '',
          direccion: config.jsonData.direccion || '',
          ciudad: config.jsonData.ciudad || '',
          departamento: config.jsonData.departamento || '',
          pais: config.jsonData.pais || 'Colombia',
          codigoPostal: config.jsonData.codigoPostal || '',
          telefono: config.jsonData.telefono || '',
          celular: config.jsonData.celular || '',
          email: config.jsonData.email || '',
          sitioWeb: config.jsonData.sitioWeb || '',
          codigoHabilitacion: config.jsonData.codigoHabilitacion || '',
          resolucionHabilitacion: config.jsonData.resolucionHabilitacion || '',
          nivelAtencion: config.jsonData.nivelAtencion || '',
          tipoIPS: config.jsonData.tipoIPS || '',
          horarioAtencion: config.jsonData.horarioAtencion || '',
          horarioUrgencias: config.jsonData.horarioUrgencias || '',
          regimenTributario: config.jsonData.regimenTributario || '',
          responsabilidadFiscal: config.jsonData.responsabilidadFiscal || '',
          actividadEconomica: config.jsonData.actividadEconomica || '',
          representanteLegal: {
            nombre: config.jsonData.representanteLegal?.nombre || '',
            cargo: config.jsonData.representanteLegal?.cargo || '',
            cedula: config.jsonData.representanteLegal?.cedula || '',
            tarjetaProfesional: config.jsonData.representanteLegal?.tarjetaProfesional || ''
          }
        };
        
        console.log('🎯 Actualizando formData con:', newFormData);
        setFormData(newFormData);
        console.log('✅ formData actualizado');
      }
    } catch (error) {
      console.error('Error al cargar configuración de la IPS:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en inputs
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambios en representante legal
  const handleRepresentanteChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      representanteLegal: {
        ...prev.representanteLegal,
        [field]: value
      }
    }));
  };

  // Guardar configuración
  const handleSave = async () => {
    const result = await Swal.fire({
      title: '¿Guardar configuración de la IPS?',
      text: 'Los cambios se reflejarán en facturas y documentos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // Hacer merge correcto: primero original, luego campos del form (excepto objetos anidados)
      const { representanteLegal: formRepresentante, ...formDataSinAnidados } = formData;
      
      const updatedConfig = {
        ...(configOriginal || {}),     // 1. Todo lo original (incluye colores, etc)
        ...formDataSinAnidados,        // 2. Campos simples del formulario
        // 3. Merge explícito de objetos anidados
        representanteLegal: {
          ...(configOriginal?.representanteLegal || {}),
          ...formRepresentante
        },
        // 4. Preservar colores si existen (por si acaso formData los sobrescribió)
        colores: configOriginal?.colores || {
          primario: "#2563eb",
          secundario: "#10b981",
          acento: "#f59e0b",
          texto: "#1f2937",
          textoClaro: "#6b7280"
        }
      };

      console.log('🔍 Config Original:', configOriginal);
      console.log('📝 Form Data:', formData);
      console.log('✅ Updated Config (merged):', updatedConfig);

      // Enviar solo el objeto de configuración, no un wrapper con metadata
      // El servicio se encargará de convertirlo a JSON string
      const result = await updateConfiguracionByClave('IPS_INFO', updatedConfig);

      if (result.success) {
        // Limpiar cache de configuración IPS en facturación
        const { clearIpsConfigCache } = await import('../../../data/services/configuracionApiService.js');
        clearIpsConfigCache();
        await cargarConfiguracion();
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      // Error ya manejado en el hook
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: '300px' }}>
        <Loader size="lg" />
        <Text c="dimmed">Cargando configuración de la IPS...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Stack gap="xs">
        <Title order={3}>
          <IconBuilding size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Información de la IPS
        </Title>
        <Text size="sm" c="dimmed">
          Configure la información institucional que aparece en facturas, historias clínicas y documentos oficiales
        </Text>
      </Stack>

      <Alert
        icon={<IconAlertCircle size={20} />}
        title="Importante"
        color="blue"
        variant="light"
      >
        <Text size="sm">
          Esta información se usa en todos los documentos generados por el sistema.
          Asegúrese de que los datos sean correctos y estén actualizados.
        </Text>
      </Alert>

      {/* Información Básica */}
      <Paper shadow="xs" p="lg" withBorder>
        <Title order={4} mb="md">
          Información Básica
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <TextInput
              label="Nombre de la IPS"
              placeholder="IPS SALUD TOTAL"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="NIT"
              placeholder="900.123.456-7"
              value={formData.nit}
              onChange={(e) => handleChange('nit', e.target.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Descripción"
              placeholder="Institución Prestadora de Servicios de Salud"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              minRows={2}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Ubicación */}
      <Paper shadow="xs" p="lg" withBorder>
        <Title order={4} mb="md">Ubicación</Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <TextInput
              label="Dirección"
              placeholder="Calle 123 # 45-67"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Código Postal"
              placeholder="110111"
              value={formData.codigoPostal}
              onChange={(e) => handleChange('codigoPostal', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Ciudad"
              placeholder="Bucaramanga"
              value={formData.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Departamento"
              placeholder="Santander"
              value={formData.departamento}
              onChange={(e) => handleChange('departamento', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="País"
              placeholder="Colombia"
              value={formData.pais}
              onChange={(e) => handleChange('pais', e.target.value)}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Contacto */}
      <Paper shadow="xs" p="lg" withBorder>
        <Title order={4} mb="md">Contacto</Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Teléfono"
              placeholder="+57 (601) 234 5678"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Celular"
              placeholder="+57 300 123 4567"
              value={formData.celular}
              onChange={(e) => handleChange('celular', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Email"
              placeholder="contacto@ipssaludtotal.com.co"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Sitio Web"
              placeholder="www.ipssaludtotal.com.co"
              value={formData.sitioWeb}
              onChange={(e) => handleChange('sitioWeb', e.target.value)}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Información Legal */}
      <Paper shadow="xs" p="lg" withBorder>
        <Title order={4} mb="md">Información Legal y Regulatoria</Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Código de Habilitación"
              placeholder="11000012345678"
              value={formData.codigoHabilitacion}
              onChange={(e) => handleChange('codigoHabilitacion', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Resolución de Habilitación"
              placeholder="Resolución 1234 de 2020"
              value={formData.resolucionHabilitacion}
              onChange={(e) => handleChange('resolucionHabilitacion', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Nivel de Atención"
              placeholder="II Nivel"
              value={formData.nivelAtencion}
              onChange={(e) => handleChange('nivelAtencion', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Tipo de IPS"
              placeholder="Privada"
              value={formData.tipoIPS}
              onChange={(e) => handleChange('tipoIPS', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Régimen Tributario"
              placeholder="Régimen Común"
              value={formData.regimenTributario}
              onChange={(e) => handleChange('regimenTributario', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Responsabilidad Fiscal"
              placeholder="No responsable de IVA"
              value={formData.responsabilidadFiscal}
              onChange={(e) => handleChange('responsabilidadFiscal', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Actividad Económica"
              placeholder="8610 - Actividades de hospitales..."
              value={formData.actividadEconomica}
              onChange={(e) => handleChange('actividadEconomica', e.target.value)}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Horarios */}
      <Paper shadow="xs" p="lg" withBorder>
        <Title order={4} mb="md">Horarios de Atención</Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Horario de Atención"
              placeholder="Lunes a Viernes: 7:00 AM - 6:00 PM"
              value={formData.horarioAtencion}
              onChange={(e) => handleChange('horarioAtencion', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Horario de Urgencias"
              placeholder="24 horas / 7 días"
              value={formData.horarioUrgencias}
              onChange={(e) => handleChange('horarioUrgencias', e.target.value)}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Representante Legal */}
      <Paper shadow="xs" p="lg" withBorder>
        <Title order={4} mb="md">Representante Legal</Title>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Nombre Completo"
              placeholder="Dr. Juan Carlos Pérez González"
              value={formData.representanteLegal.nombre}
              onChange={(e) => handleRepresentanteChange('nombre', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Cargo"
              placeholder="Director General"
              value={formData.representanteLegal.cargo}
              onChange={(e) => handleRepresentanteChange('cargo', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Cédula"
              placeholder="12345678"
              value={formData.representanteLegal.cedula}
              onChange={(e) => handleRepresentanteChange('cedula', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Tarjeta Profesional"
              placeholder="12345"
              value={formData.representanteLegal.tarjetaProfesional}
              onChange={(e) => handleRepresentanteChange('tarjetaProfesional', e.target.value)}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Botones de acción */}
      <Group justify="flex-end">
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSave}
          loading={saving}
        >
          Guardar Cambios
        </Button>
      </Group>
    </Stack>
  );
};

export default ConfiguracionIPSTab;
