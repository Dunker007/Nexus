'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import PageBackground from '@/components/PageBackground';

// Agent persona definitions with avatars and colors
const AGENT_PERSONAS = {
  architect: {
    name: 'The Architect',
    emoji: '🏗️',
    color: '#6366f1', // Indigo
    description: 'Focuses on structure, scalability, and design patterns',
    style: 'methodical and visionary',
  },
  security: {
    name: 'Security Officer',
    emoji: '🔒',
    color: '#ef4444', // Red
    description: 'Paranoid about vulnerabilities and data protection',
    style: 'cautious and thorough',
  },
  qa: {
    name: 'QA Lead',
    emoji: '🔍',
    color: '#22c55e', // Green
    description: 'Pedantic about edge cases and testing coverage',
    style: 'detail-oriented and skeptical',
  },
  devops: {
    name: 'DevOps Engineer',
    emoji: '⚙️',
    color: '#f59e0b', // Amber
    description: 'Thinks about deployment, scaling, and infrastructure',
    style: 'practical and efficiency-focused',
  },
};

interface MeetingMessage {
  id: string;
  agent: string;
  round: number;
  message: string;
  timestamp: string;
  type: 'brainstorm' | 'debate' | 'consensus';
}

interface MeetingResult {
  meetingId: string;
  topic: string;
  participants: string[];
  transcript: MeetingMessage[];
  consensus: string;
  actionItems: string[];
  duration: number;
}

