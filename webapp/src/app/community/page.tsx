'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const links = [
    {
        name: 'GitHub',
        icon: '🐙',
        url: 'https://github.com/Dunker007',
        desc: 'Source code, issues, and contributions',
        color: 'from-gray-600 to-gray-800'
    },
    {
        name: 'POE',
        icon: '💬',
        url: 'https://poe.com',
        desc: 'Chat with AI bots and create your own',
        color: 'from-cyan-600 to-blue-600'
    },
    {
        name: 'Discord',
        icon: '🎮',
        url: '#',
        desc: 'Join the community, get help, share projects',
        color: 'from-indigo-600 to-purple-600',
        soon: true
    },
    {
        name: 'YouTube',
        icon: '📺',
        url: '#',
        desc: 'Tutorials, demos, and behind-the-scenes',
        color: 'from-red-600 to-red-800',
        soon: true
    },
    {
        name: 'Twitter/X',
        icon: '🐦',
        url: '#',
        desc: 'Updates, tips, and AI news',
        color: 'from-sky-500 to-blue-600',
        soon: true
    },
];

const contributors = [
    { name: 'Dunker007', role: 'Creator', avatar: '👨‍💻' },
    { name: 'Lux (AI)', role: 'Creative Partner', avatar: '🎨' },
    { name: 'Guardian (AI)', role: 'System Monitor', avatar: '🛡️' },
    { name: 'Claude', role: 'Code Review', avatar: '🧠' },
    { name: 'Gemini', role: 'Research', avatar: '✨' },
];

const faqs = [
    {
        q: 'Is DLX Studio free?',
        a: 'Yes! DLX Studio is completely free and open source. The core philosophy is local-first, so you own your data and pay nothing for AI inference.'
    },
    {
        q: 'Do I need a powerful GPU?',
        a: 'It depends on your use case. For small models (7B), a GTX 1060 6GB works. For larger models (70B+), you\'ll want an RTX 3090/4090 or use cloud APIs.'
    },
    {
        q: 'How is this different from ChatGPT?',
        a: 'DLX Studio runs AI locally on your machine. Your data never leaves your computer, there are no monthly fees, and no rate limits. Plus, it integrates with your actual tools and files.'
    },
    {
        q: 'Can I contribute?',
        a: 'Absolutely! Check out our GitHub repo, open issues, submit PRs, or share your projects in the Discord. All contributions are welcome.'
    },
    {
        q: 'What models are supported?',
        a: 'Any model that works with LM Studio or Ollama - that\'s thousands of models including Llama, Mistral, Qwen, Gemma, and more.'
    },
];

export default function CommunityPage() {
    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            <span className="text-gradient">Community</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Join the movement. Connect with builders, share projects, and shape the future of local AI.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Social Links */}
            <section className="container-main pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {links.map((link, i) => (
                        <motion.a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            className={`glass-card relative overflow-hidden group ${link.soon ? 'opacity-75' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={!link.soon ? { y: -5 } : {}}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                            {link.soon && (
                                <span className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                    Coming Soon
                                </span>
                            )}

                            <div className="relative z-10">
                                <span className="text-4xl">{link.icon}</span>
                                <h3 className="text-2xl font-bold mt-4 mb-2">{link.name}</h3>
                                <p className="text-gray-400">{link.desc}</p>
                            </div>
                        </motion.a>
                    ))}

                    {/* Sponsor Card */}
                    <motion.div
                        className="glass-card relative overflow-hidden border-2 border-pink-500/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-purple-600 opacity-10"></div>
                        <div className="relative z-10">
                            <span className="text-4xl">💖</span>
                            <h3 className="text-2xl font-bold mt-4 mb-2">Support the Project</h3>
                            <p className="text-gray-400 mb-4">Help keep DLX Studio free and actively developed.</p>
                            <a
                                href="https://github.com/sponsors/Dunker007"
                                target="_blank"
                                className="inline-block px-4 py-2 bg-pink-500/20 text-pink-400 rounded hover:bg-pink-500/30 transition-colors"
                            >
                                Become a Sponsor
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contributors */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <h2 className="text-3xl font-bold mb-8 text-center">🏆 Core Team</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        {contributors.map((person, i) => (
                            <motion.div
                                key={person.name}
                                className="glass-card text-center w-40"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-5xl mb-3">{person.avatar}</div>
                                <h3 className="font-bold">{person.name}</h3>
                                <p className="text-sm text-gray-500">{person.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section-padding">
                <div className="container-main">
                    <h2 className="text-3xl font-bold mb-8 text-center">❓ FAQ</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                className="glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <h3 className="font-bold text-lg mb-2 text-cyan-400">{faq.q}</h3>
                                <p className="text-gray-400">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12 relative overflow-hidden"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-4">Ready to Build?</h2>
                            <p className="text-xl text-gray-400 mb-8">
                                Download DLX Studio and start creating with local AI today.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link href="/download" className="btn-primary text-lg px-8 py-4">
                                    Download Now
                                </Link>
                                <a
                                    href="https://github.com/Dunker007/Fresh-Start"
                                    target="_blank"
                                    className="btn-outline text-lg px-8 py-4"
                                >
                                    View Source
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main py-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
