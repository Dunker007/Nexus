import fetch from 'node-fetch';

async function testDirectAccess() {
    console.log('╔══════════════════════════════════════╗');
    console.log('║  Lux Orchestrator Phase O-5: Direct ║');
    console.log('╚══════════════════════════════════════╝\n');
    console.log('Testing direct messaging to bypass Lux Core.\n');

    try {
        console.log('Sending message to: POST /api/agents/newsician/chat');
        const res = await fetch('http://localhost:3456/api/agents/newsician/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'your-secure-api-key-here' 
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'What is your specialty?' }],
                context: {}
            })
        });

        const data = await res.json();
        
        if (data.success) {
            console.log(`\n✅ PASS: Newsician responded directly bypassing Lux!`);
            console.log(`Response length: ${data.response.length} chars...`);
            console.log(`Content:\n${data.response}`);
        } else {
            console.log(`\n❌ FAIL: ${JSON.stringify(data)}`);
            process.exit(1);
        }

    } catch (e) {
        console.error(`\n❌ Network Error: Server likely isn't running on port 3456. Run 'npm start' in another terminal.\n${e.message}\n`);
    }
}

testDirectAccess();
