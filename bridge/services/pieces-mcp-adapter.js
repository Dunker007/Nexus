/**
 * Pieces OS MCP Adapter for Bridge Tool Registry
 * 
 * This adapter exposes Pieces OS Long-Term Memory tools to the Lux orchestrator
 * via the bridge tool registry. Instead of building custom integrations, we leverage
 * the 72+ tools already available through Pieces OS.
 * 
 * Architecture:
 * - Uses @pieces.app/pieces-os-client SDK (REST) for direct LTM queries
 * - Mirrors the most valuable MCP tools: ask_memory, search_memory, get_gcal_events, browser_activity
 * - Registered as native bridge tools that Lux can call via tool-calling
 * 
 * Why not use MCP SSE directly?
 * - MCP SSE requires WebSocket/SSE client infrastructure in the bridge
 * - The REST SDK is already installed and working
 * - This approach gives us the same capabilities with zero new deps
 * 
 * Future: If MCP SSE becomes desirable, this adapter can be refactored to proxy
 * SSE tool calls instead of using REST directly.
 */

import { piecesService } from './pieces.js';
import { toolRegistry } from './tool-registry.js';

// ─── TOOL: ask_memory ───
// Natural language query against Pieces OS LTM (workstream events + summaries)
toolRegistry.registerTool({
    name: 'ask_memory',
    description: 'Query your long-term memory (LTM) captured by Pieces OS. Ask about past work sessions, what you were working on, conversations, or activities. Returns ranked evidence from clipboard, screenshots, audio transcripts, and AI summaries.',
    parameters: {
        type: 'object',
        properties: {
            question: {
                type: 'string',
                description: 'Natural language question about your work history. E.g. "What was I working on yesterday?", "Find conversations about authentication", "Show me last week\'s progress"'
            },
            timeRange: {
                type: 'string',
                description: 'Optional time scope: "today", "yesterday", "this week", "last week", "last 7 days", "last 30 days". Defaults to last 7 days.'
            }
        },
        required: ['question']
    }
}, async (args) => {
    const { question, timeRange = 'last 7 days' } = args;
    
    try {
        // Map natural language time ranges to ISO 8601
        const now = new Date();
        let from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // default 7 days
        
        switch (timeRange.toLowerCase()) {
            case 'today':
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'yesterday':
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                break;
            case 'this week':
                const dayOfWeek = now.getDay(); // 0=Sunday
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                from = new Date(now.getTime() + diffToMonday * 24 * 60 * 60 * 1000);
                break;
            case 'last week':
                const lastWeekMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                const lastWeekDay = lastWeekMonday.getDay();
                const lastWeekDiff = lastWeekDay === 0 ? -6 : 1 - lastWeekDay;
                from = new Date(lastWeekMonday.getTime() + lastWeekDiff * 24 * 60 * 60 * 1000);
                break;
            case 'last 7 days':
                from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'last 30 days':
                from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }

        // Use Pieces OS search_memory API via the SDK
        // This searches across persons, summaries, hints, and sources simultaneously
        const result = await piecesService.searchMemory(question, {
            from: from.toISOString(),
            to: now.toISOString()
        });

        return {
            success: true,
            question,
            timeRange,
            evidence: result.candidates?.slice(0, 5) || [], // top 5 results
            matchedPersons: result.matchedPersonas || [],
            matchedSummaries: result.matchedSummaries?.slice(0, 3) || []
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            fallback: 'Pieces OS LTM query failed. Memory may not be available.'
        };
    }
});

