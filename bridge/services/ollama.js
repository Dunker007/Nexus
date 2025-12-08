/**
 * Ollama Service
 * Connects to Ollama's local API
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
import { settingsService } from './settings.js';

function getUrl() {
    return settingsService.get('ollama_url') || OLLAMA_URL;
}

export const ollamaService = {

    /**
     * Check if Ollama is running and get status
     */
    async getStatus() {
        try {
            const response = await fetch(`${getUrl()}/api/tags`, {
                signal: AbortSignal.timeout(3000)
            });

            if (!response.ok) throw new Error('Not responding');

            const data = await response.json();
            const models = data.models || [];

            // Check what's currently running
            let running = [];
            try {
                const psResponse = await fetch(`${getUrl()}/api/ps`);
                const psData = await psResponse.json();
                running = psData.models || [];
            } catch (e) {
                // ps endpoint might not exist in older versions
            }

            return {
                online: true,
                url: getUrl(),
                modelCount: models.length,
                runningModels: running.map(m => m.name),
                version: data.version
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
            console.log(`[Ollama] Fetching models from ${getUrl()}/api/tags...`);
            const response = await fetch(`${getUrl()}/api/tags`);
            if (!response.ok) {
                console.error(`[Ollama] Response not OK: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            console.log(`[Ollama] Found ${data.models?.length || 0} models.`);

            return (data.models || []).map(model => ({
                id: model.name,
                provider: 'ollama',
                size: model.size,
                modified_at: model.modified_at,
                details: model.details
            }));
        } catch (error) {
            console.error('Ollama listModels error:', error);
            if (error.cause) console.error('Cause:', error.cause);
            return [];
        }
    },

    /**
     * Chat completion
     */
    async chat(messages, model = 'llama3.2') {
        const response = await fetch(`${getUrl()}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();

        return {
            provider: 'ollama',
            model: data.model,
            content: data.message?.content || '',
            total_duration: data.total_duration,
            eval_count: data.eval_count
        };
    },

    /**
     * Generate (non-chat) completion
     */
    async generate(prompt, model = 'llama3.2') {
        const response = await fetch(`${getUrl()}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        return response.json();
    }
};
