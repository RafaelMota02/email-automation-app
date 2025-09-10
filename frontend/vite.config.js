import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',     // relative to project root
    emptyOutDir: true,  // clears dist before each build
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
