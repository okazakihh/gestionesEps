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

    // Prevent selecting dates before today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    const selectedDateOnly = new Date(date);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (selectedDateOnly < today) {
      return; // Don't allow selecting past dates
    }

    setSelectedDate(date);
    if (onDaySelect) {
      onDaySelect(date);
    }
  };

  // Check if date is selected
  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    return dateToCheck < today;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          {months[currentMonth]} {currentYear}
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
          >
            Hoy
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="p-1 text-center text-xs font-medium text-gray-500">
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
           const isPastDay = isPastDate(date);

           return (
             <div
               key={index}
               onClick={() => handleDayClick(date)}
               className={`
                 relative p-1 text-center text-xs rounded transition-colors
                 ${isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'}
                 ${isTodayDay ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                 ${isSelectedDay ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                 ${isPastDay && isCurrentMonthDay ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-gray-50'}
               `}
               title={isPastDay && isCurrentMonthDay ? 'No se pueden seleccionar fechas pasadas' : isCurrentMonthDay ? 'Click para seleccionar esta fecha' : ''}
             >
              <span className={`inline-block w-5 h-5 leading-5 rounded-full ${
                isTodayDay ? 'bg-blue-600 text-white' :
                isSelectedDay ? 'bg-green-600 text-white' : ''
              }`}>
                {dayNumber}
              </span>

              {/* Placeholder para eventos/citas */}
              {isCurrentMonthDay && Math.random() > 0.8 && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>


      {/* Quick Actions */}
      <div className="border-t pt-3">
        <h4 className="text-xs font-medium text-gray-900 mb-2">Acciones Rápidas</h4>
        <div className="space-y-1">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center p-1.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <div className={`flex-shrink-0 ${action.color} rounded p-1`}>
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
      <div className="border-t pt-3">
        <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
            <span>Citas</span>
          </div>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></div>
            <span>No disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;