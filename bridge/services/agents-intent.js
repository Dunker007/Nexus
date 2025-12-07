/**
 * Intent Agent - Natural Language Understanding
 * Maps natural language commands to system actions
 */

import { Agent } from './agent-core.js';
import { lmstudioService } from './lmstudio.js';

export class IntentAgent extends Agent {
    constructor() {
        super({
            id: 'intent-agent',
            name: 'Intent Agent',
            description: 'Understands voice commands and executes system actions',
            capabilities: ['nlu', 'intent-recognition', 'command-execution']
        });
    }

    async processTask(task, context) {
        const { command } = task;

        // 1. Analyze Intent using LLM
        const intent = await this.analyzeIntent(command);

        // 2. Execute Action
        const result = await this.executeAction(intent);

        return {
            command,
            intent,
            result,
            timestamp: new Date()
        };
    }

    async analyzeIntent(command) {
        // Simple heuristic for now to avoid LLM latency on every command
        // In production, this would call a fast local model (e.g. Phi-3 or Gemma-2b)

        const cmd = command.toLowerCase();

        if (cmd.includes('status') || cmd.includes('report')) {
            return { action: 'get-status', target: 'system' };
        }

        if (cmd.includes('revenue') || cmd.includes('money') || cmd.includes('income')) {
            return { action: 'navigate', target: '/income' };
        }

        if (cmd.includes('studio') || cmd.includes('agent')) {
            return { action: 'navigate', target: '/studio' };
        }

        if (cmd.includes('home') || cmd.includes('dashboard')) {
            return { action: 'navigate', target: '/' };
        }

        if (cmd.includes('optimize') || cmd.includes('mining')) {
            return { action: 'optimize-revenue', target: 'revenue-agent' };
        }

        if (cmd.includes('meeting') || cmd.includes('staff') || cmd.includes('debate')) {
            return { action: 'navigate', target: '/meeting' };
        }

        // Fallback: Use LLM for complex queries (Mocked for speed)
        return { action: 'unknown', message: 'I am not sure how to do that yet.' };
    }

    async executeAction(intent) {
        switch (intent.action) {
            case 'navigate':
                return {
                    action: 'navigate',
                    target: intent.target,
                    message: `Navigating to ${intent.target}`
                };

            case 'get-status':
                return {
                    action: 'speak',
                    message: 'System is fully operational. All agents are online.'
                };

            case 'optimize-revenue':
                // In a real scenario, this would trigger the RevenueAgent
                return {
                    action: 'trigger',
                    target: 'revenue-agent',
                    message: 'Optimizing revenue streams now.'
                };

            default:
                return {
                    action: 'none',
                    message: intent.message || 'Command not recognized.'
                };
        }
    }
}
