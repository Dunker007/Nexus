
import { jest } from '@jest/globals';
import { Agent, ResearchAgent, CodeAgent, createAgent, agentRegistry } from '../../services/agents.js';

// Mock database
jest.mock('../../services/database.js', () => ({
    agentMemory: {
        getAll: jest.fn().mockResolvedValue({ entries: [] }),
        set: jest.fn().mockResolvedValue(true),
        clear: jest.fn().mockResolvedValue(true)
    }
}));

describe('Agent System', () => {
    describe('Base Agent', () => {
        let agent;

        beforeEach(() => {
            agent = new Agent({
                id: 'test-agent',
                name: 'Test Agent',
                description: 'A test agent'
            });
        });

        test('should initialize with correct properties', () => {
            expect(agent.id).toBe('test-agent');
            expect(agent.name).toBe('Test Agent');
            expect(agent.status).toBe('idle');
            expect(agent.memory).toEqual([]);
        });

        test('should add to memory', async () => {
            const entry = { task: 'test', result: 'success' };
            await agent.addToMemory(entry);
            expect(agent.memory).toHaveLength(1);
            expect(agent.memory[0]).toEqual(entry);
        });

        test('should limit memory size', async () => {
            // Add 105 entries
            for (let i = 0; i < 105; i++) {
                await agent.addToMemory({ id: i });
            }
            expect(agent.memory).toHaveLength(100);
            expect(agent.memory[99].id).toBe(104);
        });

        test('should update status during execution', async () => {
            agent.processTask = jest.fn().mockResolvedValue('result');

            const promise = agent.execute('task');
            expect(agent.status).toBe('running');

            await promise;
            expect(agent.status).toBe('completed');
        });

        test('should handle execution errors', async () => {
            agent.processTask = jest.fn().mockRejectedValue(new Error('Task failed'));

            await expect(agent.execute('task')).rejects.toThrow('Task failed');
            expect(agent.status).toBe('failed');
        });
    });

    describe('Research Agent', () => {
        let agent;

        beforeEach(() => {
            agent = new ResearchAgent();
        });

        test('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('web-search');
            expect(agent.capabilities).toContain('document-analysis');
        });

        test('should process research task', async () => {
            const task = { query: 'test query', sources: ['web'] };
            const result = await agent.processTask(task);

            expect(result.query).toBe('test query');
            expect(result.sources).toHaveLength(1);
            expect(result.sources[0].source).toBe('web');
        });
    });

    describe('Code Agent', () => {
        let agent;

        beforeEach(() => {
            agent = new CodeAgent();
        });

        test('should detect security issues in review', async () => {
            const code = 'eval("alert(1)")';
            const result = await agent.reviewCode(code, 'javascript');

            expect(result.issues).toHaveLength(1);
            expect(result.issues[0].severity).toBe('high');
            expect(result.issues[0].message).toContain('eval');
        });

        test('should generate tests', async () => {
            const result = await agent.generateTests('function test() {}', 'javascript');

            expect(result.tests).toBeDefined();
            expect(result.tests.length).toBeGreaterThan(0);
            expect(result.coverage).toBe('basic');
        });
    });

    describe('Agent Factory', () => {
        test('should create correct agent types', () => {
            const research = createAgent('research');
            expect(research).toBeInstanceOf(ResearchAgent);

            const code = createAgent('code');
            expect(code).toBeInstanceOf(CodeAgent);
        });

        test('should throw on unknown agent type', () => {
            expect(() => createAgent('unknown')).toThrow('Unknown agent type');
        });
    });
});
