import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Capa de Datos
      "@/data": path.resolve(__dirname, "./src/data"),
      "@/api": path.resolve(__dirname, "./src/data/api"),
      "@/services": path.resolve(__dirname, "./src/data/services"),
      "@/repositories": path.resolve(__dirname, "./src/data/repositories"),
      // Capa de Negocio
      "@/negocio": path.resolve(__dirname, "./src/negocio"),
      "@/hooks": path.resolve(__dirname, "./src/negocio/hooks"),
      "@/context": path.resolve(__dirname, "./src/negocio/context"),
      "@/useCases": path.resolve(__dirname, "./src/negocio/useCases"),
      "@/utils": path.resolve(__dirname, "./src/negocio/utils"),
      // Capa de Presentación
      "@/presentacion": path.resolve(__dirname, "./src/presentacion"),
      "@/components": path.resolve(__dirname, "./src/presentacion/components"),
      "@/pages": path.resolve(__dirname, "./src/presentacion/pages"),
      "@/routes": path.resolve(__dirname, "./src/presentacion/routes"),
      "@/stores": path.resolve(__dirname, "./src/presentacion/stores"),
      "@/types": path.resolve(__dirname, "./src/presentacion/types"),
      // Capa de Estilos
      "@/estilos": path.resolve(__dirname, "./src/estilos"),
      "@/styles": path.resolve(__dirname, "./src/estilos"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        // Proxy to gateway for all API requests
        target: process.env.VITE_API_URL || 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand'],
  },
})
