import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@mantine/core';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';

 // Import extracted components
 import ScheduleAppointmentHeader from './ScheduleAppointmentHeader.jsx';
 import ScheduleAppointmentForm from './ScheduleAppointmentForm.jsx';

// Import custom hooks from business layer
import { useAppointmentData } from '../../../../../negocio/hooks/citas/useAppointmentData.js';
import { useAppointmentForm } from '../../../../../negocio/hooks/citas/useAppointmentForm.js';
import { useAppointmentSubmission } from '../../../../../negocio/hooks/citas/useAppointmentSubmission.js';

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

  const { tema } = useTheme();

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={<ScheduleAppointmentHeader patientName={patientName} loading={loading} />}
      size="xl"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
      overlayProps={{ color: tema.primaryColor, opacity: 0.55, blur: 3 }}
      styles={{ header: { backgroundColor: `${tema.primaryColor} !important`, padding: '10px 16px' }, title: { color: 'white !important' }, close: { color: 'white !important' } }}
    >
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
    </Modal>
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