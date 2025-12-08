'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import PageBackground from '@/components/PageBackground';
import { useVibe } from '@/components/VibeContext';
import { useSettings, AppSettings } from '@/components/SettingsContext';
import { ThemeId } from '@/lib/themes';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';

export default function SettingsPage() {
    const { settings, updateSettings, isLoading } = useSettings();
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'privacy' | 'bridge' | 'google' | 'notifications' | 'remote'>('general');

    // Theme from global context
    const { themeId, setTheme, availableThemes } = useVibe();

    // Local form state
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [startOnBoot, setStartOnBoot] = useState(false);

    // Sync local state when settings load
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    // Check autostart status
    useEffect(() => {
        const checkAutostart = async () => {
            try {
                const active = await isEnabled();
                setStartOnBoot(active);
            } catch (e) {
                // Plugin likely not available (web mode)
            }
        };
        checkAutostart();
    }, []);

    const toggleAutostart = async (checked: boolean) => {
        try {
            if (checked) {
                await enable();
            } else {
                await disable();
            }
            setStartOnBoot(checked);
        } catch (e) {
            console.error('Failed to toggle autostart', e);
        }
    }

    // Sync theme from settings to Vibe if changed externally
    useEffect(() => {
        if (settings.theme && settings.theme !== themeId) {
            setTheme(settings.theme as ThemeId);
        }
    }, [settings.theme, themeId, setTheme]);

    // Helper to update a single setting via context
    function updateLocalSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
        setLocalSettings(prev => ({ ...prev, [key]: value }));

        // Live preview for theme
        if (key === 'theme') {
            setTheme(value as ThemeId);
        }
    }

    async function handleSave() {
        await updateSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    function handleReset() {
        setLocalSettings(settings);
        setTheme(settings.theme as ThemeId);
    }

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'ai', label: 'AI', icon: '🤖' },
        { id: 'privacy', label: 'Privacy', icon: '🔒' },
        { id: 'bridge', label: 'Bridge', icon: '🌉' },
        { id: 'remote', label: 'Remote', icon: '📡' },
        { id: 'google', label: 'Google', icon: '🔐' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
    ];

    if (isLoading && !localSettings.theme) {
        return <div className="min-h-screen flex items-center justify-center text-cyan-400">Loading settings...</div>;
    }

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

                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <span className="font-semibold text-white block">Start Nexus on Boot</span>
                                                <span className="text-xs text-gray-500">Automatically launch system tray icon on login</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={startOnBoot}
                                                onChange={(e) => toggleAutostart(e.target.checked)}
                                                className="w-5 h-5 accent-cyan-500"
                                            />
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-3">Theme</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {availableThemes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => updateLocalSetting('theme', t.id)}
                                                    className={`p-4 rounded-xl border-2 transition-all text-left ${localSettings.theme === t.id
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
                                            value={localSettings.language}
                                            onChange={(e) => updateLocalSetting('language', e.target.value)}
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
                                            value={localSettings.timezone}
                                            onChange={(e) => updateLocalSetting('timezone', e.target.value)}
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
                                            value={localSettings.defaultProvider}
                                            onChange={(e) => updateLocalSetting('defaultProvider', e.target.value)}
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
                                            Temperature: {localSettings.temperature}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={localSettings.temperature}
                                            onChange={(e) => updateLocalSetting('temperature', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Lower = more focused, Higher = more creative
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Max Tokens: {localSettings.maxTokens}
                                        </label>
                                        <input
                                            type="range"
                                            min="100"
                                            max="4000"
                                            step="100"
                                            value={localSettings.maxTokens}
                                            onChange={(e) => updateLocalSetting('maxTokens', parseInt(e.target.value))}
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
                                            checked={localSettings.streamResponses}
                                            onChange={(e) => updateLocalSetting('streamResponses', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>

                                    <div className="pt-4 border-t border-gray-700 mt-4">
                                        <h3 className="text-lg font-bold mb-4">Service URLs</h3>

                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-400 mb-2">LM Studio URL</label>
                                            <input
                                                type="text"
                                                value={localSettings.lmstudioUrl}
                                                onChange={(e) => updateLocalSetting('lmstudioUrl', e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 font-mono"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-400 mb-2">Ollama URL</label>
                                            <input
                                                type="text"
                                                value={localSettings.ollamaUrl}
                                                onChange={(e) => updateLocalSetting('ollamaUrl', e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 font-mono"
                                            />
                                        </div>
                                    </div>
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
                                            checked={localSettings.saveHistory}
                                            onChange={(e) => updateLocalSetting('saveHistory', e.target.checked)}
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
                                            checked={localSettings.analytics}
                                            onChange={(e) => updateLocalSetting('analytics', e.target.checked)}
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
                                            checked={localSettings.sendCrashReports}
                                            onChange={(e) => updateLocalSetting('sendCrashReports', e.target.checked)}
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

                            {/* Remote Access */}
                            {activeTab === 'remote' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">📡 Remote Access</h2>

                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <p className="text-sm text-blue-300">
                                            To access Nexus remotely (e.g. from your phone), install <strong>Tailscale</strong> on both devices.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Access URLs</h3>
                                        <div className="space-y-2">
                                            <div className="p-3 bg-black/30 rounded-lg flex justify-between items-center">
                                                <span className="text-gray-400">Local Network</span>
                                                <code className="text-cyan-400">http://YOUR-PC-IP:3000</code>
                                            </div>
                                            <div className="p-3 bg-black/30 rounded-lg flex justify-between items-center">
                                                <span className="text-gray-400">Tailscale</span>
                                                <code className="text-cyan-400">http://TAILSCALE-IP:3000</code>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Security Access Token (Optional)</label>
                                        <input
                                            type="password"
                                            placeholder="Enter a secret token..."
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 font-mono"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Require this token for remote connections (Coming Soon)</p>
                                    </div>
                                </div>
                            )}

                            {/* Bridge */}
                            {activeTab === 'bridge' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">🌉 Bridge Settings</h2>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Bridge URL (Frontend Config)</label>
                                        <input
                                            type="text"
                                            value={localSettings.bridgeUrl}
                                            onChange={(e) => updateLocalSetting('bridgeUrl', e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 font-mono"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">URL where this app connects to the bridge.</p>
                                    </div>

                                    <label className="flex items-center justify-between">
                                        <div>
                                            <span>Auto Connect</span>
                                            <p className="text-xs text-gray-500">Connect to Bridge on startup</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={localSettings.autoConnect}
                                            onChange={(e) => updateLocalSetting('autoConnect', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Reconnect Interval: {localSettings.reconnectInterval / 1000}s
                                        </label>
                                        <input
                                            type="range"
                                            min="1000"
                                            max="30000"
                                            step="1000"
                                            value={localSettings.reconnectInterval}
                                            onChange={(e) => updateLocalSetting('reconnectInterval', parseInt(e.target.value))}
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
                                            checked={localSettings.notifyOnComplete}
                                            onChange={(e) => updateLocalSetting('notifyOnComplete', e.target.checked)}
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
                                            checked={localSettings.notifyOnError}
                                            onChange={(e) => updateLocalSetting('notifyOnError', e.target.checked)}
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
                                            checked={localSettings.soundEffects}
                                            onChange={(e) => updateLocalSetting('soundEffects', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-700 flex items-center justify-between">
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                                >
                                    Reset to Defaults
                                </button>
                                <div className="flex gap-4 items-center">
                                    {saved && (
                                        <span className="text-green-400 text-sm">✓ Saved!</span>
                                    )}
                                    <button
                                        onClick={handleSave}
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
