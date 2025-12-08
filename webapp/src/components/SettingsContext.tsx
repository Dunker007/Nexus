'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

export interface AppSettings {
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

    // Bridge Services
    lmstudioUrl: string;
    ollamaUrl: string;
    bridgeUrl: string;

    // Privacy
    saveHistory: boolean;
    analytics: boolean;
    sendCrashReports: boolean;

    // App Local
    autoConnect: boolean;
    reconnectInterval: number;
    notifyOnComplete: boolean;
    notifyOnError: boolean;
    soundEffects: boolean;
}

const defaultSettings: AppSettings = {
    theme: 'cyberpunk',
    language: 'en',
    timezone: 'America/Chicago',
    defaultProvider: 'lmstudio',
    defaultModel: 'default',
    temperature: 0.7,
    maxTokens: 1000,
    streamResponses: true,
    lmstudioUrl: 'http://127.0.0.1:1234',
    ollamaUrl: 'http://127.0.0.1:11434',
    bridgeUrl: LUXRIG_BRIDGE_URL,
    saveHistory: true,
    analytics: false,
    sendCrashReports: true,
    autoConnect: true,
    reconnectInterval: 5000,
    notifyOnComplete: true,
    notifyOnError: true,
    soundEffects: false,
};

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    refreshSettings: () => Promise<void>;
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load
    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setIsLoading(true);
        try {
            // Load local overrides first (e.g. bridge URL)
            const localRaw = localStorage.getItem('DLX-settings-local');
            const local = localRaw ? JSON.parse(localRaw) : {};
            const bridgeUrl = local.bridgeUrl || settings.bridgeUrl || LUXRIG_BRIDGE_URL;

            // Fetch remote settings
            try {
                const res = await fetch(`${bridgeUrl}/settings`);
                if (res.ok) {
                    const data = await res.json();

                    // Merge remote + local + defaults
                    setSettings(prev => ({
                        ...prev,
                        ...local, // Local overrides (bridgeUrl etc)

                        // Map remote keys
                        theme: data.theme || prev.theme,
                        language: data.language || prev.language,
                        timezone: data.timezone || prev.timezone,
                        defaultProvider: data.ai_default_provider || prev.defaultProvider,
                        defaultModel: data.ai_default_model || prev.defaultModel,
                        temperature: data.ai_temperature || prev.temperature,
                        maxTokens: data.ai_max_tokens || prev.maxTokens,
                        streamResponses: data.ai_stream !== undefined ? data.ai_stream : prev.streamResponses,
                        lmstudioUrl: data.lmstudio_url || prev.lmstudioUrl,
                        ollamaUrl: data.ollama_url || prev.ollamaUrl,
                        saveHistory: data.privacy_save_history !== undefined ? data.privacy_save_history : prev.saveHistory,
                        analytics: data.privacy_analytics !== undefined ? data.privacy_analytics : prev.analytics,

                        // Ensure bridgeUrl is consistent
                        bridgeUrl
                    }));
                }
            } catch (e) {
                console.warn('Failed to fetch remote settings, using defaults/local', e);
                setSettings(prev => ({ ...prev, ...local }));
            }
        } catch (error) {
            console.error('Settings load error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function updateSettings(newSettings: Partial<AppSettings>) {
        // Optimistic update
        const merged = { ...settings, ...newSettings };
        setSettings(merged);

        try {
            // Save to Bridge
            const backendPayload = {
                theme: merged.theme,
                language: merged.language,
                timezone: merged.timezone,
                ai_default_provider: merged.defaultProvider,
                ai_default_model: merged.defaultModel,
                ai_temperature: merged.temperature,
                ai_max_tokens: merged.maxTokens,
                ai_stream: merged.streamResponses,
                lmstudio_url: merged.lmstudioUrl,
                ollama_url: merged.ollamaUrl,
                privacy_save_history: merged.saveHistory,
                privacy_analytics: merged.analytics,
            };

            // Don't fail if bridge is down, just try
            try {
                await fetch(`${merged.bridgeUrl}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(backendPayload)
                });
            } catch (e) {
                console.warn('Failed to save settings to bridge:', e);
            }

            // Save local
            const localData = {
                bridgeUrl: merged.bridgeUrl,
                autoConnect: merged.autoConnect,
                reconnectInterval: merged.reconnectInterval,
                notifyOnComplete: merged.notifyOnComplete,
                notifyOnError: merged.notifyOnError,
                soundEffects: merged.soundEffects
            };
            localStorage.setItem('DLX-settings-local', JSON.stringify(localData));

        } catch (error) {
            console.error('Settings update error:', error);
            // Revert? (Not implementing revert for now)
        }
    }

    return (
        <SettingsContext.Provider value={{
            settings,
            updateSettings,
            refreshSettings: loadSettings,
            isLoading
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
