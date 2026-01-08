/**
 * Music Distribution Service
 * Phase 13: Track songs sent to streaming platforms and monitor royalties
 * Updated: Jan 8, 2026 - Now uses database persistence
 * 
 * @module services/distribution
 */

import prisma from './database.js';

// Streaming rates (approximate per-stream)
const RATES = {
    spotify: 0.004,
    youtube: 0.00069,  // per view (not stream)
    appleMusic: 0.008,
    amazonMusic: 0.004,
    tidal: 0.012
};

/**
 * Add a song to distribution tracking
 */
export async function addDistributedSong(song) {
    try {
        const newSong = await prisma.distributedSong.create({
            data: {
                title: song.title,
                artist: song.artist || 'DLX Studios',
                genre: song.genre || null,
                status: 'pending',
                streams: JSON.stringify({}),
                revenue: 0,
                projectedRevenue: 0
            }
        });

        return {
            ...newSong,
            streams: JSON.parse(newSong.streams),
            platforms: ['spotify', 'youtube']
        };
    } catch (error) {
        console.error('[Distribution] Failed to add song:', error.message);
        throw error;
    }
}

/**
 * Get all distributed songs
 */
export async function getDistributedSongs() {
    try {
        const songs = await prisma.distributedSong.findMany({
            orderBy: { distributedAt: 'desc' }
        });

        return songs.map(song => ({
            ...song,
            streams: JSON.parse(song.streams || '{}'),
            platforms: ['spotify', 'youtube']
        }));
    } catch (error) {
        console.error('[Distribution] Failed to get songs:', error.message);
        return [];
    }
}

/**
 * Get song by ID
 */
export async function getSongById(id) {
    try {
        const song = await prisma.distributedSong.findUnique({
            where: { id: String(id) }
        });

        if (song) {
            return {
                ...song,
                streams: JSON.parse(song.streams || '{}'),
                platforms: ['spotify', 'youtube']
            };
        }
        return null;
    } catch (error) {
        console.error('[Distribution] Failed to get song:', error.message);
        return null;
    }
}

/**
 * Update song status
 */
export async function updateSongStatus(id, status, details = {}) {
    try {
        const song = await prisma.distributedSong.update({
            where: { id: String(id) },
            data: {
                status,
                statusUpdatedAt: new Date(),
                url: details.url || undefined,
                isrc: details.isrc || undefined,
                upc: details.upc || undefined
            }
        });

        return {
            ...song,
            streams: JSON.parse(song.streams || '{}')
        };
    } catch (error) {
        console.error('[Distribution] Failed to update status:', error.message);
        return null;
    }
}

/**
 * Update stream counts for a song
 */
export async function updateStreams(id, platform, streams) {
    try {
        const song = await prisma.distributedSong.findUnique({
            where: { id: String(id) }
        });

        if (!song) return null;

        const currentStreams = JSON.parse(song.streams || '{}');
        currentStreams[platform] = streams;

        // Calculate revenue
        let totalRevenue = 0;
        for (const [plat, count] of Object.entries(currentStreams)) {
            totalRevenue += count * (RATES[plat] || 0.004);
        }

        const updated = await prisma.distributedSong.update({
            where: { id: String(id) },
            data: {
                streams: JSON.stringify(currentStreams),
                revenue: Math.round(totalRevenue * 100) / 100
            }
        });

        return {
            ...updated,
            streams: JSON.parse(updated.streams)
        };
    } catch (error) {
        console.error('[Distribution] Failed to update streams:', error.message);
        return null;
    }
}

/**
 * Get platform statistics (aggregated from all songs)
 */
export async function getPlatformStats() {
    try {
        const songs = await prisma.distributedSong.findMany();

        const stats = {
            spotify: { streams: 0, revenue: 0 },
            youtube: { views: 0, revenue: 0, subscribers: 0, watchHours: 0 },
            appleMusic: { streams: 0, revenue: 0 },
            amazonMusic: { streams: 0, revenue: 0 },
            tidal: { streams: 0, revenue: 0 }
        };

        for (const song of songs) {
            const streams = JSON.parse(song.streams || '{}');
            for (const [platform, count] of Object.entries(streams)) {
                if (stats[platform]) {
                    stats[platform].streams += count;
                    stats[platform].revenue += count * (RATES[platform] || 0.004);
                }
            }
        }

        // Round revenues
        for (const platform of Object.keys(stats)) {
            stats[platform].revenue = Math.round(stats[platform].revenue * 100) / 100;
        }

        return stats;
    } catch (error) {
        console.error('[Distribution] Failed to get platform stats:', error.message);
        return {};
    }
}

/**
 * Get revenue summary
 */
