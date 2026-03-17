const fs = require('fs');
let content = fs.readFileSync('webapp/src/app/chat/page.tsx', 'utf8');

// Replace the entire sendMessage function with the new logic
const oldSendMessageRegex = /async function sendMessage\(\) \{([\s\S]*?)finally \{([\s\S]*?)setLoading\(false\);([\s\S]*?)\}\n    \}/;

const newSendMessage = \`async function sendMessage() {
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
            }));

            // Use our new cloud-ready API route
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...history, { role: 'user', content: currentInput }],
                    agentId: activeAgentId,
                    customSystemPrompt: viewMode === 'models' ? customSystemPrompt : undefined
                })
            });

            if (!res.ok) throw new Error("Failed to reach Gemini brain.");

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No response body.");

            const assistantMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'agent',
                content: '',
                timestamp: new Date(),
                agentId: activeAgentId
            }]);

            let accumulatedContent = '';
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                accumulatedContent += chunk;
                
                setMessages(prev => prev.map(m => 
                    m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m
                ));
            }

        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: \\\`❌ Error: \\\${error.message}\\\`,
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }\`;

content = content.replace(oldSendMessageRegex, newSendMessage);

// Ensure imports are clean
content = content.replace("import { useChat } from '@ai-sdk/react';", "");

fs.writeFileSync('webapp/src/app/chat/page.tsx', content);
