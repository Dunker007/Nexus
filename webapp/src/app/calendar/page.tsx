'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

interface Event {
    id: string;
    title: string;
    date: string;
    time?: string;
    type: 'meeting' | 'task' | 'reminder' | 'event';
    color: string;
}

const events: Event[] = [
    { id: '1', title: 'Review Trading Bot Performance', date: '2024-12-04', time: '10:00 AM', type: 'task', color: 'bg-cyan-500' },
    { id: '2', title: 'Team Sync', date: '2024-12-04', time: '2:00 PM', type: 'meeting', color: 'bg-purple-500' },
    { id: '3', title: 'Deploy DLX Studio v1.1', date: '2024-12-06', type: 'task', color: 'bg-green-500' },
    { id: '4', title: 'AI Research Meeting', date: '2024-12-09', time: '11:00 AM', type: 'meeting', color: 'bg-purple-500' },
    { id: '5', title: 'Backup system maintenance', date: '2024-12-10', type: 'reminder', color: 'bg-yellow-500' },
    { id: '6', title: 'Holiday Party', date: '2024-12-20', time: '6:00 PM', type: 'event', color: 'bg-pink-500' },
    { id: '7', title: 'Year in Review', date: '2024-12-31', type: 'task', color: 'bg-cyan-500' },
];

const upcomingTasks = [
    { title: 'Fix portfolio sync issue', due: 'Today', priority: 'high' },
    { title: 'Update API documentation', due: 'Tomorrow', priority: 'medium' },
    { title: 'Test new Gemini integration', due: 'Dec 6', priority: 'low' },
    { title: 'Review community feedback', due: 'Dec 8', priority: 'medium' },
];

function getDaysInMonth(month: number, year: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
    return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [viewMonth, setViewMonth] = useState(currentMonth);
    const [viewYear, setViewYear] = useState(currentYear);

    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    function getEventsForDay(day: number) {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    }

    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

    function prevMonth() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    }

    function nextMonth() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    }

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                <span className="text-gradient">Calendar</span>
                            </h1>
                            <p className="text-gray-400">Schedule, tasks, and reminders</p>
                        </div>
                        <button className="btn-primary">+ Add Event</button>
                    </motion.div>
                </div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg">←</button>
                            <h2 className="text-xl font-bold">{monthNames[viewMonth]} {viewYear}</h2>
                            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg">→</button>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map(day => (
                                <div key={day} className="text-center text-sm text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, i) => {
                                if (day === null) {
                                    return <div key={`empty-${i}`} className="aspect-square"></div>;
                                }

                                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const dayEvents = getEventsForDay(day);
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;

                                return (
                                    <div
                                        key={day}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`aspect-square p-1 rounded-lg cursor-pointer transition-all ${isSelected ? 'ring-2 ring-cyan-500 bg-cyan-500/20' :
                                                isToday ? 'bg-cyan-500/10' : 'hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`text-sm ${isToday ? 'text-cyan-400 font-bold' : ''}`}>
                                            {day}
                                        </div>
                                        <div className="flex flex-wrap gap-0.5 mt-1">
                                            {dayEvents.slice(0, 3).map(e => (
                                                <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${e.color}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Selected Date Events */}
                    {selectedDate && (
                        <motion.div
                            className="glass-card mt-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 className="font-bold mb-4">
                                Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                    weekday: 'long', month: 'long', day: 'numeric'
                                })}
                            </h3>
                            {selectedEvents.length === 0 ? (
                                <p className="text-gray-500">No events scheduled</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedEvents.map(event => (
                                        <div key={event.id} className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                                            <div className="flex-1">
                                                <div className="font-medium">{event.title}</div>
                                                {event.time && <div className="text-sm text-gray-500">{event.time}</div>}
                                            </div>
                                            <span className="px-2 py-0.5 bg-white/10 rounded text-xs capitalize">
                                                {event.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Today */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">📅 Today</h3>
                        <div className="text-3xl font-bold text-cyan-400">
                            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                        <div className="text-gray-400">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="mt-4 space-y-2">
                            {events.filter(e => e.date === todayStr).map(e => (
                                <div key={e.id} className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${e.color}`}></div>
                                    <span>{e.time || 'All day'}</span>
                                    <span className="text-gray-400">{e.title}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Upcoming Tasks */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">✅ Upcoming Tasks</h3>
                        <div className="space-y-3">
                            {upcomingTasks.map((task, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 rounded" />
                                    <div className="flex-1">
                                        <div className="text-sm">{task.title}</div>
                                        <div className="text-xs text-gray-500">{task.due}</div>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}></span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 bg-white/10 rounded-lg text-sm">
                            View All Tasks
                        </button>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-4">⚡ Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">
                                + New Event
                            </button>
                            <button className="w-full py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                                + New Task
                            </button>
                            <button className="w-full py-2 bg-white/10 rounded-lg text-sm">
                                🔗 Sync with Google
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
