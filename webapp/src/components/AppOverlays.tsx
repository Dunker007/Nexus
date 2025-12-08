'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const LuxHelper = dynamic(() => import("@/components/LuxHelper"), { ssr: false });
const KeyboardShortcuts = dynamic(() => import("@/components/KeyboardShortcuts"), { ssr: false });
const CollaborationToolbar = dynamic(() => import("@/components/CollaborationToolbar"), { ssr: false });
const ConsentBanner = dynamic(() => import("@/components/ConsentBanner"), { ssr: false });
const VibeController = dynamic(() => import("@/components/VibeController"), { ssr: false });
const VoiceControl = dynamic(() => import("@/components/VoiceControl"), { ssr: false });

export default function AppOverlays() {
    return (
        <>
            <CommandPalette />
            <KeyboardShortcuts />
            <VibeController />
            <VoiceControl />
            <LuxHelper />
            <CollaborationToolbar />
            <ConsentBanner />
        </>
    );
}
