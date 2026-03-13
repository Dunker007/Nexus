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

  // Request logger — always logs method + path + status + duration
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = duration > 2000 ? 'warn' : 'log';
      console[level](`[API] ${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // API routes first
  setupRoutes(app);

  // ─── Global error handler ────────────────────────────────────────────────
  // Must have 4 args so Express recognises it as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[ERROR]', err.message || err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

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
