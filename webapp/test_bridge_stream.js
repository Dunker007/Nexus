
async function testStream() {
    console.log("Testing Bridge Chat Stream on Port 3457...");

    try {
        const response = await fetch('http://localhost:3457/llm/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Ensure we use a model that exists or default
                model: "default",
                provider: "lmstudio",
                stream: true,
                messages: [{ role: "user", content: "Count to 5 quickly." }]
            })
        });

        if (!response.ok) {
            console.error("Response error:", response.status, response.statusText);
            const text = await response.text();
            console.error("Body:", text);
            return;
        }

        console.log("Response OK. Reading stream...");

        // Node.js fetch returns a web stream in newer versions, or we can iterate body
        // if using node-fetch (which we removed). Native fetch in Node 18+ returns Response.
        // response.body is a ReadableStream.

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunk = decoder.decode(value, { stream: true });
            process.stdout.write(chunk); // Print raw SSE output
        }

        console.log("\nStream complete.");

    } catch (e) {
        console.error("Test failed:", e);
    }
}

testStream();
