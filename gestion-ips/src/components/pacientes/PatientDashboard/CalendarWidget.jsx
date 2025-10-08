import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const CalendarWidget = ({ onDaySelect, onNewPatient, onOpenAgenda }) => {
  // Quick actions for common tasks
  const quickActions = [
    {
      title: 'Nuevo Paciente',
      description: 'Registrar paciente',
      icon: PlusIcon,
      color: 'bg-blue-500',
      action: onNewPatient || (() => console.log('Nuevo paciente'))
    },
    {
      title: 'Agenda',
      description: 'Ver citas pendientes',
      icon: CalendarDaysIcon,
      color: 'bg-green-500',
      action: onOpenAgenda || (() => console.log('Ver agenda'))
    }
  ];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Meses en español
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Obtener primer día del mes
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  // Generar días del calendario
  const calendarDays = [];
  const day = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle day click
  const handleDayClick = (date) => {
    if (!isCurrentMonth(date)) return;

    setSelectedDate(date);
    if (onDaySelect) {
      onDaySelect(date);
    }
  };

  // Check if date is selected
  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {months[currentMonth]} {currentYear}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
          >
            Hoy
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dayNumber = date.getDate();
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDay = isToday(date);
          const isSelectedDay = isSelected(date);

          return (
            <div
              key={index}
              onClick={() => handleDayClick(date)}
              className={`
                relative p-2 text-center text-sm cursor-pointer hover:bg-gray-50 rounded-md transition-colors
                ${isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}
                ${isTodayDay ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                ${isSelectedDay ? 'bg-green-600 text-white hover:bg-green-700' : ''}
              `}
            >
              <span className={`inline-block w-6 h-6 leading-6 rounded-full ${
                isTodayDay ? 'bg-blue-600 text-white' :
                isSelectedDay ? 'bg-green-600 text-white' : ''
              }`}>
                {dayNumber}
              </span>

              {/* Placeholder para eventos/citas */}
              {isCurrentMonthDay && Math.random() > 0.8 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>


      {/* Quick Actions */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Acciones Rápidas</h4>
        <div className="space-y-2">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className={`flex-shrink-0 ${action.color} rounded-lg p-1.5`}>
                  <IconComponent className="h-3 w-3 text-white" />
                </div>
                <div className="ml-2 text-left">
                  <p className="text-xs font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            <span>Citas programadas</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
            <span>Seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;