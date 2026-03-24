import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';

    // Save directly to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection('whatsapp_images').insertOne({
      filename: file.name,
      mimeType: mimeType,
      size: buffer.length,
      base64Data: base64Data,
      createdAt: new Date()
    });

    // Provide a URL that will serve this exact image
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || '';
    const url = `${origin}/api/whatsapp/image/${result.insertedId}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('WhatsApp MongoDB upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error?.message || 'Unknown database error' },
      { status: 500 },
    );
  }
}
 
