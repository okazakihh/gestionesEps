import React, { useEffect } from 'react';
import { Modal, Button, Stack, Select, TextInput, Group, Checkbox } from '@mantine/core';
import Swal from 'sweetalert2';
import { useDisponibilidad } from '../../../../../negocio/hooks/availability/useDisponibilidad';

const DisponibilidadMedicoModal = ({ opened, onClose }) => {
  const { empleadosMedicosFormatted, loadingEmpleados, createDisponibilidad } = useDisponibilidad();

  const [formState, setFormState] = React.useState({ doctorId: '', fecha: '', horaInicio: '', horaFin: '', activo: true });

  useEffect(() => {
    if (!opened) {
      setFormState({ doctorId: '', fecha: '', horaInicio: '', horaFin: '', activo: true });
    }
  }, [opened]);

  const handleChange = (field) => (value) => setFormState(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const { doctorId, fecha, horaInicio, horaFin, activo } = formState;
    if (!doctorId || !fecha || !horaInicio || !horaFin) {
      Swal.fire('Faltan datos', 'Complete todos los campos obligatorios', 'warning');
      return;
    }
    if (horaFin <= horaInicio) {
      Swal.fire('Error', 'La hora fin debe ser mayor que la hora inicio', 'warning');
      return;
    }

    try {
      await createDisponibilidad({ doctorId, fecha, horaInicio, horaFin, activo });
      Swal.fire('Registrado', 'Disponibilidad creada correctamente', 'success');
      onClose();
    } catch (err) {
      console.error('Error creando disponibilidad', err);
      Swal.fire('Error', err.message || 'No se pudo guardar la disponibilidad', 'error');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Crear Disponibilidad Médica" size="lg">
      <Stack spacing="sm">
        <Select
          data={empleadosMedicosFormatted}
          label="Médico"
          placeholder={loadingEmpleados ? 'Cargando...' : 'Seleccione un médico'}
          value={formState.doctorId}
          onChange={handleChange('doctorId')}
          searchable
          nothingFoundMessage="No se encontraron médicos"
        />

        <TextInput
          type="date"
          label="Fecha"
          value={formState.fecha}
          onChange={(e) => handleChange('fecha')(e.target.value)}
        />

        <Group grow>
          <TextInput type="time" label="Hora inicio" value={formState.horaInicio} onChange={(e) => handleChange('horaInicio')(e.target.value)} />
          <TextInput type="time" label="Hora fin" value={formState.horaFin} onChange={(e) => handleChange('horaFin')(e.target.value)} />
        </Group>

        <Checkbox label="Activo" checked={formState.activo} onChange={(e) => handleChange('activo')(e.currentTarget.checked)} />

        <Group position="right">
          <Button variant="default" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DisponibilidadMedicoModal;
