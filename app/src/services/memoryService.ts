export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
}

export const memoryService = {
  async listFiles(folderId?: string): Promise<DriveFile[]> {
    const url = folderId ? `/api/drive/files?folderId=${folderId}` : '/api/drive/files';
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${baseUrl}${url}`, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as any;
      throw new Error(err.error || 'Failed to list files');
    }
    const data = await res.json();
    return data.files;
  },

  async createFolder(name: string, parentId?: string): Promise<{ id: string; name: string }> {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/drive/folders`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentId }),
    });
    if (!res.ok) throw new Error('Failed to create folder');
    return res.json();
  },

  async createFile(name: string, content: string, parentId?: string, mimeType?: string): Promise<DriveFile> {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/drive/files`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content, parentId, mimeType }),
    });
    if (!res.ok) throw new Error('Failed to create file');
    return res.json();
  },

  async ensureStructure(): Promise<Record<string, string>> {
    const CACHE_KEY = 'nexus-drive-structure';
    const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { structure, ts } = JSON.parse(cached) as { structure: Record<string, string>; ts: number };
        if (Date.now() - ts < CACHE_TTL_MS) return structure;
      }
    } catch { /* ignore parse errors */ }

    const rootFiles = await this.listFiles();
    const structure: Record<string, string> = {};

    const requiredFolders = ['_Dropbox', 'Artists', 'Video', 'Admin', 'Agents'];
    for (const folderName of requiredFolders) {
      const existing = rootFiles.find(f => f.name === folderName && f.mimeType === 'application/vnd.google-apps.folder');
      if (existing) {
        structure[folderName] = existing.id;
      } else {
        const created = await this.createFolder(folderName);
        structure[folderName] = created.id;
      }
    }

    // Agents/Lux/Memory
    const agentFiles = await this.listFiles(structure['Agents']);
    const luxFolder = agentFiles.find(f => f.name === 'Lux' && f.mimeType === 'application/vnd.google-apps.folder');
    const luxId = luxFolder?.id ?? (await this.createFolder('Lux', structure['Agents'])).id;
    structure['Lux'] = luxId;

    const luxFiles = await this.listFiles(luxId);
    const memoryFolder = luxFiles.find(f => f.name === 'Memory' && f.mimeType === 'application/vnd.google-apps.folder');
    structure['Memory'] = memoryFolder?.id ?? (await this.createFolder('Memory', luxId)).id;

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ structure, ts: Date.now() }));
    } catch { /* quota exceeded — skip caching */ }

    return structure;
  },

  async saveMemory(title: string, content: string, memoryFolderId: string) {
    const fileName = `Memory_${new Date().toISOString().split('T')[0]}_${title.replace(/\s+/g, '_')}.md`;
    return this.createFile(fileName, content, memoryFolderId, 'text/markdown');
  },
};
