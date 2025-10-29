import React from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { usePatientForm } from "../../../../../negocio/hooks/pacientes/usePatientForm.js";
import BasicInfoSection from './BasicInfoSection.jsx';
import PersonalInfoSection from './PersonalInfoSection.jsx';
import ContactInfoSection from './ContactInfoSection.jsx';
import MedicalInfoSection from './MedicalInfoSection.jsx';
import ConsentSection from './ConsentSection.jsx';
import EmergencyContactSection from './EmergencyContactSection.jsx';
import '/src/styles/createPatientModal.css';

const CreatePatientModal = ({
  isOpen,
  onClose,
  onPatientCreated = undefined,
  prefillDocumentNumber = undefined,
  editingPatient = null,
}) => {
  const {
    formData,
    parsedData,
    saving,
    error,
    validationErrors,
    handleInputChange,
    handleNestedInputChange,
    submitForm
  } = usePatientForm(editingPatient, prefillDocumentNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitForm(onPatientCreated);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-4xl">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

             <form onSubmit={handleSubmit}>
               <BasicInfoSection
                 formData={formData}
                 handleInputChange={handleInputChange}
                 validationErrors={validationErrors}
               />

               <PersonalInfoSection
                 parsedData={parsedData}
                 handleNestedInputChange={handleNestedInputChange}
                 validationErrors={validationErrors}
               />

               <ContactInfoSection
                 parsedData={parsedData}
                 handleNestedInputChange={handleNestedInputChange}
                 validationErrors={validationErrors}
               />

               <MedicalInfoSection
                 parsedData={parsedData}
                 handleNestedInputChange={handleNestedInputChange}
                 validationErrors={validationErrors}
               />

               <ConsentSection
                 parsedData={parsedData}
                 handleNestedInputChange={handleNestedInputChange}
                 validationErrors={validationErrors}
               />

               <EmergencyContactSection
                 parsedData={parsedData}
                 handleNestedInputChange={handleNestedInputChange}
                 validationErrors={validationErrors}
               />

               {/* Submit Buttons */}
               <div className="flex justify-end space-x-3 pt-6 border-t">
                 <button
                   type="button"
                   onClick={onClose}
                   className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                 >
                   Cancelar
                 </button>
                 <button
                   type="submit"
                   disabled={saving}
                   className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {saving ? (
                     <div className="flex items-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Guardando...
                     </div>
                   ) : (editingPatient ? 'Actualizar Paciente' : 'Crear Paciente')}
                 </button>
               </div>
             </form>
           </div>
            </div>
          </div>
        </div>
      </div>
    
  );
};

CreatePatientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPatientCreated: PropTypes.func,
  prefillDocumentNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  editingPatient: PropTypes.object,
};

export default CreatePatientModal;