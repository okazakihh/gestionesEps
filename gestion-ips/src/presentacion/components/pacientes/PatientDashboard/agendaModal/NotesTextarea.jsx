import React from 'react';

const NotesTextarea = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Notas Adicionales
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange('notas', e.target.value)}
        rows={2}
        placeholder="Información adicional, instrucciones especiales, etc..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default NotesTextarea;