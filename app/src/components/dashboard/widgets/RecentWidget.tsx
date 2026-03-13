import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function RecentWidget() {
    const [recentPages, setRecentPages] = useState<{ path: string; title: string; time: string }[]>([]);

    useEffect(() => {
        const savedRecent = localStorage.getItem('dashboard-recent');
        if (savedRecent) {
            try { setRecentPages(JSON.parse(savedRecent)); } catch { }
        }
    }, []);

    return (
        <div className="space-y-1.5 h-full overflow-y-auto">
            {recentPages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2 opacity-30">🧭</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">No activity yet</p>
                </div>
            ) : (
                recentPages.slice(0, 5).map((page, i) => (
                    <Link key={i} to={page.path} className="block p-2.5 rounded-lg bg-[#12121a] border border-white/5 hover:border-cyan-500/30 hover:bg-white/5 transition-colors group">
                        <div className="text-sm truncate text-white/80 group-hover:text-cyan-400 transition-colors font-medium">{page.title}</div>
                        <div className="text-[10px] font-mono mt-0.5 text-gray-500">{page.time}</div>
                    </Link>
                ))
            )}
        </div>
    );
}
