'use client';

import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

interface Model {
    id: string;
    provider: string;
    size?: number;
    details?: {
        parameter_size?: string;
        quantization_level?: string;
        family?: string;
    };
}

interface ModelsResponse {
    lmstudio: Model[];
    ollama: Model[];
    total: number;
}

const BRIDGE_URL = LUXRIG_BRIDGE_URL;

export default function LLMModels() {
    const [models, setModels] = useState<ModelsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchModels() {
            try {
                const res = await fetch(`${BRIDGE_URL}/llm/models`);
                const data = await res.json();
                setModels(data);
            } catch (e) {
                console.error('Failed to fetch models');
            } finally {
                setLoading(false);
            }
        }

        fetchModels();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="skeleton h-16 w-full"></div>
                <div className="skeleton h-16 w-full"></div>
            </div>
        );
    }

    if (!models) {
        return (
            <div className="glass-card text-center py-8">
                <p className="text-gray-400">Failed to load models</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gradient">Available Models</h3>
                <span className="text-cyan-400 font-mono">{models.total} total</span>
            </div>

            {/* LM Studio Models */}
            <div>
                <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                    LM Studio ({models.lmstudio.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {models.lmstudio.map((model) => (
                        <div key={model.id} className="glass-card py-3">
                            <p className="font-mono text-sm text-cyan-400 truncate">{model.id}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ollama Models */}
            <div>
                <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Ollama ({models.ollama.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {models.ollama.map((model) => (
                        <div key={model.id} className="glass-card py-3">
                            <p className="font-mono text-sm text-purple-400">{model.id}</p>
                            {model.details && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {model.details.parameter_size} • {model.details.quantization_level}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
