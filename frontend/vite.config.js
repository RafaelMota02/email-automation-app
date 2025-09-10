import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: '../dist'  // Output to project root dist directory
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://email-automation-app-t8ar.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
});
