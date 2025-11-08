import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/globals.css'
import { AuthProvider } from './data/context/AuthContext.jsx'
import { ClinicalHistoryProvider } from './data/context/ClinicalHistoryContext.jsx'
import { PermissionsProvider } from './negocio/contexts/PermissionsContext.jsx'
import { ThemeProvider } from './negocio/contexts/ThemeContext.jsx'
import { registerServiceWorker } from './serviceWorker.js'

// Registrar Service Worker al iniciar la aplicación
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PermissionsProvider>
          <ClinicalHistoryProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <App />
            </BrowserRouter>
          </ClinicalHistoryProvider>
        </PermissionsProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
