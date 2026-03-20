import { ollamaConfig, lmStudioConfig } from './config.js';

// ─── Utility ──────────────────────────────────────────────────────────────────

export async function fetchWithTimeout(url: string, options: RequestInit, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') throw new Error(`Request timed out after ${timeout}ms`);
    throw error;
  }
}

// ─── Local LLM Helper (Ollama → LM Studio fallback) ──────────────────────────

export async function callLocalLLM(prompt: string, systemPrompt?: string): Promise<string> {
  // Try Ollama first
  try {
    const res = await fetchWithTimeout(`${ollamaConfig.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaConfig.defaultModel,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
      }),
    }, 30000); // 30s for actual generation

    if (res.ok) {
      const data = await res.json() as any;
      if (data.response) return data.response;
    }
  } catch (err: any) {
    console.log(`[LLM] Ollama preferred route failed: ${err.message}. Trying LM Studio...`);
  }

  // Fallback to LM Studio (OpenAI-compatible)
  try {
    const res = await fetchWithTimeout(`${lmStudioConfig.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: lmStudioConfig.defaultModel,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    }, 30000);

    if (!res.ok) throw new Error(`LM Studio error: ${res.status}`);
    const data = await res.json() as any;
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    throw new Error('Invalid response format from LM Studio');
  } catch (err: any) {
    console.error(`[LLM] Fallback failed: ${err.message}`);
    throw new Error('AI Inference Engine unreachable. Ensure Ollama or LM Studio is running.');
  }
}
