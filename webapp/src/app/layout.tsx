import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';

const Navigation = dynamic(() => import("@/components/Navigation"), { ssr: true });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const LuxHelper = dynamic(() => import("@/components/LuxHelper"), { ssr: false });
const KeyboardShortcuts = dynamic(() => import("@/components/KeyboardShortcuts"), { ssr: false });
const CollaborationToolbar = dynamic(() => import("@/components/CollaborationToolbar"), { ssr: false });
const ConsentBanner = dynamic(() => import("@/components/ConsentBanner"), { ssr: false });
const VibeController = dynamic(() => import("@/components/VibeController"), { ssr: false });
const VoiceControl = dynamic(() => import("@/components/VoiceControl"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DLX Studio AI - Your Personal AI Operating System",
  description: "A powerful AI command center with local LLM integration, GPU monitoring, and multi-model orchestration. Built on LuxRig.",
  keywords: ["AI", "LLM", "LM Studio", "Ollama", "Machine Learning", "Local AI"],
};

import { VibeProvider } from "@/components/VibeContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SafetyProvider } from "@/components/SafetyGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-grid`}>
        <ThemeProvider defaultTheme="dark" storageKey="dlx-theme">
          <VibeProvider>
            <SafetyProvider>
              <Suspense fallback={null}>
                <Navigation />
              </Suspense>
              <CommandPalette />
              <KeyboardShortcuts />
              <main className="pt-16 min-h-screen">
                {children}
              </main>
              <VibeController />
              <VoiceControl />
              <LuxHelper />
              <CollaborationToolbar />
              <ConsentBanner />
            </SafetyProvider>
          </VibeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

