import { useState, useEffect } from 'react';
import { HardDrive, Folder, FileText, ExternalLink, RefreshCw, ChevronRight, Home, MoreVertical, Grid, List as ListIcon, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DriveFile } from '../services/memoryService';

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
    <div className="relative min-h-full bg-[#07070a] text-gray-100 overflow-hidden bg-mesh-cyan">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
        {/* Header & Breadcrumbs Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/5">
                    <HardDrive className="text-cyan-400 w-6 h-6" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black uppercase tracking-tight leading-none">Neural <span className="text-gradient-cyan">Drive</span></h1>
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-2">Cloud Synapse • LuxRig Native</span>
                </div>
            </motion.div>

            {/* Breadcrumbs Sleek Bar */}
            <nav className="flex items-center gap-2 bg-black/40 border border-white/5 p-1.5 px-4 rounded-xl backdrop-blur-md shadow-xl">
              {breadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && <ChevronRight className="w-4 h-4 text-white/10 mx-1" />}
                  <button 
                    onClick={() => navigateToBreadcrumb(i)}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all px-2 py-1.5 rounded-lg ${
                        i === breadcrumbs.length - 1 ? 'text-cyan-400 bg-cyan-500/5 border border-cyan-500/20' : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    {i === 0 ? <Home className="w-3.5 h-3.5" /> : crumb.name}
                  </button>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl mr-2">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20'}`}
                >
                    <Grid size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/20'}`}
                >
                    <ListIcon size={16} />
                </button>
            </div>
            <button 
                onClick={() => load(currentFolder.id)} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all ${loading ? 'animate-pulse' : ''}`}
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <Shield className="w-4 h-4" /> {error}
            </motion.div>
        )}

        <AnimatePresence mode="wait">
        {loading ? (
            <motion.div 
               key="loading"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="flex flex-col items-center justify-center h-96 gap-4"
            >
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                        animate={{ x: [-100, 200] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute h-full w-12 bg-cyan-400" 
                    />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Syncing Neurons...</span>
            </motion.div>
        ) : files.length === 0 ? (
            <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card border-dashed border-white/10 py-32 flex flex-col items-center justify-center text-center group"
            >
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-white/10 group-hover:text-cyan-500/30 transition-all group-hover:bg-cyan-500/5 group-hover:border-cyan-500/10">
                    <HardDrive className="w-8 h-8" />
                </div>
                <h3 className="text-white font-black uppercase tracking-[0.2em] mb-2">Neural Void Detected</h3>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-loose">This sector of the filesystem is currently non-resident.</p>
            </motion.div>
        ) : viewMode === 'grid' ? (
            <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
                {[...files].sort((a, b) => (isFolder(b) ? 1 : 0) - (isFolder(a) ? 1 : 0)).map((file, idx) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => isFolder(file) ? navigateTo(file) : undefined}
                        className={`group relative glass-card p-5 border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all hover:shadow-cyan-500/10 flex flex-col items-center text-center`}
                    >
                        <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-2xl ${isFolder(file) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-white/30 border border-white/5 group-hover:bg-cyan-500/5 group-hover:text-cyan-400/60'}`}>
                           {isFolder(file) ? <Folder className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                        </div>
                        
                        <div className="w-full min-w-0">
                            <h3 className="text-sm font-bold text-white/80 truncate mb-1.5 tracking-tight group-hover:text-white">{file.name}</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{isFolder(file) ? 'Fldr' : file.mimeType?.split('.').pop()?.toUpperCase() || 'File'}</span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{formatDate(file.modifiedTime)}</span>
                            </div>
                        </div>

                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {file.webViewLink && (
                                <a 
                                    href={file.webViewLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                    className="p-2 bg-black/40 border border-white/10 rounded-lg hover:text-cyan-400 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        ) : (
            <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card border-white/5 overflow-hidden shadow-2xl"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Designation</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Class</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Synchronized</th>
                                <th className="px-8 py-5 text-right text-white/20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[...files].sort((a, b) => (isFolder(b) ? 1 : 0) - (isFolder(a) ? 1 : 0)).map((file) => (
                                <tr 
                                    key={file.id} 
                                    onClick={() => isFolder(file) ? navigateTo(file) : undefined}
                                    className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${!isFolder(file) ? 'cursor-default' : ''}`}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${isFolder(file) ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/20'}`}>
                                                {isFolder(file) ? <Folder size={14} /> : <FileText size={14} />}
                                            </div>
                                            <span className="text-sm font-bold text-white/80 group-hover:text-white">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{isFolder(file) ? 'Folder' : file.mimeType?.split('/').pop()}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-white/20">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(file.modifiedTime)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {file.webViewLink && (
                                                <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-white/30 hover:text-cyan-400">
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
    </div>
  );
}
