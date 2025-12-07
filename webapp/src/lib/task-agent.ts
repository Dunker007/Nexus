import { prisma } from './db';
import type { AgentTask } from '@prisma/client';
import { LUXRIG_BRIDGE_URL } from './utils';
import * as FileTools from './file-tools';

export class TaskAgent {
    private static instance: TaskAgent;

    private constructor() { }

    public static getInstance(): TaskAgent {
        if (!TaskAgent.instance) {
            TaskAgent.instance = new TaskAgent();
        }
        return TaskAgent.instance;
    }

    public async executeTask(type: string, prompt: string): Promise<AgentTask> {
        const task = await prisma.agentTask.create({
            data: {
                type,
                prompt,
                status: 'pending'
            }
        });

        // Fire and forget processing
        this.processTask(task.id).catch(err => console.error("Background processing error:", err));

        return task;
    }

    private async processTask(taskId: string) {
        await prisma.agentTask.update({
            where: { id: taskId },
            data: { status: 'running' }
        });

        try {
            const task = await prisma.agentTask.findUnique({ where: { id: taskId } });
            if (!task) return;

            console.log(`[TaskAgent] Processing ${task.type}: ${task.prompt}`);

            let result;
            // Simple logic for now - frameworks can be expanded later
            if (task.type === 'meeting') {
                result = await this.mockMeetingSchedule(task.prompt);
            } else if (task.type === 'workflow' && task.prompt.toLowerCase().startsWith('create project')) {
                const name = task.prompt.split('create project')[1].trim();
                const path = await FileTools.createProject(name || 'New_Project_' + Date.now());
                result = { action: 'project_created', path };
            } else {
                result = await this.callBridge(task.prompt);
            }

            await prisma.agentTask.update({
                where: { id: taskId },
                data: {
                    status: 'completed',
                    result: JSON.stringify(result)
                }
            });
        } catch (error: any) {
            console.error('[TaskAgent] Execution Error:', error);
            await prisma.agentTask.update({
                where: { id: taskId },
                data: {
                    status: 'failed',
                    result: JSON.stringify({ error: error.message })
                }
            });
        }
    }

    private async callBridge(prompt: string) {
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            return await res.json();
        } catch (e: any) {
            return { error: 'Bridge unreachable', details: e.message };
        }
    }

    private async mockMeetingSchedule(prompt: string) {
        // Mock logic - in future this will use Google Calendar API
        return {
            action: 'scheduled',
            details: {
                topic: prompt,
                participants: ['Architect', 'Lux', 'Guardian'],
                time: 'Immediate'
            }
        };
    }

    public async getTask(id: string): Promise<AgentTask | null> {
        return prisma.agentTask.findUnique({ where: { id } });
    }
}
