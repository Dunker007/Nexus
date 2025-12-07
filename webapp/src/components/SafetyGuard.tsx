'use client';

import React, { createContext, useContext, useState } from 'react';

interface SafetyContextType {
    validateContent: (text: string) => { safe: boolean; reason?: string };
    logAction: (action: string, metadata: any) => void;
    safetyLevel: 'standard' | 'strict' | 'relaxed';
    setSafetyLevel: (level: 'standard' | 'strict' | 'relaxed') => void;
}

const SafetyContext = createContext<SafetyContextType | null>(null);

export function useSafety() {
    const context = useContext(SafetyContext);
    if (!context) throw new Error('useSafety must be used within SafetyProvider');
    return context;
}

export function SafetyProvider({ children }: { children: React.ReactNode }) {
    const [safetyLevel, setSafetyLevel] = useState<'standard' | 'strict' | 'relaxed'>('standard');

    const validateContent = (text: string) => {
        // Basic heuristic checks
        const forbiddenWords = ['password', 'secret_key', 'sudo rm -rf'];
        const hasForbidden = forbiddenWords.some(w => text.toLowerCase().includes(w));

        if (hasForbidden) {
            return { safe: false, reason: 'Content contains restricted keywords or sensitive data patterns.' };
        }

        if (safetyLevel === 'strict' && text.length > 5000) {
            return { safe: false, reason: 'Content exceeds strict length limits.' };
        }

        return { safe: true };
    };

    const logAction = async (action: string, metadata: any) => {
        // Asynchronously log to audit endpoint
        try {
            await fetch('/api/audit', {
                method: 'POST',
                body: JSON.stringify({
                    timestamp: Date.now(),
                    level: safetyLevel,
                    action,
                    metadata
                })
            });
        } catch (e) {
            console.error('Failed to log audit event');
        }
    };

    return (
        <SafetyContext.Provider value={{ validateContent, logAction, safetyLevel, setSafetyLevel }}>
            {children}
        </SafetyContext.Provider>
    );
}
