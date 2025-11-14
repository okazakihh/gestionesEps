import { Modal, TextInput, NumberInput, Textarea, Button, Group, Text, Paper, Grid, Divider, Select, Stack } from '@mantine/core';
import { IconDeviceFloppy, IconX, IconCalculator, IconUser } from '@tabler/icons-react';
import { useNominaForm } from '../../../negocio/hooks/nomina/useNominaForm';
import { useEmpleadosSelect } from '../../../negocio/hooks/nomina/useEmpleadosSelect';
import { useEffect, useState } from 'react';
import { getNominaConfig } from '../../../negocio/utils/nomina/nominaCalculos';

/**
 * Componente modal de formulario de nómina
 * Para crear o editar nóminas
 */
export const NominaForm = ({
  opened,
  onClose,
  onSubmit,
  nominaToEdit = null,
  loading = false
}) => {
  const {
    formData,
    errors,
    calculatedValues,
    isValid,
    isDirty,
    updateField,
    touchField,
    validate,
    resetForm,
    loadData,
    loadEmpleadoData,
    getSubmitData
  } = useNominaForm(nominaToEdit);

  const {
    empleadosFormatted,
    loading: loadingEmpleados
  } = useEmpleadosSelect();

  // Estado para la configuración de nómina
  const [nominaConfig, setNominaConfig] = useState({
    salarioMinimo: 1300000,
    auxilioTransporte: 162000,
    porcentajeSalud: 4.0,
    porcentajePension: 4.0
  });

  // Cargar configuración de nómina
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getNominaConfig();
      setNominaConfig(config);
    };
    loadConfig();
  }, []);

  // Cargar datos cuando cambia la nómina a editar
  useEffect(() => {
    if (nominaToEdit) {
      loadData(nominaToEdit);
    } else {
      resetForm();
    }
  }, [nominaToEdit, loadData, resetForm]);

  /**
   * Maneja la selección del empleado
   */
  const handleEmpleadoChange = (empleadoId) => {
    if (!empleadoId) {
      // Limpiar campos si se deselecciona
      updateField('empleadoId', '');
      updateField('empleadoNombre', '');
      updateField('empleadoDocumento', '');
      updateField('salarioBase', 0);
      updateField('tipoContrato', '');
      updateField('cargo', '');
      return;
    }

    // Buscar el empleado en la lista formateada
    const empleadoSeleccionado = empleadosFormatted.find(
      emp => emp.value === empleadoId
    );

    if (empleadoSeleccionado && empleadoSeleccionado.empleado) {
      console.log('🔍 Empleado seleccionado:', empleadoSeleccionado.empleado);
      loadEmpleadoData(empleadoSeleccionado.empleado);
    }
  };

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const submitData = getSubmitData();
    await onSubmit?.(submitData);
  };

  /**
   * Formatea valor monetario
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="lg" fw={600}>
          {nominaToEdit ? 'Editar Nómina' : 'Nueva Nómina'}
        </Text>
      }
      size="xl"
      closeOnClickOutside={!isDirty}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* === SECCIÓN 1: INFORMACIÓN DEL EMPLEADO === */}
          <Paper p="md" withBorder>
            <Text size="sm" fw={600} mb="md" c="blue">
              <IconUser size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Información del Empleado
            </Text>
            
            <Grid gutter="md">
              <Grid.Col span={12}>
                <Select
                  label="Empleado"
                  placeholder="Seleccione un empleado"
                  data={empleadosFormatted}
                  value={formData.empleadoId?.toString() || null}
                  onChange={handleEmpleadoChange}
                  onBlur={() => touchField('empleadoId')}
                  error={errors.empleadoId}
                  searchable
                  required
                  disabled={!!nominaToEdit || loadingEmpleados}
                  clearable
                />
              </Grid.Col>

              {formData.empleadoNombre && (
                <>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Nombre Completo"
                      value={formData.empleadoNombre}
                      disabled
                    />
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <TextInput
                      label="Documento"
                      value={formData.empleadoDocumento}
                      disabled
                    />
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <TextInput
                      label="Cargo"
                      value={formData.cargo}
                      disabled
                    />
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <TextInput
                      label="Tipo de Contrato"
                      value={formData.tipoContrato}
                      disabled
                    />
                  </Grid.Col>
                </>
              )}
            </Grid>
          </Paper>

          {/* === SECCIÓN 2: PERIODO Y FECHA === */}
          <Paper p="md" withBorder>
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Periodo"
                  placeholder="Ej: 2025-11"
                  required
                  value={formData.periodo}
                  onChange={(e) => updateField('periodo', e.target.value)}
                  onBlur={() => touchField('periodo')}
                  error={errors.periodo}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <div>
                  <Text size="sm" fw={500} mb={5}>
                    Fecha de Pago <span style={{ color: 'red' }}>*</span>
                  </Text>
                  <input
                    type="date"
                    value={formData.fechaPago}
                    onChange={(e) => updateField('fechaPago', e.target.value)}
                    onBlur={() => touchField('fechaPago')}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: errors.fechaPago ? '1px solid #fa5252' : '1px solid #ced4da',
                      fontSize: '14px'
                    }}
                  />
                  {errors.fechaPago && (
                    <Text size="xs" c="red" mt={4}>
                      {errors.fechaPago}
                    </Text>
                  )}
                </div>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* === SECCIÓN 3: DEVENGADOS === */}
          <Paper p="md" withBorder>
            <Text size="sm" fw={600} mb="md" c="green">
              Devengados
            </Text>
            
            <Grid gutter="md">
              <Grid.Col span={6}>
                <NumberInput
                  label="Salario Base"
                  description={`Salario mínimo: ${formatCurrency(nominaConfig.salarioMinimo)}`}
                  placeholder="0"
                  required
                  min={0}
                  value={formData.salarioBase}
                  onChange={(value) => updateField('salarioBase', value)}
                  onBlur={() => touchField('salarioBase')}
                  error={errors.salarioBase}
                  hideControls
                  prefix="$"
                  thousandSeparator=","
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <NumberInput
                  label="Días Trabajados"
                  placeholder="30"
                  required
                  min={1}
                  max={31}
                  value={formData.diasTrabajados}
                  onChange={(value) => updateField('diasTrabajados', value)}
                  onBlur={() => touchField('diasTrabajados')}
                  error={errors.diasTrabajados}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider label="Horas Extras" size="xs" />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label={`HE Diurnas (+${nominaConfig.horaExtraDiurna || 25}%)`}
                  placeholder="0"
                  min={0}
                  value={formData.horasExtrasDiurnas}
                  onChange={(value) => updateField('horasExtrasDiurnas', value)}
                  error={errors.horasExtrasDiurnas}
                  decimalScale={2}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label={`HE Nocturnas (+${nominaConfig.horaExtraNocturna || 75}%)`}
                  placeholder="0"
                  min={0}
                  value={formData.horasExtrasNocturnas}
                  onChange={(value) => updateField('horasExtrasNocturnas', value)}
                  error={errors.horasExtrasNocturnas}
                  decimalScale={2}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label={`HE Dominicales (+${nominaConfig.horaExtraFestivaDiurna || 100}%)`}
                  placeholder="0"
                  min={0}
                  value={formData.horasExtrasDominicales}
                  onChange={(value) => updateField('horasExtrasDominicales', value)}
                  error={errors.horasExtrasDominicales}
                  decimalScale={2}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider label="Recargos" size="xs" />
              </Grid.Col>

              <Grid.Col span={6}>
                <NumberInput
                  label={`Recargo Nocturno (+${nominaConfig.recargoNocturno || 35}%)`}
                  placeholder="0"
                  min={0}
                  value={formData.horasRecargoNocturno}
                  onChange={(value) => updateField('horasRecargoNocturno', value)}
                  error={errors.horasRecargoNocturno}
                  decimalScale={2}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <NumberInput
                  label={`Recargo Dominical (+${nominaConfig.recargoFestivo || 75}%)`}
                  placeholder="0"
                  min={0}
                  value={formData.horasRecargoDominical}
                  onChange={(value) => updateField('horasRecargoDominical', value)}
                  error={errors.horasRecargoDominical}
                  decimalScale={2}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider label="Otros Ingresos" size="xs" />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label="Bonificaciones"
                  placeholder="0"
                  min={0}
                  value={formData.bonificaciones}
                  onChange={(value) => updateField('bonificaciones', value)}
                  error={errors.bonificaciones}
                  hideControls
                  prefix="$"
                  thousandSeparator=","
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label="Comisiones"
                  placeholder="0"
                  min={0}
                  value={formData.comisiones}
                  onChange={(value) => updateField('comisiones', value)}
                  error={errors.comisiones}
                  hideControls
                  prefix="$"
                  thousandSeparator=","
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label="Otros Ingresos"
                  placeholder="0"
                  min={0}
                  value={formData.otrosIngresos}
                  onChange={(value) => updateField('otrosIngresos', value)}
                  error={errors.otrosIngresos}
                  hideControls
                  prefix="$"
                  thousandSeparator=","
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* === SECCIÓN 4: DEDUCCIONES === */}
          <Paper p="md" withBorder>
            <Text size="sm" fw={600} mb="md" c="red">
              Deducciones
            </Text>
            
            <Grid gutter="md">
              <Grid.Col span={4}>
                <NumberInput
                  label="Préstamos"
                  placeholder="0"
                  min={0}
                  value={formData.prestamos}
                  onChange={(value) => updateField('prestamos', value)}
                  error={errors.prestamos}
                  hideControls
                  prefix="$"
                  thousandSeparator=","
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label="Embargos"
                  placeholder="0"
                  min={0}
                  value={formData.embargos}
                  onChange={(value) => updateField('embargos', value)}
                  error={errors.embargos}
                  hideControls
                  prefix="$"
                  thousandSeparator=","
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <NumberInput
                  label="Otras Deducciones"
                  placeholder="0"
                  min={0}
                  value={formData.otrasDeducciones}
                  onChange={(value) => updateField('otrasDeducciones', value)}
                  error={errors.otrasDeducciones}
                  hideControls
                  prefix="$"
                  thousandSeparator=","
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Text size="xs" c="dimmed">
                  Las deducciones de salud ({nominaConfig.porcentajeSalud || 4}%) y pensión ({nominaConfig.porcentajePension || 4}%) se calculan automáticamente
                </Text>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* === SECCIÓN 5: RESUMEN === */}
          <Paper bg="blue.0" p="md">
            <Text size="sm" fw={600} mb="md">
              <IconCalculator size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Resumen de Nómina
            </Text>

            <Grid gutter="md">
              <Grid.Col span={4}>
                <Text size="xs" c="dimmed">
                  Salario por Días Trabajados
                </Text>
                <Text size="sm" fw={600}>
                  {formatCurrency(calculatedValues.salarioProporcional || 0)}
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {formData.diasTrabajados < 30 
                    ? `${formData.diasTrabajados}/30 días`
                    : 'Mes completo'}
                </Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Text size="xs" c="dimmed">Auxilio de Transporte ({formatCurrency(nominaConfig.auxilioTransporte)})</Text>
                <Text size="sm" fw={600} c={calculatedValues.auxilioTransporte > 0 ? 'green' : 'dimmed'}>
                  {formatCurrency(calculatedValues.auxilioTransporte)}
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {calculatedValues.auxilioTransporte > 0 
                    ? 'Aplica (≤ 2 SMLMV)' 
                    : 'No aplica (> 2 SMLMV)'}
                </Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Text size="xs" c="dimmed">Total Horas Extras</Text>
                <Text size="sm" fw={600}>
                  {formatCurrency(calculatedValues.totalHorasExtras)}
                </Text>
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider my="xs" />
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Total Devengado</Text>
                <Text size="lg" fw={700} c="green">
                  {formatCurrency(calculatedValues.totalDevengado)}
                </Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Total Deducciones</Text>
                <Text size="lg" fw={700} c="red">
                  {formatCurrency(calculatedValues.totalDeducciones)}
                </Text>
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider my="xs" />
              </Grid.Col>

              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">Neto a Pagar</Text>
                <Text size="xl" fw={700} c="blue">
                  {formatCurrency(calculatedValues.netoPagar)}
                </Text>
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider my="xs" label="Aportes Empleador (informativo)" labelPosition="center" size="xs" />
              </Grid.Col>

              <Grid.Col span={4}>
                <Text size="xs" c="dimmed">Salud (8.5%)</Text>
                <Text size="sm">
                  {formatCurrency(calculatedValues.aportesEmpleador?.salud || 0)}
                </Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Text size="xs" c="dimmed">Pensión (12%)</Text>
                <Text size="sm">
                  {formatCurrency(calculatedValues.aportesEmpleador?.pension || 0)}
                </Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Text size="xs" c="dimmed">ARL</Text>
                <Text size="sm">
                  {formatCurrency(calculatedValues.aportesEmpleador?.arl || 0)}
                </Text>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Observaciones */}
          <Textarea
            label="Observaciones"
            placeholder="Observaciones adicionales..."
            value={formData.observaciones}
            onChange={(e) => updateField('observaciones', e.target.value)}
            minRows={2}
            maxRows={4}
          />

          {/* === BOTONES === */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="gray"
              leftSection={<IconX size={16} />}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={loading}
              disabled={!isValid || loading}
            >
              {nominaToEdit ? 'Actualizar' : 'Guardar'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
