import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { toolRegistry } from './tool-registry.js';
import os from 'os';
import fs from 'fs';

// Find the correct IP/Port for Pieces OS
const determinePort = () => {
    if (os.platform() === 'linux' && fs.existsSync('/mnt/c')) return 39301;
    return 39301;
};

// Use localhost:39301 for Pieces OS MCP in WSL (as updated in May 16 fixes)
const PIECES_MCP_URL = `http://localhost:${determinePort()}/model_context_protocol/2024-11-05/sse`;

// The exact tools we want to inject into Lux's context to give it LTM and web powers
const WHITELISTED_TOOLS = [
    'search_memory',
    'ask_memory',
    'create_pieces_memory',
    'web_search',
    'get_user_persona'
];

class PiecesMCPConnector {
    constructor() {
        this.client = new Client({ name: "nexus-bridge", version: "1.0.0" }, { capabilities: { tools: {} } });
        this.transport = null;
        this.connected = false;
    }

    async connect() {
        try {
            console.log(`[Pieces MCP] Connecting to ${PIECES_MCP_URL}...`);
            this.transport = new SSEClientTransport(new URL(PIECES_MCP_URL));
            await this.client.connect(this.transport);
            this.connected = true;
            console.log(`[Pieces MCP] Connected successfully.`);
            
            await this.registerTools();
        } catch (error) {
            console.error(`[Pieces MCP] Connection failed:`, error.message);
        }
    }

    async registerTools() {
        if (!this.connected) return;
        
        try {
            const { tools } = await this.client.listTools();
            let registeredCount = 0;

            for (const tool of tools) {
                // Remove the "mcp_pieces_" prefix if present in the name, but keep original for calling
                const originalName = tool.name;
                const cleanName = originalName.replace(/^mcp_pieces_/, '');

                if (WHITELISTED_TOOLS.includes(cleanName) || WHITELISTED_TOOLS.includes(originalName)) {
                    // Register into our shared Tool Registry
                    toolRegistry.registerTool({
                        name: cleanName,
                        description: tool.description,
                        parameters: tool.inputSchema
                    }, async (args) => {
                        console.log(`[Pieces MCP] Executing ${originalName} with args:`, args);
                        try {
                            const result = await this.client.callTool({
                                name: originalName,
                                arguments: args
                            });
                            // Return the content from MCP result
                            return { success: true, result: result.content };
                        } catch (err) {
                            return { success: false, error: err.message };
                        }
                    });
                    registeredCount++;
                }
            }
            console.log(`[Pieces MCP] Registered ${registeredCount} tools into Nexus Tool Registry.`);
        } catch (error) {
            console.error(`[Pieces MCP] Failed to register tools:`, error.message);
        }
    }
}

export const piecesMcp = new PiecesMCPConnector();
