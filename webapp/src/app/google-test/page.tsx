'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function GoogleTestPage() {
    const { data: session, status } = useSession();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [driveFiles, setDriveFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch data when session is available
    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    async function fetchData() {
        setLoading(true);
        try {
            await Promise.all([
                fetchUserInfo(),
                fetchCalendarEvents(),
                fetchDriveFiles()
            ]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchUserInfo() {
        const response = await fetch(`/api/google/user`);
        if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
        }
    }

    async function fetchCalendarEvents() {
        const response = await fetch(`/api/google/calendar/events?maxResults=10`);
        if (response.ok) {
            const data = await response.json();
            setCalendarEvents(data);
        }
    }

    async function fetchDriveFiles() {
        const response = await fetch(`/api/google/drive/files?maxResults=10`);
        if (response.ok) {
            const data = await response.json();
            setDriveFiles(data);
        }
    }

    return (
        <div className="min-h-screen pt-8 relative z-10">
            <section className="section-padding pb-8">
                <div className="container-main text-center">
                    <motion.h1 
                        className="text-5xl font-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Google <span className="text-gradient">Integration</span>
                    </motion.h1>
                    <p className="text-xl text-gray-400">Secure access to your DLX Studio assets</p>
                </div>
            </section>

            <section className="container-main pb-16">
                <motion.div className="glass-card mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Connection Status</h2>
                            <p className="text-gray-400">
                                {session ? `✅ Connected as ${session.user?.email}` : '❌ Not connected'}
                            </p>
                        </div>
                        {!session ? (
                            <button onClick={() => signIn('google')} className="btn-primary">
                                Connect Google Account
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={fetchData} disabled={loading} className="btn-secondary">
                                    {loading ? 'Refreshing...' : 'Refresh Data'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {error && (
                    <div className="glass-card mb-6 bg-red-500/10 border-red-500/20">
                        <p className="text-red-400">Error: {error}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div className="glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-xl font-bold mb-4">📅 Calendar Events</h2>
                        <div className="space-y-3">
                            {calendarEvents.length > 0 ? (
                                calendarEvents.map((event, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className="font-medium text-gray-100">{event.summary || 'No title'}</p>
                                        <p className="text-sm text-gray-400">
                                            {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : 'All day'}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">{session ? 'No events found' : 'Connect to view calendar'}</p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div className="glass-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-xl font-bold mb-4">📁 Drive Files</h2>
                        <div className="space-y-3">
                            {driveFiles.length > 0 ? (
                                driveFiles.map((file, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className="font-medium text-gray-100">{file.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {file.mimeType?.split('/')[1] || 'file'} • {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'N/A'}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">{session ? 'No files found' : 'Connect to view Drive'}</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
