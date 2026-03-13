import { useState, useEffect } from 'react';
import { HardDrive, Folder, FileText, ExternalLink, RefreshCw, ChevronRight, Home } from 'lucide-react';
import type { DriveFile } from '../services/memoryService';

export function Drive() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString() : '';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Drive</h1>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-white/20" />}
                {i === 0 && <Home className="w-3 h-3 text-white/40 mr-0.5" />}
                <button onClick={() => navigateToBreadcrumb(i)}
                  className={`hover:text-white transition-colors ${i === breadcrumbs.length - 1 ? 'text-white/70' : 'text-white/30'}`}>
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>
        </div>
        <button onClick={() => load(currentFolder.id)} className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-4 text-sm text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-400" />
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center h-48 text-center">
          <HardDrive className="w-8 h-8 text-white/10 mb-2" />
          <p className="text-white/30 text-sm">Folder is empty</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto] gap-0">
            {/* Folders first */}
            {[...files].sort((a, b) => (isFolder(b) ? 1 : 0) - (isFolder(a) ? 1 : 0)).map((file) => (
              <div key={file.id} onClick={() => isFolder(file) ? navigateTo(file) : undefined}
                className={`col-span-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors
                  ${isFolder(file) ? 'hover:bg-white/5 cursor-pointer' : 'hover:bg-white/3'}`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center ${isFolder(file) ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/30'}`}>
                  {isFolder(file) ? <Folder className="w-4 h-4" /> : <FileText className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-sm text-white/70">{file.name}</div>
                  <div className="text-[10px] font-mono text-white/20">{isFolder(file) ? 'Folder' : file.mimeType?.split('/').pop()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/20">{formatDate(file.modifiedTime)}</span>
                  {file.webViewLink && (
                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="text-white/20 hover:text-cyan-400 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
