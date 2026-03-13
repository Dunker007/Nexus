import { Users } from 'lucide-react';
import { useState } from 'react';

export function Meeting() {
  const [topic, setTopic] = useState('');
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
          <Users className="w-10 h-10 text-indigo-400 relative z-10" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          AI Staff <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Meeting</span>
        </h1>
        <p className="text-white/50 italic">"None of us is as smart as all of us."</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-xl mb-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <input 
          type="text" 
          placeholder="What should we discuss? (e.g., Design a secure authentication system)"
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 mb-6 relative z-10"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="flex flex-wrap gap-3 mb-8 relative z-10">
          {[
            { id: 'architect', name: 'The Architect', emoji: '🏗️', color: 'border-indigo-500/50 bg-indigo-500/10' },
            { id: 'security', name: 'Security', emoji: '🔒', color: 'border-red-500/50 bg-red-500/10' },
            { id: 'qa', name: 'QA Lead', emoji: '🔍', color: 'border-emerald-500/50 bg-emerald-500/10' },
            { id: 'devops', name: 'DevOps', emoji: '⚙️', color: 'border-transparent bg-white/5 hover:bg-white/10 opacity-50' },
          ].map(agent => (
            <button key={agent.id} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${agent.color} transition-all`}>
              <span>{agent.emoji}</span>
              <span className="text-sm font-medium text-white/90">{agent.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-6 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40">Debate Rounds:</span>
            <input type="number" defaultValue={2} className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-center text-white focus:outline-none focus:border-indigo-500/50" />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
            🚀 Start Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
