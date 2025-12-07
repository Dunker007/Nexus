'use server'

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { STREAM_TEMPLATES_DATA } from '@/lib/income-templates';

export async function getIncomeStreams() {
    let streams = await prisma.revenueStream.findMany();

    if (streams.length === 0) {
        // Seed database from templates
        console.log("Seeding Income Streams...");
        for (const template of STREAM_TEMPLATES_DATA) {
            await prisma.revenueStream.create({
                data: {
                    templateId: template.id,
                    title: template.title,
                    category: template.category,
                    status: template.defaultStatus,
                    currentMonthly: 0,
                    steps: JSON.stringify(template.steps)
                }
            });
        }
        streams = await prisma.revenueStream.findMany();
    }
    return streams;
}

export async function toggleStreamStep(streamId: string, stepIndex: number) {
    const stream = await prisma.revenueStream.findUnique({ where: { id: streamId } });
    if (!stream) return;

    const steps = JSON.parse(stream.steps);
    if (steps[stepIndex]) {
        steps[stepIndex].completed = !steps[stepIndex].completed;
        await prisma.revenueStream.update({
            where: { id: streamId },
            data: { steps: JSON.stringify(steps) }
        });
        revalidatePath('/income');
    }
}

import * as FileTools from '@/lib/file-tools';

// ... existing imports ...

export async function saveContentProject(projectData: any) {
    const safeName = (projectData.niche || 'Untitled').replace(/[^a-z0-9]/gi, '_');
    const path = await FileTools.createProject(safeName);

    await FileTools.writeAsset(safeName, 'assets.json', JSON.stringify(projectData, null, 2));

    // Track in DB
    try {
        await prisma.project.create({
            data: {
                title: projectData.niche || 'Untitled Project',
                description: `Generated assets for tags: ${projectData.tags?.substring(0, 50)}...`,
                href: path, // Storing local path in href
                category: 'Creation',
                priority: 'Medium',
                agents: '[]',
                timeline: '{"startMonth":"Now","durationMonths":1,"progress":0}',
                stats: '{"ideas":0}',
                status: 'active'
            }
        });
    } catch (e) {
        console.error("Failed to log project to DB:", e);
    }

    return { success: true, path };
}

export async function activateStream(streamId: string) {
    await prisma.revenueStream.update({
        where: { id: streamId },
        data: { status: 'active' }
    });
    revalidatePath('/income');
}
