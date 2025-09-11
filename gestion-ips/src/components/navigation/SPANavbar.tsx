import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigationStore, ViewType } from '@/stores/navigationStore';

interface NavItem {
  name: string;
  view: ViewType;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    view: 'dashboard',
    icon: '📊',
  },
  {
    name: 'Usuarios',
    view: 'usuarios',
    icon: '👥',
    roles: ['ADMIN', 'MODERATOR'],
  },
  {
    name: 'Pacientes',
    view: 'pacientes',
    icon: '🏥',
  },
  {
    name: 'Citas',
    view: 'citas',
    icon: '📅',
  },
  {
    name: 'Reportes',
    view: 'reportes',
    icon: '📈',
    roles: ['ADMIN', 'MODERATOR'],
  },
  {
    name: 'Configuración',
    view: 'configuracion',
    icon: '⚙️',
    roles: ['ADMIN'],
  },
];

export const SPANavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentView, setView } = useNavigationStore();

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (view: ViewType) => {
    setView(view);
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return user?.rol && item.roles.includes(user.rol);
  });

  return (
    <div className="flex flex-col h-screen w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Logo/Brand Section */}
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <h1 className="text-white text-lg font-semibold">
          Gestión IPS
        </h1>
      </div>

      {/* User Info Section */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nombres} {user?.apellidos}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.rol}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.view)}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </button>
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
