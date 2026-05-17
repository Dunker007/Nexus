/**
 * Test Lux Orchestrator — Phase O-1: Core
 * 
 * Tests:
 * 1. Tool registry loads with real tools
 * 2. Lux can call get_system_time
 * 3. Lux can call get_weather with a real city
 * 4. Lux synthesizes multiple tool results
 *
 * Run: node bridge/test-lux.js
 */

import { LuxAgent } from './services/agents-lux.js';
import { toolRegistry } from './services/tool-registry.js';

async function testLux() {
    console.log('╔══════════════════════════════════════╗');
    console.log('║  Lux Orchestrator Phase O-1: Core   ║');
    console.log('╚══════════════════════════════════════╝\n');

    // ─── Check 1: Tool registry ───
    const tools = toolRegistry.getTools();
    console.log(`[Check 1] Tool registry: ${tools.length} tools loaded`);
    tools.forEach(t => console.log(`  - ${t.name}: ${t.description.substring(0, 60)}...`));
    console.log(tools.length >= 2 ? '  ✅ PASS\n' : '  ❌ FAIL\n');

    // ─── Check 2: Execute tool directly ───
    console.log('[Check 2] Direct tool execution...');
    try {
        const timeResult = await toolRegistry.executeTool('get_system_time', {});
        console.log(`  get_system_time → ${timeResult.iso}`);
        console.log(timeResult.success ? '  ✅ PASS\n' : '  ❌ FAIL\n');
    } catch (e) {
        console.log(`  ❌ FAIL: ${e.message}\n`);
    }

    // ─── Check 3: Real weather tool ───
    console.log('[Check 3] Real weather lookup (Chicago)...');
    try {
        const weather = await toolRegistry.executeTool('get_weather', { location: 'Chicago' });
        console.log(`  ${weather.location.name}, ${weather.location.country}: ${weather.current.temperature_f}°F (high ${weather.today.high_f}°F / low ${weather.today.low_f}°F)`);
        console.log(weather.success ? '  ✅ PASS\n' : '  ❌ FAIL\n');
    } catch (e) {
        console.log(`  ❌ FAIL: ${e.message}\n`);
    }

    // ─── Check 4: Lux orchestrator with compound query ───
    console.log('[Check 4] Lux compound query: "what time is it and what\'s the weather in Minneapolis?"');
    console.log('  (This tests the full tool-calling loop + synthesis)\n');
    
    try {
        const lux = new LuxAgent();
        console.log(`  Lux initialized. System prompt: ${lux.buildSystemPrompt().length} chars`);
        console.log('  Sending to LM Studio...\n');

        const result = await lux.processTask({
            message: "What time is it right now and what's the weather in Minneapolis?"
        }, {});

        console.log(`\n  ─── Lux Response (${result.iterations} tool iteration(s)) ───`);
        console.log(`  ${result.content}`);
        console.log(`  ─── End Response ───`);
        console.log(`  Model: ${result.model}, Provider: ${result.provider}`);
        console.log('\n  ✅ PASS (if response contains time AND weather data)\n');
    } catch (e) {
        console.log(`  ❌ FAIL: ${e.message}`);
        console.log('  (LM Studio may not be running. Start it and retry.)\n');
    }

    console.log('═══ Phase O-1 Core tests complete ═══');
}

testLux().catch(console.error);