import React from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import AppRouter from './presentacion/routes/AppRouter.jsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications />
        <AppRouter />
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
