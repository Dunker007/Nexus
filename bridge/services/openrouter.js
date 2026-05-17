/**
 * OpenRouter Service
 * Connects to OpenRouter's OpenAI-compatible API for model tiering.
 * Used for routing complex tasks (like deep coding or advanced logic) out to cloud models.
 */

import fetch from 'node-fetch';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1';

export const openRouterService = {
    /**
     * Send a standard chat completion request to OpenRouter
     */
    async evaluate(messages, options = {}) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.warn('[OpenRouter] Missing OPENROUTER_API_KEY inside bridge/.env.');
            throw new Error('Missing OPENROUTER_API_KEY');
        }

        // Default to a solid mid-tier model if one isn't specified
        const model = options.model || 'anthropic/claude-3-haiku';
        
        try {
            console.log(`[OpenRouter] Routing query to cloud tier: ${model}`);
            const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://github.com/DLX-Studios/Nexus', // Required by OpenRouter 
                    'X-Title': 'DLX Nexus Orchestrator' 
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.max_tokens ?? 2000,
                    tools: options.tools,
                    tool_choice: options.tool_choice
                }),
                signal: AbortSignal.timeout(options.timeout || 30000)
            });

            if (!response.ok) {
                const errResult = await response.text();
                throw new Error(`OpenRouter API error: ${response.status} - ${errResult}`);
            }

            const data = await response.json();
            return data.choices[0].message;
        } catch (error) {
            console.error('[OpenRouter] Fetch failed:', error.message);
            throw error;
        }
    }
};
