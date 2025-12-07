import { NextResponse } from 'next/server';
import { TaskAgent } from '@/lib/task-agent';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, prompt } = body;

        if (!type || !prompt) {
            return NextResponse.json({ error: 'Missing type or prompt' }, { status: 400 });
        }

        const agent = TaskAgent.getInstance();
        const task = await agent.executeTask(type, prompt);

        return NextResponse.json({ success: true, task });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
