import React from 'react';
import { Stack, Grid } from '@mantine/core';
import DateTimeField from './DateTimeField.jsx';
import DoctorSelect from './DoctorSelect.jsx';
import CupsSelect from './CupsSelect.jsx';
import ReasonTextarea from './ReasonTextarea.jsx';
import StatusAndDurationFields from './StatusAndDurationFields.jsx';
import CupsInfoDisplay from './CupsInfoDisplay.jsx';
import NotesTextarea from './NotesTextarea.jsx';
import ErrorDisplay from './ErrorDisplay.jsx';
import FormActions from './FormActions.jsx';

const ScheduleAppointmentForm = ({
  formData,
  errors,
  submitError,
  debugInfo,
  codigosCups,
  loadingCodigosCups,
  medicos,
  loadingMedicos,
  selectedCupData,
  patientName,
  loading,
  onInputChange,
  onClose,
  onSubmit,
  setSubmitError
}) => {
  return (
    <form onSubmit={onSubmit}>
      <Stack gap="lg">
        {/* Primera fila: Fecha/Hora, Médico, Código CUPS */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <DateTimeField
              value={formData.fechaHoraCita}
              onChange={onInputChange}
              min={getMinDateTime()}
              errors={errors}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <DoctorSelect
              value={formData.medicoAsignado}
              onChange={onInputChange}
              medicos={medicos}
              loadingMedicos={loadingMedicos}
              errors={errors}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <CupsSelect
              codigosCups={codigosCups}
              value={formData.codigoCups}
              onChange={onInputChange}
              loadingCodigosCups={loadingCodigosCups}
              errors={errors}
            />
          </Grid.Col>
        </Grid>

        {/* Información del Código CUPS seleccionado */}
        <CupsInfoDisplay selectedCupData={selectedCupData} />

        {/* Segunda fila: Motivo */}
        <ReasonTextarea
          value={formData.motivo}
          onChange={onInputChange}
          errors={errors}
        />

        {/* Tercera fila: Estado y Duración */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <StatusAndDurationFields
              estado={formData.estado}
              duracion={formData.duracion}
              onChange={onInputChange}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <NotesTextarea
              value={formData.notas}
              onChange={onInputChange}
            />
          </Grid.Col>
        </Grid>

        {/* Error Display */}
        <ErrorDisplay
          submitError={submitError}
          debugInfo={debugInfo}
          setError={setSubmitError}
        />

        {/* Información del paciente y acciones */}
        <FormActions
          patientName={patientName}
          loading={loading}
          onClose={onClose}
        />
      </Stack>
    </form>
  );
};

const getMinDateTime = () => {
  const now = new Date();
  // Add 1 hour from now to give some buffer time
  now.setHours(now.getHours() + 1);
  return now.toISOString().slice(0, 16); // Format for datetime-local input
};

export default ScheduleAppointmentForm;