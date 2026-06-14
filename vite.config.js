import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Důležité pro Electron, aby cesty byly relativní
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
