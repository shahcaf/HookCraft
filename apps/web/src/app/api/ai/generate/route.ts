import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, tone } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    // ── Try OpenAI first ──────────────────────────────────────────────────────
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(tone),
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'OpenAI error');

      const result = data.choices?.[0]?.message?.content?.trim();
      return NextResponse.json({ result, model: 'gpt-4o-mini' });
    }

    // ── Fallback: Gemini ──────────────────────────────────────────────────────
    if (process.env.GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: buildSystemPrompt(tone) }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 1500 },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Gemini error');

      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      // Strip any accidental markdown fences
      const clean = result?.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      return NextResponse.json({ result: clean, model: 'gemini-1.5-flash' });
    }

    // ── No API key configured ─────────────────────────────────────────────────
    return NextResponse.json({
      error: 'No AI API key configured. Add OPENAI_API_KEY or GEMINI_API_KEY to your .env file.',
    }, { status: 503 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

function buildSystemPrompt(tone: string) {
  return `You are an expert Discord webhook message writer. Generate ONLY a valid Discord webhook JSON payload — nothing else, no explanation, no markdown fences.

Rules:
- Output must be valid JSON starting with { and ending with }
- Use the tone: ${tone}
- Use "embeds" for rich content where appropriate
- Embed colors should be vivid integers (e.g. 5765029 for purple, 3066993 for green, 15105570 for orange)
- Include username and avatar_url when relevant  
- Do NOT wrap output in \`\`\`json or any markdown
- The JSON must be a valid Discord webhook payload with keys like: content, username, avatar_url, embeds`;
}
