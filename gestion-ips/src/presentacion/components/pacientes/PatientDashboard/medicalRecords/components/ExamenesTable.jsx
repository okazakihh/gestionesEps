import React, { useState } from 'react';
import { Paper, Stack, Group, Text, Button, Table, ActionIcon, TextInput, Textarea } from '@mantine/core';
import { IconPlus, IconTrash, IconFlask } from '@tabler/icons-react';

/**
 * Tabla para gestionar exámenes y ayudas diagnósticas
 */
const ExamenesTable = ({ examenes, onChange }) => {
  const [newExamen, setNewExamen] = useState({
    tipo: '',
    descripcion: '',
    observaciones: ''
  });

  const addExamen = () => {
    if (newExamen.tipo.trim() && newExamen.descripcion.trim()) {
      onChange([...examenes, { ...newExamen, id: Date.now() }]);
      setNewExamen({ tipo: '', descripcion: '', observaciones: '' });
    }
  };

  const removeExamen = (id) => {
    onChange(examenes.filter(ex => ex.id !== id));
  };

  return (
    <Paper p="md" withBorder>
      <Group gap="xs" mb="md">
        <IconFlask size={18} color="var(--mantine-color-indigo-6)" />
        <Text size="sm" fw={600}>Exámenes y Ayudas Diagnósticas</Text>
      </Group>

      {/* Tabla de exámenes existentes */}
      {examenes.length > 0 && (
        <Table striped highlightOnHover mb="md" withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Descripción</Table.Th>
              <Table.Th>Observaciones</Table.Th>
              <Table.Th style={{ width: '80px' }}>Acción</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {examenes.map((examen) => (
              <Table.Tr key={examen.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>{examen.tipo}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{examen.descripcion}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{examen.observaciones || '-'}</Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => removeExamen(examen.id)}
                    size="sm"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* Formulario para agregar nuevo examen */}
      <Stack gap="sm">
        <Group grow align="flex-start">
          <TextInput
            label="Tipo de Examen"
            placeholder="Ej: Laboratorio, Imagen, ECG, etc."
            value={newExamen.tipo}
            onChange={(e) => setNewExamen({ ...newExamen, tipo: e.target.value })}
            size="sm"
          />
          <TextInput
            label="Descripción"
            placeholder="Ej: Hemograma completo, Rx de tórax AP/LAT"
            value={newExamen.descripcion}
            onChange={(e) => setNewExamen({ ...newExamen, descripcion: e.target.value })}
            size="sm"
          />
        </Group>
        
        <Textarea
          label="Observaciones (opcional)"
          placeholder="Indicaciones especiales, urgencia, etc."
          value={newExamen.observaciones}
          onChange={(e) => setNewExamen({ ...newExamen, observaciones: e.target.value })}
          size="sm"
          minRows={2}
        />

        <Button
          leftSection={<IconPlus size={16} />}
          onClick={addExamen}
          size="sm"
          variant="light"
          fullWidth
        >
          Agregar Examen
        </Button>
      </Stack>
    </Paper>
  );
};

export default ExamenesTable;
