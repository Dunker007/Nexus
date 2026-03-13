import { LayoutGrid, Plus, FolderKanban } from 'lucide-react';

const MOCK_LABS = [
  { id: 1, name: 'SmartFolio v3', status: 'Active', category: 'Capital', progress: 80, owner: 'Architect' },
  { id: 2, name: 'Nexus Core', status: 'Active', category: 'Operations', progress: 95, owner: 'Lux' },
  { id: 3, name: 'News Radar', status: 'Preview', category: 'Intelligence', progress: 50, owner: 'Bytebot' },
];

export function Labs() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <FolderKanban className="text-cyan-400" />
            Labs Hub
          </h1>
          <p className="text-white/40 text-sm mt-1">Experimental features, roadmaps & agent assignments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          New Idea
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_LABS.map(lab => (
          <div key={lab.id} className="rounded-xl border border-white/5 bg-white-[0.02] hover:bg-white/5 transition-colors p-6 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-cyan-400" />
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                lab.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {lab.status}
              </span>
            </div>

            <h3 className="font-bold text-lg text-white mb-1 relative z-10 group-hover:text-cyan-400 transition-colors">
              {lab.name}
            </h3>
            <p className="text-sm text-white/40 mb-6 relative z-10">{lab.category}</p>

            <div className="relative z-10">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/40">Progress</span>
                <span className="text-cyan-400 font-mono">{lab.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${lab.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold text-purple-400">
                  {lab.owner[0]}
                </div>
                <span className="text-xs text-white/40">{lab.owner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
