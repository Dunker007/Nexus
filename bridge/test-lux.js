import { createAgent } from './services/agents.js';

async function testLux() {
    try {
        const lux = createAgent('lux');
        
        console.log("=== Testing Lux Orchestrator ===");
        const prompt = "What time is it right now and what is the weather in Chicago?";
        console.log(`Sending Prompt: "${prompt}"\n`);
        
        const result = await lux.processTask({
            message: prompt
        }, {});
        
        console.log("\n=== Final Response from Lux ===");
        console.log(result.content);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testLux();
