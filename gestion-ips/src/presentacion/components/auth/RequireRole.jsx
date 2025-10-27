import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../data/context/AuthContext.jsx';

export const RequireRole = ({ roles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.rol;
  if (!userRole || !roles.includes(userRole)) {
    return <div className="p-8 text-center text-red-600">Acceso denegado</div>;
  }

  return children;
};

export default RequireRole;
