async function test() {
    try {
        const response = await fetch('http://localhost:1234/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen3-4b-claude-sonnet-4-reasoning-distill-safetensor",
                messages: [{ role: "user", content: "Hello" }],
                temperature: 0.7
            })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
