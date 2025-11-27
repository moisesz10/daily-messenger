import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/subscribe': 'http://localhost:3000',
      '/unsubscribe': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
    }
  }
})
