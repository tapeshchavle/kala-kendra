import { NextResponse } from 'next/server';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'moonshotai/kimi-k2-instruct';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!NVIDIA_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const craftTypes = ['Bagh Print', 'Gond Art', 'Chanderi Weaving', 'Bell Metal Craft', 'Zardozi Embroidery'];
    const categories = ['Textiles', 'Paintings', 'Home Decor', 'Sculptures', 'Accessories'];

    const prompt = `You are a shopping assistant helping users find artisan crafts.
Map the user's natural language query into specific search filters.
User query: "${query}"

Valid Categories: ${categories.join(', ')}
Valid Craft Types: ${craftTypes.join(', ')}

Return a strict JSON object with these optional keys (only include if mentioned or strongly implied):
{
  "search": "keywords to search for",
  "category": "one of the valid categories, or null",
  "craftType": "one of the valid craft types, or null",
  "minPrice": number or null,
  "maxPrice": number or null
}

Response tightly in JSON, no extra text.`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 256,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: 'AI failed', details: errText }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    let parsed = {};
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    } catch (e) {
      console.error('Failed to parse AI output', e);
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error('AI magic search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
