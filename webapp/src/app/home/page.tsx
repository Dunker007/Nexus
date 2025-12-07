'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const rooms = [
    {
        id: 'living-room',
        name: 'Living Room',
        icon: '🛋️',
        devices: 8,
        scene: 'Movie Night',
        temp: 72
    },
    {
        id: 'bedroom',
        name: 'Bedroom',
        icon: '🛏️',
        devices: 5,
        scene: 'Sleep Mode',
        temp: 68
    },
    {
        id: 'office',
        name: 'Office',
        icon: '💻',
        devices: 6,
        scene: 'Focus Mode',
        temp: 70
    },
    {
        id: 'kitchen',
        name: 'Kitchen',
        icon: '🍳',
        devices: 4,
        scene: 'Bright',
        temp: 71
    },
];

const devices = [
    { id: 'light-1', name: 'Living Room Lights', type: 'light', brand: 'Govee', status: 'on', value: 75, room: 'living-room', icon: '💡' },
    { id: 'light-2', name: 'LED Strip', type: 'light', brand: 'Govee', status: 'on', value: 50, color: '#FF00FF', room: 'living-room', icon: '🌈' },
    { id: 'light-3', name: 'Floor Lamp', type: 'light', brand: 'Govee', status: 'off', value: 0, room: 'bedroom', icon: '🪔' },
    { id: 'cam-1', name: 'Front Door Camera', type: 'camera', brand: 'Reolink', status: 'recording', room: 'outside', icon: '📹' },
    { id: 'cam-2', name: 'Backyard Camera', type: 'camera', brand: 'Reolink', status: 'recording', room: 'outside', icon: '📷' },
    { id: 'cam-3', name: 'Garage Camera', type: 'camera', brand: 'Reolink', status: 'offline', room: 'garage', icon: '🎥' },
    { id: 'speaker-1', name: 'Nest Hub', type: 'speaker', brand: 'Google', status: 'idle', room: 'living-room', icon: '🔊' },
    { id: 'speaker-2', name: 'Nest Mini', type: 'speaker', brand: 'Google', status: 'playing', room: 'bedroom', icon: '🎵' },
    { id: 'thermo-1', name: 'Thermostat', type: 'thermostat', brand: 'Google', status: 'heating', value: 72, room: 'living-room', icon: '🌡️' },
    { id: 'tv-1', name: 'Living Room TV', type: 'tv', brand: 'Samsung', status: 'on', room: 'living-room', icon: '📺' },
];

const scenes = [
    { name: 'Good Morning', icon: '🌅', desc: 'Lights on, blinds up, music starts' },
    { name: 'Movie Night', icon: '🎬', desc: 'Dim lights, TV on, ambient colors' },
    { name: 'Focus Mode', icon: '🎯', desc: 'Cool white lights, no distractions' },
    { name: 'Sleep Mode', icon: '😴', desc: 'All lights off, cameras armed' },
    { name: 'Away', icon: '🏃', desc: 'Everything off, cameras recording' },
    { name: 'Party', icon: '🎉', desc: 'RGB everywhere, music pumping' },
];

const automations = [
    { name: 'Sunset Lights', trigger: 'At sunset', action: 'Turn on porch lights', enabled: true },
    { name: 'Motion Alert', trigger: 'Camera motion', action: 'Send notification', enabled: true },
    { name: 'Good Night', trigger: '11:00 PM', action: 'Run Sleep Mode scene', enabled: true },
    { name: 'Welcome Home', trigger: 'Phone arrives', action: 'Unlock door, turn on lights', enabled: false },
];

