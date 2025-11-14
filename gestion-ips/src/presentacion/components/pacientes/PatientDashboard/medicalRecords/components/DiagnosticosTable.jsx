import React, { useState } from 'react';
import { Table, Button, TextInput, Select, ActionIcon, Group, Text, Paper, Stack } from '@mantine/core';
import { IconPlus, IconTrash, IconStethoscope } from '@tabler/icons-react';

/**
 * Componente para tabla dinámica de diagnósticos
 */
const DiagnosticosTable = ({ diagnosticos = [], onChange }) => {
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState({
    codigo: '',
    descripcion: '',
    tipo: 'principal'
  });

  const tipoOptions = [
    { value: 'principal', label: 'Principal' },
    { value: 'relacionado', label: 'Relacionado' },
    { value: 'impresion', label: 'Impresión Diagnóstica' }
  ];

  const agregarDiagnostico = () => {
    if (nuevoDiagnostico.codigo && nuevoDiagnostico.descripcion) {
      onChange([...diagnosticos, { ...nuevoDiagnostico, id: Date.now() }]);
      setNuevoDiagnostico({
        codigo: '',
        descripcion: '',
        tipo: 'principal'
      });
    }
  };

  const eliminarDiagnostico = (id) => {
    onChange(diagnosticos.filter(diag => diag.id !== id));
  };

  return (
    <Stack gap="md">
      <Group gap="xs">
        <IconStethoscope size={18} color="var(--mantine-color-red-6)" />
        <Text size="sm" fw={600}>Diagnósticos</Text>
      </Group>

      {/* Formulario para agregar diagnóstico */}
      <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Group gap="sm" align="flex-end">
          <TextInput
            label="Código CIE-10"
            placeholder="J343"
            value={nuevoDiagnostico.codigo}
            onChange={(e) => setNuevoDiagnostico({ ...nuevoDiagnostico, codigo: e.target.value.toUpperCase() })}
            style={{ flex: 1 }}
            size="sm"
          />
          <TextInput
            label="Descripción"
            placeholder="Descripción del diagnóstico"
            value={nuevoDiagnostico.descripcion}
            onChange={(e) => setNuevoDiagnostico({ ...nuevoDiagnostico, descripcion: e.target.value })}
            style={{ flex: 3 }}
            size="sm"
          />
          <Select
            label="Tipo"
            data={tipoOptions}
            value={nuevoDiagnostico.tipo}
            onChange={(value) => setNuevoDiagnostico({ ...nuevoDiagnostico, tipo: value })}
            style={{ flex: 1 }}
            size="sm"
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={agregarDiagnostico}
            size="sm"
            color="red"
          >
            Agregar
          </Button>
        </Group>
      </Paper>

      {/* Tabla de diagnósticos agregados */}
      {diagnosticos.length > 0 && (
        <Paper withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Código CIE-10</Table.Th>
                <Table.Th>Descripción</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th style={{ width: '80px' }}>Acción</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {diagnosticos.map((diag) => (
                <Table.Tr key={diag.id}>
                  <Table.Td>
                    <Text fw={600} c="blue">{diag.codigo}</Text>
                  </Table.Td>
                  <Table.Td>{diag.descripcion}</Table.Td>
                  <Table.Td>
                    <Text
                      size="xs"
                      c={diag.tipo === 'principal' ? 'red' : diag.tipo === 'relacionado' ? 'blue' : 'gray'}
                      fw={500}
                    >
                      {tipoOptions.find(opt => opt.value === diag.tipo)?.label}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => eliminarDiagnostico(diag.id)}
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

export default DiagnosticosTable;
