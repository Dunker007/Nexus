import { Agent } from './agent-core.js';
import { lmstudioService } from './lmstudio.js';

// Dumb / stateless tools that Lux can call
const tools = {
    get_weather: ({ location }) => {
        // In the future, this will hit a real API like OpenWeatherMap
        console.log(`[Tool Executed] Fetching weather for ${location}...`);
        return `The current weather in ${location || 'your location'} is 68°F and sunny.`;
    },
    get_time: () => {
        console.log(`[Tool Executed] Fetching current time...`);
        return `The current time is ${new Date().toLocaleTimeString()}.`;
    },
    get_hockey_score: ({ team }) => {
        // In the future, this will hit an ESPN or NHL API
        console.log(`[Tool Executed] Fetching hockey score for ${team}...`);
        return `The ${team || 'Blackhawks'} won 4-2 last night!`;
    }
};

export class LuxAgent extends Agent {
    constructor() {
        super({
            id: 'lux-orchestrator',
            name: 'Lux',
            description: 'The Executive Orchestrator. Evaluates user intent and delegates to dumb tools or memory agents.',
            capabilities: ['orchestration', 'tool-calling', 'synthesis']
        });
    }

    async processTask(task, context) {
        const { message, history = [] } = task;

        // The Orchestrator's System Prompt
        const systemPrompt = `You are Lux, the executive orchestrator of the Nexus system.
You have access to the following tools:
1. get_weather(location): Fetch the current weather.
2. get_time(): Fetch the current local time.
3. get_hockey_score(team): Fetch last night's hockey score.

If you need to use a tool, you MUST reply with a JSON block in this exact format:
\`\`\`json
{
  "tool": "tool_name",
  "args": {
    "location": "Chicago"
  }
}
\`\`\`
If you do not need a tool, just answer the user normally. Synthesize all tool responses into natural conversation.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: message }
        ];

        console.log(`[Lux] Analyzing user request: "${message}"`);

        // Loop up to 5 times to resolve multi-tool requests
        let iterations = 0;
        let response = await lmstudioService.chat(messages, 'default');
        
        while (iterations < 5) {
            let toolCallMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
            let gemmaMatch = response.content.match(/<\|tool_call>call:([a-zA-Z_]+)\{(.*?)\}<tool_call\|>/);
            
            let parsedTool = null;
            
            if (toolCallMatch) {
                try {
                    parsedTool = JSON.parse(toolCallMatch[1]);
                } catch(e) { }
            } else if (gemmaMatch) {
                let args = {};
                try {
                    if (gemmaMatch[2]) {
                        args = JSON.parse(`{${gemmaMatch[2]}}`);
                    }
                } catch(e) {}
                parsedTool = { tool: gemmaMatch[1], args };
            }
            
            if (parsedTool) {
                try {
                    console.log(`[Lux] Decided to call tool: ${parsedTool.tool}`);
                    
                    if (tools[parsedTool.tool]) {
                        // Execute the tool
                        const toolResult = tools[parsedTool.tool](parsedTool.args || {});
                        console.log(`[Lux] Tool returned: ${toolResult}`);
                        
                        // Feed the raw data back to Lux for synthesis/further tool calls
                        messages.push({ role: 'assistant', content: response.content });
                        messages.push({ role: 'user', content: `[SYSTEM: Tool Result] -> ${toolResult}` });
                        
                        // Call LM Studio again
                        console.log(`[Lux] Synthesizing or checking for next tool...`);
                        response = await lmstudioService.chat(messages, 'default');
                    } else {
                        console.log(`[Lux] Attempted to call unknown tool: ${parsedTool.tool}`);
                        messages.push({ role: 'assistant', content: response.content });
                        messages.push({ role: 'user', content: `[SYSTEM: Tool Result] -> Error: Unknown tool ${parsedTool.tool}` });
                        response = await lmstudioService.chat(messages, 'default');
                    }
                } catch (e) {
                    console.error("[Lux] Error executing tool:", e);
                    break;
                }
            } else {
                console.log(`[Lux] No tool needed, or finished resolving. Responding directly.`);
                break;
            }
            iterations++;
        }

        return {
            content: response.content,
            provider: response.provider,
            model: response.model,
            timestamp: new Date()
        };
    }
}
