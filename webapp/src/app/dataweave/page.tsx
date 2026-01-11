'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Network, Database, ArrowRight, RefreshCw, Globe, Server, CheckCircle, XCircle } from 'lucide-react';

const BRIDGE_URL = 'http://localhost:3456';

interface Job {
    id: string;
    name: string;
    source: string;
    target: string;
    status: string;
    lastRun: string;
}

interface JobResult {
    success: boolean;
    records: number;
    message: string;
}

export default function DataWeavePage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [runningJob, setRunningJob] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<{ jobId: string; result: JobResult } | null>(null);

    useEffect(() => {
        fetchJobs();
        // Poll for updates
        const interval = setInterval(fetchJobs, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${BRIDGE_URL}/dataweave/jobs`);
            const data = await res.json();
            if (data.success) {
                setJobs(data.jobs);
            }
        } catch (e) {
            console.error('Failed to fetch jobs:', e);
        }
    };

    const runJob = async (id: string) => {
        setRunningJob(id);
        setLastResult(null);

        try {
            const res = await fetch(`${BRIDGE_URL}/dataweave/jobs/${id}/run`, {
                method: 'POST'
            });
            const data = await res.json();

            if (data.success) {
                setLastResult({ jobId: id, result: data.result });
            }

            fetchJobs();
        } catch (e) {
            console.error('Failed to run job:', e);
        } finally {
            setRunningJob(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-yellow-400 bg-yellow-500/20';
            case 'error': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-700/50';
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
                            Data <span className="text-gradient">Weave</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            Universal ETL Pipelines for data ingestion and transformation.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pipeline Visualizer */}
            <section className="container-main pb-12">
                <div className="glass-card min-h-[200px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>

                    <div className="relative z-10 flex items-center gap-8">
                        {/* Source */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                                <Globe className="w-8 h-8 text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-400">External APIs</span>
                        </div>

                        {/* Connection */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50 relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-0 bg-white/50 w-8"
                                    animate={{ x: ['-100%', '400%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-600" />
                        </div>

                        {/* Transform */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                                <Network className="w-8 h-8 text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-400">Normalization</span>
                        </div>

                        {/* Connection */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-24 h-1 bg-gradient-to-r from-purple-500/50 to-green-500/50"></div>
                            <ArrowRight className="w-4 h-4 text-gray-600" />
                        </div>

                        {/* Destination */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                                <Database className="w-8 h-8 text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-400">Knowledge Lake</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Last Result Banner */}
            {lastResult && (
                <motion.section
                    className="container-main pb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${lastResult.result.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                        {lastResult.result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className={lastResult.result.success ? 'text-green-400' : 'text-red-400'}>
                            {lastResult.result.message} ({lastResult.result.records} records)
                        </span>
                    </div>
                </motion.section>
            )}

            {/* Jobs List */}
            <section className="container-main pb-16">
                <h2 className="text-2xl font-bold mb-6">ETL Jobs</h2>
                <div className="grid gap-4">
                    {jobs.map((job, i) => (
                        <motion.div
                            key={job.id}
                            className="glass-card p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`p-3 rounded-lg ${getStatusColor(job.status)}`}>
                                    {runningJob === job.id ? (
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Server className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{job.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        {job.source} <ArrowRight className="w-3 h-3" /> {job.target}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${job.status === 'running' ? 'text-yellow-400' :
                                            job.status === 'error' ? 'text-red-400' : 'text-gray-400'
                                        }`}>
                                        {job.status.toUpperCase()}
                                    </div>
                                    <div className="text-xs text-gray-500">Last run: {job.lastRun}</div>
                                </div>
                                <button
                                    onClick={() => runJob(job.id)}
                                    disabled={runningJob !== null}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors disabled:opacity-50"
                                >
                                    {runningJob === job.id ? 'Running...' : 'Run Now'}
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {jobs.length === 0 && (
                        <div className="glass-card p-12 text-center text-gray-500">
                            <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No ETL jobs configured.</p>
                            <p className="text-sm mt-1">Bridge server may be offline.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
