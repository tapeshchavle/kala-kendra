import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getUserFromHeaders } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromHeaders(request.headers);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = file.name.split('.').pop();
    const filename = `products/${uniqueSuffix}.${extension}`;
    
    // Uploads directly to Vercel Blob Storage, returns public CDN URL
    const blob = await put(filename, file, { 
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN, // Injected by Vercel
    });
    
    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Vercel Blob Upload failed', 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}
