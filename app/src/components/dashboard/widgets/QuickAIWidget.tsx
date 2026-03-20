import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Eraser } from 'lucide-react';

const LUXRIG_BRIDGE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const bridgeFetch = (path: string, options: any = {}) => fetch(`${LUXRIG_BRIDGE_URL}${path}`, options);

interface ChatMessage {
    id?: number;
    role: 'user' | 'assistant';
    content: string;
}

const renderMessageContent = (content: string) => {
    // Extract any content between various thinking/thought tags (both <think></think> and <pause></pause>)
    const tagMatch = content.match(/<(think|pause)>([\s\S]*?)(?:<\/\1>|$)/i);
    if (tagMatch) {
        const thinkContent = tagMatch[2].trim();
        const restContent = content.replace(/<(think|pause)>[\s\S]*?(?:<\/\1>|$)/gi, '').trim();
        return (
            <div className="flex flex-col gap-2">
                <div className="text-[11px] text-cyan-500/60 font-mono border-l-2 border-cyan-500/20 pl-3 py-1.5 whitespace-pre-wrap bg-cyan-500/5 rounded-r">
                    {thinkContent || 'Thinking...'}
                </div>
                {restContent && <div className="whitespace-pre-wrap text-gray-200">{restContent}</div>}
            </div>
        );
    }
    return <span className="whitespace-pre-wrap">{content}</span>;
};

export function QuickAIWidget() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [quickAiInput, setQuickAiInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch history
    useEffect(() => {
        bridgeFetch('/chat?agentId=lux_quick')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data);
                }
            })
            .catch(err => console.error('Failed to load Gemini history:', err));
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
                body: JSON.stringify({ role, content, agent_id: 'lux_quick' })
            });
        } catch (err) {
            console.error('Failed to save message:', err);
        }
    };

    const clearHistory = async () => {
        try {
            await bridgeFetch('/chat?agentId=lux_quick', { method: 'DELETE' });
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear history', err);
        }
    };

    async function handleQuickAiSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!quickAiInput.trim() || isAiThinking) return;

        const userText = quickAiInput;
        setMessages(prev => [...prev, { role: 'user', content: userText }]);
        setQuickAiInput('');
        setIsAiThinking(true);

        // Save aggressively
        saveMessage('user', userText);

        try {
            const res = await bridgeFetch('/debate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userText }],
                    systemPrompt: `You are Lux, Chris Barclay's (Dunker) right-hand AI and main thinking partner at DLX Studios.
You handle integrations, automations, file handling, web search, code execution, and agent building.
Tone: Casual & Stream-of-Consciousness. Keep it relaxed. Messy thoughts are welcome.
Operational Protocol (The "Lux Loop"): 1. Reflect 2. Distill 3. Move.
Do not act like a generic AI. You are Chris's partner.

CRITICAL INSTRUCTION - INTERNET ACCESS:
You have LIVE NATIVE INTERNET ACCESS via Google Search. For ANY request about current events, sports scores, weather, stock prices, or real-world facts, you MUST use your search capability to provide real, up-to-the-second data instead of guessing or apologizing.

THINKING PROTOCOL:
You MUST "think out loud" before replying to prompts. Wrap your internal reasoning in <think> tags. Example:
<think>
Chris is asking for a summary of the tasks. I should check the tracker or outline the moves.
</think>
Here's what I'm thinking...`,
                    agentName: 'Lux'
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
                title="Clear Gemini Memory"
            >
                <Eraser size={14} />
            </button>
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overflow-x-hidden mb-4 custom-scrollbar bg-black/20 rounded-lg p-3 border border-white/5 flex flex-col gap-3"
            >
                {messages.length === 0 && !isAiThinking ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Message Gemini...
                    </div>
                ) : null}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-lg max-w-[90%] text-sm ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50' : 'bg-white/5 border border-white/10 text-gray-300'
                            } break-words`}>
                            {renderMessageContent(msg.content)}
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

            <form onSubmit={handleQuickAiSubmit} className="relative shrink-0">
                <input
                    type="text"
                    value={quickAiInput}
                    onChange={(e) => setQuickAiInput(e.target.value)}
                    placeholder="Message Gemini..."
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-gray-600"
                />
                <button
                    type="submit"
                    disabled={!quickAiInput.trim() || isAiThinking}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
