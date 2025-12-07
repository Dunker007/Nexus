'use client';

import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
    children: React.ReactNode;
    isActive?: boolean;
    onEscape?: () => void;
}

export default function FocusTrap({ children, isActive = true, onEscape }: FocusTrapProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive) return;

        const root = rootRef.current;
        if (!root) return;

        // Find all focusable elements
        const focusables = root.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onEscape) {
                onEscape();
                return;
            }

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last?.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first?.focus();
                    }
                }
            }
        };

        // Focus the first element on mount
        if (first) {
            // Small timeout to allow render to complete/animation to start
            setTimeout(() => first.focus(), 50);
        }

        root.addEventListener('keydown', (e) => handleKeyDown(e as any));
        return () => root.removeEventListener('keydown', (e) => handleKeyDown(e as any));
    }, [isActive, onEscape]);

    return (
        <div ref={rootRef}>
            {children}
        </div>
    );
}
