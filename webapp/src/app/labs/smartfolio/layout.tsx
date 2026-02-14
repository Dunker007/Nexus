"use client";
import React from 'react';
import { PortfolioProvider } from '@/context/labs/smartfolio/PortfolioContext';
import Sidebar from '@/components/labs/smartfolio/Sidebar';

export default function SmartFolioLayout({ children }: { children: React.ReactNode }) {
    return (
        <PortfolioProvider>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0b0e11]">
                {/* Sidebar needs context, so it's inside Provider */}
                <Sidebar />
                <div className="flex-1 overflow-y-auto bg-[#0b0e11]/50 relative">
                    {children}
                </div>
            </div>
        </PortfolioProvider>
    );
}
