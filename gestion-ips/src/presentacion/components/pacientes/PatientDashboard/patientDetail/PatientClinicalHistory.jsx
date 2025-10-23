import React from 'react';
import PropTypes from 'prop-types';
import { DocumentTextIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar la historia clínica resumida del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientClinicalHistory = ({ historiaClinica, consultas, setActiveTab, formatDate }) => {
  return (
    <div className="patient-detail-container">
      <div className="flex items-center justify-between">
        <h4 className="patient-detail-header">Historia Clínica</h4>
        {historiaClinica && (
          <button
            onClick={() => setActiveTab('clinica_completa')}
            className="patient-detail-btn-primary"
          >
            <DocumentTextIcon className="patient-detail-icon-blue" />
            Ver Historia Clínica Completa
          </button>
        )}
      </div>

      {historiaClinica ? (
        <div className="patient-detail-section">
          {/* Información de la Historia */}
          <div className="patient-detail-card-blue">
            <h5 className="patient-history-info">Información General</h5>
            <div className="patient-history-grid patient-detail-max-width-none">
              <div>
                <span className="patient-history-label">Número de Historia:</span>
                <p className="patient-history-value">{historiaClinica.numeroHistoria}</p>
              </div>
              <div>
                <span className="patient-history-label">Fecha de Apertura:</span>
                <p className="patient-history-value">{formatDate(historiaClinica.fechaApertura)}</p>
              </div>
              <div>
                <span className="patient-history-label">Estado:</span>
                <p className="patient-history-value">{historiaClinica.activa ? 'Activa' : 'Inactiva'}</p>
              </div>
            </div>
          </div>

          {/* Consultas Médicas */}
          <div>
            <h5 className="patient-history-consultas-title">Consultas Médicas ({consultas.length})</h5>

            {consultas.length === 0 ? (
              <div className="patient-detail-empty-state">
                <CalendarDaysIcon className="patient-detail-empty-icon" />
                <p className="patient-detail-empty-text">No hay consultas registradas</p>
              </div>
            ) : (
              <div className="patient-detail-list">
                {consultas.map((consulta, index) => (
                  <div key={consulta.id} className="patient-history-consulta-item">
                    <div className="patient-history-consulta-header">
                      <div className="patient-history-consulta-avatar">
                        <div className="patient-history-consulta-number">
                          <span className="patient-history-consulta-text">{index + 1}</span>
                        </div>
                        <div>
                          <p className="patient-history-consulta-title">Consulta #{consulta.id}</p>
                          <p className="patient-history-consulta-date">
                            {formatDate(consulta.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                      <div className="patient-history-consulta-right">
                        <p className="patient-history-consulta-label">Creada</p>
                        <p className="patient-history-consulta-value">{formatDate(consulta.fechaCreacion)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="patient-detail-empty-state">
          <DocumentTextIcon className="patient-detail-empty-icon" />
          <h3 className="patient-detail-empty-title">No hay historia clínica</h3>
          <p className="patient-detail-empty-text">
            Este paciente aún no tiene una historia clínica registrada.
          </p>
        </div>
      )}
    </div>
  )
};

PatientClinicalHistory.propTypes = {
  historiaClinica: PropTypes.shape({
    numeroHistoria: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fechaApertura: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    activa: PropTypes.bool,
  }),
  consultas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fechaCreacion: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    })
  ).isRequired,
  setActiveTab: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};


export default PatientClinicalHistory;