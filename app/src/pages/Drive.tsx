import { useState, useEffect } from 'react';
import { HardDrive, Folder, FileText, ExternalLink, RefreshCw, ChevronRight, Home, Grid, List as ListIcon, Clock, ShieldAlert } from 'lucide-react';
import { m, AnimatePresence } from 'motion/react';
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
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}${url}`, { credentials: 'include' });
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
      <div className="max-w-[2000px] mx-auto px-6 py-10 pb-32">
        <PageHeader
          title="Drive Explorer"
          subtitle="Manage your local and cloud-synced files."
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
                title="Refresh"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin text-cyan-500' : ''} />
              </button>
            </div>
          }
        />

        {/* Breadcrumbs Bar */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto no-scrollbar py-2">
           <nav className="flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1.5 rounded-xl backdrop-blur-md">
              {breadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && <ChevronRight size={14} className="text-white/20 mx-1" />}
                  <button 
                    onClick={() => navigateToBreadcrumb(i)}
                    className={`text-xs font-bold tracking-wide transition-all px-4 py-2 rounded-lg border ${
                      i === breadcrumbs.length - 1 
                        ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-lg shadow-cyan-500/10' 
                        : 'text-white/40 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {i === 0 ? <span className="flex items-center gap-2"><Home size={14} /> {crumb.name}</span> : crumb.name}
                  </button>
                </div>
              ))}
            </nav>
            <StatPill label={`${files.length} items`} color="cyan" />
        </div>

        {error && (
            <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium flex items-center gap-4">
                <ShieldAlert size={18} className="text-red-500" /> {error}
            </m.div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <m.div 
               key="loading"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="flex flex-col items-center justify-center py-40 gap-6 glass-card border flex-1"
            >
                <RefreshCw size={32} className="text-cyan-500 animate-spin opacity-50" />
                <span className="text-sm font-bold text-white/40 tracking-wider">Loading files...</span>
            </m.div>
          ) : files.length === 0 ? (
            <m.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card border-dashed border-white/10 py-40 flex flex-col items-center justify-center text-center bg-white/[0.01]"
            >
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-white/20">
                    <Folder size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Folder is Empty</h3>
                <p className="text-sm text-white/40">Drop files here or check back later.</p>
            </m.div>
          ) : viewMode === 'grid' ? (
            <m.div 
                key="grid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
            >
                {[...files].sort((a, b) => (isFolder(b) ? 1 : 0) - (isFolder(a) ? 1 : 0)).map((file, idx) => (
                    <m.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => isFolder(file) ? navigateTo(file) : undefined}
                        className="group relative glass-card p-6 border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all hover:bg-cyan-500/[0.02] flex flex-col items-center text-center bg-black/40 shadow-xl"
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${isFolder(file) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                           {isFolder(file) ? <Folder size={28} /> : <FileText size={28} />}
                        </div>
                        
                        <div className="w-full min-w-0">
                            <h3 className="text-sm font-bold text-white truncate mb-1.5 group-hover:text-cyan-400 transition-colors">{file.name}</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{isFolder(file) ? 'Folder' : (file.mimeType?.split('.').pop() || 'File').slice(0, 8)}</span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[10px] font-medium text-white/30">{formatDate(file.modifiedTime)}</span>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                            {file.webViewLink && (
                                <a 
                                    href={file.webViewLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                    className="p-2 bg-black/80 border border-white/10 rounded-lg text-white/50 hover:text-cyan-400 hover:bg-black transition-colors backdrop-blur-md"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </m.div>
                ))}
            </m.div>
          ) : (
            <m.div 
                key="list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card border-white/5 overflow-hidden bg-black/40"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-wider text-white/40">Name</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-wider text-white/40">Type</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-wider text-white/40">Modified</th>
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
                                            <div className={`p-2 rounded-lg transition-colors ${isFolder(file) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-white/40'}`}>
                                                {isFolder(file) ? <Folder size={16} /> : <FileText size={16} />}
                                            </div>
                                            <span className="text-sm font-bold text-white/80 group-hover:text-white">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-[11px] font-medium text-white/40">{isFolder(file) ? 'Folder' : file.mimeType?.split('/').pop()?.toUpperCase() || 'File'}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3 text-white/40">
                                            <Clock size={12} />
                                            <span className="text-xs">{formatDate(file.modifiedTime)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            {file.webViewLink && (
                                                <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-white/40 hover:text-cyan-400 bg-white/5 rounded-lg">
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
