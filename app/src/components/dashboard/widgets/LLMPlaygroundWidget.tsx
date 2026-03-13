import { useState } from 'react';
import { Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export function LLMPlaygroundWidget() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const res = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          stream: false
        }),
      });

      if (!res.ok) {
        throw new Error('LLM request failed');
      }

      const data = await res.json();
      setResponse(data.response || data.message || 'No response');
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Response Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl bg-[#12121a] border border-white/5 p-3">
        {loading ? (
          <div className="flex items-center gap-2 text-cyan-400">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs font-mono animate-pulse">Thinking...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={14} />
            <span className="text-xs font-mono">{error}</span>
          </div>
        ) : response ? (
          <div className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{response}</div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-white/20">
              <Sparkles size={24} />
              <p className="text-[10px] font-mono uppercase tracking-wider">Ask anything</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI anything..."
          disabled={loading}
          className="flex-1 px-3 py-2 bg-[#12121a] border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || loading}
          className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </form>
    </div>
  );
}
