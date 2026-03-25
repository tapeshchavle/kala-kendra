import { NextResponse } from 'next/server';
import { generateProductDescription } from '@/lib/kimi';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, category, craftType, videoUrl, language } = body;

    if (!productName || !category || !craftType) {
      return NextResponse.json(
        { error: 'Product name, category, and craft type are required' },
        { status: 400 }
      );
    }

    const result = await generateProductDescription(productName, category, craftType, videoUrl, language || 'en');


    return NextResponse.json(result);
  } catch (error) {
    console.error('AI describe error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate description' },
      { status: 500 }
    );
  }
}
