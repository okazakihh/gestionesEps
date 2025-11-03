import React from 'react';
import { Paper, Title, Grid, Text, Stack } from '@mantine/core';

const CupsInfoDisplay = ({ selectedCupData }) => {
  if (!selectedCupData) return null;

  return (
    <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
      <Title order={5} mb="sm" c="blue">Información CUPS</Title>
      <Grid gutter="md">
        {selectedCupData.categoria && (
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Stack gap={4}>
              <Text size="xs" fw={500} c="blue.9">Categoría:</Text>
              <Text size="xs" c="blue.7">{selectedCupData.categoria}</Text>
            </Stack>
          </Grid.Col>
        )}
        {selectedCupData.especialidad && (
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Stack gap={4}>
              <Text size="xs" fw={500} c="blue.9">Especialidad:</Text>
              <Text size="xs" c="blue.7">{selectedCupData.especialidad}</Text>
            </Stack>
          </Grid.Col>
        )}
        {selectedCupData.tipo && (
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Stack gap={4}>
              <Text size="xs" fw={500} c="blue.9">Tipo:</Text>
              <Text size="xs" c="blue.7">{selectedCupData.tipo}</Text>
            </Stack>
          </Grid.Col>
        )}
        {selectedCupData.ambito && (
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Stack gap={4}>
              <Text size="xs" fw={500} c="blue.9">Ámbito:</Text>
              <Text size="xs" c="blue.7">{selectedCupData.ambito}</Text>
            </Stack>
          </Grid.Col>
        )}
      </Grid>
    </Paper>
  );
};

export default CupsInfoDisplay;