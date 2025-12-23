import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  Text,
  Divider,
  Switch
} from '@mantine/core';
import { IconUser, IconBuilding, IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';
import { 
  TIPO_DOCUMENTO_FACTURACION_OPTIONS, 
  TIPO_PERSONA_OPTIONS, 
  REGIMEN_FISCAL_OPTIONS 
} from '../../../negocio/utils/listHelps.js';

/**
 * Formulario para crear/editar clientes de facturación
 * Componente de presentación - UI pura
 */
const ClienteFacturacionForm = ({ opened, onClose, onSubmit, clienteInicial = null, loading = false }) => {
  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    tipoPersona: 'NATURAL',
    nombres: '',
    apellidos: '',
    nombreCompleto: '',
    razonSocial: '',
    email: '',
    telefono: '',
    direccion: {
      calle: '',
      ciudad: '',
      departamento: '',
      codigoPostal: ''
    },
    codigoClienteSiigo: '',
    informacionTributaria: {
      responsableIVA: false,
      granContribuyente: false,
      regimenFiscal: 'SIMPLIFICADO'
    },
    observaciones: '',
    activo: true
  });

  const [errors, setErrors] = useState({});
  const esEdicion = Boolean(clienteInicial);

  // Cargar datos si es edición
  useEffect(() => {
    if (clienteInicial) {
      const datos = typeof clienteInicial.datos === 'string' 
        ? JSON.parse(clienteInicial.datos) 
        : clienteInicial.datos;
      
      setFormData({
        ...datos,
        direccion: datos.direccion || {
          calle: '',
          ciudad: '',
          departamento: '',
          codigoPostal: ''
        },
        informacionTributaria: datos.informacionTributaria || {
          responsableIVA: false,
          granContribuyente: false,
          regimenFiscal: 'SIMPLIFICADO'
        }
      });
    } else {
      // Reset form
      setFormData({
        tipoDocumento: 'CC',
        numeroDocumento: '',
        tipoPersona: 'NATURAL',
        nombres: '',
        apellidos: '',
        nombreCompleto: '',
        razonSocial: '',
        email: '',
        telefono: '',
        direccion: {
          calle: '',
          ciudad: '',
          departamento: '',
          codigoPostal: ''
        },
        codigoClienteSiigo: '',
        informacionTributaria: {
          responsableIVA: false,
          granContribuyente: false,
          regimenFiscal: 'SIMPLIFICADO'
        },
        observaciones: '',
        activo: true
      });
    }
    setErrors({});
  }, [clienteInicial, opened]);

  // Auto-generar nombre completo
  useEffect(() => {
    if (formData.tipoPersona === 'NATURAL') {
      const nombreCompleto = `${formData.nombres || ''} ${formData.apellidos || ''}`.trim();
      if (nombreCompleto) {
        setFormData(prev => ({ ...prev, nombreCompleto }));
      }
    } else if (formData.tipoPersona === 'JURIDICA') {
      setFormData(prev => ({ ...prev, nombreCompleto: formData.razonSocial }));
    }
  }, [formData.nombres, formData.apellidos, formData.razonSocial, formData.tipoPersona]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDireccionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      direccion: { ...prev.direccion, [field]: value }
    }));
  };

  const handleTributariaChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      informacionTributaria: { ...prev.informacionTributaria, [field]: value }
    }));
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.tipoDocumento) newErrors.tipoDocumento = 'Requerido';
    if (!formData.numeroDocumento) newErrors.numeroDocumento = 'Requerido';
    if (!formData.tipoPersona) newErrors.tipoPersona = 'Requerido';

    if (formData.tipoPersona === 'NATURAL') {
      if (!formData.nombres) newErrors.nombres = 'Requerido';
      if (!formData.apellidos) newErrors.apellidos = 'Requerido';
    } else if (formData.tipoPersona === 'JURIDICA') {
      if (!formData.razonSocial) newErrors.razonSocial = 'Requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validarFormulario()) return;

    onSubmit(formData);
  };

  // Filtrar tipos de documento según tipo de persona
  const tiposDocumentoFiltrados = formData.tipoPersona === 'NATURAL'
    ? TIPO_DOCUMENTO_FACTURACION_OPTIONS.filter(tipo => ['CC', 'CE', 'TI', 'PAS'].includes(tipo.value))
    : TIPO_DOCUMENTO_FACTURACION_OPTIONS.filter(tipo => tipo.value === 'NIT');

  // Ajustar tipo de documento cuando cambia tipo de persona
  useEffect(() => {
    if (formData.tipoPersona === 'JURIDICA' && formData.tipoDocumento !== 'NIT') {
      handleChange('tipoDocumento', 'NIT');
    } else if (formData.tipoPersona === 'NATURAL' && formData.tipoDocumento === 'NIT') {
      handleChange('tipoDocumento', 'CC');
    }
  }, [formData.tipoPersona]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          {formData.tipoPersona === 'NATURAL' ? <IconUser size={24} /> : <IconBuilding size={24} />}
          <Text size="lg" weight={600}>
            {esEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Text>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack spacing="md">
        {/* Tipo de Persona y Documento */}
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Tipo de Persona"
              placeholder="Seleccione"
              data={TIPO_PERSONA_OPTIONS}
              value={formData.tipoPersona}
              onChange={(value) => handleChange('tipoPersona', value)}
              required
              error={errors.tipoPersona}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Select
              label="Tipo de Documento"
              placeholder="Seleccione"
              data={tiposDocumentoFiltrados}
              value={formData.tipoDocumento}
              onChange={(value) => handleChange('tipoDocumento', value)}
              required
              error={errors.tipoDocumento}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Número de Documento"
              placeholder="123456789"
              value={formData.numeroDocumento}
              onChange={(e) => handleChange('numeroDocumento', e.target.value)}
              required
              error={errors.numeroDocumento}
            />
          </Grid.Col>
        </Grid>

        <Divider label="Información Personal" labelPosition="center" />

        {/* Campos según tipo de persona */}
        {formData.tipoPersona === 'NATURAL' ? (
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Nombres"
                placeholder="Juan Carlos"
                value={formData.nombres}
                onChange={(e) => handleChange('nombres', e.target.value)}
                required
                error={errors.nombres}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Apellidos"
                placeholder="Pérez González"
                value={formData.apellidos}
                onChange={(e) => handleChange('apellidos', e.target.value)}
                required
                error={errors.apellidos}
              />
            </Grid.Col>
          </Grid>
        ) : (
          <TextInput
            label="Razón Social"
            placeholder="Empresa de Salud SA"
            value={formData.razonSocial}
            onChange={(e) => handleChange('razonSocial', e.target.value)}
            required
            error={errors.razonSocial}
          />
        )}

        <Divider label="Información de Contacto" labelPosition="center" />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Email"
              placeholder="cliente@example.com"
              type="email"
              icon={<IconMail size={16} />}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Teléfono"
              placeholder="3001234567"
              icon={<IconPhone size={16} />}
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
            />
          </Grid.Col>
        </Grid>

        <Divider label="Dirección" labelPosition="center" />

        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label="Dirección"
              placeholder="Calle 123 #45-67"
              icon={<IconMapPin size={16} />}
              value={formData.direccion.calle}
              onChange={(e) => handleDireccionChange('calle', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Ciudad"
              placeholder="Bogotá"
              value={formData.direccion.ciudad}
              onChange={(e) => handleDireccionChange('ciudad', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Departamento"
              placeholder="Cundinamarca"
              value={formData.direccion.departamento}
              onChange={(e) => handleDireccionChange('departamento', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label="Código Postal"
              placeholder="110111"
              value={formData.direccion.codigoPostal}
              onChange={(e) => handleDireccionChange('codigoPostal', e.target.value)}
            />
          </Grid.Col>
        </Grid>

        <Divider label="Información Tributaria" labelPosition="center" />

        <Grid>
          <Grid.Col span={4}>
            <Switch
              label="Responsable de IVA"
              checked={formData.informacionTributaria.responsableIVA}
              onChange={(e) => handleTributariaChange('responsableIVA', e.currentTarget.checked)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Switch
              label="Gran Contribuyente"
              checked={formData.informacionTributaria.granContribuyente}
              onChange={(e) => handleTributariaChange('granContribuyente', e.currentTarget.checked)}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Régimen Fiscal"
              data={REGIMEN_FISCAL_OPTIONS}
              value={formData.informacionTributaria.regimenFiscal}
              onChange={(value) => handleTributariaChange('regimenFiscal', value)}
            />
          </Grid.Col>
        </Grid>

        <Divider label="Información Adicional" labelPosition="center" />

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Código Cliente Siigo"
              placeholder="CLI-001"
              value={formData.codigoClienteSiigo}
              onChange={(e) => handleChange('codigoClienteSiigo', e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Switch
              label="Cliente Activo"
              checked={formData.activo}
              onChange={(e) => handleChange('activo', e.currentTarget.checked)}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Observaciones"
          placeholder="Notas adicionales sobre el cliente"
          value={formData.observaciones}
          onChange={(e) => handleChange('observaciones', e.target.value)}
        />

        {/* Botones de acción */}
        <Group position="right" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {esEdicion ? 'Actualizar' : 'Crear Cliente'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ClienteFacturacionForm;
