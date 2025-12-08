import Parser from 'rss-parser';
import { prisma as db } from './database.js';

const parser = new Parser();

const NEWS_SOURCES = {
    national: [
        { id: 'daily-wire', name: 'The Daily Wire', rss: 'https://www.dailywire.com/feeds/rss.xml', category: 'national' },
        { id: 'federalist', name: 'The Federalist', rss: 'https://thefederalist.com/feed/', category: 'national' },
        { id: 'breitbart', name: 'Breitbart', rss: 'https://feeds.feedburner.com/breitbart', category: 'national' },
        { id: 'washington-times', name: 'Washington Times', rss: 'https://www.washingtontimes.com/rss/headlines/news/', category: 'national' },
        { id: 'nypost', name: 'New York Post', rss: 'https://nypost.com/feed/', category: 'national' },
        { id: 'fox-news', name: 'Fox News', rss: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'national' },
        { id: 'daily-caller', name: 'Daily Caller', rss: 'https://dailycaller.com/feed/', category: 'national' },
        { id: 'epoch-times', name: 'Epoch Times', rss: 'https://www.theepochtimes.com/c-us/feed', category: 'national' },
        { id: 'the-blaze', name: 'The Blaze', rss: 'https://www.theblaze.com/feeds/feed.rss', category: 'national' },
        { id: 'joe-rogan', name: 'Joe Rogan Experience', rss: 'https://feeds.megaphone.fm/WWO3519750118', category: 'national' }
    ],
    local: [
        { id: 'alpha-news', name: 'Alpha News MN', rss: 'https://alphanewsmn.com/feed/', category: 'local', region: 'minnesota' },
        { id: 'bring-me-the-news', name: 'Bring Me The News', rss: 'https://bringmethenews.com/feed', category: 'local', region: 'minnesota' },
        { id: 'walter-hudson', name: 'Walter Hudson', rss: 'https://walterhudson.substack.com/feed', category: 'local', region: 'minnesota' },
        { id: 'star-tribune', name: 'Star Tribune', rss: 'https://www.startribune.com/local/index.rss2', category: 'local', region: 'minneapolis' },
        { id: 'pioneer-press', name: 'Pioneer Press', rss: 'https://www.twincities.com/feed/', category: 'local', region: 'st-paul' },
        { id: 'kare11', name: 'KARE 11', rss: 'https://www.kare11.com/feeds/syndication/rss/news/local', category: 'local', region: 'twin-cities' },
        { id: 'fox9', name: 'FOX 9', rss: 'https://www.fox9.com/rss.xml', category: 'local', region: 'twin-cities' },
        { id: 'kstp', name: 'KSTP 5', rss: 'https://kstp.com/feed/', category: 'local', region: 'twin-cities' },
        { id: 'mpr-news', name: 'MPR News', rss: 'https://www.mprnews.org/rss/all-stories', category: 'local', region: 'minnesota' }
    ],
    alternative: [
        { id: 'gateway-pundit', name: 'Gateway Pundit', rss: 'https://www.thegatewaypundit.com/feed/', category: 'alternative' },
        { id: 'zero-hedge', name: 'Zero Hedge', rss: 'https://feeds.feedburner.com/zerohedge/feed', category: 'alternative' },
        { id: 'revolver-news', name: 'Revolver News', rss: 'https://www.revolver.news/feed/', category: 'alternative' }
    ]
};

export class NewsService {
    constructor() { }

    /**
     * Fetch all news from sources and store in DB
     */
    async refreshNews() {
        console.log('[News] Starting news refresh...');
        const allSources = [
            ...NEWS_SOURCES.national,
            ...NEWS_SOURCES.local,
            ...NEWS_SOURCES.alternative
        ];

        let count = 0;

        // Process in chunks to avoid overwhelming everything (though with Node fetch it's usually fine)
        const chunks = this.chunkArray(allSources, 5);

        for (const chunk of chunks) {
            await Promise.all(chunk.map(async (source) => {
                try {
                    const feed = await parser.parseURL(source.rss);

                    for (const item of feed.items) {
                        // Skip if too old (older than 7 days)
                        const pubDate = new Date(item.pubDate);
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        if (pubDate < sevenDaysAgo) continue;

                        try {
                            await db.newsItem.upsert({
                                where: { link: item.link || '' },
                                update: {},
                                create: {
                                    sourceId: source.id,
                                    title: item.title || 'Untitled',
                                    description: (item.contentSnippet || item.content || '').substring(0, 500),
                                    link: item.link || '',
                                    pubDate: pubDate,
                                    category: source.category,
                                    region: source.region || null,
                                    metadata: JSON.stringify({
                                        author: item.creator,
                                        guid: item.guid,
                                        sourceName: source.name
                                    })
                                }
                            });
                            count++;
                        } catch (dbError) {
                            if (dbError.code !== 'P2002') { // Ignore unique constraint violations if logic fails
                                console.error(`[News] DB Error for ${item.title}:`, dbError.message);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`[News] Failed to fetch ${source.name}: ${err.message}`);
                }
            }));
        }

        console.log(`[News] Refresh complete. Processed ${count} articles.`);
        return { count };
    }

    /**
     * Get stored news
     */
    async getNews(options = {}) {
        const { category, region, limit = 100 } = options;
        const where = {};

        if (category && category !== 'all') where.category = category;
        if (region) where.region = region;

        return await db.newsItem.findMany({
            where,
            orderBy: { pubDate: 'desc' },
            take: limit
        });
    }

    chunkArray(array, size) {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }
}

export const newsService = new NewsService();
