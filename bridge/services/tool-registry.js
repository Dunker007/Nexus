import https from 'https';

class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }

    registerTool(toolDefinition, handler) {
        this.tools.set(toolDefinition.name, {
            definition: toolDefinition,
            handler
        });
    }

    getTools() {
        return Array.from(this.tools.values()).map(t => t.definition);
    }

    getToolNames() {
        return Array.from(this.tools.keys());
    }

    async executeTool(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool "${name}" not found in Nexus Tool Registry. Available: ${this.getToolNames().join(', ')}`);
        }
        try {
            console.log(`[Tool Server] Executing tool: ${name}`, args);
            const result = await tool.handler(args);
            return result;
        } catch (error) {
            console.error(`[Tool Server] Error executing tool ${name}:`, error);
            throw error;
        }
    }
}

export const toolRegistry = new ToolRegistry();

// ─── Helper: fetch JSON over HTTPS (Node built-in, no deps) ───
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error(`Failed to parse response from ${url}`)); }
            });
        }).on('error', reject);
    });
}

// ─── TOOL: get_system_time ───
toolRegistry.registerTool({
    name: 'get_system_time',
    description: 'Get the current system time in ISO 8601 format.',
    parameters: {
        type: 'object',
        properties: {
            timezone: {
                type: 'string',
                description: 'Optional IANA timezone (e.g. America/Chicago). Defaults to system local.'
            }
        }
    }
}, async (args) => {
    const now = new Date();
    return {
        success: true,
        iso: now.toISOString(),
        local: now.toLocaleTimeString('en-US', { timeZone: args?.timezone || undefined }),
        timezone: args?.timezone || 'system local',
        unix_ms: now.getTime()
    };
});

// ─── TOOL: get_weather ───
// Uses Open-Meteo (free, no API key, no rate limit for non-commercial use)
// Two-step: geocode city name → lat/lon → current weather
toolRegistry.registerTool({
    name: 'get_weather',
    description: 'Get current weather conditions for a city. Uses Open-Meteo free API — no key required.',
    parameters: {
        type: 'object',
        properties: {
            location: {
                type: 'string',
                description: 'City name (e.g. "Chicago", "Minneapolis", "London").'
            }
        },
        required: ['location']
    }
}, async (args) => {
    const city = args.location;
    if (!city) throw new Error('Missing required parameter: location');

    // Step 1: Geocode city → lat/lon
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoResult = await fetchJSON(geoUrl);
    
    if (!geoResult.results || geoResult.results.length === 0) {
        return { success: false, error: `Could not find location: "${city}"` };
    }
    
    const { name, latitude, longitude, country_code, timezone } = geoResult.results[0];

    // Step 2: Fetch current weather + daily forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=${encodeURIComponent(timezone)}`;
    const weatherResult = await fetchJSON(weatherUrl);

    const cw = weatherResult.current_weather;
    const daily = weatherResult.daily;

    return {
        success: true,
        location: { name, country: country_code, latitude, longitude, timezone },
        current: {
            temperature_f: cw.temperature,
            wind_speed_mph: Math.round(cw.windspeed * 0.621371), // km/h → mph
            wind_direction: cw.winddirection,
            condition: cw.weathercode, // WMO code — Lux can interpret
            time: cw.time
        },
        today: {
            high_f: daily.temperature_2m_max[0],
            low_f: daily.temperature_2m_min[0],
            precipitation_chance_pct: daily.precipitation_probability_max[0]
        }
    };
});

// ─── TOOL: delegate_to_agent ───
toolRegistry.registerTool({
    name: 'delegate_to_agent',
    description: 'Delegate a specialized sub-task to another AI agent.',
    parameters: {
        type: 'object',
        properties: {
            agent_type: {
                type: 'string',
                description: 'The ID of the agent to call (e.g. "research", "code", "newsician"). Call get_callable_agents if unsure.'
            },
            task: {
                type: 'object',
                description: 'The task payload for the agent (usually includes an "action" and other params, or "message", or "query").'
            }
        },
        required: ['agent_type', 'task']
    }
}, async (args) => {
    const { agent_type, task } = args;
    if (!agent_type) throw new Error('Missing required parameter: agent_type');
    if (!task) throw new Error('Missing required parameter: task');

    // Dynamic import to avoid circular dependency
    const { createAgent } = await import('./agents.js');
    
    try {
        const agent = createAgent(agent_type);
        const result = await agent.processTask(task, {});
        return {
            success: true,
            agent: agent.name,
            result
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
});

// ─── TOOL: get_callable_agents ───
toolRegistry.registerTool({
    name: 'get_callable_agents',
    description: 'List all specialized AI agents available for delegation, including their IDs and capabilities.',
    parameters: {
        type: 'object',
        properties: {}
    }
}, async () => {
    const { agentRegistry } = await import('./agents.js');
    const available = [];
    for (const [key, AgentClass] of Object.entries(agentRegistry)) {
        if (key === 'lux') continue; // Skip self
        try {
            const temp = new AgentClass();
            available.push({
                id: key,
                name: temp.name,
                description: temp.description,
                capabilities: temp.capabilities || []
            });
        } catch (e) {
            // Ignore errors for uninstantiable agents
        }
    }
    return {
        success: true,
        agents: available
    };
});
