'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Curated prompt library
const prompts = [
    {
        id: 'startup-idea',
        category: 'Business',
        title: 'Startup Idea Generator',
        prompt: `Generate 5 unique startup ideas that:
1. Solve a real problem
2. Can be built by a solo founder
3. Have potential for recurring revenue
4. Can start with $0-1000 budget

For each idea, provide:
- One-liner description
- Target market
- Revenue model
- First 3 steps to validate`,
        tags: ['startup', 'business', 'ideas'],
        saves: 1247,
        icon: '🚀'
    },
    {
        id: 'code-review',
        category: 'Code',
        title: 'Senior Code Review',
        prompt: `Act as a senior software engineer conducting a code review. Analyze the following code for:

1. **Bugs & Issues**: Identify any potential bugs, edge cases, or logic errors
2. **Performance**: Suggest optimizations for speed and memory
3. **Security**: Flag any security vulnerabilities
4. **Best Practices**: Check for SOLID principles, clean code, DRY
5. **Readability**: Suggest ways to improve clarity

Code to review:
\`\`\`
[PASTE YOUR CODE HERE]
\`\`\`

Provide specific line-by-line feedback and suggested fixes.`,
        tags: ['code', 'review', 'debugging'],
        saves: 892,
        icon: '🔍'
    },
    {
        id: 'eli5',
        category: 'Learning',
        title: 'ELI5 Expert',
        prompt: `Explain [TOPIC] like I'm 5 years old.

Use:
- Simple words (no jargon)
- Fun analogies and comparisons
- Real-world examples a child would understand
- Short sentences

Then, explain the same topic at 3 levels:
1. **Beginner** (ages 10-15)
2. **Intermediate** (college level)
3. **Expert** (PhD level)

This helps me understand where I am and what I need to learn.`,
        tags: ['learning', 'explanation', 'education'],
        saves: 2103,
        icon: '🧒'
    },
    {
        id: 'blog-to-threads',
        category: 'Content',
        title: 'Blog to Twitter Thread',
        prompt: `Convert the following blog post into a viral Twitter/X thread:

Requirements:
1. Start with a hook that stops the scroll
2. Each tweet max 280 characters
3. Use line breaks for readability
4. Include relevant emojis (but don't overdo it)
5. End with a CTA
6. Add [QUOTE TWEET HOOK] for the quote-tweet version

Blog post:
[PASTE BLOG HERE]

Format output as:
🧵 Tweet 1/X
[content]

Tweet 2/X
[content]
...`,
        tags: ['twitter', 'content', 'social media'],
        saves: 756,
        icon: '🐦'
    },
    {
        id: 'debug-error',
        category: 'Code',
        title: 'Error Message Debugger',
        prompt: `I'm getting this error:

\`\`\`
[PASTE ERROR HERE]
\`\`\`

My code:
\`\`\`
[PASTE CODE HERE]
\`\`\`

Please:
1. Explain what this error means in plain English
2. Identify the root cause
3. Provide the exact fix with corrected code
4. Explain WHY this fix works
5. Suggest how to prevent this in the future`,
        tags: ['debugging', 'error', 'fix'],
        saves: 1834,
        icon: '🐛'
    },
    {
        id: 'system-design',
        category: 'Architecture',
        title: 'System Design Interview',
        prompt: `Design a system for [SYSTEM NAME, e.g., "Twitter", "Uber", "YouTube"]

Consider:
1. **Requirements**: Functional and non-functional
2. **Scale**: Users, requests/sec, data volume
3. **Components**: API, database, cache, queue, CDN
4. **Database**: Schema design, SQL vs NoSQL
5. **Scaling**: Horizontal vs vertical, sharding, replication
6. **Trade-offs**: CAP theorem, consistency vs availability

Output:
- ASCII diagram of architecture
- Component descriptions
- API endpoints
- Database schema
- Scaling strategy`,
        tags: ['system design', 'architecture', 'interview'],
        saves: 567,
        icon: '🏗️'
    },
    {
        id: 'refactor-code',
        category: 'Code',
        title: 'Code Refactorer',
        prompt: `Refactor this code to be production-ready:

\`\`\`
[PASTE CODE HERE]
\`\`\`

Apply:
1. Clean code principles
2. SOLID principles where applicable
3. Proper error handling
4. Type safety (if applicable)
5. Performance optimizations
6. Add JSDoc/docstrings

Output the refactored code with comments explaining each improvement.`,
        tags: ['refactor', 'clean code', 'optimization'],
        saves: 923,
        icon: '♻️'
    },
    {
        id: 'landing-page',
        category: 'Marketing',
        title: 'Landing Page Copy',
        prompt: `Write landing page copy for [PRODUCT/SERVICE]:

Target audience: [DESCRIBE]
Main benefit: [BENEFIT]
Tone: [professional/casual/playful/urgent]

Generate:
1. **Headline**: 6-10 words, benefit-focused
2. **Subheadline**: Expand on the promise
3. **Hero CTA**: Button text
4. **3 Feature sections**: Title + 2-sentence description each
5. **Social proof section**: Testimonial template
6. **FAQ**: 5 common objections with answers
7. **Final CTA**: Urgency-driven`,
        tags: ['copywriting', 'landing page', 'marketing'],
        saves: 1456,
        icon: '📝'
    },
    {
        id: 'api-to-code',
        category: 'Code',
        title: 'API to Code Generator',
        prompt: `Generate a complete API integration for:

API: [API NAME]
Endpoint: [ENDPOINT URL]
Method: [GET/POST/PUT/DELETE]
Auth: [API key/OAuth/Bearer token]

Generate:
1. **TypeScript/JavaScript** fetch wrapper with types
2. **Error handling** with retry logic
3. **Rate limiting** handling
4. **Caching** strategy
5. **Usage example** with async/await
6. **Tests** (Jest)

Include proper JSDoc comments and make it production-ready.`,
        tags: ['api', 'integration', 'typescript'],
        saves: 678,
        icon: '🔌'
    },
    {
        id: 'persona-creator',
        category: 'Business',
        title: 'User Persona Generator',
        prompt: `Create a detailed user persona for [PRODUCT/SERVICE]:

Target market: [DESCRIBE]

Generate:
1. **Name & Photo description**
2. **Demographics**: Age, location, job, income
3. **Goals**: What they want to achieve
4. **Pain points**: Current frustrations
5. **Behavior**: How they research/buy
6. **Quote**: Something they'd say
7. **Objections**: Why they might not buy
8. **Decision factors**: What convinces them
9. **Day in the life**: Their typical routine
10. **How we reach them**: Marketing channels`,
        tags: ['persona', 'marketing', 'research'],
        saves: 534,
        icon: '👤'
    },
    {
        id: 'sql-query',
        category: 'Data',
        title: 'Natural Language to SQL',
        prompt: `Convert this request to a SQL query:

Request: [DESCRIBE WHAT YOU WANT]

Table schema:
\`\`\`sql
[PASTE YOUR SCHEMA OR DESCRIBE TABLES]
\`\`\`

Provide:
1. The SQL query with proper formatting
2. Explanation of what each part does
3. Performance considerations
4. Alternative approaches if applicable
5. How to add pagination/limits`,
        tags: ['sql', 'database', 'query'],
        saves: 1123,
        icon: '🗃️'
    },
    {
        id: 'cot-reasoning',
        category: 'Prompting',
        title: 'Chain of Thought Master',
        prompt: `Solve this problem step by step:

[YOUR PROBLEM HERE]

Use this reasoning approach:
1. **Understand**: Restate the problem in your own words
2. **Plan**: Outline your approach before solving
3. **Execute**: Work through each step, showing your work
4. **Verify**: Check your answer makes sense
5. **Reflect**: Note any assumptions or edge cases

Think out loud. If you're unsure, explore multiple approaches.`,
        tags: ['reasoning', 'problem-solving', 'chain of thought'],
        saves: 892,
        icon: '🧠'
    },
];

