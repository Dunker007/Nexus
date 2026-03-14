import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupRoutes } from './server/routes.js';
import { loadSecrets, requireIAP } from './server/gcp.js';
import { autoMigrateCloud } from './server/migrate-cloud.js';
import { initSocket } from './server/socket.js';
import { logger } from './server/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  // Phase 4: Secret Manager Initialization
  await loadSecrets();
  
  // Phase 5: DB Cloud Migration
  await autoMigrateCloud();

  const app = express();
  
  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://nexus-cloud-50841896985.us-central1.run.app',
    process.env.ALLOWED_ORIGIN,
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  const httpServer = createServer(app);
  
  // Phase 6: Initialize WebSockets
  initSocket(httpServer);
  
  // Phase 3: Security & Hardening
  app.use(helmet({
    contentSecurityPolicy: false // Disable CSP locally so Vite HMR + Inline styles don't break
  }));

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 200, // 200 requests per minute to stop infinite loops
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again later.' }
  });
  app.use('/api/', apiLimiter);

  // Phase 4: Google Identity-Aware Proxy Validation
  app.use('/api/', requireIAP);

  // Filter non-authorized traffic on local/Tailscale network bindings.
  // On Cloud Run, all traffic arrives via Google's proxy so socket IP is internal — skip filter there.
  if (!process.env.K_SERVICE) {
    app.use((req, res, next) => {
      const ip = req.socket.remoteAddress || '';
      const isLocal = ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('::ffff:127.') || ip.includes('::ffff:100.') || ip.includes('100.');
      if (ip && !isLocal) {
        if (isDev) {
          logger.warn('Unrecognized IP', { ip });
        } else {
          return res.status(403).json({ error: 'Access denied: Network not authorized' });
        }
      }
      next();
    });
  }

  app.use(express.json({ limit: '10mb' }));

  // Request logger — always logs method + path + status + duration
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const meta = { method: req.method, url: req.url, status: res.statusCode, ms: duration };
      if (duration > 2000) logger.warn('Slow request', meta);
      else logger.info('Request', meta);
    });
    next();
  });

  // API routes first
  setupRoutes(app);

  // ─── Global error handler ────────────────────────────────────────────────
  // Must have 4 args so Express recognises it as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: any, res: any, _next: any) => {
    logger.error('Unhandled error', { message: err.message, stack: err.stack });
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  if (isDev) {
    // Vite dev middleware (HMR, fast refresh, etc.)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info('Nexus started', { port: PORT, mode: isDev ? 'development' : 'production' });
  });
}

startServer().catch(err => logger.error('Fatal startup error', { message: err.message, stack: err.stack }));
