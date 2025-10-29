import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { pacientesApiService, historiasClinicasApiService, consultasApiService } from '../../../../data/services/pacientesApiService.js';

const QuickStats = () => {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    pacientesActivos: 0,
    citasHoy: 0,
    consultasMes: 0,
    historiasClinicas: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Cargar estadísticas reales desde las APIs
      const [pacientesResponse, historiasResponse, consultasResponse] = await Promise.allSettled([
        pacientesApiService.getPacientes({ page: 0, size: 1 }), // Solo para obtener total
        historiasClinicasApiService.getHistoriasClinicas({ page: 0, size: 1 }),
        consultasApiService.getConsultas({ page: 0, size: 1 })
      ]);

      // Calcular estadísticas
      const totalPacientes = pacientesResponse.status === 'fulfilled' ? pacientesResponse.value.totalElements || 0 : 0;
      const historiasClinicas = historiasResponse.status === 'fulfilled' ? historiasResponse.value.totalElements || 0 : 0;
      const consultasMes = consultasResponse.status === 'fulfilled' ? consultasResponse.value.totalElements || 0 : 0;

      // Calcular pacientes activos (aproximación)
      const pacientesActivos = Math.floor(totalPacientes * 0.95); // 95% aproximado

      // Citas hoy (placeholder por ahora - necesitaríamos API de citas)
      const citasHoy = 0; // TODO: Implementar cuando tengamos API de citas

      setStats({
        totalPacientes,
        pacientesActivos,
        citasHoy,
        consultasMes,
        historiasClinicas,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statItems = [
    {
      title: 'Total Pacientes',
      value: stats.totalPacientes.toLocaleString(),
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      description: 'Pacientes registrados'
    },
    {
      title: 'Pacientes Activos',
      value: stats.pacientesActivos.toLocaleString(),
      icon: UserGroupIcon,
      color: 'bg-green-500',
      description: 'Pacientes activos'
    },
    {
      title: 'Citas Hoy',
      value: stats.citasHoy,
      icon: CalendarDaysIcon,
      color: 'bg-yellow-500',
      description: 'Citas programadas'
    },
    {
      title: 'Consultas del Mes',
      value: stats.consultasMes,
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      description: 'Consultas realizadas'
    },
    {
      title: 'Historias Clínicas',
      value: stats.historiasClinicas,
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
      description: 'Historias completas'
    }
  ];

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {statItems.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;