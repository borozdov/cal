import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Fixed port: other local projects also default to 5173.
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
