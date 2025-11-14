import React, { useState } from 'react';
import { Table, Button, TextInput, ActionIcon, Group, Text, Paper, Stack } from '@mantine/core';
import { IconPlus, IconTrash, IconPill } from '@tabler/icons-react';

/**
 * Componente para tabla dinámica de medicamentos
 */
const MedicamentosTable = ({ medicamentos = [], onChange }) => {
  const [nuevoMedicamento, setNuevoMedicamento] = useState({
    medicamento: '',
    dosis: '',
    frecuencia: '',
    via: '',
    duracion: ''
  });

  const agregarMedicamento = () => {
    if (nuevoMedicamento.medicamento && nuevoMedicamento.dosis) {
      onChange([...medicamentos, { ...nuevoMedicamento, id: Date.now() }]);
      setNuevoMedicamento({
        medicamento: '',
        dosis: '',
        frecuencia: '',
        via: '',
        duracion: ''
      });
    }
  };

  const eliminarMedicamento = (id) => {
    onChange(medicamentos.filter(med => med.id !== id));
  };

  return (
    <Stack gap="md">
      <Group gap="xs">
        <IconPill size={18} color="var(--mantine-color-blue-6)" />
        <Text size="sm" fw={600}>Medicamentos Formulados</Text>
      </Group>

      {/* Formulario para agregar medicamento */}
      <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Group gap="sm" align="flex-end">
          <TextInput
            label="Medicamento"
            placeholder="Nombre del medicamento"
            value={nuevoMedicamento.medicamento}
            onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, medicamento: e.target.value })}
            style={{ flex: 2 }}
            size="sm"
          />
          <TextInput
            label="Dosis"
            placeholder="500mg"
            value={nuevoMedicamento.dosis}
            onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, dosis: e.target.value })}
            style={{ flex: 1 }}
            size="sm"
          />
          <TextInput
            label="Frecuencia"
            placeholder="Cada 8h"
            value={nuevoMedicamento.frecuencia}
            onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, frecuencia: e.target.value })}
            style={{ flex: 1 }}
            size="sm"
          />
          <TextInput
            label="Vía"
            placeholder="Oral"
            value={nuevoMedicamento.via}
            onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, via: e.target.value })}
            style={{ flex: 1 }}
            size="sm"
          />
          <TextInput
            label="Duración"
            placeholder="7 días"
            value={nuevoMedicamento.duracion}
            onChange={(e) => setNuevoMedicamento({ ...nuevoMedicamento, duracion: e.target.value })}
            style={{ flex: 1 }}
            size="sm"
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={agregarMedicamento}
            size="sm"
            color="green"
          >
            Agregar
          </Button>
        </Group>
      </Paper>

      {/* Tabla de medicamentos agregados */}
      {medicamentos.length > 0 && (
        <Paper withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Medicamento</Table.Th>
                <Table.Th>Dosis</Table.Th>
                <Table.Th>Frecuencia</Table.Th>
                <Table.Th>Vía</Table.Th>
                <Table.Th>Duración</Table.Th>
                <Table.Th style={{ width: '80px' }}>Acción</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {medicamentos.map((med) => (
                <Table.Tr key={med.id}>
                  <Table.Td>{med.medicamento}</Table.Td>
                  <Table.Td>{med.dosis}</Table.Td>
                  <Table.Td>{med.frecuencia}</Table.Td>
                  <Table.Td>{med.via}</Table.Td>
                  <Table.Td>{med.duracion}</Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => eliminarMedicamento(med.id)}
                      size="sm"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
};

export default MedicamentosTable;
