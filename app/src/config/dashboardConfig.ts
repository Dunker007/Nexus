import type { WidgetConfig, WidgetType } from '../types/dashboard';

// Available Widgets
export const WIDGET_CATALOG: Record<WidgetType, { title: string; icon: string; defaultW: number; defaultH: number; minW: number; minH: number }> = {
    quick_ai: { title: '⚡ Quick AI', icon: '⚡', defaultW: 2, defaultH: 3, minW: 2, minH: 2 },
    calendar: { title: '📅 Calendar', icon: '📅', defaultW: 1, defaultH: 3, minW: 1, minH: 2 },
    news: { title: '📰 News', icon: '📰', defaultW: 2, defaultH: 3, minW: 1, minH: 2 },
    tasks: { title: '✅ Tasks', icon: '✅', defaultW: 1, defaultH: 3, minW: 1, minH: 2 },
    quote: { title: '✨ Quote', icon: '✨', defaultW: 1, defaultH: 2, minW: 1, minH: 1 },
    system: { title: '🖥️ System', icon: '🖥️', defaultW: 2, defaultH: 2, minW: 1, minH: 2 },
    quicklinks: { title: '🔗 Quick Links', icon: '🔗', defaultW: 1, defaultH: 2, minW: 1, minH: 1 },
    scratchpad: { title: '📝 Scratchpad', icon: '📝', defaultW: 1, defaultH: 3, minW: 1, minH: 2 },
    music: { title: '🎵 Music', icon: '🎵', defaultW: 1, defaultH: 3, minW: 1, minH: 2 },
    recent: { title: '🕐 Recent', icon: '🕐', defaultW: 1, defaultH: 2, minW: 1, minH: 1 },
};

// Default Layout — full 4-column spread (lg: 4 cols)
// Row 0: Quick AI (2w) | System (1w) | Music (1w)
// Row 1: News (2w)    | Calendar (1w)| Scratchpad (1w)
// Row 2: Tasks (1w)   | Quote (1w)   | Quick Links (1w) | Recent (1w)
export const DEFAULT_LAYOUT: any[] = [
    { i: 'quick_ai-1',   x: 0, y: 0, w: 2, h: 3 },
    { i: 'system-1',     x: 2, y: 0, w: 1, h: 2 },
    { i: 'music-1',      x: 3, y: 0, w: 1, h: 3 },
    { i: 'news-1',       x: 0, y: 3, w: 2, h: 3 },
    { i: 'calendar-1',   x: 2, y: 3, w: 1, h: 3 },
    { i: 'scratchpad-1', x: 3, y: 3, w: 1, h: 3 },
    { i: 'tasks-1',      x: 0, y: 6, w: 1, h: 3 },
    { i: 'quote-1',      x: 1, y: 6, w: 1, h: 2 },
    { i: 'quicklinks-1', x: 2, y: 6, w: 1, h: 2 },
    { i: 'recent-1',     x: 3, y: 6, w: 1, h: 2 },
];

export const DEFAULT_WIDGETS: WidgetConfig[] = [
    { i: 'quick_ai-1',   type: 'quick_ai',   title: '⚡ Quick AI',    icon: '⚡' },
    { i: 'system-1',     type: 'system',     title: '🖥️ System',      icon: '🖥️' },
    { i: 'music-1',      type: 'music',      title: '🎵 Music',       icon: '🎵' },
    { i: 'news-1',       type: 'news',       title: '📰 News',        icon: '📰' },
    { i: 'calendar-1',   type: 'calendar',   title: '📅 Calendar',    icon: '📅' },
    { i: 'scratchpad-1', type: 'scratchpad', title: '📝 Scratchpad',  icon: '📝' },
    { i: 'tasks-1',      type: 'tasks',      title: '✅ Tasks',       icon: '✅' },
    { i: 'quote-1',      type: 'quote',      title: '✨ Quote',       icon: '✨' },
    { i: 'quicklinks-1', type: 'quicklinks', title: '🔗 Quick Links', icon: '🔗' },
    { i: 'recent-1',     type: 'recent',     title: '🕐 Recent',      icon: '🕐' },
];

// Sample Data
export const SAMPLE_NEWS = [
    { title: 'Minneapolis City Council Passes New Public Safety Measure', source: 'Alpha News', time: '2h ago', link: '#' },
    { title: 'Governor Walz Signs Executive Order on Energy Policy', source: 'Bring Me The News', time: '4h ago', link: '#' },
    { title: 'Glenn Beck: The Media Won\'t Tell You This', source: 'The Blaze', time: '5h ago', link: '#' },
];

export const STATIC_CALENDAR_EVENTS = [
    { title: 'Team standup', time: '10:00 AM', type: 'meeting' },
    { title: 'Music pipeline review', time: '2:00 PM', type: 'work' },
    { title: 'AI research session', time: '4:30 PM', type: 'personal' },
];

export const DAILY_QUOTES = [
    { content: '"The best way to predict the future is to create it."', author: 'Peter Drucker' },
    { content: '"Move fast and break things."', author: 'Mark Zuckerberg' },
    { content: '"The only way to do great work is to love what you do."', author: 'Steve Jobs' },
];

export const DEFAULT_QUICK_LINKS = [
    { title: 'YouTube Studio', url: 'https://studio.youtube.com', icon: '📺' },
    { title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { title: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
    { title: 'Suno AI', url: 'https://suno.ai', icon: '🎵' },
];
