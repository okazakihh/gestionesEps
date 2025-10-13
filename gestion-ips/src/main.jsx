import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/globals.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ClinicalHistoryProvider } from './context/ClinicalHistoryContext.jsx'
import { registerServiceWorker } from './utils/serviceWorker.js'

// Registrar Service Worker al iniciar la aplicación
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ClinicalHistoryProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClinicalHistoryProvider>
    </AuthProvider>
  </React.StrictMode>,
)
