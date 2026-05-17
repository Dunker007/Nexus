import express from 'express';
import { createAgent, SongwriterRoom, agentRegistry } from '../services/agents.js';
import { toolRegistry } from '../services/tool-registry.js';
import { StaffMeetingAgent } from '../services/agents-staff-meeting.js';
import { security } from '../services/security.js';
import { asyncHandler, ValidationError, NotFoundError } from '../services/errors.js';

const router = express.Router();

// Active agents registry (shared state within this module)
const activeAgents = new Map();

// Staff Meeting Agent instance
const staffMeetingAgent = new StaffMeetingAgent();

// ============ Staff Meeting Routes (must be before parameterized routes) ============

// Start a meeting
router.post('/meeting/start', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        throw new ValidationError('Topic is required', 'topic');
    }

    const result = await staffMeetingAgent.startMeeting(topic);
    res.json(result);
}));

// Get meeting status
router.get('/meeting/status', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const status = staffMeetingAgent.getMeetingStatus();
    res.json(status);
}));

// Stop meeting
router.post('/meeting/stop', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const result = staffMeetingAgent.stopMeeting();
    res.json(result);
}));

// ============ Direct Agent Access (O-5) ============

router.post('/:agentId/chat', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const { agentId } = req.params;
    const { messages, context } = req.body;

    const internalAgent = agentRegistry[agentId];

    if (!internalAgent) {
        throw new NotFoundError(`Agent ${agentId}`);
    }

    // Instantiate the agent class, then call processTask
    const agentInstance = new internalAgent();
    const response = await agentInstance.processTask({ message: messages[messages.length - 1].content }, context || {});

    res.json({
        success: true,
        agent: agentId,
        response
    });
}));

// ============ Agent CRUD Routes ============

// Create and execute agent task
router.post('/execute', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const { agentType, task, context = {} } = req.body;

    if (!agentType) {
        throw new ValidationError('agentType is required', 'agentType');
    }

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
}));

// Get agent status
router.get('/:type/status', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const agent = activeAgents.get(req.params.type);
    if (!agent) {
        throw new NotFoundError(`Agent ${req.params.type}`);
    }

    res.json({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        currentTask: agent.currentTask,
        memorySize: agent.memory.length
    });
}));

// Get agent memory
router.get('/:type/memory', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const agent = activeAgents.get(req.params.type);
    if (!agent) {
        throw new NotFoundError(`Agent ${req.params.type}`);
    }

    const limit = parseInt(req.query.limit) || 10;
    const memory = await agent.getMemory(limit);
    res.json({
        agent: agent.name,
        memory
    });
}));

// List all active and available agents
router.get('/', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const active = Array.from(activeAgents.values()).map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        status: agent.status,
        capabilities: agent.capabilities,
        memorySize: agent.memory.length
    }));

    const available = Object.entries(agentRegistry).map(([key]) => ({
        type: key,
        name: key.charAt(0).toUpperCase() + key.slice(1) + ' Agent'
    }));

    res.json({ active, available, total: active.length });
}));

// Reset agent
router.post('/:type/reset', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const agent = activeAgents.get(req.params.type);
    if (!agent) {
        throw new NotFoundError(`Agent ${req.params.type}`);
    }

    await agent.reset();
    res.json({ success: true, message: 'Agent reset successfully' });
}));

// Export activeAgents for use in server.js status reporting
export { activeAgents };
export default router;
