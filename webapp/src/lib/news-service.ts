/**
 * News Aggregator Service
 * Fetches from conservative sources + Minnesota local news
 * Includes fact-checking integration
 */

import { LUXRIG_BRIDGE_URL } from './utils';

// RSS Feed Sources - 100 Total
// Distribution: 60% Right (60), 25% Center (25), 15% Left (15)
export const NEWS_SOURCES = {
    // National Right-Leaning Sources (45)
    national: [
        // Priority Right Sources
        { id: 'daily-wire', name: 'The Daily Wire', rss: 'https://www.dailywire.com/feeds/rss.xml', logo: '📰', bias: 'right', category: 'national', priority: true },
        { id: 'federalist', name: 'The Federalist', rss: 'https://thefederalist.com/feed/', logo: '🦅', bias: 'right', category: 'national', priority: true },
        { id: 'breitbart', name: 'Breitbart', rss: 'https://feeds.feedburner.com/breitbart', logo: '🔥', bias: 'right', category: 'national', priority: true },
        { id: 'fox-news', name: 'Fox News', rss: 'https://moxie.foxnews.com/google-publisher/latest.xml', logo: '🦊', bias: 'right', category: 'national', priority: true },
        { id: 'the-blaze', name: 'The Blaze', rss: 'https://www.theblaze.com/feeds/feed.rss', logo: '🔥', bias: 'right', category: 'national', priority: true },
        { id: 'daily-caller', name: 'Daily Caller', rss: 'https://dailycaller.com/feed/', logo: '📢', bias: 'right', category: 'national', priority: true },
        { id: 'epoch-times', name: 'Epoch Times', rss: 'https://www.theepochtimes.com/c-us/feed', logo: '🌅', bias: 'right', category: 'national', priority: true },
        { id: 'newsmax', name: 'Newsmax', rss: 'https://www.newsmax.com/rss/Politics/1/', logo: '📺', bias: 'right', category: 'national', priority: true },
        { id: 'oann', name: 'OAN', rss: 'https://www.oann.com/feed/', logo: '🎯', bias: 'right', category: 'national' },
        { id: 'townhall', name: 'Townhall', rss: 'https://townhall.com/rss/news/', logo: '🏛️', bias: 'right', category: 'national' },
        // Right-Center Sources
        { id: 'washington-times', name: 'Washington Times', rss: 'https://www.washingtontimes.com/rss/headlines/news/', logo: '🏛️', bias: 'right-center', category: 'national' },
        { id: 'nypost', name: 'New York Post', rss: 'https://nypost.com/feed/', logo: '🗽', bias: 'right-center', category: 'national' },
        { id: 'washington-examiner', name: 'Washington Examiner', rss: 'https://www.washingtonexaminer.com/feed', logo: '🔍', bias: 'right-center', category: 'national' },
        { id: 'national-review', name: 'National Review', rss: 'https://www.nationalreview.com/feed/', logo: '📘', bias: 'right-center', category: 'national' },
        { id: 'weekly-standard', name: 'The Dispatch', rss: 'https://thedispatch.com/feed/', logo: '📰', bias: 'right-center', category: 'national' },
        { id: 'american-spectator', name: 'American Spectator', rss: 'https://spectator.org/feed/', logo: '🇺🇸', bias: 'right', category: 'national' },
        { id: 'hot-air', name: 'Hot Air', rss: 'https://hotair.com/feed/', logo: '🔥', bias: 'right', category: 'national' },
        { id: 'pj-media', name: 'PJ Media', rss: 'https://pjmedia.com/feed/', logo: '📝', bias: 'right', category: 'national' },
        { id: 'red-state', name: 'RedState', rss: 'https://redstate.com/feed/', logo: '🔴', bias: 'right', category: 'national' },
        { id: 'twitchy', name: 'Twitchy', rss: 'https://twitchy.com/feed/', logo: '🐦', bias: 'right', category: 'national' },
        { id: 'legal-insurrection', name: 'Legal Insurrection', rss: 'https://legalinsurrection.com/feed/', logo: '⚖️', bias: 'right', category: 'national' },
        { id: 'power-line', name: 'Power Line', rss: 'https://www.powerlineblog.com/feed', logo: '⚡', bias: 'right', category: 'national' },
        { id: 'instapundit', name: 'Instapundit', rss: 'https://pjmedia.com/instapundit/feed/', logo: '📌', bias: 'right', category: 'national' },
        { id: 'american-thinker', name: 'American Thinker', rss: 'https://www.americanthinker.com/rss/all_articles.rss', logo: '💭', bias: 'right', category: 'national' },
        { id: 'frontpage-mag', name: 'FrontPage Mag', rss: 'https://www.frontpagemag.com/feed/', logo: '📰', bias: 'right', category: 'national' },
        { id: 'cnsnews', name: 'CNS News', rss: 'https://cnsnews.com/rss.xml', logo: '📺', bias: 'right', category: 'national' },
        { id: 'wnd', name: 'WND', rss: 'https://www.wnd.com/feed/', logo: '🌐', bias: 'right', category: 'national' },
        { id: 'just-the-news', name: 'Just The News', rss: 'https://justthenews.com/rss.xml', logo: '📰', bias: 'right', category: 'national' },
        { id: 'free-beacon', name: 'Free Beacon', rss: 'https://freebeacon.com/feed/', logo: '🔔', bias: 'right', category: 'national' },
        { id: 'washington-free-beacon', name: 'Washington Free Beacon', rss: 'https://freebeacon.com/feed/', logo: '🔔', bias: 'right', category: 'national' },
        { id: 'conservative-review', name: 'Conservative Review', rss: 'https://www.conservativereview.com/feed', logo: '📖', bias: 'right', category: 'national' },
        { id: 'daily-signal', name: 'Daily Signal', rss: 'https://www.dailysignal.com/feed/', logo: '📡', bias: 'right', category: 'national' },
        { id: 'american-conservative', name: 'American Conservative', rss: 'https://www.theamericanconservative.com/feed/', logo: '🦅', bias: 'right', category: 'national' },
        { id: 'new-york-sun', name: 'New York Sun', rss: 'https://www.nysun.com/feed', logo: '☀️', bias: 'right-center', category: 'national' },
        { id: 'fox-business', name: 'Fox Business', rss: 'https://moxie.foxbusiness.com/google-publisher/latest.xml', logo: '💼', bias: 'right', category: 'national' },
        { id: 'reason', name: 'Reason', rss: 'https://reason.com/feed/', logo: '🎯', bias: 'right-libertarian', category: 'national' },
        { id: 'cato', name: 'Cato Institute', rss: 'https://www.cato.org/rss/recent-content', logo: '🏛️', bias: 'right-libertarian', category: 'national' },
        { id: 'heritage', name: 'Heritage Foundation', rss: 'https://www.heritage.org/rss/all-commentary', logo: '🏛️', bias: 'right', category: 'national' },
        { id: 'aei', name: 'AEI', rss: 'https://www.aei.org/feed/', logo: '🏛️', bias: 'right-center', category: 'national' },
        { id: 'manhattan-institute', name: 'Manhattan Institute', rss: 'https://www.manhattan-institute.org/feed', logo: '🗽', bias: 'right-center', category: 'national' },
        // Podcasts & Commentary
        { id: 'joe-rogan', name: 'Joe Rogan Experience', rss: 'https://feeds.megaphone.fm/WWO3519750118', logo: '🎙️', bias: 'right-libertarian', category: 'national', priority: true },
        { id: 'ben-shapiro', name: 'Ben Shapiro Show', rss: 'https://feeds.megaphone.fm/WWO3519750135', logo: '🎙️', bias: 'right', category: 'national' },
        { id: 'dan-bongino', name: 'Dan Bongino Show', rss: 'https://feeds.megaphone.fm/LSMRDI9852556846', logo: '🎙️', bias: 'right', category: 'national' },
        { id: 'charlie-kirk', name: 'Charlie Kirk Show', rss: 'https://feeds.megaphone.fm/charlie-kirk', logo: '🎙️', bias: 'right', category: 'national' },
        { id: 'michael-knowles', name: 'Michael Knowles Show', rss: 'https://feeds.megaphone.fm/WWO3519750139', logo: '🎙️', bias: 'right', category: 'national' }
    ],

    // Minneapolis/St. Paul Local (20)
    local: [
        // Priority Minnesota Conservative
        { id: 'alpha-news', name: 'Alpha News MN', rss: 'https://alphanewsmn.com/feed/', logo: '🐺', bias: 'right', category: 'local', region: 'minnesota', priority: true },
        { id: 'walter-hudson', name: 'Walter Hudson', rss: 'https://walterhudson.substack.com/feed', logo: '✍️', bias: 'right', category: 'local', region: 'minnesota', priority: true },
        { id: 'mn-reformer', name: 'MN Reformer', rss: 'https://minnesotareformer.com/feed/', logo: '📰', bias: 'center-left', category: 'local', region: 'minnesota' },
        // Center Local News
        { id: 'bring-me-the-news', name: 'Bring Me The News', rss: 'https://bringmethenews.com/feed', logo: '📰', bias: 'center', category: 'local', region: 'minnesota', priority: true },
        { id: 'pioneer-press', name: 'Pioneer Press', rss: 'https://www.twincities.com/feed/', logo: '📜', bias: 'center', category: 'local', region: 'st-paul' },
        { id: 'kare11', name: 'KARE 11', rss: 'https://www.kare11.com/feeds/syndication/rss/news/local', logo: '📺', bias: 'center', category: 'local', region: 'twin-cities' },
        { id: 'kstp', name: 'KSTP 5', rss: 'https://kstp.com/feed/', logo: '📡', bias: 'center', category: 'local', region: 'twin-cities' },
        { id: 'fox9', name: 'FOX 9', rss: 'https://www.fox9.com/rss.xml', logo: '🦊', bias: 'center-right', category: 'local', region: 'twin-cities' },
        { id: 'wcco', name: 'WCCO CBS', rss: 'https://www.cbsnews.com/minnesota/feed/', logo: '📺', bias: 'center', category: 'local', region: 'twin-cities' },
        { id: 'star-tribune', name: 'Star Tribune', rss: 'https://www.startribune.com/local/index.rss2', logo: '⭐', bias: 'center-left', category: 'local', region: 'minneapolis' },
        { id: 'mpr-news', name: 'MPR News', rss: 'https://www.mprnews.org/rss/all-stories', logo: '🎙️', bias: 'center-left', category: 'local', region: 'minnesota' },
        { id: 'minnpost', name: 'MinnPost', rss: 'https://www.minnpost.com/feed/', logo: '📰', bias: 'center-left', category: 'local', region: 'minnesota' },
        // Regional
        { id: 'duluth-news', name: 'Duluth News Tribune', rss: 'https://www.duluthnewstribune.com/rss/', logo: '🌲', bias: 'center', category: 'local', region: 'duluth' },
        { id: 'rochester-post', name: 'Rochester Post Bulletin', rss: 'https://www.postbulletin.com/rss/', logo: '🏥', bias: 'center', category: 'local', region: 'rochester' },
        { id: 'st-cloud-times', name: 'St Cloud Times', rss: 'https://www.sctimes.com/rss/', logo: '📰', bias: 'center', category: 'local', region: 'st-cloud' },
        { id: 'mankato-free-press', name: 'Mankato Free Press', rss: 'https://www.mankatofreepress.com/rss/', logo: '📰', bias: 'center', category: 'local', region: 'mankato' },
        { id: 'forum-news', name: 'Forum News', rss: 'https://www.inforum.com/rss/', logo: '📰', bias: 'center', category: 'local', region: 'fargo-moorhead' },
        { id: 'southwest-news', name: 'Southwest News Media', rss: 'https://www.swnewsmedia.com/rss/', logo: '📰', bias: 'center', category: 'local', region: 'eden-prairie' },
        { id: 'sun-sailor', name: 'Sun Sailor', rss: 'https://www.hometownsource.com/sun_sailor/rss/', logo: '⛵', bias: 'center', category: 'local', region: 'wayzata' },
        { id: 'minnesota-daily', name: 'Minnesota Daily', rss: 'https://mndaily.com/feed/', logo: '🎓', bias: 'center-left', category: 'local', region: 'U of M' }
    ],

    // Alternative / Independent (15) - More Right-Leaning
    alternative: [
        { id: 'gateway-pundit', name: 'Gateway Pundit', rss: 'https://www.thegatewaypundit.com/feed/', logo: '🚪', bias: 'far-right', category: 'alternative' },
        { id: 'zero-hedge', name: 'Zero Hedge', rss: 'https://feeds.feedburner.com/zerohedge/feed', logo: '📊', bias: 'right-libertarian', category: 'alternative' },
        { id: 'revolver-news', name: 'Revolver News', rss: 'https://www.revolver.news/feed/', logo: '🔫', bias: 'right', category: 'alternative' },
        { id: 'substack-bari', name: 'The Free Press (Bari Weiss)', rss: 'https://www.thefp.com/feed', logo: '✍️', bias: 'center-right', category: 'alternative' },
        { id: 'taibbi-racket', name: 'Racket (Matt Taibbi)', rss: 'https://www.racket.news/feed', logo: '✍️', bias: 'center', category: 'alternative' },
        { id: 'glenn-greenwald', name: 'Glenn Greenwald', rss: 'https://greenwald.substack.com/feed', logo: '✍️', bias: 'center', category: 'alternative' },
        { id: 'post-millennial', name: 'The Post Millennial', rss: 'https://thepostmillennial.com/feed/', logo: '📰', bias: 'right', category: 'alternative' },
        { id: 'real-clear', name: 'RealClearPolitics', rss: 'https://www.realclearpolitics.com/index.xml', logo: '📊', bias: 'center', category: 'alternative' },
        { id: 'ground-news', name: 'Ground News', rss: 'https://ground.news/rss', logo: '🌍', bias: 'center', category: 'alternative' },
        { id: 'quilette', name: 'Quillette', rss: 'https://quillette.com/feed/', logo: '🪶', bias: 'center-right', category: 'alternative' },
        { id: 'unherd', name: 'UnHerd', rss: 'https://unherd.com/feed/', logo: '🐑', bias: 'center-right', category: 'alternative' },
        { id: 'tablet', name: 'Tablet Magazine', rss: 'https://www.tabletmag.com/feed', logo: '📱', bias: 'center', category: 'alternative' },
        { id: 'common-sense', name: 'Common Sense', rss: 'https://www.commonsense.news/feed', logo: '💡', bias: 'center', category: 'alternative' },
        { id: 'persuasion', name: 'Persuasion', rss: 'https://www.persuasion.community/feed', logo: '💬', bias: 'center', category: 'alternative' },
        { id: 'semafor', name: 'Semafor', rss: 'https://www.semafor.com/feed', logo: '🚦', bias: 'center', category: 'alternative' },
        { id: 'infowars', name: 'InfoWars', rss: 'https://www.infowars.com/rss.xml', logo: '👁️', bias: 'far-right', category: 'alternative' },
        { id: 'banned-video', name: 'Banned.Video', rss: 'https://api.banned.video/rss/channels/5b92a1e6568f22455f55be2b', logo: '🎥', bias: 'far-right', category: 'alternative' }
    ],

    // Center Sources (10) - Wire Services & Mainstream
    center: [
        { id: 'ap-news', name: 'Associated Press', rss: 'https://rsshub.app/apnews/topics/apf-topnews', logo: '📡', bias: 'center', category: 'center' },
        { id: 'reuters', name: 'Reuters', rss: 'https://www.reutersagency.com/feed/', logo: '🌐', bias: 'center', category: 'center' },
        { id: 'bbc', name: 'BBC News', rss: 'https://feeds.bbci.co.uk/news/rss.xml', logo: '🇬🇧', bias: 'center', category: 'center' },
        { id: 'christian-science', name: 'Christian Science Monitor', rss: 'https://www.csmonitor.com/layout/set/rss/RSS', logo: '✝️', bias: 'center', category: 'center' },
        { id: 'pbs', name: 'PBS NewsHour', rss: 'https://www.pbs.org/newshour/feeds/rss/headlines', logo: '📺', bias: 'center', category: 'center' },
        { id: 'npr', name: 'NPR', rss: 'https://feeds.npr.org/1001/rss.xml', logo: '🎙️', bias: 'center-left', category: 'center' },
        { id: 'abc-news', name: 'ABC News', rss: 'https://abcnews.go.com/abcnews/topstories', logo: '📺', bias: 'center', category: 'center' },
        { id: 'cbs-news', name: 'CBS News', rss: 'https://www.cbsnews.com/latest/rss/main', logo: '📺', bias: 'center', category: 'center' },
        { id: 'nbc-news', name: 'NBC News', rss: 'https://feeds.nbcnews.com/nbcnews/public/news', logo: '📺', bias: 'center-left', category: 'center' },
        { id: 'usa-today', name: 'USA Today', rss: 'https://rssfeeds.usatoday.com/usatoday-NewsTopStories', logo: '🇺🇸', bias: 'center', category: 'center' }
    ],

    // Left-Leaning Sources (10) - For Balance Awareness
    left: [
        { id: 'cnn', name: 'CNN', rss: 'http://rss.cnn.com/rss/cnn_topstories.rss', logo: '📺', bias: 'left', category: 'left' },
        { id: 'msnbc', name: 'MSNBC', rss: 'https://www.msnbc.com/feeds/latest', logo: '📺', bias: 'left', category: 'left' },
        { id: 'washington-post', name: 'Washington Post', rss: 'https://feeds.washingtonpost.com/rss/politics', logo: '📰', bias: 'left-center', category: 'left' },
        { id: 'nytimes', name: 'New York Times', rss: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', logo: '📰', bias: 'left-center', category: 'left' },
        { id: 'politico', name: 'Politico', rss: 'https://www.politico.com/rss/politicopicks.xml', logo: '🏛️', bias: 'left-center', category: 'left' },
        { id: 'the-hill', name: 'The Hill', rss: 'https://thehill.com/feed/', logo: '🏛️', bias: 'center-left', category: 'left' },
        { id: 'atlantic', name: 'The Atlantic', rss: 'https://www.theatlantic.com/feed/all/', logo: '🌊', bias: 'left-center', category: 'left' },
        { id: 'vox', name: 'Vox', rss: 'https://www.vox.com/rss/index.xml', logo: '📰', bias: 'left', category: 'left' },
        { id: 'huffpost', name: 'HuffPost', rss: 'https://www.huffpost.com/section/front-page/feed', logo: '📰', bias: 'left', category: 'left' },
        { id: 'slate', name: 'Slate', rss: 'https://slate.com/feeds/all.rss', logo: '📰', bias: 'left', category: 'left' }
    ]
};

// Bias Legend
export const BIAS_COLORS = {
    'far-right': { bg: 'bg-red-600', text: 'text-red-400', label: 'Far Right' },
    'right': { bg: 'bg-red-500', text: 'text-red-300', label: 'Right' },
    'right-center': { bg: 'bg-orange-500', text: 'text-orange-300', label: 'Right-Center' },
    'right-libertarian': { bg: 'bg-yellow-500', text: 'text-yellow-300', label: 'Libertarian' },
    'center-right': { bg: 'bg-amber-500', text: 'text-amber-300', label: 'Center-Right' },
    'center': { bg: 'bg-gray-500', text: 'text-gray-300', label: 'Center' },
    'center-left': { bg: 'bg-blue-400', text: 'text-blue-300', label: 'Center-Left' },
    'left-center': { bg: 'bg-blue-500', text: 'text-blue-300', label: 'Left-Center' },
    'left': { bg: 'bg-blue-600', text: 'text-blue-400', label: 'Left' },
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
    category: 'national' | 'local' | 'alternative' | 'center' | 'left';
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

/**
 * Subject Radar Tracking
 */
export interface SubjectTracker {
    id: string;
    keyword: string;
    color: string;
    lastCount: number;
}

export function countTrackerMatches(articles: NewsArticle[], trackers: SubjectTracker[]): SubjectTracker[] {
    return trackers.map(tracker => {
        const keyword = tracker.keyword.toLowerCase();
        const count = articles.filter(a =>
            (a.title && a.title.toLowerCase().includes(keyword)) ||
            (a.description && a.description.toLowerCase().includes(keyword))
        ).length;
        return { ...tracker, lastCount: count };
    });
}
