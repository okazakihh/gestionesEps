/**
 * Utilidad para formatear fechas en diferentes formatos
 */

/**
 * Formatea una fecha en formato legible en español
 * @param {string|Date|Array} dateString - La fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    let date;

    // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(dateString) && dateString.length >= 6) {
      date = new Date(
        dateString[0],
        dateString[1] - 1,
        dateString[2],
        dateString[3],
        dateString[4],
        dateString[5]
      );
    } else if (typeof dateString === 'string') {
      // Try different parsing strategies
      if (dateString.includes('T')) {
        // ISO format with time
        date = new Date(dateString);
      } else if (dateString.includes('-') && dateString.length === 10) {
        // Date only format: "2024-12-15"
        date = new Date(dateString + 'T00:00:00');
      } else {
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      date = new Date(dateString);
    }

    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Error en fecha';
  }
};

/**
 * Obtiene las iniciales de un nombre completo
 * @param {string} name - Nombre completo
 * @returns {string} - Iniciales (2 caracteres)
 */
export const getDoctorInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  const firstInitial = parts[0]?.charAt(0)?.toUpperCase() || '?';
  const lastInitial = parts.at(-1)?.charAt(0)?.toUpperCase() || '?';
  return `${firstInitial}${lastInitial}`;
};
