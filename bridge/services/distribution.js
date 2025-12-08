/**
 * Music Distribution Service
 * Phase 13: Track songs sent to streaming platforms and monitor royalties
 * 
 * @module services/distribution
 */

// In-memory storage (will be moved to database later)
let distributedSongs = [];
let platformStats = {
    spotify: { streams: 0, revenue: 0 },
    youtube: { views: 0, revenue: 0, subscribers: 0, watchHours: 0 },
    appleMusic: { streams: 0, revenue: 0 },
    amazonMusic: { streams: 0, revenue: 0 },
    tidal: { streams: 0, revenue: 0 }
};

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
export function addDistributedSong(song) {
    const newSong = {
        id: Date.now(),
        ...song,
        distributedAt: new Date().toISOString(),
        platforms: song.platforms || ['spotify', 'youtube'],
        status: 'pending', // pending, live, rejected
        streams: {},
        revenue: 0,
        projectedRevenue: 0
    };

    distributedSongs.push(newSong);
    return newSong;
}

/**
 * Get all distributed songs
 */
export function getDistributedSongs() {
    return distributedSongs;
}

/**
 * Get song by ID
 */
export function getSongById(id) {
    return distributedSongs.find(s => s.id === parseInt(id));
}

/**
 * Update song status
 */
export function updateSongStatus(id, status, details = {}) {
    const song = distributedSongs.find(s => s.id === parseInt(id));
    if (song) {
        song.status = status;
        song.statusUpdatedAt = new Date().toISOString();
        if (details.url) song.url = details.url;
        if (details.isrc) song.isrc = details.isrc;
        if (details.upc) song.upc = details.upc;
        return song;
    }
    return null;
}

/**
 * Update stream counts for a song
 */
export function updateStreams(id, platform, streams) {
    const song = distributedSongs.find(s => s.id === parseInt(id));
    if (song) {
        song.streams[platform] = streams;

        // Calculate revenue
        let totalRevenue = 0;
        for (const [plat, count] of Object.entries(song.streams)) {
            totalRevenue += count * (RATES[plat] || 0.004);
        }
        song.revenue = Math.round(totalRevenue * 100) / 100;

        // Update platform stats
        platformStats[platform].streams += streams - (song.streams[platform] || 0);
        platformStats[platform].revenue = platformStats[platform].streams * RATES[platform];

        return song;
    }
    return null;
}

/**
 * Get platform statistics
 */
export function getPlatformStats() {
    return platformStats;
}

/**
 * Get revenue summary
 */
export function getRevenueSummary() {
    const totalRevenue = distributedSongs.reduce((sum, song) => sum + song.revenue, 0);
    const totalStreams = distributedSongs.reduce((sum, song) => {
        return sum + Object.values(song.streams).reduce((s, c) => s + c, 0);
    }, 0);

    const liveSongs = distributedSongs.filter(s => s.status === 'live').length;
    const pendingSongs = distributedSongs.filter(s => s.status === 'pending').length;

    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalStreams,
        totalSongs: distributedSongs.length,
        liveSongs,
        pendingSongs,
        projectedMonthlyRevenue: Math.round(totalRevenue * 30 * 100) / 100, // Rough projection
        platforms: platformStats
    };
}

/**
 * Get YouTube monetization status
 */
export function getYouTubeStatus() {
    const subs = platformStats.youtube.subscribers;
    const watchHours = platformStats.youtube.watchHours;

    return {
        subscribers: subs,
        subscriberGoal: 1000,
        subscriberProgress: Math.min(100, (subs / 1000) * 100),
        watchHours: watchHours,
        watchHoursGoal: 4000,
        watchHoursProgress: Math.min(100, (watchHours / 4000) * 100),
        monetizationEligible: subs >= 1000 && watchHours >= 4000,
        estimatedTimeToEligibility: calculateTimeToEligibility(subs, watchHours)
    };
}

/**
 * Calculate estimated time to YouTube monetization eligibility
 */
function calculateTimeToEligibility(currentSubs, currentWatchHours) {
    // Assume growth rates based on early channel averages
    const subsGrowthRate = 10; // subs per week
    const watchHoursGrowthRate = 50; // hours per week

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
export function updateYouTubeStats(stats) {
    if (stats.subscribers !== undefined) platformStats.youtube.subscribers = stats.subscribers;
    if (stats.watchHours !== undefined) platformStats.youtube.watchHours = stats.watchHours;
    if (stats.views !== undefined) platformStats.youtube.views = stats.views;
    if (stats.revenue !== undefined) platformStats.youtube.revenue = stats.revenue;
    return platformStats.youtube;
}

/**
 * Delete a song from tracking
 */
export function deleteSong(id) {
    const idx = distributedSongs.findIndex(s => s.id === parseInt(id));
    if (idx !== -1) {
        const removed = distributedSongs.splice(idx, 1)[0];
        return removed;
    }
    return null;
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
