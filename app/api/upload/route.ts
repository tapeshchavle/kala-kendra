import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile } from 'fs/promises';
import { join } from 'path';
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
    const filename = `${uniqueSuffix}.${extension}`;

    // Hybrid Upload Strategy:
    // If BLOB_READ_WRITE_TOKEN exists (Vercel Prod), use Blob Storage.
    // Otherwise (Local Dev), fallback to local filesystem for better DX.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`products/${filename}`, file, { 
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url });
    } else {
      // Local development fallback
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const path = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(path, buffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}
