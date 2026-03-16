const fs = require('fs');
let content = fs.readFileSync('webapp/src/app/chat/page.tsx', 'utf8');

const oldFunc = `async function sendMessage() {
        if (!input.trim() || loading) return;

        if (viewMode === 'models' && !selectedModel) {
            alert("Please select a model from the sidebar first.");
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Include message history
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
            }));

            // Determine Request Params
            let reqProvider = settings.defaultProvider;
            let reqModel = settings.defaultModel;
            let reqSystem = activeAgent.systemPrompt;
            let reqTemp = settings.temperature;
            let reqMaxTokens = settings.maxTokens;

            if (viewMode === 'models' && selectedModel) {
                reqProvider = selectedModel.provider;
                reqModel = selectedModel.id;
                reqSystem = customSystemPrompt;
            }

            const res = await fetchWithTimeout(\`\${BRIDGE_URL}/llm/chat\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: reqSystem },
                        ...history,
                        { role: 'user', content: input }
                    ],
                    model: reqModel,
                    provider: reqProvider,
                    temperature: reqTemp,
                    maxTokens: reqMaxTokens
                }),
                timeout: 120000 // 2 minutes for LLM
            });

            if (!res.ok) {
                throw new Error(\`Request failed with status \${res.status}\`);
            }

            const data = await res.json();
            
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: viewMode === 'agents' ? 'agent' : 'assistant',
                content: data.response || data.message || "Received empty response from bridge.",
                timestamp: new Date(),
                agentId: viewMode === 'agents' ? activeAgent.id : undefined
            }]);
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: \`❌ Error: \${error.message}\`,
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }`;

const newFunc = `async function sendMessage(e?: any) {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        if (viewMode === 'models' && !selectedModel) {
            alert("Please select a model from the sidebar first.");
            return;
        }

        handleSubmit(e);
    }`;

content = content.replace(oldFunc, newFunc);
content = content.replace(/onChange={\(e\) => setInput\(e.target.value\)}/g, 'onChange={handleInputChange}');

// Also remove initial load messages because useChat manages message state differently
const initialLoadBlock = `    // Initial load message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: '0',
                role: 'assistant',
                content: \`**Neural Hub Online.**\\n\\nI am Lux, your primary interface. Select an agent to collaborate, or switch to "Models" tab to inspect and drive local LLMs directly.\`,
                timestamp: new Date(),
                agentId: 'lux'
            }]);
        }
    }, [viewMode]);`;
content = content.replace(initialLoadBlock, '');

fs.writeFileSync('webapp/src/app/chat/page.tsx', content);
