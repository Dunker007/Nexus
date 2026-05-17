import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function main() {
    const transport = new SSEClientTransport(new URL("http://localhost:39301/model_context_protocol/2024-11-05/sse"));
    const client = new Client({ name: "nexus-bridge", version: "1.0.0" }, { capabilities: { tools: {} } });
    
    try {
        await client.connect(transport);
        console.log("Connected to Pieces MCP");
        const toolsResult = await client.listTools();
        console.log(`Found ${toolsResult.tools.length} tools`);
        console.log("Sample tool:");
        console.log(toolsResult.tools[0]);
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
