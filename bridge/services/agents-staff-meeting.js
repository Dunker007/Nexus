/**
 * Staff Meeting Agent - The Orchestrator
 * Manages a debate between multiple specialized AI agents.
 * Uses real LLM (LM Studio) when available, falls back to mock responses.
 */

import { Agent } from './agent-core.js';
import { lmstudioService } from './lmstudio.js';

// Persona definitions
const PERSONAS = {
    architect: {
        id: 'architect',
        name: 'The Architect',
        role: 'System Design',
        color: '#a855f7', // Purple
        prompt: `You are "The Architect", a Senior System Architect in a staff meeting.
Your personality: visionary but practical, focused on scalability, clean patterns, and trade-offs.
Keep responses concise (2-4 sentences). Speak in first person. Do not use markdown headers.`
    },
    security: {
        id: 'security',
        name: 'SecOps Lead',
        role: 'Security',
        color: '#ef4444', // Red
        prompt: `You are "SecOps Lead", a Paranoid Security Officer in a staff meeting.
Your personality: suspicious, thorough, focused on vulnerabilities, data leaks, and auth flaws. Trust no one.
Keep responses concise (2-4 sentences). Speak in first person. Do not use markdown headers.`
    },
    qa: {
        id: 'qa',
        name: 'QA Director',
        role: 'Quality',
        color: '#eab308', // Yellow
        prompt: `You are "QA Director", a Quality Assurance Lead in a staff meeting.
Your personality: pedantic, detail-oriented, focused on edge cases, user experience, and testing strategies.
Keep responses concise (2-4 sentences). Speak in first person. Do not use markdown headers.`
    }
};

// Static mock responses (used when LLM is unavailable)
const MOCK_RESPONSES = {
    architect: {
        initial: (topic) => `For "${topic}", I propose a microservices architecture using Node.js and Redis for high throughput. We need to ensure the API gateway is robust and our domain boundaries are clean.`,
        critique: (topic) => `I hear the concerns. Let me revisit the service boundaries — we may be over-exposing internal APIs. A BFF (Backend-for-Frontend) layer could help.`,
        defense: (topic) => `Valid concern, Security. We can implement rate limiting at the gateway level and use strict JWT validation to mitigate those risks.`,
    },
    security: {
        initial: (topic) => `I'm seeing potential PII risks with "${topic}". We need end-to-end encryption and a strict audit log for every access event.`,
        critique: (topic) => `The proposed architecture exposes too many public endpoints. If the Redis instance isn't sandboxed, we're looking at a major data leak vector.`,
        defense: (topic) => `I'll need to see the auth flow diagram before I sign off. PKCE for OAuth, vault-managed secrets, and zero-trust networking are non-negotiable.`,
    },
    qa: {
        initial: (topic) => `From a UX perspective, "${topic}" needs to be snappy. I'm worried about latency. Also, how do we test this under poor network conditions?`,
        critique: (topic) => `We're missing test coverage for the failure paths. What happens when Redis goes down? When the gateway rejects a valid token?`,
        defense: (topic) => `I agree with the direction. We need automated load testing in the CI/CD pipeline and chaos engineering before we can sign off on this.`,
    }
};

export class StaffMeetingAgent extends Agent {
    constructor(options = {}) {
        super({
            id: 'staff-meeting',
            name: 'Staff Meeting',
            description: 'Orchestrates multi-agent debates and collaboration',
            capabilities: ['orchestration', 'debate-moderation', 'synthesis']
        });

        this.forceMock = options.useMock ?? false; // Force mock mode (useful for tests)
        this.llmAvailable = null; // null = unknown, true/false = cached probe result

        this.meetingState = {
            isActive: false,
            topic: null,
            round: 0,
            transcript: [], // { speaker, text, timestamp }
            currentSpeaker: null,
            consensus: null,
            mode: null // 'llm' or 'mock' — set when meeting starts
        };
    }

