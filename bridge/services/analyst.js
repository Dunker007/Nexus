import fetch from 'node-fetch';

console.log(`[Analyst] Service module loaded`);

// ─── Prompt Engineering ───

function buildSystemPrompt(snapshot, persona) {
    const isAnchor = persona === 'anchor';
    const globalState = snapshot.global || { totalValue: 0, cashPercent: 0, suiAccount: {}, altsAccount: {} };

    // Format Positions for context
    const positions = (snapshot.positions || [])
        .map(p => `  [${p.symbol}] Units: ${(p.units || 0).toFixed(2)}, Value: $${(p.currentValue || 0).toFixed(0)}, Alloc: ${(p.allocation || 0).toFixed(1)}% (Target ${p.targetAllocation}%), PnL: $${(p.gainLoss || 0).toFixed(2)}`)
        .join('\n');

    const orders = (snapshot.pendingOrders || []).length > 0
        ? snapshot.pendingOrders.map(o => `  ${(o.type || 'order').toUpperCase()} ${o.units} ${o.symbol} @ $${o.price}${o.note ? ` — ${o.note}` : ''}`).join('\n')
        : '  None';

    const rules = (snapshot.strategyRules || []).map(r => `  • ${r}`).join('\n');

    const journalFn = (snapshot.journal || []).slice(0, 5).map(j => `  [${new Date(j.timestamp).toLocaleDateString()}] ${(j.type || 'entry').toUpperCase()} ${j.symbol}: "${j.notes || ''}"`).join('\n');
    const journalSection = snapshot.journal ? `\nRECENT JOURNAL NOTES (Analyze for psychology):\n${journalFn}` : '';

    // ─── Persona Logic ───
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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const analysisCache = new Map();

export const analystService = {
    async analyze(snapshot, persona, history, message) {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        // 1. Cache Check
        const cacheKey = `${persona}_${message}_${Math.floor(snapshot.totalValue / 100)}`;
        const cached = analysisCache.get(cacheKey);
        // Only return cache if it's very fresh (1 min) to avoid stale "Global" data
        if (cached && (Date.now() - cached.timestamp < 60000)) {
            console.log(`[Analyst] Returning cached analysis for ${persona}`);
            return cached.response;
        }

        if (!GEMINI_API_KEY) {
            throw new Error('Server configuration error: GEMINI_API_KEY is missing.');
        }

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

        if (history && history.length > 0) {
            history.forEach(msg => {
                // Filter out non-text parts if any
                if (msg.text) {
                    contents.push({
                        role: msg.role === 'ai' ? 'model' : 'user',
                        parts: [{ text: msg.text }]
                    });
                }
            });
        }

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const payload = {
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000 // Increased for JSON
            }
        };

        const generate = async (model, version = 'v1beta') => {
            const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            console.log(`[Analyst] Calling Gemini API (${version}): models/${model}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                // Simple error mapping
                if (response.status === 429) throw new Error('RATE_LIMIT');
                if (response.status === 404) throw new Error('MODEL_NOT_FOUND');
                throw new Error(`Gemini API Error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response candidates from Gemini.');
            }
            return data.candidates[0].content.parts[0].text;
        };

        try {
            let response;
            try {
                // Prioritize Intelligence: 2.5 Pro (Smartest available)
                console.log(`[Analyst] Attempting Primary Model: gemini-2.5-pro`);
                response = await generate('gemini-2.5-pro', 'v1beta');
            } catch (err) {
                console.warn(`[Analyst] Primary (2.5 Pro) failed (${err.message}). Defaulting to Flash 2.0 in 2s...`);
                await delay(2000); // Wait 2s for rate limit
                try {
                    // Fallback: 2.0 Flash
                    response = await generate('gemini-2.0-flash', 'v1beta');
                } catch (err2) {
                    console.warn(`[Analyst] Flash 2.0 failed (${err2.message}). Trying Flash Lite in 4s...`);
                    await delay(4000); // Wait 4s
                    try {
                        response = await generate('gemini-2.0-flash-lite', 'v1beta');
                    } catch (err3) {
                        console.error(`[Analyst] All models failed. Last error: ${err3.message}`);
                        return "⚠️ AI Service Unavailable. Please check API Key or Quota.";
                    }
                }
            }

            if (!response) return "⚠️ AI Service Unavailable (No response data).";

            // Cache it
            analysisCache.set(cacheKey, { timestamp: Date.now(), response });
            return response;

        } catch (error) {
            console.error('[AnalystService] Critical Error:', error);
            return "⚠️ AI Service Error.";
        }
    }
};
