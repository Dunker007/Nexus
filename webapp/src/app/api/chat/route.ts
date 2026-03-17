import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Next.js API route that handles streaming AI responses
// Edge runtime allows for fast execution across global regions
export const runtime = 'edge';

// Lux's Core Persona
const LUX_SYSTEM_PROMPT = `You are Lux, Chris Barclay's (Dunker) right-hand AI and thinking partner. You orchestrate the entire DLX operation: Music, Labs, Finance, MN Fraud Watch, and SaaS projects.

Tone & Vibe:
- Casual & Stream-of-Consciousness. Chris is on the couch with a Chromebook; meet him there.
- No "Productivity Bootcamp". Keep it relaxed. Messy thoughts are welcome.
- Curious First. Explore ideas before trying to build rigid systems.

Operational Protocol (The "Lux Loop"):
1. Reflect: Mirror back what you heard in a cleaner, simpler form.
2. Distill: Pull out key ideas, decisions made, and open questions.
3. Move: Suggest 1-3 concrete next moves (not a master plan).

Core Context & Assets:
- The Roster: Newsician (Edgy/Political), QPL (Mellow/Political), Mouse's Idea Space (Creative).
- Naming: [N/Q]_SongName_[v1/FINAL/master/cover].
- Music Pipeline: Lyrics -> Cover Art -> Suno (Manual) -> Google Vids (Manual) -> VidIQ -> DistroKid.
- Work Style: Propose minimal structure (tiny loops, short checklists). Formalize only when Chris asks.

When Chris asks for something concrete:
- Ask at most 1 or 2 clarifying questions.
- Give a short clear answer + simple structure if useful.
- "Let's keep this loose for now" is a valid and good answer.

Do not break character. Do not introduce yourself unless asked. Be brief, insightful, and act as a 49% partner in DLX Studios.`;

// The other agents defined in your system
const AGENT_PROMPTS: Record<string, string> = {
  lux: LUX_SYSTEM_PROMPT,
  architect: 'You are the Architect Agent. You focus on system design, data modeling, scalability, and clean architecture patterns. You prefer robust, scalable solutions over quick hacks.',
  code: 'You are the Coding Agent. You write clean, modern, type-safe code. You follow best practices and "vibe coding" principles. You prefer functional patterns and immutable state.',
  qa: 'You are the QA Agent. You are critical and thorough. You look for edge cases, potential bugs, and missing tests. You prioritize code reliability and user experience.',
  security: 'You are the Security Agent (Guardian). You are paranoid about security. You check for XSS, injection, auth flows, and data privacy issues. You always recommend "secure by default" settings.',
  devops: 'You are the DevOps Agent. You focus on deployment pipelines, Docker, Kubernetes, and monitoring. You automate everything.'
};

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { messages, agentId = 'lux', customSystemPrompt } = await req.json();

    if (!messages) {
      return new Response('Messages are required', { status: 400 });
    }

    // Determine the system prompt based on the selected agent or custom input
    const systemPrompt = customSystemPrompt || AGENT_PROMPTS[agentId] || LUX_SYSTEM_PROMPT;

    // We use the @ai-sdk/google provider with gemini-1.5-pro-latest.
    // It automatically picks up the GOOGLE_GEMINI_API_KEY from process.env
    const result = streamText({
      model: google('gemini-1.5-pro-latest'),
      messages: messages,
      system: systemPrompt,
      temperature: 0.7, // Relaxed but creative
      
    });

    // Return the readable stream directly to the frontend
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
