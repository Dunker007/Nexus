import { Router } from 'express';
import { getPrisma } from '../db.js';
import Parser from 'rss-parser';

export const newsRouter = Router();
const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media:content'],
            ['media:thumbnail', 'media:thumbnail'],
            ['content:encoded', 'content:encoded'],
        ]
    }
});

const NEWS_SOURCES = {
  national: [
      { id: 'daily-wire', name: 'The Daily Wire', rss: 'https://www.dailywire.com/feeds/rss.xml', logo: '📰', bias: 'right', category: 'national', priority: true },
      { id: 'federalist', name: 'The Federalist', rss: 'https://thefederalist.com/feed/', logo: '🦅', bias: 'right', category: 'national', priority: true },
      { id: 'breitbart', name: 'Breitbart', rss: 'https://feeds.feedburner.com/breitbart', logo: '🔥', bias: 'right', category: 'national', priority: true },
      { id: 'fox-news', name: 'Fox News', rss: 'https://moxie.foxnews.com/google-publisher/latest.xml', logo: '🦊', bias: 'right', category: 'national', priority: true },
      { id: 'the-blaze', name: 'The Blaze', rss: 'https://www.theblaze.com/feeds/feed.rss', logo: '🔥', bias: 'right', category: 'national', priority: true },
      { id: 'daily-caller', name: 'Daily Caller', rss: 'https://dailycaller.com/feed/', logo: '📢', bias: 'right', category: 'national', priority: true },
      { id: 'epoch-times', name: 'Epoch Times', rss: 'https://www.theepochtimes.com/c-us/feed', logo: '🌅', bias: 'right', category: 'national', priority: true },
      { id: 'newsmax', name: 'Newsmax', rss: 'https://www.newsmax.com/rss/Politics/1/', logo: '📺', bias: 'right', category: 'national', priority: true },
      { id: 'washington-times', name: 'Washington Times', rss: 'https://www.washingtontimes.com/rss/headlines/news/', logo: '🏛️', bias: 'right-center', category: 'national' },
      { id: 'nypost', name: 'New York Post', rss: 'https://nypost.com/feed/', logo: '🗽', bias: 'right-center', category: 'national' },
      { id: 'washington-examiner', name: 'Washington Examiner', rss: 'https://www.washingtonexaminer.com/feed', logo: '🔍', bias: 'right-center', category: 'national' },
      { id: 'joe-rogan', name: 'Joe Rogan Experience', rss: 'https://feeds.megaphone.fm/WWO3519750118', logo: '🎙️', bias: 'right-libertarian', category: 'national', priority: true },
  ],
  local: [
      { id: 'alpha-news', name: 'Alpha News MN', rss: 'https://alphanewsmn.com/feed/', logo: '🐺', bias: 'right', category: 'local', region: 'minnesota', priority: true },
      { id: 'walter-hudson', name: 'Walter Hudson', rss: 'https://walterhudson.substack.com/feed', logo: '✍️', bias: 'right', category: 'local', region: 'minnesota', priority: true },
      { id: 'mn-reformer', name: 'MN Reformer', rss: 'https://minnesotareformer.com/feed/', logo: '📰', bias: 'center-left', category: 'local', region: 'minnesota' },
      { id: 'bring-me-the-news', name: 'Bring Me The News', rss: 'https://bringmethenews.com/feed', logo: '📰', bias: 'center', category: 'local', region: 'minnesota', priority: true },
      { id: 'star-tribune', name: 'Star Tribune', rss: 'https://www.startribune.com/local/index.rss2', logo: '⭐', bias: 'center-left', category: 'local', region: 'minneapolis' },
  ],
  alternative: [
      { id: 'gateway-pundit', name: 'Gateway Pundit', rss: 'https://www.thegatewaypundit.com/feed/', logo: '🚪', bias: 'far-right', category: 'alternative' },
      { id: 'zero-hedge', name: 'Zero Hedge', rss: 'https://feeds.feedburner.com/zerohedge/feed', logo: '📊', bias: 'right-libertarian', category: 'alternative' },
      { id: 'revolver-news', name: 'Revolver News', rss: 'https://www.revolver.news/feed/', logo: '🔫', bias: 'right', category: 'alternative' },
      { id: 'infowars', name: 'InfoWars', rss: 'https://www.infowars.com/rss.xml', logo: '👁️', bias: 'far-right', category: 'alternative' },
      { id: 'banned-video', name: 'Banned.Video', rss: 'https://api.banned.video/rss/channels/5b92a1e6568f22455f55be2b', logo: '🎥', bias: 'far-right', category: 'alternative' }
  ],
  center: [
      { id: 'ap-news', name: 'Associated Press', rss: 'https://rsshub.app/apnews/topics/apf-topnews', logo: '📡', bias: 'center', category: 'center' },
      { id: 'reuters', name: 'Reuters', rss: 'https://www.reutersagency.com/feed/', logo: '🌐', bias: 'center', category: 'center' },
  ],
  left: [
      { id: 'cnn', name: 'CNN', rss: 'http://rss.cnn.com/rss/cnn_topstories.rss', logo: '📺', bias: 'left', category: 'left' },
      { id: 'nytimes', name: 'New York Times', rss: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', logo: '📰', bias: 'left-center', category: 'left' },
  ]
};

// Helper to map DB row to Frontend Article
function mapRow(row: any) {
    return {
        id: row.id,
        title: row.title,
        description: row.summary,
        link: row.url,
        pubDate: row.time,
        image: row.image || null,
        source: {
            id: row.source.toLowerCase().replace(/\s+/g, '-'),
            name: row.source,
            logo: row.impact, // Using impact field as logo for now
            bias: row.bias
        },
        category: row.type || 'national',
        priority: row.feed === 'priority'
    };
}

// Extract best available image from an RSS item
function extractImage(item: any): string | null {
    // Standard RSS enclosure
    if (item.enclosure?.url) {
        const url = decodeURIComponent(item.enclosure.url);
        if (/\.(jpg|jpeg|png|webp|gif)/i.test(url)) return url;
    }
    // media:content
    const mc = item['media:content'];
    if (mc) {
        const url = Array.isArray(mc) ? mc[0]?.['$']?.url : mc?.['$']?.url;
        if (url) return decodeURIComponent(url);
    }
    // media:thumbnail
    const mt = item['media:thumbnail'];
    if (mt) {
        const url = Array.isArray(mt) ? mt[0]?.['$']?.url : mt?.['$']?.url;
        if (url) return decodeURIComponent(url);
    }
    // itunes image
    if (item.itunes?.image) return item.itunes.image;
    // Scrape first <img> from content:encoded or content
    const html = item['content:encoded'] || item.content || '';
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1] && /^https?:\/\//.test(match[1])) return match[1];
    return null;
}

