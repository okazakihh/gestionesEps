import React from 'react';
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
    <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Primera fila: Fecha/Hora, Médico, Código CUPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DateTimeField
            value={formData.fechaHoraCita}
            onChange={onInputChange}
            min={getMinDateTime()}
            errors={errors}
          />

          <DoctorSelect
            value={formData.medicoAsignado}
            onChange={onInputChange}
            medicos={medicos}
            loadingMedicos={loadingMedicos}
            errors={errors}
          />

          <CupsSelect
            codigosCups={codigosCups}
            value={formData.codigoCups}
            onChange={onInputChange}
            loadingCodigosCups={loadingCodigosCups}
            errors={errors}
          />
        </div>

        {/* Segunda fila: Motivo y Estado/Duración */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ReasonTextarea
            value={formData.motivo}
            onChange={onInputChange}
            errors={errors}
          />

          <StatusAndDurationFields
            estado={formData.estado}
            duracion={formData.duracion}
            onChange={onInputChange}
          />
        </div>

        {/* Información del Código CUPS seleccionado */}
        <CupsInfoDisplay selectedCupData={selectedCupData} />

        {/* Notas adicionales */}
        <NotesTextarea
          value={formData.notas}
          onChange={onInputChange}
        />

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
      </div>
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