const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'moonshotai/kimi-k2-instruct';

export async function generateProductDescription(
  productName: string,
  category: string,
  craftType: string,
  videoUrl?: string
): Promise<{ description: string; tags: string[] }> {
  if (!NVIDIA_API_KEY) {
    throw new Error('NVIDIA API key not configured');
  }

  const prompt = `You are an expert at writing product descriptions for traditional Indian handicrafts from Madhya Pradesh. 

Generate a compelling, rich product description for:
- Product: ${productName}
- Category: ${category}  
- Craft Type: ${craftType}
${videoUrl ? `- Video Demonstrating Craftsmanship: Available` : ''}

The description should:
1. Highlight the artisan craftsmanship
2. Mention the cultural significance from Madhya Pradesh
3. Describe materials and techniques used
4. Be 2-3 paragraphs, warm and inviting
5. Appeal to buyers who value authentic handmade products
${videoUrl ? `6. Include a line inviting the buyer to watch the accompanied video demonstrating its craftsmanship.` : ''}

Also suggest 5 relevant tags for this product.

Respond in JSON format:
{
  "description": "...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fallback
  }

  return {
    description: content,
    tags: [craftType, category, 'Madhya Pradesh', 'Handmade', 'Artisan'],
  };
}
