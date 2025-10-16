/**
 * Componente Modal Dinámico Genérico
 * Presentation Layer - UI Components
 *
 * Modal reutilizable que puede renderizar diferentes tipos de contenido
 * basado en el tipo especificado y los datos proporcionados.
 */
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Tipos de modal disponibles
export const MODAL_TYPES = {
  // Facturación
  FACTURA_PREVIEW: 'factura_preview',
  FACTURA_VIEW: 'factura_view',
  VALOR_CUPS: 'valor_cups',

  // Historias clínicas
  HISTORIA_CLINICA_FORM: 'historia_clinica_form',
  HISTORIA_CLINICA_VIEW: 'historia_clinica_view',

  // Pacientes
  PACIENTE_DETAIL: 'paciente_detail',
  PACIENTE_CREATE: 'paciente_create',
  PACIENTE_EDIT: 'paciente_edit',

  // Citas
  CITA_DETAIL: 'cita_detail',
  CITA_SCHEDULE: 'cita_schedule',

  // Genérico
  CONFIRMATION: 'confirmation',
  INFO: 'info',
  CUSTOM: 'custom'
};

// Configuraciones por defecto para cada tipo de modal
const MODAL_CONFIGS = {
  [MODAL_TYPES.FACTURA_PREVIEW]: {
    title: 'Previsualización de Factura',
    size: 'max-w-4xl',
    bgColor: 'bg-blue-600'
  },
  [MODAL_TYPES.FACTURA_VIEW]: {
    title: 'Detalles de Factura',
    size: 'max-w-4xl',
    bgColor: 'bg-blue-600'
  },
  [MODAL_TYPES.VALOR_CUPS]: {
    title: 'Editar Valor',
    size: 'max-w-md',
    bgColor: 'bg-blue-600'
  },
  [MODAL_TYPES.HISTORIA_CLINICA_FORM]: {
    title: 'Nueva Historia Clínica',
    size: 'w-3/4 h-3/4',
    bgColor: 'bg-green-600'
  },
  [MODAL_TYPES.HISTORIA_CLINICA_VIEW]: {
    title: 'Historia Clínica',
    size: 'max-w-4xl',
    bgColor: 'bg-green-600'
  },
  [MODAL_TYPES.PACIENTE_DETAIL]: {
    title: 'Detalles del Paciente',
    size: 'max-w-2xl',
    bgColor: 'bg-indigo-600'
  },
  [MODAL_TYPES.PACIENTE_CREATE]: {
    title: 'Crear Paciente',
    size: 'max-w-2xl',
    bgColor: 'bg-indigo-600'
  },
  [MODAL_TYPES.PACIENTE_EDIT]: {
    title: 'Editar Paciente',
    size: 'max-w-2xl',
    bgColor: 'bg-indigo-600'
  },
  [MODAL_TYPES.CITA_DETAIL]: {
    title: 'Detalles de la Cita',
    size: 'max-w-4xl',
    bgColor: 'bg-purple-600'
  },
  [MODAL_TYPES.CITA_SCHEDULE]: {
    title: 'Agendar Cita',
    size: 'max-w-2xl',
    bgColor: 'bg-purple-600'
  },
  [MODAL_TYPES.CONFIRMATION]: {
    title: 'Confirmar Acción',
    size: 'max-w-md',
    bgColor: 'bg-yellow-600'
  },
  [MODAL_TYPES.INFO]: {
    title: 'Información',
    size: 'max-w-md',
    bgColor: 'bg-gray-600'
  }
};

const DynamicModal = ({
  isOpen,
  onClose,
  type,
  data = {},
  customTitle,
  customSize,
  customBgColor,
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  onBackdropClick,
  className = ''
}) => {
  // Si no está abierto, no renderizar
  if (!isOpen) return null;

  // Obtener configuración del modal
  const config = MODAL_CONFIGS[type] || {};
  const title = customTitle || config.title || 'Modal';
  const size = customSize || config.size || 'max-w-md';
  const bgColor = customBgColor || config.bgColor || 'bg-blue-600';

  // Función para manejar el click en el backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (closeOnBackdropClick) {
        onClose();
      }
      onBackdropClick && onBackdropClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={handleBackdropClick}
          ></div>
        </div>

        {/* Modal */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all ${size} ${className}`}>
          {/* Header */}
          <div className={`${bgColor} px-4 py-3 flex items-center justify-between`}>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children ? (
              // Renderizar children personalizados
              children
            ) : (
              // Renderizar contenido basado en el tipo
              <ModalContentRenderer type={type} data={data} onClose={onClose} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para renderizar contenido basado en el tipo
const ModalContentRenderer = ({ type, data, onClose }) => {
  switch (type) {
    case MODAL_TYPES.FACTURA_PREVIEW:
      return <FacturaPreviewContent data={data} onClose={onClose} />;

    case MODAL_TYPES.FACTURA_VIEW:
      return <FacturaViewContent data={data} onClose={onClose} />;

    case MODAL_TYPES.VALOR_CUPS:
      return <ValorCupsContent data={data} onClose={onClose} />;

    case MODAL_TYPES.HISTORIA_CLINICA_FORM:
      return <HistoriaClinicaFormContent data={data} onClose={onClose} />;

    case MODAL_TYPES.CONFIRMATION:
      return <ConfirmationContent data={data} onClose={onClose} />;

    case MODAL_TYPES.INFO:
      return <InfoContent data={data} onClose={onClose} />;

    default:
      return (
        <div className="p-6">
          <p className="text-gray-600">Tipo de modal no implementado: {type}</p>
        </div>
      );
  }
};

// Importar contenidos específicos
import {
  FacturaPreviewContent,
  FacturaViewContent,
  ValorCupsContent,
  HistoriaClinicaFormContent
} from './ModalContents.jsx';

const ConfirmationContent = ({ data, onClose }) => (
  <div className="p-6">
    <div className="text-center">
      <h4 className="text-lg font-medium text-gray-900 mb-2">
        {data.title || '¿Confirmar acción?'}
      </h4>
      <p className="text-gray-600 mb-6">
        {data.message || '¿Está seguro de que desea continuar?'}
      </p>
      <div className="flex justify-center space-x-3">
        <button
          onClick={() => {
            data.onConfirm && data.onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-white rounded hover:opacity-90 ${
            data.confirmColor || 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {data.confirmText || 'Confirmar'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {data.cancelText || 'Cancelar'}
        </button>
      </div>
    </div>
  </div>
);

const InfoContent = ({ data, onClose }) => (
  <div className="p-6">
    <div className="text-center">
      <h4 className="text-lg font-medium text-gray-900 mb-2">
        {data.title || 'Información'}
      </h4>
      <p className="text-gray-600 mb-6">
        {data.message || 'Mensaje informativo'}
      </p>
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {data.buttonText || 'Aceptar'}
        </button>
      </div>
    </div>
  </div>
);

export default DynamicModal;