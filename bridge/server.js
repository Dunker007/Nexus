/**
 * LuxRig Bridge Server v3.0.0
 * Thin orchestration shell — all route logic lives in ./routes/
 */

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local' });

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';

// Core services (needed by server shell only)
import { lmstudioService } from './services/lmstudio.js';
import { ollamaService } from './services/ollama.js';
import { systemService } from './services/system.js';
import { errorHandler, errorLogger, rateLimiter } from './services/errors.js';
import { performanceMonitor } from './services/performance.js';
import { securityHeaders, security } from './services/security.js';
import { settingsService } from './services/settings.js';
import './services/pieces-mcp-adapter.js'; // registers LTM tools into toolRegistry

// Route modules
import llmRoutes from './routes/llm.js';
import agentRoutes, { activeAgents } from './routes/agents.js';
import authRoutes from './routes/auth.js';
import googleRoutes from './routes/google.js';
import githubRoutes from './routes/github.js';
import systemRoutes from './routes/system.js';
import monitoringRoutes from './routes/monitoring.js';
import musicRoutes from './routes/music.js';
import newsRoutes from './routes/news.js';
import contentRoutes from './routes/content.js';
import projectRoutes from './routes/projects.js';
import settingsRoutes from './routes/settings.js';
import pipelineRoutes from './routes/pipeline.js';
import distributionRoutes from './routes/distribution.js';
import artProductsRoutes from './routes/art-products.js';
import incomeRoutes from './routes/income.js';
import smartfolioRoutes from './routes/smartfolio.js';
import toolRoutes from './routes/tools.js';

const app = express();
const PORT = process.env.PORT || 3456;

// ============ Middleware ============

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const isAllowed = origin.includes('dlxstudios.online') ||
            origin.includes('vercel.app') ||
            origin.includes('netlify.app') ||
            origin.includes('localhost');

        if (isAllowed) {
            return callback(null, true);
        } else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(securityHeaders());
app.use(rateLimiter);
app.use(performanceMonitor.middleware());

// ============ HTTP Server & WebSocket ============

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/stream' });
const clients = new Set();

wss.on('connection', (ws, req) => {
    try {
        const origin = req.headers.origin || 'unknown';
        console.log(`🔌 WebSocket connection from origin: ${origin}`);
    } catch (e) {
        console.error('WebSocket parse error:', e.message);
    }

    console.log('🔌 Client connected to stream');
    clients.add(ws);

    try { sendStatus(ws); } catch (error) {
        console.error('Initial status error:', error.message);
    }

    ws.on('close', () => {
        clients.delete(ws);
        console.log('🔌 Client disconnected');
    });
});

function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === 1) client.send(message);
    });
}

async function sendStatus(ws) {
    const status = await getFullStatus();
    ws.send(JSON.stringify({ type: 'status', data: status }));
}

async function getFullStatus() {
    const [lmstudio, ollama, system, errors] = await Promise.all([
        lmstudioService.getStatus(),
        ollamaService.getStatus(),
        systemService.getMetrics(),
        errorLogger.getErrorStats()
    ]);

    return {
        timestamp: new Date().toISOString(),
        services: { lmstudio, ollama },
        system,
        errors,
        agents: Array.from(activeAgents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            status: agent.status,
            type: agent.id.split('-')[0]
        }))
    };
}

// ============ Root & Status (kept in shell) ============

app.get('/', (req, res) => {
    res.json({
        name: 'LuxRig Bridge',
        version: '3.0.0',
        status: 'operational',
        endpoints: {
            status: '/status',
            llm: '/llm/*',
            system: '/system',
            agents: '/agents/*',
            stream: 'DISABLED'
        }
    });
});

app.get('/status', async (req, res) => {
    try {
        const status = await getFullStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Mount Route Modules ============

app.use('/llm', llmRoutes);
app.use('/agents', agentRoutes);
app.use('/api/agents', agentRoutes);   // O-5 direct agent access alias
app.use('/auth', authRoutes);
app.use('/google', googleRoutes);
app.use('/github', githubRoutes);
app.use('/system', systemRoutes);
app.use('/health', monitoringRoutes);  // /health -> monitoringRoutes root /health
app.use('/monitoring', monitoringRoutes);
app.use('/music', musicRoutes);
app.use('/news', newsRoutes);
app.use('/content', contentRoutes);
app.use('/projects', projectRoutes);
app.use('/settings', settingsRoutes);

// Growth Phase routes (pre-existing separate modules)
app.use('/pipeline', security.authenticateApiKey(), pipelineRoutes);
app.use('/distribution', security.authenticateApiKey(), distributionRoutes);
app.use('/art', security.authenticateApiKey(), artProductsRoutes);
app.use('/income', security.authenticateApiKey(), incomeRoutes);
app.use('/smartfolio', security.authenticateApiKey(), smartfolioRoutes);
app.use('/tools', security.authenticateApiKey(), toolRoutes);

// ============ Error Handler (must be last middleware) ============
app.use(errorHandler);

// ============ Initialization ============

settingsService.init().catch(console.error);

import("./services/mcp-connector.js")
    .then(m => m.piecesMcp.connect())
    .catch(err => console.error("[Pieces MCP] Failed to auto-start:", err));

// ============ Start Server ============

server.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║               LUXRIG BRIDGE v3.0.0 (Modular)             ║
║            🧩 Route Decomposition Complete 🧩             ║
╠═══════════════════════════════════════════════════════════╣
║  REST API:    http://localhost:${PORT}                      ║
║  WebSocket:   DISABLED                                    ║
╠═══════════════════════════════════════════════════════════╣
║  Route Modules:                                           ║
║    • LLM       → /llm       (Models & Chat)               ║
║    • Agents    → /agents    (AI Agent Orchestration)       ║
║    • System    → /system    (Hardware Metrics)             ║
║    • Music     → /music     (Songwriter Pipeline)          ║
║    • Projects  → /projects  (Labs Hub)                     ║
║    • Pipeline  → /pipeline  (Content Generation)           ║
║    • Income    → /income    (Revenue Dashboard)            ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
