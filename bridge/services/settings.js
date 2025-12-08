/**
 * Settings Service
 * Manages system configuration with database persistence
 */

import { prisma as db } from './database.js';

const DEFAULT_SETTINGS = {
    // General
    'theme': 'cyberpunk',
    'language': 'en',
    'timezone': 'America/Chicago',

    // AI
    'ai_default_provider': 'lmstudio',
    'ai_default_model': 'default',
    'ai_temperature': 0.7,
    'ai_max_tokens': 1000,
    'ai_stream': true,

    // Services
    'lmstudio_url': 'http://127.0.0.1:1234',
    'ollama_url': 'http://127.0.0.1:11434',

    // Privacy
    'privacy_save_history': true,
    'privacy_analytics': false,

    // Bridge
    'bridge_check_interval': 5000
};

export class SettingsService {
    constructor() {
        this.cache = new Map();
        this.initialized = false;
    }

    /**
     * Initialize settings from DB
     */
    async init() {
        if (this.initialized) return;

        try {
            const settings = await db.systemSetting.findMany();

            // Populate cache
            for (const setting of settings) {
                try {
                    this.cache.set(setting.key, JSON.parse(setting.value));
                } catch (e) {
                    console.warn(`[Settings] Failed to parse setting ${setting.key}:`, e.message);
                }
            }

            console.log(`[Settings] Loaded ${settings.length} settings`);
            this.initialized = true;
        } catch (error) {
            console.error('[Settings] Failed to initialize:', error.message);
        }
    }

    /**
     * Get a setting value
     */
    get(key) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        return DEFAULT_SETTINGS[key];
    }

    /**
     * Get all settings
     */
    getAll() {
        const all = { ...DEFAULT_SETTINGS };
        for (const [key, value] of this.cache.entries()) {
            all[key] = value;
        }
        return all;
    }

    /**
     * Set a setting value
     */
    async set(key, value, category = 'general') {
        try {
            const valueStr = JSON.stringify(value);

            // Update DB
            await db.systemSetting.upsert({
                where: { key },
                update: {
                    value: valueStr,
                    category
                },
                create: {
                    key,
                    value: valueStr,
                    category
                }
            });

            // Update cache
            this.cache.set(key, value);
            return true;
        } catch (error) {
            console.error(`[Settings] Failed to set ${key}:`, error.message);
            throw error;
        }
    }

    /**
     * Bulk update settings
     */
    async updateMany(settings) {
        const results = [];
        for (const [key, value] of Object.entries(settings)) {
            // Determine category implicitly or default to general
            let category = 'general';
            if (key.startsWith('ai_') || key.includes('lmstudio') || key.includes('ollama')) category = 'ai';
            if (key.startsWith('privacy_')) category = 'privacy';
            if (key.startsWith('bridge_')) category = 'bridge';

            results.push(await this.set(key, value, category));
        }
        return results;
    }
}

export const settingsService = new SettingsService();
