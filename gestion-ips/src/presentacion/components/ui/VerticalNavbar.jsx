import React from 'react';
import { useAuth } from '../../../data/context/AuthContext.jsx';
import { Link, useLocation } from 'react-router-dom';
import { PERMISSIONS } from '../../../negocio/utils/auth/permissions.js';
import { usePermissionsContext } from '../../../negocio/contexts/PermissionsContext.jsx';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';
import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconCash,
  IconUserDollar,
  IconReceipt,
  IconChartLine,
  IconSettings,
  IconLogout
} from '@tabler/icons-react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: IconDashboard,
    module: null, // Siempre visible
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: IconUsers,
    module: PERMISSIONS.USUARIOS,
  },
  {
    name: 'Pacientes',
    href: '/pacientes',
    icon: IconBuilding,
    module: PERMISSIONS.PACIENTES,
  },
  {
    name: 'Facturación',
    href: '/facturacion',
    icon: IconCash,
    module: PERMISSIONS.FACTURACION,
  },
  {
    name: 'Empleados',
    href: '/empleados',
    icon: IconUsers,
    module: PERMISSIONS.NOMINA,
  },
  {
    name: 'Nómina',
    href: '/nomina',
    icon: IconReceipt,
    module: PERMISSIONS.NOMINA,
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: IconChartLine,
    module: PERMISSIONS.REPORTES,
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: IconSettings,
    module: PERMISSIONS.CONFIGURACION,
  },
];

export const VerticalNavbar = ({ isOpen = false, onClose }) => {
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

  const handleLinkClick = () => {
    // Cerrar sidebar en móvil al hacer clic en un link
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`
      flex flex-col h-screen w-64 bg-white shadow-lg border-r border-gray-200
      fixed lg:sticky top-0 left-0 z-50
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo/Brand Section */}
      <div 
        className="flex items-center justify-between h-16 px-4"
        style={{ background: tema.gradient }}
      >
        <h1 className="text-white text-lg font-semibold">
          Gestión IPS
        </h1>
        {/* Botón cerrar para móvil */}
        <button
          onClick={onClose}
          className="lg:hidden text-white p-1 hover:bg-white/10 rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* User Info Section */}
      <div className="px-3 py-4 border-b border-gray-200">
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
      <nav className="flex-1 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleLinkClick}
              className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
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
              <span className="mr-3">
                <item.icon size={20} stroke={1.5} />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <span className="mr-3">
            <IconLogout size={20} stroke={1.5} />
          </span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
