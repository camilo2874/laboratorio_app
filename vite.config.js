import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "./",  // ✅ Corrige rutas en producción
  build: {
    outDir: "dist",  // ✅ Asegura que los archivos estén en `dist/`
    assetsDir: "assets",  // ✅ Mueve los archivos JS/CSS a `dist/assets/`
  }
});