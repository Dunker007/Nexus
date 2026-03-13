import { useState, useEffect } from 'react';
import { DEFAULT_QUICK_LINKS } from '../../../config/dashboardConfig';

export function QuickLinksWidget() {
    const [quickLinks, setQuickLinks] = useState(DEFAULT_QUICK_LINKS);

    useEffect(() => {
        const savedQuickLinks = localStorage.getItem('dashboard-quicklinks');
        if (savedQuickLinks) {
            try { setQuickLinks(JSON.parse(savedQuickLinks)); } catch { }
        }
    }, []);

    return (
        <div className="grid grid-cols-2 gap-2 h-full content-start border border-t-0 border-white/0">
            {quickLinks.map((link: { title: string; url: string; icon: string }, i: number) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-[#12121a] border border-white/5 hover:border-cyan-500/30 text-center group transition-all">
                    <div className="text-2xl group-hover:scale-110 transition-transform mb-1 opacity-80 group-hover:opacity-100">{link.icon}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-cyan-400 transition-colors truncate">{link.title}</div>
                </a>
            ))}
        </div>
    );
}
