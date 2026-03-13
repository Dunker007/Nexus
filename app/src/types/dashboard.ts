export type WidgetType = 'quick_ai' | 'calendar' | 'news' | 'tasks' | 'quote' | 'system' | 'quicklinks' | 'scratchpad' | 'music' | 'recent' | 'portfolio' | 'llm_playground' | 'voice_control';

export interface WidgetConfig {
    i: string;
    type: WidgetType;
    title: string;
    icon: string;
    minW?: number;
    minH?: number;
}

export interface SystemStats {
    services?: {
        lmstudio?: { online: boolean };
        ollama?: { online: boolean };
    };
    system?: {
        gpu?: {
            temperature?: number;
            utilization?: number;
        };
    };
}

export interface NewsItem {
    title: string;
    source: string;
    time: string;
    link: string;
    pubDate?: string;
}

export interface CalendarEvent {
    title: string;
    time: string;
    type: 'meeting' | 'work' | 'personal';
}
