import { Table, ActionIcon, Badge, Text, Group, Tooltip } from '@mantine/core';
import { IconTrash, IconEye, IconBan } from '@tabler/icons-react';

/**
 * Componente tabla de nóminas
 * Muestra nóminas con acciones CRUD (sin edición)
 */
export const NominaTable = ({
  nominas = [],
  loading = false,
  onEdit,
  onDelete,
  onDeactivate,
  onView
}) => {
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

  /**
   * Formatea fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  /**
   * Obtiene badge de estado
   */
  const getEstadoBadge = (nomina) => {
    const activo = nomina.activo ?? (nomina.estado === 'ACTIVO');
    
    return (
      <Badge
        color={activo ? 'green' : 'red'}
        variant="light"
        size="sm"
      >
        {activo ? 'Activa' : 'Inactiva'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Empleado</Table.Th>
              <Table.Th>Periodo</Table.Th>
              <Table.Th>Fecha Pago</Table.Th>
              <Table.Th>Salario Base</Table.Th>
              <Table.Th>Total a Pagar</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={7}>
                <Text ta="center" c="dimmed">
                  Cargando nóminas...
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );
  }

  if (nominas.length === 0) {
    return (
      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Empleado</Table.Th>
              <Table.Th>Periodo</Table.Th>
              <Table.Th>Fecha Pago</Table.Th>
              <Table.Th>Salario Base</Table.Th>
              <Table.Th>Total a Pagar</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={7}>
                <Text ta="center" c="dimmed">
                  No hay nóminas para mostrar
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );
  }

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Empleado</Table.Th>
            <Table.Th>Periodo</Table.Th>
            <Table.Th>Fecha Pago</Table.Th>
            <Table.Th>Salario Base</Table.Th>
            <Table.Th>Total a Pagar</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {nominas.map((nomina) => (
            <Table.Tr key={nomina.id}>
              <Table.Td>
                <div>
                  <Text size="sm" fw={500}>
                    {nomina.empleadoNombre || nomina.empleado?.nombre || 'Sin nombre'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {nomina.empleadoDocumento || nomina.empleado?.documento || '-'}
                  </Text>
                </div>
              </Table.Td>
              
              <Table.Td>
                <Text size="sm">{nomina.periodo || '-'}</Text>
              </Table.Td>
              
              <Table.Td>
                <Text size="sm">{formatDate(nomina.fechaPago || nomina.fecha)}</Text>
              </Table.Td>
              
              <Table.Td>
                <Text size="sm" fw={500}>
                  {formatCurrency(nomina.salarioBase || nomina.salario)}
                </Text>
              </Table.Td>
              
              <Table.Td>
                <Text size="sm" fw={600} c="blue">
                  {formatCurrency(nomina.netoPagar || nomina.totalPagar || nomina.total)}
                </Text>
              </Table.Td>
              
              <Table.Td>
                {getEstadoBadge(nomina)}
              </Table.Td>
              
              <Table.Td>
                <Group gap="xs">
                  {onView && (
                    <Tooltip label="Ver detalles">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        size="sm"
                        onClick={() => onView(nomina)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  
                  {/* Las nóminas NO se pueden editar una vez creadas */}
                  
                  {onDeactivate && (nomina.activo ?? nomina.estado === 'ACTIVO') && (
                    <Tooltip label="Desactivar">
                      <ActionIcon
                        variant="light"
                        color="yellow"
                        size="sm"
                        onClick={() => onDeactivate(nomina)}
                      >
                        <IconBan size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  
                  {onDelete && (
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="sm"
                        onClick={() => onDelete(nomina)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
