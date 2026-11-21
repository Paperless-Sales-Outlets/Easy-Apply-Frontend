import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Paperlessbackup/',
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'react-hot-toast'],
          'vendor-icons': ['lucide-react', 'react-icons'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
