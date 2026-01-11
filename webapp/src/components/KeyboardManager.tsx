'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardManager() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F5 or Ctrl+R for Reload - Force hard reload to reset state if needed
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                window.location.reload();
            }

            // Escape - Dispatch event for modals/overlays to close
            if (e.key === 'Escape') {
                // We don't prevent default here to allow native behavior (e.g. un-fullscreen)
                window.dispatchEvent(new CustomEvent('app-escape'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return null;
}
