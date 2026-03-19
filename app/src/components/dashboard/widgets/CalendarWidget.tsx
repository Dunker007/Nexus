import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CalendarEvent } from '../../../types/dashboard';
import { STATIC_CALENDAR_EVENTS } from '../../../config/dashboardConfig';

const LUXRIG_BRIDGE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export function CalendarWidget() {
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(STATIC_CALENDAR_EVENTS as CalendarEvent[]);
    const [googleConnected, setGoogleConnected] = useState(false);

    async function fetchGoogleCalendar() {
        try {
            const accessToken = localStorage.getItem('google_access_token');
            if (!accessToken) { setGoogleConnected(false); return; }
            setGoogleConnected(true);
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/google/calendar/events?maxResults=5`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const events = await response.json();
                if (Array.isArray(events) && events.length > 0) {
                    const formatted: CalendarEvent[] = events.map((event: any) => ({
                        title: event.summary || 'No title',
                        time: event.start?.dateTime
                            ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                            : 'All day',
                        type: (event.summary?.toLowerCase().includes('meeting') ? 'meeting' : 'work') as CalendarEvent['type']
                    }));
                    setCalendarEvents(formatted);
                }
            }
        } catch { }
    }

    useEffect(() => {
        fetchGoogleCalendar();
    }, []);

    return (
        <div className="space-y-2">
            {googleConnected && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 font-bold uppercase tracking-wider mb-2 inline-block">Google Online</span>}
            {calendarEvents.map((event, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#12121a] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="text-cyan-400 font-mono text-xs w-16 shrink-0">{event.time}</div>
                    <div className="flex-1 text-sm truncate text-white/80">{event.title}</div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${event.type === 'meeting' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`}></div>
                </div>
            ))}
            {!googleConnected && <Link to="/settings" className="text-xs font-bold tracking-widest uppercase text-cyan-400 hover:text-cyan-300 mt-2 block w-max">Connect Google &rarr;</Link>}
        </div>
    );
}
