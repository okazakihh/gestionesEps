import React from 'react';
import BaseModal from './BaseModal.jsx';
import ModalHeader from './ModalHeader.jsx';
import ModalContent from './ModalContent.jsx';
import ModalFooter from './ModalFooter.jsx';

/**
 * Modal de confirmación reutilizable
 * Para acciones que requieren confirmación del usuario
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "warning", // success, warning, error
  loading = false,
  icon: Icon
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader
        title={title}
        onClose={onClose}
        variant={variant}
        icon={Icon}
      />

      <ModalContent>
        <p className="text-gray-700">{message}</p>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed ${
            variant === 'error' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
            variant === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
            'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </>
          ) : (
            confirmText
          )}
        </button>
      </ModalFooter>
    </BaseModal>
  );
};

export default ConfirmationModal;