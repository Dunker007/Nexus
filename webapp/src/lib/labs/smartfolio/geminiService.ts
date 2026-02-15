/**
 * SmartFolio — Bridge AI Service
 * ================================
 * Server-side integration via Nexus Bridge.
 * No client-side keys or heavy SDKs.
 */

// ─── Interfaces ───
export interface PortfolioSnapshot {
    accountName: string;
    strategyName: string;
    targetMask: string;
    marketRegime: string;
    totalValue: number;
    cashPercent: number;
    positions: {
        symbol: string;
        units: number;
        avgCost: number | null;
        currentPrice: number;
        currentValue: number;
        allocation: number;
        targetAllocation: number;
        gainLoss: number | null;
    }[];
    pendingOrders: {
        type: string;
        symbol: string;
        units: number;
        price: number;
        note?: string;
    }[];
    strategyRules: string[];
}

export interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    timestamp?: string;
}

const BRIDGE_URL = '/api/bridge/smartfolio/analyze';

// ─── API Calls ───

/**
 * Send a message to the AI Analyst via Bridge
 */
export async function sendMessage(
    snapshot: PortfolioSnapshot,
    persona: 'anchor' | 'tactician',
    history: ChatMessage[],
    message: string
): Promise<string> {
    try {
        const response = await fetch(BRIDGE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_BRIDGE_API_KEY || ''
            },
            body: JSON.stringify({
                snapshot,
                persona,
                history,
                message
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Bridge API error');
        }

        const data = await response.json();
        return data.result;
    } catch (error: any) {
        console.error('[Bridge AI]', error);
        return `⚠️ Analysis failed: ${error?.message || 'Unknown error'}. Check Bridge console.`;
    }
}

/**
 * Quick analysis without history (One-shot)
 */
export async function analyzePortfolio(
    snapshot: PortfolioSnapshot,
    persona: 'anchor' | 'tactician',
    prompt: string
): Promise<string> {
    return sendMessage(snapshot, persona, [], prompt);
}

/**
 * Legacy support for existing components
 */
export function hasGeminiKey(): boolean {
    return true; // We assume Bridge has it
}

// ─── Quick Health Check ───
export async function quickHealthCheck(snapshot: PortfolioSnapshot, persona: 'anchor' | 'tactician'): Promise<string> {
    return analyzePortfolio(snapshot, persona,
        'Give me a 3-line portfolio health check. Line 1: Overall status (one word + emoji). Line 2: Biggest risk right now. Line 3: Top action item. Be specific with numbers.'
    );
}
