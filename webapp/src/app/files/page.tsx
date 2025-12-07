'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    icon: string;
    size?: string;
    modified: string;
    children?: FileItem[];
}

const fileSystem: FileItem[] = [
    {
        id: '1',
        name: 'Projects',
        type: 'folder',
        icon: '📁',
        modified: 'Dec 4, 2024',
        children: [
            { id: '1-1', name: 'DLX-Studio', type: 'folder', icon: '📁', modified: 'Dec 4' },
            { id: '1-2', name: 'LuxRig-Bridge', type: 'folder', icon: '📁', modified: 'Dec 3' },
            { id: '1-3', name: 'Trading-Bots', type: 'folder', icon: '📁', modified: 'Dec 2' },
        ]
    },
    {
        id: '2',
        name: 'Documents',
        type: 'folder',
        icon: '📁',
        modified: 'Dec 3, 2024',
        children: [
            { id: '2-1', name: 'API-Docs.md', type: 'file', icon: '📄', size: '24 KB', modified: 'Dec 3' },
            { id: '2-2', name: 'Roadmap.md', type: 'file', icon: '📄', size: '8 KB', modified: 'Dec 1' },
        ]
    },
    {
        id: '3',
        name: 'Models',
        type: 'folder',
        icon: '🤖',
        modified: 'Dec 2, 2024',
        children: [
            { id: '3-1', name: 'gemma-3n-E4B-it-QAT.gguf', type: 'file', icon: '🧠', size: '4.2 GB', modified: 'Nov 28' },
            { id: '3-2', name: 'llama-3.1-8b-q4.gguf', type: 'file', icon: '🦙', size: '4.7 GB', modified: 'Nov 25' },
            { id: '3-3', name: 'qwen2.5-coder-14b.gguf', type: 'file', icon: '💻', size: '8.1 GB', modified: 'Nov 22' },
        ]
    },
    {
        id: '4',
        name: 'Backups',
        type: 'folder',
        icon: '💾',
        modified: 'Dec 4, 2024'
    },
    {
        id: '5',
        name: 'config.json',
        type: 'file',
        icon: '⚙️',
        size: '2 KB',
        modified: 'Dec 4, 2024'
    },
    {
        id: '6',
        name: 'README.md',
        type: 'file',
        icon: '📖',
        size: '5 KB',
        modified: 'Dec 1, 2024'
    },
];

const quickAccess = [
    { name: 'Recent', icon: '🕐' },
    { name: 'Starred', icon: '⭐' },
    { name: 'Shared', icon: '👥' },
    { name: 'Trash', icon: '🗑️' },
];

export default function FilesPage() {
    const [currentPath, setCurrentPath] = useState<string[]>(['Home']);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [view, setView] = useState<'grid' | 'list'>('list');

    const currentItems = fileSystem; // In real app, navigate based on path

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                <span className="text-gradient">Files</span>
                            </h1>
                            <p className="text-gray-400">Browse and manage your files</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white/10 rounded-lg text-sm">📁 New Folder</button>
                            <button className="btn-primary text-sm">⬆️ Upload</button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">Quick Access</h3>
                        <div className="space-y-1">
                            {quickAccess.map((item) => (
                                <button
                                    key={item.name}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-left"
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="font-bold mb-4">Storage</h3>
                            <div className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Used</span>
                                    <span>245 GB / 500 GB</span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full">
                                    <div className="h-full w-[49%] bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* File Browser */}
                <div className="lg:col-span-3">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-4">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm">
                            {currentPath.map((segment, i) => (
                                <span key={i} className="flex items-center gap-2">
                                    {i > 0 && <span className="text-gray-500">/</span>}
                                    <button className="hover:text-cyan-400">{segment}</button>
                                </span>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 py-1 rounded ${view === 'list' ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}
                            >
                                ☰
                            </button>
                            <button
                                onClick={() => setView('grid')}
                                className={`px-3 py-1 rounded ${view === 'grid' ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}
                            >
                                ▦
                            </button>
                        </div>
                    </div>

                    {/* File List/Grid */}
                    <motion.div
                        className={view === 'list' ? 'space-y-2' : 'grid grid-cols-2 md:grid-cols-4 gap-4'}
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.02 } } }}
                    >
                        {currentItems.map((item) => (
                            <motion.div
                                key={item.id}
                                className={`glass-card cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all ${selectedFile?.id === item.id ? 'ring-2 ring-cyan-500' : ''
                                    } ${view === 'list' ? 'flex items-center gap-4' : 'text-center'}`}
                                variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}
                                onClick={() => setSelectedFile(item)}
                                onDoubleClick={() => {
                                    if (item.type === 'folder') {
                                        setCurrentPath([...currentPath, item.name]);
                                    }
                                }}
                            >
                                <span className={view === 'list' ? 'text-2xl' : 'text-4xl block mb-2'}>{item.icon}</span>
                                <div className={view === 'list' ? 'flex-1' : ''}>
                                    <div className="font-medium truncate">{item.name}</div>
                                    {view === 'list' && (
                                        <div className="text-xs text-gray-500">
                                            {item.type === 'file' && item.size && `${item.size} • `}
                                            {item.modified}
                                        </div>
                                    )}
                                </div>
                                {view === 'list' && (
                                    <div className="text-xs text-gray-500">{item.modified}</div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* File Preview */}
                    {selectedFile && (
                        <motion.div
                            className="glass-card mt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{selectedFile.icon}</span>
                                    <div>
                                        <h3 className="font-bold">{selectedFile.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedFile.type === 'folder' ? 'Folder' : selectedFile.size} • Modified {selectedFile.modified}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 bg-white/10 rounded text-sm">📋 Copy</button>
                                    <button className="px-3 py-1 bg-white/10 rounded text-sm">✂️ Move</button>
                                    <button className="px-3 py-1 bg-white/10 rounded text-sm">⬇️ Download</button>
                                    <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm">🗑️ Delete</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
