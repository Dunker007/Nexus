/**
 * SmartFolio — Bridge AI Service
 * ================================
 * Server-side integration via Nexus Bridge.
 * No client-side keys or heavy SDKs.
 */

// ─── Interfaces ───
export interface SimpleAccountSnapshot {
    totalValue: number;
    cashPercent: number;
    positions: {
        symbol: string;
        units: number;
        avgCost: number | null;
        currentPrice: number;
        currentValue: number;
        allocation: number;
        gainLoss: number | null;
    }[];
}

export interface PortfolioSnapshot {
    accountName: string; // The "Active" account from user perspective
    strategyName: string;
    targetMask: string;
    totalValue: number;
    cashPercent: number;
    marketRegime?: string;

    // Detailed Active Account Data
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
    journal?: any[]; // Recent journal entries for psychology

    // GLOBAL CONTEXT (For Safety Net / Tactian Awareness)
    global?: {
        totalValue: number;
        cashPercent: number;
        isSafetyNetCritical: boolean;
        suiAccount: SimpleAccountSnapshot;
        altsAccount: SimpleAccountSnapshot;
    };
}

export interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    timestamp?: string;
}

export interface AIData {
    directive?: {
        title: string;
        desc: string;
        type: 'alert' | 'success' | 'info';
    };
    psychology?: {
        sentiment: string;
        score: number;
        feedback: string;
    };
    actions?: {
        label: string;
        type: 'buy' | 'sell';
        symbol: string;
        units: number;
        price: number;
        reason: string;
    }[];
}

export interface AIResponse {
    text: string;
    data?: AIData;
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
): Promise<AIResponse> {
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

        // Parse Result: The bridge returns { result: string }
        // The string might contain markdown + JSON block at end.
        const rawText = data.result;

        // Regex to extract JSON block: ```json ... ```
        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);

        let finalText = rawText;
        let aiData: AIData | undefined;

        if (jsonMatch) {
            try {
                aiData = JSON.parse(jsonMatch[1]);
                // Remove the JSON block from the displayed text
                finalText = rawText.replace(jsonMatch[0], '').trim();
            } catch (e) {
                console.warn('Failed to parse AI JSON block', e);
            }
        }

        return { text: finalText, data: aiData };

    } catch (error: any) {
        console.error('[Bridge AI]', error);
        return {
            text: `⚠️ Bridge Error: ${error?.message || 'Unknown'}. Check console.`
        };
    }
}

/**
 * Quick analysis without history (One-shot)
 */
export async function analyzePortfolio(
    snapshot: PortfolioSnapshot,
    persona: 'anchor' | 'tactician',
    prompt: string
): Promise<AIResponse> {
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
    const res = await analyzePortfolio(snapshot, persona,
        'Give me a 3-line portfolio health check. Line 1: Overall status (one word + emoji). Line 2: Biggest risk right now. Line 3: Top action item. Be specific with numbers.'
    );
    return res.text;
}
