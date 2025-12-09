'use client';


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import {
    FolderPlus, Folder, FolderOpen, X, ExternalLink,
    BookOpen, Trash2, ChevronRight, Search, FileText,
    Sparkles, Copy, Check, HardDrive, BrainCircuit,
    Cpu, Activity, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResearchFolder {
    id: string;
    name: string;
    color: string;
    articles: SavedArticle[];
    createdAt: string;
    analysis?: {
        summary: string;
        keyPoints: string[];
        timestamp: string;
    };
}


interface SavedArticle {
    id: string;
    title: string;
    url: string;
    source: string;
    savedAt: string;
}

interface ResearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
    articleToAdd?: { id: string; title: string; url: string; source: string } | null;
    onArticleAdded?: () => void;
}

const FOLDER_COLORS = [
    { name: 'Red', value: 'red' },
    { name: 'Orange', value: 'orange' },
    { name: 'Green', value: 'green' },
    { name: 'Blue', value: 'blue' },
    { name: 'Purple', value: 'purple' },
];

export default function ResearchPanel({ isOpen, onClose, articleToAdd, onArticleAdded }: ResearchPanelProps) {
    const [folders, setFolders] = useState<ResearchFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState('blue');
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Load folders from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('research-folders');
            if (saved) {
                setFolders(JSON.parse(saved));
            }
        }
    }, []);

    // Save folders to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && folders.length > 0) {
            localStorage.setItem('research-folders', JSON.stringify(folders));
        }
    }, [folders]);

    const createFolder = () => {
        if (!newFolderName.trim()) return;

        const folder: ResearchFolder = {
            id: `folder-${Date.now()}`,
            name: newFolderName.trim(),
            color: newFolderColor,
            articles: [],
            createdAt: new Date().toISOString()
        };

        setFolders([...folders, folder]);
        setNewFolderName('');
        setShowNewFolder(false);
        setSelectedFolder(folder.id);
    };

    const deleteFolder = (id: string) => {
        setFolders(folders.filter(f => f.id !== id));
        if (selectedFolder === id) {
            setSelectedFolder(null);
        }
    };

    const addArticleToFolder = (folderId: string, article: { id: string; title: string; url: string; source: string }) => {
        setFolders(folders.map(folder => {
            if (folder.id !== folderId) return folder;
            if (folder.articles.some(a => a.id === article.id)) return folder;
            return {
                ...folder,
                articles: [...folder.articles, { ...article, savedAt: new Date().toISOString() }]
            };
        }));
        onArticleAdded?.();
    };

    const removeArticleFromFolder = (folderId: string, articleId: string) => {
        setFolders(folders.map(folder => {
            if (folder.id !== folderId) return folder;
            return { ...folder, articles: folder.articles.filter(a => a.id !== articleId) };
        }));
    };

    // Save to Google Drive (creates content for a Doc that NotebookLM can import)
    const saveToGoogleDrive = async (folder: ResearchFolder) => {
        const content = `# ${folder.name}\n\nResearch folder from DLX Studio News\n\n## Articles\n\n${folder.articles.map(a => `### ${a.title}\n- Source: ${a.source}\n- URL: ${a.url}\n`).join('\n')
            }`;

        await navigator.clipboard.writeText(content);
        setCopied(`drive-${folder.id}`);
        window.open('https://drive.google.com/drive/my-drive', '_blank');
        setTimeout(() => setCopied(null), 3000);
    };

    const openInNotebookLM = (folder: ResearchFolder) => {
        const urls = folder.articles.map(a => a.url).join('\n');
        navigator.clipboard.writeText(urls);
        setCopied(folder.id);
        window.open('https://notebooklm.google.com/', '_blank');
        setTimeout(() => setCopied(null), 2000);
    };


    const analyzeFolder = async (folder: ResearchFolder) => {
        setIsAnalyzing(true);
        setShowAnalysis(true);

        try {
            // Prepare context for the agent
            const context = folder.articles.map(a => `Title: ${a.title}\nSource: ${a.source}\nURL: ${a.url}`).join('\n\n');
            const prompt = `Analyze these articles and provide a research briefing.
