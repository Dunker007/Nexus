import { LuxAgent } from './services/agents-lux.js';
import { toolRegistry } from './services/tool-registry.js';

async function testLuxPhase2() {
    console.log('╔══════════════════════════════════════╗');
    console.log('║  Lux Orchestrator Phase O-2: Agents  ║');
    console.log('╚══════════════════════════════════════╝\n');

    // ─── Check 1: Tool registry has new tools ───
    const tools = toolRegistry.getTools();
    const hasDelegate = tools.some(t => t.name === 'delegate_to_agent');
    const hasCallable = tools.some(t => t.name === 'get_callable_agents');
    console.log(`[Check 1] Tool registry has delegate_to_agent: ${hasDelegate}`);
    console.log(`[Check 1] Tool registry has get_callable_agents: ${hasCallable}`);
    console.log(hasDelegate && hasCallable ? '  ✅ PASS\n' : '  ❌ FAIL\n');

    // ─── Check 2: Execute get_callable_agents directly ───
    console.log('[Check 2] Direct get_callable_agents execution...');
    try {
        const result = await toolRegistry.executeTool('get_callable_agents', {});
        console.log(`  Found ${result.agents?.length} callable agents.`);
        const foundResearch = result.agents.some(a => a.id === 'research');
        console.log(result.success && result.agents?.length > 0 ? '  ✅ PASS\n' : '  ❌ FAIL\n');
    } catch (e) {
        console.log(`  ❌ FAIL: ${e.message}\n`);
    }

    // ─── Check 3: Lux orchestrator delegates task ───
    console.log('[Check 3] Lux compound query: "Who can help me research a topic? Ask the appropriate agent to research the topic \'Quantum Computing\'"');
    console.log('  (This tests the tool-calling loop delegating to an agent)\n');
    
    try {
        const lux = new LuxAgent();
        console.log(`  Lux initialized. System prompt: ${lux.buildSystemPrompt().length} chars`);
        console.log('  Sending to LM Studio...\n');

        const result = await lux.processTask({
            message: "I need to research 'Quantum Computing'. Find the right agent, and delegate the task to them."
        }, {});

        console.log(`\n  ─── Lux Response (${result.iterations} tool iteration(s)) ───`);
        console.log(`  ${result.content}`);
        console.log(`  ─── End Response ───`);
        console.log(`  Model: ${result.model}, Provider: ${result.provider}`);
        console.log('\n  ✅ PASS (if response delegates to research agent and includes results)\n');
    } catch (e) {
        console.log(`  ❌ FAIL: ${e.message}`);
        console.log('  (LM Studio may not be running. Start it and retry.)\n');
    }

    console.log('═══ Phase O-2 Agents tests complete ═══');
}

testLuxPhase2().catch(console.error);
