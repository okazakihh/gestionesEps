import React from 'react';
import { Container, Stack, Title, Text, Paper, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import GestionEmpleadosComponent from '../../components/empleados/GestionEmpleadosComponent.jsx';

const EmpleadosPage = () => {
  return (
    <MainLayout title="Módulo de Empleados" subtitle="Gestión de empleados del sistema">
      <Container size="100%" px="xl" style={{ maxWidth: '100%' }}>
        <Stack gap="lg">
          {/* Header */}
          <Stack gap="xs">
            <Title order={1} size="h2">Sistema de Gestión de Empleados</Title>
            <Text size="lg" c="dimmed">
              Módulo completo para la administración de empleados
            </Text>
          </Stack>

          {/* Content */}
          <Paper shadow="sm" radius="md" withBorder p="xl">
            <GestionEmpleadosComponent />
          </Paper>

          {/* Información adicional */}
          <Alert
            icon={<IconInfoCircle size={20} />}
            title="Información del Sistema"
            color="blue"
            variant="light"
          >
            <Text size="sm">
              Este módulo permite la gestión completa de empleados, incluyendo
              información personal, laboral y de contacto. Los datos se procesan
              de forma segura y cumplen con las normativas de protección de datos.
            </Text>
          </Alert>
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default EmpleadosPage;