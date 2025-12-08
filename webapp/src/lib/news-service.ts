/**
 * News Aggregator Service
 * Fetches from conservative sources + Minnesota local news
 * Includes fact-checking integration
 */

import { LUXRIG_BRIDGE_URL } from './utils';

// RSS Feed Sources
export const NEWS_SOURCES = {
    // National Conservative Sources
    national: [
        {
            id: 'daily-wire',
            name: 'The Daily Wire',
            rss: 'https://www.dailywire.com/feeds/rss.xml',
            logo: '📰',
            bias: 'right',
            category: 'national'
        },
        {
            id: 'federalist',
            name: 'The Federalist',
            rss: 'https://thefederalist.com/feed/',
            logo: '🦅',
            bias: 'right',
            category: 'national'
        },
        {
            id: 'breitbart',
            name: 'Breitbart',
            rss: 'https://feeds.feedburner.com/breitbart',
            logo: '🔥',
            bias: 'right',
            category: 'national'
        },
        {
            id: 'washington-times',
            name: 'Washington Times',
            rss: 'https://www.washingtontimes.com/rss/headlines/news/',
            logo: '🏛️',
            bias: 'right-center',
            category: 'national'
        },
        {
            id: 'nypost',
            name: 'New York Post',
            rss: 'https://nypost.com/feed/',
            logo: '🗽',
            bias: 'right-center',
            category: 'national'
        },
        {
            id: 'fox-news',
            name: 'Fox News',
            rss: 'https://moxie.foxnews.com/google-publisher/latest.xml',
            logo: '🦊',
            bias: 'right',
            category: 'national'
        },
        {
            id: 'daily-caller',
            name: 'Daily Caller',
            rss: 'https://dailycaller.com/feed/',
            logo: '📢',
            bias: 'right',
            category: 'national'
        },
        {
            id: 'epoch-times',
            name: 'Epoch Times',
            rss: 'https://www.theepochtimes.com/c-us/feed',
            logo: '🌅',
            bias: 'right',
            category: 'national'
        },
        {
            id: 'the-blaze',
            name: 'The Blaze (Glenn Beck)',
            rss: 'https://www.theblaze.com/feeds/feed.rss',
            logo: '🔥',
            bias: 'right',
            category: 'national',
            priority: true
        },
        {
            id: 'joe-rogan',
            name: 'Joe Rogan Experience',
            rss: 'https://feeds.megaphone.fm/WWO3519750118',
            logo: '🎙️',
            bias: 'right-libertarian',
            category: 'national',
            priority: true,
            note: 'Podcast episodes'
        }
    ],

    // Minneapolis/St. Paul Local
    local: [
        {
            id: 'alpha-news',
            name: 'Alpha News MN',
            rss: 'https://alphanewsmn.com/feed/',
            logo: '🐺',
            bias: 'right',
            category: 'local',
            region: 'minnesota',
            priority: true
        },
        {
            id: 'bring-me-the-news',
            name: 'Bring Me The News',
            rss: 'https://bringmethenews.com/feed',
            logo: '📰',
            bias: 'center',
            category: 'local',
            region: 'minnesota',
            priority: true
        },
        {
            id: 'walter-hudson',
            name: 'Walter Hudson',
            rss: 'https://walterhudson.substack.com/feed',
            logo: '✍️',
            bias: 'right',
            category: 'local',
            region: 'minnesota',
            priority: true,
            note: 'MN Conservative Commentary'
        },
        {
            id: 'star-tribune',
            name: 'Star Tribune',
            rss: 'https://www.startribune.com/local/index.rss2',
            logo: '⭐',
            bias: 'center-left',
            category: 'local',
            region: 'minneapolis'
        },
        {
            id: 'pioneer-press',
            name: 'Pioneer Press',
            rss: 'https://www.twincities.com/feed/',
            logo: '📜',
            bias: 'center',
            category: 'local',
            region: 'st-paul'
        },
        {
            id: 'kare11',
            name: 'KARE 11',
            rss: 'https://www.kare11.com/feeds/syndication/rss/news/local',
            logo: '📺',
            bias: 'center',
            category: 'local',
            region: 'twin-cities'
        },
        {
            id: 'fox9',
            name: 'FOX 9',
            rss: 'https://www.fox9.com/rss.xml',
            logo: '🦊',
            bias: 'center-right',
            category: 'local',
            region: 'twin-cities'
        },
        {
            id: 'kstp',
            name: 'KSTP 5',
            rss: 'https://kstp.com/feed/',
            logo: '📡',
            bias: 'center',
            category: 'local',
            region: 'twin-cities'
        },
        {
            id: 'mpr-news',
            name: 'MPR News',
            rss: 'https://www.mprnews.org/rss/all-stories',
            logo: '🎙️',
            bias: 'center-left',
            category: 'local',
            region: 'minnesota'
        }
    ],

    // Independent / Alternative
    alternative: [
        {
            id: 'gateway-pundit',
            name: 'Gateway Pundit',
            rss: 'https://www.thegatewaypundit.com/feed/',
            logo: '🚪',
            bias: 'far-right',
            category: 'alternative',
            note: 'Often disputed claims'
        },
        {
            id: 'zero-hedge',
            name: 'Zero Hedge',
            rss: 'https://feeds.feedburner.com/zerohedge/feed',
            logo: '📊',
            bias: 'right-libertarian',
            category: 'alternative',
            note: 'Finance focused'
        },
        {
            id: 'revolver-news',
            name: 'Revolver News',
            rss: 'https://www.revolver.news/feed/',
            logo: '🔫',
            bias: 'right',
            category: 'alternative'
        }
    ]
};

