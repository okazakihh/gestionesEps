import React from 'react';

const FormActions = ({ patientName, loading, onClose }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t">
      <div className="bg-gray-50 p-3 rounded-lg flex-1">
        <div className="text-sm text-gray-600">
          <p><strong>Paciente:</strong> {patientName}</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO')}</p>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Agendando...
            </div>
          ) : (
            'Agendar Cita'
          )}
        </button>
      </div>
    </div>
  );
};

export default FormActions;