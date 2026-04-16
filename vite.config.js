import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['ae36667397c3.ngrok-free.app'],
    middlewareMode: false,
  },
  preview: {
    host: true,
  },
})