export default function SmartHomePage() {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

    const filteredDevices = selectedRoom
        ? devices.filter(d => d.room === selectedRoom)
        : devices;

    const onlineDevices = devices.filter(d => d.status !== 'offline').length;

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-bold">
                                Smart <span className="text-gradient">Home</span>
                            </h1>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                {onlineDevices}/{devices.length} Online
                            </span>
                        </div>
                        <p className="text-gray-400">Control Govee lights, Reolink cameras, Google Home, and more.</p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rooms.map((room, i) => (
                        <motion.div
                            key={room.id}
                            className={`glass-card cursor-pointer transition-all ${selectedRoom === room.id ? 'ring-2 ring-cyan-500' : ''
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{room.icon}</span>
                                <h3 className="font-bold">{room.name}</h3>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{room.devices} devices</span>
                                <span>{room.temp}°F</span>
                            </div>
                            <div className="mt-2 text-xs text-cyan-400">{room.scene}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Devices */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            🔌 Devices {selectedRoom && `- ${rooms.find(r => r.id === selectedRoom)?.name}`}
                        </h2>
                        {selectedRoom && (
                            <button
                                onClick={() => setSelectedRoom(null)}
                                className="text-sm text-gray-400 hover:text-white"
                            >
                                Show All
                            </button>
                        )}
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                    >
                        {filteredDevices.map((device) => (
                            <motion.div
                                key={device.id}
                                className={`glass-card ${device.status === 'offline' ? 'opacity-50' : ''}`}
                                variants={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{device.icon}</span>
                                        <div>
                                            <h3 className="font-medium">{device.name}</h3>
                                            <p className="text-xs text-gray-500">{device.brand}</p>
                                        </div>
                                    </div>

                                    {device.type === 'light' && device.status !== 'offline' && (
                                        <button
                                            className={`w-12 h-6 rounded-full transition-colors ${device.status === 'on' ? 'bg-cyan-500' : 'bg-gray-600'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${device.status === 'on' ? 'translate-x-6' : 'translate-x-0.5'
                                                }`}></div>
                                        </button>
                                    )}

                                    {device.type === 'camera' && (
                                        <span className={`px-2 py-1 rounded text-xs ${device.status === 'recording'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {device.status === 'recording' ? '🔴 REC' : 'Offline'}
                                        </span>
                                    )}
                                </div>

                                {device.type === 'light' && device.value !== undefined && (
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Brightness</span>
                                            <span>{device.value}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={device.value}
                                            className="w-full"
                                            readOnly
                                        />
                                        {device.color && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <div
                                                    className="w-6 h-6 rounded-full border-2 border-white/20"
                                                    style={{ backgroundColor: device.color }}
                                                />
                                                <span className="text-xs text-gray-500">Color: {device.color}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {device.type === 'thermostat' && (
                                    <div className="flex items-center justify-center gap-4">
                                        <button className="w-10 h-10 bg-white/10 rounded-full text-xl">-</button>
                                        <span className="text-3xl font-bold">{device.value}°</span>
                                        <button className="w-10 h-10 bg-white/10 rounded-full text-xl">+</button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Scenes */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">🎨 Scenes</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {scenes.map((scene) => (
                                <button
                                    key={scene.name}
                                    className="p-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors"
                                >
                                    <span className="text-xl">{scene.icon}</span>
                                    <div className="font-medium text-sm mt-1">{scene.name}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Automations */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">⚡ Automations</h3>
                        <div className="space-y-3">
                            {automations.map((auto) => (
                                <div key={auto.name} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-sm">{auto.name}</div>
                                        <div className="text-xs text-gray-500">{auto.trigger}</div>
                                    </div>
                                    <button
                                        className={`w-10 h-5 rounded-full transition-colors ${auto.enabled ? 'bg-cyan-500' : 'bg-gray-600'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${auto.enabled ? 'translate-x-5' : 'translate-x-0.5'
                                            }`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 bg-white/10 rounded-lg text-sm">
                            + Add Automation
                        </button>
                    </motion.div>

                    {/* Integrations */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-4">🔗 Integrations</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
                                <span>🌈 Govee</span>
                                <span className="text-green-400 text-sm">Connected</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
                                <span>📹 Reolink</span>
                                <span className="text-green-400 text-sm">Connected</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
                                <span>🏠 Google Home</span>
                                <span className="text-green-400 text-sm">Connected</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
                                <span>🍎 HomeKit</span>
                                <span className="text-gray-400 text-sm">Not Connected</span>
                            </div>
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