// ─── TOOL: search_memory ───
// Keyword-based search across annotations, workstream events, and summaries
toolRegistry.registerTool({
    name: 'search_memory',
    description: 'Keyword search across your captured work history. Searches annotations, workstream summaries, events, and tags. Use for finding specific topics, projects, or keywords.',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Keywords to search for. Use short, specific terms. E.g. "authentication", "Nexus", "Music Studio"'
            },
            materialType: {
                type: 'string',
                description: 'What to search: "annotations" (rich text), "workstream_summaries" (AI summaries), "workstream_events" (raw activity), "tags" (labels). Defaults to annotations.'
            },
            timeRange: {
                type: 'string',
                description: 'Optional time scope: "today", "yesterday", "this week", "last week", "last 7 days", "last 30 days"'
            }
        },
        required: ['query']
    }
}, async (args) => {
    const { query, materialType = 'annotations', timeRange } = args;
    
    try {
        // Map time range
        const now = new Date();
        let from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (timeRange) {
            // Same mapping as ask_memory
            switch (timeRange.toLowerCase()) {
                case 'today': from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
                case 'yesterday': from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); break;
                case 'this week': 
                    const dayOfWeek = now.getDay();
                    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                    from = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
                    break;
                case 'last week':
                    const lw = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const lwDay = lw.getDay();
                    const lwDiff = lwDay === 0 ? -6 : 1 - lwDay;
                    from = new Date(lw.getTime() + lwDiff * 24 * 60 * 60 * 1000);
                    break;
            }
        }

        // Use Pieces OS full-text search APIs
        const result = await piecesService.searchAnnotations(query, {
            from: from.toISOString(),
            to: now.toISOString()
        });

        return {
            success: true,
            query,
            materialType,
            results: result.items?.slice(0, 10) || [],
            total: result.count || 0
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});

