import React from 'react';
import BaseModal from './BaseModal.jsx';
import ModalHeader from './ModalHeader.jsx';
import ModalContent from './ModalContent.jsx';

/**
 * Modal de carga reutilizable
 * Para mostrar progreso de operaciones asíncronas
 */
const LoadingModal = ({
  isOpen,
  title = "Procesando...",
  message = "Por favor espere mientras se completa la operación",
  showProgress = false,
  progress = 0
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      size="sm"
      closeOnBackdrop={false}
      showCloseButton={false}
    >
      <ModalHeader title={title} showCloseButton={false} />

      <ModalContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

          <div className="text-center">
            <p className="text-gray-700 font-medium">{message}</p>
            {showProgress && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{progress}% completado</p>
              </div>
            )}
          </div>
        </div>
      </ModalContent>
    </BaseModal>
  );
};

export default LoadingModal;