Folder: ${folder.name}

Articles:
${context}

Format as Markdown with:
- 🎯 Executive Summary
- 🔑 Key Insights (bullet points)
- ⚖️ Conflicting Viewpoints (if any)
- 🔗 Connected Themes`;

            const response = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'mic', // Use Mic as the Studio Manager/Analyst
                    task: {
                        action: 'strategic-advice', // Reuse strategy capability
                        input: prompt
                    }
                })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            const analysisText = data.result?.strategy || "Analysis failed to generate content.";

            setFolders(folders.map(f => {
                if (f.id !== folder.id) return f;
                return {
                    ...f,
                    analysis: {
                        summary: analysisText,
                        keyPoints: [],
                        timestamp: new Date().toISOString()
                    }
                };
            }));

        } catch (error) {
            console.error("Analysis error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyArticleUrls = (folder: ResearchFolder) => {
        const urls = folder.articles.map(a => a.url).join('\n');
        navigator.clipboard.writeText(urls);
        setCopied(`urls-${folder.id}`);
        setTimeout(() => setCopied(null), 2000);
    };

    const selectedFolderData = folders.find(f => f.id === selectedFolder);
    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-[#0a0a0f] border-l border-white/10 shadow-2xl overflow-hidden flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-l from-amber-500/5 via-transparent to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-900/20">
                                    <BrainCircuit size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold flex items-center gap-2">
                                        Nexus Intelligence
                                        <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">LAB</span>
                                    </h2>
                                    <p className="text-xs text-gray-500">AI-Powered Research Station</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-white/5">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search folders..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-amber-500/50"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {!selectedFolder ? (
                                <div className="p-4">
                                    {/* New Folder */}
                                    {!showNewFolder ? (
                                        <button
                                            onClick={() => setShowNewFolder(true)}
                                            className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-amber-400 mb-4"
                                        >
                                            <FolderPlus size={20} />
                                            <span>Create Research Folder</span>
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
                                            <input
                                                type="text"
                                                placeholder="Folder name..."
                                                value={newFolderName}
                                                onChange={e => setNewFolderName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && createFolder()}
                                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 mb-3"
                                                autoFocus
                                            />
                                            <div className="flex gap-2 mb-3">
                                                {FOLDER_COLORS.map(color => (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => setNewFolderColor(color.value)}
                                                        className={`w-6 h-6 rounded-full bg-${color.value}-500 ${newFolderColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={createFolder} disabled={!newFolderName.trim()} className="flex-1 py-2 bg-amber-500 text-black font-medium rounded-lg text-sm disabled:opacity-50">Create</button>
                                                <button onClick={() => setShowNewFolder(false)} className="px-4 py-2 bg-white/10 rounded-lg text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Folder List */}
                                    <div className="space-y-2">
                                        {filteredFolders.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Folder size={40} className="mx-auto mb-3 opacity-50" />
                                                <p>No research folders yet</p>
                                                <p className="text-xs mt-1">Create one to start collecting articles</p>
                                            </div>
                                        ) : (
                                            filteredFolders.map(folder => (
                                                <div
                                                    key={folder.id}
                                                    className="group p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                                                    onClick={() => setSelectedFolder(folder.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg bg-${folder.color}-500/20 flex items-center justify-center`}>
                                                                <Folder className={`text-${folder.color}-400`} size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{folder.name}</div>
                                                                <div className="text-xs text-gray-500">{folder.articles.length} articles</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                                                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg"
                                                            >
                                                                <Trash2 size={14} className="text-red-400" />
                                                            </button>
                                                            <ChevronRight size={16} className="text-gray-600" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* NotebookLM + Drive Info */}
                                    <div className="mt-6 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="text-amber-400 mt-1" size={20} />
                                            <div>
                                                <h4 className="font-medium text-amber-400">NotebookLM + Drive</h4>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Save articles → Export to Google Drive → Import into NotebookLM for AI-powered research.
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <a href="https://notebooklm.google.com/" target="_blank" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                                                        NotebookLM <ExternalLink size={10} />
                                                    </a>
                                                    <a href="https://drive.google.com/" target="_blank" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                                        Google Drive <ExternalLink size={10} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Folder Detail View */
                                <div className="h-full flex flex-col">
                                    <div className="p-4 border-b border-white/10">
                                        <button onClick={() => { setSelectedFolder(null); setShowAnalysis(false); }} className="text-xs text-gray-500 hover:text-white mb-2 flex items-center gap-1">
                                            <ChevronRight className="rotate-180" size={12} /> Back to Folders
                                        </button>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className={`w-12 h-12 rounded-xl bg-${selectedFolderData?.color}-500/20 flex items-center justify-center border border-${selectedFolderData?.color}-500/30`}>
                                                <FolderOpen className={`text-${selectedFolderData?.color}-400`} size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">{selectedFolderData?.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    <span className="bg-white/10 px-1.5 py-0.5 rounded">{selectedFolderData?.articles.length} sources</span>
                                                    {selectedFolderData?.analysis && <span className="text-green-400 flex items-center gap-1"><Check size={10} /> Analyzed</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    {/* AI Actions */}
                                    <div className="px-4 py-3 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b border-purple-500/20">
                                        <button
                                            onClick={() => selectedFolderData && analyzeFolder(selectedFolderData)}
                                            disabled={isAnalyzing || !selectedFolderData?.articles.length}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Analyzing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <BrainCircuit size={18} className="text-purple-200 group-hover:scale-110 transition-transform" />
                                                    <span>{selectedFolderData?.analysis ? 'Update Analysis' : 'Synthesize Research'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Analysis View */}
                                    {selectedFolderData?.analysis && showAnalysis && (
                                        <div className="p-4 bg-purple-500/5 border-b border-purple-500/20 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                                    <Activity size={12} />
                                                    Intelligence Briefing
                                                </h4>
                                                <span className="text-[10px] text-gray-500">
                                                    {new Date(selectedFolderData.analysis.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="prose prose-invert prose-xs max-w-none">
                                                <ReactMarkdown>{selectedFolderData.analysis.summary}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sub Actions */}
                                    <div className="p-4 border-b border-white/5 grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => selectedFolderData && openInNotebookLM(selectedFolderData)}
                                            disabled={!selectedFolderData?.articles.length}
                                            className="py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <Sparkles size={14} />
                                            NotebookLM Export
                                        </button>
                                        <button
                                            onClick={() => selectedFolderData && saveToGoogleDrive(selectedFolderData)}
                                            disabled={!selectedFolderData?.articles.length}
                                            className="py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <HardDrive size={14} />
                                            Save to Drive
                                        </button>

                                        {/* Article List */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                            {selectedFolderData?.articles.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <FileText size={40} className="mx-auto mb-3 opacity-50" />
                                                    <p>No articles yet</p>
                                                    <p className="text-xs mt-1">Click "Add to Research" on any news article</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {selectedFolderData?.articles.map(article => (
                                                        <div key={article.id} className="group p-3 bg-white/5 rounded-lg border border-white/10">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <a href={article.url} target="_blank" className="font-medium text-sm hover:text-amber-400 line-clamp-2">{article.title}</a>
                                                                    <div className="text-xs text-gray-500 mt-1">{article.source}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeArticleFromFolder(selectedFolder!, article.id)}
                                                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded"
                                                                >
                                                                    <X size={14} className="text-red-400" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add Article Bar */}
                        {articleToAdd && (
                            <div className="p-4 border-t border-white/10 bg-amber-500/10">
                                <div className="text-xs text-amber-400 mb-2">Add to folder:</div>
                                <div className="text-sm font-medium line-clamp-1 mb-3">{articleToAdd.title}</div>
                                <div className="flex flex-wrap gap-2">
                                    {folders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => addArticleToFolder(folder.id, articleToAdd)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${folder.articles.some(a => a.id === articleToAdd.id)
                                                ? 'bg-green-500/20 text-green-400'
                                                : `bg-${folder.color}-500/20 text-${folder.color}-400`
                                                }`}
                                        >
                                            {folder.articles.some(a => a.id === articleToAdd.id) ? '✓ ' : ''}{folder.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
