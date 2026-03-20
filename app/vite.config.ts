import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  server: {
    allowedHosts: true,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Core React — small, cached aggressively
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('react-router')) return 'react-router';
          if (id.includes('/react/')) return 'react-core';

          // Heavy visualization libs — split so they parse in parallel
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts';
          if (id.includes('reactflow') || id.includes('@reactflow')) return 'flow';
          if (id.includes('framer-motion')) return 'framer';

          // Icon library (lots of tree-shaken SVGs)
          if (id.includes('lucide')) return 'icons';

          // Everything else from node_modules
          return 'vendor';
        }
      }
    }
  }
});
