/**
 * CrearFacturaElectronicaModal.jsx
 * 
 * Modal para crear facturas electrónicas con integración Siigo
 * Formulario completo con todos los campos requeridos por la DIAN
 * 
 * Capa: Presentación
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Divider,
  Text,
  Paper,
  Table,
  Badge,
  Alert,
  Checkbox,
  Grid,
  ActionIcon,
  Tooltip,
  SegmentedControl
} from '@mantine/core';
import {
  IconFileInvoice,
  IconCheck,
  IconX,
  IconTrash,
  IconAlertCircle,
  IconUser,
  IconBuilding,
  IconMail,
  IconPhone,
  IconMapPin
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { useContabilidad } from '../../../negocio/hooks/contabilidad/useContabilidad.js';
import { useBusquedaCliente } from '../../../negocio/hooks/facturacion/useBusquedaCliente.js';
import { formatCurrency, formatDate } from '../../../negocio/services/facturacionService';
import { facturacionElectronicaService } from '../../../negocio/services/contabilidadService.js';
import { extraerDatosCliente, prepararDatosInicialCliente } from '../../../negocio/services/clienteFacturacionMappers.js';
import ClienteFacturacionForm from './ClienteFacturacionForm';
import { BuscarClienteInput } from './BuscarClienteInput';
import { ClienteEncontradoAlert } from './ClienteEncontradoAlert';
import { DatosClienteSection } from './DatosClienteSection';

/**
 * Modal para crear factura electrónica completa
 */
