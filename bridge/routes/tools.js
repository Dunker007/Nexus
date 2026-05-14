import express from 'express';
import { toolRegistry } from '../services/tool-registry.js';
import { asyncHandler } from '../services/errors.js';

const router = express.Router();

// Get list of available tools (can be used to sync with LM Studio)
router.get('/', asyncHandler(async (req, res) => {
    res.json({
        success: true,
        tools: toolRegistry.getTools()
    });
}));

// Execute tool payload from LM Studio agent
router.post('/execute', asyncHandler(async (req, res) => {
    const payload = req.body;
    console.log('[Tool Server] Received execution payload:', payload);

    // Support OpenAI-compatible tool_calls array (what LM Studio typically uses)
    if (payload.tool_calls && Array.isArray(payload.tool_calls)) {
        const results = await Promise.all(payload.tool_calls.map(async (call) => {
            try {
                const name = call.function?.name || call.name;
                let args = call.function?.arguments || call.arguments || {};
                
                // LM Studio might send stringified JSON
                if (typeof args === 'string') {
                    try {
                        args = JSON.parse(args);
                    } catch (e) {
                        console.warn(`[Tool Server] Could not parse args for tool ${name}:`, args);
                        args = {};
                    }
                }
                
                const result = await toolRegistry.executeTool(name, args);
                
                return {
                    id: call.id,
                    success: true,
                    result
                };
            } catch (err) {
                return {
                    id: call.id,
                    success: false,
                    error: err.message
                };
            }
        }));
        return res.json({ results });
    }
    
    // Fallback: direct single tool execution
    const name = payload.name || payload.function?.name;
    let args = payload.arguments || payload.function?.arguments || {};
    
    if (!name) {
        return res.status(400).json({ success: false, error: 'Missing tool name in payload' });
    }

    if (typeof args === 'string') {
        try {
            args = JSON.parse(args);
        } catch (e) {
            args = {};
        }
    }
    
    try {
        const result = await toolRegistry.executeTool(name, args);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}));

export default router;
