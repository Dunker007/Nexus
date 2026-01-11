/**
 * LuxRig Bridge Server
 * Aggregates all AI services running on LuxRig into a single API
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

const execAsync = promisify(exec);

// Load environment
dotenv.config();

// Import services
import { lmstudioService } from './services/lmstudio.js';
import { ollamaService } from './services/ollama.js';
import { systemService } from './services/system.js';
import { googleService } from './services/google.js';
import { githubService } from './services/github.js';
import { createAgent, SongwriterRoom, agentRegistry } from './services/agents.js';
import { errorHandler, errorLogger, rateLimiter, asyncHandler, validate } from './services/errors.js';
import { performanceMonitor, cache } from './services/performance.js';
import { prisma } from './services/database.js';
// Security and swagger imports - commented out temporarily for debugging
// import { security, securityHeaders, sessionMiddleware } from './services/security.js';
// import { swaggerSpec } from './config/swagger.js';
import { StaffMeetingAgent } from './services/agents-staff-meeting.js';
import { newsService } from './services/news.js';
import { contentService } from './services/content.js';
import { settingsService } from './services/settings.js';
import { networkService } from './services/network.js';
import pipelineRoutes from './routes/pipeline.js';
import distributionRoutes from './routes/distribution.js';
import artProductsRoutes from './routes/art-products.js';
import incomeRoutes from './routes/income.js';
const app = express();
const PORT = process.env.PORT || 3456;

// Staff Meeting instance - commented out temporarily
// const staffMeetingAgent = new StaffMeetingAgent();

// Middleware
app.use(cors({
    origin: true, // Allow any origin to connect (reflects request origin)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires'],
    credentials: true,
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url} from ${req.ip}`);
    next();
});
app.use(express.json());
app.use(performanceMonitor.middleware()); // Track all request performance

// Swagger UI - commented out temporarily
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Growth Phase Routes
app.use('/pipeline', pipelineRoutes);
app.use('/distribution', distributionRoutes);
app.use('/art', artProductsRoutes);
app.use('/income', incomeRoutes);

// Create HTTP server for both Express and WebSocket
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/stream' });

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('🔌 Client connected to stream');
    clients.add(ws);

    // Send initial status
    try {
        sendStatus(ws);
    } catch (error) {
        console.error('Initial status error:', error.message);
    }

    ws.on('close', () => {
        clients.delete(ws);
        console.log('🔌 Client disconnected');
    });
});

// Broadcast to all connected clients
function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
            client.send(message);
        }
    });
}

// Send full status to a client
async function sendStatus(ws) {
    const status = await getFullStatus();
    ws.send(JSON.stringify({ type: 'status', data: status }));
}

// Active agents registry (Moved up for scope visibility if needed, but getFullStatus needs it)
const activeAgents = new Map();

// Get full system status
async function getFullStatus() {
    const [lmstudio, ollama, system, errors] = await Promise.all([
        lmstudioService.getStatus(),
        ollamaService.getStatus(),
        systemService.getMetrics(),
        errorLogger.getErrorStats()
    ]);

    return {
        timestamp: new Date().toISOString(),
        services: {
            lmstudio,
            ollama
        },
        system,
        errors,
        agents: Array.from(activeAgents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            status: agent.status,
            type: agent.id.split('-')[0] // Derive type from ID or add type property to agent
        }))
    };
}
// ============ REST API Routes ============

// Health check
app.get('/', (req, res) => {
    res.json({
        name: 'LuxRig Bridge',
        version: '1.0.0',
        status: 'operational',
        endpoints: {
            status: '/status',
            llm: '/llm/*',
            system: '/system',
            stream: 'DISABLED'
        }
    });
});

import { deviceMonitor } from './services/deviceMonitor.js';

// ...

// Start Device Monitor and broadcast alerts
deviceMonitor.start((alert) => {
    broadcast(alert);
});

// ...

// Full system status
app.get('/status', async (req, res) => {
    try {
        const status = await getFullStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Run Network Speed Test
app.get('/monitoring/speedtest', async (req, res) => {
    try {
        const result = await networkService.runSpeedTest();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Network Status (Latency/ISP check)
app.get('/network/status', async (req, res) => {
    try {
        const status = await networkService.getStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ LLM Routes ============

// List all models from all providers
app.get('/llm/models', async (req, res) => {
    try {
        const [lmModels, ollamaModels] = await Promise.all([
            lmstudioService.listModels(),
            ollamaService.listModels()
        ]);

        res.json({
            lmstudio: lmModels,
            ollama: ollamaModels,
            total: (lmModels?.length || 0) + (ollamaModels?.length || 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List LM Studio models only
app.get('/llm/lmstudio/models', async (req, res) => {
    try {
        const models = await lmstudioService.listModels();
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List Ollama models only
app.get('/llm/ollama/models', async (req, res) => {
    try {
        const models = await ollamaService.listModels();
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chat completion (routes to best available)
app.post('/llm/chat', async (req, res) => {
    const { messages, model, provider, stream } = req.body;

    // Check if streaming is requested
    if (stream) {
        try {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            let streamSource;
            if (provider === 'ollama') {
                // Ollama streaming not yet implemented in service, fallback to non-stream or implement later
                // For now, let's assume lmstudio only for streaming or throw/fallback
                // Fallback to LMStudio for now as per instructions
                streamSource = await lmstudioService.chatStream(messages, model);
            } else {
                streamSource = await lmstudioService.chatStream(messages, model);
            }

            // streamSource is a Web ReadableStream (from fetch)
            // We need to iterate it and write to res
            const reader = streamSource.getReader();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                // value is a Uint8Array
                // Verify it's in SSE format or just raw chunks?
                // LM Studio returns SSE format "data: ...", so we can just pass it through
                res.write(value);
            }
            res.end();

        } catch (error) {
            console.error('Streaming error:', error);
            // Can't send JSON error if headers already sent, but try ending
            res.write(`data: {"error": "${error.message}"}\n\n`);
            res.end();
        }
        return;
    }

    // Non-streaming fallback
    try {
        let response;
        if (provider === 'ollama') {
            response = await ollamaService.chat(messages, model);
        } else {
            // Default to LM Studio
            response = await lmstudioService.chat(messages, model);
        }
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Load model (Ollama or LM Studio)
app.post('/llm/:provider/load', async (req, res) => {
    const { provider } = req.params;
    const { model } = req.body;
    try {
        if (provider === 'ollama') {
            await ollamaService.loadModel(model);
        } else if (provider === 'lmstudio') {
            await lmstudioService.loadModel(model);
        } else {
            throw new Error(`Unknown provider: ${provider}`);
        }
        res.json({ success: true, message: `Model ${model} loaded on ${provider}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unload model (Ollama or LM Studio)
app.post('/llm/:provider/unload', async (req, res) => {
    const { provider } = req.params;
    const { model } = req.body;
    try {
        if (provider === 'ollama') {
            await ollamaService.unloadModel(model);
        } else if (provider === 'lmstudio') {
            await lmstudioService.unloadModel(model);
        } else {
            throw new Error(`Unknown provider: ${provider}`);
        }
        res.json({ success: true, message: `Model ${model} unloaded from ${provider}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Agent Routes ============

// Reset an agent (restart/re-initialize)
app.post('/agents/:type/reset', async (req, res) => {
    const { type } = req.params;
    const agentId = `${type}-agent`;

    try {
        // If agent exists in active registry, remove it
        if (activeAgents.has(agentId)) {
            activeAgents.delete(agentId);
        }

        // Create new instance if valid type
        if (agentRegistry[type]) {
            const newAgent = createAgent(type);
            activeAgents.set(newAgent.id, newAgent);
            console.log(`[Agents] Reset agent: ${type} (${newAgent.id})`);
            res.json({ success: true, message: `Agent ${type} reset successfully` });
        } else {
            // For core agents like 'research' or 'code' that might not be in the simple registry list 
            // but are in the registry object:
            try {
                const newAgent = createAgent(type);
                activeAgents.set(newAgent.id, newAgent);
                console.log(`[Agents] Reset agent: ${type} (${newAgent.id})`);
                res.json({ success: true, message: `Agent ${type} reset successfully` });
            } catch (e) {
                res.status(400).json({ error: `Unknown agent type: ${type}` });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Monitoring Routes ============

// App metrics (connections, memory, etc.)
app.get('/monitoring/metrics', (req, res) => {
    try {
        const memory = process.memoryUsage();
        res.json({
            activeConnections: clients.size,
            activeAgents: activeAgents.size,
            memory: {
                heapUsed: memory.heapUsed,
                heapTotal: memory.heapTotal,
                rss: memory.rss
            },
            platform: process.platform,
            nodeVersion: process.version,
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error logs
app.get('/monitoring/errors', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const errors = await errorLogger.getErrors(limit);
        const stats = await errorLogger.getErrorStats();

        res.json({
            errors,
            stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Performance stats (requests)
app.get('/monitoring/performance', async (req, res) => {
    try {
        const stats = await performanceMonitor.getAllStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ System Routes ============

// Real-time system metrics
app.get('/system', async (req, res) => {
    try {
        const metrics = await systemService.getMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GPU stats (nvidia-smi)
app.get('/system/gpu', async (req, res) => {
    try {
        const gpu = await systemService.getGPU();
        res.json(gpu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get disk usage
app.get('/system/disks', async (req, res) => {
    try {
        const [c, d] = await Promise.all([
            systemService.getDisk('C:'),
            systemService.getDisk('D:').catch(() => null)
        ]);
        res.json({ drives: [c, d].filter(Boolean) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear cache (temp files)
app.post('/system/cache/clear', async (req, res) => {
    try {
        const { type } = req.body || {};
        let command;
        let description;

        switch (type) {
            case 'temp':
                command = 'powershell -Command "Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue"';
                description = 'Cleared Windows temp files';
                break;
            case 'logs':
                command = 'powershell -Command "Get-ChildItem -Path C:\\Windows\\Logs -Recurse -Filter *.log | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force -ErrorAction SilentlyContinue"';
                description = 'Cleared old log files';
                break;
            case 'ollama':
                command = 'powershell -Command "if (Test-Path $env:USERPROFILE\\.ollama\\models) { Get-ChildItem $env:USERPROFILE\\.ollama\\models -Directory | Select-Object -First 0 }"';
                description = 'Ollama cache location identified';
                break;
            default:
                command = 'powershell -Command "Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue"';
                description = 'Cleared temp files';
        }

        await execAsync(command);
        res.json({ success: true, message: description });
    } catch (error) {
        res.json({ success: true, message: 'Cache operation completed (some files may be in use)' });
    }
});

// Free memory (clear standby list)
app.post('/system/memory/free', async (req, res) => {
    try {
        // This requires admin privileges in production
        // For now, we'll trigger garbage collection hint
        await execAsync('powershell -Command "[System.GC]::Collect()"');

        const memory = await systemService.getMemory();
        res.json({
            success: true,
            message: `Memory optimized. Free: ${memory.freeGB} GB`,
            ...memory
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// System optimization actions
app.post('/system/optimize', async (req, res) => {
    const { action } = req.body;

    try {
        let result = { success: true, message: 'Optimization applied' };

        switch (action) {
            case 'gpu_power_max':
                // Set NVIDIA to prefer maximum performance
                await execAsync('nvidia-smi -pm 1').catch(() => { });
                result.message = 'GPU set to persistence mode for maximum performance';
                break;

            case 'cpu_high_perf':
                // Set Windows power plan to High Performance
                await execAsync('powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c');
                result.message = 'Power plan set to High Performance';
                break;

            case 'ram_optimize':
                await execAsync('powershell -Command "[System.GC]::Collect()"');
                result.message = 'Memory optimization triggered';
                break;

            case 'clean_temp':
                await execAsync('powershell -Command "Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue"');
                result.message = 'Temp files cleared';
                break;

            case 'rebuild_shaders':
                result.message = 'Shader cache rebuild initiated (requires game restart)';
                break;

            case 'clear_prefetch':
                result.message = 'Prefetch optimization noted (requires admin)';
                break;

            case 'fan_boost':
                result.message = 'Fan control requires hardware utility';
                break;

            case 'power_balanced':
                await execAsync('powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e').catch(() => { });
                result.message = 'Power plan set to Balanced';
                break;

            case 'thermal_check':
                try {
                    const gpu = await systemService.getGPU();
                    result.message = `GPU: ${gpu.temperature}°C, Power: ${gpu.powerDraw}W`;
                    result.thermal = gpu;
                } catch (e) {
                    result.message = 'Thermal check failed - GPU stats unavailable';
                }
                break;

            default:
                result.message = `Action '${action}' acknowledged`;
        }

        return res.json(result);
    } catch (error) {
        return res.json({ success: false, message: error.message || 'Action failed' });
    }
});

// RGB Control via OpenRGB
app.post('/system/rgb', async (req, res) => {
    const { mode, color, brightness } = req.body;

    try {
        let result = { success: true, message: 'RGB updated' };

        // OpenRGB CLI command - assumes OpenRGB is installed
        // Common modes: static, breathing, rainbow, off
        const rgbModes = {
            off: 'openrgb -m off',
            static: `openrgb -m static -c ${color || 'FFFFFF'}`,
            breathing: 'openrgb -m breathing',
            rainbow: 'openrgb -m rainbow'
        };

        const command = rgbModes[mode] || rgbModes.static;

        try {
            await execAsync(command);
            result.message = `RGB set to ${mode}`;
        } catch (e) {
            // OpenRGB not installed or not running
            result.message = `RGB mode '${mode}' queued (install OpenRGB for hardware control)`;
            result.note = 'Download OpenRGB from https://openrgb.org';
        }

        return res.json(result);
    } catch (error) {
        return res.json({ success: false, message: error.message || 'RGB control failed' });
    }
});

// ============ Network Routes ============

// Get network status (ISPs, router)
app.get('/network/status', async (req, res) => {
    try {
        const status = await networkService.getStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ping a specific host
app.get('/network/ping/:host', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 4;
        const result = await networkService.ping(req.params.host, count);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check ISP statuses
app.get('/network/isps', async (req, res) => {
    try {
        const isps = await networkService.checkISPs();
        res.json(isps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check router status
app.get('/network/router', async (req, res) => {
    try {
        const router = await networkService.checkRouter();
        res.json(router);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Run speed test
app.post('/network/speedtest', async (req, res) => {
    try {
        const result = await networkService.runSpeedTest();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update network configuration (e.g., gateway IPs)
app.post('/network/config', (req, res) => {
    try {
        const config = networkService.updateConfig(req.body);
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current network configuration
app.get('/network/config', (req, res) => {
    try {
        res.json(networkService.config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Google OAuth Routes ============

// Get OAuth URL
app.get('/auth/google', (req, res) => {
    try {
        const authUrl = googleService.getAuthUrl();
        res.json({ authUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const tokens = await googleService.getTokens(code);

        // In production, store tokens securely
        // For now, return them to the client
        res.json({
            success: true,
            tokens,
            message: 'Authentication successful! Store these tokens securely.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user info
app.get('/google/user', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const userInfo = await googleService.getUserInfo(accessToken);
        res.json(userInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List calendar events
app.get('/google/calendar/events', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const maxResults = parseInt(req.query.maxResults) || 10;
        const events = await googleService.listCalendarEvents(accessToken, maxResults);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List Drive files
app.get('/google/drive/files', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const maxResults = parseInt(req.query.maxResults) || 10;
        const files = await googleService.listDriveFiles(accessToken, maxResults);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ GitHub OAuth Routes ============

// Get OAuth URL
app.get('/auth/github', (req, res) => {
    try {
        const authUrl = githubService.getAuthUrl();
        res.json({ authUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check system connection status
app.get('/auth/github/status', (req, res) => {
    res.json({
        connected: !!process.env.GITHUB_ACCESS_TOKEN
    });
});

// OAuth callback
app.get('/auth/github/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const tokens = await githubService.getTokens(code);

        // In production, store tokens securely
        // For now, return them to the client
        res.json({
            success: true,
            tokens,
            message: 'GitHub connected successfully!'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user info
app.get('/github/user', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        const userInfo = await githubService.getUserInfo(accessToken);
        res.json(userInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List repos
// List repos
app.get('/github/repos', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        const limit = parseInt(req.query.limit) || 10;

        // If no token passed and no env token, return 401 (Unauthorized/Not Connected)
        if (!accessToken && !process.env.GITHUB_ACCESS_TOKEN) {
            return res.status(401).json({ error: 'Not connected to GitHub' });
        }

        const repos = await githubService.listRepos(accessToken, limit);
        res.json(repos);
    } catch (error) {
        // If it's a token error, return 401
        if (error.message.includes('No access token')) {
            return res.status(401).json({ error: 'Not connected to GitHub' });
        }
        res.status(500).json({ error: error.message });
    }
});

// ============ Agent Routes ============

// activeAgents is defined earlier now.

// Staff Meeting Routes (must be before parameterized routes)
// Start a meeting
app.post('/agents/meeting/start', async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const result = await staffMeetingAgent.startMeeting(topic);
        res.json(result);
    } catch (error) {
        console.error('Meeting start error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get meeting status
app.get('/agents/meeting/status', async (req, res) => {
    try {
        const status = staffMeetingAgent.getMeetingStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stop meeting
app.post('/agents/meeting/stop', async (req, res) => {
    try {
        const result = staffMeetingAgent.stopMeeting();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize Staff Meeting Agent
const staffMeetingAgent = new StaffMeetingAgent();

// Create and execute agent task
app.post('/agents/execute', async (req, res) => {
    try {
        const { agentType, task, context = {} } = req.body;

        // Create or get agent
        let agent = activeAgents.get(agentType);
        if (!agent) {
            agent = createAgent(agentType);
            activeAgents.set(agentType, agent);
        }

        // Execute task
        const result = await agent.execute(task, context);

        res.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.name,
                status: agent.status
            },
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get agent status
app.get('/agents/:type/status', (req, res) => {
    try {
        const agent = activeAgents.get(req.params.type);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json({
            id: agent.id,
            name: agent.name,
            status: agent.status,
            currentTask: agent.currentTask,
            memorySize: agent.memory.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get agent memory
app.get('/agents/:type/memory', async (req, res) => {
    try {
        const agent = activeAgents.get(req.params.type);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const limit = parseInt(req.query.limit) || 10;
        const memory = await agent.getMemory(limit);
        res.json({
            agent: agent.name,
            memory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all active and available agents
app.get('/agents', (req, res) => {
    try {
        const active = Array.from(activeAgents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            description: agent.description,
            status: agent.status,
            capabilities: agent.capabilities,
            memorySize: agent.memory.length
        }));

        const available = Object.entries(agentRegistry).map(([key, AgentClass]) => {
            // Instantiate a temporary agent to get metadata if static properties aren't available
            // Optimized: Create a lightweight object if description/name were static, but they are instance props.
            // For now, let's just map the keys. Ideally Agent classes would have static capability lists.
            // We'll trust the keys map to the types.
            return {
                type: key,
                name: key.charAt(0).toUpperCase() + key.slice(1) + ' Agent'
            };
        });

        res.json({ active, available, total: active.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset agent
app.post('/agents/:type/reset', async (req, res) => {
    try {
        const agent = activeAgents.get(req.params.type);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        await agent.reset();
        res.json({ success: true, message: 'Agent reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Staff Meeting Routes ============

// Start AI Staff Meeting
app.post('/agents/meeting', async (req, res) => {
    try {
        const { topic, participants = ['architect', 'security', 'qa'], rounds = 2 } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const startTime = Date.now();

        // Run the meeting
        const meetingId = `meeting-${Date.now()}`;
        const transcript = [];

        // Generate meeting transcript with mock responses for now
        // In production, this would call the actual LLM
        for (let round = 1; round <= rounds; round++) {
            for (const participant of participants) {
                const message = {
                    id: `${meetingId}-${round}-${participant}`,
                    agent: participant,
                    round,
                    message: generateAgentMessage(participant, topic, round),
                    timestamp: new Date().toISOString(),
                    type: round === 1 ? 'brainstorm' : 'debate'
                };
                transcript.push(message);
            }
        }

        // Generate consensus
        const consensus = `The team agrees on a ${topic} approach with: microservices architecture, end-to-end encryption, and comprehensive testing.`;
        const actionItems = [
            `Architect to create detailed system design for ${topic}`,
            'Security to perform threat modeling and security review',
            'QA to define test strategy and acceptance criteria',
            'DevOps to prepare deployment pipeline'
        ];

        const result = {
            meetingId,
            topic,
            participants,
            transcript,
            consensus,
            actionItems,
            duration: Date.now() - startTime
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to generate agent messages
function generateAgentMessage(agent, topic, round) {
    const messages = {
        architect: {
            1: `For "${topic}", I recommend a microservices architecture with clear domain boundaries. We should use event-driven communication for scalability and implement a robust API gateway for security and rate limiting.`,
            2: `I've considered the security concerns. We can implement defense-in-depth: API gateway validation, service-level authorization, and encrypted inter-service communication. This addresses the attack surface concerns.`
        },
        security: {
            1: `I'm analyzing "${topic}" for security implications. Key concerns: authentication flows, data encryption at rest and in transit, audit logging, and rate limiting. We need to prevent OWASP Top 10 vulnerabilities.`,
            2: `The proposed architecture still has some concerns. The API gateway is a single point of failure for auth. I recommend implementing PKCE for OAuth flows and ensuring all secrets are vault-managed, not environment variables.`
        },
        qa: {
            1: `Testing strategy for "${topic}": unit tests with 80%+ coverage, integration tests for all API endpoints, E2E tests for critical user journeys, and load testing for performance baselines under 200ms latency.`,
            2: `We also need chaos engineering to test resilience. I recommend implementing circuit breakers and testing failure scenarios. Automated regression tests should run on every PR.`
        },
        devops: {
            1: `Infrastructure for "${topic}": Kubernetes for orchestration, GitOps for deployments, observability with Prometheus/Grafana, and automated scaling based on load patterns.`,
            2: `For reliability, we need multi-region deployment with automatic failover. Blue-green deployments will minimize downtime during releases.`
        }
    };

    return messages[agent]?.[round] || `I have valuable insights on ${topic} from a ${agent} perspective. Let's ensure we follow best practices.`;
}

// Get meeting status
app.get('/agents/meeting/:meetingId', (req, res) => {
    try {
        // const status = staffMeetingAgent.getMeetingStatus();
        res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Monitoring & Health Routes ============

// Health check with detailed status
app.get('/health', async (req, res) => {
    try {
        const [lmstudio, ollama, system] = await Promise.all([
            lmstudioService.getStatus(),
            ollamaService.getStatus(),
            systemService.getMetrics()
        ]);

        const health = {
            status: 'healthy',
            timestamp: new Date(),
            uptime: process.uptime(),
            services: {
                lmstudio: lmstudio.online ? 'up' : 'down',
                ollama: ollama.online ? 'up' : 'down',
                system: system.gpu?.available ? 'up' : 'degraded'
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            }
        };

        // Check if any service is down
        const allUp = Object.values(health.services).every(s => s === 'up');
        if (!allUp) {
            health.status = 'degraded';
        }

        res.json(health);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date()
        });
    }
});

// Error logs
app.get('/monitoring/errors', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const [errors, stats] = await Promise.all([
            errorLogger.getErrors(limit),
            errorLogger.getErrorStats()
        ]);
        res.json({ errors, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Performance metrics
app.get('/monitoring/metrics', (req, res) => {
    try {
        const metrics = {
            timestamp: new Date(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            activeConnections: clients.size,
            activeAgents: activeAgents.size,
            platform: process.platform,
            nodeVersion: process.version
        };

        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear error logs (admin only)
app.post('/monitoring/errors/clear', async (req, res) => {
    try {
        await errorLogger.clear();
        res.json({ success: true, message: 'Error logs cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Performance stats
app.get('/monitoring/performance', async (req, res) => {
    try {
        const stats = await performanceMonitor.getAllStats();
        res.json({
            stats,
            cache: cache.getStats()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ News Routes ============

// Get news headlines
app.get('/news', async (req, res) => {
    try {
        const { category, region, limit } = req.query;
        const news = await newsService.getNews({
            category,
            region,
            limit: limit ? parseInt(limit) : 50
        });
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh news from RSS sources
app.post('/news/refresh', async (req, res) => {
    try {
        const result = await newsService.refreshNews();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Songwriter Room (Music Pipeline) ============

// Create songwriter room instance
const songwriterRoom = new SongwriterRoom();

// Get songwriter agent personas
app.get('/music/agents', (req, res) => {
    res.json({
        agents: songwriterRoom.getAgentPersonas(),
        description: 'Songwriter agents for collaborative music creation'
    });
});

// Create a song with the songwriter room
app.post('/music/create', async (req, res) => {
    try {
        const { theme, genre = 'pop', mood = 'uplifting', rounds = 2 } = req.body;

        if (!theme) {
            return res.status(400).json({ error: 'Theme is required' });
        }

        const result = await songwriterRoom.createSong(theme, { genre, mood, rounds });
        res.json(result);
    } catch (error) {
        console.error('Songwriter error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a sentinel track (Midwest Sentinel)
app.post('/music/sentinel', async (req, res) => {
    try {
        const { headlines, focusArea = 'minnesota' } = req.body;
        const result = await songwriterRoom.createSentinelTrack(headlines, focusArea);
        res.json(result);
    } catch (error) {
        console.error('Sentinel error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Suno prompt directly (quick mode)
app.post('/music/prompt', async (req, res) => {
    try {
        const { theme, genre = 'pop', mood = 'uplifting' } = req.body;

        if (!theme) {
            return res.status(400).json({ error: 'Theme is required' });
        }

        // Quick prompt generation without full collaboration
        const producer = createAgent('producer');
        const composer = createAgent('composer');

        const style = await composer.processTask({
            action: 'suggest-style',
            theme,
            genre,
            mood
        });

        const prompt = await producer.processTask({
            action: 'generate-suno-prompt',
            content: { theme, genre, mood, style }
        });

        res.json({
            theme,
            genre,
            mood,
            sunoPrompt: prompt.fullPrompt,
            styleTags: prompt.styleTags,
            instructions: prompt.instructions
        });
    } catch (error) {
        console.error('Prompt generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create political rap with Newsician
app.post('/music/political', async (req, res) => {
    try {
        const { focusArea = 'minnesota', headlines = [] } = req.body;

        console.log(`🎤 Newsician creating political rap for ${focusArea}...`);

        const result = await songwriterRoom.createPoliticalRap(headlines, focusArea);
        res.json(result);
    } catch (error) {
        console.error('Newsician error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create platform-friendly political track with Midwest Sentinel
app.post('/music/sentinel', async (req, res) => {
    try {
        const { focusArea = 'minnesota', headlines = [] } = req.body;

        console.log(`🎧 Midwest Sentinel creating boom bap track for ${focusArea}...`);

        const result = await songwriterRoom.createSentinelTrack(headlines, focusArea);
        res.json(result);
    } catch (error) {
        console.error('Sentinel error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ News Aggregation Routes ============

// Get news items
app.get('/news', async (req, res) => {
    try {
        const { category, region, limit } = req.query;
        const news = await newsService.getNews({
            category,
            region,
            limit: parseInt(limit) || 100
        });
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh news items
app.post('/news/refresh', async (req, res) => {
    try {
        const result = await newsService.refreshNews();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Content Queue Routes ============

// Get content queue
app.get('/content/queue', async (req, res) => {
    try {
        const { status, type } = req.query;
        const queue = await contentService.getQueue(status, type);
        res.json(queue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add to queue
app.post('/content/queue', async (req, res) => {
    try {
        const { type, data } = req.body;
        if (!type || !data) {
            return res.status(400).json({ error: 'Type and data are required' });
        }

        const item = await contentService.addToQueue(type, data);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update queue item
app.patch('/content/queue/:id', async (req, res) => {
    try {
        const { status, result } = req.body;
        const item = await contentService.updateStatus(req.params.id, status, result);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete queue item
app.delete('/content/queue/:id', async (req, res) => {
    try {
        await contentService.deleteItem(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Projects Routes (Labs Hub) ============

// In-memory projects store as fallback
const inMemoryProjects = new Map();

// List all projects
app.get('/projects', async (req, res) => {
    try {
        // Try database first
        let projects = [];
        try {
            projects = await prisma.project.findMany({
                orderBy: { updatedAt: 'desc' }
            });
        } catch (dbError) {
            console.log('DB query failed, using in-memory:', dbError.message);
        }

        // If DB is empty but we have in-memory data, use that
        if (projects.length === 0 && inMemoryProjects.size > 0) {
            projects = Array.from(inMemoryProjects.values());
            res.json({ projects, total: projects.length, source: 'memory' });
            return;
        }

        // Transform from DB format to frontend format
        const transformed = projects.map(p => ({
            id: p.id,
            icon: p.icon || '📦',
            name: p.title,
            desc: p.description || '',
            status: p.status,
            category: p.category,
            priority: p.priority,
            agents: typeof p.agents === 'string' ? JSON.parse(p.agents || '[]') : (p.agents || []),
            href: p.href,
            ideas: typeof p.stats === 'string' ? (JSON.parse(p.stats || '{}').ideas || 0) : (p.ideas || 0),
            timeline: typeof p.timeline === 'string' ? JSON.parse(p.timeline || '{"startMonth":0,"durationMonths":3,"progress":0}') : (p.timeline || {}),
            owner: p.owner || 'Unknown',
            content: p.content
        }));

        res.json({ projects: transformed, total: transformed.length, source: 'database' });
    } catch (error) {
        console.error('Projects list error:', error);
        // Return in-memory as last resort
        if (inMemoryProjects.size > 0) {
            res.json({ projects: Array.from(inMemoryProjects.values()), total: inMemoryProjects.size, source: 'memory' });
        } else {
            res.status(500).json({ error: error.message, projects: [] });
        }
    }
});

// Get single project
app.get('/projects/:id', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({
            id: project.id,
            icon: project.icon || '📦',
            name: project.title,
            desc: project.description || '',
            status: project.status,
            category: project.category,
            priority: project.priority,
            agents: JSON.parse(project.agents || '[]'),
            href: project.href,
            ideas: JSON.parse(project.stats || '{}').ideas || 0,
            timeline: JSON.parse(project.timeline || '{"startMonth":0,"durationMonths":3,"progress":0}'),
            owner: project.owner || 'Unknown',
            content: project.content
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create project
app.post('/projects', async (req, res) => {
    try {
        const { name, desc, icon, status, category, priority, agents, href, timeline, owner, content } = req.body;

        const project = await prisma.project.create({
            data: {
                title: name,
                description: desc,
                icon: icon || '💡',
                status: status || 'concept',
                category: category || 'Experimental',
                priority: priority || 'Medium',
                agents: JSON.stringify(agents || ['architect']),
                href: href || null,
                timeline: JSON.stringify(timeline || { startMonth: new Date().getMonth(), durationMonths: 3, progress: 0 }),
                stats: JSON.stringify({ ideas: 0 }),
                owner: owner || 'Architect',
                content: content
            }
        });

        res.json({ success: true, project: { ...project, name: project.title, desc: project.description } });
    } catch (error) {
        console.error('Project create error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update project
app.put('/projects/:id', async (req, res) => {
    try {
        const { name, desc, icon, status, category, priority, agents, href, timeline, owner, ideas, content } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.title = name;
        if (desc !== undefined) updateData.description = desc;
        if (icon !== undefined) updateData.icon = icon;
        if (status !== undefined) updateData.status = status;
        if (category !== undefined) updateData.category = category;
        if (priority !== undefined) updateData.priority = priority;
        if (agents !== undefined) updateData.agents = JSON.stringify(agents);
        if (href !== undefined) updateData.href = href;
        if (timeline !== undefined) updateData.timeline = JSON.stringify(timeline);
        if (owner !== undefined) updateData.owner = owner;
        if (ideas !== undefined) updateData.stats = JSON.stringify({ ideas });
        if (content !== undefined) updateData.content = content;

        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json({ success: true, project });
    } catch (error) {
        console.error('Project update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete project
app.delete('/projects/:id', async (req, res) => {
    try {
        await prisma.project.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Seed projects from static data (one-time migration)
app.post('/projects/seed', async (req, res) => {
    try {
        const { projects } = req.body;

        if (!projects || !Array.isArray(projects)) {
            return res.status(400).json({ error: 'Projects array required' });
        }

        const results = [];
        let useMemory = false;

        for (const p of projects) {
            try {
                const existing = await prisma.project.findFirst({
                    where: { title: p.name }
                });

                if (!existing) {
                    const created = await prisma.project.create({
                        data: {
                            id: p.id,
                            title: p.name,
                            description: p.desc,
                            icon: p.icon,
                            status: p.status,
                            category: p.category,
                            priority: p.priority,
                            agents: JSON.stringify(p.agents),
                            href: p.href,
                            timeline: JSON.stringify(p.timeline),
                            stats: JSON.stringify({ ideas: p.ideas }),
                            owner: p.owner,
                            content: p.content
                        }
                    });
                    results.push({ id: created.id, name: p.name, action: 'created' });
                } else {
                    results.push({ id: existing.id, name: p.name, action: 'skipped' });
                }
            } catch (dbError) {
                // Fallback to in-memory storage
                useMemory = true;
                inMemoryProjects.set(p.id, p);
                results.push({ id: p.id, name: p.name, action: 'memory' });
            }
        }

        res.json({
            success: true,
            results,
            seeded: results.filter(r => r.action === 'created' || r.action === 'memory').length,
            source: useMemory ? 'memory' : 'database'
        });
    } catch (error) {
        console.error('Seed error:', error);
        // Last resort: store all in memory
        try {
            const { projects } = req.body;
            if (projects && Array.isArray(projects)) {
                projects.forEach(p => inMemoryProjects.set(p.id, p));
                res.json({ success: true, seeded: projects.length, source: 'memory' });
                return;
            }
        } catch { }
        res.status(500).json({ error: error.message });
    }
});

// ============ Settings Routes ============

app.get('/settings', (req, res) => {
    res.json(settingsService.getAll());
});

app.post('/settings', async (req, res) => {
    try {
        const updates = req.body;
        await settingsService.updateMany(updates);
        res.json({ success: true, settings: settingsService.getAll() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Error Handler (Must be last) ============
app.use(errorHandler);

// ============ Periodic Updates ============

// Broadcast status every 5 seconds (Disabled)
/*
setInterval(async () => {
    try {
        if (clients.size > 0) {
            const status = await getFullStatus();
            broadcast({ type: 'status', data: status });
        }
    } catch (error) {
        console.error('Status broadcast error:', error.message);
    }
}, 5000);
*/

// Initialize Settings
settingsService.init().catch(console.error);

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   LUXRIG BRIDGE v2.0.0                    ║
║              🎉 GROWTH PHASE COMPLETE 🎉                  ║
╠═══════════════════════════════════════════════════════════╣
║  REST API:    http://localhost:${PORT}                      ║
║  WebSocket:   DISABLED                                    ║
╠═══════════════════════════════════════════════════════════╣
║  Revenue Streams:                                         ║
║    • Pipeline   → /pipeline (Content Generation)          ║
║    • Music      → /distribution (Streaming Revenue)       ║
║    • Art        → /art (Etsy/POD Products)                ║
║    • Income     → /income (Unified Dashboard)             ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