export const CrearFacturaElectronicaModal = ({
  opened,
  onClose,
  citasSeleccionadas = [],
  onFacturaCreada,
  grupoBatch = null, // Información del grupo si es facturación batch
  clientesDisponibles = [], // Lista de clientes ya cargados
  onCrearCliente, // Función para crear cliente
  loadingClientes = false
}) => {
  const { catalogos, loadingCatalogos, cargarCatalogos } = useContabilidad();
  const {
    clienteEncontrado,
    buscandoCliente,
    modalNuevoCliente,
    buscarCliente,
    crearNuevoCliente,
    limpiarCliente,
    cerrarModalNuevoCliente,
    loading: loadingClientesHook
  } = useBusquedaCliente(clientesDisponibles, onCrearCliente, loadingClientes);

  // Estados del formulario - CLIENTE
  const [tipoDestinatario, setTipoDestinatario] = useState('PACIENTE');
  const [tipoDocumento, setTipoDocumento] = useState('13');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [digitoVerificacion, setDigitoVerificacion] = useState('');
  
  // Para PACIENTE
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  
  // Para ENTIDAD
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [cargoContacto, setCargoContacto] = useState('');
  
  // Contacto común
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [departamento, setDepartamento] = useState('');
  
  // Estados del formulario - FACTURA
  const [formaPago, setFormaPago] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [facturaElectronica, setFacturaElectronica] = useState(true);
  
  // Estados de servicios
  const [servicios, setServicios] = useState([]);
  
  // Estados de cálculo
  const [subtotal, setSubtotal] = useState(0);
  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Cargar catálogos al abrir
  useEffect(() => {
    if (opened && (!catalogos || Object.keys(catalogos).length === 0)) {
      cargarCatalogos();
    }
  }, [opened, catalogos, cargarCatalogos]);

  // Cambiar tipo de documento cuando cambia el tipo de destinatario
  useEffect(() => {
    if (tipoDestinatario === 'ENTIDAD') {
      setTipoDocumento('31'); // NIT para entidades
    } else if (tipoDestinatario === 'PACIENTE') {
      setTipoDocumento('13'); // Cédula para pacientes
    }
  }, [tipoDestinatario]);

  // Inicializar servicios desde citas seleccionadas
  useEffect(() => {
    if (citasSeleccionadas && citasSeleccionadas.length > 0) {
      const serviciosIniciales = citasSeleccionadas.map((cita, index) => ({
        id: `servicio-${index}`,
        citaId: cita.id,
        codigoCups: cita.codigoCups,
        descripcion: cita.nombreProcedimiento,
        paciente: cita.nombrePaciente,
        medico: cita.nombreMedico,
        fechaAtencion: cita.fechaAtencion,
        cantidad: 1,
        valorUnitario: cita.valorCita || 0,
        descuento: 0,
        valorTotal: cita.valorCita || 0
      }));
      setServicios(serviciosIniciales);
      
      // Auto-llenar datos del primer paciente si es un solo paciente
      if (citasSeleccionadas.length > 0) {
        const primeraCita = citasSeleccionadas[0];
        setNumeroDocumento(primeraCita.documentoPaciente || '');
        const nombreCompleto = primeraCita.nombrePaciente || '';
        const partesNombre = nombreCompleto.split(' ');
        if (partesNombre.length >= 2) {
          setNombres(partesNombre.slice(0, Math.ceil(partesNombre.length / 2)).join(' '));
          setApellidos(partesNombre.slice(Math.ceil(partesNombre.length / 2)).join(' '));
        } else {
          setNombres(nombreCompleto);
        }
      }
    }
  }, [citasSeleccionadas]);

  // Calcular totales cuando cambian los servicios
  useEffect(() => {
    const sub = servicios.reduce((sum, s) => sum + (s.cantidad * s.valorUnitario), 0);
    const desc = servicios.reduce((sum, s) => sum + s.descuento, 0);
    setSubtotal(sub);
    setDescuentoTotal(desc);
    setTotal(sub - desc);
  }, [servicios]);

  /**
   * Actualizar valor de un servicio
   */
  const actualizarServicio = (id, campo, valor) => {
    setServicios(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [campo]: valor };
        // Recalcular total del servicio
        updated.valorTotal = (updated.cantidad * updated.valorUnitario) - updated.descuento;
        return updated;
      }
      return s;
    }));
  };

  /**
   * Eliminar un servicio
   */
  const eliminarServicio = (id) => {
    setServicios(prev => prev.filter(s => s.id !== id));
  };

  // Auto-fill cuando se encuentra un cliente
  useEffect(() => {
    if (clienteEncontrado) {
      const datos = extraerDatosCliente(clienteEncontrado);
      if (datos) {
        setTipoDestinatario(datos.tipoDestinatario);
        setTipoDocumento(datos.tipoDocumento);
        setNombres(datos.nombres);
        setApellidos(datos.apellidos);
        setRazonSocial(datos.razonSocial);
        setNombreContacto(datos.nombreContacto);
        setCargoContacto(datos.cargoContacto);
        setEmail(datos.email);
        setTelefono(datos.telefono);
        setDireccion(datos.direccion);
        setCiudad(datos.ciudad);
        setDepartamento(datos.departamento);
        setDigitoVerificacion(datos.digitoVerificacion);
      }
    }
  }, [clienteEncontrado]);

  /**
   * Validar formulario
   */
  const validarFormulario = () => {
    const errores = [];

    // Validar cliente
    if (!numeroDocumento.trim()) {
      errores.push('El número de documento es requerido');
    }

    if (tipoDestinatario === 'PACIENTE') {
      if (!nombres.trim()) errores.push('Los nombres son requeridos');
      if (!apellidos.trim()) errores.push('Los apellidos son requeridos');
    } else {
      if (!razonSocial.trim()) errores.push('La razón social es requerida');
    }

    if (!email.trim()) {
      errores.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errores.push('El email no es válido');
    }

    // Validar factura
    if (!formaPago) errores.push('La forma de pago es requerida');
    
    if (servicios.length === 0) {
      errores.push('Debe incluir al menos un servicio');
    }

    if (total <= 0) {
      errores.push('El total de la factura debe ser mayor a cero');
    }

    return errores;
  };

  /**
   * Crear factura
   */
  const handleCrearFactura = async () => {
    const errores = validarFormulario();
    
    if (errores.length > 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        html: `<ul style="text-align: left;">${errores.map(e => `<li>${e}</li>`).join('')}</ul>`,
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    try {
      // Construir datos de la factura
      const facturaData = {
        // Tipo de destinatario
        tipoDestinatario,
        
        // Cliente
        cliente: {
          tipoDocumento,
          numeroDocumento: numeroDocumento.trim(),
          digitoVerificacion: tipoDocumento === '31' ? digitoVerificacion : undefined,
          // Para ENTIDAD
          razonSocial: tipoDestinatario === 'ENTIDAD' ? razonSocial.trim() : undefined,
          nombreContacto: tipoDestinatario === 'ENTIDAD' ? nombreContacto.trim() : undefined,
          cargoContacto: tipoDestinatario === 'ENTIDAD' ? cargoContacto.trim() : undefined,
          // Para PACIENTE
          nombres: tipoDestinatario === 'PACIENTE' ? nombres.trim() : undefined,
          apellidos: tipoDestinatario === 'PACIENTE' ? apellidos.trim() : undefined,
          nombreCompleto: tipoDestinatario === 'PACIENTE' ? `${nombres.trim()} ${apellidos.trim()}` : razonSocial.trim(),
          // Contacto
          email: email.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          departamento: departamento.trim()
        },
        
        // Factura
        numeroFactura: `FE-${Date.now()}`,
        fecha: new Date().toISOString(),
        fechaEmision: new Date().toISOString(),
        formaPago,
        observaciones: observaciones.trim(),
        enviarEmail,
        facturaElectronica,
        
        // Servicios
        servicios: servicios.map(s => ({
          citaId: s.citaId,
          codigoCups: s.codigoCups,
          descripcion: s.descripcion,
          paciente: s.paciente,
          medico: s.medico,
          fechaAtencion: s.fechaAtencion,
          cantidad: s.cantidad,
          valorUnitario: s.valorUnitario,
          descuento: s.descuento,
          valorTotal: s.valorTotal
        })),
        
        // Totales
        subtotal,
        descuentoTotal,
        total,
        
        // Estado
        estado: 'PENDIENTE',
        estadoDian: 'PENDIENTE'
      };

      // Guardar primero en la base de datos local
      if (onFacturaCreada) {
        await onFacturaCreada(facturaData);
      }

      // Si está marcada como factura electrónica, enviar a Siigo automáticamente
      if (facturaElectronica) {
        try {
          const result = await Swal.fire({
            title: '¿Enviar a Siigo ahora?',
            html: `
              <p>La factura se ha guardado en el sistema.</p>
              <p>¿Deseas enviarla a Siigo y generar el CUFE de DIAN ahora?</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, enviar a Siigo',
            cancelButtonText: 'No, enviar después'
          });

          if (result.isConfirmed) {
            // Mostrar loading
            Swal.fire({
              title: 'Enviando a Siigo...',
              html: 'Por favor espera mientras se procesa la factura electrónica',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });

            // Enviar a Siigo
            const facturasSiigo = await facturacionElectronicaService.enviarFacturasSiigo([facturaData]);
            
            if (facturasSiigo.exitosas && facturasSiigo.exitosas.length > 0) {
              await Swal.fire({
                icon: 'success',
                title: '¡Factura Electrónica Creada!',
                html: `
                  <p><strong>Factura guardada y enviada a Siigo exitosamente</strong></p>
                  <p>Número Siigo: <strong>${facturasSiigo.exitosas[0].numeroSiigo || 'Pendiente'}</strong></p>
                  <p>Estado DIAN: <strong>${facturasSiigo.exitosas[0].estadoDian || 'Procesando'}</strong></p>
                  ${facturasSiigo.exitosas[0].cufe ? `<p style="font-size: 11px; margin-top: 10px;">CUFE: <code>${facturasSiigo.exitosas[0].cufe}</code></p>` : ''}
                `,
                confirmButtonColor: '#10B981'
              });
            } else if (facturasSiigo.fallidas && facturasSiigo.fallidas.length > 0) {
              throw new Error(facturasSiigo.fallidas[0].error || 'Error al enviar a Siigo');
            }
          } else {
            // Usuario eligió no enviar ahora
            await Swal.fire({
              icon: 'info',
              title: 'Factura Guardada',
              text: 'La factura se guardó correctamente. Podrás enviarla a Siigo desde el panel de facturación.',
              confirmButtonColor: '#3B82F6',
              timer: 3000
            });
          }
        } catch (siigoError) {
          console.error('Error enviando a Siigo:', siigoError);
          await Swal.fire({
            icon: 'warning',
            title: 'Factura guardada, pero no se pudo enviar a Siigo',
            html: `
              <p>La factura se guardó en el sistema local correctamente.</p>
              <p><strong>Error al enviar a Siigo:</strong> ${siigoError.message}</p>
              <p>Puedes reintentarlo desde el panel de facturación.</p>
            `,
            confirmButtonColor: '#F59E0B'
          });
        }
      } else {
        // Factura manual (no electrónica)
        await Swal.fire({
          icon: 'success',
          title: 'Factura Creada',
          text: 'La factura manual se ha creado exitosamente',
          confirmButtonColor: '#10B981',
          timer: 2000
        });
      }

      // Cerrar modal
      handleClose();

    } catch (error) {
      console.error('Error creando factura:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear la factura',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Cerrar modal y limpiar
   */
  const handleClose = () => {
    // Limpiar formulario
    setTipoDestinatario('PACIENTE');
    setTipoDocumento('13');
    setNumeroDocumento('');
    setDigitoVerificacion('');
    setNombres('');
    setApellidos('');
    setRazonSocial('');
    setNombreContacto('');
    setCargoContacto('');
    setEmail('');
    setTelefono('');
    setDireccion('');
    setCiudad('');
    setDepartamento('');
    setFormaPago('');
    setObservaciones('');
    setEnviarEmail(true);
    setFacturaElectronica(true);
    setServicios([]);
    limpiarCliente();
    
    onClose();
  };

  // Opciones de tipos de documento según destinatario
  const tiposDocumento = tipoDestinatario === 'ENTIDAD' 
    ? [
        { value: '31', label: 'NIT' },
        { value: '50', label: 'NIT de otro país' }
      ]
    : [
        { value: '13', label: 'Cédula de ciudadanía' },
        { value: '22', label: 'Cédula de extranjería' },
        { value: '12', label: 'Tarjeta de identidad' },
        { value: '41', label: 'Pasaporte' },
        { value: '11', label: 'Registro civil' },
        { value: '21', label: 'Tarjeta de extranjería' },
        { value: '42', label: 'Documento de identificación extranjero' }
      ];

  // Opciones de formas de pago
  const formasPago = [
    { value: '1', label: 'Contado' },
    { value: '2', label: 'Crédito' },
    { value: '10', label: 'Efectivo' },
    { value: '20', label: 'Tarjeta débito' },
    { value: '30', label: 'Tarjeta crédito' },
    { value: '40', label: 'Transferencia bancaria' },
    { value: '50', label: 'Cheque' }
  ];

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Group>
            <IconFileInvoice size={24} />
            <Text size="lg" fw={600}>Crear Factura</Text>
            {facturaElectronica && <Badge color="green" variant="light">Electrónica</Badge>}
          </Group>
        }
        size="xl"
        centered
        closeOnClickOutside={false}
      >
      <Stack gap="md">
        {/* Alerta informativa */}
        <Alert icon={<IconAlertCircle size={18} />} color={facturaElectronica ? 'blue' : 'gray'} variant="light">
          <Text size="sm">
            {facturaElectronica 
              ? 'Complete todos los campos requeridos. Esta factura se guardará y opcionalmente se enviará a Siigo para facturación electrónica DIAN.'
              : 'Creando factura manual (sin envío a DIAN). Complete los campos requeridos.'}
          </Text>
        </Alert>

        {/* Alerta de batch si aplica */}
        {grupoBatch && (
          <Alert icon={<IconFileInvoice size={18} />} color="green" variant="light">
            <Text size="sm" fw={500}>
              Facturación Agrupada: {grupoBatch.index + 1} de {grupoBatch.total}
            </Text>
            <Text size="xs" c="dimmed">
              {grupoBatch.resumen?.totalServicios || 0} servicio(s) • 
              {grupoBatch.resumen?.totalPacientes > 1 && ` ${grupoBatch.resumen.totalPacientes} paciente(s) • `}
              Total: {formatCurrency(grupoBatch.resumen?.totalValor || 0)}
            </Text>
          </Alert>
        )}

        {/* SECCI�"N 1: TIPO DE CLIENTE */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="md">Tipo de Cliente</Text>
          <Select
            label="Destinatario"
            data={[
              { value: 'PACIENTE', label: 'Paciente Particular' },
              { value: 'ENTIDAD', label: 'Entidad (EPS, ARL, Empresa)' }
            ]}
            value={tipoDestinatario}
            onChange={setTipoDestinatario}
            leftSection={tipoDestinatario === 'PACIENTE' ? <IconUser size={18} /> : <IconBuilding size={18} />}
            required
          />
        </Paper>

        {/* SECCI�"N 2: DATOS DEL CLIENTE */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="md">Datos del Cliente</Text>
          
          <Stack gap="sm">
            {/* Documento */}
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Tipo de Documento"
                  placeholder="Seleccione el tipo"
                  data={tiposDocumento}
                  value={tipoDocumento}
                  onChange={setTipoDocumento}
                  searchable
                  clearable={false}
                  withAsterisk
                  description={tipoDestinatario === 'ENTIDAD' ? 'Use NIT para empresas' : 'Use CC para personas naturales'}
                />
              </Grid.Col>
              <Grid.Col span={tipoDocumento === '31' ? 4 : 6}>
                <BuscarClienteInput
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  onBuscar={() => buscarCliente(numeroDocumento)}
                  buscando={buscandoCliente}
                  placeholder={tipoDocumento === '31' ? 'Ej: 900123456' : 'Ej: 1234567890'}
                  label="Número de Documento"
                  required
                />
              </Grid.Col>
              {tipoDocumento === '31' && (
                <Grid.Col span={2}>
                  <TextInput
                    label="DV"
                    placeholder="0-9"
                    value={digitoVerificacion}
                    onChange={(e) => setDigitoVerificacion(e.target.value)}
                    maxLength={1}
                    description="Dígito de verificación"
                  />
                </Grid.Col>
              )}
            </Grid>

            {/* Alerta de cliente encontrado */}
            <ClienteEncontradoAlert
              cliente={clienteEncontrado}
              onLimpiar={() => {
                limpiarCliente();
                setNombres('');
                setApellidos('');
                setRazonSocial('');
                setNombreContacto('');
                setCargoContacto('');
                setEmail('');
                setTelefono('');
                setDireccion('');
                setCiudad('');
                setDepartamento('');
                setDigitoVerificacion('');
              }}
            />

            {/* Campos según tipo */}
            <DatosClienteSection
              tipoDestinatario={tipoDestinatario}
              nombres={nombres}
              apellidos={apellidos}
              onNombresChange={(e) => setNombres(e.target.value)}
              onApellidosChange={(e) => setApellidos(e.target.value)}
              razonSocial={razonSocial}
              nombreContacto={nombreContacto}
              cargoContacto={cargoContacto}
              onRazonSocialChange={(e) => setRazonSocial(e.target.value)}
              onNombreContactoChange={(e) => setNombreContacto(e.target.value)}
              onCargoContactoChange={(e) => setCargoContacto(e.target.value)}
            />

            {/* Contacto */}
            <Divider label="Información de Contacto" />
            
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftSection={<IconMail size={18} />}
                  type="email"
                  required
                  styles={{ input: { paddingLeft: '40px' } }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Teléfono"
                  placeholder="3001234567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  leftSection={<IconPhone size={18} />}
                  styles={{ input: { paddingLeft: '40px' } }}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Dirección"
              placeholder="Dirección completa"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              leftSection={<IconMapPin size={18} />}
              styles={{ input: { paddingLeft: '40px' } }}
            />

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Ciudad"
                  placeholder="Ciudad"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Departamento"
                  placeholder="Departamento"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>

        {/* SECCI�"N 3: SERVICIOS */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="md">Servicios Facturados</Text>
          
          <div style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover fontSize="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: '100px' }}>Código CUPS</Table.Th>
                  <Table.Th>Descripción</Table.Th>
                  <Table.Th style={{ width: '80px' }}>Cant.</Table.Th>
                  <Table.Th style={{ width: '120px' }}>Valor Unit.</Table.Th>
                  <Table.Th style={{ width: '120px' }}>Descuento</Table.Th>
                  <Table.Th style={{ width: '120px' }}>Total</Table.Th>
                  <Table.Th style={{ width: '50px' }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {servicios.map(servicio => (
                  <Table.Tr key={servicio.id}>
                    <Table.Td>
                      <Text size="xs" style={{ fontFamily: 'monospace' }}>{servicio.codigoCups}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" lineClamp={2}>{servicio.descripcion}</Text>
                      <Text size="xs" c="dimmed">{servicio.paciente}</Text>
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={servicio.cantidad}
                        onChange={(val) => actualizarServicio(servicio.id, 'cantidad', val || 1)}
                        min={1}
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={servicio.valorUnitario}
                        onChange={(val) => actualizarServicio(servicio.id, 'valorUnitario', val || 0)}
                        min={0}
                        prefix="$"
                        thousandSeparator=","
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={servicio.descuento}
                        onChange={(val) => actualizarServicio(servicio.id, 'descuento', val || 0)}
                        min={0}
                        prefix="$"
                        thousandSeparator=","
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={600} c="green">
                        {formatCurrency(servicio.valorTotal)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="Eliminar">
                        <ActionIcon
                          color="red"
                          variant="light"
                          size="sm"
                          onClick={() => eliminarServicio(servicio.id)}
                          disabled={servicios.length === 1}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>

          {/* Resumen de totales */}
          <Paper p="md" mt="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Subtotal:</Text>
                <Text size="sm" fw={500}>{formatCurrency(subtotal)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Descuentos:</Text>
                <Text size="sm" fw={500} c="red">-{formatCurrency(descuentoTotal)}</Text>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text size="lg" fw={700}>TOTAL:</Text>
                <Text size="lg" fw={700} c="green">{formatCurrency(total)}</Text>
              </Group>
            </Stack>
          </Paper>
        </Paper>

        {/* SECCI�"N 4: DATOS DE FACTURACI�"N */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="md">Datos de Facturación</Text>
          
          <Stack gap="sm">
            <Select
              label="Forma de Pago"
              placeholder="Seleccione la forma de pago"
              data={formasPago}
              value={formaPago}
              onChange={setFormaPago}
              searchable
              clearable={false}
              withAsterisk
            />

            <Textarea
              label="Observaciones"
              placeholder="Información adicional (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              minRows={3}
            />

            <Divider label="Opciones de Envío" />

            <Stack gap="xs">
              <Checkbox
                label={
                  <div>
                    <Text size="sm" fw={500}>Factura Electrónica (Siigo + DIAN)</Text>
                    <Text size="xs" c="dimmed">
                      {facturaElectronica 
                        ? '�" Se enviará automáticamente a Siigo para obtener el CUFE de DIAN' 
                        : 'Solo se guardará en el sistema local (sin CUFE)'}
                    </Text>
                  </div>
                }
                checked={facturaElectronica}
                onChange={(e) => setFacturaElectronica(e.target.checked)}
              />
              <Checkbox
                label="Enviar copia al email del cliente"
                checked={enviarEmail}
                onChange={(e) => setEnviarEmail(e.target.checked)}
                disabled={!email}
                description={!email ? 'Debe ingresar un email para el cliente' : null}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Botones de acción */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            color="gray"
            leftSection={<IconX size={18} />}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            color="green"
            leftSection={<IconCheck size={18} />}
            onClick={handleCrearFactura}
          >
            Crear Factura
          </Button>
        </Group>
      </Stack>
      </Modal>
      
      {/* Modal para crear nuevo cliente */}
      <ClienteFacturacionForm
        opened={modalNuevoCliente}
        onClose={cerrarModalNuevoCliente}
        onSubmit={crearNuevoCliente}
        clienteInicial={prepararDatosInicialCliente(tipoDocumento, numeroDocumento, tipoDestinatario)}
        loading={loadingClientesHook}
      />
    </>
  );
};

export default CrearFacturaElectronicaModal;
