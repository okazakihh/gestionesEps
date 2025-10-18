import React from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline';

/**
 * CitasStats - Estadísticas de citas
 */
const CitasStats = ({ citas }) => {
  const stats = React.useMemo(() => {
    const total = citas.length;
    const programadas = citas.filter(c => c.estado === 'PROGRAMADO').length;
    const atendidas = citas.filter(c => c.estado === 'ATENDIDO' || c.estado === 'COMPLETADA').length;
    const canceladas = citas.filter(c => c.estado === 'CANCELADO').length;
    
    return { total, programadas, atendidas, canceladas };
  }, [citas]);

  const statCards = [
    {
      name: 'Total Citas',
      value: stats.total,
      icon: CalendarDaysIcon,
      color: 'blue'
    },
    {
      name: 'Programadas',
      value: stats.programadas,
      icon: ClockIcon,
      color: 'yellow'
    },
    {
      name: 'Atendidas',
      value: stats.atendidas,
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      name: 'Canceladas',
      value: stats.canceladas,
      icon: XCircleIcon,
      color: 'red'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CitasStats;