export default function StaffMeetingPage() {
  const [topic, setTopic] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['architect', 'security', 'qa']);
  const [rounds, setRounds] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleAgent = (agent: string) => {
    setSelectedAgents(prev =>
      prev.includes(agent)
        ? prev.filter(a => a !== agent)
        : [...prev, agent]
    );
  };


  const startMeeting = async () => {
    if (!topic.trim() || selectedAgents.length < 2) return;

    setIsRunning(true);
    setMessages([]);
    setResult(null);
    setCurrentRound(0);

    try {
      // PROD: Try to fetch from real API
      const response = await fetch(`${LUXRIG_BRIDGE_URL}/agents/meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          participants: selectedAgents,
          rounds
        })
      });

      if (!response.ok) throw new Error('Bridge offline');

      const data = await response.json();
      await playTranscript(data);

    } catch (error) {
      console.log('Bridge unreachable, running simulation...');
      await runSimulation();
    } finally {
      setIsRunning(false);
      setCurrentSpeaker(null);
    }
  };

  const playTranscript = async (data: MeetingResult) => {
    for (let i = 0; i < data.transcript.length; i++) {
      const msg = data.transcript[i];
      setCurrentSpeaker(msg.agent);
      setCurrentRound(msg.round);

      await new Promise(resolve => setTimeout(resolve, 800)); // Read time
      setMessages(prev => [...prev, msg]);
      setCurrentSpeaker(null);
      await new Promise(resolve => setTimeout(resolve, 400)); // Pause
    }
    setResult(data);
  };

  const runSimulation = async () => {
    // Generate a mock transcript based on the selected agents
    const mockTranscript: MeetingMessage[] = [];
    let round = 1;

    const introMsgs: Record<string, string> = {
      architect: "I've analyzed the requirements for " + topic + ". We need to ensure modularity.",
      security: "My main concern with " + topic + " is data privacy and access control.",
      qa: "We need comprehensive test coverage for " + topic + " from day one.",
      devops: "Let's talk about the deployment pipeline for " + topic + "."
    };

    // Round 1: Intro
    for (const agent of selectedAgents) {
      setCurrentSpeaker(agent);
      setCurrentRound(round);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const msg: MeetingMessage = {
        id: Math.random().toString(),
        agent,
        round,
        message: introMsgs[agent] || "I have some ideas about this.",
        timestamp: new Date().toISOString(),
        type: 'brainstorm'
      };
      setMessages(prev => [...prev, msg]);
      setCurrentSpeaker(null);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    round++;

    // Round 2: Debate
    const debateMsgs: Record<string, string[]> = {
      architect: ["We should use a microservices approach here.", "I disagree, a monolith is faster to start with.", "Let's stick to standard protocols."],
      security: ["That opens up too many attack vectors.", "We need to encrypt everything at rest.", "Have we considered the authentication flow?"],
      qa: ["How are we going to unit test that?", "We need integration tests for these services.", "This adds too much complexity."],
      devops: ["Dockerizing this will be straightforward.", "Scaling this might be tricky.", "Let's use Kubernetes."]
    };

    for (const agent of selectedAgents) {
      setCurrentSpeaker(agent);
      setCurrentRound(round);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const possibleMsgs = debateMsgs[agent] || ["Interesting point."];
      const randomMsg = possibleMsgs[Math.floor(Math.random() * possibleMsgs.length)];

      const msg: MeetingMessage = {
        id: Math.random().toString(),
        agent,
        round,
        message: randomMsg,
        timestamp: new Date().toISOString(),
        type: 'debate'
      };
      setMessages(prev => [...prev, msg]);
      setCurrentSpeaker(null);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Conclusion
    const mockResult: MeetingResult = {
      meetingId: 'sim-' + Date.now(),
      topic,
      participants: selectedAgents,
      transcript: mockTranscript, // populated differently in real run but ok here
      consensus: "The team agreed to proceed with a modular approach, prioritizing security and testing from the start.",
      actionItems: [
        "Architect to draft initial schema",
        "Security to review auth flow",
        "QA to set up testing framework",
        "DevOps to configure CI/CD pipeline"
      ],
      duration: 5000
    };

    setResult(mockResult);
  };

  const getAgentStyle = (agent: string) => {
    const persona = AGENT_PERSONAS[agent as keyof typeof AGENT_PERSONAS];
    return persona || { color: '#666', emoji: '🤖', name: agent };
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <PageBackground color="purple" />

      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <linearGradient id="meetingLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,40% Q30%,35% 50%,45% T100%,40%" stroke="url(#meetingLine)" strokeWidth="1" fill="none" />
          <path d="M0,60% Q40%,55% 60%,65% T100%,55%" stroke="url(#meetingLine)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="container-main py-8 relative z-10">
        {/* Enhanced Header */}
        <motion.header
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-xl blur-xl opacity-30" />
              <div className="relative p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl border border-white/10">
                <span className="text-4xl">👥</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold">
                AI Staff<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Meeting</span>
              </h1>
              <p className="text-sm text-gray-500 italic">"None of us is as smart as all of us."</p>
            </div>
          </div>

          {/* Live Stats */}
          <div className="flex justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-xs text-purple-400">{selectedAgents.length} Participants</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <span className="text-xs text-indigo-400">{rounds} Rounds</span>
            </div>
            {isRunning && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">In Progress</span>
              </div>
            )}
          </div>
        </motion.header>

        {/* Meeting Setup */}
        <motion.div
          className="glass-card p-6 max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <input
            type="text"
            className="w-full p-4 text-lg bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 mb-4"
            placeholder="What should we discuss? (e.g., Design a secure authentication system)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isRunning}
          />

          {/* Agent Selection */}
          <div className="flex gap-3 flex-wrap mb-4">
            {Object.entries(AGENT_PERSONAS).map(([key, persona]) => {
              const isSelected = selectedAgents.includes(key);
              return (
                <motion.div
                  key={key}
                  onClick={() => !isRunning && toggleAgent(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all border-2 ${isSelected
                    ? 'border-opacity-100 shadow-lg'
                    : 'border-transparent bg-black/30 hover:bg-black/40'
                    }`}
                  style={{
                    backgroundColor: isSelected ? persona.color + '30' : undefined,
                    borderColor: isSelected ? persona.color : undefined,
                    boxShadow: isSelected ? `0 0 20px ${persona.color}40` : undefined
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={persona.description}
                >
                  <span className="text-2xl">{persona.emoji}</span>
                  <span className={isSelected ? 'text-white font-medium' : 'text-gray-400'}>{persona.name}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Controls Row */}
          <div className="flex gap-4 items-center justify-between flex-wrap">
            <div className="flex items-center gap-3 text-gray-400">
              <label className="text-sm">Debate Rounds:</label>
              <input
                type="number"
                min={1}
                max={5}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                disabled={isRunning}
                className="w-16 p-2 bg-black/30 border border-white/10 rounded text-white text-center focus:outline-none focus:border-purple-500"
              />
            </div>

            <motion.button
              onClick={startMeeting}
              disabled={isRunning || !topic.trim() || selectedAgents.length < 2}
              className="px-6 py-3 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isRunning ? '🎙️ Meeting in Progress...' : '🚀 Start Meeting'}
            </motion.button>
          </div>
        </motion.div>

        {/* Meeting Room */}
        <AnimatePresence>
          {(messages.length > 0 || isRunning) && (
            <motion.div
              className="glass-card max-w-4xl mx-auto overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Room Header */}
              <div className="p-4 bg-black/30 border-b border-white/10 flex justify-between items-center">
                <div className="px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  Round {currentRound || 1} of {rounds * 2}
                </div>
                <div className="flex gap-2">
                  {selectedAgents.map(agent => {
                    const persona = getAgentStyle(agent);
                    const isSpeaking = currentSpeaker === agent;
                    return (
                      <motion.div
                        key={agent}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg relative"
                        style={{ backgroundColor: persona.color }}
                        animate={isSpeaking ? { scale: [1, 1.1, 1], boxShadow: `0 0 20px ${persona.color}` } : {}}
                        transition={{ repeat: isSpeaking ? Infinity : 0, duration: 1 }}
                        title={persona.name}
                      >
                        <span className="relative z-10">{persona.emoji}</span>
                        {isSpeaking && <span className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ backgroundColor: persona.color }}></span>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Messages Container */}
              <div className="h-96 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((msg) => {
                  const persona = getAgentStyle(msg.agent);
                  return (
                    <div key={msg.id} className="flex gap-4 mb-4 items-start">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: persona.color }}
                      >
                        {persona.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm" style={{ color: persona.color }}>
                            {persona.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400 uppercase tracking-wider">
                            {msg.type === 'brainstorm' ? '💡 Brainstorm' :
                              msg.type === 'debate' ? '⚔️ Debate' : '✅ Consensus'}
                          </span>
                        </div>
                        <div
                          className="text-gray-200 leading-relaxed bg-white/5 p-3 rounded-bl-xl rounded-tr-xl rounded-br-xl"
                          style={{ borderLeft: `2px solid ${persona.color}` }}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {currentSpeaker && (
                  <div className="flex gap-4 mb-4 items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: getAgentStyle(currentSpeaker).color }}
                    >
                      {getAgentStyle(currentSpeaker).emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-1 items-center px-4 py-3 bg-white/5 rounded-2xl w-fit">
                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ color: getAgentStyle(currentSpeaker).color, animationDelay: '0s' }}></span>
                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ color: getAgentStyle(currentSpeaker).color, animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ color: getAgentStyle(currentSpeaker).color, animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <div className="glass-card p-6 mt-6 max-w-4xl mx-auto">
            <div className="text-xl font-bold mb-4 flex items-center gap-2">
              📋 Meeting Minutes
            </div>

            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mb-4">
              <strong className="text-green-400 block mb-1">✅ Consensus Reached:</strong>
              <p className="text-gray-200">{result.consensus}</p>
            </div>

            {result.actionItems.length > 0 && (
              <>
                <h4 className="font-bold mb-2 text-gray-300">📌 Action Items:</h4>
                <ul className="space-y-2">
                  {result.actionItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-black/20 p-2 rounded">
                      <span className="text-green-400">☐</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="text-gray-500 text-xs mt-4 pt-4 border-t border-white/10 flex justify-between">
              <span>Duration: {(result.duration / 1000).toFixed(1)}s</span>
              <span>Participants: {result.participants.join(', ')}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
