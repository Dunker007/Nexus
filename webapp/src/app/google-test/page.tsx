'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

export default function GoogleTestPage() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [driveFiles, setDriveFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            handleOAuthCallback(code);
        }

        // Check for stored token
        const stored = localStorage.getItem('google_access_token');
        if (stored) {
            setAccessToken(stored);
        }
    }, []);

    // Fetch data when token is available
    useEffect(() => {
        if (accessToken) {
            fetchUserInfo();
            fetchCalendarEvents();
            fetchDriveFiles();
        }
    }, [accessToken]);

    async function handleOAuthCallback(code: string) {
        try {
            setLoading(true);
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/auth/google/callback?code=${code}`);
            const data = await response.json();

            if (data.success && data.tokens.access_token) {
                setAccessToken(data.tokens.access_token);
                localStorage.setItem('google_access_token', data.tokens.access_token);

                // Clean URL
                window.history.replaceState({}, document.title, '/google-test');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function startOAuth() {
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/auth/google`);
            const data = await response.json();
            window.location.href = data.authUrl;
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function fetchUserInfo() {
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/google/user`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setUserInfo(data);
        } catch (err: any) {
            setError(err.message);
        }
    }

    async function fetchCalendarEvents() {
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/google/calendar/events?maxResults=10`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setCalendarEvents(data);
        } catch (err: any) {
            console.error('Calendar error:', err);
        }
    }

    async function fetchDriveFiles() {
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/google/drive/files?maxResults=10`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setDriveFiles(data);
        } catch (err: any) {
            console.error('Drive error:', err);
        }
    }

    function disconnect() {
        setAccessToken(null);
        setUserInfo(null);
        setCalendarEvents([]);
        setDriveFiles([]);
        localStorage.removeItem('google_access_token');
    }

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
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Google <span className="text-gradient">OAuth Test</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            Test Google Calendar & Drive integration
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="container-main pb-16">
                {/* Connection Status */}
                <motion.div
                    className="glass-card mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Connection Status</h2>
                            <p className="text-gray-400">
                                {accessToken ? '✅ Connected to Google' : '❌ Not connected'}
                            </p>
                        </div>
                        {!accessToken ? (
                            <button
                                onClick={startOAuth}
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Connecting...' : 'Connect Google Account'}
                            </button>
                        ) : (
                            <button
                                onClick={disconnect}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </motion.div>

                {error && (
                    <div className="glass-card mb-6 bg-red-500/10 border-red-500/20">
                        <p className="text-red-400">Error: {error}</p>
                    </div>
                )}

                {/* User Info */}
                {userInfo && (
                    <motion.div
                        className="glass-card mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4">👤 User Info</h2>
                        <div className="flex items-center gap-4">
                            {userInfo.picture && (
                                <img
                                    src={userInfo.picture}
                                    alt={userInfo.name}
                                    className="w-16 h-16 rounded-full"
                                />
                            )}
                            <div>
                                <p className="font-bold">{userInfo.name}</p>
                                <p className="text-gray-400">{userInfo.email}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Calendar Events */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4">📅 Calendar Events</h2>
                        {calendarEvents.length > 0 ? (
                            <div className="space-y-3">
                                {calendarEvents.map((event, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-lg">
                                        <p className="font-medium">{event.summary || 'No title'}</p>
                                        <p className="text-sm text-gray-400">
                                            {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : 'All day'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">
                                {accessToken ? 'No upcoming events' : 'Connect to view events'}
                            </p>
                        )}
                    </motion.div>

                    {/* Drive Files */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4">📁 Drive Files</h2>
                        {driveFiles.length > 0 ? (
                            <div className="space-y-3">
                                {driveFiles.map((file, i) => (
                                    <div key={i} className="p-3 bg-white/5 rounded-lg">
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {file.mimeType?.split('/')[1] || 'file'} • {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">
                                {accessToken ? 'No files found' : 'Connect to view files'}
                            </p>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
