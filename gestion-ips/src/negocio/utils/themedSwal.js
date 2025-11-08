/**
 * ThemedSwal - Wrapper de SweetAlert2 con colores del tema
 */

import Swal from 'sweetalert2';

let currentTheme = null;

export const setThemeForSwal = (tema) => {
  currentTheme = tema;
};

export const ThemedSwal = {
  fire: (options) => {
    if (!currentTheme) {
      return Swal.fire(options);
    }

    const themedOptions = {
      ...options,
      confirmButtonColor: options.confirmButtonColor || currentTheme.primaryColor,
      cancelButtonColor: options.cancelButtonColor || '#6B7280',
      // Personalizar más si es necesario
      customClass: {
        ...options.customClass,
        confirmButton: 'themed-confirm-button',
        cancelButton: 'themed-cancel-button'
      }
    };

    return Swal.fire(themedOptions);
  },

  // Atajos comunes con tema aplicado
  success: (title, text) => {
    return ThemedSwal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false
    });
  },

  error: (title, text, footer) => {
    return ThemedSwal.fire({
      icon: 'error',
      title,
      text,
      footer,
      confirmButtonText: 'Entendido'
    });
  },

  confirm: (title, text, confirmText = 'Sí, confirmar', cancelText = 'Cancelar') => {
    return ThemedSwal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true
    });
  },

  info: (title, text) => {
    return ThemedSwal.fire({
      icon: 'info',
      title,
      text
    });
  }
};
