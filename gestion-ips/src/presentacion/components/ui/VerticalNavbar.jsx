import React from 'react';
import { useAuth } from '../../../data/context/AuthContext.jsx';
import { Link, useLocation } from 'react-router-dom';
import { PERMISSIONS } from '../../../negocio/utils/auth/permissions.js';
import { usePermissionsContext } from '../../../negocio/contexts/PermissionsContext.jsx';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    module: null, // Siempre visible
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: '👥',
    module: PERMISSIONS.USUARIOS,
  },
  {
    name: 'Pacientes',
    href: '/pacientes',
    icon: '🏥',
    module: PERMISSIONS.PACIENTES,
  },
  {
    name: 'Facturación',
    href: '/facturacion',
    icon: '💰',
    module: PERMISSIONS.FACTURACION,
  },
  {
    name: 'Empleados',
    href: '/empleados',
    icon: '👷',
    module: PERMISSIONS.NOMINA,
  },
  {
    name: 'Nómina',
    href: '/nomina',
    icon: '💵',
    module: PERMISSIONS.NOMINA,
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: '📈',
    module: PERMISSIONS.REPORTES,
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: '⚙️',
    module: PERMISSIONS.CONFIGURACION,
  },
];

export const VerticalNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { checkModuleAccess } = usePermissionsContext();
  const { tema } = useTheme();

  const handleLogout = () => {
    logout();
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.module) return true; // Dashboard siempre visible
    return user?.rol && checkModuleAccess(user.rol, item.module);
  });

  return (
    <div className="flex flex-col h-screen w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Logo/Brand Section */}
      <div 
        className="flex items-center justify-center h-16 px-4"
        style={{ background: tema.gradient }}
      >
        <h1 className="text-white text-lg font-semibold">
          Gestión IPS
        </h1>
      </div>

      {/* User Info Section */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: tema.gradient }}
          >
            <span className="text-white text-sm font-medium">
              {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nombres} {user?.apellidos}
            </p>
            <p 
              className="text-xs truncate font-medium"
              style={{ color: tema.primaryColor }}
            >
              {user?.rol}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              style={isActive ? {
                background: `linear-gradient(90deg, ${tema.primaryColor}20 0%, transparent 100%)`,
                color: tema.primaryColor,
                borderRight: `3px solid ${tema.primaryColor}`
              } : {}}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
        >
          <span className="mr-3 text-lg">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
