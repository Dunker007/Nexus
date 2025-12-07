import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'mock',
        capabilities: ['image-generation', 'audio-synthesis', 'video-rendering'],
        supported_models: ['stable-diffusion-xl', 'whisper-v3', 'zeroscope']
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        return NextResponse.json({
            success: true,
            jobId: `job-${Date.now()}`,
            status: 'processing',
            estimated_time: '15s'
        });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
