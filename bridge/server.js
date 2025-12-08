/**
 * LuxRig Bridge Server
 * Aggregates all AI services running on LuxRig into a single API
 */

import express from 'express';
// import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// Load environment
dotenv.config();

// Import services
import { lmstudioService } from './services/lmstudio.js';
import { ollamaService } from './services/ollama.js';
import { systemService } from './services/system.js';
import { googleService } from './services/google.js';
import { githubService } from './services/github.js';
import { createAgent, SongwriterRoom } from './services/agents.js';
import { errorHandler, errorLogger, rateLimiter, asyncHandler, validate } from './services/errors.js';
import { performanceMonitor, cache } from './services/performance.js';
import { prisma } from './services/database.js';
// Security and swagger imports - commented out temporarily for debugging
// import { security, securityHeaders, sessionMiddleware } from './services/security.js';
// import { swaggerSpec } from './config/swagger.js';
// import { StaffMeetingAgent } from './services/agents-staff-meeting.js';

const app = express();
const PORT = process.env.PORT || 3456;

// Staff Meeting instance - commented out temporarily
// const staffMeetingAgent = new StaffMeetingAgent();

// Middleware
app.use(cors());
app.use(express.json());
app.use(performanceMonitor.middleware()); // Track all request performance

// Swagger UI - commented out temporarily
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create HTTP server for both Express and WebSocket
const server = createServer(app);

// WebSocket server for real-time updates
// const wss = new WebSocketServer({ server, path: '/stream' });

// Track connected clients
const clients = new Set();

/*
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
*/

// Broadcast to all connected clients
function broadcast(data) {
    /*
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
            client.send(message);
        }
    });
    */
}

// Send full status to a client
/*
async function sendStatus(ws) {
    const status = await getFullStatus();
    ws.send(JSON.stringify({ type: 'status', data: status }));
}
*/

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

// Full system status
app.get('/status', async (req, res) => {
    try {
        const status = await getFullStatus();
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
    const { messages, model, provider } = req.body;

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
app.get('/github/repos', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        const limit = parseInt(req.query.limit) || 10;
        const repos = await githubService.listRepos(accessToken, limit);
        res.json(repos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ Agent Routes ============

// activeAgents is defined earlier now.

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

// List all active agents
app.get('/agents', (req, res) => {
    try {
        const agents = Array.from(activeAgents.values()).map(agent => ({
            id: agent.id,
            name: agent.name,
            description: agent.description,
            status: agent.status,
            capabilities: agent.capabilities,
            memorySize: agent.memory.length
        }));

        res.json({ agents, total: agents.length });
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
            owner: p.owner || 'Unknown'
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
            owner: project.owner || 'Unknown'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create project
app.post('/projects', async (req, res) => {
    try {
        const { name, desc, icon, status, category, priority, agents, href, timeline, owner } = req.body;

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
                owner: owner || 'Architect'
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
        const { name, desc, icon, status, category, priority, agents, href, timeline, owner, ideas } = req.body;

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
                            owner: p.owner
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

// Start server
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   LUXRIG BRIDGE v1.0.0                    ║
╠═══════════════════════════════════════════════════════════╣
║  REST API:    http://localhost:${PORT}                      ║
║  WebSocket:   DISABLED                                    ║
╠═══════════════════════════════════════════════════════════╣
║  Services:                                                ║
║    • LM Studio  → localhost:1234                          ║
║    • Ollama     → localhost:11434                         ║
║    • System     → nvidia-smi, WMI                         ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
