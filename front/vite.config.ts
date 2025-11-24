import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const VITE_API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';
const VITE_WHATSAPP_SERVICE_URL = process.env.VITE_WHATSAPP_SERVICE_URL || 'http://localhost:3005';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: VITE_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/wapp': {
        target: VITE_WHATSAPP_SERVICE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wapp/, '')
      }
    }
  }
});


