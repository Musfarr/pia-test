import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['e6b4-103-197-46-226.ngrok-free.app'],
    middlewareMode: false,
  },
  preview: {
    host: true,
  },
})