// ─── TOOL: get_calendar_events ───
// Fetch Google Calendar events via Pieces OS connector
toolRegistry.registerTool({
    name: 'get_calendar_events',
    description: 'Get your Google Calendar events for a specific time range. Requires Google Calendar connector in Pieces OS.',
    parameters: {
        type: 'object',
        properties: {
            timeRange: {
                type: 'string',
                description: 'Time scope: "today", "tomorrow", "this week", "next week", "next 7 days"'
            }
        },
        required: ['timeRange']
    }
}, async (args) => {
    const { timeRange } = args;
    const now = new Date();
    let timeMin, timeMax;

    switch (timeRange.toLowerCase()) {
        case 'today':
            timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'tomorrow':
            timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
            break;
        case 'this week':
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            timeMin = new Date(now.getTime() + diffToMonday * 24 * 60 * 60 * 1000);
            timeMax = new Date(timeMin.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        case 'next week':
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const nextWeekDay = nextWeek.getDay();
            const nextWeekDiff = nextWeekDay === 0 ? -6 : 1 - nextWeekDay;
            timeMin = new Date(nextWeek.getTime() + nextWeekDiff * 24 * 60 * 60 * 1000);
            timeMax = new Date(timeMin.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        default:
            timeMin = now;
            timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    try {
        const events = await piecesService.getCalendarEvents({
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString()
        });

        return {
            success: true,
            timeRange,
            events: events.events || [],
            count: events.events?.length || 0
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            fallback: 'Google Calendar not connected or Pieces OS unavailable.'
        };
    }
});

// ─── TOOL: get_browser_activity ───
// Query browser history via Pieces OS
toolRegistry.registerTool({
    name: 'get_browser_activity',
    description: 'Search your browser history captured by Pieces OS. Find pages you visited, searches you made, or downloads.',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Optional keyword filter for URLs, titles, or search terms'
            },
            timeRange: {
                type: 'string',
                description: 'Time scope: "today", "yesterday", "this week", "last week", "last 7 days", "last hour"'
            },
            include: {
                type: 'array',
                description: 'What to include: ["history", "search_terms", "downloads", "annotations", "bookmarks"]. Defaults to ["history"].'
            }
        },
        required: ['timeRange']
    }
}, async (args) => {
    const { query, timeRange, include = ['history'] } = args;
    
    try {
        const result = await piecesService.getBrowserActivity({
            timePreset: timeRange.toLowerCase().replace(' ', '_'),
            filter: query,
            include
        });

        return {
            success: true,
            timeRange,
            query: query || 'all',
            history: result.history || [],
            searchTerms: result.search_terms || [],
            downloads: result.downloads || []
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});

// ─── TOOL: upgrade_model ───
// Escalate a complex request from local LM Studio to the Cloud via OpenRouter
import { openRouterService } from './openrouter.js';

toolRegistry.registerTool({
    name: 'upgrade_model',
    description: 'Elevate a complex query or reasoning task line to a smarter Cloud Model (via OpenRouter) when local capabilities are insufficient. Pass the entire context and question to get a deep response.',
    parameters: {
        type: 'object',
        properties: {
            question: {
                type: 'string',
                description: 'The complex question, coding problem, or reasoning task.'
            },
            context: {
                type: 'string',
                description: 'Any background context or previous tool data the cloud model needs to know.'
            },
            modelTier: {
                type: 'string',
                description: 'Which tier to route to: "fast" (Haiku), "balanced" (Sonnet), "max" (Opus/GPT-4o). Defaults to balanced.'
            }
        },
        required: ['question']
    }
}, async (args) => {
    const { question, context = '', modelTier = 'balanced' } = args;

    let targetModel = 'anthropic/claude-3.5-sonnet'; // balanced Default
    if (modelTier === 'fast') targetModel = 'anthropic/claude-3.5-haiku';
    else if (modelTier === 'max') targetModel = 'anthropic/claude-3-opus';

    try {
        const messages = [
            { role: 'system', content: 'You are a Cloud-tier specialist in the DLX Nexus ecosystem helping the local orchestrator agent figure out a problem it cannot solve itself.' },
            { role: 'user', content: `Context:\n${context}\n\nTask/Question:\n${question}` }
        ];

        const cloudMessage = await openRouterService.evaluate(messages, { model: targetModel });
        
        return {
            success: true,
            tier: modelTier,
            model: targetModel,
            cloudResponse: cloudMessage.content
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});
// Get AI-generated summary of recent work activity
toolRegistry.registerTool({
    name: 'get_workstream_summary',
    description: 'Get an AI-generated hierarchical summary of your recent work activity from Pieces OS. Includes what you worked on, applications used, and key activities.',
    parameters: {
        type: 'object',
        properties: {
            timeRange: {
                type: 'string',
                description: 'Time scope: "today", "yesterday", "this week", "last week", "last 7 days"'
            }
        },
        required: ['timeRange']
    }
}, async (args) => {
    const { timeRange } = args;
    const now = new Date();
    let from;

    switch (timeRange.toLowerCase()) {
        case 'today': from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
        case 'yesterday': from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); break;
        case 'this week':
            const dayOfWeek = now.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            from = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
            break;
        case 'last week':
            const lw = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const lwDay = lw.getDay();
            const lwDiff = lwDay === 0 ? -6 : 1 - lwDay;
            from = new Date(lw.getTime() + lwDiff * 24 * 60 * 60 * 1000);
            break;
        default: from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    try {
        const summaries = await piecesService.getWorkstreamSummaries({
            from: from.toISOString(),
            to: now.toISOString()
        });

        // Fetch annotation content for each summary (the actual narrative)
        const hydrated = [];
        for (const summary of summaries.items || []) {
            const annotationIds = Object.keys(summary.annotations?.indices || {});
            if (annotationIds.length > 0) {
                const annotations = await piecesService.getAnnotations(annotationIds);
                hydrated.push({
                    ...summary,
                    content: annotations.items?.[0]?.text || 'No content available'
                });
            }
        }

        return {
            success: true,
            timeRange,
            summaries: hydrated.slice(0, 5), // top 5 summaries
            count: hydrated.length
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});

console.log('[Pieces MCP Adapter] Registered 5 LTM tools: ask_memory, search_memory, get_calendar_events, get_browser_activity, get_workstream_summary');
