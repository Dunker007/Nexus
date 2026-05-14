import { Agent } from './agent-core.js';
import { lmstudioService } from './lmstudio.js';
import { toolRegistry } from './tool-registry.js';

export class LuxAgent extends Agent {
    constructor() {
        super({
            id: 'lux-orchestrator',
            name: 'Lux',
            description: 'The Executive Orchestrator. Evaluates user intent, delegates to tools/agents, and synthesizes a single consolidated response.',
            capabilities: ['orchestration', 'tool-calling', 'delegation', 'synthesis']
        });
    }

    // Build Lux's system prompt dynamically from the shared tool registry
    buildSystemPrompt() {
        const toolList = toolRegistry.getTools()
            .map(t => {
                const params = t.parameters?.properties 
                    ? Object.entries(t.parameters.properties)
                        .map(([k, v]) => `${k}: ${v.description || v.type}`)
                        .join(', ')
                    : 'none';
                const required = t.parameters?.required?.length 
                    ? ` (required: ${t.parameters.required.join(', ')})` 
                    : '';
                return `- ${t.name}(${params})${required}: ${t.description}`;
            })
            .join('\n');

        return `You are Lux, the executive orchestrator of the Nexus system.
You have access to the following tools:

${toolList}

When you need to use a tool, reply with a JSON block in this EXACT format:
\`\`\`json
{
  "tool": "tool_name",
  "args": {
    "param1": "value1"
  }
}
\`\`\`

RULES:
- Use tools whenever you need REAL data (time, weather, system info, etc.). Do NOT guess or make up data that a tool can provide.
- You can call MULTIPLE tools in one response by listing multiple JSON blocks.
- After receiving tool results, SYNTHESIZE them into one natural, conversational response. Do NOT just dump raw JSON.
- If you don't need a tool, answer the user directly.
- Be concise but complete. Prioritize accuracy over speed.`;
    }

    // Format a tool result into something Gemma can read
    formatToolResult(result) {
        if (typeof result === 'string') return result;
        if (result && typeof result === 'object') {
            // Flatten nested objects into readable lines
            return JSON.stringify(result, null, 0)
                .replace(/[{}"]/g, '')
                .replace(/,/g, ', ');
        }
        return String(result);
    }

    async processTask(task, context) {
        const { message, history = [] } = task;

        const systemPrompt = this.buildSystemPrompt();
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: message }
        ];

        console.log(`[Lux] Processing: "${message}"`);
        console.log(`[Lux] Available tools: ${toolRegistry.getToolNames().join(', ')}`);

        // Loop up to 5 iterations for multi-tool resolution
        let iterations = 0;
        let response = await lmstudioService.chat(messages, 'default');

        while (iterations < 5) {
            // Parse tool calls from Gemma's response
            // Supports: ```json {...} ``` blocks, and Gemma native <|tool_call|> format
            const toolCallMatch = response.content.match(/```json\n([\s\S]*?)\n```/g);
            const gemmaMatch = response.content.match(/<\|tool_call\|>call:([a-zA-Z_]+)\{(.*?)\}<tool_call\|>/);

            let parsedTools = [];

            if (toolCallMatch) {
                for (const block of toolCallMatch) {
                    try {
                        const json = block.replace(/```json\n/, '').replace(/\n```/, '');
                        parsedTools.push(JSON.parse(json));
                    } catch (e) {
                        console.warn(`[Lux] Failed to parse tool block: ${block.substring(0, 80)}...`);
                    }
                }
            } else if (gemmaMatch) {
                let args = {};
                try {
                    if (gemmaMatch[2]) {
                        args = JSON.parse(`{${gemmaMatch[2]}}`);
                    }
                } catch (e) {}
                parsedTools.push({ tool: gemmaMatch[1], args });
            }

            if (parsedTools.length > 0) {
                console.log(`[Lux] Tool calls detected: ${parsedTools.map(t => t.tool).join(', ')}`);
                const toolResults = [];

                for (const parsed of parsedTools) {
                    try {
                        const result = await toolRegistry.executeTool(parsed.tool, parsed.args || {});
                        const formatted = this.formatToolResult(result);
                        toolResults.push({ tool: parsed.tool, success: true, result: formatted });
                        console.log(`[Lux] ✓ ${parsed.tool} returned ${formatted.length} chars`);
                    } catch (err) {
                        toolResults.push({ tool: parsed.tool, success: false, result: `Error: ${err.message}` });
                        console.error(`[Lux] ✗ ${parsed.tool} failed: ${err.message}`);
                    }
                }

                // Feed results back to Lux for synthesis or next round
                messages.push({ role: 'assistant', content: response.content });
                messages.push({
                    role: 'user',
                    content: `[SYSTEM: Tool Results]\n${toolResults.map(tr =>
                        `${tr.tool}: ${tr.success ? 'SUCCESS' : 'FAILED'} → ${tr.result}`
                    ).join('\n')}`
                });

                console.log(`[Lux] Feeding ${toolResults.length} tool result(s) back for synthesis...`);
                response = await lmstudioService.chat(messages, 'default');
            } else {
                console.log(`[Lux] No tool calls detected. Responding directly.`);
                break;
            }
            iterations++;
        }

        if (iterations >= 5) {
            console.warn(`[Lux] Max iterations (5) reached. Returning last response.`);
        }

        return {
            content: response.content,
            provider: response.provider,
            model: response.model,
            iterations,
            timestamp: new Date()
        };
    }
}
