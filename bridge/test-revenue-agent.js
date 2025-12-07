import { createAgent } from './services/agents.js';

async function testRevenueAgent() {
    console.log('🚀 Testing Revenue Agent...');

    try {
        const agent = createAgent('revenue');
        console.log('✅ Agent created:', agent.name);

        console.log('📊 Optimizing revenue...');
        const result = await agent.execute({
            action: 'optimize-revenue',
            config: { electricityCost: 0.12 }
        });

        console.log('✅ Optimization complete:');
        console.log(JSON.stringify(result, null, 2));

        console.log('🛑 Stopping mining...');
        const stopResult = await agent.execute({ action: 'stop-mining' });
        console.log('✅ Mining stopped:', stopResult);

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testRevenueAgent();
