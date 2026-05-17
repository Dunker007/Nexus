import express from 'express';
import { lmstudioService } from '../services/lmstudio.js';
import { ollamaService } from '../services/ollama.js';
import { security } from '../services/security.js';
import { asyncHandler } from '../services/errors.js';

const router = express.Router();

// List all models from all providers
router.get('/models', asyncHandler(async (req, res) => {
    const [lmModels, ollamaModels] = await Promise.all([
        lmstudioService.listModels(),
        ollamaService.listModels()
    ]);

    res.json({
        lmstudio: lmModels,
        ollama: ollamaModels,
        total: (lmModels?.length || 0) + (ollamaModels?.length || 0)
    });
}));

// List LM Studio models only
router.get('/lmstudio/models', asyncHandler(async (req, res) => {
    const models = await lmstudioService.listModels();
    res.json(models);
}));

// List Ollama models only
router.get('/ollama/models', asyncHandler(async (req, res) => {
    const models = await ollamaService.listModels();
    res.json(models);
}));

// Chat completion (routes to best available)
router.post('/chat', security.authenticateApiKey(), asyncHandler(async (req, res) => {
    const { messages, model, provider } = req.body;

    let response;

    if (provider === 'ollama') {
        response = await ollamaService.chat(messages, model);
    } else {
        // Default to LM Studio
        response = await lmstudioService.chat(messages, model);
    }

    res.json(response);
}));

export default router;
