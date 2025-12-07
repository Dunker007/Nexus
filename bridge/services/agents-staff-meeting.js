/**
 * Staff Meeting Agent - The Orchestrator
 * Manages a debate between multiple specialized AI agents
 */

import { Agent } from './agent-core.js';

// Persona definitions
const PERSONAS = {
    architect: {
        id: 'architect',
        name: 'The Architect',
        role: 'System Design',
        color: '#a855f7', // Purple
        prompt: 'You are a Senior System Architect. Focus on scalability, clean patterns, and trade-offs. Be visionary but practical.'
    },
    security: {
        id: 'security',
        name: 'SecOps Lead',
        role: 'Security',
        color: '#ef4444', // Red
        prompt: 'You are a Paranoid Security Officer. Find vulnerabilities, data leaks, and auth flaws. Trust no one.'
    },
    qa: {
        id: 'qa',
        name: 'QA Director',
        role: 'Quality',
        color: '#eab308', // Yellow
        prompt: 'You are a QA Director. Focus on edge cases, user experience, and testing strategies. Be pedantic.'
    }
};

export class StaffMeetingAgent extends Agent {
    constructor() {
        super({
            id: 'staff-meeting',
            name: 'Staff Meeting',
            description: 'Orchestrates multi-agent debates and collaboration',
            capabilities: ['orchestration', 'debate-moderation', 'synthesis']
        });

        this.meetingState = {
            isActive: false,
            topic: null,
            round: 0,
            transcript: [], // { speaker, text, timestamp }
            currentSpeaker: null,
            consensus: null
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

    async startMeeting(topic) {
        if (this.meetingState.isActive) {
            throw new Error('Meeting already in progress');
        }

        this.meetingState = {
            isActive: true,
            topic,
            round: 1,
            transcript: [],
            currentSpeaker: 'moderator',
            consensus: null
        };

        // Start the meeting loop in background (don't await it here)
        this.runMeetingLoop(topic);

        return {
            message: 'Meeting started',
            topic,
            timestamp: new Date()
        };
    }

    async runMeetingLoop(topic) {
        try {
            // Intro
            await this.addTranscript('moderator', `Meeting started. Topic: "${topic}"`);
            await this.wait(1000);

            // Round 1: Initial Thoughts
            await this.addTranscript('moderator', 'Round 1: Initial Thoughts. Architect, please start.');

            await this.agentSpeak('architect', topic, 'initial');
            await this.agentSpeak('security', topic, 'initial');
            await this.agentSpeak('qa', topic, 'initial');

            // Round 2: Debate/Critique
            await this.addTranscript('moderator', 'Round 2: Security Review. Security, do you have concerns?');
            await this.agentSpeak('security', topic, 'critique');

            await this.addTranscript('moderator', 'Architect, your response?');
            await this.agentSpeak('architect', topic, 'defense');

            // Round 3: Consensus
            await this.addTranscript('moderator', 'Round 3: Final Consensus.');
            const consensus = await this.synthesizeConsensus(topic);

            this.meetingState.consensus = consensus;
            this.meetingState.isActive = false;
            this.meetingState.currentSpeaker = null;

            await this.addTranscript('moderator', 'Meeting adjourned.');

        } catch (error) {
            console.error('Meeting loop error:', error);
            this.meetingState.isActive = false;
            await this.addTranscript('moderator', `Error: ${error.message}`);
        }
    }

    async agentSpeak(personaId, topic, phase) {
        const persona = PERSONAS[personaId];
        this.meetingState.currentSpeaker = personaId;

        // Simulate "Thinking" delay
        await this.wait(1500 + Math.random() * 1000);

        // Generate content (Mocked for speed/reliability in this demo, 
        // but structured to easily swap with this.generateLLMResponse)
        const content = await this.generateMockResponse(persona, topic, phase);

        await this.addTranscript(personaId, content);
        this.meetingState.currentSpeaker = null;
        await this.wait(1000);
    }

    async generateMockResponse(persona, topic, phase) {
        // In a real implementation, this would call lmstudioService
        // const prompt = `Role: ${persona.prompt}\nTopic: ${topic}\nPhase: ${phase}...`;
        // return await lmstudioService.complete(prompt);

        const responses = {
            architect: {
                initial: `For "${topic}", I propose a microservices architecture using Node.js and Redis for high throughput. We need to ensure the API gateway is robust.`,
                defense: `Valid concern, Security. We can implement rate limiting at the gateway level and use strict JWT validation to mitigate those risks.`
            },
            security: {
                initial: `I'm seeing potential PII risks with "${topic}". We need end-to-end encryption and a strict audit log for every access event.`,
                critique: `The proposed architecture exposes too many public endpoints. If the Redis instance isn't sandboxed, we're looking at a major data leak vector.`
            },
            qa: {
                initial: `From a UX perspective, "${topic}" needs to be snappy. I'm worried about latency. Also, how do we test this under poor network conditions?`,
                defense: `I agree. We need automated load testing in the CI/CD pipeline before we can sign off on this.`
            }
        };

        // Return specific response or a generic fallback
        return responses[persona.id]?.[phase] || `I have some thoughts on ${topic} regarding ${persona.role}.`;
    }

    async synthesizeConsensus(topic) {
        return `
# Meeting Consensus: ${topic}

## Architecture
- Microservices approach approved.
- **Action:** Implement Rate Limiting immediately.

## Security
- **Requirement:** End-to-end encryption for all user data.
- **Action:** Audit Redis security configuration.

## Quality
- **Requirement:** < 200ms latency target.
- **Action:** Add chaos testing to pipeline.
        `.trim();
    }

    async addTranscript(speakerId, text) {
        const entry = {
            id: Date.now(),
            speaker: speakerId === 'moderator' ? 'Moderator' : PERSONAS[speakerId].name,
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
        return { message: 'Meeting stopped' };
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
