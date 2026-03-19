export const NEWS_SOURCES = {
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

export const BIAS_COLORS = {
  'far-right': { bg: 'bg-red-600/20', border: 'border-red-600/30', text: 'text-red-400', label: 'Far Right' },
  'right': { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300', label: 'Right' },
  'right-center': { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-300', label: 'Right-Center' },
  'right-libertarian': { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-300', label: 'Libertarian' },
  'center-right': { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-300', label: 'Center-Right' },
  'center': { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-300', label: 'Center' },
  'center-left': { bg: 'bg-blue-400/20', border: 'border-blue-400/30', text: 'text-blue-300', label: 'Center-Left' },
  'left-center': { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-300', label: 'Left-Center' },
  'left': { bg: 'bg-blue-600/20', border: 'border-blue-600/30', text: 'text-blue-400', label: 'Left' },
};

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
  image?: string;
  region?: string;
  factCheck?: {
      status: 'verified' | 'disputed' | 'unverified' | 'mixed';
  };
}

export const MN_KEYWORDS = [
  'minneapolis', 'minnesota', 'st. paul', 'saint paul',
  'twin cities', 'hennepin', 'ramsey county', 'duluth',
  'bloomington mn', 'rochester mn', 'walz', 'ellison',
  'u of m', 'gophers', 'vikings', 'twins', 'timberwolves',
  'target center', 'mall of america', 'msp airport'
];

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

export async function fetchAllNews(): Promise<NewsArticle[]> {
  try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/news`);
      if (!response.ok) throw new Error('Failed to fetch news');
      const articles = await response.json();
      return articles;
  } catch (error) {
      console.error("News fetch error:", error);
      return [];
  }
}
