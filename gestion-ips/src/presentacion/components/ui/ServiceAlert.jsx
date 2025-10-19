import React from 'react';
import { ExclamationTriangleIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ServiceAlert = ({
  type,
  title,
  message,
  onRetry,
  retryLabel = 'Reintentar'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-md p-4 ${getStyles()}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            type === 'error' ? 'text-red-800' :
            type === 'warning' ? 'text-yellow-800' :
            type === 'success' ? 'text-green-800' : 'text-gray-800'
          }`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${
            type === 'error' ? 'text-red-700' :
            type === 'warning' ? 'text-yellow-700' :
            type === 'success' ? 'text-green-700' : 'text-gray-700'
          }`}>
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm ${
                  type === 'error'
                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                    : type === 'warning'
                    ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {retryLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceAlert;