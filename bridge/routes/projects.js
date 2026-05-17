import express from 'express';
import { prisma } from '../services/database.js';
import { asyncHandler, ValidationError } from '../services/errors.js';

const router = express.Router();
const inMemoryProjects = new Map();

router.get('/', asyncHandler(async (req, res) => {
    let projects = [];
    try {
        projects = await prisma.project.findMany({ orderBy: { updatedAt: 'desc' } });
    } catch (dbError) {
        console.log('DB query failed, using in-memory:', dbError.message);
    }

    if (projects.length === 0 && inMemoryProjects.size > 0) {
        projects = Array.from(inMemoryProjects.values());
        return res.json({ projects, total: projects.length, source: 'memory' });
    }

    const transformed = projects.map(p => ({
        id: p.id, icon: p.icon || '📦', name: p.title, desc: p.description || '',
        status: p.status, category: p.category, priority: p.priority,
        agents: typeof p.agents === 'string' ? JSON.parse(p.agents || '[]') : (p.agents || []),
        href: p.href,
        ideas: typeof p.stats === 'string' ? (JSON.parse(p.stats || '{}').ideas || 0) : (p.ideas || 0),
        timeline: typeof p.timeline === 'string' ? JSON.parse(p.timeline || '{"startMonth":0,"durationMonths":3,"progress":0}') : (p.timeline || {}),
        owner: p.owner || 'Unknown', content: p.content
    }));

    res.json({ projects: transformed, total: transformed.length, source: 'database' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json({
        id: project.id, icon: project.icon || '📦', name: project.title,
        desc: project.description || '', status: project.status, category: project.category,
        priority: project.priority, agents: JSON.parse(project.agents || '[]'), href: project.href,
        ideas: JSON.parse(project.stats || '{}').ideas || 0,
        timeline: JSON.parse(project.timeline || '{"startMonth":0,"durationMonths":3,"progress":0}'),
        owner: project.owner || 'Unknown', content: project.content
    });
}));

router.post('/', asyncHandler(async (req, res) => {
    const { name, desc, icon, status, category, priority, agents, href, timeline, owner, content } = req.body;
    const project = await prisma.project.create({
        data: {
            title: name, description: desc, icon: icon || '💡', status: status || 'concept',
            category: category || 'Experimental', priority: priority || 'Medium',
            agents: JSON.stringify(agents || ['architect']), href: href || null,
            timeline: JSON.stringify(timeline || { startMonth: new Date().getMonth(), durationMonths: 3, progress: 0 }),
            stats: JSON.stringify({ ideas: 0 }), owner: owner || 'Architect', content
        }
    });
    res.json({ success: true, project: { ...project, name: project.title, desc: project.description } });
}));

router.put('/:id', asyncHandler(async (req, res) => {
    const { name, desc, icon, status, category, priority, agents, href, timeline, owner, ideas, content } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.title = name;
    if (desc !== undefined) updateData.description = desc;
    if (icon !== undefined) updateData.icon = icon;
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (agents !== undefined) updateData.agents = JSON.stringify(agents);
    if (href !== undefined) updateData.href = href;
    if (timeline !== undefined) updateData.timeline = JSON.stringify(timeline);
    if (owner !== undefined) updateData.owner = owner;
    if (ideas !== undefined) updateData.stats = JSON.stringify({ ideas });
    if (content !== undefined) updateData.content = content;

    const project = await prisma.project.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, project });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

router.post('/seed', asyncHandler(async (req, res) => {
    const { projects } = req.body;
    if (!projects || !Array.isArray(projects)) {
        throw new ValidationError('Projects array required', 'projects');
    }

    const results = [];
    let useMemory = false;

    for (const p of projects) {
        try {
            const existing = await prisma.project.findFirst({ where: { title: p.name } });
            if (!existing) {
                const created = await prisma.project.create({
                    data: {
                        id: p.id, title: p.name, description: p.desc, icon: p.icon,
                        status: p.status, category: p.category, priority: p.priority,
                        agents: JSON.stringify(p.agents), href: p.href,
                        timeline: JSON.stringify(p.timeline), stats: JSON.stringify({ ideas: p.ideas }),
                        owner: p.owner, content: p.content
                    }
                });
                results.push({ id: created.id, name: p.name, action: 'created' });
            } else {
                results.push({ id: existing.id, name: p.name, action: 'skipped' });
            }
        } catch (dbError) {
            useMemory = true;
            inMemoryProjects.set(p.id, p);
            results.push({ id: p.id, name: p.name, action: 'memory' });
        }
    }

    res.json({
        success: true, results,
        seeded: results.filter(r => r.action === 'created' || r.action === 'memory').length,
        source: useMemory ? 'memory' : 'database'
    });
}));

export default router;
