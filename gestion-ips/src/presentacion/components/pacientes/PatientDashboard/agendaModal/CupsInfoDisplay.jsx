import React from 'react';

const CupsInfoDisplay = ({ selectedCupData }) => {
  if (!selectedCupData) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Información CUPS</h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {selectedCupData.categoria && (
          <div>
            <span className="font-medium text-blue-800">Categoría:</span>
            <p className="text-blue-700">{selectedCupData.categoria}</p>
          </div>
        )}
        {selectedCupData.especialidad && (
          <div>
            <span className="font-medium text-blue-800">Especialidad:</span>
            <p className="text-blue-700">{selectedCupData.especialidad}</p>
          </div>
        )}
        {selectedCupData.tipo && (
          <div>
            <span className="font-medium text-blue-800">Tipo:</span>
            <p className="text-blue-700">{selectedCupData.tipo}</p>
          </div>
        )}
        {selectedCupData.ambito && (
          <div>
            <span className="font-medium text-blue-800">Ámbito:</span>
            <p className="text-blue-700">{selectedCupData.ambito}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CupsInfoDisplay;