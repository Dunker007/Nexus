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
        // Auto-detect model if not specified or explicit 'default' requested
        if (!model || model === 'default') {
            try {
                // Quick check for currently loaded model
                const status = await this.getStatus();
                if (status.loadedModel) {
                    model = status.loadedModel;
                    console.log(`[LMStudio] Auto-detected model: ${model}`);
                }
            } catch (e) {
                console.warn('[LMStudio] Failed to auto-detect model, using fallback.');
            }
        }

        // Sanitize messages to ensure alternation (User -> Assistant -> User)
        // 1. Merge consecutive messages from same role
        // 2. Ensure first non-system message is User
        // Sanitize messages for strict Jinja/ChatML templates
        const sanitizedMessages = [];

        if (messages && messages.length > 0) {
            let systemContent = '';
            const conversation = [];

            // 1. Separate System vs Conversation
            for (const msg of messages) {
                if (msg.role === 'system') {
                    systemContent += (systemContent ? '\n\n' : '') + msg.content;
                } else {
                    conversation.push({ ...msg });
                }
            }

            // 2. Add System Message first if exists
            if (systemContent) {
                sanitizedMessages.push({ role: 'system', content: systemContent });
            }

            // 3. Process Conversation: Ensure User Start & Alternation
            // If first message is Assistant, prepend dummy User message or convert to System (if valid)
            // But prepending dummy user is safer for templates that hate System->Assistant
            if (conversation.length > 0 && conversation[0].role === 'assistant') {
                // Option A: Prepend User
                // conversation.unshift({ role: 'user', content: '(Continuing conversation...)' });

                // Option B: Append to System (Context) - cleaner for LLM
                if (sanitizedMessages.length > 0) {
                    sanitizedMessages[0].content += `\n\n[Context: Previous assistant response was "${conversation[0].content}"]`;
                } else {
                    sanitizedMessages.push({ role: 'system', content: `[Context: Previous assistant response was "${conversation[0].content}"]` });
                }
                conversation.shift(); // Remove the bad assistant message
            }

            // 4. Merge consecutive roles in conversation
            for (const msg of conversation) {
                // Treat unknown roles as 'user'
                const role = (msg.role === 'assistant') ? 'assistant' : 'user';

                if (sanitizedMessages.length > 0) {
                    const prev = sanitizedMessages[sanitizedMessages.length - 1];
                    if (prev.role === role) {
                        prev.content += '\n\n' + msg.content;
                    } else if (prev.role === 'system' && role === 'assistant') {
                        // System -> Assistant is forbidden in some templates. 
                        // Insert dummy user.
                        sanitizedMessages.push({ role: 'user', content: 'Please continue.' });
                        sanitizedMessages.push({ role: 'assistant', content: msg.content });
                    } else {
                        sanitizedMessages.push({ role, content: msg.content });
                    }
                } else {
                    // Start of conversation (no system msg exist)
                    // If it's assistant, we already handled it above, but double check
                    if (role === 'assistant') {
                        sanitizedMessages.push({ role: 'user', content: 'Please continue.' });
                    }
                    sanitizedMessages.push({ role, content: msg.content });
                }
            }
        } else {
            sanitizedMessages.push({ role: 'user', content: 'Hello' });
        }

        console.log(`[LMStudio] Sending ${sanitizedMessages.length} messages (Model: ${model || 'auto'})`);

        const response = await fetch(`${getUrl()}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'gemma-3n-e4b-it', // Fallback to user's preferred model
                messages: sanitizedMessages,
                temperature: 0.7,
                max_tokens: -1, // Use -1 for infinite/context-limit
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`LM Studio error: ${response.status} - ${errText}`);
        }

        const data = await response.json();

        return {
            provider: 'lmstudio',
            model: data.model,
            content: data.choices[0]?.message?.content || '',
            usage: data.usage
        };
    }
};
