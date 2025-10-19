import { apiClient } from '../api/apiClient.js';

// Base URL for empleados service - using Gateway (apiClient handles the base URL)
const EMPLEADOS_BASE_URL = '/api/empleados';

// Empleados API Service
export const empleadosApiService = {
  // Get all active employees with pagination
  getEmpleados: async (params) => {
    const response = await apiClient.get(EMPLEADOS_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener empleados');
    }
    return response.data;
  },

  // Get employee by ID
  getEmpleadoById: async (id) => {
    const response = await apiClient.get(`${EMPLEADOS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener empleado');
    }
    return response.data;
  },

  // Create new employee from JSON (simplified approach)
  createEmpleado: async (datosJson) => {
    const response = await apiClient.post(EMPLEADOS_BASE_URL, datosJson, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al crear empleado desde JSON');
    }
    return response.data;
  },

  // Update employee from JSON (simplified approach)
  updateEmpleado: async (id, datosJson) => {
    const response = await apiClient.put(`${EMPLEADOS_BASE_URL}/${id}`, datosJson, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar empleado desde JSON');
    }
    return response.data;
  },

  // Deactivate employee (soft delete)
  deactivateEmpleado: async (id) => {
    const response = await apiClient.patch(`${EMPLEADOS_BASE_URL}/${id}/desactivar`);
    if (!response.success) {
      throw new Error(response.error || 'Error al desactivar empleado');
    }
  },

  // Delete employee permanently
  deleteEmpleado: async (id) => {
    const response = await apiClient.delete(`${EMPLEADOS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar empleado');
    }
  }
};