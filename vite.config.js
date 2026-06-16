import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  base: './', // Důležité pro Electron, aby cesty byly relativní
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
