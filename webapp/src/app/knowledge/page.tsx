'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, FileText, Upload, Database, Folder, X, Loader2 } from 'lucide-react';

const BRIDGE_URL = 'http://localhost:3456';

interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    category: string;
}

interface SearchResult {
    id: string;
    content: string;
    score: string;
    metadata: { name?: string; chunkIndex?: number };
}

interface Stats {
    totalChunks: number;
    totalDocuments: number;
    embeddingDimensions: number;
    initialized: boolean;
}

export default function KnowledgeBasePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadContent, setUploadContent] = useState('');
    const [uploadName, setUploadName] = useState('');

    // Fetch documents and stats on load
    useEffect(() => {
        fetchDocuments();
        fetchStats();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`${BRIDGE_URL}/knowledge/documents`);
            const data = await res.json();
            if (data.success) {
                setDocuments(data.documents);
            }
        } catch (e) {
            console.error('Failed to fetch documents:', e);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${BRIDGE_URL}/knowledge/stats`);
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (e) {
            console.error('Failed to fetch stats:', e);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${BRIDGE_URL}/knowledge/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.results);
            }
        } catch (e) {
            console.error('Search failed:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadContent.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${BRIDGE_URL}/knowledge/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: uploadContent,
                    name: uploadName || 'Untitled Document',
                    type: 'text',
                    category: 'General'
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowUpload(false);
                setUploadContent('');
                setUploadName('');
                fetchDocuments();
                fetchStats();
            }
        } catch (e) {
            console.error('Upload failed:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Knowledge <span className="text-gradient">Base</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            Centralized vector memory and document search (RAG).
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative flex items-center bg-[#0a0e1a] border border-white/10 rounded-xl p-2">
                                <Search className="w-5 h-5 text-gray-400 ml-3" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Ask anything or search documents..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 px-4 py-2"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Search Results */}
            <AnimatePresence>
                {searchResults.length > 0 && (
                    <motion.section
                        className="container-main pb-8"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">Search Results</h3>
                                <button onClick={() => setSearchResults([])} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {searchResults.map((result, i) => (
                                    <div key={result.id} className="p-4 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-cyan-400">{result.metadata.name || 'Unknown'}</span>
                                            <span className="text-xs text-gray-500">Score: {result.score}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{result.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Stats */}
            <section className="container-main pb-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats?.totalChunks || 0}</div>
                            <div className="text-xs text-gray-500">Vector Embeddings</div>
                        </div>
                    </div>
                    <div className="glass-card flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
                            <div className="text-xs text-gray-500">Documents Indexed</div>
                        </div>
                    </div>
                    <div className="glass-card flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                            <Folder className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats?.embeddingDimensions || 128}</div>
                            <div className="text-xs text-gray-500">Embedding Dims</div>
                        </div>
                    </div>
                    <div
                        className="glass-card flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setShowUpload(true)}
                    >
                        <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold">Upload</div>
                            <div className="text-xs text-gray-500">Add New Content</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUpload(false)}
                    >
                        <motion.div
                            className="glass-card w-full max-w-2xl mx-4"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Upload Document</h2>
                                <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={uploadName}
                                onChange={(e) => setUploadName(e.target.value)}
                                placeholder="Document name..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-4 text-white"
                            />
                            <textarea
                                value={uploadContent}
                                onChange={(e) => setUploadContent(e.target.value)}
                                placeholder="Paste document content here..."
                                className="w-full h-48 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                            />
                            <div className="flex justify-end mt-4 gap-3">
                                <button
                                    onClick={() => setShowUpload(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={loading || !uploadContent.trim()}
                                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg disabled:opacity-50"
                                >
                                    {loading ? 'Uploading...' : 'Upload & Index'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Documents Table */}
            <section className="container-main pb-16">
                <div className="glass-card min-h-[300px]">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        Indexed Documents
                    </h3>

                    {documents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No documents indexed yet.</p>
                            <p className="text-sm mt-1">Upload content to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-gray-400 text-sm">
                                        <th className="py-3 px-4 font-medium">Name</th>
                                        <th className="py-3 px-4 font-medium">Category</th>
                                        <th className="py-3 px-4 font-medium">Size</th>
                                        <th className="py-3 px-4 font-medium">Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-200">{doc.name}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 text-sm">
                                                <span className="px-2 py-1 rounded bg-white/5">{doc.category}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-sm">{doc.size}</td>
                                            <td className="py-3 px-4 text-gray-500 text-sm">{new Date(doc.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
