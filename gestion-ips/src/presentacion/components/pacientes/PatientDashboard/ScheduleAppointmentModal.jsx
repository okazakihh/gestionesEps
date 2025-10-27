import React from 'react';
import PropTypes from 'prop-types';

 // Import extracted components
 import ScheduleAppointmentHeader from './agendaModal/ScheduleAppointmentHeader.jsx';
 import ScheduleAppointmentForm from './agendaModal/ScheduleAppointmentForm.jsx';

// Import custom hooks
import { useAppointmentData } from './hooks/useAppointmentData.js';
import { useAppointmentForm } from './hooks/useAppointmentForm.js';
import { useAppointmentSubmission } from './hooks/useAppointmentSubmission.js';

const ScheduleAppointmentModal = ({ patientId, patientName, selectedSlot, selectedDoctor, isOpen, onClose, onAppointmentCreated }) => {
  // Use custom hooks for clean separation of concerns
  const {
    codigosCups,
    medicos,
    getNombreCompletoMedico,
    loadingCodigosCups,
    loadingMedicos,
    dataError
  } = useAppointmentData();

  const {
    formData,
    errors,
    selectedCupData,
    handleInputChange,
    resetForm,
    setErrors,
    setSelectedCupData
  } = useAppointmentForm(selectedSlot, selectedDoctor, medicos, getNombreCompletoMedico);

  const {
    loading,
    submitError,
    debugInfo,
    submitAppointment,
    setSubmitError
  } = useAppointmentSubmission(patientId, patientName, onAppointmentCreated, onClose);

  // Enhanced input change handler that works with CUPS data from hook
  const enhancedHandleInputChange = (field, value) => {
    // First call the hook's handler
    handleInputChange(field, value);

    // Handle CUPS selection with data from hook
    if (field === 'codigoCups' && value && codigosCups.length > 0) {
      const selectedCup = codigosCups.find(cup => cup.codigoCup === value);
      if (selectedCup && selectedCup.datosJson) {
        try {
          const cupData = JSON.parse(selectedCup.datosJson);
          setSelectedCupData(cupData);
        } catch (error) {
          console.warn('Error parsing CUPS data:', error);
          setSelectedCupData(null);
        }
      } else {
        setSelectedCupData(null);
      }
    }
  };

  // Enhanced submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitAppointment(formData, selectedCupData, setErrors);
    if (success) {
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-11/12 max-w-4xl h-5/6">
          {/* Header */}
          <ScheduleAppointmentHeader
            patientName={patientName}
            loading={loading}
            onClose={onClose}
          />

          {/* Form */}
          <ScheduleAppointmentForm
            formData={formData}
            errors={errors}
            submitError={submitError}
            debugInfo={debugInfo}
            codigosCups={codigosCups}
            loadingCodigosCups={loadingCodigosCups}
            medicos={medicos}
            loadingMedicos={loadingMedicos}
            selectedCupData={selectedCupData}
            patientName={patientName}
            loading={loading}
            onInputChange={enhancedHandleInputChange}
            onClose={onClose}
            onSubmit={handleSubmit}
            setSubmitError={setSubmitError}
          />
        </div>
      </div>
    </div>
  )
};

ScheduleAppointmentModal.propTypes = {
  patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  patientName: PropTypes.string.isRequired,
  selectedSlot: PropTypes.object,
  selectedDoctor: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAppointmentCreated: PropTypes.func
};


export default ScheduleAppointmentModal;