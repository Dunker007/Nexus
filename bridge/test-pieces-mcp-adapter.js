/**
 * Test script for Pieces MCP Adapter
 * Verifies that the 5 new LTM tools are registered and callable
 */

import os from 'os';
import fs from 'fs';
import { execSync } from 'child_process';
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

// Detect WSL and show expected gateway IP
const isWsl = os.platform() === 'linux' && fs.existsSync('/mnt/c');
if (isWsl) {
    const gateway = execSync("ip route | grep default | awk '{print $3}'").toString().trim();
    console.log(`WSL detected: true`);
    console.log(`Gateway IP: ${gateway}`);
    console.log(`Expected Pieces URL: http://${gateway}:39300`);
} else {
    console.log(`WSL detected: false`);
    console.log(`Expected Pieces URL: http://localhost:39300 (Linux) or http://localhost:1000 (Windows/Mac)`);
}
console.log(`Actual Pieces URL: ${piecesService.basePath}`);
const pingResult = await piecesService.ping();
console.log(`Ping: ${pingResult ? '✅ Pieces OS is reachable' : '❌ Pieces OS not reachable'}`);

if (!pingResult) {
    console.log('\n⚠️  Pieces OS is not running or not accessible at the configured port.');
    console.log('The adapter will gracefully degrade - tools will return error messages when called.');
    if (isWsl) {
        console.log('\nTo fix: Ensure Pieces OS is running on Windows host and firewall allows port 39300.');
    } else {
        console.log('\nTo fix: Ensure Pieces OS is running on localhost.');
    }
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
