import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "./", // 👈 Importante para evitar rutas incorrectas
  build: {
    outDir: "dist", // 👈 Asegura que Vercel use la carpeta correcta
  }
});
