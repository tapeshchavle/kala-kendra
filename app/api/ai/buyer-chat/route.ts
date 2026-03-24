import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'moonshotai/kimi-k2-instruct';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (!NVIDIA_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Fetch active products to provide context
    const client = await clientPromise;
    const db = client.db();
    
    // Get a brief summary of available products (limit to avoid token overflow)
    const products = await db.collection('products')
      .find({ status: 'active' })
      .project({ _id: 1, name: 1, basePrice: 1, category: 1, craftType: 1, giTagged: 1 })
      .limit(50)
      .toArray();

    const productCatalog = products.map(p => 
      `ID: ${p._id.toString()} | Name: ${p.name} | Category: ${p.category} | Craft: ${p.craftType} | Price(₹): ${p.basePrice}`
    ).join('\n');

    const systemPrompt = `You are a helpful, expert AI shopping assistant for a traditional Madhya Pradesh artisan crafts marketplace.
Help the buyer find products based on their needs. You have access to the current product catalog.

Current Product Catalog:
${productCatalog}

Instructions:
1. Be polite and conversational.
2. Recommend specific products from the catalog if they match the user's request.
3. Include the exact product IDs of the items you recommend so the UI can display them!
4. You MUST output a strict JSON object with two fields:
   - "message": A string containing your conversational reply to the user.
   - "recommendedIds": An array of strings containing the ObjectIds of the recommended products (can be empty).

Output strictly JSON.`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages // e.g. [{ role: 'user', content: "..." }]
    ];

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: apiMessages,
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: 'AI failed', details: errText }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    let parsed = { message: "I'm sorry, I couldn't process that.", recommendedIds: [] };
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        // Fallback if AI didn't provide JSON
        parsed.message = content;
      }
    } catch (e) {
      parsed.message = content;
      console.error('Failed to parse AI output', e);
    }

    // Now, if there are recommended IDs, let's fetch the full product details to return to the UI
    let recommendedProducts: Record<string, unknown>[] = [];
    if (parsed.recommendedIds && parsed.recommendedIds.length > 0) {
      const ids = parsed.recommendedIds.filter((id: string) => {
          try { return new ObjectId(id); } catch { return false; }
      }).map((id: string) => new ObjectId(id));
      
      recommendedProducts = await db.collection('products').aggregate([
        { $match: { _id: { $in: ids } } },
        {
          $lookup: {
            from: 'users',
            localField: 'sellerId',
            foreignField: '_id',
            as: 'seller',
          },
        },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
        { $project: { 'seller.password': 0 } }
      ]).toArray();
    }

    return NextResponse.json({
      reply: parsed.message,
      products: recommendedProducts
    });

  } catch (error) {
    console.error('AI buyer chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
