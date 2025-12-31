/**
 * CrearNotaContableModal.jsx
 * 
 * Modal para crear notas crédito o débito sobre facturas existentes
 * Permite seleccionar servicios, motivos DIAN y calcular totales
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
  Textarea,
  Divider,
  Text,
  Paper,
  Table,
  Badge,
  Alert,
  Checkbox,
  NumberInput,
  SegmentedControl,
  Card
} from '@mantine/core';
import {
  IconFileInvoice,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconMinus,
  IconPlus,
  IconInfoCircle
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { notasContabilidadService } from '../../../negocio/services/contabilidadService';
import { MOTIVOS_CREDITO_DIAN, MOTIVOS_DEBITO_DIAN } from '../../../negocio/services/notasContablesService';
import { formatCurrency, formatDate } from '../../../negocio/services/facturacionService';

/**
 * Modal para crear notas contables
 */
export const CrearNotaContableModal = ({
  opened,
  onClose,
  factura,
  onNotaCreada
}) => {
  // Estados del formulario
  const [tipoNota, setTipoNota] = useState('CREDITO'); // CREDITO o DEBITO
  const [motivoDian, setMotivoDian] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estados de servicios (para notas crédito)
  const [servicios, setServicios] = useState([]);
  const [serviciosAjustados, setServiciosAjustados] = useState({}); // { servicioId: { cantidad, valorUnitario, valorTotal } }
  
  // Estados de conceptos (para notas débito)
  const [conceptos, setConceptos] = useState([
    { codigo: '', descripcion: '', valor: 0 }
  ]);
  
  // Estados de cálculo
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [loading, setLoading] = useState(false);

  // Cargar servicios de la factura
  useEffect(() => {
    if (opened && factura) {
      try {
        const facturaData = JSON.parse(factura.jsonData || '{}');
        
        // ⚠️ VALIDACI�"N: Verificar que la factura esté sincronizada con Siigo
        if (!facturaData.siigoId) {
          Swal.fire({
            icon: 'warning',
            title: 'Factura No Sincronizada',
            html: `
              <p>Esta factura no está sincronizada con Siigo.</p>
              <p style="margin-top: 10px; font-weight: bold; color: #F59E0B;">
                Para crear notas contables, primero debe enviar la factura a DIAN.
              </p>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#F59E0B'
          }).then(() => {
            onClose();
          });
          return;
        }
        
        const serviciosFactura = facturaData.servicios || facturaData.citas || [];
        
        // Formatear servicios para la tabla
        const serviciosFormateados = serviciosFactura.map((servicio, index) => ({
          id: servicio.citaId || servicio.id || index,
          codigoCups: servicio.codigoCups || 'N/A',
          descripcion: servicio.descripcion || servicio.procedimiento || 'Servicio',
          paciente: servicio.paciente || 'N/A',
          cantidad: servicio.cantidad || 1,
          valorUnitario: servicio.valorUnitario || servicio.valorTotal || servicio.valor || 0,
          valorTotal: servicio.valorTotal || servicio.valorUnitario || servicio.valor || 0
        }));
        
        setServicios(serviciosFormateados);
      } catch (error) {
        console.error('Error parsing factura data:', error);
      }
    }
  }, [opened, factura]);

  // Calcular totales cuando cambian las selecciones
  useEffect(() => {
    if (tipoNota === 'CREDITO') {
      // Sumar servicios ajustados
      const sub = Object.values(serviciosAjustados).reduce((sum, s) => sum + (s.valorTotal || 0), 0);
      setSubtotal(sub);
      setTotal(sub);
    } else {
      // Sumar conceptos de nota débito
      const sub = conceptos.reduce((sum, c) => sum + (c.valor || 0), 0);
      setSubtotal(sub);
      setTotal(sub);
    }
  }, [serviciosAjustados, conceptos, tipoNota]);

  /**
   * Actualizar servicio ajustado (cantidad o valor)
   */
  const handleActualizarServicio = (servicioId, campo, valor) => {
    setServiciosAjustados(prev => {
      const servicio = servicios.find(s => s.id === servicioId);
      if (!servicio) return prev;

      const current = prev[servicioId] || {
        cantidad: 0,
        valorUnitario: servicio.valorUnitario,
        valorTotal: 0
      };

      let updated = { ...current };

      if (campo === 'cantidad') {
        const cantidad = Math.max(0, Math.min(valor, servicio.cantidad)); // No puede exceder cantidad original
        updated.cantidad = cantidad;
        updated.valorTotal = cantidad * updated.valorUnitario;
      } else if (campo === 'valorUnitario') {
        updated.valorUnitario = Math.max(0, valor);
        updated.valorTotal = updated.cantidad * valor;
      }

      // Si cantidad es 0, eliminar el servicio de los ajustados
      if (updated.cantidad === 0) {
        const newState = { ...prev };
        delete newState[servicioId];
        return newState;
      }

      return { ...prev, [servicioId]: updated };
    });
  };

  /**
   * Agregar concepto (para nota débito)
   */
  const handleAgregarConcepto = () => {
    setConceptos(prev => [
      ...prev,
      { codigo: '', descripcion: '', valor: 0 }
    ]);
  };

  /**
   * Eliminar concepto
   */
  const handleEliminarConcepto = (index) => {
    setConceptos(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Actualizar concepto
   */
  const handleActualizarConcepto = (index, campo, valor) => {
    setConceptos(prev => prev.map((c, i) => 
      i === index ? { ...c, [campo]: valor } : c
    ));
  };

  /**
   * Validar formulario
   */
  const validarFormulario = () => {
    const errores = [];

    if (!motivoDian) {
      errores.push('Debe seleccionar un motivo DIAN');
    }

    if (!motivo || motivo.trim() === '') {
      errores.push('Debe ingresar una descripción del motivo');
    }

    if (tipoNota === 'CREDITO') {
      if (Object.keys(serviciosAjustados).length === 0) {
        errores.push('Debe ajustar al menos un servicio con cantidad mayor a 0');
      }
    } else {
      if (conceptos.length === 0 || conceptos.every(c => !c.descripcion)) {
        errores.push('Debe agregar al menos un concepto');
      }
    }

    if (total <= 0) {
      errores.push('El total debe ser mayor a cero');
    }

    return errores;
  };

  /**
   * Crear nota
   */
  const handleCrearNota = async () => {
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
      setLoading(true);

      // Preparar datos de la nota
      const notaData = {
        motivoDian,
        motivo: motivo.trim(),
        observaciones: observaciones.trim(),
        subtotal,
        total
      };

      if (tipoNota === 'CREDITO') {
        // Servicios ajustados
        notaData.serviciosAfectados = Object.entries(serviciosAjustados).map(([servicioId, ajuste]) => {
          const servicio = servicios.find(s => s.id === parseInt(servicioId));
          return {
            codigoCups: servicio.codigoCups,
            descripcion: servicio.descripcion,
            cantidad: ajuste.cantidad,
            valorUnitario: ajuste.valorUnitario,
            valorNota: ajuste.valorTotal
          };
        });

        // Usar servicio unificado de contabilidad
        await notasContabilidadService.crearNotaCredito(notaData, factura);

        await Swal.fire({
          icon: 'success',
          title: '¡Nota Crédito Creada!',
          html: `
            <p><strong>La nota crédito ha sido enviada exitosamente a:</strong></p>
            <ul style="text-align: left; margin: 15px 0;">
              <li>✅ Siigo (Sistema Contable)</li>
              <li>✅ DIAN (Validación electrónica)</li>
            </ul>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">
              El CUFE electrónico fue generado correctamente.
            </p>
          `,
          confirmButtonColor: '#10B981'
        });
      } else {
        // Conceptos de nota débito
        notaData.serviciosAfectados = conceptos.filter(c => c.descripcion).map(c => ({
          codigo: c.codigo || 'CONCEPTO',
          descripcion: c.descripcion,
          valor: c.valor
        }));

        // Usar servicio unificado de contabilidad
        await notasContabilidadService.crearNotaDebito(notaData, factura);

        await Swal.fire({
          icon: 'success',
          title: '¡Nota Débito Creada!',
          html: `
            <p><strong>La nota débito ha sido enviada exitosamente a:</strong></p>
            <ul style="text-align: left; margin: 15px 0;">
              <li>✅ Siigo (Sistema Contable)</li>
              <li>✅ DIAN (Validación electrónica)</li>
            </ul>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">
              El CUFE electrónico fue generado correctamente.
            </p>
          `,
          confirmButtonColor: '#10B981'
        });
      }

      handleClose();
      if (onNotaCreada) onNotaCreada();

    } catch (error) {
      console.error('Error creando nota:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear la nota contable',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar modal y limpiar
   */
  const handleClose = () => {
    setTipoNota('CREDITO');
    setMotivoDian('');
    setMotivo('');
    setObservaciones('');
    setServiciosAjustados({});
    setConceptos([{ codigo: '', descripcion: '', valor: 0 }]);
    onClose();
  };

  if (!factura) return null;

  const facturaData = JSON.parse(factura.jsonData || '{}');
  const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;
  const totalFactura = facturaData.total || 0;

  const motivosDisponibles = tipoNota === 'CREDITO' ? MOTIVOS_CREDITO_DIAN : MOTIVOS_DEBITO_DIAN;

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Group>
            <IconFileInvoice size={24} />
            <Text size="lg" fw={600}>
              Crear Nota {tipoNota === 'CREDITO' ? 'Crédito' : 'Débito'}
            </Text>
          </Group>
        }
        size="xl"
        centered
        closeOnClickOutside={false}
      >
        <Stack gap="md">
          {/* Información de la factura */}
          <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">Factura Original</Text>
                <Text size="sm" fw={600}>{numeroFactura}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Total Factura</Text>
                <Text size="sm" fw={600} c="blue">{formatCurrency(totalFactura)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Fecha</Text>
                <Text size="sm">{formatDate(facturaData.fechaEmision || facturaData.fecha)}</Text>
              </div>
            </Group>
          </Paper>

          {/* Selector de tipo de nota */}
          <SegmentedControl
            value={tipoNota}
            onChange={setTipoNota}
            fullWidth
            data={[
              {
                value: 'CREDITO',
                label: (
                  <Group gap="xs" justify="center">
                    <IconMinus size={16} />
                    <span>Nota Crédito</span>
                  </Group>
                )
              },
              {
                value: 'DEBITO',
                label: (
                  <Group gap="xs" justify="center">
                    <IconPlus size={16} />
                    <span>Nota Débito</span>
                  </Group>
                )
              }
            ]}
          />

          {/* Alerta informativa */}
          <Alert icon={<IconInfoCircle size={18} />} color={tipoNota === 'CREDITO' ? 'orange' : 'blue'} variant="light">
            <Text size="sm">
              {tipoNota === 'CREDITO' 
                ? '�"� Nota Crédito: Reduce el valor de la factura (devoluciones, descuentos, correcciones a la baja)'
                : '�"� Nota Débito: Aumenta el valor de la factura (cargos adicionales, intereses, correcciones al alza)'
              }
            </Text>
          </Alert>

          {/* Motivo DIAN */}
          <Select
            label="Motivo DIAN"
            placeholder="Seleccione el motivo"
            data={motivosDisponibles.map(m => ({
              value: m.value,
              label: m.label
            }))}
            value={motivoDian}
            onChange={setMotivoDian}
            withAsterisk
            description="Motivo requerido por la DIAN para la nota"
          />

          {/* Descripción del motivo */}
          <Textarea
            label="Descripción del Motivo"
            placeholder="Explique detalladamente el motivo de la nota..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            minRows={3}
            withAsterisk
          />

          {/* Servicios (para nota crédito) */}
          {tipoNota === 'CREDITO' && (
            <>
              <Divider label="Servicios a Devolver/Ajustar" />
              <Alert icon={<IconInfoCircle size={18} />} color="blue" variant="light" mb="sm">
                Ajuste la cantidad y/o valor unitario de los servicios a devolver. Solo se incluirán en la nota los servicios con cantidad mayor a 0.
              </Alert>
              <Paper withBorder>
                <Table striped highlightOnHover fontSize="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Código</Table.Th>
                      <Table.Th>Descripción</Table.Th>
                      <Table.Th>Paciente</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Cant. Original</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Cant. a Devolver</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Valor Unit.</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Total Nota</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {servicios.length > 0 ? (
                      servicios.map((servicio) => {
                        const ajuste = serviciosAjustados[servicio.id] || { 
                          cantidad: 0, 
                          valorUnitario: servicio.valorUnitario,
                          valorTotal: 0 
                        };
                        
                        return (
                          <Table.Tr key={servicio.id} style={{ backgroundColor: ajuste.cantidad > 0 ? '#f0fdf4' : 'transparent' }}>
                            <Table.Td>
                              <Text size="xs" style={{ fontFamily: 'monospace' }}>
                                {servicio.codigoCups}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs">{servicio.descripcion}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs">{servicio.paciente}</Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'center' }}>
                              <Badge size="sm" color="gray" variant="light">
                                {servicio.cantidad}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <NumberInput
                                size="xs"
                                min={0}
                                max={servicio.cantidad}
                                value={ajuste.cantidad}
                                onChange={(val) => handleActualizarServicio(servicio.id, 'cantidad', val)}
                                styles={{ input: { textAlign: 'center', width: '70px' } }}
                                hideControls={false}
                              />
                            </Table.Td>
                            <Table.Td>
                              <NumberInput
                                size="xs"
                                min={0}
                                value={ajuste.valorUnitario}
                                onChange={(val) => handleActualizarServicio(servicio.id, 'valorUnitario', val)}
                                prefix="$"
                                thousandSeparator=","
                                decimalSeparator="."
                                styles={{ input: { textAlign: 'right', width: '100px' } }}
                                hideControls
                              />
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                              <Text size="xs" fw={600} c={ajuste.cantidad > 0 ? "red" : "dimmed"}>
                                {formatCurrency(ajuste.valorTotal)}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                          <Text size="sm" c="dimmed">No hay servicios disponibles</Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Paper>
            </>
          )}

          {/* Conceptos (para nota débito) */}
          {tipoNota === 'DEBITO' && (
            <>
              <Divider label="Conceptos a Cobrar" />
              <Stack gap="sm">
                {conceptos.map((concepto, index) => (
                  <Card key={index} padding="sm" withBorder>
                    <Group gap="sm">
                      <TextInput
                        placeholder="Código"
                        value={concepto.codigo}
                        onChange={(e) => handleActualizarConcepto(index, 'codigo', e.target.value)}
                        style={{ width: '120px' }}
                      />
                      <TextInput
                        placeholder="Descripción del concepto"
                        value={concepto.descripcion}
                        onChange={(e) => handleActualizarConcepto(index, 'descripcion', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <NumberInput
                        placeholder="Valor"
                        value={concepto.valor}
                        onChange={(val) => handleActualizarConcepto(index, 'valor', val || 0)}
                        min={0}
                        prefix="$"
                        thousandSeparator=","
                        style={{ width: '150px' }}
                      />
                      {conceptos.length > 1 && (
                        <Button
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => handleEliminarConcepto(index)}
                        >
                          <IconX size={16} />
                        </Button>
                      )}
                    </Group>
                  </Card>
                ))}
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={handleAgregarConcepto}
                >
                  Agregar Concepto
                </Button>
              </Stack>
            </>
          )}

          {/* Observaciones */}
          <Textarea
            label="Observaciones Adicionales"
            placeholder="Información adicional (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            minRows={2}
          />

          {/* Resumen */}
          <Paper p="md" withBorder style={{ backgroundColor: tipoNota === 'CREDITO' ? '#fff5f5' : '#f0f9ff' }}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Total de la Nota:</Text>
                <Text size="lg" fw={700} c={tipoNota === 'CREDITO' ? 'red' : 'blue'}>
                  {tipoNota === 'CREDITO' ? '-' : '+'} {formatCurrency(total)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Nuevo saldo de la factura:</Text>
                <Text size="sm" fw={600}>
                  {formatCurrency(tipoNota === 'CREDITO' ? totalFactura - total : totalFactura + total)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* Botones */}
          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              color={tipoNota === 'CREDITO' ? 'orange' : 'blue'}
              leftSection={<IconCheck size={18} />}
              onClick={handleCrearNota}
              loading={loading}
            >
              Crear Nota {tipoNota === 'CREDITO' ? 'Crédito' : 'Débito'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default CrearNotaContableModal;
