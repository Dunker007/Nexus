'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/components/SettingsContext';

// Lux personality and tips per page context
const LUX_TIPS: Record<string, string[]> = {
    '/': [
        "👋 Welcome to DLX Studio! I'm Lux, your AI assistant.",
        "💡 Try the Dashboard for your personal command center!",
        "🎵 Music Studio is ready to create hit songs!",
    ],
    '/dashboard': [
        "☀️ Your personal start page is looking great!",
        "📰 Check the News Hub for the latest headlines.",
        "📋 You have tasks waiting in your Project Board!",
    ],
    '/news': [
        "📰 Stay informed with sources mainstream won't show!",
        "⚙️ Add your own RSS sources with the manager.",
        "🔍 Use the Fact Checker on any claim!",
    ],
    '/music': [
        "🎵 Let's create something amazing together!",
        "🎸 The Songwriter Room is ready for your ideas.",
        "💿 Copy the Suno prompt when you're ready!",
    ],
    '/chat': [
        "💬 I'm here to help with anything!",
        "🤖 Ask me about your projects or ideas.",
        "⚡ Use me to control the whole platform!",
    ],
    '/agents': [
        "🤖 Meet your AI team!",
        "🎨 I'm the creative one - ask me for ideas!",
        "🛡️ Guardian keeps everything secure.",
    ],
    '/labs': [
        "🔬 Time to experiment!",
        "🚀 Labs is where the magic happens.",
        "💡 Try something new today!",
    ],
    '/income': [
        "💸 Let's build some income streams!",
        "📈 YouTube + Suno is a great combo.",
        "🎯 Follow the 12-week rollout plan!",
    ],
    'default': [
        "🎨 I'm Lux, your AI assistant!",
        "💡 Click me anytime for help.",
        "⚡ I can help with anything!",
    ],
};

const LUX_RESPONSES: Record<string, string> = {
    'hello': "Hey there! 👋 How can I help you today?",
    'hi': "Hi! Great to see you! What are we working on?",
    'help': "I can help with: navigation, tasks, ideas, or just chat! What do you need?",
    'news': "📰 Head to /news for the News Hub with conservative and MN local sources!",
    'music': "🎵 The Music Studio at /music has songwriter agents ready to create!",
    'weather': "🌤️ Minneapolis is looking cold today - around 28°F with some snow!",
    'task': "📋 You can manage tasks from the Dashboard project board!",
    'default': "I heard you! In a future update, I'll connect to your local LLM for smarter responses. For now, try asking about 'news', 'music', 'help', or 'weather'!",
};

interface LuxHelperProps {
    initialOpen?: boolean;
}

export default function LuxHelper({ initialOpen = false }: LuxHelperProps) {
    const pathname = usePathname();
    const { settings } = useSettings(); // Use context

    const [showChat, setShowChat] = useState(initialOpen);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [currentTip, setCurrentTip] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Get tips for current page
    const tips = LUX_TIPS[pathname] || LUX_TIPS['default'];

    useEffect(() => {
        // Set initial tip
        setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);

        // Rotate tips
        const interval = setInterval(() => {
            setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
        }, 10000);

        return () => clearInterval(interval);
    }, [pathname, tips]);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        const userMessage = input.toLowerCase();
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');
        setIsTyping(true);

        // 1. Check for local canned responses (Fast Path)
        for (const [key, value] of Object.entries(LUX_RESPONSES)) {
            if (userMessage.includes(key)) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'lux', content: value }]);
                    setIsTyping(false);
                }, 500);
                return;
            }
        }

        // 2. Fallback to LuxRig LLM
        try {
            // Using settings from context
            const res = await fetch(`${settings.bridgeUrl}/llm/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: settings.defaultProvider,
                    model: settings.defaultModel,
                    messages: [
                        { role: 'system', content: 'You are Lux, a specific AI assistant for this DLX Studio app. Be concise (max 2 sentences), helpful, and slightly witty. You are helping the user navigate their app.' },
                        { role: 'user', content: input }
                    ]
                })
            });

            const data = await res.json();
            const reply = data.content || data.error || "I'm having trouble connecting to my brain (LuxRig).";

            setMessages(prev => [...prev, { role: 'lux', content: reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'lux', content: "I can't reach LuxRig right now. Is it running?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-20 right-0 w-80 bg-[#0d0d15]/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🎨</span>
                                <div>
                                    <span className="font-bold text-cyan-400">Lux</span>
                                    <span className="text-xs text-gray-400 ml-2">AI Assistant</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowChat(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="h-64 overflow-y-auto p-4 space-y-3">
                            {/* Welcome message */}
                            <div className="bg-cyan-500/10 rounded-lg p-3 text-sm border border-cyan-500/20">
                                <p>👋 Hey! I'm Lux, your AI assistant. How can I help?</p>
                            </div>

                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-lg p-3 text-sm ${msg.role === 'user'
                                        ? 'bg-purple-500/10 ml-6 border border-purple-500/20'
                                        : 'bg-cyan-500/10 mr-6 border border-cyan-500/20'
                                        }`}
                                >
                                    {msg.content}
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="bg-cyan-500/10 rounded-lg p-3 text-sm mr-6 border border-cyan-500/20">
                                    <span className="animate-pulse">Lux is typing...</span>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask me anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-500/50 focus:outline-none"
                                />
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black rounded-lg text-sm font-medium hover:from-cyan-400 hover:to-cyan-500 transition-all"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Button */}
            <motion.button
                onClick={() => setShowChat(!showChat)}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Tip Bubble */}
                <AnimatePresence>
                    {!showChat && (
                        <motion.div
                            className="absolute bottom-full right-0 mb-3 w-52 p-3 bg-[#0d0d15]/90 backdrop-blur rounded-xl text-xs text-gray-300 border border-white/10 shadow-lg"
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            transition={{ delay: 0.5 }}
                        >
                            {currentTip}
                            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#0d0d15]/90 rotate-45 border-r border-b border-white/10"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30 border-2 border-white/20 group-hover:shadow-cyan-500/50 transition-shadow">
                    <motion.span
                        animate={{ rotate: showChat ? 0 : [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: showChat ? 0 : Infinity, repeatDelay: 5 }}
                    >
                        🎨
                    </motion.span>
                </div>

                {/* Status */}
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0a0a0f] shadow-lg shadow-green-500/50"></span>
            </motion.button>
        </div>
    );
}
