import { prisma as db } from './database.js';

export class ContentQueueService {
    /**
     * Add an item to the content generation queue
     */
    async addToQueue(type, data) {
        return await db.contentQueueItem.create({
            data: {
                type,
                status: 'pending',
                data: JSON.stringify(data)
            }
        });
    }

    /**
     * Get items from the queue
     */
    async getQueue(status = null, type = null) {
        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;

        return await db.contentQueueItem.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Update item status
     */
    async updateStatus(id, status, result = null) {
        const data = { status };
        if (result) data.result = JSON.stringify(result);

        return await db.contentQueueItem.update({
            where: { id },
            data
        });
    }

    /**
     * Delete an item from the queue
     */
    async deleteItem(id) {
        return await db.contentQueueItem.delete({
            where: { id }
        });
    }
}

export const contentService = new ContentQueueService();
