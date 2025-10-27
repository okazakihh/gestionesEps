import React from 'react';

const ErrorDisplay = ({ submitError, debugInfo, setError }) => {
  if (!submitError) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {submitError.title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{submitError.message}</p>
          </div>
          <div className="mt-3">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-sm font-medium text-red-800 hover:text-red-600"
              >
                Entendido
              </button>
              <details className="text-sm">
                <summary className="cursor-pointer text-red-700 hover:text-red-900 font-medium">
                  Ver detalles técnicos
                </summary>
                <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-900">
                  {debugInfo && (
                    <>
                      <div className="mb-2">
                        <strong>URL:</strong> {debugInfo.url}
                      </div>
                      <div className="mb-2">
                        <strong>Datos enviados:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {JSON.stringify(debugInfo.requestData, null, 2)}
                        </pre>
                      </div>
                      {debugInfo.error && (
                        <div className="mb-2">
                          <strong>Error del cliente:</strong> {debugInfo.error}
                        </div>
                      )}
                      {debugInfo.response && (
                        <div>
                          <strong>Respuesta del servidor:</strong>
                          <pre className="mt-1 whitespace-pre-wrap">
                            {JSON.stringify(debugInfo.response, null, 2)}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;