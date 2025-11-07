import { Modal, TextInput, NumberInput, Textarea, Button, Group, Text, Paper, Grid, Divider } from '@mantine/core';
import { IconDeviceFloppy, IconX, IconCalculator } from '@tabler/icons-react';
import { useNominaForm } from '../../../negocio/hooks/nomina/useNominaForm';
import { useEffect } from 'react';

/**
 * Componente modal de formulario de nómina
 * Para crear o editar nóminas
 */
export const NominaForm = ({
  opened,
  onClose,
  onSubmit,
  nominaToEdit = null,
  empleados = [],
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
    getSubmitData
  } = useNominaForm(nominaToEdit);

  // Cargar datos cuando cambia la nómina a editar
  useEffect(() => {
    if (nominaToEdit) {
      loadData(nominaToEdit);
    } else {
      resetForm();
    }
  }, [nominaToEdit, loadData, resetForm]);

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
      size="lg"
      closeOnClickOutside={!isDirty}
    >
      <form onSubmit={handleSubmit}>
        <Grid gutter="md">
          {/* Empleado */}
          <Grid.Col span={12}>
            <TextInput
              label="ID Empleado"
              placeholder="Ingrese el ID del empleado"
              required
              value={formData.empleadoId}
              onChange={(e) => updateField('empleadoId', e.target.value)}
              onBlur={() => touchField('empleadoId')}
              error={errors.empleadoId}
              disabled={!!nominaToEdit}
            />
            <Text size="xs" c="dimmed" mt={4}>
              Nota: Se debe implementar un selector de empleados
            </Text>
          </Grid.Col>

          {/* Periodo y Fecha */}
          <Grid.Col span={6}>
            <TextInput
              label="Periodo"
              placeholder="Ej: 2024-01"
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

          <Grid.Col span={12}>
            <Divider label="Devengados" labelPosition="center" />
          </Grid.Col>

          {/* Salario Base */}
          <Grid.Col span={6}>
            <NumberInput
              label="Salario Base"
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

          {/* Horas Extras */}
          <Grid.Col span={6}>
            <NumberInput
              label="Horas Extras"
              placeholder="0"
              min={0}
              value={formData.horasExtras}
              onChange={(value) => updateField('horasExtras', value)}
              onBlur={() => touchField('horasExtras')}
              error={errors.horasExtras}
              hideControls
              prefix="$"
              thousandSeparator=","
            />
          </Grid.Col>

          {/* Bonificaciones */}
          <Grid.Col span={6}>
            <NumberInput
              label="Bonificaciones"
              placeholder="0"
              min={0}
              value={formData.bonificaciones}
              onChange={(value) => updateField('bonificaciones', value)}
              onBlur={() => touchField('bonificaciones')}
              error={errors.bonificaciones}
              hideControls
              prefix="$"
              thousandSeparator=","
            />
          </Grid.Col>

          {/* Deducciones */}
          <Grid.Col span={6}>
            <NumberInput
              label="Deducciones"
              placeholder="0"
              min={0}
              value={formData.deducciones}
              onChange={(value) => updateField('deducciones', value)}
              onBlur={() => touchField('deducciones')}
              error={errors.deducciones}
              hideControls
              prefix="$"
              thousandSeparator=","
            />
          </Grid.Col>

          {/* Observaciones */}
          <Grid.Col span={12}>
            <Textarea
              label="Observaciones"
              placeholder="Observaciones adicionales..."
              value={formData.observaciones}
              onChange={(e) => updateField('observaciones', e.target.value)}
              minRows={2}
              maxRows={4}
            />
          </Grid.Col>

          {/* Cálculos automáticos */}
          <Grid.Col span={12}>
            <Paper bg="blue.0" p="md" radius="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  <IconCalculator size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Cálculos Automáticos
                </Text>
              </Group>

              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Total Devengado</Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(calculatedValues.totalDevengado)}
                  </Text>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Total Deducciones</Text>
                  <Text size="sm" fw={600} c="red">
                    {formatCurrency(calculatedValues.totalDeducciones)}
                  </Text>
                </Grid.Col>

                <Grid.Col span={12}>
                  <Divider my="xs" />
                </Grid.Col>

                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed">Total a Pagar</Text>
                  <Text size="lg" fw={700} c="blue">
                    {formatCurrency(calculatedValues.totalPagar)}
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>
          </Grid.Col>

          {/* Botones */}
          <Grid.Col span={12}>
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
          </Grid.Col>
        </Grid>
      </form>
    </Modal>
  );
};
