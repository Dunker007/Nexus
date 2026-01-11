/**
 * LM Studio Service
 * Connects to LM Studio's OpenAI-compatible API
 */

const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://127.0.0.1:1234';
import { settingsService } from './settings.js';

function getUrl() {
    return settingsService.get('lmstudio_url') || LMSTUDIO_URL;
}

export const lmstudioService = {

    /**
     * Check if LM Studio is running and get status
     */
    async getStatus() {
        try {
            const response = await fetch(`${getUrl()}/v1/models`, {
                signal: AbortSignal.timeout(3000)
            });

            if (!response.ok) throw new Error('Not responding');

            const data = await response.json();
            const models = data.data || [];

            return {
                online: true,
                url: getUrl(),
                modelCount: models.length,
                loadedModel: models[0]?.id || null
            };
        } catch (error) {
            return {
                online: false,
                url: getUrl(),
                error: error.message
            };
        }
    },

    /**
     * List available models
     */
    async listModels() {
        try {
            console.log(`[LMStudio] Fetching models from ${getUrl()}/v1/models...`);
            const response = await fetch(`${getUrl()}/v1/models`);
            if (!response.ok) {
                console.error(`[LMStudio] Response not OK: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            console.log(`[LMStudio] Found ${data.data?.length || 0} models.`);

            return (data.data || []).map(model => ({
                id: model.id,
                provider: 'lmstudio',
                object: model.object,
                owned_by: model.owned_by
            }));
        } catch (error) {
            console.error('LM Studio listModels error:', error);
            if (error.cause) console.error('Cause:', error.cause);
            return [];
        }
    },

    /**
     * Chat completion
     */
    async chat(messages, model = null) {
        const response = await fetch(`${getUrl()}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || settingsService.get('ai_default_model') || 'default',
                messages,
                temperature: 0.7,
                max_tokens: 2000,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`LM Studio error: ${response.status}`);
        }

        const data = await response.json();

        return {
            provider: 'lmstudio',
            model: data.model,
            content: data.choices[0]?.message?.content || '',
            usage: data.usage
        };
    },

    /**
     * Chat completion with streaming
     * Returns a ReadableStream
     */
    async chatStream(messages, model = null) {
        const response = await fetch(`${getUrl()}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || settingsService.get('ai_default_model') || 'default',
                messages,
                temperature: 0.7,
                max_tokens: 2000,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`LM Studio error: ${response.status}`);
        }

        return response.body;
    },

    /**
     * Load a model
     */
    async loadModel(model) {
        // Try standard endpoint first
        try {
            const res = await fetch(`${getUrl()}/v1/models/load`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model_id: model, load_config: {} })
            });
            if (res.ok) return true;
        } catch (e) {
            // Ignore
        }

        // Try API v0 endpoint (older versions)
        try {
            const res = await fetch(`${getUrl()}/api/v0/model/load`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: model })
            });
            if (res.ok) return true;
        } catch (e) {
            // Ignore
        }

        // Check if already loaded
        const status = await this.getStatus();
        if (status.loadedModel === model) return true;

        throw new Error('Could not load model via API. Please load manually in LM Studio.');
    },

    /**
     * Unload a model
     */
    async unloadModel(model) {
        // Try unload endpoint
        try {
            await fetch(`${getUrl()}/v1/models/unload`, { method: 'POST' });
            return true;
        } catch (e) {
            console.log('Unload not supported via API');
            return true; // Mock success
        }
    }
};
