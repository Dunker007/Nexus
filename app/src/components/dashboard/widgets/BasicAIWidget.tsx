import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Eraser } from 'lucide-react';

const LUXRIG_BRIDGE_URL = '/api';
const bridgeFetch = (path: string, options: any = {}) => fetch(`${LUXRIG_BRIDGE_URL}${path}`, options);

interface ChatMessage {
    id?: number;
    role: 'user' | 'assistant';
    content: string;
}

export function BasicAIWidget() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch history
    useEffect(() => {
        bridgeFetch('/chat?agentId=basic_ai')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data);
                }
            })
            .catch(err => console.error('Failed to load history:', err));
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isAiThinking]);

    const saveMessage = async (role: 'user' | 'assistant', content: string) => {
        try {
            await bridgeFetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, content, agent_id: 'basic_ai' })
            });
        } catch (err) {
            console.error('Failed to save message:', err);
        }
    };

    const clearHistory = async () => {
        try {
            await bridgeFetch('/chat?agentId=basic_ai', { method: 'DELETE' });
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear history', err);
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isAiThinking) return;

        const userText = input;
        setMessages(prev => [...prev, { role: 'user', content: userText }]);
        setInput('');
        setIsAiThinking(true);

        // Save aggressively
        saveMessage('user', userText);

        try {
            const res = await bridgeFetch('/debate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userText }],
                    systemPrompt: `You are Lux, Chris Barclay's (Dunker) right-hand AI and main thinking partner at DLX Studios. Tone: Casual & Stream-of-Consciousness. Operational Protocol (The "Lux Loop"): 1. Reflect 2. Distill 3. Move.`
                })
            });

            if (res.ok) {
                const data = await res.json();
                const aiResponse = data.text || 'No response text received.';
                setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
                saveMessage('assistant', aiResponse);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: '![Error] Failed to get response from AI.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: '![Error] Could not connect to Bridge.' }]);
        } finally {
            setIsAiThinking(false);
        }
    }

    return (
        <div className="absolute inset-0 flex flex-col p-5">
            <button
                onClick={clearHistory}
                className="absolute top-6 right-8 p-1.5 bg-black/40 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all z-10 border border-white/5 backdrop-blur-md"
                title="Wipe Memory"
            >
                <Eraser size={14} />
            </button>
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto overflow-x-hidden mb-4 custom-scrollbar bg-black/20 rounded-lg p-3 border border-white/5 flex flex-col gap-3"
            >
                {messages.length === 0 && !isAiThinking ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Start chatting...
                    </div>
                ) : null}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-lg max-w-[90%] text-sm ${
                            msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50' : 'bg-white/5 border border-white/10 text-gray-300'
                        } break-words`}>
                            <span className="whitespace-pre-wrap">{msg.content}</span>
                        </div>
                    </div>
                ))}

                {isAiThinking && (
                    <div className="flex items-start">
                        <div className="px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-sm flex items-center gap-2">
                            <Loader2 className="animate-spin" size={14} /> Thinking...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="relative shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Gemini..."
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-gray-600"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isAiThinking}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
