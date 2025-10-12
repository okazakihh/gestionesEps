// Sistema de permisos basado en roles
export const PERMISSIONS = {
  // Módulos del sistema
  PACIENTES: 'pacientes', // Incluye gestión de citas y documentos médicos
  FACTURACION: 'facturacion',
  NOMINA: 'nomina',
  USUARIOS: 'usuarios',
  REPORTES: 'reportes',
  CONFIGURACION: 'configuracion'
};

// Definición de permisos por rol
export const ROLE_PERMISSIONS = {
  ADMIN: {
    // Acceso total a todos los módulos
    [PERMISSIONS.PACIENTES]: { read: true, write: true, delete: true },
    [PERMISSIONS.FACTURACION]: { read: true, write: true, delete: true },
    [PERMISSIONS.NOMINA]: { read: true, write: true, delete: true },
    [PERMISSIONS.USUARIOS]: { read: true, write: true, delete: true },
    [PERMISSIONS.REPORTES]: { read: true, write: true, delete: true },
    [PERMISSIONS.CONFIGURACION]: { read: true, write: true, delete: true }
  },

  ADMINISTRATIVO: {
    // Acceso a gestión administrativa (incluye gestión de pacientes con citas y documentos)
    [PERMISSIONS.PACIENTES]: {
      read: true,
      write: true,
      delete: false,
      // Acciones específicas dentro del módulo pacientes
      create_patient: true,
      update_patient: true,
      create_appointment: true,
      update_appointment: true,
      cancel_appointment: true,
      mark_attended: false, // No puede marcar como atendido
      create_medical_record: false,
      update_medical_record: false
    },
    [PERMISSIONS.FACTURACION]: { read: true, write: true, delete: false },
    [PERMISSIONS.NOMINA]: { read: true, write: false, delete: false },
    [PERMISSIONS.USUARIOS]: { read: false, write: false, delete: false },
    [PERMISSIONS.REPORTES]: { read: true, write: false, delete: false },
    [PERMISSIONS.CONFIGURACION]: { read: false, write: false, delete: false }
  },

  AUXILIAR_ADMINISTRATIVO: {
    // Acceso limitado a tareas administrativas
    [PERMISSIONS.PACIENTES]: {
      read: true,
      write: true,
      delete: false,
      // Acciones específicas dentro del módulo pacientes
      create_patient: true,
      update_patient: true,
      create_appointment: true,
      update_appointment: true,
      cancel_appointment: true,
      mark_attended: false, // No puede marcar como atendido
      create_medical_record: false,
      update_medical_record: false
    },
    [PERMISSIONS.FACTURACION]: { read: true, write: false, delete: false },
    [PERMISSIONS.NOMINA]: { read: false, write: false, delete: false },
    [PERMISSIONS.USUARIOS]: { read: false, write: false, delete: false },
    [PERMISSIONS.REPORTES]: { read: false, write: false, delete: false },
    [PERMISSIONS.CONFIGURACION]: { read: false, write: false, delete: false }
  },

  DOCTOR: {
    // Acceso médico completo (incluye gestión de pacientes con citas y documentos)
    [PERMISSIONS.PACIENTES]: {
      read: true,
      write: true,
      delete: false,
      // Acciones específicas dentro del módulo pacientes
      create_patient: true,
      update_patient: true,
      create_appointment: true,
      update_appointment: true,
      cancel_appointment: true,
      mark_attended: true, // Puede marcar citas como atendidas
      create_medical_record: true,
      update_medical_record: true
    },
    [PERMISSIONS.FACTURACION]: { read: false, write: false, delete: false },
    [PERMISSIONS.NOMINA]: { read: false, write: false, delete: false },
    [PERMISSIONS.USUARIOS]: { read: false, write: false, delete: false },
    [PERMISSIONS.REPORTES]: { read: true, write: false, delete: false },
    [PERMISSIONS.CONFIGURACION]: { read: false, write: false, delete: false }
  },

  AUXILIAR_MEDICO: {
    // Acceso médico limitado
    [PERMISSIONS.PACIENTES]: { read: true, write: false, delete: false },
    [PERMISSIONS.FACTURACION]: { read: false, write: false, delete: false },
    [PERMISSIONS.NOMINA]: { read: false, write: false, delete: false },
    [PERMISSIONS.USUARIOS]: { read: false, write: false, delete: false },
    [PERMISSIONS.REPORTES]: { read: false, write: false, delete: false },
    [PERMISSIONS.CONFIGURACION]: { read: false, write: false, delete: false }
  }
};

/**
 * Verifica si un usuario tiene permiso para una acción específica
 * @param {string} userRole - Rol del usuario
 * @param {string} module - Módulo del sistema
 * @param {string} action - Acción (read, write, delete)
 * @returns {boolean} - True si tiene permiso
 */
export const hasPermission = (userRole, module, action) => {
  if (!userRole || !module || !action) return false;

  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  const modulePermissions = rolePermissions[module];
  if (!modulePermissions) return false;

  // Check for specific action permissions first
  if (modulePermissions[action] !== undefined) {
    return modulePermissions[action] === true;
  }

  // Fallback to general permissions (read, write, delete)
  return modulePermissions[action] === true;
};

/**
 * Verifica si un usuario puede acceder a un módulo (al menos lectura)
 * @param {string} userRole - Rol del usuario
 * @param {string} module - Módulo del sistema
 * @returns {boolean} - True si puede acceder
 */
export const canAccessModule = (userRole, module) => {
  return hasPermission(userRole, module, 'read');
};

/**
 * Obtiene todos los módulos accesibles para un rol
 * @param {string} userRole - Rol del usuario
 * @returns {string[]} - Lista de módulos accesibles
 */
export const getAccessibleModules = (userRole) => {
  if (!userRole) return [];

  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return [];

  return Object.keys(rolePermissions).filter(module =>
    rolePermissions[module].read === true
  );
};

/**
 * Hook personalizado para verificar permisos en componentes React
 * @param {string} module - Módulo del sistema
 * @param {string} action - Acción requerida
 * @returns {boolean} - True si tiene permiso
 */
export const usePermission = (module, action) => {
  // Aquí se integraría con el contexto de autenticación
  // Por ahora retorna true para compatibilidad
  return true;
};