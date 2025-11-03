import React from 'react';
import { Select, Stack, Text } from '@mantine/core';

const CupsSelect = ({ codigosCups, value, onChange, loadingCodigosCups, errors }) => {
  return (
    <Select
      label="Código CUPS"
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
      withAsterisk
    />
  );
};

export default CupsSelect;