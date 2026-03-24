import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id.length !== 24) {
      return new NextResponse('Invalid Image ID', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const objectId = new ObjectId(id);
    const image = await db.collection('whatsapp_images').findOne({ _id: objectId });
    
    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const buffer = Buffer.from(image.base64Data, 'base64');
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': image.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Fetch image error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
