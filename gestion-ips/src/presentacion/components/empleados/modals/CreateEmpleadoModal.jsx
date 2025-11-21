import React from 'react';
import { Modal, Button, Group, Tabs } from '@mantine/core';
import { useTheme } from '../../../../negocio/contexts/ThemeContext.jsx';
import EmpleadoPersonalInfoSection from '../forms/EmpleadoPersonalInfoSection';
import EmpleadoContactInfoSection from '../forms/EmpleadoContactInfoSection';
import EmpleadoLaboralInfoSection from '../forms/EmpleadoLaboralInfoSection';

const CreateEmpleadoModal = ({
  opened, 
  onClose, 
  formData, 
  onFieldChange, 
  onSubmit, 
  loading,
  isFormValid = false
}) => {
  const { tema } = useTheme();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Crear Nuevo Empleado"
      size="xl"
      centered
      overlayColor={tema.primaryColor}
      styles={{ header: { backgroundColor: tema.primaryColor, padding: '10px 16px' }, title: { color: 'white' }, close: { color: 'white' } }}
    >
      <Tabs defaultValue="personal">
        <Tabs.List>
          <Tabs.Tab value="personal">Información Personal</Tabs.Tab>
          <Tabs.Tab value="contacto">Información de Contacto</Tabs.Tab>
          <Tabs.Tab value="laboral">Información Laboral</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="personal" pt="md">
          <EmpleadoPersonalInfoSection 
            formData={formData} 
            onFieldChange={onFieldChange} 
          />
        </Tabs.Panel>

        <Tabs.Panel value="contacto" pt="md">
          <EmpleadoContactInfoSection 
            formData={formData} 
            onFieldChange={onFieldChange} 
          />
        </Tabs.Panel>

        <Tabs.Panel value="laboral" pt="md">
          <EmpleadoLaboralInfoSection 
            formData={formData} 
            onFieldChange={onFieldChange} 
          />
        </Tabs.Panel>
      </Tabs>

      <Group position="right" mt="xl">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={onSubmit} 
          loading={loading}
          disabled={!isFormValid || loading}
        >
          Crear Empleado
        </Button>
      </Group>
    </Modal>
  );
};

export default CreateEmpleadoModal;
