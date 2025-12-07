import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // In a real app, this would write to a secure DB or log service
        console.log('[AUDIT LOG]', JSON.stringify(body, null, 2));

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Log failed' }, { status: 500 });
    }
}
