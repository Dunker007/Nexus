import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://luxhub.netlify.app';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  // Use the Netlify Environment Variable for the Gemini API
  const apiKey = process.env.GEMINI_FREE_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { 
      statusCode: 503, 
      headers, 
      body: JSON.stringify({ error: 'No Gemini key found — set GEMINI_FREE_KEY in Netlify Env Variables' }) 
    };
  }

  try {
    const { messages, systemPrompt, agentName } = JSON.parse(event.body || '{}');

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'Valid messages array is required.' }) 
      };
    }

    // Format for Gemini API
    const geminiContents: { role: string; parts: { text: string }[] }[] = [];
    messages.forEach((msg) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === role) {
        geminiContents[geminiContents.length - 1].parts[0].text += '\n\n' + msg.content;
      } else {
        geminiContents.push({ role, parts: [{ text: msg.content }] });
      }
    });

    const timeContext = `SYSTEM TIME OVERRIDE: The exact current date and time is ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}. You must use THIS date for all current events, forecasting, and references, NEVER a default cached date.\n\n`;
    const finalSystemPrompt = systemPrompt ? timeContext + systemPrompt : timeContext;

    const body = {
      system_instruction: { parts: [{ text: finalSystemPrompt }] },
      contents: geminiContents,
      generationConfig: { temperature: 0.9, maxOutputTokens: 4000 },
      tools: [{ googleSearch: {} }],
    };

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    
    const data: any = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || 'Gemini API error from Netlify Edge');
    
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || 'No response.';

    // NOTE: Right now, this bypasses the local `nexus.db` (because Netlify Edge has no physical hard drive).
    // The `<save_note>` tag will just pass through to the frontend.
    // In a future update, we can have Netlify pass it backward down the tunnel async to save locally.

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text })
    };

  } catch (e: any) {
    console.error('[netlify-edge-debate] Error:', e.message);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: e.message }) 
    };
  }
};
