import React, { useState, useEffect } from 'react';
import { Modal, Text, Button, Group, Paper, Stack, TextInput, Select, Textarea, Divider, Alert, Tabs, Table, Badge } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle, IconUser, IconReceipt, IconFileInvoice } from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';

/**
 * FacturaDianModal - Modal para crear factura con información completa para DIAN
 * 
 * Captura:
 * - Datos del cliente (completar/editar desde paciente)
 * - Forma de pago
 * - Medio de pago
 * - Observaciones
 * - Previsualización de la factura
 */
const FacturaDianModal = ({
  opened = false,
  onClose,
  facturaPreview = null,
  onSave,
  loading = false
}) => {
  // Estado para tipo de destinatario
  const [tipoDestinatario, setTipoDestinatario] = useState('PACIENTE'); // PACIENTE o ENTIDAD

  // Estados para datos del cliente
  const [clienteData, setClienteData] = useState({
    nombreCompleto: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    telefono: '',
    email: ''
  });

  // Estados para datos de entidad
  const [entidadData, setEntidadData] = useState({
    razonSocial: '',
    nit: '',
    digitoVerificacion: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    telefono: '',
    email: '',
    nombreContacto: '',
    cargoContacto: ''
  });

  // Estados para datos de la factura
  const [datosFactura, setDatosFactura] = useState({
    formaPago: 'CONTADO',
    medioPago: 'EFECTIVO',
    observaciones: '',
    enviarADianAutomaticamente: false
  });

  const [errores, setErrores] = useState({});
  const [totalesCalculados, setTotalesCalculados] = useState({
    subtotal: 0,
    iva: 0,
    ivaPercent: 0,
    total: 0
  });

  /**
   * Calcular totales cuando cambia facturaPreview
   */
  useEffect(() => {
    if (facturaPreview && facturaPreview.citas && Array.isArray(facturaPreview.citas)) {
      // Calcular subtotal desde las citas
      const subtotal = facturaPreview.citas.reduce((sum, cita) => {
        const valor = cita.valor || 0;
        return sum + valor;
      }, 0);
      
      // Usar valores del preview si existen, sino calcular
      const ivaPercent = facturaPreview.ivaPercent || 0;
      const iva = facturaPreview.iva || (subtotal * ivaPercent / 100);
      const total = facturaPreview.total || (subtotal + iva);
      
      setTotalesCalculados({
        subtotal,
        iva,
        ivaPercent,
        total
      });
    }
  }, [facturaPreview]);

  /**
   * Cargar datos del paciente cuando se abre el modal
   */
  useEffect(() => {
    if (opened && facturaPreview && facturaPreview.citas && Array.isArray(facturaPreview.citas) && facturaPreview.citas.length > 0) {
      const primeraCita = facturaPreview.citas[0];
      const paciente = primeraCita.paciente;

      // Pre-cargar datos del paciente
      setClienteData({
        nombreCompleto: `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim(),
        tipoDocumento: paciente.tipoDocumento || 'CC',
        numeroDocumento: paciente.numeroDocumento || '',
        direccion: paciente.direccion || '',
        ciudad: paciente.ciudad || '',
        departamento: paciente.departamento || '',
        telefono: paciente.telefono || '',
        email: paciente.email || ''
      });

      // Resetear tipo a PACIENTE
      setTipoDestinatario('PACIENTE');
    }
  }, [opened, facturaPreview]);

  /**
   * Validar campos requeridos según tipo de destinatario
   */
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (tipoDestinatario === 'PACIENTE') {
      // Validación para paciente
      if (!clienteData.nombreCompleto.trim()) {
        nuevosErrores.nombreCompleto = 'Nombre completo es requerido';
      }

      if (!clienteData.numeroDocumento.trim()) {
        nuevosErrores.numeroDocumento = 'Número de documento es requerido';
      }

      if (!clienteData.direccion.trim()) {
        nuevosErrores.direccion = 'Dirección es requerida por DIAN';
      }

      if (!clienteData.ciudad.trim()) {
        nuevosErrores.ciudad = 'Ciudad es requerida por DIAN';
      }

      if (!clienteData.telefono.trim()) {
        nuevosErrores.telefono = 'Teléfono es requerido por DIAN';
      }

      if (clienteData.email && !isValidEmail(clienteData.email)) {
        nuevosErrores.email = 'Email inválido';
      }
    } else {
      // Validación para entidad
      if (!entidadData.razonSocial.trim()) {
        nuevosErrores.razonSocial = 'Razón social es requerida';
      }

      if (!entidadData.nit.trim()) {
        nuevosErrores.nit = 'NIT es requerido';
      }

      if (!entidadData.direccion.trim()) {
        nuevosErrores.direccionEntidad = 'Dirección es requerida por DIAN';
      }

      if (!entidadData.ciudad.trim()) {
        nuevosErrores.ciudadEntidad = 'Ciudad es requerida por DIAN';
      }

      if (!entidadData.telefono.trim()) {
        nuevosErrores.telefonoEntidad = 'Teléfono es requerido por DIAN';
      }

      if (entidadData.email && !isValidEmail(entidadData.email)) {
        nuevosErrores.emailEntidad = 'Email inválido';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Validar email
   */
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * Guardar factura con datos completos
   */
  const handleGuardar = () => {
    if (!validarFormulario()) {
      return;
    }

    // Preparar datos del destinatario según el tipo
    let destinatarioData;
    if (tipoDestinatario === 'PACIENTE') {
      destinatarioData = {
        ...clienteData,
        tipoPersona: 'NATURAL'
      };
    } else {
      // Mapear datos de entidad a formato cliente
      destinatarioData = {
        nombreCompleto: entidadData.razonSocial,
        tipoDocumento: 'NIT',
        numeroDocumento: entidadData.nit,
        digitoVerificacion: entidadData.digitoVerificacion,
        direccion: entidadData.direccion,
        ciudad: entidadData.ciudad,
        departamento: entidadData.departamento,
        telefono: entidadData.telefono,
        email: entidadData.email,
        tipoPersona: 'JURIDICA',
        razonSocial: entidadData.razonSocial,
        nombreContacto: entidadData.nombreContacto,
        cargoContacto: entidadData.cargoContacto
      };
    }

    // Combinar todos los datos
    const facturaCompleta = {
      ...facturaPreview,
      tipoDestinatario,
      cliente: destinatarioData,
      formaPago: datosFactura.formaPago,
      medioPago: datosFactura.medioPago,
      observaciones: datosFactura.observaciones,
      enviarADianAutomaticamente: datosFactura.enviarADianAutomaticamente
    };

    onSave(facturaCompleta);
  };

  /**
   * Actualizar campo de cliente
   */
  const updateClienteField = (field, value) => {
    setClienteData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo si existe
    if (errores[field]) {
      setErrores(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Actualizar campo de entidad
   */
  const updateEntidadField = (field, value) => {
    setEntidadData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo si existe
    const errorKey = field + 'Entidad';
    if (errores[errorKey] || errores[field]) {
      setErrores(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!facturaPreview) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Crear Factura - Información DIAN"
      size="xl"
      styles={{
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1F2937'
        }
      }}
    >
      <Stack gap="md">
        {/* Alerta informativa */}
        <Alert icon={<IconAlertCircle size={18} />} color="blue" variant="light">
          Complete la información del cliente requerida por la DIAN para facturación electrónica
        </Alert>

        {/* Tabs */}
        <Tabs defaultValue="cliente" variant="outline">
          
          {/* Lista de tabs */}
          <Tabs.List>
            <Tabs.Tab value="cliente" leftSection={<IconUser size={18} />}>
              Datos del Cliente
            </Tabs.Tab>
            <Tabs.Tab value="factura" leftSection={<IconFileInvoice size={18} />}>
              Datos de Factura
            </Tabs.Tab>
            <Tabs.Tab value="resumen" leftSection={<IconReceipt size={18} />}>
              Resumen
            </Tabs.Tab>
          </Tabs.List>

          {/* Panel: Datos del Cliente */}
          <Tabs.Panel value="cliente" pt="md">
            <Stack gap="md">
              {/* Selector de tipo de destinatario */}
              <Paper p="md" withBorder style={{ backgroundColor: '#F0F9FF' }}>
                <Select
                  label="¿A quién va dirigida la factura?"
                  description="Seleccione si la factura es para el paciente o para una entidad (EPS, aseguradora, empresa, etc.)"
                  value={tipoDestinatario}
                  onChange={(value) => {
                    setTipoDestinatario(value);
                    setErrores({}); // Limpiar errores al cambiar
                  }}
                  data={[
                    { value: 'PACIENTE', label: '👤 Paciente (Persona Natural)' },
                    { value: 'ENTIDAD', label: '🏢 Entidad (Persona Jurídica - EPS, Aseguradora, Empresa)' }
                  ]}
                  size="md"
                  required
                />
              </Paper>

              {/* Formulario para PACIENTE */}
              {tipoDestinatario === 'PACIENTE' && (
                <Paper p="md" withBorder>
                  <Text size="sm" fw={600} mb="md">
                    Información del Paciente (Persona Natural)
                  </Text>
                  
                  <Stack gap="sm">
                    <TextInput
                      label="Nombre Completo"
                      placeholder="Nombre completo del paciente"
                      value={clienteData.nombreCompleto}
                      onChange={(e) => updateClienteField('nombreCompleto', e.target.value)}
                      error={errores.nombreCompleto}
                      required
                    />

                    <Group grow>
                      <Select
                        label="Tipo de Documento"
                        value={clienteData.tipoDocumento}
                        onChange={(value) => updateClienteField('tipoDocumento', value)}
                        data={[
                          { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
                          { value: 'CE', label: 'Cédula de Extranjería (CE)' },
                          { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
                          { value: 'PA', label: 'Pasaporte (PA)' },
                          { value: 'RC', label: 'Registro Civil (RC)' }
                        ]}
                        required
                      />
                      <TextInput
                        label="Número de Documento"
                        placeholder="Ej: 1234567890"
                        value={clienteData.numeroDocumento}
                        onChange={(e) => updateClienteField('numeroDocumento', e.target.value)}
                        error={errores.numeroDocumento}
                        required
                      />
                    </Group>

                    <TextInput
                      label="Dirección"
                      placeholder="Dirección completa del paciente"
                      value={clienteData.direccion}
                      onChange={(e) => updateClienteField('direccion', e.target.value)}
                      error={errores.direccion}
                      required
                    />

                    <Group grow>
                      <TextInput
                        label="Ciudad"
                        placeholder="Ej: Bogotá"
                        value={clienteData.ciudad}
                        onChange={(e) => updateClienteField('ciudad', e.target.value)}
                        error={errores.ciudad}
                        required
                      />
                      <TextInput
                        label="Departamento"
                        placeholder="Ej: Cundinamarca"
                        value={clienteData.departamento}
                        onChange={(e) => updateClienteField('departamento', e.target.value)}
                      />
                    </Group>

                    <Group grow>
                      <TextInput
                        label="Teléfono"
                        placeholder="Ej: 3001234567"
                        value={clienteData.telefono}
                        onChange={(e) => updateClienteField('telefono', e.target.value)}
                        error={errores.telefono}
                        required
                      />
                      <TextInput
                        label="Email"
                        placeholder="correo@ejemplo.com"
                        value={clienteData.email}
                        onChange={(e) => updateClienteField('email', e.target.value)}
                        error={errores.email}
                      />
                    </Group>
                  </Stack>
                </Paper>
              )}

              {/* Formulario para ENTIDAD */}
              {tipoDestinatario === 'ENTIDAD' && (
                <Paper p="md" withBorder>
                  <Text size="sm" fw={600} mb="md">
                    Información de la Entidad (Persona Jurídica)
                  </Text>
                  
                  <Stack gap="sm">
                    <TextInput
                      label="Razón Social"
                      placeholder="Nombre legal de la entidad"
                      value={entidadData.razonSocial}
                      onChange={(e) => updateEntidadField('razonSocial', e.target.value)}
                      error={errores.razonSocial}
                      required
                    />

                    <Group grow>
                      <TextInput
                        label="NIT"
                        placeholder="Ej: 900123456"
                        value={entidadData.nit}
                        onChange={(e) => updateEntidadField('nit', e.target.value)}
                        error={errores.nit}
                        required
                      />
                      <TextInput
                        label="Dígito de Verificación"
                        placeholder="Ej: 7"
                        value={entidadData.digitoVerificacion}
                        onChange={(e) => updateEntidadField('digitoVerificacion', e.target.value)}
                        maxLength={1}
                      />
                    </Group>

                    <TextInput
                      label="Dirección"
                      placeholder="Dirección completa de la entidad"
                      value={entidadData.direccion}
                      onChange={(e) => updateEntidadField('direccion', e.target.value)}
                      error={errores.direccionEntidad}
                      required
                    />

                    <Group grow>
                      <TextInput
                        label="Ciudad"
                        placeholder="Ej: Bogotá"
                        value={entidadData.ciudad}
                        onChange={(e) => updateEntidadField('ciudad', e.target.value)}
                        error={errores.ciudadEntidad}
                        required
                      />
                      <TextInput
                        label="Departamento"
                        placeholder="Ej: Cundinamarca"
                        value={entidadData.departamento}
                        onChange={(e) => updateEntidadField('departamento', e.target.value)}
                      />
                    </Group>

                    <Group grow>
                      <TextInput
                        label="Teléfono"
                        placeholder="Ej: 6012345678"
                        value={entidadData.telefono}
                        onChange={(e) => updateEntidadField('telefono', e.target.value)}
                        error={errores.telefonoEntidad}
                        required
                      />
                      <TextInput
                        label="Email"
                        placeholder="contacto@entidad.com"
                        value={entidadData.email}
                        onChange={(e) => updateEntidadField('email', e.target.value)}
                        error={errores.emailEntidad}
                      />
                    </Group>

                    <Divider label="Información de Contacto (Opcional)" labelPosition="center" my="sm" />

                    <Group grow>
                      <TextInput
                        label="Nombre del Contacto"
                        placeholder="Persona responsable"
                        value={entidadData.nombreContacto}
                        onChange={(e) => updateEntidadField('nombreContacto', e.target.value)}
                      />
                      <TextInput
                        label="Cargo del Contacto"
                        placeholder="Ej: Jefe de Facturación"
                        value={entidadData.cargoContacto}
                        onChange={(e) => updateEntidadField('cargoContacto', e.target.value)}
                      />
                    </Group>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Panel: Datos de Factura */}
          <Tabs.Panel value="factura" pt="md">
            <Stack gap="md">
              <Paper p="md" withBorder>
                <Text size="sm" fw={600} mb="md">
                  Información de Pago
                </Text>
                
                <Stack gap="sm">
                  <Select
                    label="Forma de Pago"
                    value={datosFactura.formaPago}
                    onChange={(value) => setDatosFactura(prev => ({ ...prev, formaPago: value }))}
                    data={[
                      { value: 'CONTADO', label: 'Contado' },
                      { value: 'CREDITO', label: 'Crédito' }
                    ]}
                    required
                  />

                  <Select
                    label="Medio de Pago"
                    value={datosFactura.medioPago}
                    onChange={(value) => setDatosFactura(prev => ({ ...prev, medioPago: value }))}
                    data={[
                      { value: 'EFECTIVO', label: 'Efectivo' },
                      { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
                      { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito' },
                      { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' },
                      { value: 'CHEQUE', label: 'Cheque' }
                    ]}
                    required
                  />

                  <Textarea
                    label="Observaciones"
                    placeholder="Notas adicionales sobre la factura (opcional)"
                    value={datosFactura.observaciones}
                    onChange={(e) => setDatosFactura(prev => ({ ...prev, observaciones: e.target.value }))}
                    minRows={3}
                  />
                </Stack>
              </Paper>

              <Paper p="md" withBorder>
                <Text size="sm" fw={600} mb="xs">
                  Datos de la Factura
                </Text>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Número:</Text>
                  <Text size="sm" fw={500}>{facturaPreview.numeroFactura}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Fecha de Emisión:</Text>
                  <Text size="sm" fw={500}>{formatDate(facturaPreview.fechaEmision)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Servicios:</Text>
                  <Badge>{facturaPreview.citas && Array.isArray(facturaPreview.citas) ? facturaPreview.citas.length : 0} servicio(s)</Badge>
                </Group>
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* Panel: Resumen */}
          <Tabs.Panel value="resumen" pt="md">
            <Stack gap="md">
              {/* Items */}
              <Paper p="md" withBorder>
                <Text size="sm" fw={600} mb="md">
                  Servicios Incluidos
                </Text>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Servicio</Table.Th>
                      <Table.Th>Código CUPS</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {facturaPreview.citas && Array.isArray(facturaPreview.citas) && facturaPreview.citas.map((cita, idx) => {
                      const valor = cita.valor || cita.codigoCups?.valor || 0;
                      const codigo = cita.codigoCups?.codigo || cita.codigoCups || 'N/A';
                      const descripcion = cita.procedimiento || cita.codigoCups?.descripcion || 'Servicio médico';
                      
                      return (
                        <Table.Tr key={idx}>
                          <Table.Td>
                            <Text size="sm">{descripcion}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">{codigo}</Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Text size="sm" fw={500}>{formatCurrency(valor)}</Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Paper>

              {/* Totales */}
              <Paper p="md" withBorder style={{ backgroundColor: '#F0FDF4' }}>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm">Subtotal:</Text>
                    <Text size="sm" fw={500}>{formatCurrency(totalesCalculados.subtotal)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">IVA ({totalesCalculados.ivaPercent}%):</Text>
                    <Text size="sm" fw={500}>{formatCurrency(totalesCalculados.iva)}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="lg" fw={700}>TOTAL:</Text>
                    <Text size="lg" fw={700} c="green">{formatCurrency(totalesCalculados.total)}</Text>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider />

        {/* Botones de acción */}
        <Group justify="space-between">
          <Button
            variant="light"
            color="gray"
            leftSection={<IconX size={18} />}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            color="green"
            leftSection={<IconCheck size={18} />}
            onClick={handleGuardar}
            loading={loading}
          >
            Guardar Factura
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default FacturaDianModal;
