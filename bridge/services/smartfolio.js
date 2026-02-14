import { prisma } from './database.js';

export const smartfolioService = {
    /**
     * Get full portfolio state for an account
     */
    async getPortfolio(accountId) {
        const [positions, journal] = await Promise.all([
            prisma.smartFolioPosition.findMany({ where: { accountId } }),
            prisma.smartFolioJournal.findMany({
                where: { accountId },
                orderBy: { timestamp: 'desc' }
            })
        ]);
        return { positions, journal };
    },

    /**
     * Sync portfolio data (positions and journal)
     * Used for bulk import / paste hygiene
     */
    async syncPortfolio(accountId, data) {
        return await prisma.$transaction(async (tx) => {
            // 1. Update/Upsert Positions
            if (data.assets) {
                for (const asset of data.assets) {
                    await tx.smartFolioPosition.upsert({
                        where: {
                            accountId_symbol: {
                                accountId,
                                symbol: asset.symbol
                            }
                        },
                        create: {
                            accountId,
                            symbol: asset.symbol,
                            units: asset.units,
                            cost: asset.totalCost || 0
                        },
                        update: {
                            units: asset.units,
                            cost: asset.totalCost || 0
                        }
                    });
                }
            }

            // 2. Update/Upsert Journal Entries
            if (data.journal) {
                for (const entry of data.journal) {
                    await tx.smartFolioJournal.upsert({
                        where: { id: entry.id },
                        create: {
                            id: entry.id,
                            accountId,
                            type: entry.type, // 'buy', 'sell', 'note'
                            symbol: entry.symbol,
                            units: entry.units,
                            price: entry.price,
                            notes: entry.notes,
                            timestamp: new Date(entry.timestamp)
                        },
                        update: {
                            type: entry.type,
                            symbol: entry.symbol,
                            units: entry.units,
                            price: entry.price,
                            notes: entry.notes,
                            timestamp: new Date(entry.timestamp)
                        }
                    });
                }
            }

            return { success: true };
        });
    },

    /**
     * Delete a journal entry
     */
    async deleteJournalEntry(id, accountId) {
        return await prisma.smartFolioJournal.deleteMany({
            where: {
                id,
                accountId // Security check to ensure ownership context if needed
            }
        });
    },

    /**
     * Clear all data for an account (Reset)
     */
    async clearAccount(accountId) {
        return await prisma.$transaction([
            prisma.smartFolioPosition.deleteMany({ where: { accountId } }),
            prisma.smartFolioJournal.deleteMany({ where: { accountId } })
        ]);
    }
};