newsRouter.get('/', async (req, res) => {
  try {
    const rows = await getPrisma().news_items.findMany({
      orderBy: { created_at: 'desc' },
      take: 100
    });
    res.json(rows.map(mapRow));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

newsRouter.post('/refresh', async (req, res) => {
    const allFeeds = Object.values(NEWS_SOURCES).flat();

    // Respond immediately — run fetches in background
    res.json({ success: true, message: 'Refresh started', total: allFeeds.length });

    // Fetch all feeds in parallel with a 15s per-feed timeout
    const results = await Promise.allSettled(
        allFeeds.map(source =>
            parser.parseURL(source.rss).then(feedData => ({ source, feedData }))
        )
    );

    let addedCount = 0;
    for (const result of results) {
        if (result.status === 'rejected') {
            console.error(`[News] Feed failed:`, result.reason?.message || result.reason);
            continue;
        }
        const { source, feedData } = result.value;
        for (const item of feedData.items.slice(0, 10)) {
            const id = item.guid || item.link || Math.random().toString(36);
            const image = extractImage(item);
            try {
                const existing = await getPrisma().news_items.findUnique({ where: { id } });
                if (!existing) {
                    await getPrisma().news_items.create({
                        data: {
                            id,
                            title: item.title || 'No Title',
                            source: source.name,
                            type: source.category,
                            url: item.link || '',
                            summary: item.contentSnippet || (item as any).description || '',
                            bias: source.bias,
                            time: item.pubDate || new Date().toISOString(),
                            impact: source.logo,
                            feed: (source as any).priority ? 'priority' : 'nexus',
                            image
                        }
                    });
                    addedCount++;
                } else if (image && (!existing.image || existing.image === '')) {
                    await getPrisma().news_items.update({
                        where: { id },
                        data: { image }
                    });
                }
            } catch (e) { /* duplicate GUID or other error */ }
        }
    }
    console.log(`[News] Refresh complete — ${addedCount} items added from ${allFeeds.length} feeds`);
});

newsRouter.delete('/:id', async (req, res) => {
  try {
    await getPrisma().news_items.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
