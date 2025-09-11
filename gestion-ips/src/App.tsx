import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '@/context/AuthContext';
import AppRouter from '@/routes/AppRouter';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  return (
    <MantineProvider>
      <Notifications />
      <Router>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </Router>
    </MantineProvider>
  );
}

export default App;
