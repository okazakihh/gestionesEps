import React, { useState, useEffect } from 'react';
import { Modal, NumberInput, Text, Button, Group, Paper, Stack, Alert } from '@mantine/core';
import { IconCurrencyDollar, IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import { formatCurrency } from '../../../negocio/services/facturacionService';

/**
 * ValorCupsModal.jsx
 * 
 * Modal para editar el valor de un código CUPS
 * 
 * Props:
 * - opened: boolean que indica si el modal está abierto
 * - onClose: función para cerrar el modal
 * - codigoCups: objeto del código CUPS a editar
 * - onSave: función para guardar el nuevo valor
 * - loading: boolean que indica si se está guardando
 * 
 * Capa: Presentación
 */

const ValorCupsModal = ({
  opened = false,
  onClose,
  codigoCups = null,
  onSave,
  loading = false
}) => {
  const [valorInput, setValorInput] = useState('');

  // Extraer valor actual del código CUPS cuando se abre el modal
  useEffect(() => {
    if (codigoCups && opened) {
      try {
        const datosJson = JSON.parse(codigoCups.datosJson || '{}');
        const valorActual = datosJson.valor || '';
        setValorInput(valorActual.toString());
      } catch (error) {
        console.error('Error parsing datosJson:', error);
        setValorInput('');
      }
    }
  }, [codigoCups, opened]);

  // Limpiar input al cerrar
  const handleClose = () => {
    setValorInput('');
    onClose();
  };

  // Manejar guardado
  const handleSave = () => {
    const valor = parseFloat(valorInput) || 0;
    if (valor < 0) {
      return; // El NumberInput ya previene valores negativos, pero por seguridad
    }
    onSave(valor);
  };

  // Obtener el valor formateado para la vista previa
  const valorFormateado = valorInput ? formatCurrency(parseFloat(valorInput) || 0) : '$0';

  if (!codigoCups) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text size="lg" fw={600}>
          Editar Valor - {codigoCups.codigoCup}
        </Text>
      }
      size="md"
      centered
    >
      <Stack gap="md">
        {/* Información del código CUPS */}
        <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
          <Text size="sm" fw={500} c="dimmed" mb={4}>
            Código CUPS
          </Text>
          <Text size="sm">{codigoCups.nombreCup}</Text>
        </Paper>

        {/* Campo de valor */}
        <NumberInput
          label="Valor (COP)"
          placeholder="Ingrese el valor"
          value={valorInput}
          onChange={(value) => setValorInput(value.toString())}
          min={0}
          step={1000}
          hideControls={false}
          thousandSeparator="."
          decimalSeparator=","
          leftSection={<IconCurrencyDollar size={18} />}
          size="md"
          description="Ingrese el valor en pesos colombianos"
        />

        {/* Vista previa del valor formateado */}
        {valorInput && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="green"
            variant="light"
          >
            <Text size="sm" fw={500}>
              Vista previa: <Text component="span" fw={700}>{valorFormateado}</Text>
            </Text>
          </Alert>
        )}

        {/* Botones de acción */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            color="gray"
            leftSection={<IconX size={18} />}
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            color="blue"
            leftSection={<IconCheck size={18} />}
            onClick={handleSave}
            loading={loading}
            disabled={!valorInput || parseFloat(valorInput) < 0}
          >
            Guardar Valor
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ValorCupsModal;
