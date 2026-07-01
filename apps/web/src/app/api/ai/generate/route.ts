import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, tone } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      return NextResponse.json({
        error: 'GROQ_API_KEY is not set. Add it to your environment variables on Render.',
      }, { status: 503 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: buildSystemPrompt(tone) },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }

    let result: string = data.choices?.[0]?.message?.content?.trim() ?? '';

    // Strip any accidental markdown fences the model might add
    result = result.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    return NextResponse.json({ result, model: 'llama-3.3-70b-versatile (Groq)' });

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
- Embed colors should be vivid integers (e.g. 5765029 for purple, 3066993 for green, 15105570 for orange, 16776960 for yellow)
- Include "username" and "avatar_url" when relevant
- Do NOT wrap output in \`\`\`json or any markdown — just raw JSON
- The JSON must be a valid Discord webhook payload with keys like: content, username, avatar_url, embeds`;
}