export async function getRevenueSummary() {
    try {
        const songs = await prisma.distributedSong.findMany();

        let totalRevenue = 0;
        let totalStreams = 0;
        let liveSongs = 0;
        let pendingSongs = 0;

        for (const song of songs) {
            totalRevenue += song.revenue || 0;
            const streams = JSON.parse(song.streams || '{}');
            totalStreams += Object.values(streams).reduce((sum, c) => sum + c, 0);

            if (song.status === 'live') liveSongs++;
            if (song.status === 'pending') pendingSongs++;
        }

        return {
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalStreams,
            totalSongs: songs.length,
            liveSongs,
            pendingSongs,
            projectedMonthlyRevenue: Math.round(totalRevenue * 30 * 100) / 100
        };
    } catch (error) {
        console.error('[Distribution] Failed to get summary:', error.message);
        return {
            totalRevenue: 0,
            totalStreams: 0,
            totalSongs: 0,
            liveSongs: 0,
            pendingSongs: 0,
            projectedMonthlyRevenue: 0
        };
    }
}

/**
 * Get YouTube monetization status
 */
export async function getYouTubeStatus() {
    try {
        // Get or create YouTube metrics record
        let metrics = await prisma.youTubeMetrics.findFirst();

        if (!metrics) {
            metrics = await prisma.youTubeMetrics.create({
                data: {
                    subscribers: 0,
                    watchHours: 0,
                    views: 0,
                    revenue: 0
                }
            });
        }

        return {
            subscribers: metrics.subscribers,
            subscriberGoal: metrics.subscriberGoal,
            subscriberProgress: Math.min(100, (metrics.subscribers / metrics.subscriberGoal) * 100),
            watchHours: metrics.watchHours,
            watchHoursGoal: metrics.watchHoursGoal,
            watchHoursProgress: Math.min(100, (metrics.watchHours / metrics.watchHoursGoal) * 100),
            monetizationEligible: metrics.subscribers >= 1000 && metrics.watchHours >= 4000,
            estimatedTimeToEligibility: calculateTimeToEligibility(metrics.subscribers, metrics.watchHours)
        };
    } catch (error) {
        console.error('[Distribution] Failed to get YouTube status:', error.message);
        return {
            subscribers: 0,
            subscriberGoal: 1000,
            subscriberProgress: 0,
            watchHours: 0,
            watchHoursGoal: 4000,
            watchHoursProgress: 0,
            monetizationEligible: false,
            estimatedTimeToEligibility: 'Unknown'
        };
    }
}

/**
 * Calculate estimated time to YouTube monetization eligibility
 */
function calculateTimeToEligibility(currentSubs, currentWatchHours) {
    const subsGrowthRate = 10;
    const watchHoursGrowthRate = 50;

    const subsNeeded = Math.max(0, 1000 - currentSubs);
    const watchHoursNeeded = Math.max(0, 4000 - currentWatchHours);

    const weeksForSubs = subsNeeded / subsGrowthRate;
    const weeksForWatchHours = watchHoursNeeded / watchHoursGrowthRate;
    const weeksNeeded = Math.max(weeksForSubs, weeksForWatchHours);

    if (weeksNeeded <= 0) return 'Eligible now!';
    if (weeksNeeded <= 4) return `~${Math.ceil(weeksNeeded)} weeks`;
    if (weeksNeeded <= 24) return `~${Math.ceil(weeksNeeded / 4)} months`;
    return `~${Math.ceil(weeksNeeded / 52)} year(s)`;
}

/**
 * Update YouTube stats manually
 */
export async function updateYouTubeStats(stats) {
    try {
        let metrics = await prisma.youTubeMetrics.findFirst();

        if (!metrics) {
            metrics = await prisma.youTubeMetrics.create({
                data: {
                    subscribers: stats.subscribers || 0,
                    watchHours: stats.watchHours || 0,
                    views: stats.views || 0,
                    revenue: stats.revenue || 0
                }
            });
        } else {
            metrics = await prisma.youTubeMetrics.update({
                where: { id: metrics.id },
                data: {
                    subscribers: stats.subscribers !== undefined ? stats.subscribers : metrics.subscribers,
                    watchHours: stats.watchHours !== undefined ? stats.watchHours : metrics.watchHours,
                    views: stats.views !== undefined ? stats.views : metrics.views,
                    revenue: stats.revenue !== undefined ? stats.revenue : metrics.revenue
                }
            });
        }

        return metrics;
    } catch (error) {
        console.error('[Distribution] Failed to update YouTube stats:', error.message);
        return null;
    }
}

/**
 * Delete a song from tracking
 */
export async function deleteSong(id) {
    try {
        const song = await prisma.distributedSong.delete({
            where: { id: String(id) }
        });
        return song;
    } catch (error) {
        console.error('[Distribution] Failed to delete song:', error.message);
        return null;
    }
}

export const distributionService = {
    addDistributedSong,
    getDistributedSongs,
    getSongById,
    updateSongStatus,
    updateStreams,
    getPlatformStats,
    getRevenueSummary,
    getYouTubeStatus,
    updateYouTubeStats,
    deleteSong
};

export default distributionService;
