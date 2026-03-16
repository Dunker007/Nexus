import { NextResponse } from 'next/server';

// This acts as a mock/stub for the Unified Income Overview
// since the database/spreadsheet integration is "yet to be born"
// and currently relied on the local Express bridge's memory.

export async function GET() {
  // We simulate the data structure expected by UnifiedIncomeOverview.tsx
  const summary = {
    totalRevenue: 0.00,
    projectedMonthly: 0.00,
    streams: {
      music: {
        name: 'Music & Streaming',
        revenue: 0,
        streams: 0,
        items: 0,
        color: '#ec4899' // pink
      },
      art: {
        name: 'Digital Art & POD',
        revenue: 0,
        sales: 0,
        items: 0,
        color: '#f97316' // orange
      },
      content: {
        name: 'Content Pipeline',
        revenue: 0,
        posts: 0,
        color: '#8b5cf6' // purple
      },
      manual: {
        name: 'Other Income',
        revenue: 0,
        entries: 0,
        color: '#10b981' // emerald
      }
    },
    platforms: {
      youtube: {
        name: 'YouTube',
        revenue: 0,
        status: 'building',
        progress: 0
      },
      spotify: {
        name: 'Spotify',
        revenue: 0,
        streams: 0
      },
      etsy: {
        name: 'Etsy',
        revenue: 0,
        sales: 0
      }
    },
    goals: {
      monthly: 100,
      yearly: 1200,
      firstDollar: false,
      first100: false,
      monthlyProgress: 0,
      yearlyProgress: 0
    },
    milestones: [
      { name: 'First Dollar', achieved: false, target: 1 },
      { name: 'First $100', achieved: false, target: 100 },
      { name: '$100/month', achieved: false, target: 100 },
      { name: '$1000/month', achieved: false, target: 1000 }
    ]
  };

  return NextResponse.json({ success: true, summary });
}