// Bias Legend
export const BIAS_COLORS = {
    'far-right': { bg: 'bg-red-600', text: 'text-red-400', label: 'Far Right' },
    'right': { bg: 'bg-red-500', text: 'text-red-300', label: 'Right' },
    'right-center': { bg: 'bg-orange-500', text: 'text-orange-300', label: 'Right-Center' },
    'center': { bg: 'bg-gray-500', text: 'text-gray-300', label: 'Center' },
    'center-left': { bg: 'bg-blue-400', text: 'text-blue-300', label: 'Center-Left' },
    'right-libertarian': { bg: 'bg-yellow-500', text: 'text-yellow-300', label: 'Libertarian' }
};

// Article interface
export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    link: string;
    pubDate: string;
    source: {
        id: string;
        name: string;
        logo: string;
        bias: string;
    };
    category: 'national' | 'local' | 'alternative';
    region?: string;
    factCheck?: {
        status: 'verified' | 'disputed' | 'unverified' | 'mixed';
        claims?: string[];
        sources?: string[];
    };
    saved?: boolean;
    read?: boolean;
}

/**
 * Parse RSS feed to JSON
 */
export async function parseRSSFeed(url: string): Promise<any[]> {
    try {
        // Use a CORS proxy for client-side fetching
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items) {
            return data.items;
        }
        return [];
    } catch (error) {
        console.error(`Failed to fetch RSS from ${url}:`, error);
        return [];
    }
}

/**
 * Fetch all news from configured sources
 */
/**
 * Fetch all news from Bridge
 */
export async function fetchAllNews(filters: { category?: string; region?: string; limit?: number } = {}): Promise<NewsArticle[]> {
    try {
        const query = new URLSearchParams();
        if (filters.category) query.append('category', filters.category);
        if (filters.region) query.append('region', filters.region);
        if (filters.limit) query.append('limit', filters.limit.toString());

        const response = await fetch(`${LUXRIG_BRIDGE_URL}/news?${query.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch news from Bridge');

        const articles = await response.json();
        return articles;
    } catch (error) {
        console.error("News fetch error:", error);
        return [];
    }
}

/**
 * Trigger backend news refresh
 */
export async function refreshNewsSources(): Promise<{ count: number }> {
    try {
        const response = await fetch(`${LUXRIG_BRIDGE_URL}/news/refresh`, { method: 'POST' });
        if (!response.ok) throw new Error('Refresh failed');
        return await response.json();
    } catch (error) {
        console.error("News refresh error:", error);
        return { count: 0 };
    }
}

/**
 * Check claims against Google Fact Check API
 * Note: Requires API key
 */
export async function checkClaim(claim: string, apiKey?: string): Promise<any> {
    if (!apiKey) {
        return { status: 'unverified', message: 'No API key configured' };
    }

    try {
        const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(claim)}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.claims && data.claims.length > 0) {
            const reviews = data.claims.map((c: any) => ({
                claim: c.text,
                claimant: c.claimant,
                reviews: c.claimReview?.map((r: any) => ({
                    publisher: r.publisher?.name,
                    rating: r.textualRating,
                    url: r.url
                }))
            }));

            return {
                status: 'reviewed',
                claims: reviews
            };
        }

        return { status: 'no-results', message: 'No fact-checks found for this claim' };
    } catch (error) {
        console.error('Fact check error:', error);
        return { status: 'error', message: 'Failed to check claim' };
    }
}

/**
 * Local LLM-based fact check using your models
 */
export async function localFactCheck(title: string, content: string): Promise<any> {
    // This would call your local LLM endpoint
    const prompt = `Analyze this news headline for potential bias, misleading claims, or factual concerns:

Title: ${title}
Content: ${content}

Respond with:
1. Bias level (1-10, 10 being extremely biased)
2. Factual concerns (list any claims that may need verification)
3. Missing context (what information might be omitted)
4. Recommendation (verified/disputed/needs-context/unverified)`;

    try {
        const response = await fetch(`${LUXRIG_BRIDGE_URL}/chat/simple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (response.ok) {
            const data = await response.json();
            return {
                status: 'analyzed',
                analysis: data.reply
            };
        }
    } catch (error) {
        console.error('Local fact check failed:', error);
    }

    return { status: 'unverified' };
}

// Search keywords for Minnesota/Minneapolis focus
export const MN_KEYWORDS = [
    'minneapolis', 'minnesota', 'st. paul', 'saint paul',
    'twin cities', 'hennepin', 'ramsey county', 'duluth',
    'bloomington mn', 'rochester mn', 'walz', 'ellison',
    'u of m', 'gophers', 'vikings', 'twins', 'timberwolves',
    'target center', 'mall of america', 'msp airport'
];

/**
 * Filter articles for Minnesota relevance
 */
export function filterMinnesotaNews(articles: NewsArticle[]): NewsArticle[] {
    return articles.filter(article => {
        const text = `${article.title} ${article.description}`.toLowerCase();
        return MN_KEYWORDS.some(keyword => text.includes(keyword));
    });
}