    async processTask(task, context) {
        const { action, topic } = task;

        switch (action) {
            case 'start-meeting':
                return this.startMeeting(topic);
            case 'get-status':
                return this.getMeetingStatus();
            case 'stop-meeting':
                return this.stopMeeting();
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * Probe LM Studio availability (cached per meeting)
     */
    async probeLLM() {
        if (this.forceMock) return false;
        try {
            const status = await lmstudioService.getStatus();
            this.llmAvailable = status.online === true;
            return this.llmAvailable;
        } catch {
            this.llmAvailable = false;
            return false;
        }
    }

    async startMeeting(topic) {
        if (this.meetingState.isActive) {
            throw new Error('Meeting already in progress');
        }

        // Probe LLM once at meeting start
        const llmReady = await this.probeLLM();

        this.meetingState = {
            isActive: true,
            topic,
            round: 1,
            transcript: [],
            currentSpeaker: 'moderator',
            consensus: null,
            mode: llmReady ? 'llm' : 'mock'
        };

        console.log(`[StaffMeeting] Starting meeting on "${topic}" in ${this.meetingState.mode.toUpperCase()} mode`);

        // Start the meeting loop in background (don't await it here)
        this.runMeetingLoop(topic);

        return {
            message: 'Meeting started',
            topic,
            mode: this.meetingState.mode,
            timestamp: new Date()
        };
    }

    async runMeetingLoop(topic) {
        try {
            // Intro
            await this.addTranscript('moderator', `Meeting started. Topic: "${topic}"`);
            await this.wait(1000);

            // Round 1: Initial Thoughts
            this.meetingState.round = 1;
            await this.addTranscript('moderator', 'Round 1: Initial Thoughts. Architect, please start.');

            await this.agentSpeak('architect', topic, 'initial');
            await this.agentSpeak('security', topic, 'initial');
            await this.agentSpeak('qa', topic, 'initial');

            // Round 2: Debate/Critique
            this.meetingState.round = 2;
            await this.addTranscript('moderator', 'Round 2: Security Review. Security, do you have concerns?');
            await this.agentSpeak('security', topic, 'critique');

            await this.addTranscript('moderator', 'Architect, your response?');
            await this.agentSpeak('architect', topic, 'defense');

            await this.addTranscript('moderator', 'QA, final thoughts?');
            await this.agentSpeak('qa', topic, 'defense');

            // Round 3: Consensus
            this.meetingState.round = 3;
            await this.addTranscript('moderator', 'Round 3: Final Consensus.');
            const consensus = await this.synthesizeConsensus(topic);

            this.meetingState.consensus = consensus;
            this.meetingState.isActive = false;
            this.meetingState.currentSpeaker = null;

            await this.addTranscript('moderator', consensus);
            await this.addTranscript('moderator', 'Meeting adjourned.');

            console.log(`[StaffMeeting] Meeting on "${topic}" completed (${this.meetingState.transcript.length} entries)`);

        } catch (error) {
            console.error('[StaffMeeting] Meeting loop error:', error);
            this.meetingState.isActive = false;
            await this.addTranscript('moderator', `Error: ${error.message}`);
        }
    }

    async agentSpeak(personaId, topic, phase) {
        const persona = PERSONAS[personaId];
        if (!persona) {
            console.warn(`[StaffMeeting] Unknown persona: ${personaId}`);
            return;
        }

        this.meetingState.currentSpeaker = personaId;

        // Brief thinking delay (shorter for LLM since it has its own latency)
        await this.wait(this.meetingState.mode === 'llm' ? 500 : 1500 + Math.random() * 1000);

        const content = await this.generateResponse(persona, topic, phase);

        await this.addTranscript(personaId, content);
        this.meetingState.currentSpeaker = null;
        await this.wait(500);
    }

    /**
     * Generate a response — tries LLM first, falls back to mock.
     */
    async generateResponse(persona, topic, phase) {
        if (this.meetingState.mode === 'llm') {
            try {
                return await this.generateLLMResponse(persona, topic, phase);
            } catch (error) {
                console.warn(`[StaffMeeting] LLM failed for ${persona.id}, falling back to mock:`, error.message);
                return this.generateMockResponse(persona, topic, phase);
            }
        }
        return this.generateMockResponse(persona, topic, phase);
    }

    /**
     * Generate response via LM Studio
     */
    async generateLLMResponse(persona, topic, phase) {
        // Build context from recent transcript
        const recentTranscript = this.meetingState.transcript
            .slice(-6) // Last 6 entries for context window
            .map(e => `${e.speaker}: ${e.text}`)
            .join('\n');

        const phaseInstructions = {
            initial: `Give your initial thoughts and recommendations on the topic: "${topic}".`,
            critique: `Review what has been said so far and raise concerns or critiques about the topic: "${topic}".`,
            defense: `Respond to the critiques raised by other participants regarding: "${topic}". Defend or adapt your position.`,
        };

        const messages = [
            {
                role: 'system',
                content: `${persona.prompt}\n\nYou are in a staff meeting discussing: "${topic}"\nCurrent phase: ${phase}\n\nTranscript so far:\n${recentTranscript || '(Meeting just started)'}`
            },
            {
                role: 'user',
                content: phaseInstructions[phase] || `Share your thoughts on "${topic}".`
            }
        ];

        const result = await lmstudioService.chat(messages);
        return result.content.trim();
    }

    /**
     * Generate a static mock response (offline fallback)
     */
    generateMockResponse(persona, topic, phase) {
        const personaMocks = MOCK_RESPONSES[persona.id];
        if (personaMocks && personaMocks[phase]) {
            return personaMocks[phase](topic);
        }
        return `I have some thoughts on "${topic}" regarding ${persona.role} that we should discuss further.`;
    }

    /**
     * Synthesize consensus — uses LLM if available, otherwise generates static summary.
     */
    async synthesizeConsensus(topic) {
        if (this.meetingState.mode === 'llm') {
            try {
                const fullTranscript = this.meetingState.transcript
                    .map(e => `${e.speaker}: ${e.text}`)
                    .join('\n');

                const messages = [
                    {
                        role: 'system',
                        content: `You are a meeting moderator. Synthesize the following staff meeting transcript into a brief consensus summary with 3-5 action items. Use bullet points. Be concise.`
                    },
                    {
                        role: 'user',
                        content: `Meeting topic: "${topic}"\n\nTranscript:\n${fullTranscript}\n\nPlease provide the consensus and action items.`
                    }
                ];

                const result = await lmstudioService.chat(messages);
                return result.content.trim();
            } catch (error) {
                console.warn('[StaffMeeting] LLM consensus failed, using static fallback:', error.message);
            }
        }

        // Static fallback
        return [
            `Meeting Consensus: ${topic}`,
            '',
            'Architecture: Microservices approach approved. Action: Implement rate limiting immediately.',
            'Security: End-to-end encryption required for all user data. Action: Audit security configuration.',
            'Quality: < 200ms latency target. Action: Add load testing and chaos engineering to pipeline.',
        ].join('\n');
    }

    async addTranscript(speakerId, text) {
        const entry = {
            id: Date.now(),
            speaker: speakerId === 'moderator' ? 'Moderator' : PERSONAS[speakerId]?.name || speakerId,
            speakerId,
            text,
            timestamp: new Date()
        };
        this.meetingState.transcript.push(entry);

        // Persist to memory/db if needed
        await this.addToMemory(entry);
    }

    getMeetingStatus() {
        return {
            ...this.meetingState,
            personas: PERSONAS
        };
    }

    stopMeeting() {
        this.meetingState.isActive = false;
        this.meetingState.currentSpeaker = null;
        console.log('[StaffMeeting] Meeting stopped by user');
        return { message: 'Meeting stopped' };
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
