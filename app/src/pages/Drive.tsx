import { useState, useEffect } from 'react';
import { HardDrive, Folder, FileText, ExternalLink, RefreshCw, ChevronRight, Home, MoreVertical, Grid, List as ListIcon, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DriveFile } from '../services/memoryService';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';

export function Drive() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [breadcrumbs, setBreadcrumbs] = useState<{ id?: string; name: string }[]>([{ name: 'LuxRig_Brain' }]);
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  const load = async (folderId?: string) => {
    setLoading(true); setError(null);
    try {
      const url = folderId ? `/api/drive/files?folderId=${folderId}` : '/api/drive/files';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFiles(data.files);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(currentFolder.id); }, []);

  const navigateTo = (folder: DriveFile) => {
    const next = { id: folder.id, name: folder.name };
    setBreadcrumbs(b => [...b, next]);
    load(folder.id);
  };

  const navigateToBreadcrumb = (idx: number) => {
    const crumb = breadcrumbs[idx];
    setBreadcrumbs(b => b.slice(0, idx + 1));
    load(crumb.id);
  };

  const isFolder = (f: DriveFile) => f.mimeType === 'application/vnd.google-apps.folder';
  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString() : 'Unknown';

  return (
    <PageLayout color="cyan" noPadding>
      <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
        <PageHeader
          title="Neural Drive"
          subtitle="CLOUD SYNAPSE • LUXRIG NATIVE"
          icon={<HardDrive size={24} className="text-cyan-400" />}
          actions={
            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <ListIcon size={16} />
                </button>
              </div>
              <button 
                onClick={() => load(currentFolder.id)} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all ${loading ? 'animate-pulse' : ''}`}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin text-cyan-500' : ''} />
              </button>
            </div>
          }
        />

        {/* Tactical Breadcrumbs Bar */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto no-scrollbar py-2">
           <nav className="flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl backdrop-blur-md">
              {breadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && <ChevronRight size={12} className="text-white/10 mx-1" />}
                  <button 
                    onClick={() => navigateToBreadcrumb(i)}
                    className={`text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg border ${
                      i === breadcrumbs.length - 1 
                        ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' 
                        : 'text-white/20 border-transparent hover:text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {i === 0 ? <Home size={12} /> : crumb.name}
                  </button>
                </div>
              ))}
            </nav>
            <StatPill label={`${files.length} VECTORS DETECTED`} color="cyan" />
        </div>

        {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-100/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
                <Shield size={16} className="text-red-500" /> {error}
            </motion.div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
               key="loading"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="flex flex-col items-center justify-center py-40 gap-6"
            >
                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                        animate={{ x: [-100, 200] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute h-full w-12 bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
                    />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 animate-pulse">Synchronizing Neural Vectors...</span>
            </motion.div>
          ) : files.length === 0 ? (
            <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card border-dashed border-white/5 py-40 flex flex-col items-center justify-center text-center bg-white/[0.01]"
            >
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-8 grayscale opacity-20">
                    <HardDrive size={32} />
                </div>
                <h3 className="text-xl font-black text-white/20 uppercase tracking-[0.4em] mb-3">Neural Void Detected</h3>
                <p className="text-[10px] text-white/10 font-black uppercase tracking-widest leading-loose">The requested sector of the filesystem is currently non-resident.</p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div 
                key="grid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
            >
                {[...files].sort((a, b) => (isFolder(b) ? 1 : 0) - (isFolder(a) ? 1 : 0)).map((file, idx) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => isFolder(file) ? navigateTo(file) : undefined}
                        className="group relative glass-card p-6 border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all hover:bg-cyan-500/[0.02] flex flex-col items-center text-center bg-black/40"
                    >
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all group-hover:scale-110 shadow-2xl ${isFolder(file) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-cyan-900/10' : 'bg-white/5 text-white/20 border border-white/5'}`}>
                           {isFolder(file) ? <Folder size={32} /> : <FileText size={32} />}
                        </div>
                        
                        <div className="w-full min-w-0">
                            <h3 className="text-xs font-black text-white uppercase tracking-tight truncate mb-2 group-hover:text-cyan-400 transition-colors uppercase">{file.name}</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{isFolder(file) ? 'Node_F' : (file.mimeType?.split('.').pop() || 'DATA').slice(0, 5).toUpperCase()}</span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{formatDate(file.modifiedTime)}</span>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                            {file.webViewLink && (
                                <a 
                                    href={file.webViewLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                    className="p-2.5 bg-black/60 border border-white/10 rounded-xl text-white/40 hover:text-cyan-400 transition-colors backdrop-blur-md"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
          ) : (
            <motion.div 
                key="list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card border-white/5 overflow-hidden bg-black/40"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Designation</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Vector_Class</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Sync_Timestamp</th>
                                <th className="px-8 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[...files].sort((a, b) => (isFolder(b) ? 1 : 0) - (isFolder(a) ? 1 : 0)).map((file) => (
                                <tr 
                                    key={file.id} 
                                    onClick={() => isFolder(file) ? navigateTo(file) : undefined}
                                    className={`group hover:bg-cyan-500/[0.02] transition-all cursor-pointer ${!isFolder(file) ? 'cursor-default' : ''}`}
                                >
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg transition-colors ${isFolder(file) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-white/10 group-hover:text-white/30'}`}>
                                                {isFolder(file) ? <Folder size={14} /> : <FileText size={14} />}
                                            </div>
                                            <span className="text-xs font-black text-white/60 group-hover:text-white uppercase tracking-tight">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/20 transition-colors">{isFolder(file) ? 'DIRECTORY' : file.mimeType?.split('/').pop()?.toUpperCase() || 'DATA'}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3 text-white/10 group-hover:text-white/30 transition-colors">
                                            <Clock size={12} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{formatDate(file.modifiedTime)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            {file.webViewLink && (
                                                <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-white/20 hover:text-cyan-400">
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <button className="p-2 text-white/10 hover:text-white"><MoreVertical size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
