'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import PageBackground from '@/components/PageBackground';
import { useVibe } from '@/components/VibeContext';

interface Settings {
    // General
    theme: string;
    language: string;
    timezone: string;

    // AI
    defaultProvider: string;
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    streamResponses: boolean;

    // Privacy
    saveHistory: boolean;
    analytics: boolean;
    sendCrashReports: boolean;

    // Bridge
    bridgeUrl: string;
    autoConnect: boolean;
    reconnectInterval: number;

    // Notifications
    notifyOnComplete: boolean;
    notifyOnError: boolean;
    soundEffects: boolean;
}

const defaultSettings: Settings = {
    theme: 'cyberpunk',
    language: 'en',
    timezone: 'America/Chicago',
    defaultProvider: 'lmstudio',
    defaultModel: 'gemma-3n-E4B-it-QAT',
    temperature: 0.7,
    maxTokens: 1000,
    streamResponses: true,
    saveHistory: true,
    analytics: false,
    sendCrashReports: true,
    bridgeUrl: LUXRIG_BRIDGE_URL,
    autoConnect: true,
    reconnectInterval: 5000,
    notifyOnComplete: true,
    notifyOnError: true,
    soundEffects: false,
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'privacy' | 'bridge' | 'google' | 'notifications'>('general');

    // Theme from global context
    const { themeId, setTheme, availableThemes, theme } = useVibe();

    function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
        setSettings(prev => ({ ...prev, [key]: value }));
    }

    function saveSettings() {
        // In production, save to localStorage or API
        localStorage.setItem('DLX-settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    function resetSettings() {
        setSettings(defaultSettings);
    }

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'ai', label: 'AI', icon: '🤖' },
        { id: 'privacy', label: 'Privacy', icon: '🔒' },
        { id: 'bridge', label: 'Bridge', icon: '🌉' },
        { id: 'google', label: 'Google', icon: '🔐' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
    ];

    return (
        <div className="min-h-screen relative">
            <PageBackground color="blue" />
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            <span className="text-gradient">Settings</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            Configure your DLX Studio experience
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="container-main pb-16">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Tabs */}
                    <div className="lg:col-span-1">
                        <motion.div
                            className="glass-card p-2 space-y-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'hover:bg-white/10'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={activeTab}
                        >
                            {/* General */}
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">⚙️ General Settings</h2>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-3">Theme</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {availableThemes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id)}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left ${themeId === t.id
                                                            ? 'border-cyan-400 bg-cyan-500/10 scale-105'
                                                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    {/* Color Preview */}
                                                    <div className="flex gap-1 mb-2">
                                                        <div
                                                            className="w-6 h-6 rounded-full"
                                                            style={{ backgroundColor: t.colors.primary }}
                                                        />
                                                        <div
                                                            className="w-6 h-6 rounded-full"
                                                            style={{ backgroundColor: t.colors.accent }}
                                                        />
                                                        <div
                                                            className="w-6 h-6 rounded-full border border-white/20"
                                                            style={{ backgroundColor: t.colors.background }}
                                                        />
                                                    </div>
                                                    <div className="font-medium text-sm">{t.name}</div>
                                                    <div className="text-xs text-gray-500">{t.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Language</label>
                                        <select
                                            value={settings.language}
                                            onChange={(e) => updateSetting('language', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                            <option value="ja">日本語</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Timezone</label>
                                        <select
                                            value={settings.timezone}
                                            onChange={(e) => updateSetting('timezone', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                                        >
                                            <option value="America/Chicago">Central Time (CT)</option>
                                            <option value="America/New_York">Eastern Time (ET)</option>
                                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                            <option value="Europe/London">London (GMT)</option>
                                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* AI */}
                            {activeTab === 'ai' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">🤖 AI Settings</h2>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Default Provider</label>
                                        <select
                                            value={settings.defaultProvider}
                                            onChange={(e) => updateSetting('defaultProvider', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                                        >
                                            <option value="lmstudio">LM Studio</option>
                                            <option value="ollama">Ollama</option>
                                            <option value="openai">OpenAI</option>
                                            <option value="anthropic">Anthropic</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Temperature: {settings.temperature}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={settings.temperature}
                                            onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Lower = more focused, Higher = more creative
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Max Tokens: {settings.maxTokens}
                                        </label>
                                        <input
                                            type="range"
                                            min="100"
                                            max="4000"
                                            step="100"
                                            value={settings.maxTokens}
                                            onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Stream Responses</span>
                                            <p className="text-xs text-gray-500">Show tokens as they are generated</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.streamResponses}
                                            onChange={(e) => updateSetting('streamResponses', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>
                                </div>
                            )}

                            {/* Privacy */}
                            {activeTab === 'privacy' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">🔒 Privacy Settings</h2>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Save Chat History</span>
                                            <p className="text-xs text-gray-500">Store conversations locally</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.saveHistory}
                                            onChange={(e) => updateSetting('saveHistory', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Analytics</span>
                                            <p className="text-xs text-gray-500">Help improve DLX Studio (anonymous)</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.analytics}
                                            onChange={(e) => updateSetting('analytics', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Crash Reports</span>
                                            <p className="text-xs text-gray-500">Automatically send error reports</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.sendCrashReports}
                                            onChange={(e) => updateSetting('sendCrashReports', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>

                                    <div className="pt-4 border-t border-gray-700">
                                        <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                            Clear All Data
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Bridge */}
                            {activeTab === 'bridge' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">🌉 Bridge Settings</h2>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Bridge URL</label>
                                        <input
                                            type="text"
                                            value={settings.bridgeUrl}
                                            onChange={(e) => updateSetting('bridgeUrl', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 font-mono"
                                        />
                                    </div>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Auto Connect</span>
                                            <p className="text-xs text-gray-500">Connect to Bridge on startup</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.autoConnect}
                                            onChange={(e) => updateSetting('autoConnect', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Reconnect Interval: {settings.reconnectInterval / 1000}s
                                        </label>
                                        <input
                                            type="range"
                                            min="1000"
                                            max="30000"
                                            step="1000"
                                            value={settings.reconnectInterval}
                                            onChange={(e) => updateSetting('reconnectInterval', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <button className="btn-primary">Test Connection</button>
                                    </div>
                                </div>
                            )}

                            {/* Google Integration */}
                            {activeTab === 'google' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">🔐 Google Integration</h2>

                                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                        <p className="text-cyan-400 mb-2">✨ Connect your Google account to access:</p>
                                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                                            <li>Google Calendar events</li>
                                            <li>Google Drive files</li>
                                            <li>Gmail integration (coming soon)</li>
                                        </ul>
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <Link
                                            href="/google-test"
                                            className="btn-primary inline-block"
                                        >
                                            Test Google Integration →
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Notifications */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">🔔 Notification Settings</h2>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Notify on Completion</span>
                                            <p className="text-xs text-gray-500">Show notification when AI finishes</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.notifyOnComplete}
                                            onChange={(e) => updateSetting('notifyOnComplete', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Notify on Error</span>
                                            <p className="text-xs text-gray-500">Show notification when something fails</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.notifyOnError}
                                            onChange={(e) => updateSetting('notifyOnError', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Sound Effects</span>
                                            <p className="text-xs text-gray-500">Play sounds for notifications</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.soundEffects}
                                            onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-700 flex items-center justify-between">
                                <button
                                    onClick={resetSettings}
                                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                                >
                                    Reset to Defaults
                                </button>
                                <div className="flex gap-4 items-center">
                                    {saved && (
                                        <span className="text-green-400 text-sm">✓ Saved!</span>
                                    )}
                                    <button
                                        onClick={saveSettings}
                                        className="btn-primary"
                                    >
                                        Save Settings
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
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
