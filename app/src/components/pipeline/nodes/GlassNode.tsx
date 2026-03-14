import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CheckCircle2, Circle, PlayCircle, AlertCircle, Clock } from 'lucide-react';

function GlassNode({ data, isConnectable }: any) {
  const { label, status, onStatusChange } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'active': return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]';
      case 'blocked': return 'border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      default: return 'border-white/10 bg-black/40 text-white hover:border-purple-500/30';
    }
  };

  const Icon = status === 'completed' ? CheckCircle2 :
               status === 'active' ? PlayCircle :
               status === 'blocked' ? AlertCircle : Circle;

  return (
    <div className={`px-4 py-3 rounded-xl border backdrop-blur-xl min-w-[160px] transition-all group ${getStatusColor()}`}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!w-2 !h-2 !bg-purple-500 !border-0" />
      
      <div className="flex items-center justify-between gap-3">
        <Icon size={16} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest truncate">{label}</div>
          <div className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-50 mt-0.5">{status}</div>
        </div>
      </div>

      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex gap-1 bg-black/80 border border-white/10 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50">
        {(['pending', 'active', 'completed', 'blocked'] as const).map(s => (
          <button 
            key={s}
            onClick={() => onStatusChange(s)}
            className={`p-1.5 rounded transition-all ${
              s === 'completed' ? 'hover:bg-emerald-500/20 hover:text-emerald-400' :
              s === 'active' ? 'hover:bg-cyan-500/20 hover:text-cyan-400' :
              s === 'blocked' ? 'hover:bg-red-500/20 hover:text-red-400' :
              'hover:bg-white/10 hover:text-white'
            } ${status === s ? 'text-white' : 'text-white/30'}`}
          >
            {s === 'completed' ? <CheckCircle2 size={12} /> :
             s === 'active' ? <PlayCircle size={12} /> :
             s === 'blocked' ? <AlertCircle size={12} /> : <Clock size={12} />}
          </button>
        ))}
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!w-2 !h-2 !bg-purple-500 !border-0" />
    </div>
  );
}

export default memo(GlassNode);
