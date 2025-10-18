import { useState } from 'react';
import { pacientesApiService } from '@/data/services/pacientesApiService.js';

/**
 * usePacienteForm - Custom hook para el formulario de pacientes
 * 
 * Maneja el estado y operaciones CRUD específicas del formulario de crear/editar pacientes.
 */
const usePacienteForm = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crea un nuevo paciente
   * @param {Object} pacienteData - Datos del paciente a crear
   * @returns {Promise<Object|null>} - Paciente creado o null si error
   */
  const createPaciente = async (pacienteData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await pacientesApiService.createPaciente(pacienteData);
      setSaving(false);
      return response; // El servicio ya retorna los datos directamente
    } catch (err) {
      console.error('Error creating patient:', err);
      const errorMessage = err.message || 'Error al crear el paciente';
      setError(errorMessage);
      setSaving(false);
      return null;
    }
  };

  /**
   * Actualiza un paciente existente
   * @param {number} id - ID del paciente
   * @param {Object} pacienteData - Datos actualizados del paciente
   * @returns {Promise<Object|null>} - Paciente actualizado o null si error
   */
  const updatePaciente = async (id, pacienteData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await pacientesApiService.updatePaciente(id, pacienteData);
      setSaving(false);
      return response; // El servicio ya retorna los datos directamente
    } catch (err) {
      console.error('Error updating patient:', err);
      const errorMessage = err.message || 'Error al actualizar el paciente';
      setError(errorMessage);
      setSaving(false);
      return null;
    }
  };

  /**
   * Limpia el error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    saving,
    error,
    createPaciente,
    updatePaciente,
    clearError,
  };
};

export default usePacienteForm;
