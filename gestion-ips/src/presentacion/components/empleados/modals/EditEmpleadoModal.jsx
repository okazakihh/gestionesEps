import React from 'react';
import { Modal, Button, Group, Tabs } from '@mantine/core';
import EmpleadoPersonalInfoSection from '../forms/EmpleadoPersonalInfoSection';
import EmpleadoContactInfoSection from '../forms/EmpleadoContactInfoSection';
import EmpleadoLaboralInfoSection from '../forms/EmpleadoLaboralInfoSection';

const EditEmpleadoModal = ({ 
  opened, 
  onClose, 
  formData, 
  onFieldChange, 
  onSubmit, 
  loading,
  isFormValid = false
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Editar Empleado"
      size="xl"
      centered
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
          Guardar Cambios
        </Button>
      </Group>
    </Modal>
  );
};

export default EditEmpleadoModal;
