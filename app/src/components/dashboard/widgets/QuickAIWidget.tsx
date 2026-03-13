import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const LUXRIG_BRIDGE_URL = '/api';
const bridgeFetch = (path: string, options: any = {}) => fetch(`${LUXRIG_BRIDGE_URL}${path}`, options);

export function QuickAIWidget() {
    const [quickAiInput, setQuickAiInput] = useState('');
    const [quickAiResponse, setQuickAiResponse] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);

    async function handleQuickAiSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!quickAiInput.trim()) return;

        setIsAiThinking(true);
        setQuickAiResponse('');

        try {
            const res = await bridgeFetch('/llm/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: quickAiInput }],
                    provider: 'lmstudio'
                })
            });

            if (res.ok) {
                const data = await res.json();
                setQuickAiResponse(data.choices?.[0]?.message?.content || data.content || 'No response text received.');
            } else {
                setQuickAiResponse('Error: Failed to get response from AI.');
            }
        } catch (error) {
            setQuickAiResponse('Error: Could not connect to Bridge.');
        } finally {
            setIsAiThinking(false);
            setQuickAiInput('');
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto custom-scrollbar mb-4 bg-black/20 rounded-lg p-3 min-h-[100px] border border-white/5">
                {quickAiResponse ? (
                    <div className="prose prose-invert prose-sm">
                        <p className="whitespace-pre-wrap">{quickAiResponse}</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        {isAiThinking ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={16} /> Thinking...
                            </div>
                        ) : (
                            'Ask me anything...'
                        )}
                    </div>
                )}
            </div>
            <form onSubmit={handleQuickAiSubmit} className="relative">
                <input
                    type="text"
                    value={quickAiInput}
                    onChange={(e) => setQuickAiInput(e.target.value)}
                    placeholder="Send a message..."
                    className="w-full bg-[#12121a] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-gray-600"
                />
                <button
                    type="submit"
                    disabled={!quickAiInput.trim() || isAiThinking}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isAiThinking ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
            </form>
        </div>
    );
}
