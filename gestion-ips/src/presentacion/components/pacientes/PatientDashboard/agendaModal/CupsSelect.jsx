import React from 'react';
import { Select } from '@mantine/core';

const CupsSelect = ({ codigosCups, value, onChange, loadingCodigosCups, errors }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Código CUPS *
      </label>
      <Select
        placeholder="Buscar código..."
        data={codigosCups.map((codigo) => ({
          value: codigo.codigoCup,
          label: `${codigo.codigoCup} - ${codigo.nombreCup}`
        }))}
        value={value}
        onChange={(value) => onChange('codigoCups', value)}
        searchable
        clearable={false}
        disabled={loadingCodigosCups}
        required
        error={errors.codigoCups}
      />
    </div>
  );
};

export default CupsSelect;