import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

async function main() {
    const transport = new SSEClientTransport(new URL("http://localhost:39301/model_context_protocol/2024-11-05/sse"));
    const client = new Client({ name: "nexus-bridge", version: "1.0.0" }, { capabilities: { tools: {} } });
    
    try {
        await client.connect(transport);
        const result = await client.listTools();
        console.log(result.tools.map(t => t.name).join("\n"));
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
main();
