import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { NewsItem } from '../../../types/dashboard';
import { SAMPLE_NEWS } from '../../../config/dashboardConfig';
import { fetchAllNews } from '../../../services/newsService';

export function NewsWidget() {
    const [news, setNews] = useState<NewsItem[]>(SAMPLE_NEWS);
    const [loadingNews, setLoadingNews] = useState(true);

    useEffect(() => {
        fetchDashboardNews();
    }, []);

    function getTimeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        if (hrs < 1) return 'Just now';
        if (hrs > 24) return `${Math.floor(hrs / 24)}d ago`;
        return `${hrs}h ago`;
    }

    async function fetchDashboardNews() {
        try {
            const allArticles = await fetchAllNews();
            const combined = allArticles
                .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
                .slice(0, 5)
                .map(item => ({
                    title: item.title,
                    source: item.source.name || 'Unknown',
                    time: getTimeAgo(item.pubDate),
                    link: item.link
                }));
            if (combined.length > 0) setNews(combined);
        } catch { } finally { setLoadingNews(false); }
    }

    return (
        <div className="flex flex-col h-[60%] overflow-y-auto pr-1">
            {loadingNews ? (
                <div className="text-gray-500 text-sm animate-pulse flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin"/> Loading feeds...
                </div>
            ) : (
                news.map((item: NewsItem, i: number) => (
                    <div key={i} className="border-b border-white/5 last:border-0 pb-3 mb-3 last:pb-0 last:mb-0">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="group block">
                            <p className="text-sm font-medium group-hover:text-cyan-400 transition-colors line-clamp-2 text-white/90">{item.title}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-1.5 flex justify-between">
                                <span className="text-white/40">{item.source}</span><span className="font-mono">{item.time}</span>
                            </p>
                        </a>
                    </div>
                ))
            )}
            <Link to="/news" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest mt-auto pt-2 block w-max mt-4">Open Neural News &rarr;</Link>
        </div>
    );
}
