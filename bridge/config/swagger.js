/**
 * Swagger/OpenAPI Configuration and Documentation
 * Comprehensive API documentation for LuxRig Bridge
 */

export const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'LuxRig Bridge API',
        version: '2.0.0',
        description: `
# LuxRig Bridge - Production-Ready Agentic AI Platform

A comprehensive API that orchestrates local LLMs (LM Studio, Ollama), Google services, 
and autonomous AI agents for complex task execution.

## Features

- **🤖 Agentic AI** - Autonomous agents (Research, Code, Workflow, Architect, QA, Security, DevOps)
- **🧠 Multi-Provider LLM** - Seamless integration with LM Studio and Ollama
- **🔐 Google Integration** - OAuth 2.0 + PKCE, Calendar, Drive
- **📊 Real-time Monitoring** - Performance metrics, error tracking, health checks
- **🔒 Security** - PKCE, CSRF protection, token encryption, rate limiting

## Authentication

### Google OAuth
Use the \`/auth/google\` endpoint to initiate OAuth flow with PKCE support.

### API Access Tokens
Include tokens in the \`Authorization: Bearer <token>\` header.

## Rate Limits
- Global: 100 requests/minute
- LLM endpoints: 20 requests/minute
- Agent execution: 10 requests/minute
        `,
        contact: {
            name: 'DXL Studio',
            url: 'https://dxlstudio.ai'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: 'http://localhost:3456',
            description: 'Development server'
        },
        {
            url: 'https://api.dxlstudio.ai',
            description: 'Production server (future)'
        }
    ],
    tags: [
        { name: 'Health', description: 'System health and status endpoints' },
        { name: 'LLM', description: 'Large Language Model operations' },
        { name: 'Agents', description: 'Autonomous AI agent management' },
        { name: 'Google', description: 'Google OAuth and API integration' },
        { name: 'Monitoring', description: 'Performance and error monitoring' },
        { name: 'System', description: 'System metrics and resources' },
        { name: 'Staff Meeting', description: 'Multi-agent collaboration' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Google OAuth access token or API key'
            },
            sessionAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-Session-ID',
                description: 'Session ID for authenticated requests'
            },
            csrfToken: {
                type: 'apiKey',
                in: 'header',
                name: 'X-CSRF-Token',
                description: 'CSRF token for state-changing operations'
            }
        },
        schemas: {
            // Health & Status
            HealthCheck: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', description: 'Server uptime in seconds' },
                    services: {
                        type: 'object',
                        properties: {
                            lmstudio: { type: 'string', enum: ['up', 'down'] },
                            ollama: { type: 'string', enum: ['up', 'down'] },
                            system: { type: 'string', enum: ['up', 'degraded', 'down'] }
                        }
                    },
                    memory: {
                        type: 'object',
                        properties: {
                            used: { type: 'number' },
                            total: { type: 'number' },
                            external: { type: 'number' }
                        }
                    }
                }
            },

            // LLM
            ChatMessage: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                    role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                    content: { type: 'string' }
                }
            },
            ChatRequest: {
                type: 'object',
                required: ['messages'],
                properties: {
                    messages: {
                        type: 'array',
                        items: { '$ref': '#/components/schemas/ChatMessage' }
                    },
                    model: { type: 'string', description: 'Model name (optional)' },
                    provider: { type: 'string', enum: ['lmstudio', 'ollama'], description: 'LLM provider' }
                }
            },
            ChatResponse: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    object: { type: 'string' },
                    created: { type: 'number' },
                    model: { type: 'string' },
                    choices: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                index: { type: 'number' },
                                message: { '$ref': '#/components/schemas/ChatMessage' },
                                finish_reason: { type: 'string' }
                            }
                        }
                    },
                    usage: {
                        type: 'object',
                        properties: {
                            prompt_tokens: { type: 'number' },
                            completion_tokens: { type: 'number' },
                            total_tokens: { type: 'number' }
                        }
                    }
                }
            },
            Model: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    size: { type: 'number' },
                    modified: { type: 'string', format: 'date-time' }
                }
            },

            // Agents
            AgentType: {
                type: 'string',
                enum: ['research', 'code', 'workflow', 'architect', 'qa', 'security', 'devops', 'revenue'],
                description: 'Type of AI agent'
            },
            AgentTask: {
                type: 'object',
                required: ['agentType', 'task'],
                properties: {
                    agentType: { '$ref': '#/components/schemas/AgentType' },
                    task: {
                        type: 'object',
                        description: 'Task-specific parameters',
                        additionalProperties: true
                    },
                    context: {
                        type: 'object',
                        description: 'Additional context for the task',
                        additionalProperties: true
                    }
                }
            },
            AgentResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    agent: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            status: { type: 'string' }
                        }
                    },
                    result: {
                        type: 'object',
                        description: 'Task execution result',
                        additionalProperties: true
                    }
                }
            },
            Agent: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['idle', 'working', 'error'] },
                    capabilities: { type: 'array', items: { type: 'string' } },
                    memorySize: { type: 'number' }
                }
            },

            // Staff Meeting
            StaffMeetingRequest: {
                type: 'object',
                required: ['topic'],
                properties: {
                    topic: { type: 'string', description: 'Meeting topic/goal' },
                    participants: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Agent types to include',
                        default: ['architect', 'security', 'qa']
                    },
                    rounds: { type: 'number', default: 2, description: 'Number of debate rounds' }
                }
            },
            StaffMeetingResponse: {
                type: 'object',
                properties: {
                    meetingId: { type: 'string' },
                    topic: { type: 'string' },
                    participants: { type: 'array', items: { type: 'string' } },
                    transcript: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                agent: { type: 'string' },
                                round: { type: 'number' },
                                message: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' }
                            }
                        }
                    },
                    consensus: { type: 'string' },
                    actionItems: { type: 'array', items: { type: 'string' } }
                }
            },

            // Google
            GoogleAuthUrl: {
                type: 'object',
                properties: {
                    authUrl: { type: 'string', format: 'uri' },
                    state: { type: 'string' },
                    codeChallenge: { type: 'string' }
                }
            },
            GoogleTokens: {
                type: 'object',
                properties: {
                    access_token: { type: 'string' },
                    refresh_token: { type: 'string' },
                    expires_in: { type: 'number' },
                    token_type: { type: 'string' }
                }
            },
            GoogleUser: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    picture: { type: 'string', format: 'uri' }
                }
            },
            CalendarEvent: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    summary: { type: 'string' },
                    description: { type: 'string' },
                    start: { type: 'object' },
                    end: { type: 'object' },
                    htmlLink: { type: 'string', format: 'uri' }
                }
            },
            DriveFile: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    mimeType: { type: 'string' },
                    modifiedTime: { type: 'string', format: 'date-time' },
                    size: { type: 'string' },
                    webViewLink: { type: 'string', format: 'uri' }
                }
            },

            // Monitoring
            ErrorLog: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    type: { type: 'string' },
                    message: { type: 'string' },
                    stack: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    metadata: { type: 'object' }
                }
            },
            PerformanceStats: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    count: { type: 'number' },
                    avg: { type: 'number' },
                    min: { type: 'number' },
                    max: { type: 'number' },
                    p50: { type: 'number' },
                    p95: { type: 'number' },
                    p99: { type: 'number' },
                    slowRequests: { type: 'number' }
                }
            },

            // System
            SystemMetrics: {
                type: 'object',
                properties: {
                    cpu: { type: 'object' },
                    memory: { type: 'object' },
                    gpu: {
                        type: 'object',
                        properties: {
                            available: { type: 'boolean' },
                            name: { type: 'string' },
                            memory: { type: 'object' },
                            utilization: { type: 'number' },
                            temperature: { type: 'number' }
                        }
                    }
                }
            },

            // Error
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    code: { type: 'string' },
                    details: { type: 'object' }
                }
            }
        },
        responses: {
            Unauthorized: {
                description: 'Authentication required',
                content: {
                    'application/json': {
                        schema: { '$ref': '#/components/schemas/Error' }
                    }
                }
            },
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: { '$ref': '#/components/schemas/Error' }
                    }
                }
            },
            RateLimited: {
                description: 'Rate limit exceeded',
                content: {
                    'application/json': {
                        schema: { '$ref': '#/components/schemas/Error' }
                    }
                }
            },
            ServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: { '$ref': '#/components/schemas/Error' }
                    }
                }
            }
        }
    }
};

