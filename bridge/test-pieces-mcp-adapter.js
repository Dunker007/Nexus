/**
 * Test script for Pieces MCP Adapter
 * Verifies that the 5 new LTM tools are registered and callable
 */

import { toolRegistry } from './services/tool-registry.js';
import { piecesService } from './services/pieces.js';
import './services/pieces-mcp-adapter.js'; // Load the adapter to register tools

console.log('=== Pieces MCP Adapter Test ===\n');

// 1. Check tool registration
const registeredTools = toolRegistry.getToolNames();
const expectedTools = ['ask_memory', 'search_memory', 'get_calendar_events', 'get_browser_activity', 'get_workstream_summary'];

console.log('Registered tools:', registeredTools);
console.log('\nExpected LTM tools:');
for (const tool of expectedTools) {
    const found = registeredTools.includes(tool);
    console.log(`  ${found ? '✅' : '❌'} ${tool}`);
}

// 2. Test Pieces OS connectivity
console.log('\n=== Pieces OS Connectivity ===');
console.log(`Pieces URL: ${piecesService.basePath}`);
const pingResult = await piecesService.ping();
console.log(`Ping: ${pingResult ? '✅ Pieces OS is reachable' : '❌ Pieces OS not reachable'}`);

if (!pingResult) {
    console.log('\n⚠️  Pieces OS is not running or not accessible at the configured port.');
    console.log('The adapter will gracefully degrade - tools will return error messages when called.');
    console.log('\nTo fix: Ensure Pieces OS is running on Windows host.');
}

// 3. Try a simple query (if Pieces is up)
if (pingResult) {
    console.log('\n=== Testing ask_memory tool ===');
    try {
        const toolResult = await toolRegistry.executeTool('ask_memory', {
            question: 'What was I working on recently?',
            timeRange: 'last 7 days'
        });
        
        if (toolResult.success) {
            console.log('✅ ask_memory executed successfully');
            console.log(`   Evidence count: ${toolResult.evidence?.length || 0}`);
            console.log(`   Matched persons: ${toolResult.matchedPersons?.length || 0}`);
            console.log(`   Matched summaries: ${toolResult.matchedSummaries?.length || 0}`);
        } else {
            console.log('⚠️  ask_memory returned error:', toolResult.error || toolResult.fallback);
        }
    } catch (error) {
        console.log('❌ ask_memory threw exception:', error.message);
    }
}

console.log('\n=== Test Complete ===');
console.log('\nNext steps:');
console.log('1. Start the bridge: npm start');
console.log('2. Test via Lux: "What was I working on last week?"');
console.log('3. Lux should call ask_memory tool and return real LTM data');
