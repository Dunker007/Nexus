import { PrismaClient, AgentTask } from '@prisma/client';

console.log('Prisma Client imported');
const t: AgentTask = {
    id: '1',
    type: 'test',
    prompt: 'test',
    status: 'pending',
    result: null,
    createdAt: new Date(),
    updatedAt: new Date()
};
console.log('AgentTask type works', t);
