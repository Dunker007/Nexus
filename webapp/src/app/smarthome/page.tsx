'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Lightbulb,
    Thermometer,
    Lock,
    Unlock,
    Music,
    Tv,
    Wifi,
    Power,
    Sun,
    Moon,
    Fan,
    Video,
    AlertCircle
} from 'lucide-react';
import PageBackground from '@/components/PageBackground';

// Mock Device Types
interface Device {
    id: string;
    type: 'light' | 'thermostat' | 'lock' | 'media' | 'camera';
    name: string;
    room: string;
    state: any; // on/off, temp, locked, etc.
    details?: string;
}

const INITIAL_DEVICES: Device[] = [
    { id: 'l1', type: 'light', name: 'Living Room Main', room: 'Living Room', state: true, details: '80% Brightness' },
    { id: 'l2', type: 'light', name: 'Kitchen Spots', room: 'Kitchen', state: false, details: 'Off' },
    { id: 'l3', type: 'light', name: 'Office Ambience', room: 'Office', state: true, details: 'Purple' },
    { id: 't1', type: 'thermostat', name: 'Nest Downstairs', room: 'Hallway', state: 72, details: 'Heating' },
    { id: 's1', type: 'lock', name: 'Front Door', room: 'Entrance', state: 'locked', details: 'Battery 90%' },
    { id: 'm1', type: 'media', name: 'Office Sonos', room: 'Office', state: 'playing', details: 'Lofi Hip Hop' },
    { id: 'c1', type: 'camera', name: 'Driveway Cam', room: 'Exterior', state: 'active', details: 'Recording' },
];

export default function SmartHomePage() {
    const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const [selectedRoom, setSelectedRoom] = useState<string>('All');

    useEffect(() => {
        // Simulate connection
        const timer = setTimeout(() => {
            setConnectionStatus('connected');
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const toggleDevice = (id: string) => {
        setDevices(prev => prev.map(d => {
            if (d.id !== id) return d;

            if (d.type === 'light') return { ...d, state: !d.state, details: !d.state ? '100% Brightness' : 'Off' };
            if (d.type === 'lock') return { ...d, state: d.state === 'locked' ? 'unlocked' : 'locked' };
            if (d.type === 'media') return { ...d, state: d.state === 'playing' ? 'paused' : 'playing' };
            return d;
        }));
    };

    const updateThermostat = (id: string, detail: number) => {
        setDevices(prev => prev.map(d => {
            if (d.id !== id) return d;
            return { ...d, state: d.state + detail };
        }));
    };

    const rooms = ['All', ...new Set(devices.map(d => d.room))];
    const filteredDevices = selectedRoom === 'All' ? devices : devices.filter(d => d.room === selectedRoom);

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            <PageBackground color="cyan" />

            <div className="container-main py-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Home className="w-8 h-8 text-cyan-400" />
                            Smart Home Control
                        </h1>
                        <p className="text-gray-400 mt-1">Home Assistant Integration (Simulated)</p>
                    </div>

                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${connectionStatus === 'connected' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                            connectionStatus === 'connecting' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' :
                                'bg-red-500/20 border-red-500/30 text-red-400'
                        }`}>
                        {connectionStatus === 'connected' ? <Wifi className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span className="text-sm font-medium uppercase tracking-wider">
                            {connectionStatus === 'connected' ? 'System Online' :
                                connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* Quick Scenes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {['Morning', 'Night', 'Away', 'Movie'].map((scene) => (
                        <button key={scene} className="glass-card p-4 hover:bg-white/10 transition-colors flex items-center justify-center gap-3 group">
                            {scene === 'Morning' && <Sun className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />}
                            {scene === 'Night' && <Moon className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />}
                            {scene === 'Away' && <Lock className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />}
                            {scene === 'Movie' && <Tv className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />}
                            <span className="font-medium text-lg">{scene}</span>
                        </button>
                    ))}
                </div>

                {/* Room Filters */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                    {rooms.map(room => (
                        <button
                            key={room}
                            onClick={() => setSelectedRoom(room)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedRoom === room
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                    : 'bg-black/20 hover:bg-black/40 text-gray-400'
                                }`}
                        >
                            {room}
                        </button>
                    ))}
                </div>

                {/* Device Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredDevices.map(device => (
                            <motion.div
                                key={device.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`glass-card p-6 relative overflow-hidden transition-colors ${(device.type === 'light' && device.state) ||
                                        (device.type === 'lock' && device.state === 'locked') ? 'border-cyan-500/30 bg-cyan-900/10' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-black/20">
                                        {device.type === 'light' && <Lightbulb className={`w-6 h-6 ${device.state ? 'text-amber-400' : 'text-gray-500'}`} />}
                                        {device.type === 'thermostat' && <Thermometer className="w-6 h-6 text-red-400" />}
                                        {device.type === 'lock' && (device.state === 'locked' ? <Lock className="w-6 h-6 text-green-400" /> : <Unlock className="w-6 h-6 text-red-400" />)}
                                        {device.type === 'media' && <Music className="w-6 h-6 text-purple-400" />}
                                        {device.type === 'camera' && <Video className="w-6 h-6 text-blue-400" />}
                                    </div>
                                    {device.type === 'light' || device.type === 'lock' || device.type === 'media' ? (
                                        <button
                                            onClick={() => toggleDevice(device.id)}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${(device.type === 'lock' && device.state === 'locked') ||
                                                    (device.type !== 'lock' && device.state)
                                                    ? 'bg-cyan-500' : 'bg-gray-700'
                                                }`}
                                        >
                                            <motion.div
                                                className="w-4 h-4 bg-white rounded-full absolute top-1 drop-shadow-md"
                                                animate={{
                                                    left: (device.type === 'lock' && device.state === 'locked') ||
                                                        (device.type !== 'lock' && device.state) ? '1.75rem' : '0.25rem'
                                                }}
                                            />
                                        </button>
                                    ) : (
                                        <div className="text-xl font-bold">{device.state}°</div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-lg font-bold">{device.name}</h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">{device.room}</p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-cyan-200/70 flex items-center gap-2">
                                        {device.details}
                                        {device.type === 'media' && device.state === 'playing' && (
                                            <motion.span
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="w-2 h-2 rounded-full bg-green-400 inline-block"
                                            />
                                        )}
                                    </p>

                                    {/* Thermostat Controls */}
                                    {device.type === 'thermostat' && (
                                        <div className="flex items-center gap-4 mt-4 bg-black/20 rounded-lg p-2 justify-center">
                                            <button onClick={() => updateThermostat(device.id, -1)} className="p-1 hover:bg-white/10 rounded"><Fan className="w-4 h-4" /></button>
                                            <span className="font-mono">{device.state}°</span>
                                            <button onClick={() => updateThermostat(device.id, 1)} className="p-1 hover:bg-white/10 rounded"><Sun className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
