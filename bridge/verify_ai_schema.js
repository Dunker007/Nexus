import { analystService } from './services/analyst.js';

// Mock Snapshot with Global Context
const mockSnapshot = {
    accountName: 'SUI Account',
    strategyName: 'Aggressive Growth',
    targetMask: '50:25:25',
    marketRegime: 'ACCUMULATION',
    totalValue: 50000,
    cashPercent: 12.5,
    positions: [
        { symbol: 'SUI', units: 10000, currentValue: 18000, allocation: 36, targetAllocation: 50, gainLoss: 500 },
        { symbol: 'USDC', units: 6250, currentValue: 6250, allocation: 12.5, targetAllocation: 25, gainLoss: 0 }
    ],
    pendingOrders: [],
    strategyRules: ['SUI Anchor > 40%', 'Cash > 10%'],
    global: {
        totalValue: 100000,
        cashPercent: 8.5, // CRITICAL (< 10%)
        isSafetyNetCritical: false,
        suiAccount: { totalValue: 50000, cashPercent: 12.5, positions: [] },
        altsAccount: { totalValue: 50000, cashPercent: 4.5, positions: [] }
    }
};

async function testAnchorPersona() {
    console.log('\n🔵 Testing ANCHOR Persona...');
    try {
        const response = await analystService.analyze(
            mockSnapshot,
            'anchor',
            [],
            'Should I buy more SUI here?'
        );

        console.log('--- Raw Response ---');
        console.log(response);

        // Verify JSON parsing
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            console.log('\n✅ JSON Parsed Successfully:');
            console.log(JSON.stringify(data, null, 2));

            if (data.directive && data.psychology) {
                console.log('✅ Schema Validated: Directive + Psychology present.');
            } else {
                console.error('❌ Schema Missing Fields (directive/psychology)');
            }
        } else {
            console.error('❌ No JSON Block found in response.');
        }

    } catch (e) {
        console.error('❌ Test Failed:', e);
    }
}

async function testTacticianPersona() {
    console.log('\n🟣 Testing TACTICIAN Persona (Global Cash Low)...');
    try {
        const response = await analystService.analyze(
            mockSnapshot,
            'tactician',
            [],
            'I want to ape into PEPE.'
        );

        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            console.log('\n✅ Tactician Logic Check:');
            console.log(`Directive: ${data.directive.title}`);
            // Check if it warned about global cash
            if (JSON.stringify(data).toLowerCase().includes('cash') || data.directive.type === 'alert') {
                console.log('✅ Tactician respected Global Cash Warning.');
            } else {
                console.warn('⚠️ Tactician might have ignored low cash context.');
            }
        }
    } catch (e) {
        console.error('❌ Tactician Test Failed:', e);
    }
}

// Run
(async () => {
    await testAnchorPersona();
    await testTacticianPersona();
})();
