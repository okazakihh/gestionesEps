import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../data/context/AuthContext.jsx';

interface RequireRoleProps {
  roles: string[]; // nombres de rol esperados (e.g. ['ADMIN'])
  children: React.ReactElement;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles, children }) => {
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
