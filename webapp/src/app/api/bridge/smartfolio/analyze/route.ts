import { NextRequest, NextResponse } from 'next/server';

// ─── Interfaces (Mirroring geminiService.ts) ───
interface PortfolioSnapshot {
    accountName: string;
    strategyName: string;
    targetMask: string;
    totalValue: number;
    cashPercent: number;
    marketRegime?: string;
    positions: any[];
    pendingOrders: any[];
    strategyRules: string[];
    journal?: any[];
    global?: any;
}

// ─── Prompt Engineering ───
function buildSystemPrompt(snapshot: PortfolioSnapshot, persona: string) {
    const isAnchor = persona === 'anchor';
    const globalState = snapshot.global || { totalValue: 0, cashPercent: 0, suiAccount: {}, altsAccount: {} };

    // Format Positions
    const positions = (snapshot.positions || [])
        .map(p => `  [${p.symbol}] Units: ${(p.units || 0).toFixed(2)}, Value: $${(p.currentValue || 0).toFixed(0)}, Alloc: ${(p.allocation || 0).toFixed(1)}% (Target ${p.targetAllocation}%), PnL: $${(p.gainLoss || 0).toFixed(2)}`)
        .join('\n');

    const orders = (snapshot.pendingOrders || []).length > 0
        ? snapshot.pendingOrders.map(o => `  ${(o.type || 'order').toUpperCase()} ${o.units} ${o.symbol} @ $${o.price}${o.note ? ` — ${o.note}` : ''}`).join('\n')
        : '  None';

    const journalFn = (snapshot.journal || []).slice(0, 5).map(j => `  [${new Date(j.timestamp).toLocaleDateString()}] ${(j.type || 'entry').toUpperCase()} ${j.symbol}: "${j.notes || ''}"`).join('\n');
    const journalSection = snapshot.journal ? `\nRECENT JOURNAL NOTES (Analyze for psychology):\n${journalFn}` : '';

    // Persona Logic
    let roleDesc = '';
    let primeDirective = '';

    if (isAnchor) {
        roleDesc = `You are "The Anchor" (⚓), the stoic guardian of the SUI position.
        - Your ONE job is to manage the SUI position and the Cash safety net.
        - You get anxious if SUI > 60% (Overweight). You demand trims.
        - You get defensive if Global Cash < 5% (Critical). You stop all buying.
        - You verify that "The Tactician" (Alts account) isn't gambling away the reserves.`;

        primeDirective = `IF SUI > 62%: COMMAND A TRIM. IF GLOBAL CASH < 10%: FORBID BUYS.`;
    } else {
        roleDesc = `You are "The Tactician" (⚡), the aggressive opportunity hunter for Alts.
        - You manage the high-conviction rotation (AAVE, LINK, IMX, etc.).
        - You MUST respect the "Anchor's" stress levels. If Global Cash is low, you CANNOT buy.
        - Your detailed job is to ladder into high-conviction plays on dips and rotate profits to SUI/USD.`;

        primeDirective = `IF GLOBAL CASH < 10%: DO NOT BUY. ROTATE PROFITS TO ANCHOR.`;
    }

    const marketRegime = (snapshot.marketRegime || 'UNKNOWN').toUpperCase();

    return `SYSTEM IDENTITY:
${roleDesc}

GLOBAL CONTEXT (The Whole Picture):
- Global Total Value: $${(globalState.totalValue || 0).toFixed(0)}
- Global Cash Reserve: ${(globalState.cashPercent || 0).toFixed(1)}% (Target 25%, Critical < 5%)
- Market Regime: ${marketRegime}

ACTIVE ACCOUNT (${snapshot.accountName}):
- Value: $${snapshot.totalValue.toFixed(0)}
- Cash: ${snapshot.cashPercent.toFixed(1)}%
${positions}

PENDING ORDERS:
${orders}
${journalSection}

PRIME DIRECTIVE:
${primeDirective}

OUTPUT FORMAT:
1. Provide a concise, persona-driven analysis (2-3 sentences max).
2. END your response with a JSON block EXACTLY matching this schema:
\`\`\`json
{
  "directive": { 
    "title": "SHORT TITLE (e.g. OVERWEIGHT WARNING)", 
    "desc": "One sentence summary of the main action.", 
    "type": "alert" | "success" | "info" 
  },
  "psychology": {
    "sentiment": "Anxious" | "Greedy" | "Zen" | "Fomo",
    "score": 1-10,
    "feedback": "Brief coaching tip based on journal notes."
  },
  "actions": [
    { 
      "label": "Trim SUI 10%",
      "type": "sell", 
      "symbol": "SUI", 
      "units": 100, 
      "price": 1.85,
      "reason": "Rebalancing rule" 
    }
  ] // Empty array if no action needed
}
\`\`\``;
}

// ─── Helper Functions ───
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithGemini(apiKey: string, payload: any, model: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        if (response.status === 429) throw new Error('RATE_LIMIT');
        if (response.status === 404) throw new Error('MODEL_NOT_FOUND');
        const errText = await response.text();
        throw new Error(`Gemini API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response candidates from Gemini.');
    }
    return data.candidates[0].content.parts[0].text;
}

// ─── POST Handler ───
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { snapshot, persona, history, message } = body;

        // API Key Check
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error: GEMINI_API_KEY is missing.' }, { status: 500 });
        }

        // Build Prompt
        const systemPrompt = buildSystemPrompt(snapshot, persona);
        const contents = [
            {
                role: 'user',
                parts: [{ text: systemPrompt }]
            },
            {
                role: 'model',
                parts: [{ text: `Acknowledged. I am ${(persona || 'USER').toUpperCase()}. Global Cash is ${(((snapshot.global || {}).cashPercent) || 0).toFixed(1)}%. Ready.` }]
            }
        ];

        // Append History
        if (history && history.length > 0) {
            history.forEach((msg: any) => {
                if (msg.text) {
                    contents.push({
                        role: msg.role === 'ai' ? 'model' : 'user',
                        parts: [{ text: msg.text }]
                    });
                }
            });
        }

        // Append Current Message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const payload = {
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
            }
        };

        // Execute with Fallback Logic
        let responseText;
        try {
            // Priority: Gemini 2.5 Pro
            console.log(`[BridgeAPI] Attempting Primary Model: gemini-2.5-pro`);
            responseText = await generateWithGemini(GEMINI_API_KEY, payload, 'gemini-2.5-pro');
        } catch (err: any) {
            console.warn(`[BridgeAPI] 2.5 Pro failed (${err.message}). Defaulting to Flash 2.0...`);
            await delay(1500); // Short delay
            try {
                // Fallback: Gemini 2.0 Flash
                responseText = await generateWithGemini(GEMINI_API_KEY, payload, 'gemini-2.0-flash');
            } catch (err2: any) {
                console.warn(`[BridgeAPI] Flash 2.0 failed (${err2.message}). Trying Flash Lite...`);
                await delay(2000);
                try {
                    // Last Resort: Gemini Flash Lite
                    responseText = await generateWithGemini(GEMINI_API_KEY, payload, 'gemini-2.0-flash-lite');
                } catch (err3: any) {
                    console.error(`[BridgeAPI] All models failed. Last error: ${err3.message}`);
                    return NextResponse.json({ result: "⚠️ AI Service Unavailable. Please check API Key or Quota." });
                }
            }
        }

        return NextResponse.json({ result: responseText });

    } catch (error: any) {
        console.error('[BridgeAPI] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
