import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/presentacion/components"),
      "@/pages": path.resolve(__dirname, "./src/presentacion/pages"),
      "@/hooks": path.resolve(__dirname, "./src/negocio/hooks"),
      "@/utils": path.resolve(__dirname, "./src/negocio/utils"),
      "@/api": path.resolve(__dirname, "./src/data/api"),
      "@/types": path.resolve(__dirname, "./src/data/types"),
      "@/stores": path.resolve(__dirname, "./src/data/stores"),
      "@/context": path.resolve(__dirname, "./src/data/context"),
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
