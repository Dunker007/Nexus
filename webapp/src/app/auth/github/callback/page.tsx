'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

function GitHubCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            exchangeCodeForTokens(code);
        } else {
            setStatus('error');
            setError('No authorization code received');
        }
    }, [searchParams]);

    async function exchangeCodeForTokens(code: string) {
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/auth/github/callback?code=${code}`);
            const data = await response.json();

            if (data.success && data.tokens?.access_token) {
                // Store tokens in localStorage
                localStorage.setItem('github_access_token', data.tokens.access_token);

                setStatus('success');

                // Redirect to integrations after brief delay
                setTimeout(() => {
                    router.push('/integrations');
                }, 1500);
            } else {
                setStatus('error');
                setError(data.error || 'Failed to get tokens');
            }
        } catch (err: any) {
            setStatus('error');
            setError(err.message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass-card text-center max-w-md">
                {status === 'loading' && (
                    <>
                        <div className="text-6xl mb-4 animate-spin">⚙️</div>
                        <h1 className="text-2xl font-bold mb-2">Connecting to GitHub...</h1>
                        <p className="text-gray-400">Please wait while we complete authentication.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-6xl mb-4">✅</div>
                        <h1 className="text-2xl font-bold mb-2 text-green-400">Connected!</h1>
                        <p className="text-gray-400">Redirecting to integrations...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold mb-2 text-red-400">Connection Failed</h1>
                        <p className="text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/integrations')}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                        >
                            Back to Integrations
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function GitHubCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <GitHubCallbackContent />
        </Suspense>
    );
}
