import React from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { DatesProvider } from '@mantine/dates';
import { useTheme } from './negocio/contexts/ThemeContext.jsx';
import AppRouter from './presentacion/routes/AppRouter.jsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './styles/checkbox-fix.css';
import 'dayjs/locale/es';

function AppContent() {
  const { tema } = useTheme();

  const mantineTheme = createTheme({
    primaryColor: tema.mantineColor,
    colors: {
      brand: [
        tema.primaryColor + '10',
        tema.primaryColor + '20',
        tema.primaryColor + '30',
        tema.primaryColor + '40',
        tema.primaryColor,
        tema.secondaryColor,
        tema.secondaryColor + '20',
        tema.secondaryColor + '30',
        tema.secondaryColor + '40',
        tema.secondaryColor + '50',
      ]
    },
    defaultRadius: 'md',
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  });

  return (
    <MantineProvider theme={mantineTheme}>
      <ModalsProvider>
        <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
          <Notifications />
          <AppRouter />
        </DatesProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