const categories = ['All', ...new Set(prompts.map(p => p.category))];

export default function PromptsPage() {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedPrompt, setSelectedPrompt] = useState<typeof prompts[0] | null>(null);

    const filteredPrompts = prompts.filter(p => {
        const matchesCategory = filter === 'All' || p.category === filter;
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const copyPrompt = (prompt: typeof prompts[0]) => {
        navigator.clipboard.writeText(prompt.prompt);
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

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
                            Prompt <span className="text-gradient">Library</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            Battle-tested prompts that actually work. Copy, customize, conquer.
                        </p>

                        {/* Search */}
                        <div className="max-w-xl mx-auto mb-8">
                            <input
                                type="text"
                                placeholder="Search prompts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex justify-center gap-2 flex-wrap">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === cat
                                            ? 'bg-cyan-500 text-black font-medium'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Prompts Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredPrompts.map((prompt) => (
                        <motion.div
                            key={prompt.id}
                            className="glass-card group cursor-pointer"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedPrompt(prompt)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-3xl">{prompt.icon}</span>
                                <span className="text-xs text-gray-500">{prompt.saves.toLocaleString()} saves</span>
                            </div>

                            <span className="text-xs text-cyan-400 uppercase tracking-wide">{prompt.category}</span>
                            <h3 className="text-xl font-bold mt-1 mb-2 group-hover:text-cyan-400 transition-colors">
                                {prompt.title}
                            </h3>

                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                {prompt.prompt.substring(0, 100)}...
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {prompt.tags.map((tag) => (
                                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Prompt Modal */}
            {selectedPrompt && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedPrompt(null)}
                >
                    <motion.div
                        className="glass-card max-w-3xl w-full max-h-[85vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{selectedPrompt.icon}</span>
                                <div>
                                    <span className="text-xs text-cyan-400 uppercase">{selectedPrompt.category}</span>
                                    <h2 className="text-2xl font-bold">{selectedPrompt.title}</h2>
                                </div>
                            </div>
                            <button
                                className="text-gray-400 hover:text-white"
                                onClick={() => setSelectedPrompt(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-[#0a0e1a] rounded-xl p-4 mb-6 relative">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                                {selectedPrompt.prompt}
                            </pre>
                            <button
                                onClick={() => copyPrompt(selectedPrompt)}
                                className="absolute top-3 right-3 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm hover:bg-cyan-500/30 transition-colors"
                            >
                                {copiedId === selectedPrompt.id ? '✓ Copied!' : 'Copy'}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {selectedPrompt.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => copyPrompt(selectedPrompt)}
                                className="btn-primary flex-1"
                            >
                                {copiedId === selectedPrompt.id ? '✓ Copied!' : 'Copy Prompt'}
                            </button>
                            <Link href="/chat" className="btn-outline flex-1 text-center">
                                Try in Chat →
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
