import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PacientesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente a PatientDashboard
    navigate('/pacientes/dashboard', { replace: true });
  }, [navigate]);

  return null;
}

export default PacientesPage;