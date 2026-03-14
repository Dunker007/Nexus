import { Router } from 'express';
import { db } from '../db.js';
import Parser from 'rss-parser';

export const newsRouter = Router();
const parser = new Parser();

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

newsRouter.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM news_items ORDER BY created_at DESC LIMIT 100').all();
    res.json(rows.map(mapRow));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

newsRouter.post('/refresh', async (req, res) => {
    try {
        const allFeeds = Object.values(NEWS_SOURCES).flat();
        let addedCount = 0;

        for (const source of allFeeds) {
            try {
                const feedData = await parser.parseURL(source.rss);
                for (const item of feedData.items.slice(0, 10)) {
                    const id = item.guid || item.link || Math.random().toString(36);
                    try {
                        db.prepare(`
                            INSERT OR IGNORE INTO news_items 
                            (id, title, source, type, url, summary, bias, time, impact, feed) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).run(
                            id,
                            item.title || 'No Title',
                            source.name,
                            source.category,
                            item.link || '',
                            item.contentSnippet || item.description || '',
                            source.bias,
                            item.pubDate || new Date().toISOString(),
                            source.logo,
                            (source as any).priority ? 'priority' : 'nexus'
                        );
                        addedCount++;
                    } catch (err) {
                        // Probably duplicate GUID
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch ${source.name}:`, err);
            }
        }

        res.json({ success: true, added: addedCount });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

newsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM news_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