// Path documentation - will be merged with inline JSDoc
export const paths = {
    '/': {
        get: {
            tags: ['Health'],
            summary: 'API Information',
            description: 'Get basic API information and available endpoints',
            responses: {
                '200': {
                    description: 'API information',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    version: { type: 'string' },
                                    status: { type: 'string' },
                                    endpoints: { type: 'object' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/health': {
        get: {
            tags: ['Health'],
            summary: 'Health Check',
            description: 'Get detailed system health status including all services',
            responses: {
                '200': {
                    description: 'System is healthy',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/HealthCheck' }
                        }
                    }
                },
                '503': {
                    description: 'System is unhealthy',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/HealthCheck' }
                        }
                    }
                }
            }
        }
    },
    '/status': {
        get: {
            tags: ['Health'],
            summary: 'Full System Status',
            description: 'Get comprehensive system status including all services, agents, and errors',
            responses: {
                '200': {
                    description: 'Full system status',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object'
                            }
                        }
                    }
                }
            }
        }
    },
    '/llm/models': {
        get: {
            tags: ['LLM'],
            summary: 'List All Models',
            description: 'Get all available models from all LLM providers (LM Studio + Ollama)',
            responses: {
                '200': {
                    description: 'List of models',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    lmstudio: {
                                        type: 'array',
                                        items: { '$ref': '#/components/schemas/Model' }
                                    },
                                    ollama: {
                                        type: 'array',
                                        items: { '$ref': '#/components/schemas/Model' }
                                    },
                                    total: { type: 'number' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/llm/chat': {
        post: {
            tags: ['LLM'],
            summary: 'Chat Completion',
            description: 'Send a chat completion request to the specified LLM provider',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { '$ref': '#/components/schemas/ChatRequest' },
                        example: {
                            messages: [
                                { role: 'system', content: 'You are a helpful assistant.' },
                                { role: 'user', content: 'Hello, how are you?' }
                            ],
                            provider: 'lmstudio'
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Chat completion response',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/ChatResponse' }
                        }
                    }
                }
            }
        }
    },
    '/agents': {
        get: {
            tags: ['Agents'],
            summary: 'List Active Agents',
            description: 'Get all currently active AI agents',
            responses: {
                '200': {
                    description: 'List of agents',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    agents: {
                                        type: 'array',
                                        items: { '$ref': '#/components/schemas/Agent' }
                                    },
                                    total: { type: 'number' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/agents/execute': {
        post: {
            tags: ['Agents'],
            summary: 'Execute Agent Task',
            description: 'Execute a task using the specified AI agent type',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { '$ref': '#/components/schemas/AgentTask' },
                        examples: {
                            research: {
                                summary: 'Research Task',
                                value: {
                                    agentType: 'research',
                                    task: { query: 'Latest trends in AI development' }
                                }
                            },
                            code: {
                                summary: 'Code Generation',
                                value: {
                                    agentType: 'code',
                                    task: {
                                        action: 'generate',
                                        description: 'Create a REST API endpoint for user authentication'
                                    }
                                }
                            },
                            architect: {
                                summary: 'Architecture Design',
                                value: {
                                    agentType: 'architect',
                                    task: {
                                        type: 'system_design',
                                        requirements: 'Design a scalable microservices architecture'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Task execution result',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/AgentResponse' }
                        }
                    }
                }
            }
        }
    },
    '/agents/meeting': {
        post: {
            tags: ['Staff Meeting'],
            summary: 'Start AI Staff Meeting',
            description: 'Initiate a multi-agent debate/collaboration session',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { '$ref': '#/components/schemas/StaffMeetingRequest' },
                        example: {
                            topic: 'Design a secure authentication system',
                            participants: ['architect', 'security', 'qa'],
                            rounds: 2
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Meeting results',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/StaffMeetingResponse' }
                        }
                    }
                }
            }
        }
    },
    '/auth/google': {
        get: {
            tags: ['Google'],
            summary: 'Get Google OAuth URL',
            description: 'Generate OAuth 2.0 authorization URL with optional PKCE support',
            parameters: [
                {
                    name: 'usePkce',
                    in: 'query',
                    schema: { type: 'boolean', default: true },
                    description: 'Use PKCE for enhanced security'
                }
            ],
            responses: {
                '200': {
                    description: 'OAuth URL and state',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/GoogleAuthUrl' }
                        }
                    }
                }
            }
        }
    },
    '/auth/google/callback': {
        get: {
            tags: ['Google'],
            summary: 'OAuth Callback',
            description: 'Handle OAuth callback and exchange code for tokens',
            parameters: [
                {
                    name: 'code',
                    in: 'query',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Authorization code'
                },
                {
                    name: 'state',
                    in: 'query',
                    required: true,
                    schema: { type: 'string' },
                    description: 'State parameter for CSRF validation'
                }
            ],
            responses: {
                '200': {
                    description: 'Authentication successful',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/GoogleTokens' }
                        }
                    }
                }
            }
        }
    },
    '/google/user': {
        get: {
            tags: ['Google'],
            summary: 'Get User Info',
            description: 'Get authenticated user information from Google',
            security: [{ bearerAuth: [] }],
            responses: {
                '200': {
                    description: 'User information',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/GoogleUser' }
                        }
                    }
                },
                '401': { '$ref': '#/components/responses/Unauthorized' }
            }
        }
    },
    '/google/calendar/events': {
        get: {
            tags: ['Google'],
            summary: 'List Calendar Events',
            description: 'Get upcoming events from Google Calendar',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'maxResults',
                    in: 'query',
                    schema: { type: 'integer', default: 10 },
                    description: 'Maximum number of events to return'
                }
            ],
            responses: {
                '200': {
                    description: 'List of calendar events',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { '$ref': '#/components/schemas/CalendarEvent' }
                            }
                        }
                    }
                }
            }
        }
    },
    '/google/drive/files': {
        get: {
            tags: ['Google'],
            summary: 'List Drive Files',
            description: 'Get files from Google Drive',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'maxResults',
                    in: 'query',
                    schema: { type: 'integer', default: 10 },
                    description: 'Maximum number of files to return'
                }
            ],
            responses: {
                '200': {
                    description: 'List of drive files',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { '$ref': '#/components/schemas/DriveFile' }
                            }
                        }
                    }
                }
            }
        }
    },
    '/monitoring/errors': {
        get: {
            tags: ['Monitoring'],
            summary: 'Get Error Logs',
            description: 'Retrieve error logs and statistics',
            parameters: [
                {
                    name: 'limit',
                    in: 'query',
                    schema: { type: 'integer', default: 100 },
                    description: 'Maximum number of errors to return'
                }
            ],
            responses: {
                '200': {
                    description: 'Error logs and stats',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    errors: {
                                        type: 'array',
                                        items: { '$ref': '#/components/schemas/ErrorLog' }
                                    },
                                    stats: { type: 'object' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/monitoring/performance': {
        get: {
            tags: ['Monitoring'],
            summary: 'Get Performance Stats',
            description: 'Retrieve performance metrics and cache statistics',
            responses: {
                '200': {
                    description: 'Performance statistics',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    stats: {
                                        type: 'object',
                                        additionalProperties: { '$ref': '#/components/schemas/PerformanceStats' }
                                    },
                                    cache: { type: 'object' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/system': {
        get: {
            tags: ['System'],
            summary: 'Get System Metrics',
            description: 'Get real-time system metrics including CPU, memory, and GPU',
            responses: {
                '200': {
                    description: 'System metrics',
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/SystemMetrics' }
                        }
                    }
                }
            }
        }
    },
    '/system/gpu': {
        get: {
            tags: ['System'],
            summary: 'Get GPU Stats',
            description: 'Get detailed GPU statistics from nvidia-smi',
            responses: {
                '200': {
                    description: 'GPU statistics',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    available: { type: 'boolean' },
                                    name: { type: 'string' },
                                    memory: { type: 'object' },
                                    utilization: { type: 'number' },
                                    temperature: { type: 'number' },
                                    power: { type: 'object' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Merge paths into definition
export const swaggerSpec = {
    ...swaggerDefinition,
    paths
};

export default swaggerSpec;
