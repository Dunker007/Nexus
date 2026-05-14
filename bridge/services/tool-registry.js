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

    async executeTool(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool ${name} not found in Nexus Tool Registry`);
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

// Initialize basic tools for proof of concept
toolRegistry.registerTool({
    name: 'get_system_time',
    description: 'Get the current system time.',
    parameters: {
        type: 'object',
        properties: {
            timezone: {
                type: 'string',
                description: 'Optional timezone. Defaults to local timezone.'
            }
        }
    }
}, async (args) => {
    return { 
        success: true,
        time: new Date().toISOString(),
        message: 'This is the current system time retrieved from the Nexus Tool Server.'
    };
});
