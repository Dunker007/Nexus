import React, { createContext, useContext, useState, useEffect } from 'react';
import { memoryService } from '../services/memoryService';

interface MemoryContextType {
  structure: Record<string, string>;
  loading: boolean;
  error: string | null;
  refreshStructure: () => Promise<void>;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [structure, setStructure] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStructure = async () => {
    setLoading(true);
    try {
      const folderStructure = await memoryService.ensureStructure();
      setStructure(folderStructure);
      setError(null);
    } catch (err: any) {
      console.error('Memory Initialization Error:', err);
      setError(err.message || 'Failed to initialize Drive structure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshStructure(); }, []);

  return (
    <MemoryContext.Provider value={{ structure, loading, error, refreshStructure }}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const context = useContext(MemoryContext);
  if (context === undefined) throw new Error('useMemory must be used within a MemoryProvider');
  return context;
}
