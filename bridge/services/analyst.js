import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

function buildSystemPrompt(snapshot, persona) {
    const positions = snapshot.positions
        .map(p => `  ${p.symbol}: ${p.units.toFixed(2)} units @ $${p.currentPrice} (${p.allocation.toFixed(1)}% alloc, target ${p.targetAllocation}%, PnL: $${(p.gainLoss || 0).toFixed(2)})`)
        .join('\n');

    const orders = snapshot.pendingOrders.length > 0
        ? snapshot.pendingOrders.map(o => `  ${o.type.toUpperCase()} ${o.units} ${o.symbol} @ $${o.price}${o.note ? ` — ${o.note}` : ''}`).join('\n')
        : '  None';

    const rules = snapshot.strategyRules.map(r => `  • ${r}`).join('\n');

    const personaDesc = persona === 'anchor'
        ? '- Disciplined, mathematical, conviction-driven. SUI is your anchor position. You think in terms of accumulation zones, DCA levels, and compounding.'
        : '- Agile, data-driven rotation specialist. No single king — you manage a balanced portfolio of 5 high-conviction alts. You think in terms of relative strength, profit-taking, and capital rotation.';

    return `You are SmartFolio AI — ${persona === 'anchor' ? 'The Anchor' : 'The Tactician'}, a senior crypto portfolio strategist managing a Roth IRA account.

PERSONALITY:
${personaDesc}
- You speak concisely. No fluff. Use numbers. Give actionable recommendations.
- You understand this is a Roth IRA (tax-free gains, no leverage, spot only, 1% trade fee per transaction via Alto/Coinbase).
- When suggesting trades, always factor in the 1% fee and current cash levels.

CURRENT PORTFOLIO STATE:
Account: ${snapshot.accountName}
Strategy: ${snapshot.strategyName} (${snapshot.targetMask})
Market Regime: ${snapshot.marketRegime.toUpperCase()}
Total Value: $${snapshot.totalValue.toFixed(2)}
Cash: ${snapshot.cashPercent.toFixed(1)}%

POSITIONS:
${positions}

PENDING ORDERS:
${orders}

STRATEGY RULES:
${rules}

INSTRUCTIONS:
- Reference actual numbers from the portfolio above.
- If asked about a specific token, focus on its allocation vs target, PnL, and any pending orders.
- When recommending buys, check cash reserves first. If cash < 15%, warn about low liquidity.
- When recommending sells, calculate expected proceeds after 1% fee.
- Keep responses under 150 words unless asked for detailed analysis.
- Format key numbers in bold when relevant.`;
}

export const analystService = {
    async analyze(snapshot, persona, history, message) {
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
                parts: [{ text: `Online. I am ${persona === 'anchor' ? 'The Anchor' : 'The Tactician'}. Portfolio loaded.` }]
            }
        ];

        if (history && history.length > 0) {
            history.forEach(msg => {
                contents.push({
                    role: msg.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                });
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
                maxOutputTokens: 800
            }
        };

        const generate = async (model) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429) throw new Error('RATE_LIMIT');
                const errText = await response.text();
                throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            if (!data.candidates || data.candidates.length === 0) {
                if (data.promptFeedback?.blockReason) throw new Error(`Safety Block: ${data.promptFeedback.blockReason}`);
                throw new Error('No response candidates from Gemini.');
            }
            return data.candidates[0].content.parts[0].text;
        };

        try {
            try {
                return await generate('gemini-2.0-flash');
            } catch (err) {
                if (err.message === 'RATE_LIMIT') {
                    console.warn('[Analyst] 2.0 Flash Rate Limit. Falling back to 1.5 Flash...');
                    return await generate('gemini-1.5-flash');
                }
                throw err;
            }
        } catch (error) {
            console.error('[AnalystService] Error:', error);
            throw error;
        }
    }
};
