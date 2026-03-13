import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupRoutes } from './server/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Monitoring
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 2000) { // Log requests slower than 2s
        console.warn(`[PERF] ${req.method} ${req.url} - ${duration}ms`);
      }
    });
    next();
  });

  // API routes first
  setupRoutes(app);

  if (isDev) {
    // Vite dev middleware (HMR, fast refresh, etc.)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Nexus running on http://localhost:${PORT}`);
    console.log(`   Network: http://0.0.0.0:${PORT}  (Tailscale-accessible)`);
    console.log(`   Mode: ${isDev ? 'development' : 'production'}\n`);
  });
}

startServer().catch(console.error);
