import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Stack, Group, Alert } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { TimeInput } from '@mantine/dates';
import { useDisponibilidad } from '../../../../../negocio/hooks/availability/useDisponibilidad.js';
import Swal from 'sweetalert2';
import { IconAlertCircle } from '@tabler/icons-react';

const DisponibilidadMedicoModal = ({ opened, onClose }) => {
  const { empleadosMedicosFormatted, loadingEmpleados, createDisponibilidad } = useDisponibilidad();

  const [doctorId, setDoctorId] = useState('');
  const [fecha, setFecha] = useState(null);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!opened) {
      // Reset form when modal is closed
      setDoctorId('');
      setFecha(null);
      setHoraInicio('');
      setHoraFin('');
      setError('');
    }
  }, [opened]);

  const handleGuardar = async () => {
    setError('');
    if (!doctorId || !fecha || !horaInicio || !horaFin) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (horaFin <= horaInicio) {
      setError('La hora de fin debe ser mayor que la hora de inicio.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fechaFormato = fecha.toISOString().split('T')[0];

      await createDisponibilidad({
        doctorId,
        fecha: fechaFormato,
        horaInicio,
        horaFin,
        activo: true
      });

      Swal.fire({
        icon: 'success',
        title: '¡Disponibilidad Guardada!',
        text: 'El horario del médico ha sido registrado correctamente.',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true
      });

      onClose();
    } catch (err) {
      console.error('Error al crear disponibilidad:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Ocurrió un error inesperado.';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Registrar Disponibilidad del Médico"
      size="md"
      centered
    >
      <Stack gap="md">
        <Select
          label="Médico"
          placeholder="Seleccione un médico"
          data={empleadosMedicosFormatted.map(e => ({ value: e.value, label: e.label }))}
          value={doctorId}
          onChange={setDoctorId}
          searchable
          nothingFoundMessage="No se encontraron médicos"
          disabled={loadingEmpleados}
          required
        />

        <DatePicker
          label="Fecha de Disponibilidad"
          placeholder="Seleccione una fecha"
          value={fecha}
          onChange={setFecha}
          minDate={new Date()}
          required
          locale="es"
        />

        <Group grow>
          <TimeInput
            label="Hora de Inicio"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.currentTarget.value)}
            required
          />
          <TimeInput
            label="Hora de Fin"
            value={horaFin}
            onChange={(e) => setHoraFin(e.currentTarget.value)}
            required
          />
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" variant="light">
            {error}
          </Alert>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleGuardar} loading={isSubmitting}>Guardar Disponibilidad</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DisponibilidadMedicoModal;
